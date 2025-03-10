"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function SalesBarChart() {
    const [chartData, setChartData] = useState({
        series: [{ name: "Sales Amount", data: new Array(12).fill(0) }], // Initialize with 12 months
        options: {
            chart: {
                type: "bar",
                height: 250,
            },
            xaxis: {
                categories: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ],
                title: { text: "Month" },
            },
            yaxis: {
                title: { text: "Amount (MWK)" },
            },
            colors: ["#3498db"],
            plotOptions: {
                bar: { horizontal: false, columnWidth: "40%" },
            },
            dataLabels: { enabled: false },
        },
    });

    // Fetch sales data from the API
    useEffect(() => {
        async function fetchSales() {
            try {
                const response = await fetch("http://localhost:3002/sales", {
                    headers: {
                        "authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                if (!response.ok) throw new Error("Failed to fetch data");

                const data = await response.json();

                // Process data: sum amounts by month
                const monthlySales = new Array(12).fill(0);

                data.forEach((sale: any) => {
                    const date = new Date(sale.timestamp); // Convert timestamp to Date
                    const monthIndex = date.getMonth();
                    monthlySales[monthIndex] += sale.amount;
                });

                // Update chart data
                setChartData((prevData) => ({
                    ...prevData,
                    series: [{ name: "Sales Amount", data: monthlySales }],
                }));
            } catch (error) {
                console.error("Error fetching sales data:", error);
            }
        }

        fetchSales();
    }, []);

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center w-2/5 h-72 font-custom">
            <h2 className="font-semibold text-center mb-2 text-sm">Monthly Sales</h2>
            <ApexChart
                options={chartData.options}
                series={chartData.series}
                type="bar"
                height={200}
            />
        </div>
    );
}