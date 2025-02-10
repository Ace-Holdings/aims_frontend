import { format } from "date-fns";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import React, {useState} from "react";
import ReactDOM from "react-dom";

const SalesTile = ({ id, title, date, amount, quantity, customer, issuer }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy");
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    const openDetailDialog = (sale: any) => {
        setSelectedSale(sale);
        setShowDetailsDialog(true);
    }

    return (
        <>
            <div
                className="relative bg-white shadow-md p-6 rounded-lg mt-4 w-80 font-custom text-center flex flex-col ">
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <button
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="View Details"
                        onClick={() => openDetailDialog({id, title, date, amount, quantity, customer, issuer, description: "", inventory: {name: "", pricePerUnit: 0}, user: {username: ""}})}
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
                <p className="text-gray-500 text-left">Date: <span className="text-black">{formattedDate}</span></p>
                <hr className="border-dotted border-gray-400 w-full my-3"/>
                <p className="text-green-600 font-bold text-lg text-left">
                    {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(amount)}
                </p>
            </div>

            {showDetailsDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black font-custom backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-lg font-semibold mb-6 text-center text-gray-400">User Details</h3>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <strong>Item:</strong> {selectedSale?.inventory.name}
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
                                <strong>Price per unit:</strong> {selectedSale.inventory.pricePerUnit}
                            </div>
                            <div>
                                <strong>Issuer:</strong> {selectedSale.user.username}
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
        </>

    );
};

export default SalesTile;