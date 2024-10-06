// app/admin/customer-reviews/page.js
"use client";
import { useEffect, useState } from 'react';
import styles from '../../content/service-card-text/ServiceCardText.module.css'; // Reusing the same styles

export default function CustomerReviews() {
    const [reviews, setReviews] = useState([]);
    const [editingReview, setEditingReview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [stars, setStars] = useState(5);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch('/api/customer-reviews');
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setName(review.name);
        setDescription(review.description);
        setStars(review.star);
        setImageUrl(review.image_url);
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!name || !description || !stars || (!imageFile && !editingReview)) {
            alert('Please fill in all fields');
            return;
        }
        try {
            const formData = new FormData();
            if (editingReview) {
                formData.append('id', editingReview.id);
            }
            formData.append('name', name);
            formData.append('description', description);
            formData.append('star', stars);

            if (imageFile) {
                formData.append('file', imageFile);
            }

            const response = await fetch('/api/customer-reviews', {
                method: editingReview ? 'PUT' : 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to save review');
                return;
            }

            setEditingReview(null);
            setShowDialog(false);
            fetchReviews();
        } catch (error) {
            console.error('Error saving review:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Customer Reviews</h1>
            <div className="card-container">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <article key={review.id} className="card">
                            <header className="card-header">
                                <h2 className="card-title">{review.name}</h2>
                                <img src={review.image_url} alt={review.name} className="card-image" />
                            </header>
                            <p className="card-description">{review.description}</p>
                            <p className="card-stars">Stars: {review.star}</p>
                            <footer className="card-footer">
                                <button className="btn edit-btn" onClick={() => handleEdit(review)}>Edit</button>
                            </footer>
                        </article>
                    ))
                ) : (
                    <p>No reviews available.</p>
                )}
            </div>

            <div className="add-card-container">
                {reviews.length < 3 ? (
                    <button className="btn add-btn" onClick={() => { 
                        setShowDialog(true); 
                        setName(''); 
                        setDescription(''); 
                        setStars(5); 
                        setImageFile(null); 
                        setImageUrl('');
                        setEditingReview(null);
                    }}>
                        Add Review
                    </button>
                ) : (
                    <p>You have reached the maximum number of reviews.</p>
                )}
            </div>

            {showDialog && (
                <div className={styles.dialogOverlay}>
                    <div className={styles.dialog}>
                        <h2>{editingReview ? 'Edit Review' : 'Add New Review'}</h2>
                        <input
                            type="text"
                            className={styles.dialogInput}
                            name="name"
                            value={name}
                            placeholder="Enter Customer Name"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <textarea
                            className={styles.dialogInput}
                            name="description"
                            value={description}
                            placeholder="Enter Review Description"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <select
                            className={styles.dialogInput}
                            name="stars"
                            value={stars}
                            onChange={(e) => setStars(e.target.value)}
                        >
                            {[1,2,3,4,5].map((num) => (
                                <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                        <div className={styles.dialogInput}>
                            {imageUrl && <img src={imageUrl} alt="Customer" style={{ width: '100px', marginBottom: '10px' }} />}
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
