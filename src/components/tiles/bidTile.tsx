export default function BidTile({ bid }: { bid: { id: number, title: string, amount: string, status: string } }) {
    return (
        <div className={`p-4 rounded-lg shadow-md border border-gray-200 
            ${bid.status === "Active" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}>

            <h3 className="text-lg font-semibold">{bid.title}</h3>
            <p className="text-sm">Amount: {bid.amount}</p>
            <p className="font-bold">{bid.status}</p>
        </div>
    );
}