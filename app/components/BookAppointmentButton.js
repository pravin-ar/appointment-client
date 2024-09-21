// app/components/BookAppointmentButton.js
import Link from 'next/link';
import styles from './BookAppointmentButton.module.css';

const BookAppointmentButton = () => {
    return (
        <Link href="/book-now">
            <button className={styles.bookAppointmentBtn}>
                Book Appointment
            </button>
        </Link>
    );
};

export default BookAppointmentButton;
