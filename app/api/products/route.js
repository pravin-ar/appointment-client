import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mysql from 'mysql2/promise';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, AWS_BUCKET_NAME } = process.env;

// Utility function to create a connection
async function createConnection() {
    console.log(`Creating connection to the database: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        connectTimeout: 10000 // 10 seconds timeout
    });
}

// Create S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to upload a file to S3
async function uploadFileToS3(file, fileName) {
    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: `${fileName}`,
        Body: file,
        ContentType: "image/jpeg" // Adjust Content-Type as needed
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
}

// GET method to fetch all product cards with their image URLs
export async function GET() {
    const connection = await createConnection();
    try {
        console.log('Fetching all product data with images...');
        const [results] = await connection.execute(`
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price,
                p.type,
                p.status,
                p.create_at, 
                p.update_at, 
                JSON_ARRAYAGG(i.path) AS image_urls
            FROM 
                kr_dev.products p 
            LEFT JOIN 
                kr_dev.images i 
            ON 
                p.id = i.category_id 
            AND 
                i.category = 'product'
            GROUP BY 
                p.id
        `);
        console.log('Fetched Product Data:', results);

        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching product data:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch product data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new product and store multiple image URLs
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const type = formData.get("type");
        const status = formData.get("status");

        if (!name || !description || !price || !type || !status) {
            console.warn('Missing required fields:', { name, description, price, type, status });
            return new Response(JSON.stringify({ error: 'Name, Description, Price, Type, and Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date().toISOString().split('T')[0];
        const [productResult] = await connection.execute(
            'INSERT INTO kr_dev.products (name, description, price, type, status, create_at) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, type, status, createAt]
        );

        const productId = productResult.insertId;
        const imageFiles = [];

        // Collect all file entries from formData
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file')) {
                imageFiles.push(value);
            }
        }

        const imageUrls = [];

        // Upload each image and store its URL in the images table
        for (const [index, file] of imageFiles.entries()) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const imageName = `products/${productId}-${index}-${Date.now()}.jpg`;
            await uploadFileToS3(fileBuffer, imageName);
            const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
            imageUrls.push(imageUrl);

            // Insert image URL into the database
            await connection.execute(
                'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                ["product", productId, imageUrl, createAt]
            );
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product and images added successfully', productId, imageUrls }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding new product and images:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add product and images' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update an existing product and its image URLs
export async function PUT(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const type = formData.get("type");
        const status = formData.get("status");

        if (!id || !name || !description || !price || !type || !status) {
            console.warn('Missing required fields:', { id, name, description, price, type, status });
            return new Response(JSON.stringify({ error: 'ID, Name, Description, Price, Type, and Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateAt = new Date().toISOString().split('T')[0];

        // Update product details
        const [productUpdateResult] = await connection.execute(
            'UPDATE kr_dev.products SET name = ?, description = ?, price = ?, type = ?, status = ?, update_at = ? WHERE id = ?',
            [name, description, price, type, status, updateAt, id]
        );

        if (productUpdateResult.affectedRows === 0) {
            console.warn(`No product found with ID: ${id}`);
            return new Response(JSON.stringify({ error: 'No product found with provided ID' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Remove existing images if there are new images uploaded
        const imageFiles = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file')) {
                imageFiles.push(value);
            }
        }

        // If new files are uploaded, remove the old ones from the database
        if (imageFiles.length > 0) {
            console.log('Removing old images for product ID:', id);
            await connection.execute('DELETE FROM kr_dev.images WHERE category = ? AND category_id = ?', ["product", id]);

            // Upload each new image and store its URL in the images table
            const imageUrls = [];
            for (const [index, file] of imageFiles.entries()) {
                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const imageName = `products/${id}-${index}-${Date.now()}.jpg`;
                await uploadFileToS3(fileBuffer, imageName);
                const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
                imageUrls.push(imageUrl);

                // Insert new image URLs into the database
                await connection.execute(
                    'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                    ["product", id, imageUrl, updateAt]
                );
            }
            console.log('Updated images for product ID:', id);
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product and images updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating product and images:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update product and images' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const config = {
    api: {
        bodyParser: false, // Disable Next.js default body parsing for FormData
    },
};
