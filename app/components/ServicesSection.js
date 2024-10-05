// ServicesSection.jsx
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
import { useEffect, useRef, useState } from 'react';

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

            const formattedServices = data.map((service) => ({
                id: service.id,
                name: service.name,
                description: service.description,
                image_url: service.image_url,
                info: service.info,
                keywords: service.meta_data?.keywords || 'services, more details',
                icon: service.icon_url,
            }));
            setServices(formattedServices);
            sessionStorage.setItem('servicesData', JSON.stringify(formattedServices));
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const handleMouseDrag = (e) => {
        e.preventDefault();
        if (containerRef.current) {
            containerRef.current.scrollLeft -= e.movementX;
        }
    };

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
        <Box
            id="services"
            sx={{
                padding: { xs: '50px 16px', sm: '70px 24px', md: '100px 0' },
                textAlign: 'center',
                backgroundColor: '#F7F7F7',
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
                Our Services
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    fontSize: {
                        xs: '10px',
                        sm: '12px',
                        md: '24px',
                    },
                    fontWeight: 600,
                    lineHeight: '1.5',
                    color: '#676767',
                    maxWidth: '1350px',
                    margin: '0 auto 60px auto',
                }}
            >
                Welcome to our optician services, where your eye health and convenience are
                our priorities. We provide home visits, eyewear repairs, DVLA and diabetic
                screenings, and a wide range of contact lenses. Our dedicated team is here to
                deliver high-quality care right at your doorstep. Trust us to keep your vision
                clear and your eyewear in top shape!
            </Typography>
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
                <IconButton
                    onClick={handlePrev}
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
                    ref={containerRef}
                    onMouseDown={enableMouseDrag}
                    onMouseUp={disableMouseDrag}
                    onMouseLeave={disableMouseDrag}
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
                    {services.length > 0 ? (
                        services.map((service) => (
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
                            >
                                <CardMedia
                                    component="img"
                                    image={service.image_url}
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

                <IconButton
                    onClick={handleNext}
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
    );
};

export default ServicesSection;
