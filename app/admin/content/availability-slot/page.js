"use client"; // Ensures this is a Client Component

import Head from 'next/head';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function AvailabilitySlot() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots();
            generateTimeSlots();
        } else {
            setAvailableSlots([]);
            setSelectedSlots([]);
            setTimeSlots([]);
        }
    }, [selectedDate]);

    // Helper function to format date in 'YYYY-MM-DD' in local time
    function formatDateLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const fetchAvailableSlots = async () => {
        if (!selectedDate) return;

        const dateString = formatDateLocal(selectedDate); // Use local date format

        try {
            const response = await fetch(`/api/availability?date=${dateString}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            if (response.ok) {
                const { availableSlotIds } = data;
                setAvailableSlots(availableSlotIds);
                setSelectedSlots(availableSlotIds); // Pre-select available slots
            } else {
                console.error(data.error);
                setAvailableSlots([]);
                setSelectedSlots([]);
            }
        } catch (error) {
            console.error('Error fetching available slots:', error);
            setAvailableSlots([]);
            setSelectedSlots([]);
        }
    };

    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM

        let slotId = 1;
        for (let hour = startHour; hour < endHour; hour++) {
            for (let i = 0; i < 2; i++) {
                const minutes = i * 30;
                const startTime = `${hour % 12 || 12}:${minutes === 0 ? '00' : '30'} ${hour < 12 ? 'AM' : 'PM'}`;
                const nextHour = minutes === 30 ? hour + 1 : hour;
                const nextMinutes = (minutes + 30) % 60;
                const endTime = `${nextHour % 12 || 12}:${nextMinutes === 0 ? '00' : '30'} ${(nextHour < 12 || nextHour === 24) ? 'AM' : 'PM'}`;
                const timeString = `${startTime} - ${endTime}`;
                slots.push({ id: slotId, time: timeString });
                slotId++;
            }
        }
        setTimeSlots(slots);
    };

    const handleSlotClick = (slotId) => {
        if (selectedSlots.includes(slotId)) {
            setSelectedSlots(selectedSlots.filter(id => id !== slotId));
        } else {
            setSelectedSlots([...selectedSlots, slotId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        const dateString = formatDateLocal(selectedDate); // Use local date format

        try {
            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateString, selectedSlots })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Availability updated successfully.');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error updating availability:', error);
            alert('An error occurred while updating availability. Please try again later.');
        }
    };

    return (
        <>
            <Head>
                <title>Set Availability</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className="book-now-page">
                <section className="book-now-section">
                    <h2 className="section-title">Set Your Availability</h2>
                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="datePicker">Select Date</label>
                            <DatePicker
                                id="datePicker"
                                selected={selectedDate}
                                onChange={(date) => { setSelectedDate(date); }}
                                dateFormat="MMMM d, yyyy"
                                placeholderText="Select a date"
                                minDate={new Date()}
                                className="date-picker"
                                required
                            />
                        </div>
                        {selectedDate && (
                            <div className="form-group">
                                <label htmlFor="timeSlots">Select Time Slots</label>
                                <div className="time-slots-container">
                                    {timeSlots.map((slot) => {
                                        const isSelected = selectedSlots.includes(slot.id);
                                        return (
                                            <button
                                                type="button"
                                                key={slot.id}
                                                className={`time-slot ${isSelected ? 'active' : ''}`}
                                                onClick={() => handleSlotClick(slot.id)}
                                            >
                                                {slot.time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <button type="submit" className="book-now-btn">Save Availability</button>
                    </form>
                </section>
            </div>
        </>
    );
}
