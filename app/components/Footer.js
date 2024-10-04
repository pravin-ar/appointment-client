// app/components/Footer.js
'use client'; // Ensure this is a client component

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    const [services, setServices] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [footerInfo, setFooterInfo] = useState({
        description: '',
        email: '',
        website: '',
        address: '',
        number: '',
    });

    useEffect(() => {
        // Fetch service name
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/service-card-text');
                const data = await response.json();
    
                // Adjust the field names based on your actual data
                const formattedServices = data.map((service) => ({
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    image_url: service.image_url,
                    info: service.info, // Include the 'info' field
                    keywords: service.meta_data?.keywords || 'services, more details', // Include meta keywords
                }));
                setServices(formattedServices);
    
                // Store the services data in sessionStorage
                sessionStorage.setItem('servicesData', JSON.stringify(formattedServices));
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        const storedServices = sessionStorage.getItem('servicesData');

        if (storedServices) {
            setServices(JSON.parse(storedServices));
        } else {
            fetchServices();
        }

        // Fetch policies
        const storedPolicies = sessionStorage.getItem('policies');
        if (storedPolicies) {
            setPolicies(JSON.parse(storedPolicies));
        } else {
            const fetchPolicies = async () => {
                const res = await fetch('/api/policies');
                const data = await res.json();
                setPolicies(data);
                sessionStorage.setItem('policies', JSON.stringify(data)); // Store in sessionStorage
            };
            fetchPolicies();
        }

        // Fetch footer info
        const storedFooterInfo = sessionStorage.getItem('footerInfo');
        if (storedFooterInfo) {
            const data = JSON.parse(storedFooterInfo);
            setFooterInfo({
                description: data.description || '',
                email: data.email || '',
                website: data.website || '',
                address: data.address || '',
                number: data.number || '',
            });
        } else {
            const fetchFooterInfo = async () => {
                const res = await fetch('/api/footer-info');
                const data = await res.json();
                setFooterInfo({
                    description: data.description || '',
                    email: data.email || '',
                    website: data.website || '',
                    address: data.address || '',
                    number: data.number || '',
                });
                sessionStorage.setItem('footerInfo', JSON.stringify(data));
            };
            fetchFooterInfo();
        }
    }, []);

    const { description, email, website, address, number } = footerInfo;

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                {/* Left Section with Logo and Contact Information */}
                <div className={styles.footerLeft}>
                    <div className={styles.logo}>
                        <Image
                            src="/assets/images/keena_logo.png" // Replace with your logo path
                            alt="Keena Rakkado Logo"
                            width={203} // Adjust as necessary
                            height={57} // Adjust as necessary
                        />
                    </div>
                    {description && (
                        <p dangerouslySetInnerHTML={{ __html: description }} />
                    )}
                    <p className={styles.contactInfo}>
                        {address && (
                            <>
                                <strong>Address:</strong> {address}
                                <br />
                            </>
                        )}
                        {number && (
                            <>
                                <strong>Mob No:</strong> {number}
                                <br />
                            </>
                        )}
                        {email && (
                            <>
                                <strong>Email:</strong> {email}
                                <br />
                            </>
                        )}
                        {website && (
                            <>
                                <strong>Website:</strong>{' '}
                                <a href={website}>{website}</a>
                            </>
                        )}
                    </p>
                </div>

                {/* Navigation Section */}
                <div className={styles.footerCenter}>
                    <h3>Navigation</h3>
                    <ul>
                        <li><a href="/user/aboutus">About Us</a></li>
                        <li><a href="/user/faq">FAQ</a></li>
                        <li><a href="/user/contact-us">Contact Us</a></li>
                        <li><a href="/user/policy">Our Policy</a></li>
                    </ul>
                </div>

                {/* Services Section */}
                <div className={styles.footerCenter}>
                    <h3>Our Services</h3>
                    <ul>
                        {services.length > 0 ? (
                            services.map((service) => (
                                <li key={service.id}>
                                    <a href={`/user/services`}>{service.name}</a>
                                </li>
                            ))
                        ) : (
                            <p className={styles.noServicesText}>No services available.</p>
                        )}
                    </ul>
                </div>

                {/* Policies Section */}
                <div className={styles.footerRight}>
                    <h3>Policies</h3>
                    <ul>
                        {policies.map(policy => (
                            <li key={policy.id}>
                                <Link href={`/user/policies/${policy.id}`}>
                                    {policy.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
