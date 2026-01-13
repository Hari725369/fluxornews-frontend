export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="font-sans [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_h4]:font-sans [&_h5]:font-sans [&_h6]:font-sans min-h-screen bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-[var(--text-primary)]">
            {children}
        </div>
    );
}
