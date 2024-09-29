'use client';

import { useState } from 'react';

const AdminPolicies = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('/api/policies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description }),
        });

        const data = await res.json();
        if (res.ok) {
            setMessage('Policy added successfully');
            setName('');
            setDescription('');
        } else {
            setMessage(`Error: ${data.error}`);
        }
    };

    return (
        <section className="admin-panel">
            <h1 className="panel-title">Add Policy</h1>
            <form className="card-container" onSubmit={handleSubmit}>
                <div className="card-input-container">
                    <label className="card-label">Policy Name</label>
                    <input
                        type="text"
                        className="card-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="card-input-container">
                    <label className="card-label">Policy Description</label>
                    <textarea
                        className="card-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn save-btn">Add Policy</button>
            </form>
            {message && <p className="message">{message}</p>}
        </section>
    );
};

export default AdminPolicies;
