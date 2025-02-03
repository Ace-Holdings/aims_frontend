import {useState, useEffect} from "react";

export default function InventoryShop() {
    const [shopInventoryValue, setShopInventoryValue] = useState(0);


    useEffect(() => {
        // Fetch inventory data
        fetch('http://localhost:3002/inventory', {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {

                const shopInventory = data.filter((item: any) => item.location === "shop");


                const totalValue = shopInventory.reduce((sum: number, item: any) => {
                    return sum + item.quantity * item.pricePerUnit;
                }, 0);

                setShopInventoryValue(totalValue);
            })
            .catch((error) => {
                console.error("Error fetching inventory:", error);
            });
    }, []);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <p className="text-green-600 font-bold text-xl">
                {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(shopInventoryValue)}
            </p>
            <div className="h-3"/>
            <h2 className="text-xl font-bold text-gray-700 ">Value of inventory in office</h2>
        </div>
    )
}