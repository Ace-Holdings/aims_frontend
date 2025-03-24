import {useEffect, useState} from "react";
import BidTileEmployee from "@/components/tiles/bidTileEmployee";
import BidTile from "@/components/tiles/bidTile";

export default function PreviousBidsEmployee() {
    const [previousBids, setPreviousBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBids = async () => {
            setLoading(true);  // Set loading to true before fetching
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
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);  // Set loading to false once data is fetched
            }
        }
        fetchBids();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-custom">
            {loading ? (
                <div className="w-full h-48 flex justify-center items-center">
                    {/* Tailwind CSS Spinner with longer blue line and transparent outline */}
                    <div className="w-20 h-20 border-8 border-t-8 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                previousBids.map((bid) => (
                    <BidTileEmployee key={bid.id} bid={bid} />
                ))
            )}
        </div>
    );
}