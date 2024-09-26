// app/services/page.js
import Footer from '../components/Footer'; // Import the Footer component
import NavbarServices from '../components/NavbarServices'; // Import Navbar component
import ServicesPage from './ServicesPage';

export default function Page() {
    return (
        <>
            <NavbarServices /> {/* Include the Navbar separately here */}
            <ServicesPage /> {/* Render the ServicesPage component */}
            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
