"use client"; // Ensures this is a Client Component

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Head from 'next/head';
import Image from 'next/image'; // Import for image
import { useRouter } from 'next/navigation'; // For redirection after clicking "Done"
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Import the default styles
import Footer from '../components/Footer'; // Import the Footer component
import NavbarBookNow from '../components/NavbarBookNow'; // Import the Navbar component
import styles from './BookNow.module.css'; // Import the custom CSS module

export default function BookNow() {
    const router = useRouter(); // For redirecting to the home page
    const [selectedDate, setSelectedDate] = useState(null);
    const [dob, setDob] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        datePicker: '',
        timeSlot: '',
        phoneNumber: '',
        isNewUser: true, // Default value is true
        selectedCountry: 'GB', // Default to UK country code
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Added loading state

    useEffect(() => {
        if (selectedDate) {
            generateTimeSlots();
        }
    }, [selectedDate]);

    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM
        const slotDuration = 1; // 1-hour duration

        for (let hour = startHour; hour < endHour; hour++) {
            const startTime = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
            const endTime = `${(hour + slotDuration) % 12 || 12}:00 ${(hour + slotDuration) < 12 ? 'AM' : 'PM'}`;
            const timeString = `${startTime} - ${endTime}`;
            slots.push(timeString);
        }

        setTimeSlots(slots);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (phone) => {
        setFormData({ ...formData, phoneNumber: phone });

        const parsedPhoneNumber = parsePhoneNumberFromString(phone || '', formData.selectedCountry);
        if (parsedPhoneNumber && parsedPhoneNumber.isValid()) {
            setErrorMessage('');
        } else {
            setErrorMessage('Invalid phone number');
        }
    };

    const handleCountryChange = (phone) => {
        const parsedPhoneNumber = parsePhoneNumberFromString(phone || '');
        if (parsedPhoneNumber) {
            const countryCode = parsedPhoneNumber.country || 'GB';
            setFormData({ ...formData, selectedCountry: countryCode });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email || !selectedDate || !formData.timeSlot || !dob || !formData.phoneNumber || selectedServices.length === 0) {
            alert("Please fill all fields before booking.");
            return;
        }

        if (errorMessage) {
            alert("Please enter a valid phone number");
            return;
        }

        setShowDialog(true); // Show the dialog
        setIsLoading(true); // Show the loading state

        try {
            const res = await fetch('/api/submit-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, datePicker: selectedDate, dob: dob, selectedServices }),
            });

            const data = await res.json();

            if (res.status === 200 && data.url) {
                window.location.href = data.url;
            } else if (res.ok) {
                setIsLoading(false); // Switch to "Thank You" view
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error during submission:', error);
            alert('An error occurred while submitting the booking. Please try again later.');
            setShowDialog(false);
        }
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        router.push('/'); // Redirect to home page after clicking "Done"
    };

    const toggleServiceSelection = (service) => {
        if (selectedServices.includes(service)) {
            setSelectedServices(selectedServices.filter(s => s !== service));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const serviceData = [
        { name: 'Eye Examination', icon: '/assets/images/eye_examination.png' },
        { name: 'Contact Lenses', icon: '/assets/images/contact_lenses.png' },
        { name: 'Diabetic Screening', icon: '/assets/images/diabetic_screening.png' },
        { name: 'DVLA Screening', icon: '/assets/images/dvla_screening.png' },
        { name: 'Repairs', icon: '/assets/images/repairs.png' },
        { name: 'Home Visits', icon: '/assets/images/home_visits.png' },
    ];

    return (
        <>
            <NavbarBookNow />
            <Head>
                <title>Book Now</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className={styles.bookNowPage}>
                <h1 className={styles.pageTitle}>Book an Appointment</h1>
                <p className={styles.pageSubtitle}>Would you like to schedule an appointment? Please provide us with your information.</p>
                
                {/* Form Fields */}
                <form className={styles.bookingForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName" className={styles.formLabel}>Enter your name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Enter your name"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="dob" className={styles.formLabel}>Your birth date</label>
                        <div className={styles.datePickerContainer}>
                            <DatePicker
                                id="dob"
                                selected={dob}
                                onChange={(date) => setDob(date)}
                                dateFormat="dd / MM / yyyy"
                                placeholderText="DD / MM / YYYY"
                                className={`${styles.datePicker} ${styles.inputField}`} // Combined styles for inputField and datePicker
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phoneNumber" className={styles.formLabel}>Your mobile number</label>
                        <div className={styles.phoneNumberGroup}>
                            <PhoneInput
                                defaultCountry="GB" // Default to UK
                                value={formData.phoneNumber}
                                onChange={handlePhoneChange}
                                onCountryChange={handleCountryChange} // Track changes in the country
                                placeholder="7444 123456" // Placeholder will change with country
                                className={styles.inputFieldPhoneNumber} // Applying your existing class for styling
                                international
                            />
                        </div>
                        {errorMessage && (
                            <p className={styles.errorMessage}>{errorMessage}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>Your email id</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="abcd1245@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="datePicker" className={styles.formLabel}>Appointment Date</label>
                        <div className={styles.datePickerContainer}>
                            <DatePicker
                                id="datePicker"
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="dd / MM / yyyy"
                                placeholderText="DD / MM / YYYY"
                                minDate={new Date()}
                                className={`${styles.datePicker} ${styles.inputField}`} // Combined styles for inputField and datePicker
                                required
                            />
                        </div>
                    </div>

                    {selectedDate && (
                        <div className={styles.formGroup}>
                            <label htmlFor="timeSlot" className={styles.formLabel}>Your available slot</label>
                            <div className={styles.timeSlotsContainer}>
                                {timeSlots.map((slot, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        className={`${styles.timeSlot} ${formData.timeSlot === slot ? styles.active : ''}`}
                                        onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className={`${styles.formGroup} ${styles.serviceGroup}`}>
                        <label className={styles.formLabel}>What type of service would you like to receive?</label>
                        <div className={styles.servicesContainer}>
                            {serviceData.map((service) => (
                                <button
                                    type="button"
                                    key={service.name}
                                    className={`${styles.serviceBtn} ${selectedServices.includes(service.name) ? styles.active : ''}`}
                                    onClick={() => toggleServiceSelection(service.name)}
                                >
                                    <div
                                        className={styles.iconContainer}
                                        style={{
                                            filter: selectedServices.includes(service.name) ? 'invert(100%)' : 'none',
                                        }}
                                    >
                                        <img src={service.icon} alt={service.name} className={styles.icon} />
                                    </div>
                                    <span
                                        style={{
                                            color: selectedServices.includes(service.name) ? '#FFFFFF' : '#959595',
                                        }}
                                    >
                                        {service.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.bookAppointmentBtn} disabled={isLoading}>
                            {isLoading ? "Loading..." : "Book Appointment"}
                        </button>
                    </div>
                </form>

                {/* Show the dialog when the booking is successful */}
                {showDialog && (
                    <div className={styles.dialogOverlay}>
                        <div className={styles.dialogBox}>
                            {isLoading ? (
                                <div>
                                    <h2 className={styles.dialogTitle}>Booking in Progress...</h2>
                                    <Image
                                        src="/assets/images/loading_spinner.gif"
                                        alt="Loading"
                                        width={100}
                                        height={100}
                                        className={styles.dialogImage}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className={styles.dialogTitle}>Thank You!</h2>
                                    <p className={styles.dialogSubtitle}>Your appointment has been successfully booked!</p>
                                    <Image
                                        src="/assets/images/booking_success.png"
                                        alt="Appointment booked"
                                        width={150}
                                        height={150}
                                        className={styles.dialogImage}
                                    />
                                    <p className={styles.dialogText}>
                                        <strong>Appointment Date: </strong> {selectedDate?.toLocaleDateString()}
                                    </p>
                                    <p className={styles.dialogText}>
                                        <strong>Appointment Time: </strong> {formData.timeSlot}
                                    </p>
                                    <button className={styles.dialogButton} onClick={handleCloseDialog}>
                                        Done
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
