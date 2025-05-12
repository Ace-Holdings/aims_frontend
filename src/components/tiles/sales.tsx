import { format } from "date-fns";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {LiaFileDownloadSolid} from "react-icons/lia";

const SalesTile = ({ id, title, date, amount, quantity, customer, issuer, description, inventory, user, pricePerUnit }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy");
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [inventories, setInventories] = useState([]);

    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);

    // update states
    const [quantityState, setQuantity] = useState(0);
    const [itemState, setItem] = useState("");
    const [descriptionState, setDescription] = useState("");
    const [amountState, setAmount] = useState(0);
    const [customerState, setCustomer] = useState("");
    const [issuerState, setIssuer] = useState("");

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);

    const openDetailDialog = (sale: any) => {
        setSelectedSale(sale);
        console.log(selectedSale)
        setShowDetailsDialog(true);

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


    const handleDeleteSale = async () => {
        try {
            const response = await fetch(`http://localhost:3002/sales/${selectedSale.id}`, {
                method: "DELETE",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                }
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
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
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

    const directFileDownload = (sale: any) => {
        setSelectedSale(sale);
        downloadInvoice(selectedSale.id);
    }

    // function to download
    const downloadInvoice = async (saleId: number) => {
        try {
            const response: any = await fetch(`http://localhost:3002/invoices/${saleId}/file`, {
                method: "GET",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                }
            });

            if (!response.ok) {
                console.log("Failed to download invoice");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `invoice_file.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        }
    }





    return (
        <>
            <div
                className="relative bg-white shadow-md p-6 rounded-lg mt-4 w-[500px] h-72 font-custom text-center flex flex-col ">
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <button
                        className="text-blue-600 hover:text-blue-800 bg-gray-200  transition-colors duration-200
               rounded-full p-2 hover:bg-blue-100"
                        title="View Details"
                        onClick={() =>
                            openDetailDialog({
                                id, title, date, amount, quantity, customer, issuer, description,
                                inventory: inventory ? inventory : { name: "" },
                                user: user ? user : { username: "" },
                                pricePerUnit
                            })
                        }
                    >
                        <FiEye className="w-5 h-5" />
                    </button>
                    <div className="h-1/2"/>
                    <button
                        className="text-purple-600 hover:text-purple-800 bg-gray-200 transition-colors duration-200
               rounded-full p-2 hover:bg-purple-100"
                        title="Download"
                        onClick={() =>
                            directFileDownload({
                                id, title, date, amount, quantity, customer, issuer, description,
                                inventory: inventory ? inventory : { name: "" },
                                user: user ? user : { username: "" },
                                pricePerUnit
                            })
                        }
                    >
                        <LiaFileDownloadSolid className="w-6 h-6" />
                    </button>
                    <div className="h-1/2"/>
                    <button
                        className="text-red-600 hover:text-red-800 transition-colors duration-200
               rounded-full p-2 hover:bg-red-100 bg-gray-200"
                        title="Delete"
                        onClick={() =>
                            openDeleteDialog({
                                id, title, date, amount, quantity, customer, issuer, description,
                                inventory: inventory ? inventory : { name: "" },
                                user: user ? user : { username: "" },
                                pricePerUnit
                            })
                        }
                    >
                        <FiTrash2 className="w-5 h-5" />
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
                <div className={"h-8"}/>
                <hr className="border-dotted border-gray-400 w-full my-3"/>
                <p className="text-green-600 font-bold text-lg text-left">
                    {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(amount)}
                </p>
            </div>

            {/* modal for showing details dialog */}
            {shouldRenderDialog &&
                ReactDOM.createPortal(
                    <div
                        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50 transition-opacity duration-300 ${
                            showDetailsDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <div
                            className={`bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto transition-all transform duration-300 ${
                                showDetailsDialog ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
                            }`}
                        >
                            <h3 className="text-lg  mb-6 text-center text-black">Sale Details</h3>
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
                                    <strong>Issuer:</strong> {selectedSale.issuer}
                                </div>
                                <div>
                                    <strong>Amount:</strong> {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "MWK",
                                }).format(selectedSale.amount)}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                    onClick={() => setShowDetailsDialog(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* modal for showing delete dialog */}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm font-custom transition-opacity duration-300 ${
                        showDeleteDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto transform transition-all duration-300 ${
                            showDeleteDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h3 className="text-lg  mb-4 text-black text-center">Confirm Delete</h3>
                        <p className="text-sm text-gray-700 mb-6">
                            Are you sure you want to delete this sale?
                        </p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md"
                                onClick={handleDeleteSale}
                            >
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