import React, {useEffect, useState} from "react";
import DataTable from "react-data-table-component";
import {FiEdit, FiEye, FiTrash2} from "react-icons/fi";
import DatePicker from "react-datepicker";
import ReactDOM from "react-dom";
import {jwtDecode} from "jwt-decode";

export default function UsersTable() {

    const [users, setUsers] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);

    // states for updating
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [salaryId, setSalaryId] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [role, setRole] = useState("");


    useEffect(() => {
        fetch("http://localhost:3002/users", {
            method: "GET",
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
            }
        })
            .then((res) => res.json())
            .then((fetchedUsers) => {
                const sortedUsers = fetchedUsers.sort((a: any, b: any) => b.userId - a.userId);
                setUsers(sortedUsers);
                setFilteredData(sortedUsers);
            });
    }, []);

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);

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
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                }
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
                ...(salaryId && {salaryId: parseInt(salaryId)}),
                ...(idNumber && { idNumber }),
                ...(role && {roleId: [parseInt(role)]}),
            };

            const user: any = jwtDecode(localStorage.getItem('token')).user;
            console.log(user);

            const response = await fetch(`http://localhost:3002/users/${selectedUser.userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
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
            name: "Actions",
            selector: (row: any) => (
                <div className="flex">
                    <button
                        className="text-green-600 hover:text-green-800 transition-colors duration-200
               p-2 hover:bg-green-100 bg-gray-200 rounded-md"
                        onClick={() => {openUpdateDialog(row)}}
                    >
                        <FiEdit className="size-6"/>
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-blue-600 p-2 hover:text-blue-800 transition-colors hover:bg-blue-100 duration-200 bg-gray-200 rounded-md"
                        title="View Details"
                        onClick={() => {
                            openDetailDialog(row)
                        }}
                    >
                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-red-600 p-2 hover:text-red-800 transition-colors duration-200 hover:bg-red-100 bg-gray-200 rounded-md"
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
    const [filteredData, setFilteredData] = useState(users);

    // Handle Filter Change
    const handleFilterChange = (e: any) => {
        const value = e.target.value;
        setFilter(value);

        const filtered =
            value === "All"
                ? users
                : users.filter((item: any) => {
                    const status = item.assignment?.status;
                    return value === "true"
                        ? status === true
                        : status === false || status === null || item.assignment === null;
                });

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

            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black text-black font-custom bg-opacity-30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                        showDeleteDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10 transform transition-all duration-300 ${
                            showDeleteDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h3 className="text-xl font-semibold mb-4 text-gray-400 text-center">Confirm Delete</h3>
                        <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this user?</p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md"
                                onClick={handleDeleteUser}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {shouldRenderDialog &&
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
                                    <strong>Assignment ID:</strong> {selectedUser.assignmentId}
                                </div>
                                <div>
                                    <strong>Roles:</strong> {selectedUser.roles.map(role => role.name).join(", ")}
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

            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black text-black font-custom bg-opacity-30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                        showUpdateDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto transform transition-all duration-300 ${
                            showUpdateDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">Update user</h3>
                        <form>
                            <div className="mb-4">
                                <label>First name</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Last name</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Username</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Password</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label>Email</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                                    Salary
                                </label>
                                <select
                                    id="role"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    defaultValue=""
                                    onChange={(e) => setSalaryId(e.target.value)}
                                    value={salaryId}
                                >
                                    <option value="" disabled>
                                        Select a salary class
                                    </option>
                                    <option value="1">A</option>
                                    <option value="2">B</option>
                                    <option value="3">C</option>
                                    <option value="4">D</option>
                                    <option value="5">E</option>
                                    <option value="6">F</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label>Id number</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
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
                                    type="button"
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                    onClick={() => setShowUpdateDialog(false)}
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
                </div>,
                document.body
            )}
        </>

    )
}