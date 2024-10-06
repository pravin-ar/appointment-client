// app/api/offers/route.js
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Utility function to create a database connection
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
        // Fetch Products with Offer Tags
        const [products] = await connection.execute(
            `
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.offer_tag,
                ot.name AS offer_name,
                ot.image_url AS offer_image_url,
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
            LEFT JOIN kr_dev.offer_tag ot ON p.offer_tag = ot.id
            WHERE p.status = 'Y' 
                AND p.offer_tag IS NOT NULL
                AND p.offer_tag != '';
            `
        );

        console.log(products);

        // Fetch Services with Offer Tags
        const [services] = await connection.execute(
            `
            SELECT 
                s.id, 
                s.name, 
                s.description, 
                s.offer_tag,
                ot.name AS offer_name,
                ot.image_url AS offer_image_url,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT('path', i.path, 'sequence', i.sequence)
                    )
                    FROM kr_dev.images i
                    WHERE i.category_id = s.id 
                    AND i.category = 'service'
                    ORDER BY i.sequence ASC
                ) AS image_urls
            FROM kr_dev.services s 
            LEFT JOIN kr_dev.offer_tag ot ON s.offer_tag = ot.id
            WHERE s.status = 'Y' 
                AND s.offer_tag IS NOT NULL
                AND s.offer_tag != '';
            `
        );

        // Structure the response to include both products and services
        const responseData = {
            products,
            services,
        };

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching offers:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch offers' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        await connection.end();
    }
}
