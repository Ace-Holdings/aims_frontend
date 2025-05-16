"use client"

import DataTable from "react-data-table-component";
import React, {useEffect, useState} from "react";
import {FiEdit, FiEye, FiTrash2} from "react-icons/fi";
import ReactDOM from "react-dom";

interface LogEntry {
    id: number;
    username: string;
    level: string;
    message: string;
    timestamp: string;
}

export default function LogTable() {
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filteredData, setFilteredData] = useState<LogEntry[]>([]);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);


    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);


    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "13px",
            },
        },

    };

    useEffect(() => {
        const fetchUsers = async () => {
            try{
                const response = await fetch('http://localhost:3002/logs', {
                    method: "GET",
                    headers: {
                        "authorization": "Bearer " + localStorage.getItem("token"),
                    }
                });

                const data = await response.json();
                setLogs(data);
            } catch (e) {

            }
        }
    }, []);

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);

    const openDetailsDialog = (log: any) => {
        setSelectedLog(log);
        setShowDetailsDialog(true);
    }

    const openDeleteDialog = (log: any) => {
        setSelectedLog(log);
        setShowDeleteDialog(true);
    }

    const handleDeleteLog = async () => {
        try {
            const response = await fetch(`http://localhost:3002/logs/${selectedLog?.id}`, {
                method: "DELETE",
                headers: {
                    "authorization": "Bearer " + localStorage.getItem("token"),
                }
            });
            if (!response.ok) {
                console.log('an error occured');
            }
            setShowDeleteDialog(false);
            window.location.reload();
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('http://localhost:3002/logs', {
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                if (!response.ok) {
                    console.error();
                    return;
                }
                const data = await response.json();
                setFilteredData(data);
            } catch (e) {
                console.error(e);
            }
        }
        fetchLogs();
    }, [])

    const columns: any[] = [
        {
            name: "ID",
            selector: (row: any) => row.id,
            sortable: true,
        },
        {
            name: "User",
            selector: (row: any) => row.username,
            sortable: true,
        },
        {
            name: "Level",
            selector: (row: any) => row.level,
            sortable: true,
        },
        {
            name: "Message",
            selector: (row: any) => row.message,
            sortable: true,
        },
        {
            name: "Timestamp",
            selector: (row: any) => new Date(row.timestamp).toLocaleString("en-US", {
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
            name: "Actions",
            selector: (row: any) => (
                <div className="flex">
                    <button
                        className="text-blue-600 p-2
                        hover:text-blue-800 hover:bg-blue-100 transition-colors duration-200 bg-gray-200 rounded-md"
                        title="View Details"
                        onClick={() => openDetailsDialog(row)}
                    >
                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-red-600 p-2 hover:text-red-800 transition-colors duration-200 hover:bg-red-100 bg-gray-200 rounded-md"
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
            minWidth: "250px"
        },
    ];


    return (
        <>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4 text-black">
                    {/* Filter Dropdown */}
                    <select
                        className="border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    {/* Search Bar */}
                    <input
                        type="text"

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

            {/* modal for showing log details */}
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
                            <h3 className="text-lg mb-6 text-center text-black">Log Details</h3>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <strong>ID:</strong> {selectedLog?.id}
                                </div>
                                <div>
                                    <strong>Initiator:</strong> {selectedLog?.username}
                                </div>
                                <div>
                                    <strong>Action:</strong> {selectedLog?.message}
                                </div>
                                <div>
                                    <strong>Level:</strong> {selectedLog?.level}
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

            {/* modal for deleting a log*/}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                        showDeleteDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10 transform transition-all duration-300 ${
                            showDeleteDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-2 opacity-0'
                        }`}
                    >
                        <h3 className="text-xl  mb-4 text-black text-center">Confirm Delete</h3>
                        <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this log?</p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md"
                                onClick={handleDeleteLog}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}