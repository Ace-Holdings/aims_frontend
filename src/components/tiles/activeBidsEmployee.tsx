import {useEffect, useState} from "react";
import BidTileEmployee from "@/components/tiles/bidTileEmployee";

export default function ActiveBidsEmployee() {
    const [activeBids, setActiveBids] = useState([]);

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
                    console.log(data);
                    const filteredData = data.filter((bid: any) => bid.status === true);
                    setActiveBids(filteredData);
                }
            } catch(e) {
                console.error(e);
            }
        }
        fetchBids();
    }, [])

    console.log(activeBids);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-custom">
            {activeBids.map((bid) => (
                console.log('activeBid', bid),
                    <BidTileEmployee key={bid.bidId} bid={bid} />
            ))}
        </div>
    );
}