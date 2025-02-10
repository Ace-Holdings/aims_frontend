import { format } from "date-fns";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

const SalesTile = ({ id, title, date, amount, quantity, customer, issuer }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy");

    return (
        <div className="relative bg-white shadow-md p-6 rounded-lg mt-4 w-80 font-custom text-center flex flex-col ">
            <div className="absolute top-3 right-3 flex flex-col space-y-2">
                <button
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    title="View Details"
                >
                    <FiEye className="w-5 h-5"/>
                </button>
                <div className="h-1"/>
                <button
                    className="text-green-600 hover:text-green-800 transition-colors duration-200"
                    title="Edit"
                >
                    <FiEdit className="w-5 h-5"/>
                </button>
                <div className="h-1"/>
                <button
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    title="Delete"
                >
                    <FiTrash2 className="w-5 h-5"/>
                </button>
            </div>

            <h2 className="text-lg text-gray-500 text-left">ID: <span className="font-semibold text-black">{id}</span>
            </h2>
            <h2 className="text-lg text-gray-500 text-left">Item: <span
                className="font-semibold text-black">{title}</span></h2>
            <h2 className="text-lg text-gray-500 text-left">Customer: <span
                className="font-semibold text-black">{customer}</span></h2>
            <h2 className="text-lg text-gray-500 text-left">Quantity: <span
                className="font-semibold text-black">{quantity}</span></h2>
            <h2 className="text-lg text-gray-500 text-left">Issuer: <span
                className="font-semibold text-black">{issuer}</span></h2>
            <p className="text-gray-500 text-left">Date: <span className="text-black">{formattedDate}</span></p>
            <hr className="border-dotted border-gray-400 w-full my-3"/>
            <p className="text-green-600 font-bold text-lg text-left">
                {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(amount)}
            </p>
        </div>
    );
};

export default SalesTile;