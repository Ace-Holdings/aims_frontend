"use client"

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {jwtDecode} from "jwt-decode";
import ManagerSidebar from "@/components/layout/managerSidebar";
import Navbar from "@/components/layout/navbar";
import TotalAssignments from "@/components/tiles/totalAssignments";
import ActiveAssignments from "@/components/tiles/activeAssignments";
import AssignmentsTable from "@/components/tables/assignmentsTable";
import EmployeeSidebar from "@/components/layout/employeeSidebar";
import AssignmentsTableEmployee from "@/components/tables/assignmentsTableEmployee";

export default function EmployeeAssignments() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // form attributes
    const [assignmentName, setAssignmentName] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [employeeAssigned, setEmployeeAssigned] = useState("");
    const [description, setDescription] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [employeeResults, setEmployeeResults] = useState<any[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
    const router = useRouter();

    const [hasActiveAssignment, setHasActiveAssignment] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decodedToken = jwtDecode(token);
        const user = decodedToken.user;

        const fetchAssignments = async () => {
            try {
                const response = await fetch('http://localhost:3002/assignments', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch assignments");

                const data = await response.json();

                const activeAssignment = data.find((assignment) =>
                    assignment.status === true &&
                    assignment.users?.some(u => u.username === user)
                );

                setHasActiveAssignment(activeAssignment);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            }
        };

        fetchAssignments();
        const interval = setInterval(fetchAssignments, 10000);

        return () => clearInterval(interval);
    }, []);

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    // Add employee to selected list
    const handleSelectEmployee = (employee: any) => {
        if (!selectedEmployees.find(e => e.userId === employee.userId)) {
            setSelectedEmployees(prevSelectedEmployees => {
                return [...prevSelectedEmployees, employee];
            });
        }
        setSearchTerm(""); // Clear search box
        setEmployeeResults([]); // Clear search results
    };

    // Remove selected employee
    const handleRemoveEmployee = (employeeId: string) => {
        setSelectedEmployees(selectedEmployees.filter(e => e.userId !== employeeId));
    };

    useEffect(() => {
        const storedState = localStorage.getItem("adminSidebarCollapsed");
        if (storedState !== null) {
            setIsSidebarCollapsed(storedState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("adminSidebarCollapsed", String(newState));
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token) {
            router.push("/");
        }

        try {
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles || [];

            if (!roles.includes("ROLE_EMPLOYEE")) {
                router.push("/");
            }
        } catch (e) {
            console.error(e);
            router.push("/");
        }

    }, [router]);

    // Fetch employees based on search term
    const handleSearch = async (query: string) => {
        setSearchTerm(query);
        if (query.length < 2) {
            setEmployeeResults([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3002/users/search?username=${query}`, {
                headers: {
                    "authorization": 'Bearer ' + localStorage.getItem('token')
                },
            });
            if (response.ok) {
                const data = await response.json();
                setEmployeeResults(data);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // handler function to submit assignment form data to server
    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();

        try {
            // Step 1: Create the assignment first
            const assignmentResponse = await fetch('http://localhost:3002/assignments', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    assignmentName: assignmentName,
                    location: location,
                    startsAt: startDate,
                    endsAt: endDate,
                    description: description, // Employees are NOT included here
                })
            });

            if (!assignmentResponse.ok) {
                throw new Error("Failed to create assignment");
            }

            const assignmentData = await assignmentResponse.json();
            const assignmentId = assignmentData.assignmentId; // Assuming API returns assignment ID

            // Step 2: Assign employees to the created assignment
            if (selectedEmployees.length > 0) {
                await fetch(`http://localhost:3002/assignments/${assignmentId}/assign-employees`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        employeeIds: selectedEmployees.map(emp => emp.userId),
                    })
                });
            }

            // Close the dialog and reset form after success
            setIsDialogOpen(false);
            window.location.reload();
            setAssignmentName("");
            setLocation("");
            setStartDate(null);
            setEndDate(null);
            setDescription("");
            setSelectedEmployees([]);
        } catch (e) {
            console.log("Error submitting assignment:", e);
        }
    };


    return (
        <>
            <div className={`flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""}`}>
                <div className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <EmployeeSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                </div>
                <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                    <div className="bg-white p-4 sticky top-0 z-10">
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
                                    d="M16.5 6.75V6A2.25 2.25 0 0 0 14.25 3.75h-4.5A2.25 2.25 0 0 0 7.5 6v.75M2.25 10.5h19.5M3 8.25h18A1.5 1.5 0 0 1 22.5 9.75v9a2.25 2.25 0 0 1-2.25 2.25h-16.5A2.25 2.25 0 0 1 1.5 18.75v-9a1.5 1.5 0 0 1 1.5-1.5Z"
                                />
                            </svg>
                            <span>Assignments</span>
                            <div className="ml-auto">
                                <Navbar />
                            </div>
                        </header>
                    </div>
                    <div className="ml-6 mt-10">
                        <div className="flex-row gap-4 flex">
                            <TotalAssignments />
                            <div className="w-10" />
                            <ActiveAssignments />
                        </div>
                    </div>
                    <div className="h-7" />
                    <div>{hasActiveAssignment && (
                        <button className="flex items-center text-left justify-between bg-green-500 text-white p-4 rounded-lg shadow-md w-fit mt-4 ml-6 hover:bg-green-600 transition">
                            <div>
                                You have an active assignment:<br />
                                <strong>{hasActiveAssignment.assignmentName}</strong> at <strong>{hasActiveAssignment.location}</strong>
                            </div>
                            <div className="w-6"/>
                            <span className="ml-4 text-xl font-bold">{'>'}</span>
                        </button>
                    )}</div>
                    <AssignmentsTableEmployee/>
                </div>

            </div>

            {isDialogOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Add Assignment</h2>
                        <div className="h-2"/>
                        <form onSubmit={handleAssignmentSubmit}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Assignment name
                                </label>
                                <input
                                    value={assignmentName}
                                    onChange={(e) => setAssignmentName(e.target.value)}
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter assignment name"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Location
                                </label>
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter location name"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Starts at
                                </label>
                                <div
                                    className="relative w-[350px]">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className=" p-2 bg-white border border-gray-300 rounded-md w-[220px]"
                                        placeholderText="Select start date and time"
                                        popperClassName="z-50"
                                        popperPlacement="bottom-start"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Ends at
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(data) => setEndDate(data)}
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white border border-gray-300  w-[220px]"
                                        placeholderText="Select start date and time"
                                        popperClassName="z-50"
                                        popperPlacement="bottom"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Employee to be assigned
                                </label>
                                <input
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search employee by username"
                                    className="w-full p-2 border mb-2 rounded"
                                />
                                {/* Search Results Dropdown */}
                                {employeeResults.length > 0 && (
                                    <ul className="absolute w-full bg-white border rounded shadow-lg z-10">
                                        {employeeResults.map((emp) => (
                                            <li
                                                key={emp.userId}
                                                onClick={() => handleSelectEmployee(emp)}
                                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                            >
                                                {emp.username} ({emp.firstName})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Selected Employees */}
                            <div className="mb-4">
                                {selectedEmployees.map(emp => (
                                    <span key={emp.userId} className="bg-gray-200 p-1 rounded m-1 inline-block">
                                        {emp.username}
                                        <button onClick={() => handleRemoveEmployee(emp.userId)}
                                                className="ml-2 text-red-500" type="button">
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    id="description"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter assignment description"
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

        </>
    )
}