"use client"

// components/layout/AdminNavbar.tsx
import React, { useState } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";

const Navbar = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const toggleDialog = () => {
        setIsDialogOpen(!isDialogOpen);
    };

    return (

            <div className="relative">
                <button
                    onClick={toggleDialog}
                    className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                >
                    <FiUser className="text-gray-600" size={20} />
                </button>
                {isDialogOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                        <ul className="py-1">
                            <li>
                                <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => alert("Go to settings")}
                                >
                                    <FiSettings className="mr-2" />
                                    Settings
                                </button>
                            </li>
                            <li>
                                <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => alert("Logging out")}
                                >
                                    <FiLogOut className="mr-2" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

    );
};

export default Navbar;