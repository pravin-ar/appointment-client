// app/user/products/[id]/page.js
import mysql from 'mysql2/promise';
import ProductDetailPage from './ProductDetailPage';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

async function createConnection() {
    return await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
    });
}

export async function generateMetadata({ params }) {
    const { id } = params;

    // Fetch meta data for the product from the database
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT title, description, keyword FROM kr_dev.meta_data WHERE category = ? AND category_id = ?',
            ['product_meta_data', id]
        );

        await connection.end();

        if (rows.length > 0) {
            const metaData = rows[0];
            return {
                title: metaData.title || 'Product Detail',
                description: metaData.description || 'Product description',
                keywords: metaData.keyword || '',
            };
        } else {
            return {
                title: 'Product Detail',
                description: 'Product description',
            };
        }
    } catch (error) {
        console.error('Error fetching meta data:', error);
        await connection.end();
        return {
            title: 'Product Detail',
            description: 'Product description',
        };
    }
}

export default function ProductDetailPageWrapper({ params }) {
    return <ProductDetailPage params={params} />;
}
