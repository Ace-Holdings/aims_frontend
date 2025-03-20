import {FiBriefcase, FiChevronLeft, FiChevronRight, FiHome, FiUsers} from "react-icons/fi";
import {MdOutlineInventory2, MdOutlinePointOfSale} from "react-icons/md";
import {GrDocumentPerformance} from "react-icons/gr";
import {LuLogs, LuReceipt} from "react-icons/lu";
import React from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function ManagerSidebar({ isCollapsed, toggleSidebar }: any) {
    const router = useRouter();

    const menuItems = [
        { icon: <FiHome />, label: "Home", path: "/manager" },
        { icon: <FiBriefcase />, label: "Assignments", path: "/manager/assignments" },
        { icon: <FiUsers />, label: "Users", path: "/manager/users" },
        { icon: <MdOutlineInventory2 />, label: "Inventory", path: "/manager/inventory" },
        { icon: <MdOutlinePointOfSale />, label: "Sales", path: "/manager/sales" },
        { icon: <GrDocumentPerformance />, label: "Bid documents", path: "/manager/bids" },
        { icon: <LuReceipt/>, label: "Pay slips", path: "/manager/payslips"},
    ];

    return (
        <>
            <div className={`sticky bg-teal-900 text-white transition-all duration-300 ease-in-out h-screen ${isCollapsed ? "w-16" : "w-64"}`}>
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
                                    onClick={() => {router.push(item.path)}}
                                    className={`flex items-center px-4 py-2 w-full  font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-neon-blue transition-colors duration-200 text-md ${
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
        </>
    )
}