"use client"

import React, { useState } from "react";
import DataTable from "react-data-table-component";

export default function AssignmentsTable() {
    const data = [
        { id: 1, name: "John Doe", role: "Admin", status: "Active" },
        { id: 2, name: "Jane Smith", role: "User", status: "Inactive" },
        { id: 3, name: "Alice Johnson", role: "Moderator", status: "Active" },
        { id: 4, name: "Bob Brown", role: "User", status: "Inactive" },
        { id: 5, name: "Charlie White", role: "Admin", status: "Active" },
    ];

    // Columns Definition
    const columns = [
        {
            name: "ID",
            selector: (row: any) => row.id,
            sortable: true,
        },
        {
            name: "Name",
            selector: (row: any) => row.name,
            sortable: true,
        },
        {
            name: "Role",
            selector: (row: any) => row.role,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: any) => row.status,
            sortable: true,
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
    )
}