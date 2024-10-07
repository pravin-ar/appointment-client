"use client";

import MembershipSection from '../app/components/MembershipSection';
import CustomerReviews from './components/CustomerReviews';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection'; // Import the new component
import NavbarHome from './components/NavbarHome';
import ProductsSection from './components/ProductsSection';
import ServicesSection from './components/ServicesSection';

export default function Home() {
  return (
    <>
      {/* Include the Navbar component */}
      <NavbarHome />

      {/* Include the HeroSection component */}
      <HeroSection />

      {/* Include the Services Section */}
      <ServicesSection />

      {/* Include the Products Section */}
      <ProductsSection />

      {/* Include the Customer Reviews component */}
      <CustomerReviews />

      {/* Include the Membership Section */}
      <MembershipSection />

      {/* Include the Footer component */}
      <Footer />
    </>
  );
}
