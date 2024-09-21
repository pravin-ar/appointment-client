"use client";
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons

export default function ViewData() {
    const [bookings, setBookings] = useState([]);
    const [editMode, setEditMode] = useState(null);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch('/api/crud-operation/get-bookings');
                const data = await response.json();
                setBookings(data.bookings);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };

        fetchBookings();
    }, []);

    // Handle Delete
    // const handleDelete = async (id) => {
    //     if (!confirm('Are you sure you want to delete this booking?')) return;
    //     try {
    //         const response = await fetch(/api/crud-operation/delete-booking?id=${id}, {
    //             method: 'DELETE',
    //         });
    //         if (response.ok) {
    //             setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== id));
    //             alert('Booking deleted successfully!');
    //         } else {
    //             alert('Failed to delete booking.');
    //         }
    //     } catch (error) {
    //         console.error('Error deleting booking:', error);
    //         alert('An error occurred while deleting the booking.');
    //     }
    // };

    // Handle Edit
    const handleEdit = (id) => {
        setEditMode(id);
        const currentBooking = bookings.find((booking) => booking.id === id);
        setEditedData(currentBooking);
    };

    // Handle Save
    const handleSave = async (id) => {
        try {
            const response = await fetch('/api/crud-operation/update-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });
            if (response.ok) {
                setBookings((prevBookings) => 
                    prevBookings.map((booking) => (booking.id === id ? editedData : booking))
                );
                setEditMode(null);
                alert('Booking updated successfully!');
            } else {
                alert('Failed to update booking.');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('An error occurred while updating the booking.');
        }
    };

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <>
            <Head>
                <title>View All Bookings</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className="view-data-page">
                <section className="view-data-section">
                    <h2 className="section-title">View All Bookings</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
                                <th>Date of Birth</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th>Appointment Date</th>
                                <th>Time Slot</th>
                                <th>Booking Time</th>
                                <th>Is New User</th>
                                <th>Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.id}</td>
                                    <td>
                                        {editMode === booking.id ? (
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={editedData.full_name}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            booking.full_name
                                        )}
                                    </td>
                                    <td>
                                        {editMode === booking.id ? (
                                            <input
                                                type="date"
                                                name="dob"
                                                value={new Date(editedData.dob).toISOString().slice(0, 10)}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            booking.dob.split('T')[0]
                                        )}
                                    </td>
                                    <td>
                                        {editMode === booking.id ? (
                                            <input
                                                type="text"
                                                name="phone_number"
                                                value={editedData.phone_number}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            booking.phone_number
                                        )}
                                    </td>
                                    <td>
                                        {editMode === booking.id ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editedData.email}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            booking.email
                                        )}
                                    </td>
                                    <td>{booking.appointment_date.split('T')[0]}</td>
                                    <td>{booking.time_slot}</td>
                                    <td>{booking.booking_time.split('T')[0]}</td>
                                    <td>
                                        {editMode === booking.id ? (
                                            <select
                                                name="isNew_user"
                                                value={editedData.isNew_user}
                                                onChange={handleInputChange}
                                            >
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                            </select>
                                        ) : (
                                            booking.isNew_user ? 'True' : 'False'
                                        )}
                                    </td>
                                    <td>
                                        {editMode === booking.id ? (
                                            <button className="save-btn" onClick={() => handleSave(booking.id)}>
                                                Save
                                            </button>
                                        ) : (
                                            <>
                                                <FaEdit
                                                    className="edit-icon"
                                                    onClick={() => handleEdit(booking.id)}
                                                />
                                                <FaTrash
                                                    className="delete-icon"
                                                    // onClick={() => handleDelete(booking.id)}
                                                />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </>
    );
}