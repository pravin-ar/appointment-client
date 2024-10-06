import styles from './MembershipSection.module.css'; // Import the CSS module

const MembershipSection = () => {
    return (
        <div className={styles.membershipPage}>
            <div
                className={styles.membershipSection}
                style={{ backgroundImage: "url('/assets/images/membership-bg.png')" }}
            >
                <div className={styles.membershipContent}>
                    <h3>Join our membership to receive great discounts.</h3>
                    <div className={styles.inputGroup}>
                        <input type="email" placeholder="Enter your email Id" />
                        <button type="button">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipSection;

