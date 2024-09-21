"use client";
import Head from 'next/head';
import Link from 'next/link';

export default function AdminHome() {
    return (
        <>
            <Head>
                <title>Admin Panel</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className="admin-page">
                <section className="admin-section">
                    <h2 className="section-title">Admin Panel</h2>
                    <div className="admin-buttons">
                        <Link href="/admin/add-schedule">
                            <button className="admin-btn">Add Schedule</button>
                        </Link>
                        <Link href="/admin/view-data">
                            <button className="admin-btn">View Data</button>
                        </Link>
                        <Link href="/admin/content">
                            <button className="admin-btn">Content</button>
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
