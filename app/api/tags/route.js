import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mysql from 'mysql2/promise';

// Load environment variables for database connection and S3
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, AWS_BUCKET_NAME } = process.env;

// Utility function to create a connection
async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
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

// GET method to fetch categories (frames, sizes, or offers)
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category'); // Get the category query param

    console.log('GET request for category:', category);

    if (!category) {
        return new Response(JSON.stringify({ error: 'Category is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const connection = await createConnection();
    try {
        let results;
        if (category === 'offer-tags') {
            // Fetch from offer_tag table
            const [offerTags] = await connection.execute(
                'SELECT id, name, image_url FROM offer_tag'
            );
            results = offerTags;
        } else {
            // Fetch from text_data table
            const [textData] = await connection.execute(
                `SELECT id, info FROM text_data WHERE category = ?`,
                [category]
            );
            results = textData;
        }

        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new frame, size, or offer
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const category = formData.get('category');

        console.log('POST request for category:', category);

        if (!category) {
            return new Response(JSON.stringify({ error: 'Category is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (category === 'offer-tags') {
            // Handle offer tags
            const name = formData.get('name');
            const imageFile = formData.get('image');

            console.log('Offer tag name:', name);
            console.log('Offer tag image:', imageFile);

            if (!name) {
                return new Response(JSON.stringify({ error: 'Offer tag name is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Upload image if provided
            let imageUrl = null;
            if (imageFile) {
                const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
                const fileName = `offer_tags/${Date.now()}-${imageFile.name}`;
                await uploadFileToS3(fileBuffer, fileName);
                imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
            }

            // Insert into offer_tag table
            const [insertResult] = await connection.execute(
                'INSERT INTO offer_tag (name, image_url) VALUES (?, ?)',
                [name, imageUrl]
            );

            await connection.end();
            return new Response(JSON.stringify({ message: 'Offer tag added successfully', id: insertResult.insertId }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });

        } else {
            // Handle frames and sizes
            const info = formData.get('info');

            console.log('Info:', info);

            if (!info) {
                return new Response(JSON.stringify({ error: 'Info is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const [insertResult] = await connection.execute(
                'INSERT INTO text_data (info, category) VALUES (?, ?)',
                [info, category]
            );

            await connection.end();
            return new Response(JSON.stringify({ message: 'Category added successfully', id: insertResult.insertId }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error('Error adding category:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add category' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update a frame, size, or offer
export async function PUT(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id') || formData.get('id');
        const category = formData.get('category');

        console.log('PUT request for category:', category, 'ID:', id);

        if (!id || !category) {
            return new Response(JSON.stringify({ error: 'ID and category are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (category === 'offer-tags') {
            // Handle offer tags
            const name = formData.get('name');
            const imageFile = formData.get('image');

            console.log('Offer tag name:', name);
            console.log('Offer tag image:', imageFile);

            if (!name) {
                return new Response(JSON.stringify({ error: 'Offer tag name is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Update image if provided
            let imageUrl = null;
            if (imageFile) {
                const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
                const fileName = `offer_tags/${Date.now()}-${imageFile.name}`;
                await uploadFileToS3(fileBuffer, fileName);
                imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
            }

            // Update offer_tag table
            let query, params;
            if (imageUrl) {
                query = 'UPDATE offer_tag SET name = ?, image_url = ? WHERE id = ?';
                params = [name, imageUrl, id];
            } else {
                query = 'UPDATE offer_tag SET name = ? WHERE id = ?';
                params = [name, id];
            }

            const [updateResult] = await connection.execute(query, params);

            await connection.end();
            return new Response(JSON.stringify({ message: 'Offer tag updated successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        } else {
            // Handle frames and sizes
            const info = formData.get('info');

            console.log('Info:', info);

            if (!info) {
                return new Response(JSON.stringify({ error: 'Info is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const [updateResult] = await connection.execute(
                'UPDATE text_data SET info = ?, category = ? WHERE id = ?',
                [info, category, id]
            );

            await connection.end();
            return new Response(JSON.stringify({ message: 'Category updated successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update category' }), {
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
