export default function BidTile({ bid }: { bid: { id: number, description: string, deadline: Date, status: string } }) {
    return (
        <div className={`p-4 rounded-lg shadow-md border border-gray-200 font-custom
            ${bid.status === "Active" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}>

            <h3 className="text-lg font-semibold">{bid.description}</h3>
            <p className="text-sm">Deadline: {bid.deadline}</p>
            <p className="font-bold">{bid.status}</p>
        </div>
    );
}