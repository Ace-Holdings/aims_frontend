import React, {useEffect, useState} from "react";
import {FiEdit, FiEye, FiTrash2} from "react-icons/fi";
import DataTable from "react-data-table-component";
import ReactDOM from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

export default function AssignmentsTableEmployee() {
    const [assignments, setAssignments] = useState<SelectedAssignment[]>([])
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<SelectedAssignment | null>(null);

    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


    useEffect(() => {
        fetch("http://localhost:3002/assignments", {
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


    const openDetailsDialog = (assignment: any) => {
        setShowDetailsDialog(true);
        setSelectedAssignment(assignment);
    }


    // Columns Definition
    const columns: any[] = [
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
        },
        {
            name: "Actions",
            selector: (row: any) => (
                <div className="flex">
                    <button
                        className="text-blue-600 p-2 hover:text-blue-800 hover:bg-blue-100 transition-colors duration-200 bg-gray-200 rounded-md"
                        title="View Details"
                        onClick={() => {
                            openDetailsDialog(row)
                        }}
                    >
                        <FiEye className="w-5 h-5"/>
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
                <div className="flex justify-between items-center mb-4 text-black">
                    {/* Filter Dropdown */}
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

            {typeof window !== "undefined" && shouldRenderDialog && document?.body && selectedAssignment &&
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
                            <h3 className="text-lg mb-6 text-center text-black">Assignment Details</h3>
                            <div className="flex flex-wrap gap-4">
                                <div><strong>Assignment:</strong> {selectedAssignment.assignmentName}</div>
                                <div><strong>Location:</strong> {selectedAssignment.location}</div>
                                <div><strong>Description:</strong> {selectedAssignment.description}</div>
                                <div>
                                    <strong>Employees to attend:</strong>{" "}
                                    {selectedAssignment.users.map(user => user.username).join(", ")}
                                </div>
                                <div><strong>Status:</strong> {selectedAssignment.status}</div>
                                <div>
                                    <strong>Start At:</strong>{" "}
                                    {selectedAssignment.startsAt
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
                                    {selectedAssignment.endsAt
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
                    </div>,
                    document.body
                )
            }

        </>
    )
}