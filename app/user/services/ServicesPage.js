"use client";
import Head from 'next/head'; // Import Next.js Head for dynamic meta tag injection
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
            setSelectedService(parsedServices[0]); // Default to first service
        } else {
            fetchServices();
        }
    }, []);

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
                title: service.meta_data?.title || 'title',
            }));

            setServices(formattedServices);
            sessionStorage.setItem('servicesData', JSON.stringify(formattedServices));
            setSelectedService(formattedServices[0]); // Default to first service
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Handle service selection and dynamically inject meta tags
    const handleServiceSelect = (service) => {
        setSelectedService(service);
        // No URL change, just dynamically updating the meta tags
    };

    return (
        <div className={styles.servicesPage}>
            {selectedService && (
                <Head>
                    <title>{selectedService.name}</title>
                    <meta name="description" content={selectedService.description} />
                    <meta name="keywords" content={selectedService.keywords} />
                </Head>
            )}

            <div className={styles.serviceDetail}>
                {selectedService ? (
                    <>
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
                    </>
                ) : (
                    <p>No service selected.</p>
                )}
            </div>

            <div className={styles.servicesSectionWrapper}>
                <div className={styles.servicesContainer}>
                    <ServicesSection services={services} onReadMore={handleServiceSelect} />
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
