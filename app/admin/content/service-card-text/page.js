"use client";
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill'; // Import react-quill
import 'react-quill/dist/quill.snow.css'; // Import Quill theme
import './CustomQuillStyles.css'; // Import custom styles for headers

export default function ServiceCardText() {
    const [services, setServices] = useState([]);
    const [editing, setEditing] = useState(null);
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [status, setStatus] = useState('Y');
    const [info, setInfo] = useState(''); // New state for info (rich text)
    const [showDialog, setShowDialog] = useState(false);

    // Quill editor modules for toolbar configuration
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'], // Removed color options
            ['link', 'image'], // Basic options
            ['clean'] // Remove formatting button
        ]
    };

    // Formats supported by the Quill editor
    const formats = [
        'header', 'list', 'bullet', 'bold', 'italic', 'underline', 'link', 'image'
    ];

    useEffect(() => {
        fetchServices();
    }, []);

    // Fetch service card text data from the API
    const fetchServices = async () => {
        try {
            const response = await fetch('/api/service-card-text');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Handle editing mode and setting fields
    const handleEdit = (service) => {
        setEditing(service.id);
        setDescription(service.description);
        setImageUrl(service.image_url);
        setServiceName(service.name);
        setStatus(service.status || 'Y');
        setInfo(service.info || ''); // Set rich text info
    };

    // Save or update service data and upload image to S3
    const handleSave = async (id) => {
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('name', serviceName);
            formData.append('description', description);
            formData.append('status', status);
            formData.append('info', info); // Send rich text (HTML) content

            if (imageFile) {
                formData.append('file', imageFile);
            }

            const response = await fetch('/api/service-card-text', {
                method: id ? 'PUT' : 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save service');
            }

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
                                    </select>

                                    {/* ReactQuill for Additional Info without color options */}
                                    <ReactQuill
                                        value={info}
                                        onChange={setInfo}
                                        modules={modules} // Updated modules without color options
                                        formats={formats} // Updated formats without color options
                                        className="card-input"
                                        placeholder="Enter Additional Info"
                                    />

                                    <input
                                        type="file"
                                        className="card-input"
                                        onChange={handleImageChange}
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="card-description">{service.description}</p>
                                    <p className="card-info">Info: <div dangerouslySetInnerHTML={{ __html: service.info || 'N/A' }} /></p> {/* Render HTML content */}
                                    <p className="card-status">Status: {service.status || 'Y'}</p>
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
                        </select>

                        {/* ReactQuill in Dialog for Info without color options */}
                        <ReactQuill
                            value={info}
                            onChange={setInfo}
                            modules={modules} // Updated modules without color options
                            formats={formats} // Updated formats without color options
                            className="dialog-input"
                            placeholder="Enter Additional Info"
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
