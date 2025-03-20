import {useEffect, useState} from "react";
import BidTileEmployee from "@/components/tiles/bidTileEmployee";

export default function PreviousBidsEmployee() {
    const [previousBids, setPreviousBids] = useState([]);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch('http://localhost:3002/bids', {
                    method: 'GET',
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const filteredData = data.filter((bid: any) => bid.status === false);
                    setPreviousBids(filteredData);
                } else {
                    console.log('could not fetch for bids');
                }
            } catch(e) {
                console.log(e);
            }
        }
        fetchBids();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-custom">
            {previousBids.map((bid) => (
                <BidTileEmployee key={bid.id} bid={bid} />
            ))}
        </div>
    );
}