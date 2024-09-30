// app/services/ServicesPage.js
"use client";
import Link from 'next/link'; // Import Link component
import { useEffect, useState } from 'react';
import '../../admin/content/service-card-text/CustomQuillStyles.css'; // Import custom Quill styles
import styles from './ServicesPage.module.css';
import ServicesSection from './ServicesSection';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        const storedServices = sessionStorage.getItem('servicesData');

        if (storedServices) {
            const parsedServices = JSON.parse(storedServices);
            setServices(parsedServices);
            if (parsedServices.length > 0) {
                setSelectedService(parsedServices[0]);
            }
        } else {
            fetchServices();
        }
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/service-card-text');
            const data = await response.json();

            // Ensure 'info' field is included
            const formattedServices = data.map((service) => ({
                id: service.id,
                name: service.name,
                description: service.description,
                image_url: service.image_url,
                info: service.info, // Include the 'info' field
            }));

            setServices(formattedServices);
            if (formattedServices.length > 0) {
                setSelectedService(formattedServices[0]); // Set the first service as default
            }

            // Store services data in sessionStorage
            sessionStorage.setItem('servicesData', JSON.stringify(formattedServices));
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Handle "Read More" button click
    const handleReadMore = (service) => {
        setSelectedService(service);
    };

    return (
        <div className={styles.servicesPage}>
            <div className={styles.serviceDetail}>
                {selectedService ? (
                    <>
                        {/* Move Title Above Content */}
                        <h1 className={styles.detailTitle}>{selectedService.name}</h1>
                        <div className={styles.serviceDetailContent}>
                            <div className={styles.imageContainer}>
                                <img
                                    src={selectedService.image_url}
                                    alt={selectedService.name}
                                    className={styles.detailImage}
                                />
                            </div>
                            <div className={styles.textContent}>
                                <div
                                    className={`${styles.detailDescription} rendered-content`}
                                    dangerouslySetInnerHTML={{ __html: selectedService.description }}
                                />
                            </div>
                        </div>
                        {selectedService.info && (
                            <div className={styles.additionalInfo}>
                                <div
                                    className={`${styles.detailInfo} rendered-content`}
                                    dangerouslySetInnerHTML={{ __html: selectedService.info }}
                                />
                            </div>
                        )}
                        <div className={styles.buttonContainer}>
                            <Link href="/contact-us">
                                <button className={styles.bookButton}>Inquiry</button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <p>No service selected.</p>
                )}
            </div>
            <div className={styles.servicesSectionWrapper}>
                <div className={styles.servicesContainer}>
                    <ServicesSection services={services} onReadMore={handleReadMore} />
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
