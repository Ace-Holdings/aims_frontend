"use client";

// components/layout/AdminNavbar.tsx
import React, { useEffect, useState } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [username, setUsername] = useState("");
    const router = useRouter();

    const toggleDialog = () => {
        setIsDialogOpen(!isDialogOpen);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token); // Adjust this to match your token structure
                console.log(decodedToken);
                setUsername(decodedToken.user || "User");
            } catch (e) {
                console.error(e);
            }
        } else {
            setUsername("User");
        }
    }, []);

    // handler function to route back to the login page when
    const handleLogout =  () => {
        try {
            localStorage.removeItem("token");
            router.push('/')
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="relative bg-white px-6 py-4 flex items-center justify-between rounded-b-md">
            {/* Navbar content */}

                <p className="text-gray-700 font-semibold mr-4">{username}</p>
                <button
                    onClick={toggleDialog}
                    className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                >
                    <FiUser className="text-gray-600" size={20} />
                </button>


            <div
                className={`absolute top-full right-0 mt-4 w-48 rounded-md shadow-lg z-50 transition-all duration-300 transform ${
                    isDialogOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
            >
                <ul className="py-1 bg-white rounded-md">
                    <li>
                        <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => handleLogout()}
                        >
                            <FiLogOut className="mr-2" />
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
