import { Box, Button } from '@mui/material';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: {
          xs: '224px',    // Mobile
          sm: '468.55px', // Tablet
          md: '809px',    // Desktop
        },
        backgroundImage: "url('/assets/images/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}
    >
      {/* Book Appointment Button */}
      <Link href="/book-now" passHref>
        <Button
          sx={{
            width: {
              xs: '124px',       // Mobile
              sm: '243.25px',    // Tablet
              md: '420px',       // Desktop
            },
            height: {
              xs: '36px',
              sm: '48.65px',
              md: '84px',
            },
            borderRadius: {
              xs: '13.9px',
              sm: '13.9px',
              md: '24px',
            },
            boxShadow: '0px 1.16px 6.95px 0.58px #0000001F',
            backgroundColor: '#ec008b',
            color: '#ffffff',
            fontSize: {
              xs: '10px',       // Mobile
              sm: '14px',       // Tablet
              md: '24px',       // Desktop
            },
            fontWeight: 700,
            lineHeight: {
              xs: '12px',
              sm: '16.8px',
              md: '28.8px',
            },
            textAlign: 'center',
            position: 'absolute',
            bottom: {
              xs: '30px',
              sm: '50px',
              md: '100px',
            },
            right: {
              xs: '20px',
              sm: '50px',
              md: '200px',
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'none',
            '&:hover': {
              opacity: 0.8,
              backgroundColor: '#ec008b',
            },
          }}
        >
          Book Appointment
        </Button>
      </Link>
    </Box>
  );
};

export default HeroSection;
