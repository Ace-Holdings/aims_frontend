"use client";

import React, {useEffect, useState} from "react";
import { FiHome, FiBriefcase, FiUsers, FiSettings, FiChevronLeft, FiChevronRight, FiUser, FiLogOut } from "react-icons/fi";
import { MdOutlineInventory2, MdOutlinePointOfSale } from "react-icons/md";
import { LuReceipt } from "react-icons/lu";
import { GrDocumentPerformance } from "react-icons/gr";
import { LuLogs } from "react-icons/lu";
import Link from "next/link"
import { useRouter } from "next/navigation";

const SidebarAdmin = ({ isCollapsed, toggleSidebar }) => {
    const router = useRouter();
    const currentPath = router.pathname;


    const menuItems = [
        { icon: <FiHome />, label: "Home", path: "/admin" },
        { icon: <FiBriefcase />, label: "Assignments", path: "/admin/assignments" },
        { icon: <FiUsers />, label: "Users", path: "/admin/users" },
        { icon: <MdOutlineInventory2 />, label: "Inventory", path: "/admin/inventory" },
        { icon: <MdOutlinePointOfSale />, label: "Sales", path: "/admin/sales" },
        { icon: <GrDocumentPerformance />, label: "Bid documents", path: "/admin/bids" },
        { icon: <LuReceipt/>, label: "Pay slips", path: "/admin/payslips"},
        { icon: <LuLogs />, label: "Logs", path: "/admin/logs" },
    ];

    return (
        <div className={`sticky bg-gradient-to-b from-gray-900 to-blue-500 text-white transition-all duration-300 ease-in-out h-screen ${
            isCollapsed ? "w-16" : "w-64"
        }`}
             style={{
                 ["--sidebar-width" as any]: isCollapsed ? "4rem" : "16rem"
             }}>
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
                <ul className="space-y-4">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <button
                                onClick={() => router.push(item.path)}
                                className={`flex items-center px-4 py-2 w-full font-medium rounded-lg 
      ${currentPath === item.path ? "bg-gray-700" : "hover:bg-gray-400"}
      focus:outline-none focus:ring-2 focus:ring-neon-blue transition-colors duration-200 text-md ${
                                    isCollapsed ? "justify-center" : "space-x-3"
                                }`}
                            >
                                <span className="text-xl text-neon-blue">{item.icon}</span>
                                {!isCollapsed && <span className="text-neon-pink">{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default SidebarAdmin;
