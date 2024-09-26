// app/services/ServicesSection.js
import { useRef } from 'react';
import styles from '../components/ServicesSection.module.css';

const ServicesSection = ({ services, onReadMore }) => {
    const containerRef = useRef(null);

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
                                    <button className={styles.readMoreBtn} onClick={() => onReadMore(service)}>Read More</button>
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
