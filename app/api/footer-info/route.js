// api/footer-info/route.js

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
            ['footer_info']
        );

        await connection.end();

        if (rows.length > 0) {
            const info = JSON.parse(rows[0].info || '{}');
            return new Response(JSON.stringify(info), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(
                JSON.stringify({
                    description: '',
                    email: '',
                    website: '',
                    address: '',
                    number: '',
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    } catch (error) {
        console.error('Error fetching Footer Info data:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const { description, email, website, address, number } = await req.json();

        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        // Check if an entry already exists
        const [rows] = await connection.execute(
            'SELECT id FROM kr_dev.text_data WHERE category = ? LIMIT 1',
            ['footer_info']
        );

        if (rows.length > 0) {
            // Entry exists, use PUT instead
            await connection.end();
            return new Response(
                JSON.stringify({ error: 'Footer Info entry already exists. Use PUT to update.' }),
                { status: 400 }
            );
        }

        const info = JSON.stringify({ description, email, website, address, number });

        // Insert new 'footer_info' entry
        await connection.execute(
            'INSERT INTO kr_dev.text_data (category, info, create_at, update_at) VALUES (?, ?, NOW(), NOW())',
            ['footer_info', info]
        );

        await connection.end();

        return new Response(
            JSON.stringify({ success: true, message: 'Footer Info created.' }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error creating Footer Info content:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const { description, email, website, address, number } = await req.json();

        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const info = JSON.stringify({ description, email, website, address, number });

        // Update existing 'footer_info' entry
        const [result] = await connection.execute(
            'UPDATE kr_dev.text_data SET info = ?, update_at = NOW() WHERE category = ?',
            [info, 'footer_info']
        );

        await connection.end();

        if (result.affectedRows === 0) {
            // No entry was updated, meaning it doesn't exist
            return new Response(
                JSON.stringify({ error: 'No Footer Info entry found to update.' }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Footer Info updated.' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error updating Footer Info content:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}
