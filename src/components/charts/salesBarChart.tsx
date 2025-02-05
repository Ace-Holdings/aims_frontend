import React, { useState } from "react";
import Chart from "react-apexcharts";

export default function SalesBarChart() {
    const [chartData, setChartData] = useState({
        series: [
            {
                name: "Sales Amount",
                data: [1200, 1500, 1800, 2500, 3000, 3500, 4000, 3200, 2800, 5000, 4500, 5200], // Sample sales data
            },
        ],
        options: {
            chart: {
                type: "bar",
                height: 250, // Reduced height to fit better
            },
            xaxis: {
                categories: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ],
                title: {
                    text: "Month",
                },
            },
            yaxis: {
                title: {
                    text: "Amount ($)",
                },
            },
            colors: ["#3498db"], // Customize bar color
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "40%", // Slightly narrower bars
                },
            },
            dataLabels: {
                enabled: false,
            },
        },
    });

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center w-2/5 h-72 font-custom">
            <h2 className="font-semibold text-center mb-2 text-sm">Monthly Sales</h2>
            <Chart
                options={chartData.options}
                series={chartData.series}
                type="bar"
                height={200} // Adjusted height to fit the container
            />
        </div>
    );
}