"use client";

import MembershipSection from '../app/components/MembershipSection'; // Import the new component
import BookAppointmentButton from './components/BookAppointmentButton'; // Import the Book Appointment button
import CustomerReviews from './components/CustomerReviews'; // Import the component
import Footer from './components/Footer'; // Import the Footer component
import NavbarHome from './components/NavbarHome';
import ProductsSection from './components/ProductsSection'; // Import the ProductsSection component
import ServicesSection from './components/ServicesSection'; // Import the ServicesSection component

export default function Home() {
  return (
    <>
      {/* Include the Navbar component */}
      <NavbarHome />

      {/* Background Image Section */}
      <section className="hero-section" style={{ backgroundImage: "url('/assets/images/background.png')" }}>
        <div className="hero-content">
          {/* Include the new Book Appointment Button */}
          <BookAppointmentButton />
        </div>
      </section>

      {/* Include the Services Section */}
      <ServicesSection />

      {/* Include the Products Section */}
      <ProductsSection />

      {/* Include the Customer Reviews component */}
      <CustomerReviews />

      <MembershipSection /> {/* Add the membership section at the end */}

      {/* Include the Footer component */}
      <Footer />
    </>
  );
}
