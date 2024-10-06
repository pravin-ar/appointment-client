// app/user/offers/page.js
"use client";
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Footer from '../../components/Footer';
import NavbarOffers from '../../components/NavbarOffers';

export default function Page() {
    const [offerProducts, setOfferProducts] = useState([]);
    const [offerServices, setOfferServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const servicesContainerRef = useRef(null);
    const productsContainerRef = useRef(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch('/api/offers');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setOfferProducts(data.products);
                setOfferServices(data.services);
            } catch (err) {
                console.error('Error fetching offers:', err);
                setError('Failed to load offers. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const navigateToProductDetail = (id) => {
        router.push(`/user/products/${id}`);
    };

    const navigateToServiceDetail = (id) => {
        router.push(`/user/services/${id}`);
    };

    // Functions for drag-to-scroll
    const handleMouseDrag = (e, containerRef) => {
        e.preventDefault();
        if (containerRef.current) {
            containerRef.current.scrollLeft -= e.movementX;
        }
    };

    const enableMouseDrag = (containerRef) => {
        if (containerRef.current) {
            containerRef.current.addEventListener('mousemove', (e) =>
                handleMouseDrag(e, containerRef)
            );
        }
    };

    const disableMouseDrag = (containerRef) => {
        if (containerRef.current) {
            containerRef.current.removeEventListener('mousemove', (e) =>
                handleMouseDrag(e, containerRef)
            );
        }
    };

    const handleNext = (containerRef) => {
        if (containerRef.current) {
            const scrollAmount = containerRef.current.clientWidth;
            containerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handlePrev = (containerRef) => {
        if (containerRef.current) {
            const scrollAmount = containerRef.current.clientWidth;
            containerRef.current.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <>
            <NavbarOffers />

            {/* Static Banner Image */}
            <Box
                sx={{
                    width: '100%',
                    textAlign: 'center',
                    backgroundColor: "white"
                }}
            >
                <img
                    src="/assets/images/offer-banner.png"
                    alt="Offer Banner"
                    style={{
                        width: '100%',
                        height: 'auto',
                    }}
                />
            </Box>

            {/* Error Message */}
            {error && (
                <Typography
                    sx={{
                        color: 'red',
                        textAlign: 'center',
                        margin: '20px 0',
                    }}
                >
                    {error}
                </Typography>
            )}

            {/* Loading Indicator */}
            {isLoading ? (
                <Typography
                    sx={{
                        textAlign: 'center',
                        fontSize: '18px',
                        color: '#777',
                    }}
                >
                    Loading offers...
                </Typography>
            ) : (
                <>
                    {/* Offer Services Section */}
                    <Box
                        id="services"
                        sx={{
                            padding: { xs: '50px 16px', sm: '70px 24px', md: '100px 0' },
                            textAlign: 'center',
                            backgroundColor: '#F7F7F7',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                maxWidth: '100%',
                            }}
                        >
                            {/* Previous Button */}
                            <IconButton
                                onClick={() => handlePrev(servicesContainerRef)}
                                sx={{
                                    position: 'absolute',
                                    left: { xs: 10, sm: 20, md: 50 },
                                    zIndex: 10,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                    },
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <ArrowBack sx={{ color: '#333', fontSize: '30px' }} />
                            </IconButton>

                            {/* Services Carousel */}
                            <Box
                                ref={servicesContainerRef}
                                onMouseDown={() => enableMouseDrag(servicesContainerRef)}
                                onMouseUp={() => disableMouseDrag(servicesContainerRef)}
                                onMouseLeave={() => disableMouseDrag(servicesContainerRef)}
                                sx={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    scrollBehavior: 'smooth',
                                    cursor: 'grab',
                                    userSelect: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    paddingLeft: { xs: '16px', sm: '40px', md: '120px' },
                                    paddingRight: { xs: '16px', sm: '16px', md: '0' },
                                    '&::-webkit-scrollbar': { display: 'none' },
                                }}
                            >
                                {offerServices.length > 0 ? (
                                    offerServices.map((service) => (
                                        <Card
                                            key={service.id}
                                            sx={{
                                                flex: '0 0 auto',
                                                width: {
                                                    xs: '208px',
                                                    sm: '208px',
                                                    md: '390px',
                                                },
                                                height: {
                                                    xs: '260px',
                                                    sm: '260px',
                                                    md: '460px',
                                                },
                                                borderRadius: {
                                                    xs: '12.44px',
                                                    sm: '12.44px',
                                                    md: '23.9px',
                                                },
                                                border: {
                                                    xs: '0.44px solid #EC008B',
                                                    sm: '0.44px solid #EC008B',
                                                    md: '0.85px solid #EC008B',
                                                },
                                                boxShadow: {
                                                    xs: '0px 1.78px 1.78px 0px #00000040',
                                                    sm: '0px 1.78px 1.78px 0px #00000040',
                                                    md: '0px 3.41px 3.41px 0px #00000040',
                                                },
                                                margin: { xs: '0 8px', sm: '0 15px', md: '0 15px' },
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                backgroundColor: '#fff',
                                                transition: 'transform 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-10px)',
                                                },
                                            }}
                                            onClick={() => navigateToServiceDetail(service.id)}
                                        >
                                            {/* Offer Image */}
                                            {service.offer_image_url && (
                                                <img
                                                    src={service.offer_image_url}
                                                    alt={`${service.offer_name} Offer`}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: '50px',
                                                        height: '50px',
                                                    }}
                                                />
                                            )}

                                            {/* Service Image */}
                                            <CardMedia
                                                component="img"
                                                image={
                                                    service.image_urls && service.image_urls.length > 0
                                                        ? service.image_urls[0].path
                                                        : '/assets/images/default-service.png'
                                                }
                                                alt={service.name}
                                                sx={{
                                                    width: {
                                                        xs: '190px',
                                                        sm: '190px',
                                                        md: '360.26px',
                                                    },
                                                    height: {
                                                        xs: '132px',
                                                        sm: '132px',
                                                        md: '250.99px',
                                                    },
                                                    borderRadius: {
                                                        xs: '10.67px',
                                                        sm: '10.67px',
                                                        md: '20.49px',
                                                    },
                                                    objectFit: 'cover',
                                                    margin: 'auto',
                                                    display: 'block',
                                                }}
                                            />
                                            <CardContent
                                                sx={{
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    flexGrow: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                    position: 'relative',
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontSize: {
                                                            xs: '12px',
                                                            sm: '12px',
                                                            md: '24px',
                                                        },
                                                        fontWeight: 700,
                                                        color: '#EC008B',
                                                        mb: 1,
                                                    }}
                                                >
                                                    {service.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: {
                                                            xs: '8px',
                                                            sm: '8px',
                                                            md: '12px',
                                                        },
                                                        fontWeight: 700,
                                                        color: '#525252',
                                                        mb: 2,
                                                    }}
                                                >
                                                    {service.description}
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        width: {
                                                            xs: '96px',
                                                            sm: '96px',
                                                            md: '160.95px',
                                                        },
                                                        height: {
                                                            xs: '32px',
                                                            sm: '32px',
                                                            md: '46.1px',
                                                        },
                                                        borderRadius: {
                                                            xs: '8px',
                                                            sm: '8px',
                                                            md: '15.17px',
                                                        },
                                                        backgroundColor: '#EC008B',
                                                        boxShadow: {
                                                            xs: '0px 0.79px 4.74px 0.39px #0000001F',
                                                            sm: '0px 0.79px 4.74px 0.39px #0000001F',
                                                            md: '0px 1.52px 9.1px 0.76px #0000001F',
                                                        },
                                                        color: '#fff',
                                                        fontSize: {
                                                            xs: '10px',
                                                            sm: '10px',
                                                            md: '16px',
                                                        },
                                                        fontWeight: 'bold',
                                                        position: 'absolute',
                                                        bottom: '10px',
                                                        '&:hover': {
                                                            backgroundColor: '#d7007b',
                                                        },
                                                    }}
                                                >
                                                    Read More
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: '18px',
                                            color: '#777',
                                            mt: 2,
                                        }}
                                    >
                                        No services available.
                                    </Typography>
                                )}
                            </Box>

                            {/* Next Button */}
                            <IconButton
                                onClick={() => handleNext(servicesContainerRef)}
                                sx={{
                                    position: 'absolute',
                                    right: { xs: 10, sm: 20, md: 30 },
                                    zIndex: 10,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                    },
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <ArrowForward sx={{ color: '#333', fontSize: '30px' }} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Offer Products Section */}
                    <Box
                        sx={{
                            padding: { xs: '50px 16px', sm: '70px 24px', md: '100px 0' },
                            textAlign: 'center',
                            backgroundColor: "white"
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: {
                                    xs: '16px',
                                    sm: '18px',
                                    md: '32px',
                                },
                                fontWeight: 800,
                                color: '#383838',
                                mb: { xs: 2, sm: 3, md: 4 },
                            }}
                        >
                            Our Offer Products
                        </Typography>
                        {/* Products Carousel */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                maxWidth: '100%',
                            }}
                        >
                            {/* Previous Button */}
                            <IconButton
                                onClick={() => handlePrev(productsContainerRef)}
                                sx={{
                                    position: 'absolute',
                                    left: { xs: 10, sm: 20, md: 50 },
                                    zIndex: 10,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                    },
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <ArrowBack sx={{ color: '#333', fontSize: '30px' }} />
                            </IconButton>

                            <Box
                                ref={productsContainerRef}
                                onMouseDown={() => enableMouseDrag(productsContainerRef)}
                                onMouseUp={() => disableMouseDrag(productsContainerRef)}
                                onMouseLeave={() => disableMouseDrag(productsContainerRef)}
                                sx={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    scrollBehavior: 'smooth',
                                    cursor: 'grab',
                                    userSelect: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    paddingLeft: { xs: '16px', sm: '40px', md: '120px' },
                                    paddingRight: { xs: '16px', sm: '16px', md: '0' },
                                    '&::-webkit-scrollbar': { display: 'none' },
                                }}
                            >
                                {offerProducts.length > 0 ? (
                                    offerProducts.map((product) => (
                                        <Card
                                            key={product.id}
                                            sx={{
                                                position: 'relative',
                                                flex: '0 0 auto',
                                                width: {
                                                    xs: '208px',
                                                    sm: '208px',
                                                    md: '250px',
                                                },
                                                padding: '20px',
                                                borderRadius: '10px',
                                                border: '1px solid #ddd',
                                                cursor: 'pointer',
                                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                },
                                                backgroundColor: '#fff',
                                                margin: { xs: '0 8px', sm: '0 15px', md: '0 15px' },
                                            }}
                                            onClick={() => navigateToProductDetail(product.id)}
                                        >
                                            {/* Offer Image */}
                                            {product.offer_image_url && (
                                                <img
                                                    src={product.offer_image_url}
                                                    alt={`${product.offer_name} Offer`}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: '50px',
                                                        height: '50px',
                                                    }}
                                                />
                                            )}

                                            {/* Product Name */}
                                            <Typography
                                                variant="h6"
                                                component="h3"
                                                sx={{
                                                    marginTop: '60px', // To accommodate the offer image
                                                    textAlign: 'center',
                                                    color: '#EC008B',
                                                    fontWeight: '700',
                                                    fontSize: '18px',
                                                    mb: 1,
                                                }}
                                            >
                                                {product.name}
                                            </Typography>

                                            {/* Product Image */}
                                            {product.image_urls &&
                                            product.image_urls.length > 0 &&
                                            product.image_urls[0].path ? (
                                                <CardMedia
                                                    component="img"
                                                    image={product.image_urls[0].path}
                                                    alt={product.name}
                                                    sx={{
                                                        width: '100%',
                                                        height: '150px',
                                                        objectFit: 'cover',
                                                        borderRadius: '5px',
                                                        mb: 2,
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No image available
                                                </Typography>
                                            )}

                                            {/* Product Price */}
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    textAlign: 'center',
                                                    color: '#525252',
                                                    fontWeight: '700',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                £{product.price}
                                            </Typography>
                                        </Card>
                                    ))
                                ) : (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: '18px',
                                            color: '#777',
                                            mt: 2,
                                            textAlign: 'center',
                                        }}
                                    >
                                        No products available.
                                    </Typography>
                                )}
                            </Box>

                            {/* Next Button */}
                            <IconButton
                                onClick={() => handleNext(productsContainerRef)}
                                sx={{
                                    position: 'absolute',
                                    right: { xs: 10, sm: 20, md: 30 },
                                    zIndex: 10,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                    },
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <ArrowForward sx={{ color: '#333', fontSize: '30px' }} />
                            </IconButton>
                        </Box>
                    </Box>
                </>
            )}

            <Footer />
        </>
    );
}
