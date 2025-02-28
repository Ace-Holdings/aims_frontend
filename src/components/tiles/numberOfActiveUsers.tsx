import {useEffect, useState} from "react";

export default function TotalActiveUsers() {
    const [activeUsersCount, setActiveUsersCount] = useState(0);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            const response = await fetch("http://localhost:3002/assignments");
            if (!response.ok) throw new Error("Failed to fetch assignments");

            const assignments = await response.json();

            const uniqueUsernames = new Set(
                assignments.flatMap((assignment: any) => assignment.users.map((user: any) => user.username))
            );

            setActiveUsersCount(uniqueUsernames.size);

        };

        fetchActiveUsers();

        const interval = setInterval(fetchActiveUsers, 120000);

        return () => clearInterval(interval);
    }, [])

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <p className="text-6xl font-extrabold text-blue-500 mt-10">{activeUsersCount}</p>
            <div className="h-3"/>
            <h2 className="text-2xl font-bold text-gray-700 ">Number of active employees</h2>
        </div>
    )
}