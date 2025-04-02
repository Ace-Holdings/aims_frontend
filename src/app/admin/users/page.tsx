"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import {useEffect, useState} from "react";
import TotalAssignments from "@/components/tiles/totalAssignments";
import ActiveAssignments from "@/components/tiles/activeAssignments";
import TotalUsers from "@/components/tiles/numberOfUsers";
import TotalActiveUsers from "@/components/tiles/numberOfActiveUsers";
import AssignmentsTable from "@/components/tables/assignmentsTable";
import UsersTable from "@/components/tables/usersTable";
import DatePicker from "react-datepicker";
import {jwtDecode} from "jwt-decode";
import {useRouter} from "next/navigation";

export default function UsersAdmin() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSalariesDialogOpen, setIsSalariesDialogOpen] = useState(false);

    // states for forms
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [roleId, setRoleId] = useState("");
    const [salaryId, setSalaryId] = useState("");
    const router = useRouter();

    const [salaries, setSalaries] = useState({
        A: 5000,
        B: 4500,
        C: 4000,
        D: 3500,
        E: 3000,
        F: 2500
    });

    const [updatedSalaries, setUpdatedSalaries] = useState(salaries);

    const handleInputChange = (e, key) => {
        setUpdatedSalaries({
            ...updatedSalaries,
            [key]: e.target.value
        });
    };

    const handleSave = () => {
        setSalaries(updatedSalaries);
    };



    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const openSalariesDialog = () => {
        setIsSalariesDialogOpen(true);
    }

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
        }

        try {
            const decodedToken = jwtDecode(token);
            const roles: string[] = decodedToken.roles || [];

            if(!roles.includes("ROLE_ADMIN")) {
                router.push("/");
            }

        } catch (e) {
            console.error(e);
            router.push("/");
        }
    }, [router]);

    // handler function to submit user details
    const handleUserRegistration = async (e: any) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3002/users', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    firstName: firstname,
                    surname: lastname,
                    username: username,
                    password: password,
                    email: email,
                    idNumber: idNumber,
                    salaryId: parseInt(salaryId),
                    roleId: [parseInt(roleId)]
                })
            })

            if (response.ok) {
                closeDialog();
                window.location.reload();
            }
        } catch(e) {
            console.log(e);
        }
    }

    return (
        <>
            <div className={`h-screen flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""} `}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <SidebarAdmin isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>
                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                    <div className="bg-white  p-4 sticky top-0 z-10">
                        <header className="flex gap-2 items-center text-gray-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0v.75H4.5v-.75Z"
                                />
                            </svg>
                            <span>Users</span>
                            <div className="ml-auto">
                                <Navbar/>
                            </div>

                        </header>
                    </div>
                    <div className="ml-6 mt-10 font-custom">
                        <div className="flex-row gap-4 flex">
                            <TotalUsers/>
                            <div className="w-10"/>
                            <TotalActiveUsers/>
                        </div>
                        <div className="h-7"/>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={openDialog}
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                                Add user
                            </button>

                            <div className='w-2'/>
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                                onClick={openSalariesDialog}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 12h14"
                                    />
                                </svg>
                                Salaries
                            </button>
                        </div>

                    </div>
                    <div className="h-7"/>
                    <UsersTable/>
                </div>
            </div>

            {isDialogOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Add User</h2>
                        <div className="h-2"/>
                        <form onSubmit={handleUserRegistration}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    firstName
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter user firstname"
                                    onChange={(e):void => setFirstname(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    lastName
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter user lastname"
                                    onChange={(e)=>setLastname(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    username
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter username"
                                    onChange={(e)=>setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    password
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter password"
                                    onChange={(e)=>setPassword(e.target.value)}
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
                                    onChange={(e) => setRoleId(e.target.value)}
                                    value={roleId}
                                >
                                    <option value="" disabled>
                                        Select a role
                                    </option>
                                    <option value="2">Manager</option>
                                    <option value="3">Employee</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    email
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter user email"
                                    onChange={(e)=>setEmail(e.target.value)}
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
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    idNumber
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter location name"
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                    onClick={closeDialog}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isSalariesDialogOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center">Manage Salaries</h2>
                        <div className="mb-4">
                            {Object.entries(updatedSalaries).map(([key, value]) => (
                                <div key={key} className="mb-2">
                                    <label className="block text-gray-700 font-medium mb-1">{key}</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={value}
                                        onChange={(e) => handleInputChange(e, key)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="btn bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-lg mr-2"
                                onClick={() => setIsSalariesDialogOpen(false)}
                            >
                                Close
                            </button>
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>


    )
}