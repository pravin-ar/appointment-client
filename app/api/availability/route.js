import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

// GET method - fetch available slots for a given date
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Use the date string directly
    const dateString = dateParam;

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Fetch slot_ids from master_slot table for the selected date
        const [rows] = await connection.execute(
            'SELECT slot_id FROM master_slot WHERE slot_date = ?',
            [dateString]
        );

        const availableSlotIds = rows.map(row => row.slot_id);

        return NextResponse.json({ availableSlotIds }, { status: 200 });

    } catch (error) {
        console.error('Error fetching available slots:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// POST method - update available slots for a given date
export async function POST(req) {
    const body = await req.json();
    const { date, selectedSlots } = body;

    if (!date || !Array.isArray(selectedSlots)) {
        return NextResponse.json({ error: 'Date and selectedSlots are required' }, { status: 400 });
    }

    // Use the date string directly
    const dateString = date;

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Start a transaction
        await connection.beginTransaction();

        // Fetch existing slots for the date
        const [rows] = await connection.execute(
            'SELECT slot_id FROM master_slot WHERE slot_date = ?',
            [dateString]
        );

        const existingSlotIds = rows.map(row => row.slot_id);

        // Determine slots to add and slots to remove
        const slotsToAdd = selectedSlots.filter(id => !existingSlotIds.includes(id));
        const slotsToRemove = existingSlotIds.filter(id => !selectedSlots.includes(id));

        // Add new slots
        if (slotsToAdd.length > 0) {
            const createAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const values = slotsToAdd.map(slotId => [dateString, slotId, createAt, createAt]);
            await connection.query(
                'INSERT INTO master_slot (slot_date, slot_id, create_at, update_at) VALUES ?',
                [values]
            );
        }

        // Remove slots
        if (slotsToRemove.length > 0) {
            await connection.query(
                'DELETE FROM master_slot WHERE slot_date = ? AND slot_id IN (?)',
                [dateString, slotsToRemove]
            );
        }

        // Commit transaction
        await connection.commit();

        return NextResponse.json({ message: 'Availability updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error updating availability:', error);
        if (connection) {
            // Rollback transaction in case of error
            await connection.rollback();
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
