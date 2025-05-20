"use client"

import BidTile from "./bidTile";
import {useEffect, useState} from "react";

interface Bid {
    bidId: any;
    description: string;
    deadline: Date;
    status: boolean;
}

export default function PreviousBids() {
    const [previousBids, setPreviousBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchBids = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://aims-api-latest.onrender.com/bids', {
                    method: 'GET',
                    headers: {
                        "authorization": `Bearer ` + token,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const filteredData = data.filter((bid: any) => bid.status === false);
                    setPreviousBids(filteredData);
                } else {
                    console.log('could not fetch for bids');
                }
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        }
        fetchBids();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-custom mb-5">
            {loading ? (
                <div className="w-full h-48 flex justify-center items-center">
                    <div className="w-20 h-20 border-8 border-t-8 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                previousBids.map((bid: any) => (
                    <BidTile
                        key={bid.bidId}
                        bid={{
                            id: bid.bidId,
                            description: bid.description,
                            deadline: bid.deadline,
                            status: bid.status,
                        }}
                    />
                ))
            )}
        </div>
    );
}