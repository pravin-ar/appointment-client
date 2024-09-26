"use client";
import { useEffect, useState } from 'react';

export default function ProductTypePage() {
    const [productTypes, setProductTypes] = useState([]);
    const [currentType, setCurrentType] = useState(null); // State for storing current editing type
    const [newProductType, setNewProductType] = useState('');
    const [imageFiles, setImageFiles] = useState([{ file: null, path: '' }]); // State for managing image files and paths
    const [showDialog, setShowDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // State for displaying error messages

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

    // Handle image file change
    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        setImageFiles((prev) => {
            const updatedFiles = [...prev];
            updatedFiles[index] = { ...updatedFiles[index], file, path: URL.createObjectURL(file) };
            return updatedFiles;
        });
    };

    // Open dialog for adding a new product type
    const handleAddProductType = () => {
        setShowDialog(true);
        setCurrentType(null); // No type is being edited
        setNewProductType('');
        setImageFiles([{ file: null, path: '' }]);
        setErrorMessage('');
    };

    // Open dialog for editing an existing product type
    const handleEditProductType = (type) => {
        setShowDialog(true);
        setCurrentType(type); // Set the current type to be edited
        setNewProductType(type.type); // Pre-fill with current type name
        setImageFiles([{ file: null, path: type.image_url || '' }]); // Pre-fill with existing image path
        setErrorMessage('');
    };

    // Save or update product type
    const handleSaveProductType = async () => {
        // Check if the type name is empty
        if (!newProductType.trim()) {
            setErrorMessage('Product type name is required.');
            return;
        }

        try {
            setErrorMessage(''); // Clear any previous error messages
            const formData = new FormData();
            formData.append('type', newProductType); // Append product type
            if (imageFiles[0].file) {
                formData.append('image', imageFiles[0].file); // Append image file if available
            }

            let url = '/api/product-type';
            let method = 'POST';

            if (currentType) {
                // If editing, use PUT method
                url = `/api/product-type?id=${currentType.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                body: formData, // Use FormData as the request body
            });

            if (!response.ok) {
                throw new Error('Failed to save product type');
            }

            setShowDialog(false);
            setNewProductType(''); // Reset product type input
            setImageFiles([{ file: null, path: '' }]); // Reset image input
            fetchProductTypes(); // Refresh the data after saving
        } catch (error) {
            console.error('Error saving product type:', error);
            setErrorMessage('Failed to save product type. Please try again.');
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
                                {type.image_url ? (
                                    <img src={type.image_url} alt={type.type} style={{ width: '100px', height: '100px' }} />
                                ) : (
                                    <p>No image available</p>
                                )}
                            </header>
                            <footer className="card-footer">
                                <button className="btn edit-btn" onClick={() => handleEditProductType(type)}>Edit</button>
                            </footer>
                        </article>
                    ))
                ) : (
                    <p>No product types available.</p>
                )}
            </div>
            {/* Add Product Type Button */}
            <div className="add-card-container">
                <button className="btn add-btn" onClick={handleAddProductType}>
                    Add Product Type
                </button>
            </div>
            {/* Add/Edit Product Type Dialog */}
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>{currentType ? 'Edit Product Type' : 'Add New Product Type'}</h2>
                        <input
                            type="text"
                            className="dialog-input"
                            value={newProductType}
                            placeholder="Enter Product Type"
                            onChange={(e) => setNewProductType(e.target.value)}
                        />
                        {/* Display existing or selected image */}
                        {imageFiles.map((imageObj, index) => (
                            <div key={index} className="dialog-input">
                                {imageObj.path && (
                                    <img src={imageObj.path} alt="Existing" style={{ width: '100px', marginBottom: '10px' }} />
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => handleImageChange(e, index)}
                                />
                            </div>
                        ))}
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message if any */}
                        <div className="dialog-footer">
                            <button className="btn save-btn" onClick={handleSaveProductType}>Save</button>
                            <button className="btn cancel-btn" onClick={() => setShowDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
