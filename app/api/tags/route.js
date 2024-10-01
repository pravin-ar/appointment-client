import mysql from 'mysql2/promise';

// Load environment variables for database connection
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Utility function to create a connection
async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
    });
}

// GET method to fetch categories (frames, sizes, or offers)
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category'); // Get the category query param

    if (!category) {
        return new Response(JSON.stringify({ error: 'Category is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const connection = await createConnection();
    try {
        const [results] = await connection.execute(
            `SELECT id, info FROM text_data WHERE category = ?`,
            [category]
        );

        await connection.end();
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new frame, size, or offer
export async function POST(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const info = formData.get('info');
        const category = formData.get('category');

        if (!info || !category) {
            return new Response(JSON.stringify({ error: 'Info and category are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const [insertResult] = await connection.execute(
            'INSERT INTO text_data (info, category) VALUES (?, ?)',
            [info, category]
        );

        await connection.end();
        return new Response(JSON.stringify({ message: 'Category added successfully', id: insertResult.insertId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding category:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to add category' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// PUT method to update a frame, size, or offer
export async function PUT(req) {
    const connection = await createConnection();
    try {
        const formData = await req.formData();
        const id = formData.get('id');
        const info = formData.get('info');
        const category = formData.get('category');

        if (!id || !info || !category) {
            return new Response(JSON.stringify({ error: 'ID, info, and category are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const [updateResult] = await connection.execute(
            'UPDATE text_data SET info = ?, category = ? WHERE id = ?',
            [info, category, id]
        );

        await connection.end();
        return new Response(JSON.stringify({ message: 'Category updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating category:', error);
        await connection.end();
        return new Response(JSON.stringify({ error: 'Failed to update category' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const config = {
    api: {
        bodyParser: false, // Disable Next.js default body parsing for FormData
    },
};
