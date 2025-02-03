import BidTile from "./bidTile";

const previousBids = [
    { id: 3, title: "Bid 3", amount: "K40,000", status: "Closed" },
    { id: 4, title: "Bid 4", amount: "K60,000", status: "Closed" },
];

export default function PreviousBids() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previousBids.map((bid) => (
                <BidTile key={bid.id} bid={bid} />
            ))}
        </div>
    );
}