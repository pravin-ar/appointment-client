// app/products/ProductTypePage.js
"use client";
import { useEffect, useState } from 'react';

export default function ProductTypePage() {
    const [productTypes, setProductTypes] = useState([]);
    const [newProductType, setNewProductType] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchProductTypes();
    }, []);

    // Fetch product types from the API
    const fetchProductTypes = async () => {
        try {
            const response = await fetch('/api/product-type');
            const data = await response.json();
            console.log('Product Types:', data);
            setProductTypes(data);
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };

    // Add new product type to the database
    const handleAddProductType = async () => {
        try {
            const response = await fetch('/api/product-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: newProductType }),
            });

            if (!response.ok) {
                throw new Error('Failed to add product type');
            }

            setShowDialog(false);
            fetchProductTypes(); // Refresh the data after adding a new type
        } catch (error) {
            console.error('Error adding product type:', error);
        }
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Product Types</h1>
            <div className="card-container">
                {productTypes.length > 0 ? (
                    productTypes.map((type) => (
                        <article key={type.id} className="card">
                            <header className="card-header">
                                <h2 className="card-title">{type.type}</h2>
                            </header>
                        </article>
                    ))
                ) : (
                    <p>No product types available.</p>
                )}
            </div>
            {/* Add Product Type Button */}
            <div className="add-card-container">
                <button className="btn add-btn" onClick={() => { setShowDialog(true); setNewProductType(''); }}>
                    Add Product Type
                </button>
            </div>
            {/* Add Product Type Dialog */}
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>Add New Product Type</h2>
                        <input
                            type="text"
                            className="dialog-input"
                            value={newProductType}
                            placeholder="Enter Product Type"
                            onChange={(e) => setNewProductType(e.target.value)}
                        />
                        <div className="dialog-footer">
                            <button className="btn save-btn" onClick={handleAddProductType}>Save</button>
                            <button className="btn cancel-btn" onClick={() => setShowDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
