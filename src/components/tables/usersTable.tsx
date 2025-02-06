import React, {useEffect, useState} from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";

export default function UsersTable() {

    const [users, setUsers] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);


    useEffect(() => {
        fetch("http://localhost:3002/users", {
            method: "GET",
        })
            .then((res) => res.json())
            .then((fetchedUsers) => {
                const sortedUsers = fetchedUsers.sort((a: any, b: any) => b.userId - a.userId);
                setUsers(sortedUsers);
                setFilteredData(sortedUsers);
            });
    }, []);

    const openDeleteDialog = (user: any) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    }

    // function to delete user
    const handleDeleteUser = async () => {
        try {
            const response = await fetch(`http://localhost:3002/users/${selectedUser.userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.error('could not delete user');
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
        {
            name: "Actions",
            selector: (row: any) => (
                <button
                    onClick={() => openDeleteDialog(row)}
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

            {showDeleteDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 text-black backdrop-blur-sm font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10">
                        <h3 className="text-xl font-semibold mb-4 text-neon-pink">Confirm Delete</h3>
                        <p className="text-sm text-gray-700 mb-6">
                            Are you sure you want to delete this user?
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
                                onClick={handleDeleteUser}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>

    )
}