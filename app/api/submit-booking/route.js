import { promises as fs } from 'fs';
import { google } from 'googleapis';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import path from 'path';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, EMAIL_USER, EMAIL_PASS } = process.env;

export async function POST(req) {
    const { fullName, email, datePicker, timeSlot, dob, phoneNumber, isNewUser, selectedServices } = await req.json();

    if (!fullName || !email || !datePicker || !timeSlot || !dob || !phoneNumber || typeof isNewUser === 'undefined' || selectedServices.length === 0) {
        return new Response(JSON.stringify({ error: 'All fields are required, including services' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Format dates
    const appointmentDate = datePicker; // Date in 'YYYY-MM-DD' format
    const formattedDob = new Date(dob).toISOString().slice(0, 10);

    // Convert selected services into a comma-separated string
    const serviceNames = selectedServices.join(', ');

    // Get current timestamp for create_at field
    const createAt = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format as 'YYYY-MM-DD HH:MM:SS'

    let connection;

    try {
        // Save booking to the database
        connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        // Start a transaction
        await connection.beginTransaction();

        // Check if the slot is still available
        const [slotRows] = await connection.execute(
            'SELECT * FROM master_slot WHERE slot_date = ? AND slot_id = ?',
            [appointmentDate, timeSlot]
        );

        if (slotRows.length === 0) {
            await connection.rollback();
            return new Response(JSON.stringify({ error: 'Selected slot is no longer available. Please choose another slot.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Remove the booked slot from master_slot
        await connection.execute(
            'DELETE FROM master_slot WHERE slot_date = ? AND slot_id = ?',
            [appointmentDate, timeSlot]
        );

        // Save the appointment
        await connection.execute(
            'INSERT INTO appointments (full_name, dob, phone_number, email, appointment_date, time_slot, service_name, isNew_user, create_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [fullName, formattedDob, phoneNumber, email, appointmentDate, timeSlot, serviceNames, isNewUser, createAt]
        );

        // Commit the transaction
        await connection.commit();

        // Load the service account key from the config folder
        const keyPath = path.join(process.cwd(), 'config', 'service-account-key.json');
        const serviceAccountKey = await fs.readFile(keyPath, 'utf-8');

        // Setup Google Auth
        const oAuth2Client = new google.auth.GoogleAuth({
            credentials: JSON.parse(serviceAccountKey),
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
        });

        const authClient = await oAuth2Client.getClient();
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        // Fetch slot time from slot_table
        const [slotTimeRows] = await connection.execute(
            'SELECT slot_time FROM slot_table WHERE id = ?',
            [timeSlot]
        );

        const slotTime = slotTimeRows[0]?.slot_time;
        if (!slotTime) {
            console.error('Invalid slot_id:', timeSlot);
            throw new Error('Invalid slot_id');
        }

        // Parse the time strings
        const { startUTC, endUTC } = convertToUTC(appointmentDate, slotTime);

        // Define the event with the UTC times
        const event = {
            summary: 'Appointment Booking',
            description: `Booking for ${fullName}`,
            start: {
                dateTime: startUTC.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: endUTC.toISOString(),
                timeZone: 'UTC',
            },
        };

        // Insert the event into the calendar
        const insertedEvent = await calendar.events.insert({
            auth: authClient,
            calendarId: EMAIL_USER,
            resource: event,
        });

        console.log('Event created: %s', insertedEvent.data.htmlLink);

        // Send booking confirmation email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });

        const serviceList = selectedServices.map(service => `<li>${service}</li>`).join(''); // Create an HTML list of selected services

        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Booking Confirmation',
            html: `
        <p>Dear ${fullName},</p>
        <p>Your booking for ${slotTime} on ${new Date(appointmentDate).toDateString()} has been confirmed and added to your calendar!</p>
        <p>Here are the services you selected:</p>
        <ul>${serviceList}</ul>
        <p>Thank you for choosing our service!</p>
        <p><a href="${insertedEvent.data.htmlLink}">Click here</a> to view the event on your calendar.</p>
    `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);

        return new Response(JSON.stringify({ message: 'Booking confirmed and email sent!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error:', error);
        if (connection) {
            await connection.rollback();
        }
        return new Response(JSON.stringify({ error: 'Failed to process booking' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Helper function to convert the selected time slot to UTC
function convertToUTC(date, timeSlot) {
    const [startTimeStr, endTimeStr] = timeSlot.split(' - ');
    const { hours: startHours, minutes: startMinutes, period: startPeriod } = parseTime(startTimeStr);
    const { hours: endHours, minutes: endMinutes, period: endPeriod } = parseTime(endTimeStr);

    const startDateTime = new Date(`${date}T00:00:00`);
    const endDateTime = new Date(`${date}T00:00:00`);

    startDateTime.setHours(convertTo24HourFormat(startHours, startMinutes, startPeriod));
    startDateTime.setMinutes(startMinutes);
    endDateTime.setHours(convertTo24HourFormat(endHours, endMinutes, endPeriod));
    endDateTime.setMinutes(endMinutes);

    const startUTC = new Date(startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000);
    const endUTC = new Date(endDateTime.getTime() - endDateTime.getTimezoneOffset() * 60000);

    return { startUTC, endUTC };
}

function parseTime(timeStr) {
    const [time, period] = timeStr.trim().split(' ');
    const [hours, minutes] = time.split(':');
    return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10), period };
}

function convertTo24HourFormat(hours, minutes, period) {
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours;
}
