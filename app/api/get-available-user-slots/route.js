import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const dateString = dateParam; // Date in 'YYYY-MM-DD' format

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Fetch available slots for the date from master_slot
        const [rows] = await connection.execute(
            'SELECT ms.slot_id, st.slot_time FROM master_slot ms JOIN slot_table st ON ms.slot_id = st.id WHERE ms.slot_date = ?',
            [dateString]
        );

        const availableSlots = rows.map(row => ({
            id: row.slot_id,
            time: row.slot_time,
        }));

        return NextResponse.json({ availableSlots }, { status: 200 });

    } catch (error) {
        console.error('Error fetching available slots:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
