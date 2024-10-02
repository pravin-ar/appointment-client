// app/policy/page.js
"use client"; // Ensures this is a Client Component

import { useEffect, useState } from 'react';
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarHome from '../../components/NavbarHome';
import styles from './PolicyContent.module.css';

export default function PolicyPage() {
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedInfo = sessionStorage.getItem('policyInfo');

        if (storedInfo) {
            setInfo(storedInfo);
            setLoading(false);
        } else {
            fetchPolicyContent();
        }
    }, []);

    const fetchPolicyContent = async () => {
        try {
            const response = await fetch('/api/policy');
            const data = await response.json();
            if (data && data.info) {
                setInfo(data.info);
                sessionStorage.setItem('policyInfo', data.info); // Store in sessionStorage
            }
        } catch (error) {
            console.error('Error fetching Policy content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            {/* Navbar of Policy */}
            <NavbarHome />

            {/* Content of the Policy page */}
            <div className={styles.container}>
                <div className={styles.contentBox}>
                    <h1 className={styles.title}>Our Policy</h1>
                    <div
                        className={styles.text}
                        dangerouslySetInnerHTML={{ __html: info }}
                    />
                </div>
            </div>

            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
