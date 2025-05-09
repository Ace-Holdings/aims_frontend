"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import {useEffect, useState} from "react";
import InventoryShop from "@/components/tiles/inventoryShop";
import InventoryWarehouse from "@/components/tiles/inventoryWarehouse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InventoryTable from "@/components/tables/inventoryTable";
import {jwtDecode} from "jwt-decode";
import { useRouter } from "next/navigation";

export default function AdminInventory() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const [itemQuantity, setItemQuantity] = useState(0);
    const [itemPrice, setItemPrice] = useState(0);
    const [itemName, setItemName] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [location, setLocation] = useState("");

    const [isSerialDialogOpen, setIsSerialDialogOpen] = useState(false);
    const [serialNumbers, setSerialNumbers] = useState<string[]>([]);


    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }


    const handleInitialSubmit = (e: any) => {
        e.preventDefault();

        // Prepare empty serial fields based on quantity
        const quantityNum = Number(itemQuantity);
        if (quantityNum > 0) {
            setSerialNumbers(Array(quantityNum).fill(""));
            setIsDialogOpen(false);
            setIsSerialDialogOpen(true);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
        }

        try {
            const decodedToken = jwtDecode(token);
            const roles: string[] = decodedToken.roles || [];

            if(!roles.includes("ROLE_ADMIN")) {
                router.push("/");
            }

        } catch (e) {
            console.error(e);
            router.push("/");
        }
    }, [router]);

    useEffect(() => {
        const storedState = localStorage.getItem("adminSidebarCollapsed");
        if (storedState !== null) {
            setIsSidebarCollapsed(storedState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("adminSidebarCollapsed", String(newState));
    };

    // handler function to submit inventory item creation form
    const handleFinalSubmit = async () => {
        const user = jwtDecode(localStorage.getItem('token')).user;

        // 🚨 Validate all serial numbers are filled
        if (serialNumbers.some(sn => !sn.trim())) {
            alert("Please fill out all serial number fields before submitting.");
            return;
        }

        try {
            // Step 1: Create the inventory record
            const inventoryResponse = await fetch('http://localhost:3002/inventory', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    quantity: itemQuantity,
                    pricePerUnit: itemPrice,
                    description: itemDescription,
                    name: itemName,
                    location: location,
                    lastModifiedBy: user,
                })
            });

            if (!inventoryResponse.ok) {
                console.error('Failed to create inventory');
                return;
            }

            const inventoryData = await inventoryResponse.json();
            const inventoryId = inventoryData.inventoryId || inventoryData.id || inventoryData._id;

            if (!inventoryId) {
                console.error('No inventory ID returned');
                return;
            }

            // Step 2: Submit units with valid serials
            const inventoryUnits = serialNumbers.map((serialNumber) => ({
                serialNumber: serialNumber.trim(),
                inventoryId
            }));

            const inventoryUnitResponse = await fetch('http://localhost:3002/unit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inventoryUnits)
            });

            if (!inventoryUnitResponse.ok) {
                const errText = await inventoryUnitResponse.text();
                throw new Error(`Error creating inventory units: ${errText}`);
            }

            window.location.reload();

        } catch (e) {
            console.error("Submission error:", e);
        }
    };

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

            {/* modal for creating an inventory item */}
            <div
                className={`fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom transition-opacity duration-300 ${
                    isDialogOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg w-1/3 transform transition-all duration-300 ${
                        isDialogOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                    }`}
                >
                    <h2 className="text-lg font-medium mb-4 text-center text-bold">Add stock item</h2>
                    <div className="h-2" />
                    <form>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Quantity</label>
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
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Price Per Unit</label>
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
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Item Name</label>
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
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Description</label>
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
                            <label htmlFor="role" className="block text-gray-700 font-medium mb-2">Location</label>
                            <select
                                id="role"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                defaultValue=""
                                value={location}
                                onChange={(e: any) => setLocation(e.target.value)}
                            >
                                <option value="" disabled>Select location</option>
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
                                onClick={handleInitialSubmit}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* modal for entering serials of inventory item */}
            <div
                className={`fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom transition-opacity duration-300 ${
                    isSerialDialogOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg w-1/4 transform transition-all duration-300 ${
                        isSerialDialogOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                    }`}
                >
                    <h2 className="text-lg font-medium mb-4 text-center">Enter Serial Numbers</h2>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {Array.from({ length: itemQuantity }).map((_, idx) => (
                            <input
                                key={idx}
                                type="text"
                                value={serialNumbers[idx] || ''}
                                onChange={(e) => {
                                    const updated = [...serialNumbers];
                                    updated[idx] = e.target.value;
                                    setSerialNumbers(updated);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder={`Serial #${idx + 1}`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={() => {
                                setIsSerialDialogOpen(false);
                                setIsDialogOpen(true);
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                        >
                            Back
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                            onClick={handleFinalSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}