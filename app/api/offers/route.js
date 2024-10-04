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

export async function GET() {
    const connection = await createConnection();
    try {
        const [results] = await connection.execute(
            `
            SELECT 
    p.id, 
    p.name, 
    p.description, 
    p.price, 
    p.offer_tag,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT('path', i.path, 'sequence', i.sequence)
        )
        FROM kr_dev.images i
        WHERE i.category_id = p.id 
        AND i.category = 'product'
        ORDER BY i.sequence ASC
    ) AS image_urls
FROM kr_dev.products p 
WHERE p.status = 'Y' 
AND p.offer_tag IS NOT NULL
AND p.offer_tag != '';
            `
        );

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching offer products:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch offer products' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        await connection.end();
    }
}
