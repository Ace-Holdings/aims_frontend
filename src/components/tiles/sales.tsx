import { format } from "date-fns";

const SalesTile = ({ id, title, date, amount, quantity, customer, issuer }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy"); // Consistent date format

    return (
        <div className="bg-white shadow-md p-6 rounded-lg mt-4 w-80 font-custom text-center flex flex-col ">
            <h2 className="text-lg text-gray-500 text-left">ID: <span className="font-semibold text-black">{id}</span></h2>
            <h2 className="text-lg text-gray-500 text-left">Item: <span className="font-semibold text-black">{title}</span></h2>
            <h2 className="text-lg text-gray-500 text-left">Customer: <span className="font-semibold text-black">{customer}</span></h2>
            <h2 className="text-lg text-gray-500 text-left">Quantity: <span className="font-semibold text-black">{quantity}</span></h2>
            <h2 className="text-lg text-gray-500 text-left">Issuer: <span className="font-semibold text-black">{issuer}</span></h2>
            <p className="text-gray-500 text-left">Date: <span className="text-black">{formattedDate}</span></p>
            <hr className="border-dotted border-gray-400 w-full my-3"/>
            <p className="text-green-600 font-bold text-lg text-left">
                {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(amount)}
            </p>
        </div>
    );
};

export default SalesTile;