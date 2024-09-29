import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export async function GET(req, { params }) {
    const { id } = params;
    
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    });

    const [rows] = await connection.execute('SELECT * FROM policies WHERE id = ?', [id]);
    await connection.end();

    if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Policy not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
