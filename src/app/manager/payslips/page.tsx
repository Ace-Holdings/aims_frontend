"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import PaySlipsTile from "@/components/tiles/payslips";
import {useEffect, useState} from "react";
import ManagerSidebar from "@/components/layout/managerSidebar";

export default function ManagerPayslips() {

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [payslips, setPayslips] = useState([]);
    const [filteredPaySlips, setFilteredPaySlips] = useState(payslips);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {
        const filtered = payslips.filter((payslip) =>
            payslip.user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPaySlips(filtered);
    }, [searchTerm, payslips]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const fetchPaySlips = async () => {
            try {
                const response = await fetch('http://localhost:3002/payslips', {
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                if (!response.ok) {
                    console.log(response);
                    return;
                }
                const data = await response.json();
                setPayslips(data);
            } catch (e) {
                console.log(e);
            }
        }

        fetchPaySlips();
    }, []);

    return(
        <>
            <div className={` flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""} font-custom `}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <ManagerSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>
                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 mb-10`}>

                    <div className="bg-white  p-4 sticky top-0 z-10">
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
                                    d="M4 3v18l2-1 2 1 2-1 2 1 2-1 2 1 2-1V3H4z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7h8M8 11h8M8 15h4"
                                />
                            </svg>
                            <span>Pay slips</span>
                            <div className="ml-auto">
                                <Navbar/>
                            </div>

                        </header>
                    </div>

                    {/* Section with Add Sale Button and Horizontal Line */}
                    <div className="py-6 mt-4 items-center font-custom">
                        <div className="flex justify-center">
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                                onClick={() => setIsDialogOpen(true)}
                            >
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
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                                Create pay slip
                            </button>
                        </div>
                        <div className="mt-4">

                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            placeholder="Search by employee..."
                            onChange={handleSearchChange}
                            className="mb-4 p-2 border border-gray-300 rounded-lg shadow-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />

                        {/* Payslips Tiles */}
                        <div className="max-w-4xl w-full mx-auto space-y-6 flex flex-col items-center">
                            {filteredPaySlips.length > 0 ? (
                                [...filteredPaySlips]
                                    .sort((a, b) => b.payslipId - a.payslipId)
                                    .map((payslip) => (
                                        <PaySlipsTile
                                            key={payslip.payslipId}
                                            id={payslip.payslipId}
                                            employee={payslip.user.username}
                                            earnings={payslip.totalEarnings}
                                            deductions={payslip.deductions}
                                            date={payslip.updatedAt}
                                        />
                                    ))
                            ) : (
                                <p className="text-gray-500">No sales found for this customer.</p>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </>
    )
}