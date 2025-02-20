import { format } from "date-fns";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {LiaFileDownloadSolid} from "react-icons/lia";

const SalesTile = ({ id, title, date, amount, quantity, customer, issuer, description, inventory, user, pricePerUnit }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy");
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [inventories, setInventories] = useState([]);

    // update states
    const [quantityState, setQuantity] = useState(0);
    const [itemState, setItem] = useState("");
    const [descriptionState, setDescription] = useState("");
    const [amountState, setAmount] = useState(0);
    const [customerState, setCustomer] = useState("");
    const [issuerState, setIssuer] = useState("");

    const openDetailDialog = (sale: any) => {
        setSelectedSale(sale);
        console.log(selectedSale)
        setShowDetailsDialog(true);

        setTimeout(() => {
            console.log("Updated selectedSale:", sale);
        }, 0);
    }

    const openUpdateDialog = (sale: any) => {
        setSelectedSale(sale);
        setShowUpdateDialog(true);

        setTimeout(() => {
            console.log("Updated selectedSale:", sale);
        }, 0);
    }

    const openDeleteDialog = (sale: any) => {
        setSelectedSale(sale);
        setShowDeleteDialog(true);
    }

    const handleSelectInventory = (inventoryId: any) => {
        const selectedInventory = inventories.find(item => item.inventoryId === inventoryId);
        setSelectedSale(prevSale => ({ ...prevSale, inventoryId }));
        setSearchQuery("");
    };

    const handleUpdateSale = async () => {
        try {
            const updatedSale = {
                ...(quantityState  && { quantity: quantityState }),
                ...(itemState && { inventoryId: itemState }),
                ...(customerState  && { customer: customerState }),
                ...(descriptionState  && { description: descriptionState }),
                ...(amountState  && { amount: amountState }),
                ...(issuerState  && { issuer: issuerState }),
            };


            if (Object.keys(updatedSale).length === 0) {
                console.log("No changes detected.");
                return; // Exit if there's nothing to update
            }

            const response = await fetch(`http://localhost:3002/sales/${selectedSale.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedSale),
            });

            if (!response.ok) {
                console.log("Failed to update sale");
                return;
            }

            setShowUpdateDialog(false);
            window.location.reload();
        } catch (error) {
            console.error("Error updating sale:", error);
        }
    };

    const handleDeleteSale = async () => {
        try {
            const response = await fetch(`http://localhost:3002/sales/${selectedSale.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.log("Failed to delete sale");
            }

            setShowDeleteDialog(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
        }
    }
    useEffect(() => {
        const fetchInventories = async (query: string) => {
            try {
                const response = await fetch(`http://localhost:3002/inventory/search?name=${query}`, {
                    method: "GET",
                });

                if (response.ok) {
                    const data = await response.json();
                    setInventories(data);
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





    return (
        <>
            <div
                className="relative bg-white shadow-md p-6 rounded-lg mt-4 w-[500px] font-custom text-center flex flex-col ">
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <button
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="View Details"
                        onClick={() => openDetailDialog({id, title, date, amount, quantity, customer, issuer, description, inventory: inventory ? inventory : {name: ""}, user: user ? user : {username: ""}, pricePerUnit})}
                    >

                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Edit"
                        onClick={() => openUpdateDialog({id, title, date, amount, quantity, customer, issuer, description, inventory: inventory ? inventory : {name: ""}, user: user ? user : {username: ""}, pricePerUnit})}
                    >
                        <FiEdit className="w-5 h-5"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        title="Download"
                    >
                        <LiaFileDownloadSolid className="w-6 h-6"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Delete"
                        onClick={() => openDeleteDialog({id, title, date, amount, quantity, customer, issuer, description, inventory: inventory ? inventory : {name: ""}, user: user ? user : {username: ""}, pricePerUnit})}
                    >
                        <FiTrash2 className="w-5 h-5"/>
                    </button>
                </div>

                <h2 className="text-lg text-gray-500 text-left">ID: <span
                    className="font-semibold text-black">{id}</span>
                </h2>
                <h2 className="text-lg text-gray-500 text-left">Item: <span
                    className="font-semibold text-black">{title}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Customer: <span
                    className="font-semibold text-black">{customer}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Quantity: <span
                    className="font-semibold text-black">{quantity}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Issuer: <span
                    className="font-semibold text-black">{issuer}</span></h2>
                <p className="text-gray-500 text-left">Date: <span className="text-black font-semibold">{formattedDate}</span></p>
                <hr className="border-dotted border-gray-400 w-full my-3"/>
                <p className="text-green-600 font-bold text-lg text-left">
                    {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(amount)}
                </p>
            </div>

            {showDetailsDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black font-custom backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-lg font-semibold mb-6 text-center text-gray-400">Sale Details</h3>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <strong>Item:</strong> {selectedSale.title}
                            </div>
                            <div>
                                <strong>Customer:</strong> {selectedSale.customer}
                            </div>
                            <div>
                                <strong>Quantity:</strong> {selectedSale.quantity}
                            </div>
                            <div>
                                <strong>Description:</strong> {selectedSale.description}
                            </div>
                            <div>
                                <strong>Price per unit:</strong> {selectedSale.pricePerUnit?.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                            })}
                            </div>
                            <div>
                                <strong>Issuer:</strong> {selectedSale.issuer}
                            </div>
                            <div>
                                <strong>Amount:</strong> {selectedSale.amount}
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
                <div className="fixed inset-0 flex items-center justify-center bg-black  text-black  font-custom bg-opacity-30 backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">Update sale</h3>
                        <form>
                            <div className="mb-4 relative">
                                <label htmlFor="item" className="block text-gray-700 font-medium mb-2">
                                    Search Inventories
                                </label>
                                <input
                                    value={selectedSale ? inventories.find(item => item.inventoryId === selectedSale)?.inventoryId : searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSelectedSale("");
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
                                                    {inventory.name}
                                                    <p className="text-green-600 font-bold">
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
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={quantityState}
                                    onChange={(e: any) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={descriptionState}
                                    onChange={(e: any) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Customer</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={customerState}
                                    onChange={(e: any) => setCustomer(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Issuer</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    onChange={(e: any) => setIssuer(e.target.value)}
                                />
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
                                    onClick={handleUpdateSale}
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {showDeleteDialog &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 flex items-center justify-center bg-black  text-black  font-custom bg-opacity-30 backdrop-blur-sm z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10">
                            <h3 className="text-xl font-semibold mb-4 text-gray-400 text-center">Confirm Delete</h3>
                            <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this sale?</p>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md" onClick={() => setShowDeleteDialog(false)}>
                                    Cancel
                                </button>
                                <button className="bg-red-600 text-white px-4 py-2 rounded-md" onClick={handleDeleteSale}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

        </>

    );
};

export default SalesTile;