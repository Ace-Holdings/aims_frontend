"use client"

import { useState, useEffect} from "react";

export default function TotalAssignments() {
    const [assignmentsCount, setAssignmentsCount] = useState(0);

    useEffect(() => {
       try {
          const fetchAssignments = async () => {
              const response: any = await fetch('http://localhost:3002/assignments', {
                  method: 'GET',
              });

              if (response.ok) {
                  const data = await response.json();
                  setAssignmentsCount(data.length);
              } else {
                  console.error('Error fetching Assignments');
              }
          }

          fetchAssignments();
       } catch (e) {
           console.error(e);
       }
    }, []);



    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <p className="text-6xl font-extrabold text-blue-500 mt-10">{assignmentsCount}</p>
            <div className="h-3"/>
            <h2 className="text-2xl font-bold text-gray-700 ">Total Assignments</h2>
        </div>
    )
}