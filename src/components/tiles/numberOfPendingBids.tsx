"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function NumberOfBids() {
    const [numberOfActiveBids, setNumberOfActiveBids] = useState(0);
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch("http://localhost:3002/bids", {
                    headers: {
                        authorization: "Bearer " + localStorage.getItem("token"),
                    },
                });

                if (!response.ok) return;

                const data = await response.json();
                const filteredData = data.filter((bid: any) => bid.status === true);
                setNumberOfActiveBids(filteredData.length);
            } catch (e) {
                console.error(e);
            }
        };

        fetchBids();
    }, []);

    useEffect(() => {
        const controls = animate(animatedValue, numberOfActiveBids, {
            duration: 1.2,
            onUpdate(value) {
                setAnimatedValue(Math.floor(value));
            },
        });

        return () => controls.stop();
    }, [numberOfActiveBids]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center w-1/3 h-64 font-custom">
            <div className="flex items-center justify-center mt-8 mb-4">
                <BarChart3 className="w-10 h-10 text-blue-500 mr-4" />
                <motion.p className="text-6xl font-extrabold text-blue-500">
                    {animatedValue}
                </motion.p>
            </div>
            <h2 className="text-2xl text-center font-bold text-gray-700">
                Number of Pending Bids
            </h2>
        </div>
    );
}