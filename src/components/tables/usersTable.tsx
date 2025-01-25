import React, {useEffect, useState} from "react";
import DataTable from "react-data-table-component";

export default function UsersTable() {
    const data = [
        { id: 1, username: "john", firstname: "John", surname: "Ndawala", email: "john@mail.com", role: "Admin", status: "Active" },
        { id: 2, username: "jane.smith", firstname: "Jane", surname: "Smith", email: "jane.smith@mail.com", role: "User", status: "Inactive" },
        { id: 3, username: "alice.j", firstname: "Alice", surname: "Johnson", email: "alice.johnson@mail.com", role: "Moderator", status: "Active" },
        { id: 4, username: "bob.brown", firstname: "Bob", surname: "Brown", email: "bob.brown@mail.com", role: "User", status: "Inactive" },
        { id: 5, username: "charlie.w", firstname: "Charlie", surname: "White", email: "charlie.white@mail.com", role: "Admin", status: "Active" }
    ];

    const [users, setUsers] = useState([]);

    // put it in use effect since it has to fetch everytime the page reloads
    useEffect(() => {
        fetch("http://localhost:3002/users", {
            method: "GET",
        })
            .then((res) => res.json())
            .then((fetchedUsers) => {
                const sortedUsers = fetchedUsers.sort((a: any, b: any) => b.userId - a.userId);
                setUsers(sortedUsers);
                setFilteredData(sortedUsers); // Set filteredData to initial users list
            });
    }, []);


    // Columns Definition
    const columns = [
        {
            name: "ID",
            selector: (row: any) => row.userId,
            sortable: true,
        },
        {
            name: "Firstname",
            selector: (row: any) => row.firstName,
            sortable: true,
        },
        {
            name: "Lastname",
            selector: (row: any) => row.surname,
            sortable: true,
        },
        {
            name: "Username",
            selector: (row: any) => row.username,

        },
        {
            name: "email",
            selector: (row: any) => row.email,
        },
        {
            name: "Role",
            selector: (row: any) =>
                row.roles && row.roles.length > 0
                    ? row.roles.map((role: any) => role.name).join(", ")
                    : "No Roles",
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: any) => row.assignmentStaus,
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
    const [filteredData, setFilteredData] = useState(users);

    // Handle Filter Change
    const handleFilterChange = (e: any) => {
        const value = e.target.value;
        setFilter(value);

        const filtered =
            value === "All"
                ? users
                : users.filter((item: any) => item.status === value);
        setFilteredData(
            filtered.filter((item: any) =>
                item.username.toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    // Handle Search Change
    const handleSearchChange = (e: any) => {
        const value = e.target.value;
        setSearch(value);

        const filtered = users.filter((item: any) =>
            item.username.toLowerCase().includes(value.toLowerCase())
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
    )
}