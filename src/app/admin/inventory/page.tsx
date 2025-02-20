"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import TotalAssignments from "@/components/tiles/totalAssignments";
import ActiveAssignments from "@/components/tiles/activeAssignments";
import AssignmentsTable from "@/components/tables/assignmentsTable";
import {useState} from "react";
import InventoryShop from "@/components/tiles/inventoryShop";
import InventoryWarehouse from "@/components/tiles/inventoryWarehouse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InventoryTable from "@/components/tables/inventoryTable";

export default function AdminInventory() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [itemQuantity, setItemQuantity] = useState(0);
    const [itemPrice, setItemPrice] = useState(0);
    const [itemName, setItemName] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [dateAdded, setDateAdded] = useState<Date | null>(null);
    const [location, setLocation] = useState("");


    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // handler function to submit inventory item creation form
    const handleSubmitInventory = async() => {
        try {
            const response = await fetch('http://localhost:3002/inventory', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quantity: itemQuantity,
                    pricePerUnit: itemPrice,
                    description: itemDescription,
                    name: itemName,
                    dateAdded: dateAdded,
                    location: location,
                })
            });

            if (response.ok) {
                closeDialog();
            } else {
                console.log('could not submit form');
            }
        } catch(e) {
            console.log(e);
        }
    }

    return (
        <>
            <div className={`h-screen flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""}`}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <SidebarAdmin isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>

                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>

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
                                    d="M3.75 8.25h16.5M4.5 9.75l.843 8.43a2.25 2.25 0 0 0 2.242 2.07h9.33a2.25 2.25 0 0 0 2.242-2.07l.843-8.43M7.5 4.5h9a1.5 1.5 0 0 1 1.5 1.5v2.25h-12V6a1.5 1.5 0 0 1 1.5-1.5Z"
                                />
                            </svg>
                            <span>Inventory</span>
                            <div className="ml-auto">
                                <Navbar/>
                            </div>

                        </header>
                    </div>

                    <div className="ml-6 mt-10 font-custom">
                        <div className="flex-row gap-4 flex">
                            <InventoryShop/>
                            <div className="w-10"/>
                            <InventoryWarehouse/>
                        </div>
                        <div className="h-7"/>
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
                            Add stock item
                        </button>
                    </div>
                    <div className="h-7"/>
                    <InventoryTable/>
                </div>
            </div>

            {isDialogOpen && (
                <div
                    className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Add stock item</h2>
                        <div className="h-2"/>
                        <form onSubmit={handleSubmitInventory}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    quantity
                                </label>
                                <input
                                    value={itemQuantity}
                                    onChange={(e: any) => setItemQuantity(e.target.value)}
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
                                    value={itemPrice.toLocaleString("en-US")}
                                    onChange={(e: any) => {
                                        const rawValue = e.target.value.replace(/,/g, "");
                                        if (!isNaN(Number(rawValue))) {
                                            setItemPrice(Number(rawValue));
                                        }
                                    }}
                                    type="text"
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
                                    value={itemName}
                                    onChange={(e: any) => setItemName(e.target.value)}
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
                                    value={itemDescription}
                                    onChange={(e: any) => setItemDescription(e.target.value)}
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
                                        selected={dateAdded}
                                        onChange={(data) => setDateAdded(data)}
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white w-[220px]"
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
                                    value={location}
                                    onChange={(e: any) => setLocation(e.target.value)}

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