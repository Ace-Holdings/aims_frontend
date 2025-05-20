"use client";

import Background from "../../../public/background.jpg";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequestResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("https://aims-api-latest.onrender.com/password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setIsSuccessVisible(true);
                setTimeout(() => {
                    setIsSuccessVisible(false);
                    router.push("/");
                }, 3000);
            } else {
                console.log("Something went wrong");
            }
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="w-16 h-16 border-8 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div
                className={`relative min-h-screen transition-all duration-300 ${
                    loading || isSuccessVisible ? "blur-sm pointer-events-none" : ""
                }`}
            >
                <div
                    className={`hero min-h-screen flex items-center justify-center`}
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
                                <div className="absolute top-4 left-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/")}
                                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                        aria-label="Go back"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-5 h-5 mr-1"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                </div>

                                <h2 className="text-lg text-center text-black mb-6">Reset Password</h2>

                                <form onSubmit={handleRequestResetPassword}>
                                    <div className="mb-6">
                                        <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            id="email"
                                            placeholder="Enter your email"
                                            className="w-full p-3 border border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md transition-colors duration-300"
                                    >
                                        Send Reset Link
                                    </button>
                                </form>
                            </div>
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
                    <h2 className="text-xl font-bold text-gray-800">Link Sent!</h2>
                    <p className="text-sm text-gray-600 mt-2">A password reset link has been sent to your email.</p>
                </div>
            </div>
        </>
    );
}