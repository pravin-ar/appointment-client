"use client";
import { useEffect, useState } from 'react';

export default function ProductCardText() {
    const [products, setProducts] = useState([]);
    const [editing, setEditing] = useState(null);
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState(''); 
    const [productName, setProductName] = useState(''); 
    const [showDialog, setShowDialog] = useState(false); // State to control the visibility of the dialog

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch product card text data from the API
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();

            console.log('Received Data:', data);

            if (data && data.length > 0) {
                setProducts(data);
            } else {
                console.warn('No product card data found.');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Handle editing mode and setting description, image URL, and product name
    const handleEdit = (product) => {
        setEditing(product.id);
        setDescription(product.description);
        setImageUrl(product.image_url);
        setProductName(product.product_name); 
    };

    // Save updated product name, description, and image URL to the database
    const handleSave = async (id) => {
        try {
            const response = await fetch('/api/products', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, product_name: productName, description, image_url: imageUrl }), 
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

    // Function to add a new product
    const handleAddProduct = async () => {
        try {
            const response = await fetch('/api/products', {
                method: 'POST', // Change method to POST for adding new data
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_name: productName, description, image_url: imageUrl }), // Data for the new product
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
        setImageUrl('');
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Product Descriptions</h1>
            <div className="card-container">
                {products.length > 0 ? (
                    products.map((product) => (
                        <article key={product.id} className="card">
                            <header className="card-header">
                                <h2 className="card-title">{product.product_name}</h2>
                                <img src={product.image_url} alt={product.product_name} className="card-image" /> {/* Display image */}
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
                                        value={imageUrl}
                                        placeholder="Enter Image URL"
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    /> {/* Image URL input */}
                                </>
                            ) : (
                                <p className="card-description">{product.description}</p>
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
                            value={imageUrl}
                            placeholder="Enter Image URL"
                            onChange={(e) => setImageUrl(e.target.value)}
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