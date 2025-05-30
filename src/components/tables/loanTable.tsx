"use client";

import { FiEye } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { jwtDecode } from "jwt-decode";
import ReactDOM from "react-dom";

interface Applicant {
    username: string;
}

interface Loan {
    loanId: number;
    amount: number;
    purpose: string;
    status: string;
    dateApplied: string;
    dateGranted?: string;
    applicant?: Applicant;
}

interface DecodedToken {
    id: number;
    user: string;
    roles: string[];
    iat: number;
    exp: number;
}

export default function LoanTable() {
    const [filteredData, setFilteredData] = useState<Loan[]>([]);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                if (!token) return;

                const decoded = jwtDecode<DecodedToken>(token);
                const username = decoded.user;

                const response = await fetch("https://aims-api-latest.onrender.com/loans");
                if (response.ok) {
                    const data: Loan[] = await response.json();
                    const filtered = data.filter(
                        (loan) => loan.applicant?.username === username
                    );
                    setFilteredData(filtered);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchLoans();
    }, []);

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);

    const columns: TableColumn<Loan>[] = [
        {
            name: "ID",
            selector: (row) => row.loanId,
            sortable: true,
        },
        {
            name: "Amount",
            selector: (row) =>
                row.amount.toLocaleString("en-MW", {
                    style: "currency",
                    currency: "MWK",
                }),
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Purpose",
            selector: (row) => row.purpose,
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Date granted",
            selector: (row) =>
                new Date(row.dateApplied).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            maxWidth: "100px",
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex">
                    <button
                        className="text-blue-600 p-2 hover:text-blue-800 hover:bg-blue-100 transition-colors duration-200 bg-gray-200 rounded-md"
                        title="View Details"
                        onClick={() => {
                            setSelectedLoan(row);
                            setShowDetailsDialog(true);
                        }}
                    >
                        <FiEye className="w-5 h-5" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: "250px",
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "13px",
            },
        },
    };

    return (
        <>
            <div className="p-4">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    customStyles={customStyles}
                    pagination
                    highlightOnHover
                    striped
                />
            </div>

            {typeof window !== "undefined" && shouldRenderDialog && selectedLoan &&
                ReactDOM.createPortal(
                    <div
                        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50 transition-opacity duration-300 ${
                            showDetailsDialog ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div
                            className={`bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto transition-all transform duration-300 ${
                                showDetailsDialog ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4"
                            }`}
                        >
                            <h3 className="text-lg  mb-6 text-center text-black">Loan Details</h3>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <strong>Loan ID:</strong> {selectedLoan.loanId}
                                </div>
                                <div>
                                    <strong>Amount:</strong>{" "}
                                    {selectedLoan.amount.toLocaleString("en-MW", {
                                        style: "currency",
                                        currency: "MWK",
                                    })}
                                </div>
                                <div>
                                    <strong>Purpose:</strong> {selectedLoan.purpose}
                                </div>
                                <div>
                                    <strong>Status:</strong> {selectedLoan.status}
                                </div>
                                <div>
                                    <strong>Date Applied:</strong>{" "}
                                    {new Date(selectedLoan.dateApplied).toLocaleString()}
                                </div>
                                <div>
                                    <strong>Date Granted:</strong>{" "}
                                    {selectedLoan.dateGranted
                                        ? new Date(selectedLoan.dateGranted).toLocaleString()
                                        : "N/A"}
                                </div>
                                <div>
                                    <strong>Applicant:</strong>{" "}
                                    {selectedLoan.applicant?.username || "Unknown"}
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
                )
            }
        </>
    );
}