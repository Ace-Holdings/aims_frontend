import React, {useEffect, useState} from "react";
import DataTable from "react-data-table-component";
import {FiEdit, FiEye, FiTrash2} from "react-icons/fi";
import DatePicker from "react-datepicker";

export default function UsersTable() {

    const [users, setUsers] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // states for updating
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [role, setRole] = useState("");


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

    const openDetailDialog = (user: any) => {
        setSelectedUser(user);
        setShowDetailsDialog(true);
    }

    const openUpdateDialog = (user: any) => {
        setSelectedUser(user);
        setShowUpdateDialog(true);
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

    // handler function to update a user
    const handleUpdateUser = async () => {
        try {
            const updatedUser = {
                ...(firstName && { firstName }),
                ...(lastName && {surname: lastName}),
                ...(username && { username }),
                ...(password && { password }),
                ...(email && { email }),
                ...(idNumber && { idNumber }),
                ...(role && {roleId: [parseInt(role)]}),
            };

            const response = await fetch(`http://localhost:3002/users/${selectedUser.userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                console.log("Failed to user");
                return;
            }

            setShowUpdateDialog(false);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    };


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
                            openDetailDialog(row)
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
                        <h3 className="text-xl font-semibold mb-4 text-gray-400 text-center">Confirm Delete</h3>
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

            {showDetailsDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 text-black font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-lg font-semibold mb-6 text-center text-gray-400">User Details</h3>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <strong>First name:</strong> {selectedUser.firstName}
                            </div>
                            <div>
                                <strong>Last name:</strong> {selectedUser.surname}
                            </div>
                            <div>
                                <strong>username:</strong> {selectedUser.username}
                            </div>
                            <div>
                                <strong>email:</strong> {selectedUser.email}
                            </div>
                            <div>
                                <strong>ID number:</strong> {selectedUser.idNumber}
                            </div>
                            <div>
                                <strong>Assignment status:</strong> {selectedUser.assignmentStatus}
                            </div>
                            <div>
                                <strong>Assignment ID:</strong> {selectedUser.assignmentId}
                            </div>
                            <div>
                                <strong>Roles:</strong> {selectedUser.roles.map(role => role.name).join(", ")}
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
                </div>
            )}

            {showUpdateDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 text-black mt-14 font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">Update user</h3>
                        <form>
                            <div className="mb-4 ">
                                <label>First name</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={firstName}
                                    onChange={(e: any) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="mb-4 ">
                                <label>Last name</label>
                                <input
                                    type="text"
                                    name="locationName"
                                    className="border p-2 w-full bg-white"
                                    value={lastName}
                                    onChange={(e: any) => setLastName(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={username}
                                    onChange={(e: any) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Password</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Email</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={email}
                                    onChange={(e: any) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Id number</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="border p-2 w-full bg-white"
                                    value={idNumber}
                                    onChange={(e: any) => setIdNumber(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    defaultValue=""
                                    onChange={(e) => setRole(e.target.value)}
                                    value={role}
                                >
                                    <option value="" disabled>
                                        Select a role
                                    </option>
                                    <option value="2">Manager</option>
                                    <option value="3">Employee</option>
                                </select>
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
                                    onClick={handleUpdateUser}
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>

    )
}