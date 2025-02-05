import DataTable from "react-data-table-component";
import React, { useEffect, useState } from "react";
import {FiTrash2} from "react-icons/fi";

export default function InventoryTable() {
    const [stock, setStock] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch('http://localhost:3002/inventory', {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                setStock(data);
                setFilteredData(data);
            });
    }, []);

    // Columns Definition
    const columns = [
        { name: "ID", selector: (row: any) => row.inventoryId, sortable: true },
        { name: "Item name", selector: (row: any) => row.name, sortable: true },
        { name: "Quantity", selector: (row: any) => row.quantity, sortable: true },
        { name: "Price per unit", selector: (row: any) => row.pricePerUnit },
        { name: "Description", selector: (row: any) => row.description },
        { name: "Date added", selector: (row: any) => row.dateAdded },
        { name: "Location", selector: (row: any) => row.location },
        {
            name: "Actions",
            selector: (row: any) => (
                <button
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    title="Delete User"
                >
                    <FiTrash2 className="w-5 h-5" />
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    // Custom styles for table
    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "13px",
            },
        },
    };

    // Handle Filter Change
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilter(value);

        const filtered =
            value === "All"
                ? stock
                : stock.filter((item: any) => item.status === value);

        setFilteredData(filtered.filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        ));
    };

    // Handle Search Change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        const filtered = stock.filter((item: any) =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredData(
            filter === "All"
                ? filtered
                : filtered.filter((item: any) => item.status === filter)
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
    );
}