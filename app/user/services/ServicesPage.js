'use client'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    GlobalStyles,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ServicesSection from './ServicesSection';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [infoSections, setInfoSections] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    const handleServiceSelect = (service) => {
        setSelectedService(service);
    };

    // Parse the info content into sections for mobile view
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedService && selectedService.info && isMobile) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(selectedService.info, 'text/html');
            const sections = [];
            let currentSection = null;

            Array.from(doc.body.childNodes).forEach((node) => {
                if (node.nodeName === 'H2' || node.nodeName === 'H3') {
                    if (currentSection) {
                        sections.push(currentSection);
                    }
                    currentSection = {
                        title: node.textContent,
                        content: '',
                    };
                } else if (currentSection) {
                    currentSection.content += node.outerHTML || node.textContent;
                }
            });
            if (currentSection) {
                sections.push(currentSection);
            }

            setInfoSections(sections);
        } else {
            setInfoSections([]);
        }
    }, [selectedService, isMobile]);

    return (
        <>
            {/* Global Styles for Rendered Content */}
            <GlobalStyles
                styles={(theme) => ({
                    '.rendered-content h1, .rendered-content h2, .rendered-content h3': {
                        color: '#008DC0',
                        fontWeight: 700,
                        fontSize: '32px', // Base font size
                        [theme.breakpoints.up('xs')]: {
                            fontSize: '12px', // Desktop
                        },
                        [theme.breakpoints.up('sm')]: {
                            fontSize: '18px', // Tablet
                        },
                        [theme.breakpoints.up('md')]: {
                            fontSize: '32px', // Desktop
                        },
                        
                    },
                    '.rendered-content ul, .rendered-content ol': {
                        paddingLeft: '20px', // Base padding
                        [theme.breakpoints.up('sm')]: {
                            paddingLeft: '12px', // Tablet
                        },
                        [theme.breakpoints.up('md')]: {
                            paddingLeft: '22px', // Desktop
                        },
                        [theme.breakpoints.up('xs')]: {
                            paddingLeft: '10px', // Desktop
                        },
                    },
                    '.rendered-content p': {
                        marginBottom: '1em',
                    },
                })}
            />

            {/* Top Section */}
            <Box
                id="services"
                sx={{
                    padding: { xs: '50px 16px', sm: '70px 24px', md: '100px 0' },
                    textAlign: 'center',
                    backgroundColor: '#FFF',
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: {
                            xs: '16px',
                            sm: '20px',
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
                            sm: '14px',
                            md: '24px',
                        },
                        fontWeight: 600,
                        lineHeight: {
                            xs: '14px',
                            sm: '20px',
                            md: '36px',
                        },
                        color: '#676767',
                        maxWidth: '1350px',
                        margin: '0 auto 60px auto',
                    }}
                >
                    Welcome to our optician services, where your eye health and convenience are our
                    priorities. We provide home visits, eyewear repairs, DVLA and diabetic screenings, and
                    a wide range of contact lenses. Our dedicated team is here to deliver high-quality care
                    right at your doorstep. Trust us to keep your vision clear and your eyewear in top shape!
                </Typography>
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: { xs: '20px 0', sm: '30px 0', md: '50px 0' },
                }}
            >
                <Box
                    sx={{
                        width: {
                            xs: '90%',
                            sm: '90%',
                            md: '80%',
                            lg: '70%',
                        },
                        backgroundColor: '#fff',
                        borderRadius: {
                            xs: '11.06px',
                            sm: '20.96px',
                            md: '36.19px',
                        },
                        border: {
                            xs: '0.4px solid #EC008B',
                            sm: '0.75px solid #EC008B',
                            md: '1.29px solid #EC008B',
                        },
                        boxShadow: {
                            xs: '0px 1.58px 1.58px 0px #00000040',
                            sm: '0px 2.99px 2.99px 0px #00000040',
                            md: '0px 5.17px 5.17px 0px #00000040',
                        },
                        padding: { xs: '16px', sm: '24px', md: '32px' },
                    }}
                >
                    {selectedService ? (
                        <>
                            {/* Service Title */}
                            <Typography
                                sx={{
                                    color: '#EC008B',
                                    fontSize: {
                                        xs: '16px',
                                        sm: '20px',
                                        md: '36px',
                                    },
                                    fontWeight: 700,
                                    lineHeight: {
                                        xs: '19.2px',
                                        sm: '24px',
                                        md: '43.2px',
                                    },
                                    textAlign: 'center',
                                    marginBottom: '20px',
                                }}
                            >
                                {selectedService.name}
                            </Typography>

                            {/* Service Detail Content */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: {
                                        xs: 'column',
                                        sm: 'row',
                                        md: 'row',
                                    },
                                    alignItems: {
                                        xs: 'center',
                                        sm: 'flex-start',
                                        md: 'flex-start',
                                    },
                                    gap: '20px',
                                    marginBottom: '20px',
                                }}
                            >
                                {/* Image Container */}
                                <Box
                                    sx={{
                                        flex: '1 1 auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={selectedService.image_url}
                                        alt={selectedService.name}
                                        sx={{
                                            width: {
                                                xs: '100%',
                                                sm: '321.25px',
                                                md: '554.68px',
                                            },
                                            height: {
                                                xs: 'auto',
                                                sm: '244.19px',
                                                md: '421.63px',
                                            },
                                            borderRadius: {
                                                xs: '13.9px',
                                                sm: '17.97px',
                                                md: '31.02px',
                                            },
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Box>

                                {/* Text Content */}
                                <Box
                                    sx={{
                                        flex: '1 1 auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '20px',
                                        width: '100%',
                                        marginTop: isMobile ? '20px' : '0',
                                    }}
                                >
                                    {/* Service Description */}
                                    <Box
                                        sx={{
                                            fontSize: {
                                                xs: '12px',
                                                sm: '12px',
                                                md: '22px',
                                            },
                                            fontWeight: 700,
                                            lineHeight: {
                                                xs: '14.4px',
                                                sm: '17.36px',
                                                md: '29.98px',
                                            },
                                            textAlign: 'left',
                                            color: '#525252',
                                        }}
                                    >
                                        <div
                                            className="rendered-content"
                                            dangerouslySetInnerHTML={{ __html: selectedService.description }}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            {/* Additional Info */}
                            {selectedService.info && (
                                <Box
                                    sx={{
                                        width: '100%',
                                        marginTop: '20px',
                                        padding: '15px',
                                    }}
                                >
                                    {isMobile && infoSections.length > 0 ? (
                                        // Mobile View: Accordions
                                        infoSections.map((section, index) => (
                                            <Accordion key={index}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    aria-controls={`panel${index}-content`}
                                                    id={`panel${index}-header`}
                                                >
                                                    <Typography sx={{ fontWeight: 700 }}>{section.title}</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <div
                                                        className="rendered-content"
                                                        dangerouslySetInnerHTML={{ __html: section.content }}
                                                    />
                                                </AccordionDetails>
                                            </Accordion>
                                        ))
                                    ) : (
                                        // Tablet and Desktop View
                                        <Box
                                            sx={{
                                                fontSize: {
                                                    xs: '12px',
                                                    sm: '14px',
                                                    md: '22px',
                                                },
                                                fontWeight: 700,
                                                lineHeight: {
                                                    xs: '14.4px',
                                                    sm: '17.36px',
                                                    md: '29.98px',
                                                },
                                                textAlign: 'left',
                                                color: '#6B6B6B',
                                            }}
                                        >
                                            <div
                                                className="rendered-content"
                                                dangerouslySetInnerHTML={{ __html: selectedService.info }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </>
                    ) : (
                        <Typography>No service selected.</Typography>
                    )}
                </Box>

                {/* Services Section */}
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 4,
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: '1350px',
                            overflow: 'hidden',
                            padding: { xs: '0 16px', sm: '0 24px', md: '0' },
                        }}
                    >
                        <ServicesSection services={services} onReadMore={handleServiceSelect} />
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default ServicesPage;
