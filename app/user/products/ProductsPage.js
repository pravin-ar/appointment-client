"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ProductsPage.module.css';

const ProductsPage = () => {
    const [filteredProducts, setFilteredProducts] = useState([]); // Store filtered products
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const productsPerPage = 10;
    const [productTypes, setProductTypes] = useState([]); // Product types state
    const [frames, setFrames] = useState([]); // State for frames
    const [sizes, setSizes] = useState([]); // State for sizes
    const [selectedType, setSelectedType] = useState("Bestsellers");
    const [selectedFrames, setSelectedFrames] = useState([]); // Track selected frames
    const [selectedSizes, setSelectedSizes] = useState([]); // Track selected sizes

    // Local state to track frames and sizes before applying changes
    const [tempSelectedFrames, setTempSelectedFrames] = useState([]); 
    const [tempSelectedSizes, setTempSelectedSizes] = useState([]); 

    const router = useRouter();

    // Fetch product types, frames, sizes, and the first page of products on mount
    useEffect(() => {
        fetchProductTypes();
        fetchFrames(); // Fetch frames
        fetchSizes(); // Fetch sizes
        fetchProducts(1, selectedType, selectedFrames, selectedSizes); // Initial fetch with default values
    }, []); // Empty dependency array ensures this runs once on mount

    // UseEffect to listen for filter changes and page changes, and trigger API calls accordingly
    useEffect(() => {
        if (page === 1) {
            // If page is reset to 1, clear the previous products and reset the state
            setFilteredProducts([]);
        }
        fetchProducts(page, selectedType, selectedFrames, selectedSizes); // Fetch products based on the current filters and page
    }, [page, selectedType, selectedFrames, selectedSizes]); // Trigger API call when any filter or page changes

    // Fetch products with pagination and filters
    const fetchProducts = async (currentPage, type, frames, sizes) => {
        if (loading || !hasMore) return;

        setLoading(true); // Set loading to true before the fetch starts
        try {
            // Build the query parameters for filtering
            const typeParam = type !== "Bestsellers" ? `&type=${type}` : "";
            const framesParam = frames.length > 0 ? `&frames=${frames.join(',')}` : ""; // Only add frames if selected
            const sizesParam = sizes.length > 0 ? `&sizes=${sizes.join(',')}` : ""; // Only add sizes if selected

            // Construct the full query without passing empty filters
            const query = `/api/products?page=${currentPage}&limit=${productsPerPage}${typeParam}${framesParam}${sizesParam}`;

            const response = await fetch(query);
            const data = await response.json();

            if (response.ok) {
                if (data.length < productsPerPage) {
                    setHasMore(false); // No more products to load
                }

                if (currentPage === 1) {
                    setFilteredProducts(data); // Replace products on the first page load or filter change
                } else {
                    setFilteredProducts((prevProducts) => [...prevProducts, ...data]); // Append more products on scrolling
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setHasMore(false);
        }
        setLoading(false); // Set loading to false after the fetch finishes
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

    // Handle Product Type Filter Click (Immediate API call)
    const handleTypeFilter = (type) => {
        setSelectedType(type); // Set the selected type
        setPage(1); // Reset page to 1
        setHasMore(true); // Reset pagination state
    };

    // Handle Frame Checkbox Change (Stored in temp state, only applied when clicking "Apply Changes")
    const handleFrameChange = (frame) => {
        const newSelectedFrames = tempSelectedFrames.includes(frame)
            ? tempSelectedFrames.filter((f) => f !== frame)
            : [...tempSelectedFrames, frame];
        setTempSelectedFrames(newSelectedFrames); // Set temporary state for selected frames
    };

    // Handle Size Checkbox Change (Stored in temp state, only applied when clicking "Apply Changes")
    const handleSizeChange = (size) => {
        const newSelectedSizes = tempSelectedSizes.includes(size)
            ? tempSelectedSizes.filter((s) => s !== size)
            : [...tempSelectedSizes, size];
        setTempSelectedSizes(newSelectedSizes); // Set temporary state for selected sizes
    };

    // Apply changes when the "Apply Changes" button is clicked (for frames and sizes only)
    const applyFilters = () => {
        setSelectedFrames(tempSelectedFrames);
        setSelectedSizes(tempSelectedSizes);
        setPage(1); // Reset page to 1 and ensure it's fetched first
        setHasMore(true); // Reset pagination state
    };

    // Handle scroll event to implement lazy loading
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 500 && hasMore && !loading
            ) {
                setPage((prevPage) => prevPage + 1); // Increment the page number to fetch the next page
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, loading]);

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
                                onClick={() => handleTypeFilter(type)} // Immediate API call on type change
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
                        {/* Apply Changes Button */}
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

                    {/* Loading message appears after products */}
                    {loading && <p className={styles.loadingMessage}>Loading more products...</p>}
                    {!hasMore && !loading && <p>All products have been loaded.</p>}
                </div>
            </div>
        </>
    );
};

export default ProductsPage;
