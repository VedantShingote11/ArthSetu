import './globals.css';
import GlobalNav from '@/components/GlobalNav';

export const metadata = {
    title: 'ArthSetu - Blockchain Microfinance',
    description: 'Transparent blockchain-based microfinance platform',
    icons: {
        icon: '/favicon.webp',
    },
};
import { AuthProvider } from '@/context/AuthContext';

import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <GlobalNav />
                    <main>{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}

