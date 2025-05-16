"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import {useEffect, useState} from "react";
import LogTable from "@/components/tables/logTable";
import {jwtDecode} from "jwt-decode";
import { useRouter } from "next/navigation";

export default function AdminLogs() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const router = useRouter();

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedState = window.localStorage.getItem("adminSidebarCollapsed");
            if (storedState !== null) {
                setIsSidebarCollapsed(storedState === "true");
            }
        }
    }, []);

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
            const decodedToken = jwtDecode(token) as { roles?: string[] };
            const roles: string[] = decodedToken.roles || [];

            if (!roles.includes("ROLE_ADMIN")) {
                router.push("/");
            }
        } catch (e) {
            console.log(e);
            router.push("/");
        }
    }, [router])

    return (
        <div className="h-screen flex bg-gray-100">
            <div
                className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                <SidebarAdmin isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
            </div>

            <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
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
                                d="M3 12h18M3 6h18M3 18h18"
                            />
                        </svg>
                        <span>Logs</span>
                        <div className="ml-auto">
                            <Navbar/>
                        </div>
                    </header>
                </div>
                <div className="h-7" />
                <LogTable/>
            </div>
        </div>
    )
}