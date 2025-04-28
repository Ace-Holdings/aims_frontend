export default function LoanTile() {
    const warehouseInventoryValue = 30000;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <p className="text-red-600 font-bold text-xl">
                {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(warehouseInventoryValue)}
            </p>
            <div className="h-3"/>
            <h2 className="text-xl font-bold text-gray-700 ">Debt accumulated</h2>
        </div>
    )
}