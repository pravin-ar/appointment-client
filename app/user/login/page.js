"use client"; // Ensures this is a Client Component
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Call API to check login credentials with plain text password
        const res = await fetch('/api/check-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password // Send plain text password
            }),
        });

        const data = await res.json();
        if (data.success) {
            // After a successful login, redirect to the admin page
            router.push('/admin');
        } else {
            alert("You are not admin.");
        }
    };

    return (
        <>
            <Head>
                <title>Login</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className="login-page">
                <section className="login-section">
                    <h2 className="section-title">Login</h2>
                    <form className="login-form" onSubmit={handleSubmit}>
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
                        <button type="submit" className="login-btn">Login</button>
                    </form>
                </section>
            </div>
        </>
    );
}
