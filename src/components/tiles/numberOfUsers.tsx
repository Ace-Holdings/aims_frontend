import { useState, useEffect } from "react";


export default function TotalUsers() {
    const [userscount, setUsersCount] = useState(0);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3002/users', {
                    method: 'GET',
                    headers: {
                        "authorization": "Bearer " + token
                    }
                });
                const data = await response.json();
                setUsersCount(data.length);
            } catch(e) {
                console.error(e);
            }
        }
        fetchUsers();
    }, []);




    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <p className="text-6xl font-extrabold text-blue-500 mt-10">{userscount}</p>
            <div className="h-3"/>
            <h2 className="text-2xl font-bold text-gray-700 ">Number of users</h2>
        </div>
    )
}