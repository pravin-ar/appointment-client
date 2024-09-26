import { useEffect, useState } from 'react';
import styles from './ProductsSection.module.css';

export default function ProductsSection() {
    const [productTypes, setProductTypes] = useState([]);

    useEffect(() => {
        const fetchProductTypes = async () => {
            try {
                const response = await fetch('/api/product-type');
                const data = await response.json();
                setProductTypes(data);
            } catch (error) {
                console.error('Error fetching product types:', error);
            }
        };
        fetchProductTypes();
    }, []);

    // Only display up to 6 product types
    const displayedProductTypes = productTypes.slice(0, 6);

    return (
        <section id="products" className={styles.productsSection}>
            <h2 className={styles.sectionTitle}>Our Product Types</h2>
            <div className={styles.productsGrid}>
                {displayedProductTypes.length > 0 ? (
                    displayedProductTypes.map((type, index) => (
                        <div
                            key={type.id}
                            className={`${styles.productCard} ${styles[`productCard${index + 1}`]}`}
                        >
                            <div className={styles.productImageWrapper}>
                                <img
                                    src={type.image_url}
                                    alt={type.type}
                                    className={styles.productImage}
                                />
                            </div>
                            <div className={styles.productContent}>
                                {/* Display product type name */}
                                <h3 className={styles.productTitle}>{type.type}</h3>
                                {/* Remove description as requested */}
                                <button className={styles.readMoreBtn}>Read More</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noProductsText}>No product types available.</p>
                )}
            </div>
            {/* Background Images */}
            <img src="/assets/images/blue1.png" alt="Background 1" className={styles.backgroundImage1} />
            <img src="/assets/images/blue2.png" alt="Background 2" className={styles.backgroundImage2} />
        </section>
    );
}
