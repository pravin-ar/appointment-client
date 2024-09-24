// app/components/Footer.js
import Image from 'next/image';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                {/* Left Section with Logo and Contact Information */}
                <div className={styles.footerLeft}>
                    <div className={styles.logo}>
                        <Image
                            src="/assets/images/keena_logo.png" // Replace with your logo path
                            alt="Keena Rakkado Logo"
                            width={203} // Adjust as necessary
                            height={57} // Adjust as necessary
                        />
                    </div>
                    <p>
                        Keena Rakkado was established in May 2002 after taking over an
                        established optician - Spectacle Express in West Ealing.
                    </p>
                    <p className={styles.contactInfo}>
                        Mob No: +91-1112223334
                        <br />
                        Email id: abcd11@gmail.com
                        <br />
                        Website: <a href="http://www.keenarakkado.com">www.keenarakkado.com</a>
                    </p>
                </div>

                {/* Navigation Section */}
                <div className={styles.footerCenter}>
                    <h3>Navigation</h3>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">FAQ</a></li>
                        <li><a href="/contact-us">Contact Us</a></li>
                        <li><a href="#">Our Policy</a></li>
                    </ul>
                </div>

                {/* Services Section */}
                <div className={styles.footerCenter}>
                    <h3>Our Services</h3>
                    <ul>
                        <li><a href="#">Eye Examination</a></li>
                        <li><a href="#">Contact Lenses</a></li>
                        <li><a href="#">Diabetic Screening</a></li>
                        <li><a href="#">DVLA Screening</a></li>
                        <li><a href="#">Repairs</a></li>
                        <li><a href="#">Home Visits</a></li>
                    </ul>
                </div>

                {/* Policies Section */}
                <div className={styles.footerRight}>
                    <h3>Policies</h3>
                    <ul>
                        <li><a href="#">Freedom of Information Act</a></li>
                        <li><a href="#">NHS Notice Domiciliary</a></li>
                        <li><a href="#">NHS Notice Patience</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
