import { format } from "date-fns";

const SalesTile = ({ id, title, date, amount, quantity, customer, issuer }) => {
    const formattedDate = format(new Date(date), "dd/MM/yyyy"); // Consistent date format

    return (
        <div className="bg-white shadow-md p-4 rounded-lg mt-4 font-custom">
            <h2 className="text-lg text-black flex">ID:
                <div className="w-28"/>
                {id}</h2>
            <h2 className="text-lg text-black flex">Item:
                <div className="w-20"/>
                {title}</h2>
            <h2 className="text-lg text-black flex">Customer:
                <div className="w-10"/>
                {customer}</h2>
            <h2 className="text-lg text-black flex">Quantity:
                <div className="w-14"/>
                {quantity}</h2>
            <h2 className="text-lg text-black flex">Issuer:
                <div className="w-16"/>
                {issuer}</h2>
            <p className="text-gray-500 flex">
                <div className="text-black">Date:</div>
                <div className="w-20"/>
                {formattedDate}</p>
            <br/>
            <p className="text-green-600 font-bold">
                {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(amount)}
            </p>
        </div>
    );
};

export default SalesTile;