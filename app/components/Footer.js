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
        // Fetch services
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/service-card-text');
                const data = await response.json();

                const formattedServices = data.map((service) => ({
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    image_url: service.image_url,
                    info: service.info,
                    keywords: service.meta_data?.keywords || 'services, more details',
                }));
                setServices(formattedServices);
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
        const fetchPolicies = async () => {
            try {
                const res = await fetch('/api/policies');
                const data = await res.json();
                setPolicies(data);
                sessionStorage.setItem('policies', JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching policies:', error);
            }
        };

        const storedPolicies = sessionStorage.getItem('policies');
        if (storedPolicies) {
            setPolicies(JSON.parse(storedPolicies));
        } else {
            fetchPolicies();
        }

        // Fetch footer info
        const fetchFooterInfo = async () => {
            try {
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
            } catch (error) {
                console.error('Error fetching footer info:', error);
            }
        };

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
                            layout="fill" // Ensures the image fills the container
                            objectFit="contain"
                        />
                    </div>
                    {description && (
                        <p
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
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
                                <a href={website} target="_blank" rel="noopener noreferrer">
                                    {website}
                                </a>
                            </>
                        )}
                    </p>
                </div>

                {/* Navigation Section */}
                <div className={styles.footerCenter}>
                    <h3>Navigation</h3>
                    <ul>
                        <li>
                            <Link href="/user/aboutus">About Us</Link>
                        </li>
                        <li>
                            <Link href="/user/faq">FAQ</Link>
                        </li>
                        <li>
                            <Link href="/user/contact-us">Contact Us</Link>
                        </li>
                        <li>
                            <Link href="/user/policy">Our Policy</Link>
                        </li>
                    </ul>
                </div>

                {/* Services Section */}
                <div className={styles.footerCenter}>
                    <h3>Our Services</h3>
                    <ul>
                        {services.length > 0 ? (
                            services.map((service) => (
                                <li key={service.id}>
                                    <Link href={`/user/services/${service.id}`}>
                                        {service.name}
                                    </Link>
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
                        {policies.map((policy) => (
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
