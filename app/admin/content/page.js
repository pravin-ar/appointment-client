"use client";
import Head from 'next/head';
import Link from 'next/link';

export default function ContentPage() {
    return (
        <>
            <Head>
                <title>Content Management</title>
                <link rel="stylesheet" href="/styles/styles.css" />
            </Head>
            <div className="admin-page">
                <section className="admin-section">
                    <h2 className="section-title">Content Management</h2>
                    <div className="admin-buttons">
                        <Link href="/admin/content/about-us">
                            <button className="admin-btn">About Us</button>
                        </Link>
                        <Link href="/admin/content/products">
                            <button className="admin-btn">Product Card</button>
                        </Link>
                        <Link href="/admin/content/service-img">
                            <button className="admin-btn">Service Img</button>
                        </Link>
                        <Link href="/admin/content/service-card-text">
                            <button className="admin-btn">Service Card Text</button>
                        </Link>
                        <Link href="/admin/content/product-type">
                            <button className="admin-btn">Product Type</button>
                        </Link>
                        <Link href="/admin/content/policies">
                            <button className="admin-btn">Policies</button>
                        </Link>
                        <Link href="/admin/content/create-admin">
                            <button className="admin-btn">Create Admin</button>
                        </Link>
                        <Link href="/admin/content/aboutus">
                            <button className="admin-btn">About Us</button>
                        </Link>
                        <Link href="/admin/content/tags">
                            <button className="admin-btn">Product Category</button>
                        </Link>
                        <Link href="/admin/content/availability-slot">
                            <button className="admin-btn">availability Slot</button>
                        </Link>
                        <Link href="/admin/content/policy">
                            <button className="admin-btn">Our Policy</button>
                        </Link>
                        <Link href="/admin/content/faq">
                            <button className="admin-btn">FAQ</button>
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
