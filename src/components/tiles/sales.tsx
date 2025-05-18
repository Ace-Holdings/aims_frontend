import { format } from "date-fns";
import { FiEye, FiTrash2 } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { LiaFileDownloadSolid } from "react-icons/lia";

interface Inventory {
    inventoryId: number;
    name: string;
    pricePerUnit: number;
}

interface User {
    username: string;
}

interface SaleTileProps {
    id: number;
    title: string;
    date: string;
    amount: number;
    quantity: string;
    customer: string;
    issuer: string;
    description: string;
    inventory?: Inventory;
    user?: User;
    pricePerUnit: string;
}

const SalesTile: React.FC<SaleTileProps> = ({
                                                id,
                                                title,
                                                date,
                                                amount,
                                                quantity,
                                                customer,
                                                issuer,
                                                description,
                                                inventory,
                                                user,
                                                pricePerUnit,
                                            }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy");
    const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
    const [selectedSale, setSelectedSale] = useState<SaleTileProps | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [shouldRenderDialog, setShouldRenderDialog] = useState<boolean>(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);

    const openDetailDialog = (sale: SaleTileProps) => {
        setSelectedSale(sale);
        setShowDetailsDialog(true);
    };

    const openDeleteDialog = (sale: SaleTileProps) => {
        setSelectedSale(sale);
        setShowDeleteDialog(true);
    };

    const handleSelectInventory = (inventoryId: number) => {
        const selectedInventory = inventories.find(item => item.inventoryId === inventoryId);
        if (selectedSale && selectedInventory) {
            setSelectedSale({ ...selectedSale, inventory: selectedInventory });
        }
        setSearchQuery("");
    };

    const handleDeleteSale = async () => {
        if (!selectedSale) return;
        try {
            const response = await fetch(`http://localhost:3002/sales/${selectedSale.id}`, {
                method: "DELETE",
                headers: {
                    authorization: `Bearer ` + token,
                },
            });

            if (!response.ok) {
                console.log("Failed to delete sale");
            }

            setShowDeleteDialog(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const fetchInventories = async (query: string) => {
            try {
                const response = await fetch(`http://localhost:3002/inventory/search?name=${query}`, {
                    method: "GET",
                    headers: {
                        authorization: `Bearer ` + token,
                    },
                });

                if (response.ok) {
                    const data: Inventory[] = await response.json();
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

    const downloadInvoice = async (saleId: number) => {
        try {
            const response = await fetch(`http://localhost:3002/invoices/${saleId}/file`, {
                method: "GET",
                headers: {
                    authorization: `Bearer ` + token,
                },
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
    };

    const directFileDownload = (sale: SaleTileProps) => {
        setSelectedSale(sale);
        downloadInvoice(sale.id);
    };

    return (
        <>
            <div className="relative bg-white shadow-md p-6 rounded-lg mt-4 w-[500px] h-72 font-custom text-center flex flex-col">
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <button
                        className="text-blue-600 hover:text-blue-800 bg-gray-200 rounded-full p-2 hover:bg-blue-100"
                        title="View Details"
                        onClick={() =>
                            openDetailDialog({
                                id,
                                title,
                                date,
                                amount,
                                quantity,
                                customer,
                                issuer,
                                description,
                                inventory,
                                user,
                                pricePerUnit,
                            })
                        }
                    >
                        <FiEye className="w-5 h-5" />
                    </button>
                    <div className="h-1/2" />
                    <button
                        className="text-purple-600 hover:text-purple-800 bg-gray-200 rounded-full p-2 hover:bg-purple-100"
                        title="Download"
                        onClick={() =>
                            directFileDownload({
                                id,
                                title,
                                date,
                                amount,
                                quantity,
                                customer,
                                issuer,
                                description,
                                inventory,
                                user,
                                pricePerUnit,
                            })
                        }
                    >
                        <LiaFileDownloadSolid className="w-6 h-6" />
                    </button>
                    <div className="h-1/2" />
                    <button
                        className="text-red-600 hover:text-red-800 bg-gray-200 rounded-full p-2 hover:bg-red-100"
                        title="Delete"
                        onClick={() =>
                            openDeleteDialog({
                                id,
                                title,
                                date,
                                amount,
                                quantity,
                                customer,
                                issuer,
                                description,
                                inventory,
                                user,
                                pricePerUnit,
                            })
                        }
                    >
                        <FiTrash2 className="w-5 h-5" />
                    </button>
                </div>

                <h2 className="text-lg text-gray-500 text-left">ID: <span className="font-semibold text-black">{id}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Item: <span className="font-semibold text-black">{title}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Customer: <span className="font-semibold text-black">{customer}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Quantity: <span className="font-semibold text-black">{quantity}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Issuer: <span className="font-semibold text-black">{issuer}</span></h2>
                <p className="text-gray-500 text-left">Date: <span className="text-black font-semibold">{formattedDate}</span></p>
                <div className="h-8" />
                <hr className="border-dotted border-gray-400 w-full my-3" />
                <p className="text-green-600 font-bold text-lg text-left">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(amount)}
                </p>
            </div>

            {typeof window !== "undefined" && shouldRenderDialog && selectedSale &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50 transition-opacity duration-300">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto transition-all transform duration-300">
                            <h3 className="text-lg mb-6 text-center text-black">Sale Details</h3>
                            <div className="flex flex-wrap gap-4">
                                <div><strong>Item:</strong> {selectedSale.title}</div>
                                <div><strong>Customer:</strong> {selectedSale.customer}</div>
                                <div><strong>Quantity:</strong> {selectedSale.quantity}</div>
                                <div><strong>Description:</strong> {selectedSale.description}</div>
                                <div><strong>Issuer:</strong> {selectedSale.issuer}</div>
                                <div>
                                    <strong>Amount:</strong>{" "}
                                    {new Intl.NumberFormat("en-US", {
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

            {typeof window !== "undefined" && showDeleteDialog &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm font-custom transition-opacity duration-300">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto transform transition-all duration-300">
                            <h3 className="text-lg mb-4 text-black text-center">Confirm Delete</h3>
                            <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this sale?</p>
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
                )
            }
        </>
    );
};

export default SalesTile;