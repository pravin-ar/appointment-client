"use client";
import { useEffect, useState } from 'react';
import styles from './ProductCardText.module.css'; // Assuming you have a CSS module for styling

export default function ProductCardText() {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null); // Store the product being edited
    const [productTypes, setProductTypes] = useState([]); // List of Product Types from DB
    const [imageFile, setImageFile] = useState({
        file: null,
        id: null
    });
    const [showDialog, setShowDialog] = useState(false); // Control the dialog visibility
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        type: '',
        status: false
    });

    useEffect(() => {
        fetchProducts();
        fetchProductTypes(); // Fetch product types from the database
    }, []);

    // Fetch product data from the API
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Fetch product types data from the API
    const fetchProductTypes = async () => {
        try {
            const response = await fetch('/api/product-type'); // Adjust API endpoint as needed
            const data = await response.json();
            setProductTypes(data);
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };

    // Handle opening of the edit dialog
    const handleEdit = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            type: product.type,
            status: product.status === 'Y'
        });
        setShowDialog(true); // Open the dialog
    };

    // Handle opening of the add dialog
    const handleAdd = () => {
        setEditingProduct(null); // No product is being edited
        setNewProduct({
            name: '',
            description: '',
            price: '',
            type: '',
            status: false
        });
        setShowDialog(true); // Open the dialog for adding new product
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile({
            file: file,
            id: editingProduct ? editingProduct.id : null
        });
    };

    // Handle field changes in the dialog
    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Save the edited or new product details
    const handleSave = async () => {
        try {
            const formData = new FormData(); // Using FormData to handle file uploads
            if (editingProduct) {
                formData.append('id', editingProduct.id); // Append ID if editing
            }
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append('price', newProduct.price); // Append price field
            formData.append('type', newProduct.type); // Append product type field
            formData.append('status', newProduct.status ? 'Y' : 'N'); // Convert boolean to "Y"/"N"
            
            if (imageFile.file) {
                formData.append('file', imageFile.file); // Append the file directly
                console.log('Attached image file:', imageFile.file);
            }

            const response = await fetch('/api/products', {
                method: editingProduct ? 'PUT' : 'POST', // Use PUT for editing and POST for adding
                body: formData, // Use FormData as the request body
            });

            if (!response.ok) {
                throw new Error(`Failed to ${editingProduct ? 'update' : 'add'} product`);
            }

            setEditingProduct(null);
            setShowDialog(false); // Close the dialog after saving
            fetchProducts(); // Refresh the products list
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
                                <img src={product.image_url} alt={product.name} className="card-image" /> {/* Display image */}
                            </header>
                            <p className="card-description">{product.description}</p>
                            <p className="card-price">Price: £{product.price}</p> {/* Display price */}
                            <p className="card-type">Type: {product.type}</p> {/* Display product type */}
                            <p className="card-status"><strong>Status: </strong>{product.status === 'Y' ? 'Active' : 'Inactive'}</p> {/* Display status */}
                            <footer className="card-footer">
                                <button className="btn edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                            </footer>
                        </article>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>

            {/* Add Product Button */}
            <div className="add-card-container">
                <button className="btn add-btn" onClick={handleAdd}>
                    Add Product
                </button>
            </div>

            {/* Add/Edit Dialog */}
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
                        /> {/* Price input */}
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
                        </select> {/* Product Type dropdown */}
                        <div className={styles.dialogInput}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={newProduct.status}
                                    onChange={handleFieldChange}
                                /> Active
                            </label>
                        </div> {/* Status Toggle */}
                        <input
                            type="file"
                            className={styles.dialogInput}
                            onChange={handleImageChange} // Handle file input
                        />
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
