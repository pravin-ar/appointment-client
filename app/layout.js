// app/layout.js
import { Lato } from 'next/font/google';
import '../styles/styles.css'; // Import your custom global styles
import './globals.css'; // Import any built-in global styles (if any)

export const metadata = {
  title: 'My Next.js App',
  description: 'A Next.js application',
};

// Initialize the Lato font
const lato = Lato({
  weight: ['400', '700'], // Add more weights if necessary
  subsets: ['latin'], // Choose the subsets you need
  variable: '--font-lato', // Optional: CSS variable for the font
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lato.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
