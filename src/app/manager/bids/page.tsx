"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import ActiveBids from "@/components/tiles/activeBids";
import PreviousBids from "@/components/tiles/previousBids";
import ManagerSidebar from "@/components/layout/managerSidebar";
import {useEffect, useState} from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import {jwtDecode} from "jwt-decode";
import {useRouter} from "next/navigation";

export default function ManagerBids() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [bidFile, setBidFile] = useState("");
    const [editFile, setEditFile] = useState("");
    const [bidFileUrl, setBidFileUrl] = useState<string | null>(null);
    const [editFileUrl, setEditFileUrl] = useState<string | null>(null);
    const router = useRouter();

    const user = jwtDecode(localStorage.getItem("token")).user;

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }

    const handleBidFileChange = (event: any) => {
        setBidFile(event.target.files[0]);
    };

    const handleEditFileChange = (event: any) => {
        setEditFile(event.target.files[0]);
    }

    useEffect(() => {
        const storedState = localStorage.getItem("adminSidebarCollapsed");
        if (storedState !== null) {
            setIsSidebarCollapsed(storedState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("adminSidebarCollapsed", String(newState));
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token) {
            router.push("/");
        }

        try {
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles || [];

            if (!roles.includes("ROLE_MANAGER")) {
                router.push("/");
            }
        } catch (e) {
            console.error(e);
            router.push("/");
        }

    }, [router]);

    const handleBidSubmit = async (event: any) => {
        event.preventDefault();

        if (!bidFile) {
            alert("Please select a file before submitting.");
            return;
        }

        const formData = new FormData();
        formData.append("description", description);
        formData.append("deadline", deadline.toISOString());
        formData.append("bidDocumentFile", bidFile);
        formData.append("editableFileForBid", editFile);
        formData.append("lastModifiedBy", user);


        try {
            const response = await fetch("http://localhost:3002/bids", {
                method: "POST",
                headers: {
                    "authorization": 'Bearer ' + localStorage.getItem('token'),
                },
                body: formData,
            });

            if (response.ok) {
                closeDialog();
                window.location.reload();
            } else {
                console.log("Could not create bid");
            }
        } catch (e) {
            console.log(e);
        }
    }


    return (
        <>
            <div className={` flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""}`}>
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
                            <ActiveBids/>
                        </div>

                        {/* Previous Bids Section */}
                        <div className="w-full mt-10 text-black">
                            <PreviousBids/>
                        </div>
                    </div>
                </div>

            </div>

            {isDialogOpen && (
                <div
                    className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Add bid</h2>
                        <div className="h-2"/>
                        <form onSubmit={handleBidSubmit}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Bid description"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Deadline
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker
                                        selected={deadline}
                                        onChange={(date) => {
                                            setDeadline(date)
                                        }}
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white w-[200px] border border-gray-300"
                                        placeholderText="Select start date and time"
                                        popperClassName="z-50"
                                        popperPlacement="bottom"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Bid document file
                                </label>
                                <input
                                    type="file"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Name of item"
                                    onChange={handleBidFileChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Editable for for bid
                                </label>
                                <input
                                    type="file"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Name of item"
                                    onChange={handleEditFileChange}
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                    onClick={closeDialog}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </>
    )
}