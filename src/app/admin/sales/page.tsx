"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import {useEffect, useState} from "react";
import SalesTile from "@/components/tiles/sales";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {jwtDecode} from "jwt-decode";

export default function AdminSales() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [inventories, setInventories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState("");

    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [sales, setSales] = useState([]);

    const [quantity, setQuantity] = useState(0);
    const [item, setItem] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);
    const [customer, setCustomer] = useState("");
    const [issuer, setIssuer] = useState("");
    const [timestamp, setTimestamp] = useState<Date | null>(null);

    const [unitPrice, setUnitPrice] = useState(0);


    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }

    const handleSelectInventory = async (inventoryId: string) => {
        setSelectedItem(inventoryId);
        setSearchQuery("");
        try {
            const response = await fetch(`http://localhost:3002/inventory/${inventoryId}`);
            if (response.ok) {
                const data = await response.json();
                setUnitPrice(data.pricePerUnit);
            } else {
                console.log("Could not fetch inventory details");
            }
        } catch (error) {
            console.error("Error fetching inventory details:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token); // Adjust this to match your token structure
                console.log(decodedToken);
                setUsername(decodedToken.user || "User");
            } catch (e) {
                console.error(e);
            }
        } else {
            setUsername("User");
        }
    }, []);

    useEffect(() => {
        const fetchInventories = async (query: string) => {
            try {
                const response = await fetch(`http://localhost:3002/inventory/search?name=${query}`, {
                    method: "GET",
                });

                if (response.ok) {
                    const data = await response.json();
                    setInventories(data); // Update the state with the fetched inventories
                } else {
                    console.log("Could not fetch inventories");
                }
            } catch (error) {
                console.error("Error fetching inventories:", error);
            }
        };

        if (searchQuery) {
            fetchInventories(searchQuery);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (username) {
            const fetchUserId = async () => {
                try {
                    const response = await fetch(`http://localhost:3002/users/search?username=${username}`, {
                        method: "GET",
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.length > 0) {
                            setUserId(data[0].userId);
                        }
                    } else {
                        console.log("Could not fetch users");
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            };
            fetchUserId();
        }
    }, [username]);

    useEffect(() => {
        const fetchSales = async () =>  {
            try {
                const response: any = await fetch('http://localhost:3002/sales', {
                    method: "GET",
                });

                const data = await response.json({});
                console.log(data);
                setSales(data);
            } catch (e) {
                console.error(e);
            }
        }
        fetchSales();
    }, []);

    useEffect(() => {
        setAmount(quantity * unitPrice);
    }, [quantity, unitPrice]);



    const salesArray = [
        { id: 1, title: "Sale 1", date: "2025-01-20", amount: 200.5 },
        { id: 2, title: "Sale 2", date: "2025-01-22", amount: 150.0 },
        { id: 3, title: "Sale 3", date: "2025-01-19", amount: 300.75 },
        { id: 4, title: "Sale 4", date: "2025-01-21", amount: 120.0 },
    ];

    // Sort sales by date (latest to earliest)
    const sortedSales = sales.sort((a: any, b: any) => a.createdAt - b.createdAt);


    // handler function to submit sales transaction
    const handleSalesSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3002/sales', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quantity: quantity,
                    description: description,
                    customer: customer,
                    amount: amount,
                    timestamp: timestamp,
                    userId: userId,
                    inventoryId: selectedItem,
                })
            });

            if (response.ok) {
                closeDialog();
            } else {
                console.log('could not submit sales transaction');
            }

        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <div className={` flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""}`}>
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
                                    id={sale.saleId}
                                    key={sale.saleId} // Use a unique key for each tile
                                    title={sale.inventory.name}
                                    date={sale.createdAt}
                                    amount={sale.amount}
                                    quantity={sale.quantity}
                                    issuer={sale.user.username}
                                    customer={sale.customer}
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
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Add sales transaction</h2>
                        <div className="h-2"/>
                        <form onSubmit={handleSalesSubmit}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Quantity
                                </label>
                                <input
                                    value={quantity}
                                    onChange={(e: any) => {
                                        setQuantity(e.target.value)
                                    }}
                                    type="number"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Item quantity"
                                />
                            </div>
                            <div className="mb-4 relative">
                                <label htmlFor="item" className="block text-gray-700 font-medium mb-2">
                                    Search Inventories
                                </label>
                                <input
                                    value={selectedItem ? inventories.find(item => item.inventoryId === selectedItem)?.name : searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSelectedItem(""); // Reset selected item when typing
                                    }}
                                    type="text"
                                    id="item"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Type to search for items"
                                />
                                {searchQuery && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                                        {inventories
                                            .filter((inventory) =>
                                                inventory.name.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((inventory) => (
                                                <li
                                                    key={inventory.inventoryId}
                                                    onClick={() => handleSelectInventory(inventory.inventoryId)}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {inventory.name} <p className="text-green-600 font-bold">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'MWK'
                                                    }).format(inventory.pricePerUnit)}
                                                </p>
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Description
                                </label>
                                <input
                                    value={description}
                                    onChange={(e: any) => {
                                        setDescription(e.target.value)
                                    }}
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Item description"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Customer
                                </label>
                                <input
                                    value={customer}
                                    onChange={(e: any) => {
                                        setCustomer(e.target.value)
                                    }}
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
                                        selected={timestamp}
                                        onChange={(e: Date | null) => {
                                            setTimestamp(e)
                                        }}
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

