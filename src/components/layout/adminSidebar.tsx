"use client";

import React from "react";
import {
    FiHome, FiBriefcase, FiUsers, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { MdOutlineInventory2, MdOutlinePointOfSale } from "react-icons/md";
import { LuReceipt, LuLogs } from "react-icons/lu";
import { GrDocumentPerformance } from "react-icons/gr";
import { usePathname, useRouter } from "next/navigation";

const SidebarAdmin = ({ isCollapsed, toggleSidebar }: any) => {
    const router = useRouter();
    const currentPath = usePathname();

    const menuItems = [
        { icon: <FiHome />, label: "Home", path: "/admin" },
        { icon: <FiBriefcase />, label: "Assignments", path: "/admin/assignments" },
        { icon: <FiUsers />, label: "Users", path: "/admin/users" },
        { icon: <MdOutlineInventory2 />, label: "Inventory", path: "/admin/inventory" },
        { icon: <MdOutlinePointOfSale />, label: "Sales", path: "/admin/sales" },
        { icon: <GrDocumentPerformance />, label: "Bid documents", path: "/admin/bids" },
        { icon: <LuReceipt />, label: "Pay slips", path: "/admin/payslips" },
        { icon: <LuLogs />, label: "Logs", path: "/admin/logs" },
    ];

    return (
        <div className={`sticky bg-gradient-to-b from-gray-900 to-blue-500 text-white transition-all duration-300 ease-in-out h-screen ${isCollapsed ? "w-16" : "w-64"}`}>
            <div className="flex justify-end p-4">
                <button
                    onClick={toggleSidebar}
                    className="text-neon-blue hover:text-neon-pink transition-colors duration-200"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>
            <nav>
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const isActive = currentPath === item.path;
                        return (
                            <li key={index}>
                                <button
                                    onClick={() => router.push(item.path)}
                                    className={`flex items-center w-full font-medium rounded-lg transition-colors duration-200 text-md group ${
                                        isCollapsed ? "justify-center p-3" : "space-x-3 px-4 py-2"
                                    } hover:bg-blue-600 focus:outline-none relative`}
                                >
                                    {/* Active vertical bar */}
                                    <span
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full ${isActive ? "bg-white" : "bg-transparent"}`}
                                    ></span>

                                    <span className="text-xl text-white">{item.icon}</span>
                                    {!isCollapsed && (
                                        <span className={`text-white ${isActive ? "font-bold" : "text-opacity-80"}`}>
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default SidebarAdmin;