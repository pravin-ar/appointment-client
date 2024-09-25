// admin/app/service-card-text/page.js
"use client";
import { useEffect, useState } from 'react';

export default function ServiceCardText() {
    const [services, setServices] = useState([]);
    const [editing, setEditing] = useState(null);
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [status, setStatus] = useState('Y'); // New state for status
    const [info, setInfo] = useState(''); // New state for info
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    // Fetch service card text data from the API
    const fetchServices = async () => {
        try {
            console.log('Fetching service card data...');
            const response = await fetch('/api/service-card-text');
            const data = await response.json();
            console.log('Received service data:', data);

            if (data && data.length > 0) {
                setServices(data);
            } else {
                console.warn('No service card data found.');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Handle editing mode and setting fields
    const handleEdit = (service) => {
        console.log('Editing service:', service);
        setEditing(service.id); // Set editing mode to the service ID
        setDescription(service.description);
        setImageUrl(service.image_url);
        setServiceName(service.name);
        setStatus(service.status || 'Y'); // Set status
        setInfo(service.info || ''); // Set info
    };

    // Save or update service data and upload image to S3
    const handleSave = async (id) => {
        try {
            console.log('Saving service with ID:', id);
            const formData = new FormData();
            formData.append('id', id); // Ensure the ID is passed when editing
            formData.append('name', serviceName);
            formData.append('description', description);
            formData.append('status', status); // Append status
            formData.append('info', info); // Append info

            if (imageFile) {
                formData.append('file', imageFile); // Append the file directly
                console.log('Attached image file:', imageFile);
            }

            const response = await fetch('/api/service-card-text', {
                method: id ? 'PUT' : 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save service');
            }

            console.log('Service saved successfully:', id);
            setEditing(null);
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
        }
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        console.log('Selected image file:', file);
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Service Descriptions</h1>
            <div className="card-container">
                {services.length > 0 ? (
                    services.map((service) => (
                        <article key={service.id} className="card">
                            <header className="card-header">
                                <h2 className="card-title">{service.name}</h2>
                                <img src={service.image_url} alt={service.name} className="card-image" />
                            </header>
                            {editing === service.id ? (
                                <>
                                    <input
                                        type="text"
                                        className="card-input"
                                        value={serviceName}
                                        placeholder="Enter Service Name"
                                        onChange={(e) => setServiceName(e.target.value)}
                                    />
                                    <textarea
                                        className="card-input"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    <select
                                        className="card-input"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Y">Y</option>
                                        <option value="N">N</option>
                                    </select> {/* Dropdown for status */}
                                    <textarea
                                        className="card-input"
                                        value={info}
                                        placeholder="Enter Additional Info (optional)"
                                        onChange={(e) => setInfo(e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        className="card-input"
                                        onChange={handleImageChange}
                                    /> {/* Image upload */}
                                </>
                            ) : (
                                <>
                                    <p className="card-description">{service.description}</p>
                                    <p className="card-info">Info: {service.info || 'N/A'}</p> {/* Display info */}
                                    <p className="card-status">Status: {service.status || 'Y'}</p> {/* Display status */}
                                </>
                            )}
                            <footer className="card-footer">
                                {editing === service.id ? (
                                    <button className="btn save-btn" onClick={() => handleSave(service.id)}>Save</button>
                                ) : (
                                    <button className="btn edit-btn" onClick={() => handleEdit(service)}>Edit</button>
                                )}
                            </footer>
                        </article>
                    ))
                ) : (
                    <p>No services available.</p>
                )}
            </div>
            <div className="add-card-container">
                <button className="btn add-btn" onClick={() => { setShowDialog(true); setServiceName(''); setDescription(''); setImageFile(null); setStatus('Y'); setInfo(''); }}>
                    Add Card
                </button>
            </div>
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>Add New Service</h2>
                        <input
                            type="text"
                            className="dialog-input"
                            value={serviceName}
                            placeholder="Enter Service Name"
                            onChange={(e) => setServiceName(e.target.value)}
                        />
                        <textarea
                            className="dialog-input"
                            value={description}
                            placeholder="Enter Service Description"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <select
                            className="dialog-input"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Y">Y</option>
                            <option value="N">N</option>
                        </select> {/* Dropdown for status */}
                        <textarea
                            className="dialog-input"
                            value={info}
                            placeholder="Enter Additional Info (optional)"
                            onChange={(e) => setInfo(e.target.value)}
                        />
                        <input
                            type="file"
                            className="dialog-input"
                            onChange={handleImageChange}
                        />
                        <div className="dialog-footer">
                            <button className="btn save-btn" onClick={() => { handleSave(null); setShowDialog(false); }}>Save</button>
                            <button className="btn cancel-btn" onClick={() => setShowDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
