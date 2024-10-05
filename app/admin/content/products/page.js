"use client";
import { useEffect, useState } from 'react';
import styles from './ProductCardText.module.css';

export default function ProductCardText() {
    const [allFetchedProducts, setAllFetchedProducts] = useState([]); // Store all fetched products
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const productsPerPage = 10;

    const [editingProduct, setEditingProduct] = useState(null);
    const [productTypes, setProductTypes] = useState([]); // Product Types (General)
    const [frames, setFrames] = useState([]); // Frames data
    const [sizes, setSizes] = useState([]); // Sizes data
    const [offers, setOffers] = useState([]); // Offers data
    const [imageFiles, setImageFiles] = useState([{ file: null, id: null, path: '' }]);
    const [selectedOffer, setSelectedOffer] = useState(''); // State for handling selected offer
    const [showDialog, setShowDialog] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        type: '',
        status: false,
        bestseller: false,
        frame: '',
        size: ''
    });

    // New states for meta data
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [metaKeyword, setMetaKeyword] = useState('');

    useEffect(() => {
        fetchProductTypes();
        fetchFrames();
        fetchSizes();
        fetchOffers(); // Fetch offer tags
        fetchProducts(page); // Fetch first page of products
    }, []); // Empty dependency array ensures this runs once on mount


    // Fetch product types
    const fetchProductTypes = async () => {
        try {
            const response = await fetch('/api/product-type');
            const data = await response.json();
            setProductTypes(data);
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };

    // Fetch frames data
    const fetchFrames = async () => {
        try {
            const response = await fetch('/api/tags?category=product-frames');
            const data = await response.json();
            setFrames(data);
        } catch (error) {
            console.error('Error fetching frames:', error);
        }
    };

    // Fetch sizes data
    const fetchSizes = async () => {
        try {
            const response = await fetch('/api/tags?category=product-size');
            const data = await response.json();
            setSizes(data);
        } catch (error) {
            console.error('Error fetching sizes:', error);
        }
    };

    // Fetch offers data
    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/tags?category=offer-tags');
            const data = await response.json();
            setOffers(data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

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
            } else {
                setHasMore(false);
            }
        } catch (error) {
            setHasMore(false);
        }
        setLoading(false);
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

    const handleEdit = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            type: product.type,
            status: product.status === 'Y',
            bestseller: product.bestseller === 'Y',
            frame: product.frame || '',
            size: product.size || ''
        });

        setImageFiles(
            product.image_urls.map((img, index) => ({
                file: null,
                id: img.id,
                path: img.path,
            }))
        );

        setSelectedOffer(product.offer_tag || ''); // Pre-fill selected offer

        // Pre-fill meta data fields
        setMetaTitle(product.meta_data?.title || '');
        setMetaDescription(product.meta_data?.description || '');
        setMetaKeyword(product.meta_data?.keyword || '');
        setShowDialog(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setNewProduct({
            name: '',
            description: '',
            price: '',
            type: '',
            status: false,
            bestseller: false,
            frame: '',
            size: ''
        });
        setImageFiles([{ file: null, id: null, path: '' }]);
        setSelectedOffer('');
        setMetaTitle('');
        setMetaDescription('');
        setMetaKeyword('');
        setShowDialog(true);
    };

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        setImageFiles((prev) => {
            const updatedFiles = [...prev];
            updatedFiles[index] = { ...updatedFiles[index], file };
            return updatedFiles;
        });
    };

    const addNewImageField = () => {
        setImageFiles((prev) => [...prev, { file: null, id: null, path: '' }]);
    };

    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'metaTitle') {
            setMetaTitle(value);
        } else if (name === 'metaDescription') {
            setMetaDescription(value);
        } else if (name === 'metaKeyword') {
            setMetaKeyword(value);
        } else {
            setNewProduct((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            if (editingProduct) {
                formData.append('id', editingProduct.id);
            }
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append('price', newProduct.price);
            formData.append('type', newProduct.type);
            formData.append('frame', newProduct.frame); // Include frame in the form data
            formData.append('size', newProduct.size); // Include size in the form data
            formData.append('status', newProduct.status ? 'Y' : 'N');
            formData.append('bestseller', newProduct.bestseller ? 'Y' : 'N');

            // If the selected offer is empty, we will treat it as a removal of the offer tag
            if (selectedOffer) {
                formData.append('offer_tag', selectedOffer);
            } else {
                formData.append('offer_tag', ''); // Clear offer tag
            }
    
            // Append meta data fields
            formData.append('meta_title', metaTitle);
            formData.append('meta_description', metaDescription);
            formData.append('meta_keyword', metaKeyword);
    
            // Append image files (if any)
            imageFiles.forEach((imageObj, index) => {
                if (imageObj.file) {
                    formData.append(`file${index}`, imageObj.file);
                    formData.append(`image_id${index}`, imageObj.id);
                }
            });
    
            const response = await fetch('/api/products', {
                method: editingProduct ? 'PUT' : 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`Failed to ${editingProduct ? 'update' : 'add'} product`);
            }
    
            setEditingProduct(null);
            setShowDialog(false);
            fetchProducts(1); // Refresh the product list
        } catch (error) {
            console.error(`Error ${editingProduct ? 'updating' : 'adding'} product:`, error);
        }
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Product Descriptions</h1>
            <div className="card-container">
                {allFetchedProducts.length > 0 ? (
                    allFetchedProducts.map((product) => (
                        <article key={product.id} className="card">
                            <header className="card-header">
                                <h2 className="card-title">{product.name}</h2>
                                {product.image_urls && product.image_urls.length > 0 && product.image_urls[0].path ? (
                                    <img src={product.image_urls[0].path} alt={product.name} className="card-image" />
                                ) : (
                                    <p>No image available</p>
                                )}
                            </header>
                            <p className="card-description">{product.description}</p>
                            <p className="card-price">Price: £{product.price}</p>
                            <p className="card-type">Type: {product.type}</p>
                            <p className="card-status"><strong>Status: </strong>{product.status === 'Y' ? 'Active' : 'Inactive'}</p>
                            <footer className="card-footer">
                                <button className="btn edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                            </footer>
                        </article>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>

            <div className="add-card-container">
                <button className="btn add-btn" onClick={handleAdd}>
                    Add Product
                </button>
            </div>

            {loading && <p>Loading more products...</p>}
            {!hasMore && !loading && <p>All products have been loaded.</p>}

            {showDialog && (
                <div className={styles.dialogOverlay}>
                    <div className={styles.dialog}>
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <input
                            type="text"
                            className={styles.dialogInput}
                            name="name"
                            value={newProduct.name}
                            placeholder="Enter Product Name"
                            onChange={handleFieldChange}
                        />
                        <textarea
                            className={styles.dialogInput}
                            name="description"
                            value={newProduct.description}
                            placeholder="Enter Product Description"
                            onChange={handleFieldChange}
                        />
                        <input
                            type="number"
                            className={styles.dialogInput}
                            name="price"
                            value={newProduct.price}
                            placeholder="Enter Price"
                            onChange={handleFieldChange}
                        />

                        {/* Dropdown for Product Type */}
                        <select
                            className={styles.dialogInput}
                            name="type"
                            value={newProduct.type}
                            onChange={handleFieldChange}
                        >
                            <option value="">Select Product Type</option>
                            {productTypes.map((type) => (
                                <option key={type.id} value={type.type}>{type.type}</option>
                            ))}
                        </select>

                        {/* Dropdown for Frames */}
                        <select
                            className={styles.dialogInput}
                            name="frame"
                            value={newProduct.frame}
                            onChange={handleFieldChange}
                        >
                            <option value="">Select Frame</option>
                            {frames.map((frame) => (
                                <option key={frame.id} value={frame.info}>{frame.info}</option>
                            ))}
                        </select>

                        {/* Dropdown for Sizes */}
                        <select
                            className={styles.dialogInput}
                            name="size"
                            value={newProduct.size}
                            onChange={handleFieldChange}
                        >
                            <option value="">Select Size</option>
                            {sizes.map((size) => (
                                <option key={size.id} value={size.info}>{size.info}</option>
                            ))}
                        </select>

                        {/* Dropdown for Offers */}
                        <select
                            className={styles.dialogInput}
                            name="offer"
                            value={selectedOffer}
                            onChange={(e) => setSelectedOffer(e.target.value)}
                        >
                            <option value="">No Offer</option> {/* Option to remove offer tag */}
                            {offers.map((offer) => (
                                <option key={offer.id} value={offer.info}>{offer.info}</option>
                            ))}
                        </select>

                        <div className={styles.dialogInput}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={newProduct.status}
                                    onChange={handleFieldChange}
                                /> Active
                            </label>
                        </div>

                        {/* Bestseller checkbox */}
                        <div className={styles.dialogInput}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="bestseller"
                                    checked={newProduct.bestseller} // Bestseller checkbox state
                                    onChange={handleFieldChange}
                                /> Bestseller
                            </label>
                        </div>

                        {/* Meta Title Field */}
                        <div className={styles.dialogInput}>
                            <h4>Meta Title</h4>
                            <input
                                type="text"
                                name="metaTitle"
                                value={metaTitle}
                                placeholder="Enter Meta Title"
                                onChange={handleFieldChange}
                            />
                        </div>

                        {/* Meta Description Field */}
                        <div className={styles.dialogInput}>
                            <h4>Meta Description</h4>
                            <textarea
                                name="metaDescription"
                                value={metaDescription}
                                placeholder="Enter Meta Description"
                                onChange={handleFieldChange}
                            />
                        </div>

                        {/* Meta Keyword Field */}
                        <div className={styles.dialogInput}>
                            <h4>Meta Keywords</h4>
                            <input
                                type="text"
                                name="metaKeyword"
                                value={metaKeyword}
                                placeholder="Enter Meta Keywords (comma-separated)"
                                onChange={handleFieldChange}
                            />
                        </div>

                        {/* Image Upload Section */}
                        {imageFiles.map((imageObj, index) => (
                            <div key={index} className={styles.dialogInput}>
                                {imageObj.path && (
                                    <img src={imageObj.path} alt="Existing" style={{ width: '100px', marginBottom: '10px' }} />
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => handleImageChange(e, index)}
                                />
                            </div>
                        ))}
                        <button className="btn" onClick={addNewImageField}>Add Another Image</button>
                        <div className={styles.dialogFooter}>
                            <button className="btn save-btn" onClick={handleSave}>Save</button>
                            <button className="btn cancel-btn" onClick={() => setShowDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
