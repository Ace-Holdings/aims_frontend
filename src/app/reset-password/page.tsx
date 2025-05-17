"use client";

import {useEffect, useState} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Background from "../../../public/background.jpg";

export default function PasswordResetForm() {
    const router = useRouter();


    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const param = url.searchParams.get("token");
            setToken(param);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:3002/password-reset/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: newPassword }),
            });

            if (res.ok) {
                setIsSuccessVisible(true);
                setTimeout(() => {
                    router.push("/");
                }, 3000);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Loader Overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="w-16 h-16 border-8 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Main Form UI */}
            <div
                className={`hero min-h-screen flex items-center justify-center transition-all duration-300 ${
                    loading || isSuccessVisible ? "blur-sm pointer-events-none" : ""
                }`}
                style={{
                    backgroundImage: `url(${Background.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="relative py-3 sm:max-w-lg sm:mx-auto w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-green-400 shadow-xl rounded-3xl"></div>

                        <div className="relative bg-white rounded-3xl shadow-lg px-6 py-10 sm:p-12 font-custom">
                            <h2 className="text-lg text-center text-black mb-6">Create New Password</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 mb-4">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md transition-colors duration-300"
                                >
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <div
                className={`fixed inset-0 flex items-center justify-center font-custom bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
                    isSuccessVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-xl shadow-2xl text-center max-w-md w-full transform transition-all duration-300 ${
                        isSuccessVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4"
                    }`}
                >
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                            <svg
                                className="w-12 h-12 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Password Updated!</h2>
                    <p className="text-sm text-gray-600 mt-2">Your password has been successfully reset.</p>
                </div>
            </div>
        </>
    );
}