import bcrypt from 'bcryptjs';
import { serialize } from 'cookie'; // Import the cookie serializer
import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export async function POST(req) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return new Response(JSON.stringify({ success: false, message: 'Email and password are required.' }), { status: 400 });
    }

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const [rows] = await connection.execute(
            'SELECT * FROM kr_dev.users WHERE email = ?',
            [email]
        );

        await connection.end();

        if (rows.length === 0) {
            return new Response(JSON.stringify({ success: false, message: 'User not found.' }), { status: 404 });
        }

        const user = rows[0];
        const storedHashedPassword = user.password;

        const isMatch = await bcrypt.compare(password, storedHashedPassword);

        if (isMatch) {
            // Set a cookie to maintain session state
            const cookie = serialize('adminSession', 'true', {
                httpOnly: false, // Make it accessible on the client side for debugging purposes
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day session duration
            });

            return new Response(JSON.stringify({ success: true, message: 'Login successful.' }), {
                status: 200,
                headers: {
                    'Set-Cookie': cookie, // Set the session cookie
                },
            });
        } else {
            return new Response(JSON.stringify({ success: false, message: 'Invalid password.' }), { status: 401 });
        }
    } catch (error) {
        console.error('Error connecting to the database:', error);
        return new Response(JSON.stringify({ success: false, message: 'Internal server error.' }), { status: 500 });
    }
}
