import mysql from 'mysql2/promise';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// PUT method to update an existing product
export async function PUT(req) {
    try {
        const { id, product_name, description, image_url } = await req.json();

        if (!id || !product_name || !description || !image_url) {
            return new Response(JSON.stringify({ error: 'ID, Product Name, Description, and Image URL are required' }), {
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
            'UPDATE products SET product_name = ?, description = ?, image_url = ? WHERE id = ?',
            [product_name, description, image_url, id]
        );

        await connection.end();

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Updated successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return new Response(JSON.stringify({ error: 'Failed to update product' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// POST method to add a new product
export async function POST(req) {
    try {
        const { product_name, description, image_url } = await req.json();

        if (!product_name || !description || !image_url) {
            return new Response(JSON.stringify({ error: 'Product Name, Description, and Image URL are required' }), {
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
            'INSERT INTO products (product_name, description, image_url) VALUES (?, ?, ?)',
            [product_name, description, image_url]
        );

        await connection.end();

        return new Response(JSON.stringify({ message: 'Product added successfully', id: result.insertId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error adding new product:', error);
        return new Response(JSON.stringify({ error: 'Failed to add product' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// GET method to fetch all products
export async function GET(req) {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        const [results] = await connection.execute('SELECT * FROM products');

        await connection.end();

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// DELETE method to remove a product by ID
export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: 'Product ID is required' }), {
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

        const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);

        await connection.end();

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete product' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}