import BidTile from "./bidTile"

const activeBids = [
    { id: 1, title: "Bid 1", amount: "K50,000", status: "Active" },
    { id: 2, title: "Bid 2", amount: "K75,000", status: "Active" },
    { id: 2, title: "Bid 2", amount: "K75,000", status: "Active" },
    { id: 2, title: "Bid 2", amount: "K75,000", status: "Active" },
];

export default function ActiveBids() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBids.map((bid) => (
                <BidTile key={bid.id} bid={bid} />
            ))}
        </div>
    );
}