import mysql from 'mysql2/promise';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

export async function POST(req) {
    const { id, full_name, dob, phone_number, email, isNew_user } = await req.json();

    if (!id || !full_name || !dob || !phone_number || !email || isNew_user === undefined) {
        return new Response(JSON.stringify({ error: 'All fields are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const [result] = await connection.execute(
            'UPDATE bookings SET full_name = ?, dob = ?, phone_number = ?, email = ?, isNew_user = ? WHERE id = ?',
            [full_name, new Date(dob).toISOString().slice(0, 10), phone_number, email, isNew_user, id]
        );

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Booking not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Booking updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error updating booking:', error);
        return new Response(JSON.stringify({ error: 'Failed to update booking' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
