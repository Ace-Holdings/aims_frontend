import DataTable from "react-data-table-component";
import React, { useEffect, useState } from "react";
import {FiEye, FiTrash2, FiEdit} from "react-icons/fi";
import DatePicker from "react-datepicker";
import ReactDOM from "react-dom";


export default function InventoryTable() {
    const [stock, setStock] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // states for updating inventory
    const [quantity, setQuantity] = useState(0);
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dateAdded, setDateAdded] = useState<Date | null>(null);
    const [location, setLocation] = useState("");


    useEffect(() => {
        fetch('http://localhost:3002/inventory', {
            method: 'GET',
            headers: {
                "authorization": 'Bearer ' + localStorage.getItem("token"),
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setStock(data);
                setFilteredData(data);
            });
    }, []);

    const openDeleteDialog = (item: any) => {
        setSelectedItem(item);
        setShowDeleteDialog(true);
    }

    const openDetailDialog = (item: any) => {
        setSelectedItem(item);
        setShowDetailsDialog(true);
    }

    const openUpdateDialog = (item: any) => {
        setSelectedItem(item);
        setShowUpdateDialog(true);
    }

    // function to handle the deletion of a stock item
    const handleDeleteItem = async () => {
        try {
            const response = await fetch(`http://localhost:3002/inventory/${selectedItem.inventoryId}`, {
                method: "DELETE",
                headers: {
                    "authorization": 'Bearer ' + localStorage.getItem("token"),
                }
            });

            if (!response.ok) {
                console.log('could not delete item');
            }
            setShowDeleteDialog(false);
            window.location.reload();
        } catch(e) {
            console.log(e);
        }
    }

    // handler function to update stock item
    const handleUpdateStock = async () => {
        try {
            const updatedStock = {
                inventoryId: selectedItem.inventoryId,
                ...(quantity && { quantity }),
                ...(pricePerUnit && { pricePerUnit }),
                ...(name && { name }),
                ...(description && { description }),
                ...(dateAdded && { dateAdded: dateAdded.toISOString() }),
                ...(location && { location }),
                ...(status !== "" && { status }),
            };

            const response = await fetch(`http://localhost:3002/inventory/${selectedItem.inventoryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": 'Bearer ' + localStorage.getItem("token"),
                },
                body: JSON.stringify(updatedStock),
            });

            if (!response.ok) {
                console.log("Failed to update assignment");
                return;
            }

            setShowUpdateDialog(false);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    };

    // Columns Definition
    const columns = [
        { name: "ID", selector: (row: any) => row.inventoryId, sortable: true },
        { name: "Item name", selector: (row: any) => row.name, sortable: true },
        { name: "Quantity", selector: (row: any) => row.quantity, sortable: true },
        {
            name: "Price per unit",
            selector: (row: any) => row.pricePerUnit.toLocaleString("en-US", {
                style: "currency",
                currency: "MWK",
            }),
        },
        { name: "Description", selector: (row: any) => row.description },
        {
            name: " Date Added",
            selector: (row: any) => new Date(row.dateAdded).toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
            sortable: true,
        },,
        { name: "Location", selector: (row: any) => row.location },
        {
            name: "Actions",
            selector: (row: any) => (
                <div className="flex">
                    <button
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        onClick={() => {openUpdateDialog(row)}}
                    >
                        <FiEdit className="size-6"/>
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="View Details"
                        onClick={() => {
                            openDetailDialog(row)
                        }}
                    >
                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Delete User"
                        onClick={() => openDeleteDialog(row)}
                    >
                        <FiTrash2 className="w-5 h-5"/>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    // Custom styles for table
    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "13px",
            },
        },
    };

    // Handle Filter Change
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilter(value);

        const filtered =
            value === "All"
                ? stock
                : stock.filter((item: any) => item.status === value);

        setFilteredData(filtered.filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        ));
    };

    // Handle Search Change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        const filtered = stock.filter((item: any) =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredData(
            filter === "All"
                ? filtered
                : filtered.filter((item: any) => item.status === filter)
        );
    };

    return (
        <>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4 text-black">
                    {/* Filter Dropdown */}
                    <select
                        value={filter}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    {/* Search Bar */}
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by name..."
                        className="border border-gray-300 rounded-md px-2 py-1"
                    />
                </div>

                {/* DataTable Component */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    customStyles={customStyles}
                    pagination
                    highlightOnHover
                    striped
                />
            </div>

            {showDeleteDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10">
                        <h3 className="text-xl font-semibold mb-4 text-gray-400 text-center">Confirm Delete</h3>
                        <p className="text-sm text-gray-700 mb-6">
                            Are you sure you want to delete this stock item?
                        </p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors duration-200 hover:bg-gray-400"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md transition-colors duration-200 hover:bg-red-600"
                                onClick={handleDeleteItem}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showDetailsDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm text-black font-custom z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-lg font-semibold mb-6 text-center text-gray-400">Stock Item Details</h3>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <strong>Item name:</strong> {selectedItem.name}
                            </div>
                            <div>
                                <strong>Description:</strong> {selectedItem.description}
                            </div>
                            <div>
                                <strong>Quantity:</strong> {selectedItem.quantity}
                            </div>
                            <div>
                                <strong>Unit price:</strong> {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "MWK",
                            }).format(selectedItem.pricePerUnit)}
                            </div>
                            <div>
                                <strong>Date added:</strong> {new Date(selectedItem.dateAdded).toLocaleString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                            </div>
                            <div>
                                <strong>Location:</strong> {selectedItem.location}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowDetailsDialog(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showUpdateDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm text-black font-custom z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">Update Stock Item</h3>
                        <form>
                            <div className="mb-4 ">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    className="border p-2 w-full bg-white"
                                    value={quantity}
                                    onChange={(e: any) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="mb-4 ">
                                <label>Price per unit</label>
                                <input
                                    type="number"
                                    name="locationName"
                                    className="border p-2 w-full bg-white"
                                    value={pricePerUnit}
                                    onChange={(e: any) => setPricePerUnit(e.target.value)}

                                />
                            </div>
                            <div className="mb-4">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={description}
                                    onChange={(e: any) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Date Added:
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
                                        popperPlacement="top"
                                        showTimeSelectOnly={false}
                                        selected={dateAdded}
                                        onChange={(date) => setDateAdded(date as Date)}
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
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                    onClick={() => setShowUpdateDialog(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                    onClick={handleUpdateStock}
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}


        </>


    );
}