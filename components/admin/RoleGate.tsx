'use client';

import { useEffect, useState } from 'react';

interface RoleGateProps {
    children: React.ReactNode;
    allowedRoles: ('superadmin' | 'admin' | 'editor' | 'writer')[];
    fallback?: React.ReactNode;
}

/**
 * RoleGate Component
 * Conditionally renders children based on the current user's role.
 * Used to protect UI sections that should only be visible to certain roles.
 */
export default function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get user from localStorage
        const userData = localStorage.getItem('adminUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserRole(user.role);
            } catch {
                setUserRole(null);
            }
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return null; // Don't flash content while checking
    }

    if (!userRole || !allowedRoles.includes(userRole as any)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hook version for programmatic role checking
 */
export function useUserRole() {
    const [user, setUser] = useState<{ role: string; name: string; email: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('adminUser');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch {
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    const isSuperAdmin = user?.role === 'superadmin';
    const isAdmin = user?.role === 'admin';
    const isEditor = user?.role === 'editor';
    const isWriter = user?.role === 'writer';
    const canManageUsers = isSuperAdmin;
    const canPublish = isSuperAdmin || isAdmin || isEditor;
    const canManageLifecycle = isSuperAdmin;

    return {
        user,
        role: user?.role,
        isLoading,
        isSuperAdmin,
        isAdmin,
        isEditor,
        isWriter,
        canManageUsers,
        canPublish,
        canManageLifecycle,
    };
}
