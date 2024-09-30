// admin/aboutus/page.js

"use client";
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import Quill theme
import '../service-card-text/CustomQuillStyles.css'; // Import custom styles for headers
import styles from '../service-card-text/ServiceCardText.module.css'; // Reuse the same dialog styles

export default function AboutUsAdmin() {
    const [info, setInfo] = useState(''); // Rich text content
    const [existingEntry, setExistingEntry] = useState(false); // Track if an entry exists
    const [showDialog, setShowDialog] = useState(false); // Dialog visibility
    const [loading, setLoading] = useState(true); // Loading state

    // Quill editor modules for toolbar configuration
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['link', 'image'], // Basic options
            ['clean'], // Remove formatting button
        ],
    };

    const formats = [
        'header',
        'list',
        'bullet',
        'bold',
        'italic',
        'underline',
        'link',
        'image',
    ];

    useEffect(() => {
        fetchAboutUs();
    }, []);

    // Fetch existing About Us data
    const fetchAboutUs = async () => {
        try {
            const response = await fetch('/api/aboutus');
            const data = await response.json();
            if (data && data.info) {
                setInfo(data.info);
                setExistingEntry(true);
            }
        } catch (error) {
            console.error('Error fetching About Us data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle saving the About Us info
    const handleSave = async () => {
        try {
            const method = existingEntry ? 'PUT' : 'POST';
            const response = await fetch('/api/aboutus', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ info }),
            });

            if (!response.ok) {
                throw new Error('Failed to save About Us information');
            }

            alert('About Us information saved successfully.');
            setShowDialog(false);
            // Refresh the content after saving
            fetchAboutUs();
        } catch (error) {
            console.error('Error saving About Us information:', error);
            alert('Error saving About Us information. Please try again.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage About Us</h1>

            {/* Display the current About Us content */}
            <div className="card-container">
                <article className="card">
                    <header className="card-header">
                        <h2 className="card-title">Current About Us Content</h2>
                    </header>
                    <div className="card-description">
                        <div
                            dangerouslySetInnerHTML={{ __html: info }}
                        />
                    </div>
                    <footer className="card-footer">
                        <button
                            className="btn edit-btn"
                            onClick={() => setShowDialog(true)}
                        >
                            {existingEntry ? 'Edit About Us' : 'Add About Us'}
                        </button>
                    </footer>
                </article>
            </div>

            {/* Dialog for editing About Us content */}
            {showDialog && (
                <div className={styles.dialogOverlay}>
                    <div className={styles.dialog}>
                        <h2>{existingEntry ? 'Edit About Us' : 'Add About Us'}</h2>
                        <ReactQuill
                            value={info}
                            onChange={setInfo}
                            modules={modules}
                            formats={formats}
                            className={styles.dialogInput}
                            placeholder="Enter About Us Information"
                        />
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
