import React, {useState} from "react";
import DataTable from "react-data-table-component";

export default function UsersTable() {
    const data = [
        { id: 1, username: "john", firstname: "John", surname: "Ndawala", email: "john@mail.com", role: "Admin", status: "Active" },
        { id: 2, username: "jane.smith", firstname: "Jane", surname: "Smith", email: "jane.smith@mail.com", role: "User", status: "Inactive" },
        { id: 3, username: "alice.j", firstname: "Alice", surname: "Johnson", email: "alice.johnson@mail.com", role: "Moderator", status: "Active" },
        { id: 4, username: "bob.brown", firstname: "Bob", surname: "Brown", email: "bob.brown@mail.com", role: "User", status: "Inactive" },
        { id: 5, username: "charlie.w", firstname: "Charlie", surname: "White", email: "charlie.white@mail.com", role: "Admin", status: "Active" }
    ];

    // Columns Definition
    const columns = [
        {
            name: "ID",
            selector: (row: any) => row.id,
            sortable: true,
        },
        {
            name: "Username",
            selector: (row: any) => row.username,
            sortable: true,
        },
        {
            name: "First Name",
            selector: (row: any) => row.firstname,
            sortable: true,
        },
        {
            name: "Last Name",
            selector: (row: any) => row.surname,

        },
        {
            name: "Email",
            selector: (row: any) => row.email,
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
                item.username.toLowerCase().includes(value.toLowerCase())
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