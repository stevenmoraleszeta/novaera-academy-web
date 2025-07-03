"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const RequireAuth = ({ children }) => {
    const { currentUser, isCheckingUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isCheckingUser && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isCheckingUser, router]);

    if (isCheckingUser || !currentUser) {
        return null; 
    }

    return children;
};

export default RequireAuth;

// "use client";

// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';

// const RequireAuth = ({ children }) => {
//     const { currentUser } = useAuth();
//     const router = useRouter();

//     if (!currentUser) {
//         router.push('/login');
//         return null;
//     }

//     return children;
// };

// export default RequireAuth;

