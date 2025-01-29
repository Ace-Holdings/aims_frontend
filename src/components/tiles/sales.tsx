import { format } from "date-fns";

const SalesTile = ({ title, date, amount }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy"); // Consistent date format

    return (
        <div className="bg-white shadow-md p-4 rounded-lg mt-4">
            <h2 className="text-lg text-black font-semibold">{title}</h2>
            <p className="text-gray-500">{formattedDate}</p>
            <p className="text-green-600 font-bold">${amount}</p>
        </div>
    );
};

export default SalesTile;