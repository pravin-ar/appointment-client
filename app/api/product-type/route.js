import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, AWS_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

// Utility function to create a connection
async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        connectTimeout: 10000
    });
}

// Create S3 client for image uploads
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

// Function to upload image to S3
async function uploadImageToS3(file, fileName) {
    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: fileName,
        Body: file,
        ContentType: file.type // Use the file's MIME type
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
}

// GET Method - Fetch all product types with images
export async function GET() {
    const connection = await createConnection();
    try {
        const [results] = await connection.execute(`
            SELECT 
                pt.id, 
                pt.type, 
                (SELECT path FROM images WHERE category = 'product-type' AND category_id = pt.id LIMIT 1) AS image_url,
                pt.create_at,
                pt.update_at
            FROM product_types pt
        `);
        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch product types' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST Method - Add new product type with image and store create_at
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const type = formData.get('type');
        const imageFile = formData.get('image');

        // Validation: Check if type and image are provided
        if (!type || !imageFile) {
            return new Response(JSON.stringify({ error: 'Type and image are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date();

        // Insert new product type into the database with create_at
        const [result] = await connection.execute(
            'INSERT INTO product_types (type, create_at) VALUES (?, ?)', 
            [type, createAt]
        );
        const productTypeId = result.insertId;

        // Upload image to S3 and save its path in the images table
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `product-types/${productTypeId}-${Date.now()}.jpg`;
        const imageUrl = await uploadImageToS3(fileBuffer, fileName);

        // Insert image path into the images table
        await connection.execute(
            'INSERT INTO images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
            ['product-type', productTypeId, imageUrl, createAt]
        );

        await connection.end();
        return new Response(JSON.stringify({ id: productTypeId, type }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding product type and image:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add product type' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT Method - Update existing product type and optionally update image, store update_at
export async function PUT(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const id = new URL(req.url).searchParams.get('id');
        const type = formData.get('type');
        const imageFile = formData.get('image');

        // Validation: Check if type is provided
        if (!type || !id) {
            return new Response(JSON.stringify({ error: 'ID and type are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateAt = new Date();

        // Update the product type name in the database with update_at
        await connection.execute(
            'UPDATE product_types SET type = ?, update_at = ? WHERE id = ?', 
            [type, updateAt, id]
        );

        // If a new image file is provided, update the image
        if (imageFile) {
            const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
            const fileName = `product-types/${id}-${Date.now()}.jpg`;
            const imageUrl = await uploadImageToS3(fileBuffer, fileName);

            // Check if there's an existing image for this type and update it
            const [existingImage] = await connection.execute(
                'SELECT id FROM images WHERE category = ? AND category_id = ?', 
                ['product-type', id]
            );
            if (existingImage.length > 0) {
                await connection.execute(
                    'UPDATE images SET path = ?, update_at = ? WHERE id = ?', 
                    [imageUrl, updateAt, existingImage[0].id]
                );
            } else {
                // If no existing image, insert a new one
                await connection.execute(
                    'INSERT INTO images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                    ['product-type', id, imageUrl, updateAt]
                );
            }
        }

        await connection.end();
        return new Response(JSON.stringify({ id, type }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating product type and image:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update product type' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
