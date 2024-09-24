// app/aboutus/page.js
"use client"; // Ensures this is a Client Component

import AboutUsContent from '../components/AboutUsContent'; // Adjusted the import path
import Footer from '../components/Footer'; // Import the Footer component
import NavbarAboutUs from '../components/NavbarAboutUs'; // Adjusted the import path;

export default function AboutUsPage() {
    return (
        <>
            {/* this is Navbar of aboutus */}
            <NavbarAboutUs />

            {/* this is the content of the aboutus page */}
            <AboutUsContent />

            {/* Include the Footer component */}
            <Footer />
        </>
    );
};
