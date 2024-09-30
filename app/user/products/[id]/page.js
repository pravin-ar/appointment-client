// app/user/products/[id]/page.js
"use client";
import { useEffect, useState } from 'react';
import Footer from '../../../components/Footer'; // Import the Footer component
import NavbarProducts from '../../../components/NavbarProducts'; // Import Navbar component
import styles from './ProductDetail.module.css'; // Assume we create some styles

export default function ProductDetailPage ({ params }) {
    const { id } = params;
    const [product, setProduct] = useState(null);
    const [currentLargeImage, setCurrentLargeImage] = useState(null); // State for the large image

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`);
                const data = await response.json();
                setProduct(data);
                setCurrentLargeImage(data.image_urls[0]?.path); // Set initial large image if available
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (!product) return <div>Loading...</div>;

    // Handle Thumbnail Click (to change large image)
    const handleThumbnailClick = (imagePath) => {
        setCurrentLargeImage(imagePath); // Update the large image when a thumbnail is clicked
    };

    return (
        <>
            <NavbarProducts /> {/* Include the Navbar separately here */}
            <div className={styles.productDetailPage}>
                <div className={styles.modalLeft}>
                    {/* Large Image */}
                    {currentLargeImage ? (
                        <img
                            src={currentLargeImage}
                            alt={product.name}
                            className={styles.largeImage}
                        />
                    ) : (
                        <div>No image available</div>
                    )}

                    {/* Thumbnails */}
                    {product.image_urls && product.image_urls.length > 0 && (
                        <div className={styles.thumbnailContainer}>
                            {product.image_urls.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.path}
                                    alt={`Thumbnail ${index}`}
                                    className={styles.thumbnailImage}
                                    onClick={() => handleThumbnailClick(img.path)} // On click, change the large image
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side Product Info */}
                <div className={styles.modalRight}>
                    <h2>{product.name}</h2>
                    <p className={styles.productPrice}>£{product.price}</p>
                    <p>{product.description}</p>
                </div>
            </div>
            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
