"use client"

import {useState, useEffect} from "react";

export default function ActiveAssignments() {
    const [activeAssignmentsCount, setActiveAssignmentsCount] = useState(0);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchActiveAssignments = async () => {
            try {
                const response = await fetch('https://aims-api-latest.onrender.com/assignments', {
                    method: 'GET',
                    headers: {
                        "authorization": `Bearer ` + token,
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    const assignments = data.filter((assignment: any) => assignment.status == true);
                    setActiveAssignmentsCount(assignments.length);
                }
            } catch(e) {
                console.error(e);
            }
        }

        fetchActiveAssignments();
    }, []);


    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <p className="text-6xl font-extrabold text-blue-500 mt-10">{activeAssignmentsCount}</p>
            <div className="h-3"/>
            <h2 className="text-2xl font-bold text-gray-700 ">Active Assignments</h2>
        </div>
    )
}