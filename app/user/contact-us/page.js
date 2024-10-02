// app/book-now/page.js
"use client"; // Ensures this is a Client Component

import Head from 'next/head';
import Image from 'next/image'; // Import the Image component from next/image
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarHome from '../../components/NavbarHome'; // Import the Navbar component
import styles from './contact.module.css'; // Import the custom CSS module

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
    
        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            alert("Please fill all required fields before submitting.");
            return;
        }
    
        try {
            const res = await fetch('/api/contact-us', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
    
            const data = await res.json();
    
            if (res.status === 200) {
                alert("Your message has been sent successfully!");
                setFormData({
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    additionalInfo: ''
                });
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error during submission:', error);
            alert('An error occurred while sending your message. Please try again later.');
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
            <NavbarHome />
            <Head>
                <title>Book Now</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className={styles.bookNowPage}>
                <h1 className={styles.pageTitle}>Contact Us</h1>
                <p className={styles.pageSubtitle}>Please feel free to contact us any time we will get back to you as soon as possible.</p>
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
                        <button type="submit" className={styles.bookAppointmentBtn} disabled={isRedirecting}>
                            {isRedirecting ? "Redirecting..." : "Send"}
                        </button>
                    </div>
                </form>
            </div>
            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
