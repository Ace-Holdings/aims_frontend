import {format} from "date-fns";
import React, {useEffect, useState} from "react";
import {FiEdit, FiEye, FiTrash2} from "react-icons/fi";
import {LiaFileDownloadSolid} from "react-icons/lia";
import ReactDOM from "react-dom";

const PaySlipsTile = ({ id, employee, earnings, deductions }) => {
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
                className="relative bg-white shadow-md p-6 mt-4 w-[500px] h-[200px] font-custom text-center flex flex-col"
                style={{
                    background: `
        url("data:image/svg+xml,%3Csvg width='500' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 L12,0 L24,5 L36,0 L48,5 L60,0 L72,5 L84,0 L96,5 L108,0 L120,5 L132,0 L144,5 L156,0 L168,5 L180,0 L192,5 L204,0 L216,5 L228,0 L240,5 L252,0 L264,5 L276,0 L288,5 L300,0 L312,5 L324,0 L336,5 L348,0 L360,5 L372,0 L384,5 L396,0 L408,5 L420,0 L432,5 L444,0 L456,5 L468,0 L480,5 L492,0 L500,5' stroke='black' fill='transparent'/%3E%3C/svg%3E")
        top center / 500px 10px no-repeat,
        url("data:image/svg+xml,%3Csvg width='500' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 L12,10 L24,5 L36,10 L48,5 L60,10 L72,5 L84,10 L96,5 L108,10 L120,5 L132,10 L144,5 L156,10 L168,5 L180,10 L192,5 L204,10 L216,5 L228,10 L240,5 L252,10 L264,5 L276,10 L288,5 L300,10 L312,5 L324,10 L336,5 L348,10 L360,5 L372,10 L384,5 L396,10 L408,5 L420,10 L432,5 L444,10 L456,5 L468,10 L480,5 L492,10 L500,5' stroke='black' fill='transparent'/%3E%3C/svg%3E")
        bottom center / 500px 10px no-repeat
    `,
                }}
            >
                <div className="h-3"/>
                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <div/>
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
                <h2 className="text-lg text-gray-500 text-left">Employee: <span
                    className="font-semibold text-black">{employee}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Total earnings: <span
                    className="font-semibold text-black">{earnings}</span></h2>
                <h2 className="text-lg text-gray-500 text-left">Total deductions: <span
                    className="font-semibold text-black">{deductions}</span></h2>
            </div>
            <div className="h-2"/>


        </>

    );
};

export default PaySlipsTile;