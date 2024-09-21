"use client";

import BookAppointmentButton from './components/BookAppointmentButton'; // Import the Book Appointment button
import CustomerReviews from './components/CustomerReviews'; // Import the component
import Footer from './components/Footer'; // Import the Footer component
import Navbar from './components/Navbar'; // Import the Navbar component
import ProductsSection from './components/ProductsSection'; // Import the ProductsSection component
import ServicesSection from './components/ServicesSection'; // Import the ServicesSection component

export default function Home() {
  return (
    <>
      {/* Include the Navbar component */}
      <Navbar />

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

      {/* Include the Footer component */}
      <Footer />
    </>
  );
}
