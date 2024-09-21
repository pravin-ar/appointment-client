import mysql from 'mysql2/promise';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// PUT method to update an existing service card
export async function PUT(req) {
    try {
        const { id, service_name, description, image_url } = await req.json();

        if (!id || !service_name || !description || !image_url) {
            return new Response(JSON.stringify({ error: 'ID, Service Name, Description, and Image URL are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const [result] = await connection.execute(
            'UPDATE service_card_text SET service_name = ?, description = ?, image_url = ? WHERE id = ?',
            [service_name, description, image_url, id]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Service not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating service card text:', error);
        return new Response(JSON.stringify({ error: 'Failed to update service card text' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new service card
export async function POST(req) {
    try {
        const { service_name, description, image_url } = await req.json();

        if (!service_name || !description || !image_url) {
            return new Response(JSON.stringify({ error: 'Service Name, Description, and Image URL are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const [result] = await connection.execute(
            'INSERT INTO service_card_text (service_name, description, image_url) VALUES (?, ?, ?)',
            [service_name, description, image_url]
        );

        await connection.end();

        return new Response(JSON.stringify({ message: 'Service added successfully', id: result.insertId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding new service card:', error);
        return new Response(JSON.stringify({ error: 'Failed to add service card' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// GET method to fetch all service cards
export async function GET(req) {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const [results] = await connection.execute('SELECT * FROM service_card_text');

        await connection.end();

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching service card text:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch service card text' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// DELETE method to remove a service card by ID
export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: 'Service ID is required' }), {
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

        const [result] = await connection.execute('DELETE FROM service_card_text WHERE id = ?', [id]);

        await connection.end();

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Service not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Service deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting service card:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete service card' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
