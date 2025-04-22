import {format} from "date-fns";
import React, {useEffect, useState} from "react";
import {FiEdit, FiEye, FiTrash2} from "react-icons/fi";
import {LiaFileDownloadSolid} from "react-icons/lia";
import ReactDOM from "react-dom";

const PaySlipsTile = ({ id, employee, earnings, deductions, date }) => {
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const formattedDate = format(new Date(date), "dd/MM/yyyy");
    const [selectedSlip, setSelectedSlip] = useState(null);
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

    const openDetailsDialog = (slip: any) => {
        setSelectedSlip(slip);
        console.log(selectedSlip);
        setShowDetailsDialog(true);
    }

    const openDeleteDialog = (slip: any) => {
        setSelectedSlip(slip);
        setShowDeleteDialog(true);
    }

    const downloadPaySlipFile = (slip: any) => {
        setSelectedSlip(slip);
        handleGetPaySlipFile(selectedSlip.id)
    }

    const handleGetPaySlipFile = async (payslipId: any) => {
        try {
            const response = await fetch(`http://localhost:3002/payslips/${payslipId}/file`, {
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (!response.ok) {
                console.error('failed to get payslip file');
            }


            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `payslip_file.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeletePaySlip = async () => {
        try {
            const response = await fetch(`http://localhost:3002/payslips/${selectedSlip.id}`, {
                method: "DELETE",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            })
            if (!response.ok) {
                console.error('failed to delete payslip file');
            }
            setShowDeleteDialog(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
        }
    }


    return (
        <>
            <div
                className="relative bg-white shadow-md p-6 mt-4 w-[500px] h-[200px] font-custom text-center flex flex-col"
                style={{
                    background: `
    url("data:image/svg+xml,%3Csvg width='500' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 L12,0 L24,5 L36,0 L48,5 L60,0 L72,5 L84,0 L96,5 L108,0 L120,5 L132,0 L144,5 L156,0 L168,5 L180,0 L192,5 L204,0 L216,5 L228,0 L240,5 L252,0 L264,5 L276,0 L288,5 L300,0 L312,5 L324,0 L336,5 L348,0 L360,5 L372,0 L384,5 L396,0 L408,5 L420,0 L432,5 L444,0 L456,5 L468,0 L480,5 L492,0 L500,5' stroke='black' stroke-width='1.5' fill='transparent'/%3E%3C/svg%3E")
    top center / 500px 10px no-repeat,
    url("data:image/svg+xml,%3Csvg width='500' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 L12,10 L24,5 L36,10 L48,5 L60,10 L72,5 L84,10 L96,5 L108,10 L120,5 L132,10 L144,5 L156,10 L168,5 L180,10 L192,5 L204,10 L216,5 L228,10 L240,5 L252,10 L264,5 L276,10 L288,5 L300,10 L312,5 L324,10 L336,5 L348,10 L360,5 L372,10 L384,5 L396,10 L408,5 L420,10 L432,5 L444,10 L456,5 L468,10 L480,5 L492,10 L500,5' stroke='black' stroke-width='1.5' fill='transparent'/%3E%3C/svg%3E")
    bottom center / 500px 10px no-repeat,
    linear-gradient(to right, black 1.5px, black 1.5px) left center / 1.5px 100% no-repeat,
    linear-gradient(to right, black 1.5px, black 1.5px) right center / 1.5px 100% no-repeat
  `,
                }}
            >
                <div className="h-3"/>
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <div/>
                    <button
                        className="text-blue-600 hover:text-blue-800 bg-gray-200  transition-colors duration-200
               rounded-full p-2 hover:bg-blue-100"
                        title="View Details"
                        onClick={() => openDetailsDialog({id, employee, earnings, deductions, date})}
                    >

                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-purple-600 hover:text-purple-800 bg-gray-200 transition-colors duration-200
               rounded-full p-2 hover:bg-purple-100"
                        title="Download"
                        onClick={() => downloadPaySlipFile({id, employee, earnings, deductions, date})}
                    >
                        <LiaFileDownloadSolid className="w-6 h-6"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-red-600 hover:text-red-800 transition-colors duration-200
               rounded-full p-2 hover:bg-red-100 bg-gray-200"
                        title="Delete"
                        onClick={() => openDeleteDialog({id, employee, earnings, deductions, date})}
                    >
                        <FiTrash2 className="w-5 h-5"/>
                    </button>
                </div>

                <h2 className="text-lg text-gray-500 text-left">ID: <span
                    className="font-semibold text-black">{id}</span>
                </h2>
                <h2 className="text-lg text-gray-500 text-left">Employee: <span
                    className="font-semibold text-black">{employee}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">
                    Total earnings:
                    <span className="font-semibold text-black">
    {new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(earnings)}
  </span>
                </h2>
                <h2 className="text-lg text-gray-500 text-left">
                    Total deductions:
                    <span className="font-semibold text-black">
    {new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(deductions)}
  </span>
                </h2>
                <h2 className="text-lg text-gray-500 text-left">Date: <span
                    className="font-semibold text-black">{formattedDate}</span></h2>
            </div>
            <div className="h-2"/>

            {showDetailsDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black font-custom backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-lg font-semibold mb-6 text-center text-gray-400">Payslip Details</h3>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <strong>ID:</strong> {selectedSlip.id}
                            </div>
                            <div>
                                <strong>Employee:</strong> {selectedSlip.employee}
                            </div>
                            <div>
                                <strong>Total earnings:</strong>
                                {new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(selectedSlip.earnings)}
                            </div>
                            <div>
                                <strong>Total deductions:</strong>
                                {new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(selectedSlip.deductions)}
                            </div>
                            <div>
                                <strong>Date:</strong>
                                {new Date(selectedSlip.date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
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

            {showDeleteDialog &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 flex items-center justify-center bg-black  text-black  font-custom bg-opacity-30 backdrop-blur-sm z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10">
                            <h3 className="text-xl font-semibold mb-4 text-gray-400 text-center">Confirm Delete</h3>
                            <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this payslip?</p>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md" onClick={() => setShowDeleteDialog(false)}>
                                    Cancel
                                </button>
                                <button onClick={handleDeletePaySlip} className="bg-red-600 text-white px-4 py-2 rounded-md" >
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