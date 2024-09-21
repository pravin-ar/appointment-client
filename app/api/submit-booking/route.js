import { promises as fs } from 'fs';
import { google } from 'googleapis';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import path from 'path';

// Load environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, EMAIL_USER, EMAIL_PASS } = process.env;

export async function POST(req) {
    const { fullName, email, datePicker, timeSlot, dob, phoneNumber, isNewUser } = await req.json(); // Include new field

    if (!fullName || !email || !datePicker || !timeSlot || !dob || !phoneNumber || typeof isNewUser === 'undefined') {
        return new Response(JSON.stringify({ error: 'All fields are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Parse the selected date and time (already in UTC from frontend)
    const startDateTime = new Date(datePicker); // Date in local time
    const { startUTC, endUTC } = convertToUTC(datePicker, timeSlot); // Convert the selected time slot to UTC

    // Format DOB to 'YYYY-MM-DD' format
    const formattedDob = new Date(dob).toISOString().slice(0, 10); // Only keep the date part, not the time part

    try {
        // Save booking to the database
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        await connection.execute(
            'INSERT INTO bookings (full_name, dob, phone_number, email, appointment_date, time_slot, isNew_user) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [fullName, formattedDob, phoneNumber, email, startDateTime.toISOString().slice(0, 10), timeSlot, isNewUser] // Save the human-readable time slot in the DB
        );

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

        // Define the event with the UTC times
        const event = {
            summary: 'Appointment Booking',
            description: `Booking for ${fullName}`,
            start: {
                dateTime: startUTC.toISOString(), // Use UTC start time for Google Calendar
                timeZone: 'UTC',
            },
            end: {
                dateTime: endUTC.toISOString(), // Use UTC end time for Google Calendar
                timeZone: 'UTC',
            },
        };

        // Insert the event into the calendar
        const insertedEvent = await calendar.events.insert({
            auth: authClient,
            calendarId: 'singhjai112ya@gmail.com',
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

        const mailOptions = {
            from: 'singhjai112ya@gmail.com',
            to: email,
            subject: 'Booking Confirmation',
            html: `
                <p>Dear ${fullName},</p>
                <p>Your booking for ${timeSlot} on ${startDateTime.toDateString()} has been confirmed and added to your calendar!</p>
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
        return new Response(JSON.stringify({ error: 'Failed to process booking' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Helper function to convert the selected time slot to UTC

function convertToUTC(date, timeSlot) {
    const [startTimeStr, endTimeStr] = timeSlot.split(' - ');
    const { hours: startHours, minutes: startMinutes, period: startPeriod } = parseTime(startTimeStr);
    const { hours: endHours, minutes: endMinutes, period: endPeriod } = parseTime(endTimeStr);

    const startDateTime = new Date(date);
    const endDateTime = new Date(date);

    startDateTime.setHours(convertTo24HourFormat(startHours, startMinutes, startPeriod));
    startDateTime.setMinutes(startMinutes);
    endDateTime.setHours(convertTo24HourFormat(endHours, endMinutes, endPeriod));
    endDateTime.setMinutes(endMinutes);

    // Convert to UTC
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
