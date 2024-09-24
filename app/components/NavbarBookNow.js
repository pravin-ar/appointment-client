// app/components/NavbarAboutUs.js
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';

const NavbarBookNow = () => {
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
                <Link href="/login" className={styles.navLink}>About us</Link>
                <Link href="/offers" className={styles.navLink}>Offers</Link>
                <Link href="/service" className={styles.navLink}>Service</Link>
                <Link href="/products" className={styles.navLink}>Products</Link>
                <div className={styles.navLinkWithIcon}>
                    <Image
                        src="/assets/images/glass.png" // Replace with your glasses icon path
                        alt="Glasses Icon"
                        width={60} // Adjust size as necessary
                        height={24} // Adjust size as necessary
                        className={styles.glassIconBookNow} // New className for styling
                    />
                    <Link href="/book-now" className={styles.navLink}>Book appointment</Link>
                </div>
            </nav>
        </header>
    );
};

export default NavbarBookNow;
