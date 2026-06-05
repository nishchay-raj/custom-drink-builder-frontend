'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';

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

                        // on success, set a client-side flag and navigate
                        setLoading(false);
                        try {
                            localStorage.setItem('isLoggedIn', 'true');
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