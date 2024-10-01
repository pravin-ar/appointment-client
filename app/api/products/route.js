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

// GET method to fetch products with image sequence, tags, and meta tags
export async function GET() {
    const connection = await createConnection();
    try {
        console.log('Fetching all product data with images, tags, and meta tags...');
        const [results] = await connection.execute(`
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price,
                p.type,
                p.frame,
                p.size,
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
                ) AS image_urls,
                (
                    SELECT meta_tag FROM kr_dev.meta_data m
                    WHERE m.category_id = p.id
                    AND m.category = 'product_meta_data'
                ) AS meta_tag
            FROM 
                kr_dev.products p 
            GROUP BY 
                p.id;
        `);

        // Ensure the image_urls are not truncated
        results.forEach(product => {
            console.log('Product:', JSON.stringify(product, null, 2)); // This will properly log the object structure
        });

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

// POST method to add a product with meta tag, frame, and size
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
        const metaTag = formData.get("meta_tag"); // Get meta tag

        console.log('Product Details:', { name, description, price, type, frame, size, status, tags, metaTag });

        if (!name || !description || !price || !type || !status) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ error: 'Name, Description, Price, Type, Status, Frame, and Size are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const createAt = new Date().toISOString().split('T')[0];
        const [productResult] = await connection.execute(
            'INSERT INTO kr_dev.products (name, description, price, type, frame, size, status, tags, create_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, type, frame, size, status, tags, createAt]
        );

        console.log('Product inserted, ID:', productResult.insertId);
        const productId = productResult.insertId;

        // Insert the meta tag into the meta_data table
        await connection.execute(
            'INSERT INTO kr_dev.meta_data (category, category_id, meta_tag, create_at) VALUES (?, ?, ?, ?)',
            ['product_meta_data', productId, metaTag, createAt]
        );
        console.log('Meta tag inserted:', metaTag);

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

        return new Response(JSON.stringify({ message: 'Product, meta tag, and images added successfully' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding product and meta tag:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add product and meta tag' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update product with meta tag, frame, and size
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
        const metaTag = formData.get("meta_tag"); // Get meta tag

        console.log('Product Details:', { id, name, description, price, type, frame, size, status, tags, metaTag });

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
            'UPDATE kr_dev.products SET name = ?, description = ?, price = ?, type = ?, frame = ?, size = ?, status = ?, tags = ?, update_at = ? WHERE id = ?',
            [name, description, price, type, frame, size, status, tags, updateAt, id]
        );
        console.log('Product updated:', productUpdateResult);

        // Try updating the meta tag in the meta_data table
        const [metaTagUpdateResult] = await connection.execute(
            'UPDATE kr_dev.meta_data SET meta_tag = ?, update_at = ? WHERE category_id = ? AND category = ?',
            [metaTag, updateAt, id, 'product_meta_data']
        );
        console.log('Meta tag updated:', metaTagUpdateResult);

        // If no rows were updated, insert the meta tag instead
        if (metaTagUpdateResult.affectedRows === 0) {
            console.log('Meta tag does not exist, inserting new meta tag.');
            await connection.execute(
                'INSERT INTO kr_dev.meta_data (category, category_id, meta_tag, create_at, update_at) VALUES (?, ?, ?, ?, ?)',
                ['product_meta_data', id, metaTag, updateAt, updateAt]
            );
            console.log('Meta tag inserted:', metaTag);
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

        return new Response(JSON.stringify({ message: 'Product, meta tag, frame, size, and images updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating product, meta tag, and images:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update product, meta tag, and images' }), {
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
