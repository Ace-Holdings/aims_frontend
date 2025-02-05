"use client";

import React, { useState } from "react";
import { FiHome, FiBriefcase, FiUsers, FiSettings, FiChevronLeft, FiChevronRight, FiUser, FiLogOut } from "react-icons/fi";
import { MdOutlineInventory2, MdOutlinePointOfSale } from "react-icons/md";
import { GrDocumentPerformance } from "react-icons/gr";
import { LuLogs } from "react-icons/lu";
import Link from "next/link"
import { useRouter } from "next/navigation";



const SidebarAdmin = ({ isCollapsed, toggleSidebar }: any) => {
    const menuItems = [
        { icon: <FiHome />, label: "Home", path: "/admin" },
        { icon: <FiBriefcase />, label: "Assignments", path: "/admin/assignments" },
        { icon: <FiUsers />, label: "Users", path: "/admin/users" },
        { icon: <MdOutlineInventory2 />, label: "Inventory", path: "/admin/inventory" },
        { icon: <MdOutlinePointOfSale />, label: "Sales", path: "/admin/sales" },
        { icon: <GrDocumentPerformance />, label: "Bid documents", path: "/admin/bids" },
        { icon: <LuLogs />, label: "Logs", path: "/admin/logs" },
    ];



    return (
        <div className={`sticky bg-gray-900 text-white transition-all duration-300 ease-in-out h-screen ${isCollapsed ? "w-16" : "w-64"}`}>
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
                            <Link
                                href={item.path}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-neon-blue transition-colors duration-200 ${
                                    isCollapsed ? "justify-center" : "space-x-3"
                                }`}
                            >
                                <span className="text-xl text-neon-blue">{item.icon}</span>
                                {!isCollapsed && <span className="text-neon-pink">{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default SidebarAdmin;
