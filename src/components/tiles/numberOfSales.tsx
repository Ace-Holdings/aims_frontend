import {useState, useEffect} from "react"

export default function NumberOfSales() {
    const [salesCount, setSalesCount] = useState(0);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
       const fetchUsers = async () => {
           try {
               const response: any = await fetch('https://aims-api-latest.onrender.com/sales', {
                   method: 'GET',
                   headers: {
                       "authorization": `Bearer ` + token,
                   }
               });
               const data = await response.json();
               setSalesCount(data.length);
           } catch(e) {
               console.error(e);
           }
       }

       fetchUsers();
    }, []);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <div className="flex-row">
                <p className="text-4xl font-extrabold text-blue-500 mt-10">
                    {salesCount}
                </p>
                <div className="h-3"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 ">Sales generated</h2>
        </div>
    )
}