// app/api/products/route.js
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, AWS_BUCKET_NAME } = process.env;

async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
    });
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function uploadFileToS3(file, fileName) {
    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: `${fileName}`,
        Body: file,
        ContentType: "image/jpeg"
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
}

// GET method to fetch products with pagination, image sequence, tags, and meta data
export async function GET(req) {
    const connection = await createConnection();
    try {
        // Parse query parameters for pagination
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page"), 10) || 1;
        const limit = parseInt(url.searchParams.get("limit"), 10) || 10;
        const offset = (page - 1) * limit;

        console.log(`Fetched ${page} ${limit} products from the database.`);


        // Construct the SQL query with limit and offset values directly in the query string
        const query = `
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price,
                p.type,
                p.frame,
                p.size,
                p.status,
                p.offer_tag,
                p.create_at, 
                p.update_at, 
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT('id', i.id, 'path', i.path, 'sequence', i.sequence)
                    )
                    FROM kr_dev.images i
                    WHERE i.category_id = p.id 
                    AND i.category = 'product'
                    ORDER BY i.sequence ASC
                ) AS image_urls,
                (
                    SELECT JSON_OBJECT('title', m.title, 'description', m.description, 'keyword', m.keyword)
                    FROM kr_dev.meta_data m
                    WHERE m.category_id = p.id
                    AND m.category = 'product_meta_data'
                ) AS meta_data
            FROM 
                kr_dev.products p
            ORDER BY p.id ASC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const [results] = await connection.execute(query);

        // Log the raw results
        // console.log('Raw Fetched Products:', JSON.stringify(results, null, 2));

        // Ensure the results contain JavaScript objects
        results.forEach(product => {
            if (!product.image_urls) {
                product.image_urls = [];
            }
            if (!product.meta_data) {
                product.meta_data = {};
            }
        });

        // Log the processed results
        // console.log('Processed Products:', JSON.stringify(results, null, 2));

        await connection.end();

        return new Response(JSON.stringify(results, null, 2), {
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


// POST method to add a product with meta data, frame, and size
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        console.log('FormData received:', formData);
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const type = formData.get("type");
        const frame = formData.get("frame"); // Get frame
        const size = formData.get("size"); // Get size
        const status = formData.get("status");
        const tags = formData.get("tags"); // Get tags as a plain comma-separated string
        const offerTag = formData.get("offer_tag"); // Get offer tag

        // Get meta data fields
        const title = formData.get("meta_title");
        const metaDescription = formData.get("meta_description");
        const keyword = formData.get("meta_keyword");

        console.log('Product Details:', { name, description, price, type, frame, size, status, tags, offerTag, title, metaDescription, keyword });

        if (!name || !description || !price || !type || !status) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ error: 'Name, Description, Price, Type, Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date().toISOString().split('T')[0];
        const [productResult] = await connection.execute(
            'INSERT INTO kr_dev.products (name, description, price, type, frame, size, status, tags, offer_tag, create_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, type, frame, size, status, tags, offerTag, createAt]
        );

        console.log('Product inserted, ID:', productResult.insertId);
        const productId = productResult.insertId;

        // Insert the meta data into the meta_data table
        await connection.execute(
            'INSERT INTO kr_dev.meta_data (category, category_id, title, description, keyword, create_at) VALUES (?, ?, ?, ?, ?, ?)',
            ['product_meta_data', productId, title, metaDescription, keyword, createAt]
        );
        console.log('Meta data inserted:', { title, metaDescription, keyword });

        const imageFiles = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file')) {
                imageFiles.push(value);
            }
        }
        console.log('Image files:', imageFiles);

        for (const [index, file] of imageFiles.entries()) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const imageName = `products/${productId}-${index}-${Date.now()}.jpg`;
            await uploadFileToS3(fileBuffer, imageName);
            const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

            await connection.execute(
                'INSERT INTO kr_dev.images (category, category_id, path, sequence, create_at) VALUES (?, ?, ?, ?, ?)',
                ["product", productId, imageUrl, index + 1, createAt]
            );
            console.log(`Image ${index} uploaded and inserted into database: ${imageUrl}`);
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product, meta data, and images added successfully' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding product and meta data:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add product and meta data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update product with meta data, frame, and size
export async function PUT(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        console.log('FormData received:', formData);
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const type = formData.get("type");
        const frame = formData.get("frame"); // Get frame
        const size = formData.get("size"); // Get size
        const status = formData.get("status");
        const tags = formData.get("tags"); // Get tags as plain string
        const offerTag = formData.get("offer_tag"); // Get offer tag

        // Get meta data fields
        const title = formData.get("meta_title");
        const metaDescription = formData.get("meta_description");
        const keyword = formData.get("meta_keyword");

        console.log('Product Details:', { id, name, description, price, type, frame, size, status, offerTag, title, metaDescription, keyword });

        if (!id || !name || !description || !price || !type || !status) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ error: 'ID, Name, Description, Price, Type, Frame, Size, and Status are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateAt = new Date().toISOString().split('T')[0];

        // Update product details
        const [productUpdateResult] = await connection.execute(
            'UPDATE kr_dev.products SET name = ?, description = ?, price = ?, type = ?, frame = ?, size = ?, status = ?, offer_tag = ?, update_at = ? WHERE id = ?',
            [name, description, price, type, frame, size, status, offerTag, updateAt, id]
        );
        console.log('Product updated:', productUpdateResult);

        // Try updating the meta data in the meta_data table
        const [metaDataUpdateResult] = await connection.execute(
            'UPDATE kr_dev.meta_data SET title = ?, description = ?, keyword = ?, update_at = ? WHERE category_id = ? AND category = ?',
            [title, metaDescription, keyword, updateAt, id, 'product_meta_data']
        );
        console.log('Meta data updated:', metaDataUpdateResult);

        // If no rows were updated, insert the meta data instead
        if (metaDataUpdateResult.affectedRows === 0) {
            console.log('Meta data does not exist, inserting new meta data.');
            await connection.execute(
                'INSERT INTO kr_dev.meta_data (category, category_id, title, description, keyword, create_at, update_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['product_meta_data', id, title, metaDescription, keyword, updateAt, updateAt]
            );
            console.log('Meta data inserted:', { title, metaDescription, keyword });
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
        console.log('Image files:', imageFiles);
        console.log('Existing image IDs:', existingImageIds);

        if (imageFiles.length > 0) {
            for (const [index, file] of imageFiles.entries()) {
                if (file && existingImageIds[index]) {
                    const fileBuffer = Buffer.from(await file.arrayBuffer());
                    const imageName = `products/${id}-${index}-${Date.now()}.jpg`;
                    await uploadFileToS3(fileBuffer, imageName);
                    const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;

                    await connection.execute(
                        'UPDATE kr_dev.images SET path = ?, update_at = ? WHERE id = ?',
                        [imageUrl, updateAt, existingImageIds[index]]
                    );
                    console.log(`Image ${index} updated in database: ${imageUrl}`);
                }
            }
        }

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product, meta data, frame, size, and images updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating product, meta data, and images:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update product, meta data, and images' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
