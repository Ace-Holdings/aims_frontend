import BidTile from "./bidTile"
import {useEffect, useState} from "react";


export default function ActiveBids() {
    const [activeBids, setActiveBids] = useState([]);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch('http://localhost:3002/bids', {
                    method: 'GET',
                });
                if (response.ok) {
                    const data = await response.json();
                    const filteredData = data.filter((bid: any) => bid.status === "Active");
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
                <BidTile key={bid.id} bid={bid} />
            ))}
        </div>
    );
}