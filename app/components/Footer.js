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
                            width={200} // Adjust as necessary
                            height={50} // Adjust as necessary
                        />
                    </div>
                    <p>
                        Keena Rakkado was established in May 2002 after taking over an
                        established optician - Spectacle Express in West Ealing.
                    </p>
                    <p>
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
                        <li><a href="#">Contact Us</a></li>
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
                {/* Image container with background image
                <div
                        className={styles.footerImage}
                        style={{
                            backgroundImage: "url('/assets/images/leaf.png')",
                            backgroundPosition: 'bottom right',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                            filter: 'invert(41%) sepia(99%) saturate(2762%) hue-rotate(308deg) brightness(95%) contrast(100%)',
                            position: 'absolute',
                            bottom: '0',
                            right: '0'
                        }}
                    ></div> */}
            </div>
        </footer>
    );
};

export default Footer;
