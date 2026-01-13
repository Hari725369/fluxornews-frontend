import { redirect } from 'next/navigation';

export default function AdminRoot() {
    // Redirect /admin to /admin/dashboard
    redirect('/admin/dashboard');
}
