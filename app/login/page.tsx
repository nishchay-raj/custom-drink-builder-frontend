'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';

type UserRole = 'customer' | 'waiter' | 'kitchen' | 'manager';

const normalizeRole = (role: string | null | undefined): UserRole => {
    const value = role?.trim().toLowerCase();

    if (value === 'manager' || value === 'admin') return 'manager';
    if (value === 'waiter' || value === 'server' || value === 'staff') return 'waiter';
    if (value === 'kitchen' || value === 'chef' || value === 'cook') return 'kitchen';
    return 'customer';
};

const resolveRole = (data: unknown): UserRole => {
    const candidates = [
        (data as { role?: string } | null)?.role,
        (data as { userRole?: string } | null)?.userRole,
        (data as { type?: string } | null)?.type,
        (data as { user?: { role?: string } } | null)?.user?.role,
        (data as { user?: { userRole?: string } } | null)?.user?.userRole,
        (data as { user?: { type?: string } } | null)?.user?.type,
        (data as { data?: { role?: string } } | null)?.data?.role,
        (data as { data?: { userRole?: string } } | null)?.data?.userRole,
        (data as { data?: { type?: string } } | null)?.data?.type,
    ];

    return normalizeRole(candidates.find((value): value is string => Boolean(value)));
};

export default function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, { email, password }, {withCredentials: true});

            if (res.status < 200 || res.status >= 300) {
                throw new Error(res.statusText || 'Login failed');
            }

            const userRole = resolveRole(res.data);

            // on success, set a client-side flag and navigate
            setLoading(false);
            try {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', userRole);
            } catch (e) {
                // ignore if storage not available
            }

            router.push('/');
        } catch (err: any) {
            setLoading(false);
            setError(err?.message || 'An error occurred');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Your password"
                    />
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-black text-white rounded"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
        </div>
    );
}