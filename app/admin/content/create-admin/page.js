'use client';

import Head from 'next/head';
import { useState } from 'react';

export default function CreateAdminPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Send data to the API endpoint
        const response = await fetch('/api/create-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
            setMessage('Admin created successfully!');
        } else {
            setMessage('Error creating admin.');
        }
    };

    return (
        <>
        <Head>
            <title>Create Admin</title>
            <link rel="stylesheet" href="/styles/styles.css" />
        </Head>
        <div className="login-page">
            <section className="login-section">
                <h2 className="section-title">Create Admin</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Enter full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">Create Admin</button>
                </form>
                {message && <p className="message">{message}</p>}
            </section>
        </div>
        </>
    );
}
