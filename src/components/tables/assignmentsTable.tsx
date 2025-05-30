"use client"

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {FiEdit, FiMenu, FiTrash2} from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactDOM from "react-dom";

interface SelectedAssignment {
    assignmentId: number;
    assignmentName?: string;
    location?: string;
    description?: string;
    status?: string | boolean;
    startsAt?: string | Date;
    endsAt?: string | Date;
    updatedAt?: string;
    users: any[];
}

interface Objective {
    objectiveId: number;
    assignmentId: number;
    objectiveText: string;
    isComplete: boolean;
}

export default function AssignmentsTable() {
    const [assignments, setAssignments] = useState<SelectedAssignment[]>([])
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<SelectedAssignment | null>(null);

    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);

    // Form states for update
    const [assignmentName, setAssignmentName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [startsAt, setStartsAt] = useState<Date | null>(null);
    const [endsAt, setEndsAt] = useState<Date | null>(null);

    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [showObjectivesDialog, setShowObjectivesDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


    useEffect(() => {
        fetch("https://aims-api-latest.onrender.com/assignments", {
            method: "GET",
            headers: {
                "authorization": `Bearer ` + token,
            }
        }).then((response) => response.json())
            .then((data) => {
                setAssignments(data)
                setFilteredData(data)
            })
    }, []);

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);

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

    const openObjectivesDialog = async (assignment: any) => {
        setSelectedAssignment(assignment);
        try {
            const objectivesResponse = await fetch(`https://aims-api-latest.onrender.com/objectives/`, {
                method: "GET",
            });
            if (!objectivesResponse.ok) {
                console.log('could not fetch objectives');
                return;
            }
            const data = await objectivesResponse.json();
            setObjectives(data);
            console.log(objectives.length);
            setShowObjectivesDialog(true);
        } catch (e) {
            console.error(e);
        }
    }

    const closeObjectivesDialog = () => {
        setObjectives([]);
        console.log(objectives)
        setShowObjectivesDialog(false);
    }

    // Handle update request
    const handleUpdateAssignment = async () => {
        setLoading(true);
        try {
            const updatedAssignment = {
                assignmentId: selectedAssignment?.assignmentId,
                ...(assignmentName && { assignmentName }),
                ...(location && { location }),
                ...(description && { description }),
                ...(status !== "" && { status }),
                ...(startsAt && { startsAt: startsAt.toISOString() }),
                ...(endsAt && { endsAt: endsAt.toISOString() }),
                updatedAt: new Date().toISOString(),
            };

            const response = await fetch(`https://aims-api-latest.onrender.com/assignments/${selectedAssignment?.assignmentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ` + token,
                },
                body: JSON.stringify(updatedAssignment),
            });

            if (!response.ok) {
                console.log("Failed to update assignment");
                return;
            }

            setShowUpdateDialog(false);
            setLoading(false);
            window.location.reload();
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    // handler function for deleting an assignment
    const handleDeleteAssignment = async () => {
        try {
            const response = await fetch(`https://aims-api-latest.onrender.com/assignments/${selectedAssignment?.assignmentId}`, {
                method: "DELETE",
                headers: {
                    "authorization": `Bearer ` + token,
                }
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
    const columns: any = [
        {
            name: "ID",
            selector: (row: any) => row.assignmentId,
            sortable: true,
        },
        {
            name: "Assignment name",
            selector: (row: any) => row.assignmentName,
            sortable: true,
            maxWidth: "200px"
        },
        {
            name: "Location",
            selector: (row: any) => row.location,
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Starts At",
            selector: (row: any) => new Date(row.startsAt).toLocaleString("en-US", {
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
            name: "Ends At",
            selector: (row: any) => new Date(row.endsAt).toLocaleString("en-US", {
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
            selector: (row: any) => row.status === true ? "Active" : "Inactive",
            sortable: true,
            maxWidth: "100px",
        },
        {
            name: "Actions",
            selector: (row: any) => (
                <div className="flex">
                    <button
                        className="text-purple-600 hover:text-purple-800 transition-colors duration-200
               rounded-md p-2 hover:bg-purple-100 bg-gray-200"
                        onClick={() => openObjectivesDialog(row)}
                    >
                        <FiMenu className="w-5 h-5" />
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-green-600 hover:text-green-800 transition-colors duration-200
               p-2 hover:bg-green-100 bg-gray-200 rounded-md"
                        onClick={() => openUpdateDialog(row)}
                    >
                        <FiEdit className="w-5 h-5" />
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-blue-600 p-2 hover:text-blue-800 hover:bg-blue-100 transition-colors duration-200 bg-gray-200 rounded-md"
                        title="View Details"
                        onClick={() => {
                            openDetailsDialog(row)
                        }}
                    >
                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-red-600 p-2 hover:text-red-800 hover:bg-red-100 transition-colors duration-200 bg-gray-200 rounded-md"
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
    const [filteredData, setFilteredData] = useState<any[]>([]);

    // Handle Filter Change
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilter(value);
        console.log(value);

        const filtered =
            value === "All"
                ? assignments
                : assignments.filter((item: any) => {
                    const status = item.status;
                    const isActive = value === "true";
                    return isActive ? status === true : status === false || status === null;
                });

        setFilteredData(filtered);
    };

    // Handle Search
    const handleSearchChange = (e: any) => {
        const value = e.target.value;
        setSearch(value);

        setFilteredData(
            assignments.filter((item) =>
                item.assignmentName?.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    return (
        <>
            <div className="p-4">
                {/* main content */}
                <div className="flex justify-between items-center mb-4 text-black">
                    <select
                        value={filter}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="All">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
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

            {/* modal for deleting an assignment */}
            <div
                className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50 transition-opacity duration-300 ${
                    showDeleteDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10 transition-all transform duration-300 ${
                        showDeleteDialog
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-4'
                    }`}
                >
                    <h3 className="text-lg mb-4 text-black text-center">Confirm Delete</h3>
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
            </div>

            {/* modal for assignment details */}
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
                    <h3 className="text-lg mb-6 text-center text-black">Assignment Details</h3>
                    <div className="flex flex-wrap gap-4">
                        <div><strong>Assignment:</strong> {selectedAssignment?.assignmentName}</div>
                        <div><strong>Location:</strong> {selectedAssignment?.location}</div>
                        <div><strong>Description:</strong> {selectedAssignment?.description}</div>
                        <div>
                            <strong>Employees to attend:</strong> {selectedAssignment?.users.map(user => user.username).join(", ")}
                        </div>
                        <div><strong>Status:</strong> {selectedAssignment?.status}</div>
                        <div>
                            <strong>Start At:</strong>{" "}
                            {selectedAssignment?.startsAt
                                ? new Date(selectedAssignment.startsAt).toLocaleString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : "N/A"}
                        </div>
                        <div>
                            <strong>Ends At:</strong>{" "}
                            {selectedAssignment?.endsAt
                                ? new Date(selectedAssignment.endsAt).toLocaleString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : "N/A"}
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
            </div>

            {/* modal for updating an assignment */}
            <div
                className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-15 text-black backdrop-blur-sm font-custom z-50 transition-opacity duration-300 ${
                    showUpdateDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto transition-all transform duration-300 ${
                        showUpdateDialog
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-4'
                    }`}
                >
                    <h3 className="text-lg mb-4 text-center text-black">Update Assignment</h3>
                    <form>
                        <div className="mb-4">
                            <label>Assignment</label>
                            <input
                                type="text"
                                className="border p-2 w-full bg-white"
                                value={assignmentName}
                                onChange={(e) => setAssignmentName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
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
                            <label htmlFor="startsAt" className="block text-gray-700 font-medium mb-2">
                                Starts at
                            </label>
                            <DatePicker
                                selected={startsAt}
                                onChange={(date: any) => setStartsAt(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                placeholderText="Select start date and time"
                                className="grow p-2 bg-white w-[180px] border border-gray-300 rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="endsAt" className="block text-gray-700 font-medium mb-2">
                                Ends at
                            </label>
                            <DatePicker
                                selected={endsAt}
                                onChange={(date: any) => setEndsAt(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                placeholderText="Select end date and time"
                                className="grow p-2 bg-white w-[180px] border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                onClick={() => setShowUpdateDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                                onClick={handleUpdateAssignment}
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* modal for assignment objectives checklist */}
            <div
                className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-15 text-black backdrop-blur-sm font-custom z-50 transition-opacity duration-300 ${
                    showObjectivesDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto transition-all transform duration-300 ${
                        showObjectivesDialog
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-4'
                    }`}
                >
                    <h3 className="text-lg mb-4 text-center">Assignment Objectives</h3>
                    <div className="mb-4 max-h-80 overflow-y-auto">
                        {objectives.length === 0 ? (
                            <p className="text-center text-black">No objectives for this assignment.</p>
                        ) : (
                            <ul className="space-y-2">
                                {objectives
                                    .filter(obj => obj.assignmentId === selectedAssignment?.assignmentId)
                                    .map((obj, index) => (
                                        <li key={index} className="flex items-center justify-between border-b pb-1">
                                            <span className="text-gray-700">{obj.objectiveText}</span>
                                            <span className="text-xl">{obj.isComplete ? '✅' : '❌'}</span>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                            onClick={closeObjectivesDialog}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="w-16 h-16 border-8 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </>

    )
}