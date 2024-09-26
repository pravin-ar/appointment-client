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
                p.price, /* Added price field */
                p.type, /* Added type field */
                p.status,
                p.create_at, 
                p.update_at, 
                i.path AS image_url 
            FROM 
                kr_dev.products p 
            LEFT JOIN 
                kr_dev.images i 
            ON 
                p.id = i.category_id 
            AND 
                i.category = 'product'
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

// POST method to add a new product and store image URL
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price"); // Get price from form data
        const type = formData.get("type"); // Get type from form data
        const status = formData.get("status"); // Get status from form data
        const file = formData.get("file");

        console.log('Received data for new product:', { name, description, price, type, status });

        if (!name || !description || !price || !type || !status) {
            console.warn('Missing required fields:', { name, description, price, type, status });
            return new Response(JSON.stringify({ error: 'Name, Description, Price, Type, and Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Format the date as `YYYY-MM-DD`
        const createAt = new Date().toISOString().split('T')[0];
        console.log(`Inserting into kr_dev.products with name: ${name}, description: ${description}, price: ${price}, type: ${type}, status: ${status}, create_at: ${createAt}`);

        const [productResult] = await connection.execute(
            'INSERT INTO kr_dev.products (name, description, price, type, status, create_at) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, type, status, createAt]
        );

        const productId = productResult.insertId;
        console.log('Product inserted with ID:', productId);

        let imageUrl = null;

        if (file) {
            // Read file content for upload
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            // Set up S3 upload parameters
            const imageName = `products/${productId}-${Date.now()}.jpg`; // Adjust the extension as needed
            await uploadFileToS3(fileBuffer, imageName);
            imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
            console.log('Image uploaded to S3 at URL:', imageUrl);

            // Store image URL in the images table
            const [imageResult] = await connection.execute(
                'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                ["product", productId, imageUrl, createAt]
            );

            console.log('Image record inserted into kr_dev.images with ID:', imageResult.insertId);
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product and image added successfully', productId, imageUrl }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding new product and image:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add product and image' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update an existing product and its image URL
export async function PUT(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price"); // Get price from form data
        const type = formData.get("type"); // Get type from form data
        const status = formData.get("status"); // Get status from form data
        const file = formData.get("file");

        console.log('Received data for updating product:', { id, name, description, price, type, status });

        if (!id || !name || !description || !price || !type || !status) {
            console.warn('Missing required fields:', { id, name, description, price, type, status });
            return new Response(JSON.stringify({ error: 'ID, Name, Description, Price, Type, and Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Format the date as `YYYY-MM-DD`
        const updateAt = new Date().toISOString().split('T')[0];

        // Update product details
        console.log(`Updating kr_dev.products with name: ${name}, description: ${description}, price: ${price}, type: ${type}, status: ${status}, update_at: ${updateAt}, id: ${id}`);
        const [productUpdateResult] = await connection.execute(
            'UPDATE kr_dev.products SET name = ?, description = ?, price = ?, type = ?, status = ?, update_at = ? WHERE id = ?',
            [name, description, price, type, status, updateAt, id]
        );

        console.log('Product update result:', productUpdateResult);

        if (productUpdateResult.affectedRows === 0) {
            console.warn(`No product found with ID: ${id}`);
            return new Response(JSON.stringify({ error: 'No product found with provided ID' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check for existing image URL
        let imageUrl = null;
        const [existingImage] = await connection.execute(
            'SELECT path FROM kr_dev.images WHERE category = ? AND category_id = ?',
            ["product", id]
        );

        if (existingImage.length > 0) {
            imageUrl = existingImage[0].path; // Use existing image URL if available
            console.log('Existing image URL:', imageUrl);
        } else {
            console.log('No existing image found for product ID:', id);
        }

        // If a new file is provided, update the image URL
        if (file) {
            // Read file content for upload
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            // Set up S3 upload parameters for the updated image
            const imageName = `products/${id}-${Date.now()}.jpg`; // Adjust the extension as needed
            await uploadFileToS3(fileBuffer, imageName);
            imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
            console.log('Updated image uploaded to S3 at URL:', imageUrl);

            // Update or insert image URL in the images table
            if (existingImage.length > 0) {
                // Update existing image record
                console.log(`Updating kr_dev.images with path: ${imageUrl}, update_at: ${updateAt} for product id: ${id}`);
                const [imageUpdateResult] = await connection.execute(
                    'UPDATE kr_dev.images SET path = ?, update_at = ? WHERE category = ? AND category_id = ?',
                    [imageUrl, updateAt, "product", id]
                );
                console.log('Image update result:', imageUpdateResult);
            } else {
                // Insert new image record if not existing
                console.log(`Inserting new image entry for product ID: ${id}.`);
                const [newImageResult] = await connection.execute(
                    'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                    ["product", id, imageUrl, updateAt]
                );
                console.log('New image record inserted into kr_dev.images with ID:', newImageResult.insertId);
            }
        } else {
            console.log('No new image file provided, keeping the old image.');
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product and image updated successfully', imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating product and image:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update product and image' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// DELETE method to remove a product by ID
export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: 'Product ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const connection = await createConnection();
    try {
        console.log(`Deleting product with ID: ${id}`);

        const [result] = await connection.execute('DELETE FROM kr_dev.products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            console.warn(`No product found with ID: ${id}`);
            return new Response(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Remove associated image entry
        await connection.execute('DELETE FROM kr_dev.images WHERE category = ? AND category_id = ?', ["product", id]);
        console.log('Product and associated image deleted successfully.');

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to delete product' }), {
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
