"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import {useState} from "react";
import SalesTile from "@/components/tiles/sales";
import DatePicker from "react-datepicker";

export default function AdminSales() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }

    const sales = [
        { id: 1, title: "Sale 1", date: "2025-01-20", amount: 200.5 },
        { id: 2, title: "Sale 2", date: "2025-01-22", amount: 150.0 },
        { id: 3, title: "Sale 3", date: "2025-01-19", amount: 300.75 },
        { id: 4, title: "Sale 4", date: "2025-01-21", amount: 120.0 },
    ];

    // Sort sales by date (latest to earliest)
    const sortedSales = sales.sort((a: any, b: any) => new Date(b.date) - new Date(a.date));

    return (
        <>
            <div className={`h-screen flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""}`}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <SidebarAdmin isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>
                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>

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
                                    d="M8 2h8l-2 4h-4l-2-4z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 8c-1.5 1.5-1.5 6.5 0 8s6 6 7 6 6-3 7-6 1.5-6.5 0-8H5z"
                                />
                            </svg>
                            <span>Sales</span>
                            <div className="ml-auto">
                                <Navbar/>
                            </div>

                        </header>
                    </div>

                    {/* Section with Add Sale Button and Horizontal Line */}
                    <div className="py-6 mt-4">
                        <div className="flex justify-center">
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
                                Add Sale
                            </button>
                        </div>
                        <div className="mt-4">

                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="max-w-4xl mx-auto mb-2">
                            {sortedSales.map((sale) => (
                                <SalesTile
                                    key={sale.id} // Use a unique key for each tile
                                    title={sale.title}
                                    date={sale.date}
                                    amount={sale.amount}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isDialogOpen && (
                <div
                    className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Add stock item</h2>
                        <div className="h-2"/>
                        <form>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    quantity
                                </label>
                                <input
                                    type="number"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Item quantity"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    pricePerUnit
                                </label>
                                <input
                                    type="number"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Price per item"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Item name
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Name of item"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Item description"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Date and Time added
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white w-[200px]"
                                        placeholderText="Select start date and time"
                                        popperClassName="z-50"
                                        popperPlacement="bottom"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                                    Location
                                </label>
                                <select
                                    id="role"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    defaultValue=""


                                >
                                    <option value="" disabled>
                                        Select location
                                    </option>
                                    <option value="shop">Shop</option>
                                    <option value="warehouse">Warehouse</option>
                                </select>
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