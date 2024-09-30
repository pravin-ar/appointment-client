// app/user/products/page.js
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarProducts from '../../components/NavbarProducts'; // Import Navbar component
import ProductsPage from './ProductsPage'; // Import the ProductsPage component

export default function Page() {
    return (
        <>
            <NavbarProducts /> {/* Include the Navbar separately here */}
            <ProductsPage /> {/* Render the ProductsPage component */}
            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
