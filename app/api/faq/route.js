// api/faq/route.js

import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export async function GET(req) {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const [rows] = await connection.execute(
            'SELECT info FROM kr_dev.text_data WHERE category = ? LIMIT 1',
            ['faq']
        );

        await connection.end();

        if (rows.length > 0) {
            return new Response(JSON.stringify({ info: rows[0].info }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({ info: '' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error('Error fetching FAQ data:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const { info } = await req.json();

        if (!info) {
            return new Response(
                JSON.stringify({ error: 'Info content is required.' }),
                { status: 400 }
            );
        }

        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        // Check if an entry already exists
        const [rows] = await connection.execute(
            'SELECT id FROM kr_dev.text_data WHERE category = ? LIMIT 1',
            ['faq']
        );

        if (rows.length > 0) {
            // Entry exists, use PUT instead
            await connection.end();
            return new Response(
                JSON.stringify({ error: 'FAQ entry already exists. Use PUT to update.' }),
                { status: 400 }
            );
        }

        // Insert new 'faq' entry
        await connection.execute(
            'INSERT INTO kr_dev.text_data (category, info, create_at, update_at) VALUES (?, ?, NOW(), NOW())',
            ['faq', info]
        );

        await connection.end();

        return new Response(
            JSON.stringify({ success: true, message: 'FAQ created.' }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error creating FAQ content:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const { info } = await req.json();

        if (!info) {
            return new Response(
                JSON.stringify({ error: 'Info content is required.' }),
                { status: 400 }
            );
        }

        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        // Update existing 'faq' entry
        const [result] = await connection.execute(
            'UPDATE kr_dev.text_data SET info = ?, update_at = NOW() WHERE category = ?',
            [info, 'faq']
        );

        await connection.end();

        if (result.affectedRows === 0) {
            // No entry was updated, meaning it doesn't exist
            return new Response(
                JSON.stringify({ error: 'No FAQ entry found to update.' }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'FAQ updated.' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error updating FAQ content:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}
