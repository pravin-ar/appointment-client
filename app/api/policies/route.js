import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Fetch policies (GET request)
export async function GET(req) {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    });

    const [rows] = await connection.execute('SELECT * FROM policies');
    await connection.end();

    return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

// Add a policy (POST request)
export async function POST(req) {
    const { name, description } = await req.json();

    if (!name || !description) {
        return new Response(JSON.stringify({ error: 'Name and description are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    });

    await connection.execute('INSERT INTO policies (name, description) VALUES (?, ?)', [name, description]);
    await connection.end();

    return new Response(JSON.stringify({ message: 'Policy added successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
