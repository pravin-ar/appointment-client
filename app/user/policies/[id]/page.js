'use client'; // Make this a client component

import { useParams } from 'next/navigation'; // Use next/navigation for dynamic params
import { useEffect, useState } from 'react';
import Footer from '../../../components/Footer'; // Reuse the Footer
import NavbarHome from '../../../components/NavbarHome'; // Reuse the Navbar from About Us
import styles from '../../aboutus/AboutUsContent.module.css'; // Reuse the styles from About Us

export default function PolicyDetail() {
    const { id } = useParams(); // Get the policy ID from the URL
    const [policy, setPolicy] = useState(null);

    useEffect(() => {
        const fetchPolicy = async () => {
            if (id) {
                const res = await fetch(`/api/policies/${id}`);
                const data = await res.json();
                setPolicy(data);
            }
        };
        fetchPolicy();
    }, [id]);

    if (!policy) {
        return <p>Loading...</p>;
    }

    return (
        <>
            {/* Reuse the Navbar from About Us */}
            <NavbarHome />

            {/* Content section styled like About Us */}
            <div className={styles.container}>
                <div className={styles.contentBox}>
                    <h1 className={styles.title}>{policy.name}</h1>
                    <p className={styles.text}>{policy.description}</p>
                </div>
            </div>

            {/* Reuse the Footer */}
            <Footer />
        </>
    );
}
