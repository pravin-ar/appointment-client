"use client";
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill'; // Import react-quill
import 'react-quill/dist/quill.snow.css'; // Import Quill theme
import './CustomQuillStyles.css'; // Import custom styles for headers
import styles from './ServiceCardText.module.css'; // Reuse the same dialog styles from the product page

export default function ServiceCardText() {
    const [services, setServices] = useState([]);
    const [editingService, setEditingService] = useState(null); // Track the current service being edited
    const [serviceName, setServiceName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Y');
    const [info, setInfo] = useState(''); // Rich text info
    const [imageFile, setImageFile] = useState(null); // Single image file
    const [imageUrl, setImageUrl] = useState(''); // Existing image URL for display
    const [showDialog, setShowDialog] = useState(false); // Dialog visibility

    // Quill editor modules for toolbar configuration
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['link', 'image'], // Basic options
            ['clean'] // Remove formatting button
        ]
    };

    const formats = [
        'header', 'list', 'bullet', 'bold', 'italic', 'underline', 'link', 'image'
    ];

    useEffect(() => {
        fetchServices();
    }, []);

    // Fetch services from the API
    const fetchServices = async () => {
        try {
            const response = await fetch('/api/service-card-text');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Handle editing a service
    const handleEdit = (service) => {
        setEditingService(service); // Set the current service to edit
        setServiceName(service.name);
        setDescription(service.description);
        setStatus(service.status || 'Y');
        setInfo(service.info || ''); // Set rich text info
        setImageUrl(service.image_url); // Set existing image URL
        setShowDialog(true); // Open the dialog
    };

    // Handle saving the service
    const handleSave = async () => {
        try {
            const formData = new FormData();
            if (editingService) {
                formData.append('id', editingService.id);
            }
            formData.append('name', serviceName);
            formData.append('description', description);
            formData.append('status', status);
            formData.append('info', info); // Send rich text (HTML) content

            if (imageFile) {
                formData.append('file', imageFile);
            }

            const response = await fetch('/api/service-card-text', {
                method: editingService ? 'PUT' : 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save service');
            }

            setEditingService(null);
            setShowDialog(false);
            fetchServices(); // Refresh service list
        } catch (error) {
            console.error('Error saving service:', error);
        }
    };

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file); // Store the image file
        setImageUrl(URL.createObjectURL(file)); // Preview the uploaded image
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
                            <p className="card-description">{service.description}</p>
                            <p className="card-info">Info: <div dangerouslySetInnerHTML={{ __html: service.info || 'N/A' }} /></p>
                            <p className="card-status">Status: {service.status || 'Y'}</p>
                            <footer className="card-footer">
                                <button className="btn edit-btn" onClick={() => handleEdit(service)}>Edit</button>
                            </footer>
                        </article>
                    ))
                ) : (
                    <p>No services available.</p>
                )}
            </div>

            <div className="add-card-container">
                <button className="btn add-btn" onClick={() => { setShowDialog(true); setServiceName(''); setDescription(''); setStatus('Y'); setInfo(''); setImageFile(null); }}>
                    Add Service
                </button>
            </div>

            {showDialog && (
                <div className={styles.dialogOverlay}>
                    <div className={styles.dialog}>
                        <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                        <input
                            type="text"
                            className={styles.dialogInput}
                            name="serviceName"
                            value={serviceName}
                            placeholder="Enter Service Name"
                            onChange={(e) => setServiceName(e.target.value)}
                        />
                        <textarea
                            className={styles.dialogInput}
                            name="description"
                            value={description}
                            placeholder="Enter Service Description"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <select
                            className={styles.dialogInput}
                            name="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Y">Active</option>
                            <option value="N">Inactive</option>
                        </select>
                        <ReactQuill
                            value={info}
                            onChange={setInfo}
                            modules={modules}
                            formats={formats}
                            className={styles.dialogInput}
                            placeholder="Enter Additional Info"
                        />
                        <div className={styles.dialogInput}>
                            {imageUrl && <img src={imageUrl} alt="Service" style={{ width: '100px', marginBottom: '10px' }} />}
                            <input
                                type="file"
                                onChange={handleImageChange}
                            />
                        </div>
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
