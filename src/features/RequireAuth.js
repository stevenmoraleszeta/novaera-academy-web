"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const RequireAuth = ({ children }) => {
    const { currentUser } = useAuth();
    const router = useRouter();

    if (!currentUser) {
        router.push('/login');
        return null;
    }

    return children;
};

export default RequireAuth;
