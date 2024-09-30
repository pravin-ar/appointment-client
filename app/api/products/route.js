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

// Updated GET method to fetch products with image sequence and tags
export async function GET() {
    const connection = await createConnection();
    try {
        console.log('Fetching all product data with images and tags...');
        const [results] = await connection.execute(`
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price,
                p.type,
                p.status,
                p.tags,
                p.create_at, 
                p.update_at, 
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT('path', i.path, 'sequence', i.sequence)
                    )
                    FROM kr_dev.images i
                    WHERE i.category_id = p.id 
                    AND i.category = 'product'
                    ORDER BY i.sequence ASC
                ) AS image_urls
            FROM 
                kr_dev.products p 
            GROUP BY 
                p.id;
        `);

        // Log each product with its image URLs and tags properly formatted
        results.forEach(product => {
            console.log('Product:', product); // Log each product to verify the structure
        });

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

// POST method to add a product with tags
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const type = formData.get("type");
        const status = formData.get("status");
        const tags = formData.get("tags"); // Get tags as a plain comma-separated string

        if (!name || !description || !price || !type || !status) {
            return new Response(JSON.stringify({ error: 'Name, Description, Price, Type, and Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date().toISOString().split('T')[0];
        const [productResult] = await connection.execute(
            'INSERT INTO kr_dev.products (name, description, price, type, status, tags, create_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, type, status, tags, createAt] // Store tags as plain string
        );

        const productId = productResult.insertId;
        const imageFiles = [];

        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file')) {
                imageFiles.push(value);
            }
        }

        const imageUrls = [];
        for (const [index, file] of imageFiles.entries()) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const imageName = `products/${productId}-${index}-${Date.now()}.jpg`;
            await uploadFileToS3(fileBuffer, imageName);
            const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
            imageUrls.push(imageUrl);

            await connection.execute(
                'INSERT INTO kr_dev.images (category, category_id, path, sequence, create_at) VALUES (?, ?, ?, ?, ?)',
                ["product", productId, imageUrl, index + 1, createAt]
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

// PUT method to update product with tags
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
        const tags = formData.get("tags"); // Get tags as plain string

        if (!id || !name || !description || !price || !type || !status) {
            return new Response(JSON.stringify({ error: 'ID, Name, Description, Price, Type, and Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateAt = new Date().toISOString().split('T')[0];

        // Update product details
        const [productUpdateResult] = await connection.execute(
            'UPDATE kr_dev.products SET name = ?, description = ?, price = ?, type = ?, status = ?, tags = ?, update_at = ? WHERE id = ?',
            [name, description, price, type, status, tags, updateAt, id] // Update tags as plain string
        );

        if (productUpdateResult.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'No product found with provided ID' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const imageFiles = [];
        const existingImageIds = [];

        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file')) {
                imageFiles.push(value);
            }
            if (key.startsWith('image_id')) {
                existingImageIds.push(value);
            }
        }

        if (imageFiles.length > 0) {
            const imageUrls = [];
            for (const [index, file] of imageFiles.entries()) {
                if (file && existingImageIds[index]) {
                    const fileBuffer = Buffer.from(await file.arrayBuffer());
                    const imageName = `products/${id}-${index}-${Date.now()}.jpg`;
                    await uploadFileToS3(fileBuffer, imageName);
                    const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
                    imageUrls.push(imageUrl);

                    await connection.execute(
                        'UPDATE kr_dev.images SET path = ?, update_at = ? WHERE id = ?',
                        [imageUrl, updateAt, existingImageIds[index]]
                    );
                }
            }
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
