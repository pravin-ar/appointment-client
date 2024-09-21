// app/components/ProductsSection.js
import { useEffect, useState } from 'react';
import styles from './ProductsSection.module.css';

export default function ProductsSection() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    // Only display up to 6 products
    const displayedProducts = products.slice(0, 6);

    return (
        <section id="products" className={styles.productsSection}>
            <h2 className={styles.sectionTitle}>Our Products</h2>
            <div className={styles.productsGrid}>
                {displayedProducts.length > 0 ? (
                    displayedProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className={`${styles.productCard} ${styles[`productCard${index + 1}`]}`}
                        >
                            <div className={styles.productImageWrapper}>
                                <img
                                    src={product.image_url}
                                    alt={product.product_name}
                                    className={styles.productImage}
                                />
                            </div>
                            <div className={styles.productContent}>
                                <h3 className={styles.productTitle}>{product.product_name}</h3>
                                <p className={styles.productDescription}>{product.description}</p>
                                <button className={styles.readMoreBtn}>Read More</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noProductsText}>No products available.</p>
                )}
            </div>
            {/* Background Images */}
            <img src="/assets/images/blue1.png" alt="Background 1" className={styles.backgroundImage1} />
            <img src="/assets/images/blue2.png" alt="Background 2" className={styles.backgroundImage2} />
        </section>
    );
}
