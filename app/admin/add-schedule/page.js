"use client"; // Ensures this is a Client Component

import Head from 'next/head';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function BookNow() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [dob, setDob] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
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

        if (!formData.fullName || !formData.email || !selectedDate || !formData.timeSlot || !dob || !formData.phoneNumber) {
            alert("Please fill all fields before booking.");
            return;
        }

        try {
            const res = await fetch('/api/submit-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, datePicker: selectedDate, dob: dob }),
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

    return (
        <>
            <Head>
                <title>Book Now</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className="book-now-page">
                <section className="book-now-section">
                    <h2 className="section-title">Add Your Schedule</h2>
                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dob">Date of Birth</label>
                            <DatePicker
                                id="dob"
                                selected={dob}
                                onChange={(date) => setDob(date)}
                                dateFormat="MMMM d, yyyy"
                                placeholderText="Select your date of birth"
                                className="date-picker"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="datePicker">Select Date</label>
                            <DatePicker
                                id="datePicker"
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="MMMM d, yyyy"
                                placeholderText="Select a date"
                                minDate={new Date()}
                                className="date-picker"
                                required
                            />
                        </div>
                        {selectedDate && (
                            <div className="form-group">
                                <label htmlFor="timeSlot">Select Time Slot</label>
                                <div className="time-slots-container">
                                    {timeSlots.map((slot, index) => (
                                        <button
                                            type="button"
                                            key={index}
                                            className={`time-slot ${formData.timeSlot === slot ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="isNewUser">New User</label>
                            <button type="button" onClick={handleToggle} className={`toggle-btn ${formData.isNewUser ? 'active' : ''}`}>
                                {formData.isNewUser ? 'Yes' : 'No'}
                            </button>
                        </div>
                        <button type="submit" className="book-now-btn" disabled={isRedirecting}>
                            {isRedirecting ? "Redirecting..." : "Add Schedule"}
                        </button>
                    </form>

                    {/* Confirmation Dialog */}
                    {showDialog && (
                        <div className="modal">
                            <div className="modal-content">
                                <span className="close-btn" onClick={() => setShowDialog(false)}>&times;</span>
                                <p style={{ color: 'black' }}>Thank you for booking with us!</p>
                                <button className="home-btn" onClick={handleCloseDialog}>Return to Home Page</button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
