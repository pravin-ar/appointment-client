// app/components/NavbarHome.js
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';

const NavbarHome = () => {
    return (
        <header className={styles.navbar}>
            <div className={styles.navbarLeft}>
                <Image
                    src="/assets/images/keena_logo.png" // Replace with your logo path
                    alt="Keena Rakkado Logo"
                    width={277} // Adjust size as necessary
                    height={78} // Adjust size as necessary
                    className={styles.logo}
                />
            </div>
            <nav className={styles.navbarCenter}>
                <Link href="/" className={styles.navLink}>
                    <Image
                        src="/assets/images/glass.png" // Replace with your glasses icon path
                        alt="Glasses Icon"
                        width={60} // Adjust size as necessary
                        height={24} // Adjust size as necessary
                    />
                </Link>
                <Link href="/user/aboutus" className={styles.navLink}>About us</Link>
                <Link href="/user/offers" className={styles.navLink}>Offer</Link>
                <Link href="/user/services" className={styles.navLink}>Service</Link>
                <Link href="/user/products" className={styles.navLink}>Products</Link>
                <Link href="/user/book-now" className={styles.navLink}>Book appointment</Link>
            </nav>
        </header>
    );
};

export default NavbarHome;
