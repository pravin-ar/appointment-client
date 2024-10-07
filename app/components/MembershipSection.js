import { Box, Button, TextField, Typography } from '@mui/material';

const MembershipSection = () => {
    return (
        <Box
            sx={{
                width: '100%',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: { xs: 2, sm: 3, lg: 4 },
            }}
        >
            <Box
                sx={{
                    width: {
                        xs: '377px',    // Mobile
                        sm: '648.09px', // Tablet
                        lg: '1119px',   // Desktop
                    },
                    height: {
                        xs: '117.58px',
                        sm: '202.13px',
                        lg: '349px',
                    },
                    backgroundImage: "url('/assets/images/membership-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: {
                        xs: '13.48px',
                        sm: '23.17px',
                        lg: '40px',
                    },
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start', // Align items to the start (left)
                    padding: {
                        xs: '20px',
                        sm: '30px',
                        lg: '40px',
                    },
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#333',
                        width: {
                            xs: '198px',   // Mobile text width
                            sm: '264.68px', // Tablet text width
                            lg: '457px',    // Desktop text width
                        },
                        height: {
                            xs: '28px',  // Mobile text height
                            sm: '38px',  // Tablet text height
                            lg: '68px',  // Desktop text height
                        },
                        alignItems: 'flex-start', // Ensure text is left-aligned
                        marginBottom: {
                            xs: '10px',
                            sm: '15px',
                            lg: '20px',
                        },
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            width: {
                                xs: '198px',
                                sm: '264.68px',
                                lg: '457px',
                            },
                            height: {
                                xs: '28px',
                                sm: '38px',
                                lg: '68px',
                            },
                            fontSize: {
                                xs: '12px',
                                sm: '16px',
                                lg: '28px',
                            },
                            fontWeight: 600,
                            lineHeight: {
                                xs: '14.4px',
                                sm: '19.2px',
                                lg: '33.6px',
                            },
                            textAlign: 'left',
                        }}
                    >
                        Join our membership to receive great discounts.
                    </Typography>
                </Box>
                <Box
                    sx={{
                        position: 'relative',
                        width: {
                            xs: '198px',   // Mobile input width
                            sm: '264.68px', // Tablet input width
                            lg: '457px',    // Desktop input width
                        },
                        height: {
                            xs: '28px',
                            sm: '38px',
                            lg: '68px',
                        },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        type="email"
                        placeholder="Enter your email Id"
                        variant="outlined"
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: {
                                xs: '5.71px',
                                sm: '6.95px',
                                lg: '12px',
                            },
                            backgroundColor: '#F1F1F1',
                            boxShadow: '0px 0.95px 5.71px 0.48px #0000001F',
                            input: {
                                color: '#333', // Changed for better readability
                                padding: {
                                    xs: '4px 10px',
                                    sm: '6px 12px',
                                    lg: '10px 14px',
                                },
                                height: '100%',
                                boxSizing: 'border-box',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: '#aaa',
                            },
                            paddingRight: {
                                xs: '90px',  // Space for the button on mobile
                                sm: '120px', // Space for the button on tablet
                                lg: '180px', // Space for the button on desktop
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        sx={{
                            position: 'absolute',
                            right: '0px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: 0,
                            minWidth: 'unset',
                            width: {
                                xs: '81.39px',
                                sm: '99.04px',
                                lg: '171px',
                            },
                            height: {
                                xs: '22.85px',
                                sm: '27.8px',
                                lg: '48px',
                            },
                            borderRadius: {
                                xs: '5.71px',
                                sm: '6.95px',
                                lg: '12px',
                            },
                            backgroundColor: '#ff007f',
                            color: '#ffffff',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            fontSize: {
                                xs: '12px',
                                sm: '14px',
                                lg: '16px',
                            },
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#e60073',
                            },
                        }}
                    >
                        Send
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default MembershipSection;
