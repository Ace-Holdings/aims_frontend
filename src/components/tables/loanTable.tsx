import {FiEdit, FiEye, FiMenu, FiTrash2} from "react-icons/fi";
import React, {useEffect, useState} from "react";
import DataTable from "react-data-table-component";

export default function LoanTable() {
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await fetch('http://localhost:3002/loans');
                if (response.ok) {
                    const data = await response.json();
                    setFilteredData(data);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchLoans();
    }, [])

    const columns = [
        {
            name: "ID",
            selector: (row: any) => row.loanId,
            sortable: true,
        },
        {
            name: "Debtor",
            selector: (row: any) => row.applicant.username,
            sortable: true,
            maxWidth: "200px"
        },
        {
            name: "Amount",
            selector: (row: any) =>
                row.amount.toLocaleString('en-MW', { style: 'currency', currency: 'MWK' }),
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Purpose",
            selector: (row: any) => row.purpose,
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Date granted",
            selector: (row: any) => new Date(row.dateApplied).toLocaleString("en-US", {
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
            name: "Granted by",
            selector: (row: any) => row.grantedBy,
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Status",
            selector: (row: any) => row.status,
            sortable: true,
            maxWidth: "100px",
        },
        {
            name: "Actions",
            selector: (row: any) => (
                <div className="flex">
                    <button
                        className="text-blue-600 p-2 hover:text-blue-800 hover:bg-blue-100 transition-colors duration-200 bg-gray-200 rounded-md"
                        title="View Details"
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


    return(
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
        </>
    )
}