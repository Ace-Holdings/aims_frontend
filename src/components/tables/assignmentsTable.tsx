"use client"

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {FiEdit, FiTrash2} from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactDOM from "react-dom";

export default function AssignmentsTable() {
    const data = [
        { id: 1, name: "John Doe", role: "Admin", status: "Active" },
        { id: 2, name: "Jane Smith", role: "User", status: "Inactive" },
        { id: 3, name: "Alice Johnson", role: "Moderator", status: "Active" },
        { id: 4, name: "Bob Brown", role: "User", status: "Inactive" },
        { id: 5, name: "Charlie White", role: "Admin", status: "Active" },
    ];

    const [assignments, setAssignments] = useState([])
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Form states for update
    const [assignmentName, setAssignmentName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [startsAt, setStartsAt] = useState(new Date());
    const [endsAt, setEndsAt] = useState(new Date());

    useEffect(() => {
        fetch("http://localhost:3002/assignments", {
            method: "GET",
        }).then((response) => response.json())
            .then((data) => {
                setAssignments(data)
                setFilteredData(data)
            })
    }, []);

    const openDeleteDialog = (assignment: any) => {
        setShowDeleteDialog(true);
        setSelectedAssignment(assignment);
    }

    const openDetailsDialog = (assignment: any) => {
        setShowDetailsDialog(true);
        setSelectedAssignment(assignment);
    }

    const openUpdateDialog = (assignment: any) => {
        setShowUpdateDialog(true);
        setSelectedAssignment(assignment);
    }

    // Handle update request
    const handleUpdateAssignment = async () => {
        try {
            const updatedAssignment = {
                assignmentId: selectedAssignment.assignmentId,
                ...(assignmentName && { assignmentName }),
                ...(location && { location }),
                ...(description && { description }),
                ...(status !== "" && { status }),
                ...(startsAt && { startsAt: startsAt.toISOString() }),
                ...(endsAt && { endsAt: endsAt.toISOString() }),
                updatedAt: new Date().toISOString(),
            };

            const response = await fetch(`http://localhost:3002/assignments/${selectedAssignment.assignmentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedAssignment),
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

    // handler function for deleting an assignment
    const handleDeleteAssignment = async () => {
        try {
            const response = await fetch(`http://localhost:3002/assignments/${selectedAssignment.assignmentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.log('failed to fetch');
            }
            setShowDeleteDialog(false);
            window.location.reload();
        } catch(e) {
            console.log(e);
        }
    }

    // Columns Definition
    const columns = [
        {
            name: "ID",
            selector: (row: any) => row.assignmentId,
            sortable: true,
        },
        {
            name: "Assignment name",
            selector: (row: any) => row.assignmentName,
            sortable: true,
        },
        {
            name: "Location",
            selector: (row: any) => row.location,
            sortable: true,
        },
        {
            name: "Starts At",
            selector: (row: any) => row.startsAt,
            sortable: true,
        },
        {
            name: "Ends At",
            selector: (row: any) => row.endsAt,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: any) => row.status,
            sortable: true,
        },
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
                            openDetailsDialog(row)
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

    // custom styles for table
    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "13px",
            },
        },

    };

    // States for filtering and searching
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState(data);

    // Handle Filter Change
    const handleFilterChange = (e: any) => {
        const value = e.target.value;
        setFilter(value);

        // Filter data based on status or show all
        if (value === "All") {
            setFilteredData(data);
        } else {
            setFilteredData(data.filter((item) => item.status === value));
        }
    };

    // Handle Search
    const handleSearchChange = (e: any) => {
        const value = e.target.value;
        setSearch(value);

        // Filter data based on search text
        setFilteredData(
            data.filter((item) =>
                item.name.toLowerCase().includes(value.toLowerCase())
            )
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

            {
                showDeleteDialog && ReactDOM.createPortal(
                    <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10">
                            <h3 className="text-lg font-semibold mb-4 text-gray-400 text-center">Confirm Delete</h3>
                            <p className="text-sm text-gray-700 mb-6">
                                Are you sure you want to delete this assignment?
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
                                    onClick={handleDeleteAssignment}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {showDetailsDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-lg font-semibold mb-6 text-center text-gray-400">Assignment Details</h3>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <strong>Assignment:</strong> {selectedAssignment.assignmentNamea}
                            </div>
                            <div>
                                <strong>Location:</strong> {selectedAssignment.location}
                            </div>
                            <div>
                                <strong>Description:</strong> {selectedAssignment.description}
                            </div>
                            <div>
                                <strong>Status:</strong> {selectedAssignment.status}
                            </div>
                            <div>
                                <strong>Start At:</strong> {selectedAssignment.startsAt}
                            </div>
                            <div>
                                <strong>Ends At:</strong> {selectedAssignment.endsAt}
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
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-15 text-black backdrop-blur-sm font-custom z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">Update Assignment</h3>
                        <form>
                            <div className="mb-4 ">
                                <label>Assignment</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={assignmentName}
                                    onChange={(e) => setAssignmentName(e.target.value)}
                                />
                            </div>
                            <div className="mb-4 ">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="locationName"
                                    className="border p-2 w-full bg-white"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Status</label>
                                <select
                                    name="status"
                                    className="border p-2 w-full bg-white"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="" disabled>
                                    </option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Active">Active</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Starts at
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white w-[220px]"
                                        placeholderText="Select start date and time"
                                        popperClassName="z-50"
                                        popperPlacement="top"
                                        showTimeSelectOnly={false}
                                        selected={startsAt}
                                        onChange={(date) => setStartsAt(date as Date)}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Ends at
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white w-[220px]"
                                        placeholderText="Select end date and time"
                                        popperClassName="z-50"
                                        popperPlacement="top"
                                        showTimeSelectOnly={false}
                                        selected={endsAt}
                                        onChange={(date) => setEndsAt(date as Date)}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                    onClick={handleUpdateAssignment}
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

    )
}