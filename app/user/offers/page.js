// app/user/offers/page.js
"use client";
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarOffers from '../../components/NavbarOffers'; // Import Navbar component
import styles from './OffersPage.module.css'; // Import styles

export default function Page() {
    const [offerProducts, setOfferProducts] = useState([]);
    const router = useRouter(); // Initialize the Next.js router

    useEffect(() => {
        const fetchOfferProducts = async () => {
            try {
                const response = await fetch('/api/offers'); // Call the offer products API
                const data = await response.json();
                setOfferProducts(data);
            } catch (error) {
                console.error('Error fetching offer products:', error);
            }
        };

        fetchOfferProducts();
    }, []);

    const navigateToProductDetail = (id) => {
        router.push(`/user/products/${id}`); // Navigate to the product detail page under products
    };

    return (
        <>
            <NavbarOffers /> {/* Include the Navbar */}

            {/* Static Banner Image */}
            <div className={styles.offerBanner}>
                <img
                    src="/assets/images/offer-banner.png"
                    alt="Offer Banner"
                    className={styles.bannerImage}
                />
            </div>


            <div className={styles.productsPage}>
                <div className={styles.productGrid}>
                    {offerProducts.length > 0 ? (
                        offerProducts.map((product) => (
                            <div
                                key={product.id}
                                className={styles.productCard}
                                onClick={() => navigateToProductDetail(product.id)} // On click, navigate to products/[id]/page.js
                            >
                                <h3 className={styles.productName}>{product.name}</h3>
                                {product.image_urls && product.image_urls.length > 0 && product.image_urls[0].path ? (
                                    <img src={product.image_urls[0].path} alt={product.name} className={styles.productImage} />
                                ) : (
                                    <p>No image available</p>
                                )}
                                <p className={styles.productPrice}>£{product.price}</p>
                            </div>
                        ))
                    ) : (
                        <p>No products available for the selected filter.</p>
                    )}
                </div>
            </div>

            <Footer /> {/* Include the Footer */}
        </>
    );
}
