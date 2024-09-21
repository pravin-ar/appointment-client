import styles from './CustomerReviews.module.css'; // Import the CSS module
import MembershipSection from './MembershipSection'; // Import the new component

const CustomerReviews = () => {
    const reviews = [
        {
            image: "/assets/images/customer1.jpg",
            text: "I had a great experience with Keena Rakado! She was very attentive during the eye exam and explained everything thoroughly. The selection of frames was impressive, and she helped me find a stylish pair that fits perfectly. The only issue was a bit of delay for some of the products, but that's okay! Overall, a fantastic visit!",
            name: "John Doe",
            position: "Product Designer"
        },
        {
            image: "/assets/images/customer2.jpg",
            text: "Keena Rakado is amazing! From the moment I walked in, she made me feel comfortable. The eye exam was thorough, and she really took the time to understand my needs. I love my new glasses—they’re exactly what I was looking for! Highly recommend her services.",
            name: "Jane Smith",
            position: "CEO, YBD Company"
        },
        {
            image: "/assets/images/customer3.jpg",
            text: "I visited Keena Rakado for an eye exam and was impressed by her professionalism. She was knowledgeable and answered all my questions. I ended up getting new frames, but I wish there were more options in my budget. Still, it was a great experience overall!",
            name: "Michael Lee",
            position: "Social Worker"
        }
    ];

    return (
        <section className={styles.happyCustomerSection}>
            <h2 className={styles.sectionTitle}>Our Happy Customer</h2>
            <p className={styles.sectionSubtitle}>
                Customer input helps us enhance the customer experience and can inspire good change.
            </p>
            <div className={styles.reviewsContainer}>
                {reviews.map((review, index) => (
                    <div key={index} className={styles.reviewCard}>
                        <div className={styles.reviewerImageWrapper}>
                            <img src={review.image} alt={`Customer ${index + 1}`} className={styles.reviewerImage} />
                        </div>
                        <div className={styles.reviewContent}>
                            <p className={styles.reviewText}>{review.text}</p>
                            <h3 className={styles.reviewerName}>{review.name}</h3>
                            <p className={styles.reviewerPosition}>{review.position}</p>
                        </div>
                    </div>
                ))}
            </div>
            <MembershipSection /> {/* Add the membership section at the end */}
        </section>
    );
};

export default CustomerReviews;
