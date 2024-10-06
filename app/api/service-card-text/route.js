// app/api/service-card-text/route.js
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

// GET method to fetch all service cards with their image URLs, icons, status, offer_tag, and meta data
export async function GET() {
    const connection = await createConnection();
    try {
        console.log("Fetching service data...");

        const [results] = await connection.execute(`
            SELECT 
                s.id, 
                s.name, 
                s.description, 
                s.create_at, 
                s.update_at, 
                s.offer_tag, /* Include offer_tag ID */
                i.path AS image_url,
                ic.path AS icon_url,
                s.status,
                t.info,
                (
                    SELECT JSON_OBJECT('title', m.title, 'description', m.description, 'keyword', m.keyword)
                    FROM kr_dev.meta_data m
                    WHERE m.category_id = s.id
                    AND m.category = 'service_meta_data'
                ) AS meta_data,
                od.info AS offer_info /* Include offer_info */
            FROM 
                kr_dev.services s 
            LEFT JOIN 
                kr_dev.images i 
            ON 
                s.id = i.category_id 
            AND 
                i.category = 'service'
            LEFT JOIN
                kr_dev.images ic
            ON
                s.id = ic.category_id
            AND
                ic.category = 'service_icon'
            LEFT JOIN
                kr_dev.text_data t
            ON
                s.id = t.category_id 
            AND
                t.category = 'service'
            LEFT JOIN
                kr_dev.text_data od
            ON
                s.offer_tag = od.id
            AND
                od.category = 'offer-tags'
        `);

        console.log("Service data fetched:", results);

        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching service data:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch service card text' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new service card and store image URL, icon URL, status, info, offer_tag, and meta data (meta tags)
export async function POST(req) {
    const connection = await createConnection();
    try {
        console.log("Receiving new service data...");

        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const file = formData.get("file");
        const icon = formData.get("icon");
        const status = formData.get("status") || 'Y';
        const info = formData.get("info");

        // Meta data fields
        const metaTitle = formData.get("meta_title");
        const metaDescription = formData.get("meta_description");
        const metaKeywords = formData.get("meta_keywords");

        // Offer tag
        const offerTag = formData.get("offer_tag"); // Get offer tag

        console.log("Parsed formData:", { name, description, status, metaTitle, metaDescription, metaKeywords, offerTag });

        if (!name || !description || !file) {
            return new Response(JSON.stringify({ error: 'Name, Description, and Image file are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date().toISOString().split('T')[0];

        // Insert service details into services table
        const [serviceResult] = await connection.execute(
            'INSERT INTO kr_dev.services (name, description, status, offer_tag, create_at) VALUES (?, ?, ?, ?, ?)',
            [name, description, status, offerTag || null, createAt]
        );

        const serviceId = serviceResult.insertId;
        console.log('Service inserted with ID:', serviceId);

        // Upload the image to S3
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const imageName = `services/${serviceId}-${Date.now()}.jpg`; 
        await uploadFileToS3(fileBuffer, imageName);
        const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

        // Insert image URL into images table
        await connection.execute(
            'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
            ["service", serviceId, imageUrl, createAt]
        );
        console.log("Image uploaded and saved in DB:", imageUrl);

        // Upload the service icon to S3
        if (icon) {
            const iconBuffer = Buffer.from(await icon.arrayBuffer());
            const iconName = `services/icons/${serviceId}-${Date.now()}.jpg`; 
            await uploadFileToS3(iconBuffer, iconName);
            const iconUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${iconName}`;

            // Insert icon URL into images table with category `service_icon`
            await connection.execute(
                'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                ["service_icon", serviceId, iconUrl, createAt]
            );
            console.log("Icon uploaded and saved in DB:", iconUrl);
        }

        // Insert info (rich text content) into text_data table, if available
        if (info) {
            await connection.execute(
                'INSERT INTO kr_dev.text_data (category, category_id, info, create_at) VALUES (?, ?, ?, ?)',
                ["service", serviceId, info, createAt]
            );
            console.log("Text data saved in DB.");
        }

        // Insert meta tags (title, description, keywords) into meta_data table
        if (metaTitle || metaDescription || metaKeywords) {
            await connection.execute(
                'INSERT INTO kr_dev.meta_data (category, category_id, title, description, keyword, create_at) VALUES (?, ?, ?, ?, ?, ?)',
                ["service_meta_data", serviceId, metaTitle, metaDescription, metaKeywords, createAt]
            );
            console.log("Meta data saved in DB.");
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Service, image, icon, offer_tag, and meta data added successfully', serviceId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding service data:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add service, image, icon, offer_tag, and meta data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update an existing service card, its image URL, icon URL, status, info, offer_tag, and meta data (meta tags)
export async function PUT(req) {
    const connection = await createConnection();
    try {
        console.log("Receiving update request for service...");

        const formData = await req.formData();
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const file = formData.get("file");
        const icon = formData.get("icon");
        const status = formData.get("status");
        const info = formData.get("info");

        // Meta data fields
        const metaTitle = formData.get("meta_title");
        const metaDescription = formData.get("meta_description");
        const metaKeywords = formData.get("meta_keywords");

        // Offer tag
        const offerTag = formData.get("offer_tag"); // Get offer tag

        console.log("Parsed formData for update:", { id, name, description, status, metaTitle, metaDescription, metaKeywords, offerTag });

        if (!id || !name || !description) {
            return new Response(JSON.stringify({ error: 'ID, Name, and Description are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateAt = new Date().toISOString().split('T')[0];

        // Update service details
        const [serviceUpdateResult] = await connection.execute(
            'UPDATE kr_dev.services SET name = ?, description = ?, status = ?, offer_tag = ?, update_at = ? WHERE id = ?',
            [name, description, status, offerTag || null, updateAt, id]
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

        // Upload new image if file is provided
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
            console.log("Image uploaded and updated in DB:", imageUrl);
        }

        // Update or insert service icon if provided
        const [existingIcon] = await connection.execute(
            'SELECT path FROM kr_dev.images WHERE category = ? AND category_id = ?',
            ["service_icon", id]
        );

        if (icon) {
            const iconBuffer = Buffer.from(await icon.arrayBuffer());
            const iconName = `services/icons/${id}-${Date.now()}.jpg`;
            await uploadFileToS3(iconBuffer, iconName);
            const iconUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${iconName}`;

            if (existingIcon.length > 0) {
                await connection.execute(
                    'UPDATE kr_dev.images SET path = ?, update_at = ? WHERE category = ? AND category_id = ?',
                    [iconUrl, updateAt, "service_icon", id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO kr_dev.images (category, category_id, path, create_at) VALUES (?, ?, ?, ?)',
                    ["service_icon", id, iconUrl, updateAt]
                );
            }
            console.log("Icon uploaded and updated in DB:", iconUrl);
        }

        // Update or insert info (rich text content) in text_data table
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
            console.log("Text data saved in DB.");
        }

        // Update or insert meta tags (title, description, keywords) into meta_data table
        const [metaDataUpdateResult] = await connection.execute(
            'UPDATE kr_dev.meta_data SET title = ?, description = ?, keyword = ?, update_at = ? WHERE category_id = ? AND category = ?',
            [metaTitle, metaDescription, metaKeywords, updateAt, id, 'service_meta_data']
        );

        if (metaDataUpdateResult.affectedRows === 0) {
            await connection.execute(
                'INSERT INTO kr_dev.meta_data (category, category_id, title, description, keyword, create_at, update_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['service_meta_data', id, metaTitle, metaDescription, metaKeywords, updateAt, updateAt]
            );
            console.log("Meta data saved in DB.");
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Service, image, icon, offer_tag, and meta data updated successfully', imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating service data:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update service, image, icon, offer_tag, and meta data' }), {
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
