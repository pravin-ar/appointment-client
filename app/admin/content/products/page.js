"use client";
import { useEffect, useState } from 'react';

export default function ProductCardText() {
    const [products, setProducts] = useState([]);
    const [editing, setEditing] = useState(null);
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null); // Handle file uploads
    const [productName, setProductName] = useState(''); 
    const [status, setStatus] = useState(''); // Added for status column
    const [showDialog, setShowDialog] = useState(false); // Control the dialog visibility

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch product data from the API
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            console.log('Received Data:', data);

            if (data && data.length > 0) {
                setProducts(data);
            } else {
                console.warn('No product data found.');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Handle editing mode and setting fields
    const handleEdit = (product) => {
        setEditing(product.id);
        setDescription(product.description);
        setProductName(product.name); 
        setStatus(product.status); // Set the status field
        setImageFile(null); // Reset image file on edit
    };

    // Save updated product details and image file to the database
    const handleSave = async (id) => {
        try {
            const formData = new FormData(); // Using FormData to handle file uploads
            formData.append('id', id);
            formData.append('name', productName);
            formData.append('description', description);
            formData.append('status', status); // Append status field
            if (imageFile) {
                formData.append('file', imageFile); // Append the file directly
                console.log('Attached image file:', imageFile);
            }

            const response = await fetch('/api/products', {
                method: 'PUT',
                body: formData, // Use FormData as the request body
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            setEditing(null);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        console.log('Selected image file:', file);
    };

    // Function to add a new product
    const handleAddProduct = async () => {
        try {
            const formData = new FormData(); // Using FormData to handle file uploads
            formData.append('name', productName);
            formData.append('description', description);
            formData.append('status', status); // Append status field
            if (imageFile) {
                formData.append('file', imageFile); // Append the file directly
            }

            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData, // Use FormData as the request body
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            setShowDialog(false); // Close the dialog
            fetchProducts(); // Refresh the data after adding a new product
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    // Function to reset dialog fields
    const resetDialogFields = () => {
        setProductName('');
        setDescription('');
        setStatus(''); // Reset status input field
        setImageFile(null); // Reset file input field
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
                            {editing === product.id ? (
                                <>
                                    <input
                                        type="text"
                                        className="card-input"
                                        value={productName}
                                        placeholder="Enter Product Name"
                                        onChange={(e) => setProductName(e.target.value)}
                                    /> {/* Product Name input */}
                                    <textarea
                                        className="card-input"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="card-input"
                                        value={status}
                                        placeholder="Enter Status"
                                        onChange={(e) => setStatus(e.target.value)}
                                    /> {/* Status input */}
                                    <input
                                        type="file"
                                        className="card-input"
                                        onChange={handleImageChange} // Handle file input
                                    /> {/* Image upload */}
                                </>
                            ) : (
                                <>
                                    <p className="card-description">{product.description}</p>
                                    <p className="card-status"><strong>Status: </strong>{product.status}</p> {/* Display status */}
                                </>
                            )}
                            <footer className="card-footer">
                                {editing === product.id ? (
                                    <button className="btn save-btn" onClick={() => handleSave(product.id)}>Save</button>
                                ) : (
                                    <button className="btn edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                                )}
                            </footer>
                        </article>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>
            {/* Add Card Button */}
            <div className="add-card-container">
                <button className="btn add-btn" onClick={() => { setShowDialog(true); resetDialogFields(); }}>
                    Add Product
                </button>
            </div>
            {/* Add Card Dialog */}
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>Add New Product</h2>
                        <input
                            type="text"
                            className="dialog-input"
                            value={productName}
                            placeholder="Enter Product Name"
                            onChange={(e) => setProductName(e.target.value)}
                        />
                        <textarea
                            className="dialog-input"
                            value={description}
                            placeholder="Enter Product Description"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <input
                            type="text"
                            className="dialog-input"
                            value={status}
                            placeholder="Enter Status"
                            onChange={(e) => setStatus(e.target.value)}
                        /> {/* Status input */}
                        <input
                            type="file"
                            className="dialog-input"
                            onChange={handleImageChange} // Handle file input
                        />
                        <div className="dialog-footer">
                            <button className="btn save-btn" onClick={handleAddProduct}>Save</button>
                            <button className="btn cancel-btn" onClick={() => setShowDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
