"use client";

import EmployeeSidebar from "@/components/layout/employeeSidebar";
import Navbar from "@/components/layout/navbar";
import { useEffect, useState, FormEvent } from "react";
import LoanTile from "@/components/tiles/loan";
import LoanTable from "@/components/tables/loanTable";
import {jwtDecode} from "jwt-decode";
import { useRouter } from "next/navigation";

interface DecodedToken {
    id: number;
    roles?: string[];
}

export default function Loans() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [loanAmount, setLoanAmount] = useState(0);
    const [loanPurpose, setLoanPurpose] = useState("");
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);

        if (typeof window !== "undefined") {
            window.localStorage.setItem("adminSidebarCollapsed", String(newState));
        }
    };

    useEffect(() => {
        if (!token) {
            router.push("/");
            return;
        }

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            const roles = decodedToken.roles || [];

            if (!roles.includes("ROLE_EMPLOYEE")) {
                router.push("/");
            }
        } catch (e) {
            console.log(e);
            router.push("/");
        }
    }, [router]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedState = window.localStorage.getItem("adminSidebarCollapsed");
            if (storedState !== null) {
                setIsSidebarCollapsed(storedState === "true");
            }
        }
    }, []);

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const applicantId = token ? jwtDecode<DecodedToken>(token).id : null;

    const handleSubmitLoanRequest = async (e: FormEvent<HTMLFormElement>) => {
        setLoading(true);
        e.preventDefault();
        if (applicantId === null) {
            console.error("User not authenticated");
            return;
        }
        try {
            const response = await fetch("https://aims-api-latest.onrender.com/loanRequests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicantId,
                    amountRequested: loanAmount,
                    purpose: loanPurpose,
                }),
            });
            if (!response.ok) {
                console.log("Error submitting request");
                return;
            }
            setIsDialogOpen(false);
            setLoanAmount(0);
            setLoanPurpose("");

            setIsSuccessVisible(true);
            setTimeout(() => setIsSuccessVisible(false), 3000);
            setLoading(false);
            window.location.reload();
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <>
            <div className={`h-screen flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""}`}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? "w-16" : "w-64"} z-10 shadow-md transition-all duration-300`}
                >
                    <EmployeeSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                </div>

                <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
                    <div className="bg-white p-4 sticky top-0 z-10">
                        <header className="flex gap-2 items-center text-gray-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 3.75a3 3 0 110 6 3 3 0 010-6zm-6.364 9.114a1.5 1.5 0 012.121 0l1.06 1.06a1.5 1.5 0 002.121 0l1.06-1.06a1.5 1.5 0 012.121 0l1.06 1.06a1.5 1.5 0 002.121 0l1.06-1.06a1.5 1.5 0 112.121 2.121l-1.06 1.06a3 3 0 01-4.243 0l-.707-.707-.707.707a3 3 0 01-4.243 0l-1.06-1.06a1.5 1.5 0 010-2.121z"
                                />
                            </svg>
                            <span>Loans</span>
                            <div className="ml-auto">
                                <Navbar />
                            </div>
                        </header>
                    </div>

                    <div className="ml-6 mt-10 font-custom">
                        <div className="flex-row gap-4 flex">
                            <LoanTile />
                        </div>
                        <div className="h-7" />
                        <button
                            className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                            onClick={openDialog}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Request for loan
                        </button>
                    </div>
                    <div className="h-7" />
                    <LoanTable />
                </div>
            </div>

            <div
                className={`fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 text-black font-custom transition-opacity duration-300 ${
                    isDialogOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
                <div
                    className={`bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative transform transition-all duration-300 ease-out ${
                        isDialogOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4"
                    }`}
                >
                    <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-6 border border-blue-300">
                        <h2 className="text-lg font-semibold mb-2">Loan Application Conditions</h2>
                        <p className="text-sm">
                            - You must have been employed for at least 6 months.
                            <br />
                            - Maximum loan amount is determined by your salary bracket.
                            <br />
                            - Loan repayment is deducted monthly from your salary.
                            <br />
                            - Loans will be granted upon managerial review and you will be notified
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmitLoanRequest}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loan Amount (MWK)</label>
                            <input
                                type="text"
                                value={loanAmount.toLocaleString("en-US")}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/,/g, "");
                                    if (!isNaN(Number(raw))) {
                                        setLoanAmount(Number(raw));
                                    }
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter amount"
                                inputMode="numeric"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loan Purpose</label>
                            <textarea
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                required
                                value={loanPurpose}
                                onChange={(e) => setLoanPurpose(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsDialogOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded-md"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
                            >
                                Submit Application
                            </button>
                        </div>
                    </form>
                </div>
            </div>

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
                    <h2 className="text-xl font-bold text-gray-800">Loan Request Sent!</h2>
                    <p className="text-sm text-gray-600 mt-2">Your application has been submitted successfully.</p>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="w-16 h-16 border-8 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </>
    );
}