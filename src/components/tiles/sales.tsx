export default function SalesTile({ title, date, amount}) {

    return (
        <div className="bg-white shadow-lg rounded-md p-4 hover:shadow-xl transition-shadow duration-200 mb-4">
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            <p className="text-gray-500">{new Date(date).toLocaleDateString()}</p>
            <p className="text-gray-800 font-bold">${amount.toFixed(2)}</p>
        </div>
    );
}