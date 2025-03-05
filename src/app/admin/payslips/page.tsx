"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import {useState, useEffect } from "react";
import SalesTile from "@/components/tiles/sales";
import DatePicker from "react-datepicker";

export default function Payslips() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [additionalEarnings, setAdditionalEarnings] = useState([]);
    const [earningValue, setEarningValue] = useState("");
    const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
    const [itemDescription, setItemDescription] = useState("");

    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleAddItem = () => {
        if (!itemDescription.trim()) return;
        setIsValueDialogOpen(true);
    };

    const handleSaveEarning = () => {
        if (!earningValue.trim()) return;
        setAdditionalEarnings([...additionalEarnings, { description: itemDescription, value: earningValue }]);
        setItemDescription("");
        setEarningValue("");
        setIsValueDialogOpen(false);
    };

    useEffect(() => {
        const fetchUsers = async (query: string) => {
            const response = await fetch(`http://localhost:3002/users/search?username=${query}`);
            if (!response.ok) {
                return
            }
            const data = await response.json();
            setUsers(data);
        }

        if (searchQuery) {
            fetchUsers(searchQuery);
        }
    }, [searchQuery]);

    return(
        <>
            <div className={` flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""} font-custom `}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <SidebarAdmin isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>
                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 mb-10`}>

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
                                    d="M4 3v18l2-1 2 1 2-1 2 1 2-1 2 1 2-1V3H4z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7h8M8 11h8M8 15h4"
                                />
                            </svg>
                            <span>Pay slips</span>
                            <div className="ml-auto">
                                <Navbar/>
                            </div>

                        </header>
                    </div>

                    {/* Section with Add Sale Button and Horizontal Line */}
                    <div className="py-6 mt-4 items-center font-custom">
                        <div className="flex justify-center">
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                                onClick={() => setIsDialogOpen(true)}
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
                                Create pay slip
                            </button>
                        </div>
                        <div className="mt-4">

                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            placeholder="Search by employee..."
                            className="mb-4 p-2 border border-gray-300 rounded-lg shadow-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />


                    </div>
                </div>
            </div>

            {isDialogOpen && (
                <div
                    className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Generate employee payslips</h2>
                        <div className="h-2"/>
                        <form >
                            <div className="mb-4 relative">
                                <label htmlFor="item" className="block text-gray-700 font-medium mb-2">
                                    Search Employee
                                </label>
                                <input
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                    }}
                                    type="text"
                                    id="item"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Type to search for employees"
                                />
                                {searchQuery && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                                        {users
                                            .map((user) => (
                                                <li
                                                    key={user.userId}
                                                    onClick={() => {
                                                        setSelectedEmployee(user);
                                                        setSearchQuery("");
                                                    }}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {user.username}

                                                </li>
                                            ))}
                                    </ul>
                                )}

                                {selectedEmployee && (
                                    <p className="mt-2 text-green-600">Selected: {selectedEmployee.username}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Additional Earnings
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        id="title"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="Item description"
                                        value={itemDescription}
                                        onChange={(e) => setItemDescription(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Earnings List */}
                                {additionalEarnings.length > 0 && (
                                    <ul className="mt-2 text-gray-700">
                                        {additionalEarnings.map((earning, index) => (
                                            <li key={index} className="flex justify-between p-2 border rounded-lg mb-1">
                                                <span>{earning.description}</span>
                                                <span className="font-bold text-green-600">+${earning.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Dialog (Modal) */}
                                {isValueDialogOpen && (
                                    <div className="fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-50">
                                        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                                            <h2 className="text-lg font-bold mb-4">Enter Earning Value</h2>
                                            <input
                                                type="number"
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                                placeholder="Amount"
                                                value={earningValue}
                                                onChange={(e) => setEarningValue(e.target.value)}
                                            />
                                            <div className="flex justify-end mt-4 space-x-2">
                                                <button onClick={() => setIsDialogOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                                                    Cancel
                                                </button>
                                                <button type="button" onClick={handleSaveEarning} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Customer
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
                                    Date and Time of sale
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker

                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white w-[220px] border border-gray-300"
                                        placeholderText="Select start date and time"
                                        popperClassName="z-50"
                                        popperPlacement="bottom"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                    onClick={() => setIsDialogOpen(false)}
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