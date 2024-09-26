// app/api/service-card-text/route.js
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, AWS_BUCKET_NAME } = process.env;

// Utility function to create a connection
async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        connectTimeout: 10000 // 10 seconds timeout
    });
}

// S3 client configuration for file uploads
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
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${fileName}`,
        Body: file,
        ContentType: "image/jpeg" // Adjust content type based on file
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
}

// GET method to fetch all service cards with their image URLs, status, and info
export async function GET() {
    const connection = await createConnection();
    try {
        const [results] = await connection.execute(`
            SELECT 
                s.id, 
                s.name, 
                s.description, 
                s.create_at, 
                s.update_at, 
                i.path AS image_url,
                s.status,
                t.info
            FROM 
                kr_dev.services s 
            LEFT JOIN 
                kr_dev.images i 
            ON 
                s.id = i.category_id 
            AND 
                i.category = 'service'
            LEFT JOIN
                kr_dev.text_data t
            ON
                s.id = t.category_id 
            AND
                t.category = 'service'
        `);

        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch service card text' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new service card and store image URL, status, and info
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const file = formData.get("file");
        const status = formData.get("status") || 'Y';
        const info = formData.get("info");

        if (!name || !description || !file) {
            return new Response(JSON.stringify({ error: 'Name, Description, and Image file are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date().toISOString().split('T')[0];

        const [serviceResult] = await connection.execute(
            'INSERT INTO kr_dev.services (name, description, status, create_at) VALUES (?, ?, ?, ?)',
            [name, description, status, createAt]
        );

        const serviceId = serviceResult.insertId;

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const imageName = `services/${serviceId}-${Date.now()}.jpg`; // Adjust the extension as needed
        await uploadFileToS3(fileBuffer, imageName);
        const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

        await connection.execute(
            'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
            ["service", serviceId, imageUrl, createAt]
        );

        if (info) {
            await connection.execute(
                'INSERT INTO kr_dev.text_data (category, category_id, info, create_at) VALUES (?, ?, ?, ?)',
                ["service", serviceId, info, createAt]
            );
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Service and image added successfully', serviceId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add service and image' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update an existing service card, its image URL, status, and info
export async function PUT(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const file = formData.get("file");
        const status = formData.get("status");
        const info = formData.get("info");

        if (!id || !name || !description) {
            return new Response(JSON.stringify({ error: 'ID, Name, and Description are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateAt = new Date().toISOString().split('T')[0];

        const [serviceUpdateResult] = await connection.execute(
            'UPDATE kr_dev.services SET name = ?, description = ?, status = ?, update_at = ? WHERE id = ?',
            [name, description, status, updateAt, id]
        );

        if (serviceUpdateResult.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'No service found with provided ID' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let imageUrl = null;
        const [existingImage] = await connection.execute(
            'SELECT path FROM kr_dev.images WHERE category = ? AND category_id = ?',
            ["service", id]
        );

        if (existingImage.length > 0) {
            imageUrl = existingImage[0].path;
        }

        if (file) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const imageName = `services/${id}-${Date.now()}.jpg`;
            await uploadFileToS3(fileBuffer, imageName);
            imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

            if (existingImage.length > 0) {
                await connection.execute(
                    'UPDATE kr_dev.images SET path = ?, update_at = ? WHERE category = ? AND category_id = ?',
                    [imageUrl, updateAt, "service", id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                    ["service", id, imageUrl, updateAt]
                );
            }
        }

        const [existingTextData] = await connection.execute(
            'SELECT info FROM kr_dev.text_data WHERE category = ? AND category_id = ?',
            ["service", id]
        );

        if (existingTextData.length > 0) {
            await connection.execute(
                'UPDATE kr_dev.text_data SET info = ?, update_at = ? WHERE category = ? AND category_id = ?',
                [info, updateAt, "service", id]
            );
        } else if (info) {
            await connection.execute(
                'INSERT INTO kr_dev.text_data (category, category_id, info, create_at) VALUES (?, ?, ?, ?)',
                ["service", id, info, updateAt]
            );
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Service and image updated successfully', imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update service and image' }), {
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
