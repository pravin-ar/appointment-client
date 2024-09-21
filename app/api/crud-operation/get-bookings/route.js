import mysql from 'mysql2/promise';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

export async function GET(req) {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });
        const [rows] = await connection.execute('SELECT * FROM bookings');
        return new Response(JSON.stringify({ bookings: rows }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
