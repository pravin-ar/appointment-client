import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

export async function POST(req) {
    const { email, password } = await req.json();

    try {
        // Connect to the database using environment variables
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        // Query the database to check for the email
        const [rows] = await connection.execute(
            'SELECT * FROM admin_table WHERE email = ?',
            [email]
        );

        // Close the database connection
        await connection.end();

        // Check if user exists
        if (rows.length === 0) {
            return new Response(JSON.stringify({ success: false }), { status: 401 });
        }

        const user = rows[0];

        // Compare the entered plain password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ success: false }), { status: 401 });
        }
    } catch (error) {
        console.error('Error connecting to the database:', error);
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
