import { useEffect, useRef, useState } from 'react';
import styles from './ServicesSection.module.css';

const ServicesSection = () => {
    const [services, setServices] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const storedServices = sessionStorage.getItem('servicesData');

        if (storedServices) {
            setServices(JSON.parse(storedServices));
        } else {
            fetchServices();
        }
    }, []);

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
                icon: service.icon_url
            }));
            setServices(formattedServices);

            // Store the services data in sessionStorage
            sessionStorage.setItem('servicesData', JSON.stringify(formattedServices));
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Scroll handler for mouse drag functionality
    const handleMouseDrag = (e) => {
        e.preventDefault();
        if (containerRef.current) {
            containerRef.current.scrollLeft -= e.movementX; // Invert scroll direction
        }
    };

    // Track mouse state for drag scrolling
    const enableMouseDrag = () => {
        if (containerRef.current) {
            containerRef.current.addEventListener('mousemove', handleMouseDrag);
        }
    };

    const disableMouseDrag = () => {
        if (containerRef.current) {
            containerRef.current.removeEventListener('mousemove', handleMouseDrag);
        }
    };

    const handleNext = () => {
        if (containerRef.current) {
            const scrollAmount = containerRef.current.clientWidth;
            containerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handlePrev = () => {
        if (containerRef.current) {
            const scrollAmount = containerRef.current.clientWidth;
            containerRef.current.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section id="services" className={styles.servicesSection}>
            <h2 className={styles.sectionTitle}>Our Services</h2>
            <p className={styles.sectionDescription}>
                Welcome to our optician services, where your eye health and convenience are our priorities. We provide home visits, eyewear repairs, DVLA and diabetic screenings, and a wide range of contact lenses. Our dedicated team is here to deliver high-quality care right at your doorstep. Trust us to keep your vision clear and your eyewear in top shape!
            </p>
            <div className={styles.carouselContainer}>
                <button className={styles.prevButton} onClick={handlePrev}>
                    <span>&#8249;</span>
                </button>
                <div
                    className={styles.servicesContainer}
                    ref={containerRef}
                    onMouseDown={enableMouseDrag}
                    onMouseUp={disableMouseDrag}
                    onMouseLeave={disableMouseDrag}
                >
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service.id} className={styles.serviceCard}>
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className={styles.serviceImage}
                                    />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.serviceTitle}>{service.name}</h3>
                                    <p className={styles.serviceDescription}>{service.description}</p>
                                    <button className={styles.readMoreBtn}>Read More</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noServicesText}>No services available.</p>
                    )}
                </div>
                <button className={styles.nextButton} onClick={handleNext}>
                    <span>&#8250;</span>
                </button>
            </div>
        </section>
    );
};

export default ServicesSection;
