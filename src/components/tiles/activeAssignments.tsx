"use client";

import { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Label,
} from "recharts";

export default function ActiveAssignments() {
    const [activeCount, setActiveCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await fetch("http://localhost:3002/assignments", {
                    method: "GET",
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const active = data.filter((assignment: any) => assignment.status === true);
                    setActiveCount(active.length);
                    setTotalCount(data.length);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchAssignments();
    }, []);

    const percentage = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

    const data = [
        { name: "Active", value: percentage },
        { name: "Inactive", value: 100 - percentage },
    ];

    const COLORS = ["#3B82F6", "#E5E7EB"];

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/3 h-64 flex flex-col items-center justify-center font-custom">
            <h2 className="text-lg font-bold text-gray-700 mb-2">Active Assignments</h2>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        startAngle={180}
                        endAngle={0}
                        data={data}
                        cx="50%"
                        cy="100%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <Label
                            value={`${activeCount}/${totalCount}`}
                            position="centerBottom"
                            className="text-xl font-bold fill-blue-600"
                            offset={-10}
                        />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}