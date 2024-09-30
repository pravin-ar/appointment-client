import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export async function POST(req) {
    const { fullName, email, password } = await req.json();

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        // Check if the user already exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM kr_dev.users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return new Response(JSON.stringify({ success: false, message: 'User already exists' }), { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin into the database
        const [result] = await connection.execute(
            'INSERT INTO kr_dev.users (name, email, password) VALUES (?, ?, ?)',
            [fullName, email, hashedPassword]
        );

        await connection.end();

        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
        console.error('Error creating admin:', error);
        return new Response(JSON.stringify({ success: false, message: 'Database error' }), { status: 500 });
    }
}
