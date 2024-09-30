// app/aboutus/page.js
"use client"; // Ensures this is a Client Component

import { useEffect, useState } from 'react';
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarAboutUs from '../../components/NavbarAboutUs'; // Adjusted the import path
import styles from './AboutUsContent.module.css';

export default function AboutUsPage() {
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedInfo = sessionStorage.getItem('aboutUsInfo');

        if (storedInfo) {
            setInfo(storedInfo);
            setLoading(false);
        } else {
            fetchAboutUsContent();
        }
    }, []);

    const fetchAboutUsContent = async () => {
        try {
            const response = await fetch('/api/aboutus');
            const data = await response.json();
            if (data && data.info) {
                setInfo(data.info);
                sessionStorage.setItem('aboutUsInfo', data.info); // Store in sessionStorage
            }
        } catch (error) {
            console.error('Error fetching About Us content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            {/* Navbar of About Us */}
            <NavbarAboutUs />

            {/* Content of the About Us page */}
            <div className={styles.container}>
                <div className={styles.contentBox}>
                    <h1 className={styles.title}>About us</h1>
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
