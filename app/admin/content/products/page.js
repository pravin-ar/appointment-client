"use client";
import { useEffect, useState } from 'react';
import styles from './ProductCardText.module.css';

export default function ProductCardText() {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productTypes, setProductTypes] = useState([]); // Product Types (General)
    const [frames, setFrames] = useState([]); // Frames data
    const [sizes, setSizes] = useState([]); // Sizes data
    const [offers, setOffers] = useState([]); // Offers data
    const [imageFiles, setImageFiles] = useState([{ file: null, id: null, path: '' }]);
    const [metaTag, setMetaTag] = useState(''); // State for handling meta tag
    const [selectedOffer, setSelectedOffer] = useState(''); // State for handling selected offer
    const [showDialog, setShowDialog] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        type: '',
        status: false,
        frame: '',
        size: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchProductTypes();
        fetchFrames();
        fetchSizes();
        fetchOffers(); // Fetch offer tags
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchProductTypes = async () => {
        try {
            const response = await fetch('/api/product-type');
            const data = await response.json();
            setProductTypes(data);
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };

    // Fetch frames data from the backend
    const fetchFrames = async () => {
        try {
            const response = await fetch('/api/tags?category=product-frames');
            const data = await response.json();
            setFrames(data);
        } catch (error) {
            console.error('Error fetching frames:', error);
        }
    };

    // Fetch sizes data from the backend
    const fetchSizes = async () => {
        try {
            const response = await fetch('/api/tags?category=product-size');
            const data = await response.json();
            setSizes(data);
        } catch (error) {
            console.error('Error fetching sizes:', error);
        }
    };

    // Fetch offers data from the backend
    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/tags?category=offer-tags');
            const data = await response.json();
            setOffers(data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            type: product.type,
            status: product.status === 'Y',
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
        setMetaTag(product.meta_tag || ''); // Pre-fill meta tag
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
            frame: '',
            size: ''
        });
        setImageFiles([{ file: null, id: null, path: '' }]);
        setSelectedOffer('');
        setMetaTag('');
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
        setNewProduct((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMetaTagChange = (e) => {
        setMetaTag(e.target.value);
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
            formData.append('offer_tag', selectedOffer); // Include offer tag in the form data
            formData.append('meta_tag', metaTag); // Append the meta tag

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
            fetchProducts();
        } catch (error) {
            console.error(`Error ${editingProduct ? 'updating' : 'adding'} product:`, error);
        }
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Product Descriptions</h1>
            <div className="card-container">
                {products.length > 0 ? (
                    products.map((product) => (
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
                            <option value="">Select Offer Tag</option>
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

                        {/* Meta Tag Section */}
                        <div className={styles.dialogInput}>
                            <h4>Meta Tag</h4>
                            <input
                                type="text"
                                value={metaTag}
                                placeholder="Enter Meta Tag"
                                onChange={handleMetaTagChange}
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
