import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function Terms() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-[1200px]">
                {/* Back Button */}
                {/* Back Button */}
                <div className="flex justify-end mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto prose dark:prose-invert">
                    <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
                    <p>Welcome to Global News. By accessing this website, you agree to comply with these terms.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Intellectual Property</h2>
                    <p>All content on this site is the property of Global News unless otherwise stated.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">User Conduct</h2>
                    <p>Users are expected to use the site responsibly and not engage in illegal activities.</p>
                </div>

                {/* Back Button Bottom */}

            </main>
            <Footer />
        </div>
    );
}
