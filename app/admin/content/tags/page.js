"use client";
import { useEffect, useState } from 'react';

export default function ProductCategoryPage() {
    const [frames, setFrames] = useState([]); // State for managing frames
    const [sizes, setSizes] = useState([]); // State for managing sizes
    const [offers, setOffers] = useState([]); // State for managing offer tags
    const [currentFrame, setCurrentFrame] = useState(null); // State for editing current frame
    const [currentSize, setCurrentSize] = useState(null); // State for editing current size
    const [currentOffer, setCurrentOffer] = useState(null); // State for editing current offer
    const [newFrame, setNewFrame] = useState(''); // State for new frame
    const [newSize, setNewSize] = useState(''); // State for new size
    const [newOffer, setNewOffer] = useState(''); // State for new offer tag
    const [showDialog, setShowDialog] = useState(false); // State for showing/hiding dialog
    const [dialogType, setDialogType] = useState(''); // To differentiate between frame, size, and offer dialog
    const [errorMessage, setErrorMessage] = useState(''); // State for displaying error messages

    useEffect(() => {
        fetchFrames();
        fetchSizes();
        fetchOffers(); // Fetch offer tags
    }, []);

    // Fetch frames from the API
    const fetchFrames = async () => {
        try {
            const response = await fetch('/api/tags?category=product-frames');
            const data = await response.json();
            setFrames(data);
        } catch (error) {
            console.error('Error fetching frames:', error);
        }
    };

    // Fetch sizes from the API
    const fetchSizes = async () => {
        try {
            const response = await fetch('/api/tags?category=product-size');
            const data = await response.json();
            setSizes(data);
        } catch (error) {
            console.error('Error fetching sizes:', error);
        }
    };

    // Fetch offers from the API
    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/tags?category=offer-tags');
            const data = await response.json();
            setOffers(data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    // Handle opening dialog for adding a new frame
    const handleAddFrame = () => {
        setShowDialog(true);
        setDialogType('frame');
        setCurrentFrame(null);
        setNewFrame('');
        setErrorMessage('');
    };

    // Handle opening dialog for editing an existing frame
    const handleEditFrame = (frame) => {
        setShowDialog(true);
        setDialogType('frame');
        setCurrentFrame(frame);
        setNewFrame(frame.info); // Pre-fill the frame info
        setErrorMessage('');
    };

    // Handle opening dialog for adding a new size
    const handleAddSize = () => {
        setShowDialog(true);
        setDialogType('size');
        setCurrentSize(null);
        setNewSize('');
        setErrorMessage('');
    };

    // Handle opening dialog for editing an existing size
    const handleEditSize = (size) => {
        setShowDialog(true);
        setDialogType('size');
        setCurrentSize(size);
        setNewSize(size.info); // Pre-fill the size info
        setErrorMessage('');
    };

    // Handle opening dialog for adding a new offer
    const handleAddOffer = () => {
        setShowDialog(true);
        setDialogType('offer');
        setCurrentOffer(null);
        setNewOffer('');
        setErrorMessage('');
    };

    // Handle opening dialog for editing an existing offer
    const handleEditOffer = (offer) => {
        setShowDialog(true);
        setDialogType('offer');
        setCurrentOffer(offer);
        setNewOffer(offer.info); // Pre-fill the offer info
        setErrorMessage('');
    };

    // Save or update frame
    const handleSaveFrame = async () => {
        if (!newFrame.trim()) {
            setErrorMessage('Frame name is required.');
            return;
        }

        try {
            setErrorMessage('');
            const formData = new FormData();
            formData.append('info', newFrame); // Append frame info
            formData.append('category', 'product-frames'); // Category for frames

            let url = '/api/tags';
            let method = 'POST';

            if (currentFrame) {
                // If editing, use PUT method
                url = `/api/tags?id=${currentFrame.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save frame');
            }

            setShowDialog(false);
            setNewFrame(''); // Reset frame input
            fetchFrames(); // Refresh the data after saving
        } catch (error) {
            console.error('Error saving frame:', error);
            setErrorMessage('Failed to save frame. Please try again.');
        }
    };

    // Save or update size
    const handleSaveSize = async () => {
        if (!newSize.trim()) {
            setErrorMessage('Size is required.');
            return;
        }

        try {
            setErrorMessage('');
            const formData = new FormData();
            formData.append('info', newSize); // Append size info
            formData.append('category', 'product-size'); // Category for sizes

            let url = '/api/tags';
            let method = 'POST';

            if (currentSize) {
                // If editing, use PUT method
                url = `/api/tags?id=${currentSize.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save size');
            }

            setShowDialog(false);
            setNewSize(''); // Reset size input
            fetchSizes(); // Refresh the data after saving
        } catch (error) {
            console.error('Error saving size:', error);
            setErrorMessage('Failed to save size. Please try again.');
        }
    };

    // Save or update offer
    const handleSaveOffer = async () => {
        if (!newOffer.trim()) {
            setErrorMessage('Offer tag is required.');
            return;
        }

        try {
            setErrorMessage('');
            const formData = new FormData();
            formData.append('info', newOffer); // Append offer info
            formData.append('category', 'offer-tags'); // Category for offers

            let url = '/api/tags';
            let method = 'POST';

            if (currentOffer) {
                // If editing, use PUT method
                url = `/api/tags?id=${currentOffer.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save offer tag');
            }

            setShowDialog(false);
            setNewOffer(''); // Reset offer input
            fetchOffers(); // Refresh the data after saving
        } catch (error) {
            console.error('Error saving offer tag:', error);
            setErrorMessage('Failed to save offer tag. Please try again.');
        }
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Manage Product Categories</h1>
            <div className="category-container">
                {/* Left side - Manage Frames */}
                <div className="frames-section">
                    <h2>Frames</h2>
                    <div className="card-container">
                        {frames.length > 0 ? (
                            frames.map((frame) => (
                                <article key={frame.id} className="card">
                                    <header className="card-header">
                                        <h2 className="card-title">{frame.info}</h2>
                                    </header>
                                    <footer className="card-footer">
                                        <button className="btn edit-btn" onClick={() => handleEditFrame(frame)}>Edit</button>
                                    </footer>
                                </article>
                            ))
                        ) : (
                            <p>No frames available.</p>
                        )}
                    </div>
                    <button className="btn add-btn" onClick={handleAddFrame}>
                        Add Frame
                    </button>
                </div>

                {/* Right side - Manage Sizes */}
                <div className="sizes-section">
                    <h2>Sizes</h2>
                    <div className="card-container">
                        {sizes.length > 0 ? (
                            sizes.map((size) => (
                                <article key={size.id} className="card">
                                    <header className="card-header">
                                        <h2 className="card-title">{size.info}</h2>
                                    </header>
                                    <footer className="card-footer">
                                        <button className="btn edit-btn" onClick={() => handleEditSize(size)}>Edit</button>
                                    </footer>
                                </article>
                            ))
                        ) : (
                            <p>No sizes available.</p>
                        )}
                    </div>
                    <button className="btn add-btn" onClick={handleAddSize}>
                        Add Size
                    </button>
                </div>

                {/* Offer Section - Manage Offer Tags */}
                <div className="offers-section">
                    <h2>Offer Tags</h2>
                    <div className="card-container">
                        {offers.length > 0 ? (
                            offers.map((offer) => (
                                <article key={offer.id} className="card">
                                    <header className="card-header">
                                        <h2 className="card-title">{offer.info}</h2>
                                    </header>
                                    <footer className="card-footer">
                                        <button className="btn edit-btn" onClick={() => handleEditOffer(offer)}>Edit</button>
                                    </footer>
                                </article>
                            ))
                        ) : (
                            <p>No offer tags available.</p>
                        )}
                    </div>
                    <button className="btn add-btn" onClick={handleAddOffer}>
                        Add Offer Tag
                    </button>
                </div>
            </div>

            {/* Add/Edit Frame/Size/Offer Dialog */}
            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>{dialogType === 'frame' ? (currentFrame ? 'Edit Frame' : 'Add New Frame') : (dialogType === 'size' ? (currentSize ? 'Edit Size' : 'Add New Size') : (currentOffer ? 'Edit Offer Tag' : 'Add New Offer Tag'))}</h2>
                        <input
                            type="text"
                            className="dialog-input"
                            value={dialogType === 'frame' ? newFrame : (dialogType === 'size' ? newSize : newOffer)}
                            placeholder={`Enter ${dialogType === 'frame' ? 'Frame' : (dialogType === 'size' ? 'Size' : 'Offer Tag')}`}
                            onChange={(e) => dialogType === 'frame' ? setNewFrame(e.target.value) : (dialogType === 'size' ? setNewSize(e.target.value) : setNewOffer(e.target.value))}
                        />
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        <div className="dialog-footer">
                            <button className="btn save-btn" onClick={dialogType === 'frame' ? handleSaveFrame : (dialogType === 'size' ? handleSaveSize : handleSaveOffer)}>Save</button>
                            <button className="btn cancel-btn" onClick={() => setShowDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
