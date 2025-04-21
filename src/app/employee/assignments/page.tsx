"use client"

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {jwtDecode} from "jwt-decode";
import Navbar from "@/components/layout/navbar";
import TotalAssignments from "@/components/tiles/totalAssignments";
import ActiveAssignments from "@/components/tiles/activeAssignments";
import EmployeeSidebar from "@/components/layout/employeeSidebar";
import AssignmentsTableEmployee from "@/components/tables/assignmentsTableEmployee";

export default function EmployeeAssignments() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const router = useRouter();

    const [hasActiveAssignment, setHasActiveAssignment] = useState(false);

    const [objectives, setObjectives] = useState([]);
    const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);

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


    const closeDialog = () => {
        setIsDialogOpen(false);
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

    const handleSaveObjectives = async () => {

        try {
            for (const obj of objectives) {
                const isCompleted = completedObjectives.includes(obj.objectiveId);
                const body = {
                    isComplete: isCompleted,
                }

                await fetch(`http://localhost:3002/objectives/${obj.objectiveId}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });
            }

            setIsDialogOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error updating objectives:", error);
        }
    };

    const openDialog = async () => {
        try {
            const response = await fetch(`http://localhost:3002/objectives/assignment/${hasActiveAssignment.assignmentId}`);

            console.log(hasActiveAssignment.assignmentId);

            if (!response.ok) throw new Error("Failed to fetch objectives");

            const data = await response.json();
            const completed = data
                .filter((obj: any) => obj.isComplete === true)
                .map((obj: any) => obj.objectiveId);
            setObjectives(data);
            setCompletedObjectives(completed);
            setIsDialogOpen(true);
        } catch (error) {
            console.error("Error fetching objectives:", error);
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
                        <button onClick={openDialog} className="flex items-center text-left justify-between bg-green-500 text-white p-4 rounded-lg shadow-md w-fit mt-4 ml-6 hover:bg-green-600 transition">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center  text-black bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4 text-center">Active Assignment Details</h2>

                        <div className="mb-6">
                            <p><strong>Name:</strong> {hasActiveAssignment.assignmentName}</p>
                            <p><strong>Location:</strong> {hasActiveAssignment.location}</p>
                            <p><strong>Description:</strong> {hasActiveAssignment.description}</p>
                            <p><strong>Start:</strong> {new Date(hasActiveAssignment.startsAt).toLocaleString()}</p>
                            <p><strong>End:</strong> {new Date(hasActiveAssignment.endsAt).toLocaleString()}</p>
                        </div>

                        <h3 className="text-lg font-medium mb-2">Objectives</h3>
                        <ul className="space-y-2">
                            {objectives.map((objective) => {
                                const isChecked = completedObjectives.includes(objective.objectiveId);

                                return (
                                    <li
                                        key={objective.objectiveId}
                                        className="flex items-center justify-between bg-gray-100 p-3 rounded-md"
                                    >
                                        <span className="text-gray-800">{objective.objectiveText}</span>

                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="peer hidden"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const updated = isChecked
                                                        ? completedObjectives.filter(id => id !== objective.objectiveId)
                                                        : [...completedObjectives, objective.objectiveId];
                                                    setCompletedObjectives(updated);
                                                }}
                                            />
                                            <div className="w-6 h-6 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:border-green-500 peer-checked:bg-green-500 transition-colors duration-200">
                                                {isChecked && (
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-6 flex justify-end">
                            <button onClick={closeDialog} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
                            <div className="w-5"/>
                            <button onClick={handleSaveObjectives}  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}