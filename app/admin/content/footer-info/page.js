// admin/footer-info/page.js

"use client";
import { useEffect, useState } from 'react';
import styles from '../service-card-text/ServiceCardText.module.css'; // Reuse existing styles

export default function FooterInfoAdmin() {
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [number, setNumber] = useState('');
    const [existingEntry, setExistingEntry] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFooterInfo();
    }, []);

    // Fetch existing Footer Info data
    const fetchFooterInfo = async () => {
        try {
            const response = await fetch('/api/footer-info');
            const data = await response.json();
            if (data && (data.description || data.email || data.website || data.address || data.number)) {
                setDescription(data.description || '');
                setEmail(data.email || '');
                setWebsite(data.website || '');
                setAddress(data.address || '');
                setNumber(data.number || '');
                setExistingEntry(true);
            }
        } catch (error) {
            console.error('Error fetching Footer Info data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle saving the Footer Info
    const handleSave = async () => {
        try {
            const method = existingEntry ? 'PUT' : 'POST';
            const response = await fetch('/api/footer-info', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, email, website, address, number }),
            });

            if (!response.ok) {
                throw new Error('Failed to save Footer information');
            }

            alert('Footer information saved successfully.');
            setShowDialog(false);
            // Refresh the content after saving
            fetchFooterInfo();
        } catch (error) {
            console.error('Error saving Footer information:', error);
            alert('Error saving Footer information. Please try again.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Footer Information</h1>

            {/* Display the current Footer Information */}
            <div className="card-container">
                <article className="card">
                    <header className="card-header">
                        <h2 className="card-title">Current Footer Information</h2>
                    </header>
                    <div className="card-description">
                        <p><strong>Description:</strong></p>
                        <div dangerouslySetInnerHTML={{ __html: description }} />
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Website:</strong> {website}</p>
                        <p><strong>Address:</strong> {address}</p>
                        <p><strong>Number:</strong> {number}</p>
                    </div>
                    <footer className="card-footer">
                        <button
                            className="btn edit-btn"
                            onClick={() => setShowDialog(true)}
                        >
                            {existingEntry ? 'Edit Footer Information' : 'Add Footer Information'}
                        </button>
                    </footer>
                </article>
            </div>

            {/* Dialog for editing Footer Information */}
            {showDialog && (
                <div className={styles.dialogOverlay}>
                    <div className={styles.dialog}>
                        <h2>{existingEntry ? 'Edit Footer Information' : 'Add Footer Information'}</h2>
                        <label>
                            Description:
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.dialogInput}
                                placeholder="Enter Description"
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.dialogInput}
                                placeholder="Enter Email"
                            />
                        </label>
                        <label>
                            Website:
                            <input
                                type="text"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className={styles.dialogInput}
                                placeholder="Enter Website URL"
                            />
                        </label>
                        <label>
                            Address:
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={styles.dialogInput}
                                placeholder="Enter Address"
                            />
                        </label>
                        <label>
                            Number:
                            <input
                                type="text"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className={styles.dialogInput}
                                placeholder="Enter Number"
                            />
                        </label>
                        <div className={styles.dialogFooter}>
                            <button className="btn save-btn" onClick={handleSave}>
                                Save
                            </button>
                            <button
                                className="btn cancel-btn"
                                onClick={() => setShowDialog(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
