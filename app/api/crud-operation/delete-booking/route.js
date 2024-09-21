import mysql from 'mysql2/promise';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: 'Booking ID is required' }), {
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

        const [result] = await connection.execute('DELETE FROM bookings WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Booking not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Booking deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error deleting booking:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete booking' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
