"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ProductsPage.module.css';

const ProductsPage = () => {
    const [allFetchedProducts, setAllFetchedProducts] = useState([]); // Store all fetched products
    const [filteredProducts, setFilteredProducts] = useState([]); // Store filtered products
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const productsPerPage = 10;
    const [productTypes, setProductTypes] = useState([]);
    const [frames, setFrames] = useState([]); // State for frames
    const [sizes, setSizes] = useState([]); // State for sizes
    const [selectedType, setSelectedType] = useState("Bestsellers");
    const [selectedFrames, setSelectedFrames] = useState([]); // Track selected frames
    const [selectedSizes, setSelectedSizes] = useState([]); // Track selected sizes
    const router = useRouter();

    // Fetch product types, frames, sizes, and the first page of products on mount
    useEffect(() => {
        fetchProductTypes();
        fetchFrames(); // Fetch frames
        fetchSizes(); // Fetch sizes
        fetchProducts(page);
    }, []); // Empty dependency array ensures this runs once on mount

    // Fetch products with pagination
    const fetchProducts = async (currentPage) => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/products?page=${currentPage}&limit=${productsPerPage}`);
            const data = await response.json();

            if (response.ok) {
                if (data.length < productsPerPage) {
                    setHasMore(false); // No more products to load
                }

                setAllFetchedProducts((prevProducts) => {
                    // Prevent duplicate products by filtering out existing IDs
                    const existingProductIds = new Set(prevProducts.map(p => p.id));
                    const newProducts = data.filter(product => !existingProductIds.has(product.id));
                    return [...prevProducts, ...newProducts];
                });

                setFilteredProducts((prevProducts) => {
                    // Filter the new products as well
                    const existingProductIds = new Set(prevProducts.map(p => p.id));
                    const newFilteredProducts = data.filter(product => !existingProductIds.has(product.id));
                    return [...prevProducts, ...newFilteredProducts];
                });
            } else {
                setHasMore(false);
            }
        } catch (error) {
            setHasMore(false);
        }
        setLoading(false);
    };

    // Fetch product types from the API
    const fetchProductTypes = async () => {
        try {
            const response = await fetch('/api/product-type');
            const types = await response.json();
            setProductTypes(types); // Set available product types
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };

    // Fetch frames from the API
    const fetchFrames = async () => {
        try {
            const response = await fetch('/api/tags?category=product-frames');
            const data = await response.json();
            setFrames(data); // Set frames from the response
        } catch (error) {
            console.error('Error fetching frames:', error);
        }
    };

    // Fetch sizes from the API
    const fetchSizes = async () => {
        try {
            const response = await fetch('/api/tags?category=product-size');
            const data = await response.json();
            setSizes(data); // Set sizes from the response
        } catch (error) {
            console.error('Error fetching sizes:', error);
        }
    };

    // Handle Product Type Filter Click
    const handleTypeFilter = (type) => {
        setSelectedType(type);
        applyFilters(type, selectedFrames, selectedSizes); // Apply filtering after updating type
    };

    // Handle Frame Checkbox Change
    const handleFrameChange = (frame) => {
        const newSelectedFrames = selectedFrames.includes(frame)
            ? selectedFrames.filter((f) => f !== frame)
            : [...selectedFrames, frame];
        setSelectedFrames(newSelectedFrames);
        applyFilters(selectedType, newSelectedFrames, selectedSizes); // Apply filtering after updating frames
    };

    // Handle Size Checkbox Change
    const handleSizeChange = (size) => {
        const newSelectedSizes = selectedSizes.includes(size)
            ? selectedSizes.filter((s) => s !== size)
            : [...selectedSizes, size];
        setSelectedSizes(newSelectedSizes);
        applyFilters(selectedType, selectedFrames, newSelectedSizes); // Apply filtering after updating sizes
    };

    // Filter products based on selected type, frames, and sizes
    const applyFilters = (type, selectedFrames, selectedSizes) => {
        let filtered = [...allFetchedProducts]; // Clone all fetched products

        if (type !== "Bestsellers") {
            filtered = filtered.filter((product) => product.type === type);
        }

        if (selectedFrames.length > 0) {
            filtered = filtered.filter((product) => selectedFrames.includes(product.frame));
        }

        if (selectedSizes.length > 0) {
            filtered = filtered.filter((product) => selectedSizes.includes(product.size));
        }

        setFilteredProducts(filtered); // Update the filtered products list
    };

    // Handle scroll event to implement lazy loading
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 500 && hasMore && !loading
            ) {
                setPage((prevPage) => prevPage + 1);
                fetchProducts(page + 1); // Fetch the next page of products
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, loading, page]);

    // Navigate to the product detail page
    const navigateToProductDetail = (id) => {
        router.push(`/user/products/${id}`); // Use the router to navigate
    };

    return (
        <>
            <div className={styles.pageStart}>
                <div className={styles.header}>
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
                </div>
            </div>
            <div className={styles.productsPage}>
                <div className={styles.content}>
                    {/* Filter Sidebar */}
                    <div className={styles.sidebar}>
                        <h3>Categories</h3>
                        <div className={styles.filterGroup}>
                            <h4>Frames</h4>
                            <div className="container">
                                {frames.map((frame) => (
                                    <div key={frame.id}>
                                        <input
                                            type="checkbox"
                                            id={frame.info}
                                            name="frames"
                                            checked={selectedFrames.includes(frame.info)}
                                            onChange={() => handleFrameChange(frame.info)}
                                        />
                                        <label htmlFor={frame.info}>{frame.info}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.filterGroup}>
                            <h4>Size</h4>
                            {sizes.map((size) => (
                                <div key={size.id}>
                                    <input
                                        type="checkbox"
                                        id={size.info}
                                        name="size"
                                        checked={selectedSizes.includes(size.info)}
                                        onChange={() => handleSizeChange(size.info)}
                                    />
                                    <label htmlFor={size.info}>{size.info}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className={styles.productGrid}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className={styles.productCard} onClick={() => navigateToProductDetail(product.id)}>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    {product.image_urls && product.image_urls.length > 0 && product.image_urls[0].path ? (
                                        <img src={product.image_urls[0].path} alt={product.name} className={styles.productImage} />
                                    ) : (
                                        <p>No image available</p>
                                    )}
                                    <p className={styles.productPrice}>£{product.price}</p>
                                </div>
                            ))
                        ) : (
                            <p>No products available for the selected filter.</p>
                        )}
                    </div>
                    {loading && <p>Loading more products...</p>}
                    {!hasMore && !loading && <p>All products have been loaded.</p>}
                </div>
            </div>
        </>
    );
};

export default ProductsPage;
