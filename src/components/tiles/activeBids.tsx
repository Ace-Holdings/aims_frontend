"use client"

import BidTile from "./bidTile"
import { useEffect, useState } from "react";

interface Bid {
    bidId: any;
    description: string;
    deadline: Date;
    status: boolean;
}

export default function ActiveBids() {
    const [activeBids, setActiveBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchBids = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3002/bids', {
                    method: 'GET',
                    headers: {
                        "authorization": `Bearer ` + token,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const filteredData = data.filter((bid: any) => bid.status === true);
                    setActiveBids(filteredData);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, []);

    return (
        <div className="w-full font-custom">
            {loading ? (
                <div className="w-full h-48 flex justify-center items-center">
                    <div className="w-20 h-20 border-8 border-t-8 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : activeBids.length === 0 ? (
                <div className="text-center text-gray-500 text-lg mt-10">
                    No active bids found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeBids.map((bid) => (
                        <BidTile
                            key={bid.bidId}
                            bid={{
                                id: bid.bidId,
                                description: bid.description,
                                deadline: bid.deadline,
                                status: bid.status,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}