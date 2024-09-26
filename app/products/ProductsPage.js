// app/products/ProductsPage.js
"use client";
import { useEffect, useState } from 'react';
import styles from './ProductsPage.module.css'; // Import CSS module

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedType, setSelectedType] = useState("Bestsellers");
    const [productTypes, setProductTypes] = useState([]); // State for product types

    useEffect(() => {
        // Fetch all products data once
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data); // Initially show all products
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        // Fetch product types
        const fetchProductTypes = async () => {
            try {
                const response = await fetch('/api/product-type'); // Adjust API endpoint as needed
                const types = await response.json();
                setProductTypes(types); // Set product types in state
            } catch (error) {
                console.error('Error fetching product types:', error);
            }
        };

        fetchProducts();
        fetchProductTypes(); // Fetch product types when component loads
    }, []);

    // Handle Product Type Filter Click
    const handleTypeFilter = (type) => {
        setSelectedType(type);
        if (type === "Bestsellers") {
            setFilteredProducts(products); // Show all products for Bestsellers
        } else {
            const filtered = products.filter((product) => product.type === type);
            setFilteredProducts(filtered);
        }
    };

    return (
        <>
            <div className={styles.pageStart}>
                {/* Product Type Filter Buttons */}
                < div className={styles.header} >
                    <h1>Our Products</h1>
                    <p>
                        We offer a wide range of products, including stylish eyewear, high-performance sportswear, and comfortable contact lenses.
                        Discover the perfect fit for your lifestyle today!
                    </p>
                    <div className={styles.filterButtons}>
                        {["Bestsellers", ...productTypes.map((type) => type.type)].map((type) => (
                            <button
                                key={type}
                                className={`${styles.filterButton} ${selectedType === type ? styles.activeButton : ''}`}
                                onClick={() => handleTypeFilter(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div >
            </div>
            <div className={styles.productsPage}>
                {/* Main Content */}
                <div className={styles.content}>
                    {/* Filter Sidebar */}
                    <div className={styles.sidebar}>
                        <h3>Categories</h3>
                        <div className={styles.filterGroup}>
                            <h4>Frames</h4>
                            <div className="container">
                                <div>
                                    <input type="checkbox" id="squire" name="frames" />
                                    <label htmlFor="squire">Squire Frame</label>
                                </div>
                                <div>
                                    <input type="checkbox" id="rectangular" name="frames" />
                                    <label htmlFor="rectangular">Rectangular Frame</label>
                                </div>
                                <div>
                                    <input type="checkbox" id="round" name="frames" />
                                    <label htmlFor="round">Round Glasses</label>
                                </div>
                                <div>
                                    <input type="checkbox" id="oval" name="frames" />
                                    <label htmlFor="oval">Oval Glasses</label>
                                </div>
                                <div>
                                    <input type="checkbox" id="aviator" name="frames" />
                                    <label htmlFor="aviator">Aviator Glasses</label>
                                </div>
                            </div>
                        </div>
                        <div className={styles.filterGroup}>
                            <h4>Size</h4>
                            {["48-18-132", "32-16-140", "53-17-140", "45-16-128", "54-16-140"].map((size) => (
                                <div key={size}>
                                    <input type="checkbox" id={size} name="size" />
                                    <label htmlFor={size}>{size}</label>
                                </div>
                            ))}
                        </div>

                        <div className={styles.filterGroup}>
                            <h4>Price</h4>
                            <input type="range" min="30" max="50" step="1" className={styles.priceRange} />
                            <div className={styles.priceInputs}>
                                <input type="text" placeholder="£ From" className={styles.priceInput} />
                                <input type="text" placeholder="£ To" className={styles.priceInput} />
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className={styles.productGrid}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className={styles.productCard}>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <img src={product.image_url} alt={product.name} className={styles.productImage} />

                                    <p className={styles.productPrice}>£{product.price}</p>
                                </div>
                            ))
                        ) : (
                            <p>No products available for the selected filter.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductsPage;
