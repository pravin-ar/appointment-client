"use client";
import { useEffect, useState } from 'react';

export default function ServiceCardText() {
    const [services, setServices] = useState([]);
    const [editing, setEditing] = useState(null);
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState(''); 
    const [serviceName, setServiceName] = useState(''); 
    const [showDialog, setShowDialog] = useState(false); // State to control the visibility of the dialog

    useEffect(() => {
        fetchServices();
    }, []);

    // Fetch service card text data from the API
    const fetchServices = async () => {
        try {
            const response = await fetch('/api/service-card-text');
            const data = await response.json();

            console.log('Received Data:', data);

            if (data && data.length > 0) {
                setServices(data);
            } else {
                console.warn('No service card data found.');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Handle editing mode and setting description, image URL, and service name
    const handleEdit = (service) => {
        setEditing(service.id);
        setDescription(service.description);
        setImageUrl(service.image_url);
        setServiceName(service.service_name); 
    };

    // Save updated service name, description, and image URL to the database
    const handleSave = async (id) => {
        try {
            const response = await fetch('/api/service-card-text', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, service_name: serviceName, description, image_url: imageUrl }), 
            });

            if (!response.ok) {
                throw new Error('Failed to update service');
            }

            setEditing(null);
            fetchServices(); 
        } catch (error) {
            console.error('Error saving service:', error);
        }
    };

    // Function to add a new service
    const handleAddService = async () => {
        try {
            const response = await fetch('/api/service-card-text', {
                method: 'POST', // Change method to POST for adding new data
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ service_name: serviceName, description, image_url: imageUrl }), // Data for the new service
            });

            if (!response.ok) {
                throw new Error('Failed to add service');
            }

            setShowDialog(false); // Close the dialog
            fetchServices(); // Refresh the data after adding a new service
        } catch (error) {
            console.error('Error adding service:', error);
        }
    };

    // Function to reset dialog fields
    const resetDialogFields = () => {
        setServiceName('');
        setDescription('');
        setImageUrl('');
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Service Descriptions</h1>
            <div className="card-container">
                {services.length > 0 ? (
                    services.map((service) => (
                        <article key={service.id} className="card">
                            <header className="card-header">
                                <h2 className="card-title">{service.service_name}</h2>
                                <img src={service.image_url} alt={service.service_name} className="card-image" /> {/* Display image */}
                            </header>
                            {editing === service.id ? (
                                <>
                                    <input
                                        type="text"
                                        className="card-input"
                                        value={serviceName}
                                        placeholder="Enter Service Name"
                                        onChange={(e) => setServiceName(e.target.value)}
                                    /> {/* Service Name input */}
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
                                <p className="card-description">{service.description}</p>
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
            {/* Add Card Button */}
            <div className="add-card-container">
                <button className="btn add-btn" onClick={() => { setShowDialog(true); resetDialogFields(); }}>
                    Add Card
                </button>
            </div>
            {/* Add Card Dialog */}
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
                        <input
                            type="text"
                            className="dialog-input"
                            value={imageUrl}
                            placeholder="Enter Image URL"
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <div className="dialog-footer">
                            <button className="btn save-btn" onClick={handleAddService}>Save</button>
                            <button className="btn cancel-btn" onClick={() => setShowDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
