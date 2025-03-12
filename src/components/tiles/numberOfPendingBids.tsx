import {useEffect, useState} from "react";

export default function NumberOfBids() {
    const [numberOfActiveBids, setNumberOfActiveBids] = useState(0);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch('http://localhost:3002/bids', {
                    headers: {
                        "authorization": "Bearer " + localStorage.getItem("token"),
                    }
                });
                if (!response.ok) {
                    console.error('Bid not found.');
                    return;
                }

                const data = await response.json();
                const filteredData = data.filter((bid: any) => bid.status === true)
                setNumberOfActiveBids(filteredData.length);
            } catch (e) {
                console.error(e);
            }

        }

        fetchBids();
    }, [])

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <div className="flex-row">
                <p className="text-6xl font-extrabold text-blue-500 mt-10">
                    {numberOfActiveBids}
                </p>
                <div className="h-3"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 ">Number of pending bids</h2>
        </div>
    )
}