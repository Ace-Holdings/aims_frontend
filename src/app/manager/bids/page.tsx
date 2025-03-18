"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import ActiveBids from "@/components/tiles/activeBids";
import PreviousBids from "@/components/tiles/previousBids";
import ManagerSidebar from "@/components/layout/managerSidebar";
import {useState} from "react";
import "react-datepicker/dist/react-datepicker.css";

export default function ManagerBids() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }

    return (
        <>
            <div className={` flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""} h-screen`}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <ManagerSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>
                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>

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
                                    d="M6 2.25A.75.75 0 0 0 5.25 3v18a.75.75 0 0 0 .75.75h13.5a.75.75 0 0 0 .75-.75V7.5l-5-5H6z"
                                />
                            </svg>
                            <span>Bids</span>
                            <div className="ml-auto">
                                <Navbar/>
                            </div>

                        </header>
                    </div>
                    <div className="flex flex-col items-center mt-10 px-6 font-custom">
                        {/* Add Bid Button */}
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
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            Add Bid
                        </button>

                        {/* Active Bids Section */}
                        <div className="w-full mt-10 text-black">
                            <h2 className="text-lg font-semibold mb-4">Active Bids</h2>
                            <ActiveBids/>
                        </div>

                        {/* Previous Bids Section */}
                        <div className="w-full mt-10 text-black">
                            <h2 className="text-lg font-semibold mb-4">Previous Bids</h2>
                            <PreviousBids/>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}