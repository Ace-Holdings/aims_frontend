import BidTile from "./bidTile";
import {useEffect, useState} from "react";



export default function PreviousBids() {
    const [previousBids, setPreviousBids] = useState([]);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch('http://localhost:3002/bids', {
                    method: 'GET',
                });
                if (response.ok) {
                    const data = await response.json();
                    const filteredData = data.filter((bid: any) => bid.status === 'Inactive');
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
                <BidTile key={bid.id} bid={bid} />
            ))}
        </div>
    );
}