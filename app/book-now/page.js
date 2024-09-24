// app/book-now/page.js
"use client"; // Ensures this is a Client Component

import Head from 'next/head';
import Image from 'next/image'; // Import the Image component from next/image
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Footer from '../components/Footer'; // Import the Footer component
import NavbarBookNow from '../components/NavbarBookNow'; // Import the Navbar component
import styles from './BookNow.module.css'; // Import the custom CSS module

export default function BookNow() {
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
        isNewUser: true // Default value is true
    });

    const [showDialog, setShowDialog] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

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

    const handleToggle = () => {
        setFormData({ ...formData, isNewUser: !formData.isNewUser });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email || !selectedDate || !formData.timeSlot || !dob || !formData.phoneNumber || selectedServices.length === 0) {
            alert("Please fill all fields before booking.");
            return;
        }

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
                setShowDialog(true);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error during submission:', error);
            alert('An error occurred while submitting the booking. Please try again later.');
        }
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        window.location.href = '/';
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
            {/* Include the Navbar component */}
            <NavbarBookNow />
            <Head>
                <title>Book Now</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className={styles.bookNowPage}>
                <h1 className={styles.pageTitle}>Book an Appointment</h1>
                <p className={styles.pageSubtitle}>Would you like to schedule an appointment? Please provide us with your information.</p>
                <div className={styles.userTypeToggle}>
                    <button
                        type="button"
                        className={`${styles.userTypeBtn} ${formData.isNewUser ? styles.active : ''}`}
                        onClick={handleToggle}
                    >
                        I am a new user
                    </button>
                    <button
                        type="button"
                        className={`${styles.userTypeBtn} ${!formData.isNewUser ? styles.active : ''}`}
                        onClick={handleToggle}
                    >
                        I am an existing user
                    </button>
                </div>
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
                            <div className={styles.countryCodeContainer}>
                                <span>+91</span>
                                <Image
                                    src="/assets/images/india_flag.png" // Replace with your country flag path
                                    alt="India Flag"
                                    width={24}
                                    height={15}
                                />
                            </div>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="91461 10405"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={styles.inputFieldPhoneNumber}
                                required
                            />
                        </div>
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
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>We like to hear more about you</label>
                        <textarea
                            className={styles.textarea} // Apply textarea class
                            name="additionalInfo"
                            placeholder="I like to do my eye check up"
                            value={formData.additionalInfo || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" className={styles.editBtn}>Edit</button>
                        <button type="submit" className={styles.bookAppointmentBtn} disabled={isRedirecting}>
                            {isRedirecting ? "Redirecting..." : "Book Appointment"}
                        </button>
                    </div>
                </form>
            </div>
            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
