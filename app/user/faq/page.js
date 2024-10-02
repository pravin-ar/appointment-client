// app/faq/page.js
"use client"; // Ensures this is a Client Component

import { useEffect, useState } from 'react';
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarHome from '../../components/NavbarHome';
import styles from './FAQContent.module.css';

export default function FAQPage() {
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedInfo = sessionStorage.getItem('faqInfo');

        if (storedInfo) {
            setInfo(storedInfo);
            setLoading(false);
        } else {
            fetchFAQContent();
        }
    }, []);

    const fetchFAQContent = async () => {
        try {
            const response = await fetch('/api/faq');
            const data = await response.json();
            if (data && data.info) {
                setInfo(data.info);
                sessionStorage.setItem('faqInfo', data.info); // Store in sessionStorage
            }
        } catch (error) {
            console.error('Error fetching FAQ content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            {/* Navbar of FAQ */}
            <NavbarHome />

            {/* Content of the FAQ page */}
            <div className={styles.container}>
                <div className={styles.contentBox}>
                    <h1 className={styles.title}>FAQ</h1>
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
