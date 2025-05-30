"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import ActiveBids from "@/components/tiles/activeBids";
import PreviousBids from "@/components/tiles/previousBids";
import ManagerSidebar from "@/components/layout/managerSidebar";
import {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {useRouter} from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DecodedToken {
    id: number;
    user: string;
    roles: string[];
    iat?: number;
    exp?: number;
}

interface User {
    id: number;
    username: string;
    roles: string[];
}

export default function ManagerBids() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [bidFile, setBidFile] = useState<File | null>(null);
    const [editFile, setEditFile] = useState<File | null>(null);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }

    const handleBidFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setBidFile(event.target.files[0]);
        }
    };

    const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setEditFile(event.target.files[0]);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedState = localStorage.getItem("adminSidebarCollapsed");
            if (storedState !== null) {
                setIsSidebarCollapsed(storedState === "true");
            }
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);

        if (typeof window !== "undefined") {
            localStorage.setItem("adminSidebarCollapsed", String(newState));
        }
    };

    useEffect(() => {
        if (!token) {
            router.push("/");
            return;
        }

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            console.log(decodedToken);

            if (!decodedToken.roles?.includes("ROLE_MANAGER")) {
                router.push("/");
                return;
            }

            setUser({
                id: decodedToken.id,
                username: decodedToken.user,
                roles: decodedToken.roles,
            });
        } catch (error) {
            console.error("Invalid token", error);
            // router.push("/");
        }
    }, [router]);

    const handleBidSubmit = async (event: any) => {
        setLoading(true);
        event.preventDefault();

        if (!bidFile) {
            alert("Please select a file before submitting.");
            return;
        }

        const formData = new FormData();

        if (!(deadline instanceof Date) || isNaN(deadline.getTime())) {
            console.error("Invalid or missing deadline.");
            return;
        }

        formData.append("description", description);
        formData.append("deadline", deadline.toISOString());
        if (bidFile) {
            formData.append("bidDocumentFile", bidFile);
        }
        if (editFile) {
            formData.append("editableFileForBid", editFile);
        }
        formData.append("lastModifiedBy", user?.username || "");



        try {
            const response = await fetch("https://aims-api-latest.onrender.com/bids", {
                method: "POST",
                headers: {
                    "authorization": 'Bearer ' + token,
                },
                body: formData,
            });

            if (response.ok) {
                closeDialog();
                setLoading(false);
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            } else {
                console.log("Could not create bid");
            }
        } catch (e) {
            console.log(e);
            setLoading(false);
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

                        <div className="w-full mt-10 text-black">
                            <ActiveBids/>
                        </div>

                        <div className="w-full mt-10 text-black">
                            <PreviousBids/>
                        </div>
                    </div>
                </div>

            </div>

            {/* modal for creating bid */}
            <div
                className={`fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black transition-opacity duration-300 ${
                    isDialogOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg w-1/3 transform transition-all duration-300 ${
                        isDialogOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                    }`}
                >
                    <h2 className="text-lg font-medium mb-4 text-center font-bold">Add bid</h2>
                    <div className="h-2"/>
                    <form onSubmit={handleBidSubmit}>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Description</label>
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
                            <label htmlFor="deadline" className="block text-gray-700 font-medium mb-2">Deadline</label>
                            <div className="relative overflow-visible">
                                <DatePicker
                                    selected={deadline}
                                    onChange={(date) => setDeadline(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    placeholderText="Select start date and time"
                                    className="grow p-2 bg-white w-[200px] border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="bidFile" className="block text-gray-700 font-medium mb-2">Bid requirements file (PDF)</label>
                            <input
                                type="file"
                                id="bidFile"
                                accept="application/pdf"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                onChange={handleBidFileChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="editFile" className="block text-gray-700 font-medium mb-2">Editable form for bid (DOCX)</label>
                            <input
                                type="file"
                                id="editFile"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="w-full p-2 border border-gray-300 rounded-lg"
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

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="w-16 h-16 border-8 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
                </div>
            )}

        </>
    )
}