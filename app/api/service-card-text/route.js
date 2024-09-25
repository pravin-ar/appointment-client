// app/api/service-card-text/route.js
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
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${fileName}`,
        Body: file,
        ContentType: "image/jpeg" // Adjust Content-Type as needed
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
}

// GET method to fetch all service cards with their image URLs, status, and info
export async function GET() {
    const connection = await createConnection();
    try {
        console.log('Fetching all service card data with images, status, and info...');
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
        console.log('Fetched Service Data:', results);

        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching service card text:', error);
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

        console.log('Received data for new service:', { name, description, status, info });

        if (!name || !description || !file) {
            console.warn('Missing required fields:', { name, description, file });
            return new Response(JSON.stringify({ error: 'Name, Description, and Image file are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Format the date as `YYYY-MM-DD`
        const createAt = new Date().toISOString().split('T')[0];
        console.log(`Inserting into kr_dev.services with name: ${name}, description: ${description}, status: ${status}, create_at: ${createAt}`);

        const [serviceResult] = await connection.execute(
            'INSERT INTO kr_dev.services (name, description, status, create_at) VALUES (?, ?, ?, ?)',
            [name, description, status, createAt]
        );

        const serviceId = serviceResult.insertId;
        console.log('Service inserted with ID:', serviceId);

        // Read file content for upload
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Set up S3 upload parameters
        const imageName = `services/${serviceId}-${Date.now()}.jpg`; // Adjust the extension as needed
        await uploadFileToS3(fileBuffer, imageName);
        const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
        console.log('Image uploaded to S3 at URL:', imageUrl);

        // Store image URL in the images table
        const [imageResult] = await connection.execute(
            'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
            ["service", serviceId, imageUrl, createAt]
        );

        console.log('Image record inserted into kr_dev.images with ID:', imageResult.insertId);

        // Store info in the text_data table
        if (info) {
            const [textDataResult] = await connection.execute(
                'INSERT INTO kr_dev.text_data (category, category_id, info, create_at) VALUES (?, ?, ?, ?)',
                ["service", serviceId, info, createAt]
            );
            console.log('Info record inserted into kr_dev.text_data with ID:', textDataResult.insertId);
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Service and image added successfully', serviceId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding new service and image:', error);
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

        console.log('Received data for updating service:', { id, name, description, status, info, file });

        if (!id || !name || !description) {
            console.warn('Missing required fields:', { id, name, description });
            return new Response(JSON.stringify({ error: 'ID, Name, and Description are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Format the date as `YYYY-MM-DD`
        const updateAt = new Date().toISOString().split('T')[0];

        // Update service details
        console.log(`Updating kr_dev.services with name: ${name}, description: ${description}, status: ${status}, update_at: ${updateAt}, id: ${id}`);
        const [serviceUpdateResult] = await connection.execute(
            'UPDATE kr_dev.services SET name = ?, description = ?, status = ?, update_at = ? WHERE id = ?',
            [name, description, status, updateAt, id]
        );

        console.log('Service update result:', serviceUpdateResult);

        if (serviceUpdateResult.affectedRows === 0) {
            console.warn(`No service found with ID: ${id}`);
            return new Response(JSON.stringify({ error: 'No service found with provided ID' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check for existing image URL
        let imageUrl = null;
        const [existingImage] = await connection.execute(
            'SELECT path FROM kr_dev.images WHERE category = ? AND category_id = ?',
            ["service", id]
        );

        if (existingImage.length > 0) {
            imageUrl = existingImage[0].path; // Use existing image URL if available
            console.log('Existing image URL:', imageUrl);
        } else {
            console.log('No existing image found for service ID:', id);
        }

        // If a new file is provided, update the image URL
        if (file) {
            // Read file content for upload
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            // Set up S3 upload parameters for the updated image
            const imageName = `services/${id}-${Date.now()}.jpg`; // Adjust the extension as needed
            await uploadFileToS3(fileBuffer, imageName);
            imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
            console.log('Updated image uploaded to S3 at URL:', imageUrl);

            // Update or insert image URL in the images table
            if (existingImage.length > 0) {
                // Update existing image record
                console.log(`Updating kr_dev.images with path: ${imageUrl}, update_at: ${updateAt} for service id: ${id}`);
                const [imageUpdateResult] = await connection.execute(
                    'UPDATE kr_dev.images SET path = ?, update_at = ? WHERE category = ? AND category_id = ?',
                    [imageUrl, updateAt, "service", id]
                );
                console.log('Image update result:', imageUpdateResult);
            } else {
                // Insert new image record if not existing
                console.log(`Inserting new image entry for service ID: ${id}.`);
                const [newImageResult] = await connection.execute(
                    'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                    ["service", id, imageUrl, updateAt]
                );
                console.log('New image record inserted into kr_dev.images with ID:', newImageResult.insertId);
            }
        } else {
            console.log('No new image file provided, keeping the old image.');
        }

        // Update or insert info in the text_data table
        const [existingTextData] = await connection.execute(
            'SELECT info FROM kr_dev.text_data WHERE category = ? AND category_id = ?',
            ["service", id]
        );

        if (existingTextData.length > 0) {
            // Update existing info record
            console.log(`Updating kr_dev.text_data with info: ${info}, update_at: ${updateAt} for service id: ${id}`);
            const [textDataUpdateResult] = await connection.execute(
                'UPDATE kr_dev.text_data SET info = ?, update_at = ? WHERE category = ? AND category_id = ?',
                [info, updateAt, "service", id]
            );
            console.log('Info update result:', textDataUpdateResult);
        } else if (info) {
            // Insert new info record if not existing and info is provided
            console.log(`Inserting new info entry for service ID: ${id}.`);
            const [newTextDataResult] = await connection.execute(
                'INSERT INTO kr_dev.text_data (category, category_id, info, create_at) VALUES (?, ?, ?, ?)',
                ["service", id, info, updateAt]
            );
            console.log('New info record inserted into kr_dev.text_data with ID:', newTextDataResult.insertId);
        } else {
            console.log('No new info provided, keeping the old info or null.');
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Service and image updated successfully', imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating service and image:', error);
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
