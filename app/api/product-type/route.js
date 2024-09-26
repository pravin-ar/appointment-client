// app/api/product-type/route.js
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        connectTimeout: 10000
    });
}

// GET Method - Fetch all product types
export async function GET() {
    const connection = await createConnection();
    try {
        const [results] = await connection.execute(`SELECT id, type FROM product_types`);
        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch product types' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST Method - Add new product type
export async function POST(req) {
    const connection = await createConnection();
    try {
        const { type } = await req.json();
        const [result] = await connection.execute('INSERT INTO product_types (type) VALUES (?)', [type]);
        await connection.end();
        return new Response(JSON.stringify({ id: result.insertId, type }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add product type' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
