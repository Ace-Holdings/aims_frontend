import {format} from "date-fns";
import React, {useEffect, useState} from "react";
import {FiEdit, FiEye, FiTrash2} from "react-icons/fi";
import {LiaFileDownloadSolid} from "react-icons/lia";
import ReactDOM from "react-dom";

const PaySlipsTile = ({ id, title, date, amount, quantity, customer, issuer, description, inventory, user, pricePerUnit }) => {
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


    return (
        <>
            <div
                className="relative bg-white shadow-md p-6 rounded-lg mt-4 w-[500px] font-custom text-center flex flex-col border border-gray-500"
                style={{
                    background: `
            url("data:image/svg+xml,%3Csvg width='100%' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 L5,0 L10,5 L15,0 L20,5 L25,0 L30,5 L35,0 L40,5 L45,0 L50,5 L55,0 L60,5 L65,0 L70,5 L75,0 L80,5 L85,0 L90,5 L95,0 L100,5' stroke='black' fill='transparent'/%3E%3C/svg%3E")
            top center / 100% 10px repeat-x,
            url("data:image/svg+xml,%3Csvg width='100%' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 L5,10 L10,5 L15,10 L20,5 L25,10 L30,5 L35,10 L40,5 L45,10 L50,5 L55,10 L60,5 L65,10 L70,5 L75,10 L80,5 L85,10 L90,5 L95,10 L100,5' stroke='black' fill='transparent'/%3E%3C/svg%3E")
            bottom center / 100% 10px repeat-x
        `,
                }}>
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <button
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="View Details"
                    >

                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Edit"
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
                                <strong>Item:</strong>
                            </div>
                            <div>
                                <strong>Customer:</strong>
                            </div>
                            <div>
                                <strong>Quantity:</strong>
                            </div>
                            <div>
                                <strong>Description:</strong>
                            </div>
                            <div>
                                <strong>Issuer:</strong>
                            </div>
                            <div>
                                <strong>Amount:</strong> {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "MWK",
                            }).format(}
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
                                    type="text"
                                    id="item"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Type to search for items"
                                />
                                {searchQuery && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
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
                                />
                            </div>
                            <div className="mb-4">
                                <label>Issuer</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
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
                                <button className="bg-red-600 text-white px-4 py-2 rounded-md" >
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

export default PaySlipsTile;