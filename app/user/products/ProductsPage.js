"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ProductsPage.module.css';

const ProductsPage = () => {
    // State to manage product filtering and loading status
    const [filteredProducts, setFilteredProducts] = useState([]); 
    const [loading, setLoading] = useState(false); 
    const [hasMore, setHasMore] = useState(true); 
    const [page, setPage] = useState(1); 
    const productsPerPage = 10; 

    // Filter states
    const [productTypes, setProductTypes] = useState([]); // Product types
    const [frames, setFrames] = useState([]); // Frames for filtering
    const [sizes, setSizes] = useState([]); // Sizes for filtering
    const [selectedType, setSelectedType] = useState(""); // Product type
    const [selectedFrames, setSelectedFrames] = useState([]); // Selected frames
    const [selectedSizes, setSelectedSizes] = useState([]); // Selected sizes
    const [isBestseller, setIsBestseller] = useState(true); // Bestseller flag, defaults to true

    // Temporary states for holding filter changes before applying
    const [tempSelectedFrames, setTempSelectedFrames] = useState([]); 
    const [tempSelectedSizes, setTempSelectedSizes] = useState([]); 

    const router = useRouter();

    // Fetch initial data on component mount
    useEffect(() => {
        fetchProductTypes();  // Fetch product categories
        fetchFrames();        // Fetch available frames
        fetchSizes();         // Fetch available sizes
        fetchProducts(1, "", [], [], true); // Initially fetch bestseller products
    }, []); // Run once on mount

    // Fetch products when filters or page change
    useEffect(() => {
        if (page === 1) {
            setFilteredProducts([]); // Clear products when filters change
        }
        fetchProducts(page, selectedType, selectedFrames, selectedSizes, isBestseller); // Fetch products
    }, [page, selectedType, selectedFrames, selectedSizes, isBestseller]); 

    // Fetch products based on current page and filters
    const fetchProducts = async (currentPage, type, frames, sizes, bestseller) => {
        if (loading || !hasMore) return; // Prevent fetch if already loading or no more products

        setLoading(true);
        try {
            // Construct query parameters
            const typeParam = type ? `&type=${type}` : "";
            const bestsellerParam = bestseller ? `&bestseller=Y` : ""; // Only add bestseller if true
            const framesParam = frames.length > 0 ? `&frames=${frames.join(',')}` : "";
            const sizesParam = sizes.length > 0 ? `&sizes=${sizes.join(',')}` : "";

            // Build the full query URL
            const query = `/api/products?page=${currentPage}&limit=${productsPerPage}${typeParam}${bestsellerParam}${framesParam}${sizesParam}`;

            const response = await fetch(query);
            const data = await response.json();

            if (response.ok) {
                if (data.length < productsPerPage) {
                    setHasMore(false); // No more products to load
                }

                // Update state with new products
                if (currentPage === 1) {
                    setFilteredProducts(data); // Set products for the first page
                } else {
                    setFilteredProducts((prevProducts) => [...prevProducts, ...data]); // Append new products for subsequent pages
                }
            } else {
                setHasMore(false); // Stop further fetches if response is invalid
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setHasMore(false);
        }
        setLoading(false);
    };

    // Fetch product types
    const fetchProductTypes = async () => {
        try {
            const response = await fetch('/api/product-type');
            const types = await response.json();
            setProductTypes(types);
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };

    // Fetch available frames
    const fetchFrames = async () => {
        try {
            const response = await fetch('/api/tags?category=product-frames');
            const data = await response.json();
            setFrames(data);
        } catch (error) {
            console.error('Error fetching frames:', error);
        }
    };

    // Fetch available sizes
    const fetchSizes = async () => {
        try {
            const response = await fetch('/api/tags?category=product-size');
            const data = await response.json();
            setSizes(data);
        } catch (error) {
            console.error('Error fetching sizes:', error);
        }
    };

    // Handle product type filter change
    const handleTypeFilter = (type) => {
        setSelectedType(type); 
        setIsBestseller(false); // Automatically deselect bestseller when a product type is selected
        setPage(1); // Reset to first page on filter change
        setHasMore(true); // Reset pagination
        fetchProducts(1, type, selectedFrames, selectedSizes, false); // Fetch products without bestseller filter
    };

    // Handle bestseller filter
    const handleBestsellerClick = () => {
        setSelectedType(""); // Clear any selected product type
        setIsBestseller(true); // Always keep bestseller selected when clicked
        setPage(1); // Reset to first page
        setHasMore(true); // Reset pagination
    };

    // Handle frame filter change
    const handleFrameChange = (frame) => {
        const updatedFrames = tempSelectedFrames.includes(frame)
            ? tempSelectedFrames.filter((f) => f !== frame)
            : [...tempSelectedFrames, frame];
        setTempSelectedFrames(updatedFrames);
    };

    // Handle size filter change
    const handleSizeChange = (size) => {
        const updatedSizes = tempSelectedSizes.includes(size)
            ? tempSelectedSizes.filter((s) => s !== size)
            : [...tempSelectedSizes, size];
        setTempSelectedSizes(updatedSizes);
    };

    // Apply filters for frames and sizes
    const applyFilters = () => {
        setSelectedFrames(tempSelectedFrames);
        setSelectedSizes(tempSelectedSizes);
        setPage(1); // Reset to first page after applying filters
        setHasMore(true);
    };

    // Handle scroll for lazy loading more products
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 500 && hasMore && !loading
            ) {
                setPage((prevPage) => prevPage + 1); // Increment page to load more products
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll); // Clean up the scroll event
        };
    }, [hasMore, loading]);

    // Navigate to product detail page
    const navigateToProductDetail = (id) => {
        router.push(`/user/products/${id}`); // Navigate using Next.js router
    };

    return (
        <>
            {/* Page Header */}
            <div className={styles.pageStart}>
                <div className={styles.header}>
                    <h1>Our Products</h1>
                    <p>
                        We offer a wide range of products, including stylish eyewear, high-performance sportswear, and comfortable contact lenses.
                        Discover the perfect fit for your lifestyle today!
                    </p>
                    {/* Filter Buttons */}
                    <div className={styles.filterButtons}>
                        <button
                            className={`${styles.filterButton} ${isBestseller ? styles.activeButton : ''}`}
                            onClick={handleBestsellerClick}
                        >
                            Bestsellers
                        </button>
                        {productTypes.map((type) => (
                            <button
                                key={type.id}
                                className={`${styles.filterButton} ${selectedType === type.type ? styles.activeButton : ''}`}
                                onClick={() => handleTypeFilter(type.type)}
                            >
                                {type.type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Products Page Content */}
            <div className={styles.productsPage}>
                <div className={styles.content}>
                    
                    {/* Sidebar for Filters */}
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
                                            checked={tempSelectedFrames.includes(frame.info)}
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
                                        checked={tempSelectedSizes.includes(size.info)}
                                        onChange={() => handleSizeChange(size.info)}
                                    />
                                    <label htmlFor={size.info}>{size.info}</label>
                                </div>
                            ))}
                        </div>

                        {/* Apply Filters Button */}
                        <button className={styles.applyButton} onClick={applyFilters}>
                            Apply Changes
                        </button>
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
                            !loading && <p>No products available for the selected filter.</p>
                        )}
                    </div>

                    {/* Loading and Pagination Messages */}
                    {loading && <p className={styles.loadingMessage}>Loading more products...</p>}
                    {!hasMore && !loading && <p>All products have been loaded.</p>}
                </div>
            </div>
        </>
    );
};

export default ProductsPage;
