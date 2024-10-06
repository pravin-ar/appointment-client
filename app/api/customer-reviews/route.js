// app/api/customer-reviews/route.js
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, AWS_BUCKET_NAME } = process.env;

// Utility function to create a connection
async function createConnection() {
    try {
        return await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            port: DB_PORT,
            connectTimeout: 10000 // 10 seconds timeout
        });
    } catch (error) {
        console.error("Database connection error:", error);
        throw new Error('Failed to connect to database');
    }
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
    try {
        const params = {
            Bucket: AWS_BUCKET_NAME,
            Key: `${fileName}`,
            Body: file,
            ContentType: "image/jpeg" // Adjust content type based on file
        };
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return fileName;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error('Failed to upload file to S3');
    }
}

// GET method to fetch customer reviews with their image URLs
export async function GET() {
    const connection = await createConnection();
    try {
        console.log("Fetching customer reviews...");

        const [results] = await connection.execute(`
            SELECT 
                cr.id, 
                cr.name, 
                cr.description, 
                cr.star, 
                cr.create_at, 
                cr.update_at, 
                i.path AS image_url
            FROM 
                kr_dev.customer_review cr 
            LEFT JOIN 
                kr_dev.images i 
            ON 
                cr.id = i.category_id 
            AND 
                i.category = 'customer_image'
            ORDER BY cr.create_at ASC
            LIMIT 3
        `);

        console.log("Customer reviews fetched:", results);

        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching customer reviews:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch customer reviews' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new customer review
export async function POST(req) {
    const connection = await createConnection();
    try {
        console.log("Receiving new customer review data...");

        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const file = formData.get("file");
        const star = formData.get("star");

        console.log("Parsed formData:", { name, description, star });

        if (!name || !description || !file || !star) {
            return new Response(JSON.stringify({ error: 'Name, Description, Stars, and Image file are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if we already have 3 reviews
        const [reviewCountResult] = await connection.execute('SELECT COUNT(*) as count FROM kr_dev.customer_review');
        const reviewCount = reviewCountResult[0].count;
        if (reviewCount >= 3) {
            return new Response(JSON.stringify({ error: 'Maximum number of reviews reached' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date();

        // Insert review into customer_review table
        const [reviewResult] = await connection.execute(
            'INSERT INTO kr_dev.customer_review (name, description, star, create_at) VALUES (?, ?, ?, ?)',
            [name, description, star, createAt]
        );

        const reviewId = reviewResult.insertId;
        console.log('Review inserted with ID:', reviewId);

        // Upload the image to S3
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const imageName = `customer_reviews/${reviewId}-${Date.now()}.jpg`; 
        await uploadFileToS3(fileBuffer, imageName);
        const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

        // Insert image URL into images table
        await connection.execute(
            'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
            ["customer_image", reviewId, imageUrl, createAt]
        );
        console.log("Image uploaded and saved in DB:", imageUrl);

        await connection.end();

        return new Response(JSON.stringify({ message: 'Customer review added successfully', reviewId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding customer review:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add customer review' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update an existing customer review
export async function PUT(req) {
    const connection = await createConnection();
    try {
        console.log("Receiving update request for customer review...");

        const formData = await req.formData();
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const file = formData.get("file");
        const star = formData.get("star");

        console.log("Parsed formData for update:", { id, name, description, star });

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateAt = new Date();

        // Build update query dynamically
        const fields = [];
        const values = [];

        if (name) {
            fields.push('name = ?');
            values.push(name);
        }
        if (description) {
            fields.push('description = ?');
            values.push(description);
        }
        if (star) {
            fields.push('star = ?');
            values.push(star);
        }

        fields.push('update_at = ?');
        values.push(updateAt);

        values.push(id);

        if (fields.length > 1) { // At least one field to update
            const updateQuery = `UPDATE kr_dev.customer_review SET ${fields.join(', ')} WHERE id = ?`;
            const [reviewUpdateResult] = await connection.execute(updateQuery, values);

            if (reviewUpdateResult.affectedRows === 0) {
                return new Response(JSON.stringify({ error: 'No review found with provided ID' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        let imageUrl = null;

        if (file) {
            // Upload new image
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const imageName = `customer_reviews/${id}-${Date.now()}.jpg`;
            await uploadFileToS3(fileBuffer, imageName);
            imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

            // Update or insert image in images table
            const [existingImage] = await connection.execute(
                'SELECT path FROM kr_dev.images WHERE category = ? AND category_id = ?',
                ["customer_image", id]
            );

            if (existingImage.length > 0) {
                await connection.execute(
                    'UPDATE kr_dev.images SET path = ?, update_at = ? WHERE category = ? AND category_id = ?',
                    [imageUrl, updateAt, "customer_image", id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                    ["customer_image", id, imageUrl, updateAt]
                );
            }
            console.log("Image uploaded and updated in DB:", imageUrl);
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Customer review updated successfully', imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating customer review:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update customer review' }), {
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
