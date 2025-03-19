"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import ActiveAssignments from "@/components/tiles/activeAssignments";
import SalesBarChart from "@/components/charts/salesBarChart";
import NumberOfBids from "@/components/tiles/numberOfPendingBids";
import InventoryProportion from "@/components/charts/inventoryProportion";
import ManagerSidebar from "@/components/layout/managerSidebar";
import {useState, useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import {useRouter} from "next/navigation";

export default function ManagerHome() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const router = useRouter();

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



    return(
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                <ManagerSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
            </div>

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
                {/* Top Bar */}
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
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            />
                        </svg>
                        <span>Home</span>
                        <div className="ml-auto">
                            <Navbar/>
                        </div>

                    </header>
                </div>

                {/* Page Content */}
                <div className="p-6 text-black flex-2 flex flex-row mt-5 ">
                    <ActiveAssignments/>
                    <div className="w-20"/>
                    <SalesBarChart/>
                </div>
                <div className="p-6 text-black flex-2 flex flex-row">
                    <NumberOfBids/>
                    <div className="w-20"/>
                    <InventoryProportion/>
                </div>

            </div>
        </div>
    )
}