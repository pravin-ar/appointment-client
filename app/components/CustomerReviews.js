// CustomerReviews.jsx
import {
    Box,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const isDesktop = useMediaQuery('(min-width:1200px)');

    useEffect(() => {
        // Check if reviews data is already in sessionStorage
        const storedReviews = sessionStorage.getItem('customerReviews');

        if (storedReviews) {
            // Parse and use the stored data
            setReviews(JSON.parse(storedReviews));
            setIsLoading(false);
        } else {
            // Fetch data from the server
            fetchReviews();
        }
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch('/api/customer-reviews');
            const data = await response.json();
            setReviews(data);
            // Store the data in sessionStorage for future use
            sessionStorage.setItem('customerReviews', JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching customer reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            component="section"
            sx={{
                backgroundColor: '#EAF9FF',
                padding: { xs: '50px 0', md: '100px 0' },
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible', // Ensure overflow is visible
            }}
        >
            <Typography
                variant="h2"
                sx={{
                    fontSize: { xs: '24px', md: '38px' },
                    fontWeight: 800,
                    lineHeight: { xs: '28.8px', md: '45.6px' },
                    color: '#383838',
                }}
            >
                Our Happy Customers
            </Typography>
            <Typography
                sx={{
                    fontSize: { xs: '16px', md: '24px' },
                    fontWeight: 600,
                    lineHeight: { xs: '19.2px', md: '28.8px' },
                    color: '#676767',
                    padding: { xs: '20px 20px', md: '50px 0' },
                    margin: '0 auto',
                }}
            >
                Customer input helps us enhance the customer experience and can inspire good change.
            </Typography>
            {isLoading ? (
                <Typography>Loading reviews...</Typography>
            ) : reviews.length > 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        overflowX: isDesktop ? 'visible' : 'auto',
                        overflowY: 'hidden',
                        justifyContent: isDesktop ? 'space-around' : 'flex-start',
                        flexWrap: isDesktop ? 'wrap' : 'nowrap',
                        alignItems: 'flex-start',
                        padding: isDesktop ? '0' : '0 20px',
                        scrollSnapType: 'x mandatory',
                        '-webkit-overflow-scrolling': 'touch',
                    }}
                >
                    {reviews.map((review, index) => (
                        <Box
                            key={index}
                            sx={{
                                backgroundColor: '#ffffff',
                                borderRadius: '16px 117px 16px 160px',
                                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                                width: { xs: '80%', sm: '460px' },
                                minWidth: { xs: '300px', sm: '400px', md: '460px' },
                                height: '445px',
                                margin: isDesktop
                                    ? '100px 20px 0 20px' // Desktop margins
                                    : '60px 10px', // Mobile and Tablet margins (adjusted top margin)
                                padding: '30px 20px',
                                textAlign: 'left',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                '&:first-of-type': {
                                    marginLeft: isDesktop ? '20px' : '20px', // Left margin for the first card
                                },
                                '&:last-child': {
                                    marginRight: isDesktop ? '20px' : '20px', // Right margin for the last card
                                },
                                overflow: 'visible', // Ensure overflow is visible
                            }}
                        >
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    position: 'absolute',
                                    top: { xs: '-74px', md: '-50px' }, // Adjusted top value
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#EAF9FF',
                                    borderRadius: '50%',
                                    padding: '10px',
                                }}
                            >
                                <img
                                    src={review.image_url}
                                    alt={`Customer ${index + 1}`}
                                    style={{
                                        borderRadius: '50%',
                                        width: '148px',
                                        height: '148px',
                                        objectFit: 'cover',
                                    }}
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    paddingTop: '80px', // Increased paddingTop to accommodate the image
                                    height: '100%',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginBottom: '10px',
                                    }}
                                >
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                color: '#FFD700',
                                                fontSize: '35px',
                                                margin: '0 2px',
                                            }}
                                        >
                                            {i < review.star ? '★' : '☆'}
                                        </span>
                                    ))}
                                </Box>
                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#A5A5A5',
                                        lineHeight: '19.2px',
                                        textAlign: 'center',
                                        marginBottom: '20px',
                                        padding: '0 10px',
                                    }}
                                >
                                    {review.description}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: '18px',
                                        lineHeight: '21.6px',
                                        color: '#ff007f',
                                    }}
                                >
                                    {review.name}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography>No customer reviews available.</Typography>
            )}
        </Box>
    );
};

export default CustomerReviews;
