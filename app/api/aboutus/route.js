// api/aboutus/route.js

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
            ['aboutus']
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
        console.error('Error fetching About Us data:', error);
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
            ['aboutus']
        );

        if (rows.length > 0) {
            // Entry exists, use PUT instead
            await connection.end();
            return new Response(
                JSON.stringify({ error: 'About Us entry already exists. Use PUT to update.' }),
                { status: 400 }
            );
        }

        // Insert new 'aboutus' entry
        await connection.execute(
            'INSERT INTO kr_dev.text_data (category, info, create_at, update_at) VALUES (?, ?, NOW(), NOW())',
            ['aboutus', info]
        );

        await connection.end();

        return new Response(
            JSON.stringify({ success: true, message: 'About Us created.' }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error creating About Us content:', error);
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

        // Update existing 'aboutus' entry
        const [result] = await connection.execute(
            'UPDATE kr_dev.text_data SET info = ?, update_at = NOW() WHERE category = ?',
            [info, 'aboutus']
        );

        await connection.end();

        if (result.affectedRows === 0) {
            // No entry was updated, meaning it doesn't exist
            return new Response(
                JSON.stringify({ error: 'No About Us entry found to update.' }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'About Us updated.' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error updating About Us content:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}
