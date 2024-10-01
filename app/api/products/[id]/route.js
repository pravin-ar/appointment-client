// app/api/products/[id]/route.js
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
    });
}

export async function GET(req, { params }) {
    const { id } = params; // Get the product id from the URL params
    const connection = await createConnection();
    try {
        // Update the query to filter by product id
        const [results] = await connection.execute(
            `
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
            WHERE p.id = ?;  -- Ensure the query filters by the product id
            `,
            [id]
        );

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(results[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        await connection.end();
    }
}
