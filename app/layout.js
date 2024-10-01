// app/layout.js
import '../styles/styles.css'; // Import your custom global styles
import './globals.css'; // Import any built-in global styles (if any)

export const metadata = {
    title: 'My Next.js App',
    description: 'A Next.js application',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
