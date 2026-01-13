import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Disclaimer() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-[1200px]">
                <div className="max-w-4xl mx-auto prose dark:prose-invert">
                    <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
                    <p>The information provided by Global News is for general informational purposes only.</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Accuracy of Information</h2>
                    <p>While we strive for accuracy, we cannot guarantee that all information is complete or up-to-date at all times.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
