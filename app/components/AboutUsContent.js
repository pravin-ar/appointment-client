// app/components/AboutUsContent.js
import styles from './AboutUsContent.module.css';

const AboutUsContent = () => {
    return (
        <div className={styles.container}>
            <div className={styles.contentBox}>
                <h1 className={styles.title}>About us</h1>
                <p className={styles.text}>
                    At Keena Rakkado, we believe everyone deserves the best eyesight. Our qualified team is dedicated to providing sensitive eye examinations for the elderly and vulnerable individuals. To ensure comfort, we welcome family members, friends, or carers to accompany patients during their visits.
                </p>
                <p className={styles.text}>
                    We utilize portable equipment to conduct comprehensive eye tests at home, in hospitals, or care facilities. This flexibility allows us to serve those who cannot travel to us, both privately and through the NHS. For NHS patients who are housebound, eye tests and visits are provided at no cost.
                </p>
                <p className={styles.text}>
                    In addition to eye examinations, we bring a selection of frames for those in need of new spectacles. We also return to deliver, fit, and adjust the glasses at no extra charge, ensuring a seamless experience for our patients.
                </p>
            </div>
        </div>
    );
};

export default AboutUsContent;
