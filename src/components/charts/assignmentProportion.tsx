"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { ClipboardCheck } from "lucide-react"; // or any other fitting icon

export default function ActiveAssignmentsProportion() {
    const [activeCount, setActiveCount] = useState(0);
    const [animatedValue, setAnimatedValue] = useState(0);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await fetch("http://localhost:3002/assignments", {
                    method: "GET",
                    headers: {
                        authorization: `Bearer ` + token,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const active = data.filter((assignment: any) => assignment.status === true);
                    setActiveCount(active.length);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchAssignments();
    }, []);

    useEffect(() => {
        const controls = animate(animatedValue, activeCount, {
            duration: 1.2,
            onUpdate(value) {
                setAnimatedValue(Math.floor(value));
            },
        });

        return () => controls.stop();
    }, [activeCount]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center w-1/3 h-64 font-custom">
            <div className="flex items-center justify-center mt-8 mb-4">
                <ClipboardCheck className="w-10 h-10 text-green-500 mr-4" />
                <motion.p className="text-6xl font-extrabold text-green-500">
                    {animatedValue}
                </motion.p>
            </div>
            <h2 className="text-2xl text-center font-bold text-gray-700">
                Active Assignments
            </h2>
        </div>
    );
}