"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Sale {
    amount: number;
    timestamp: string;
}

export default function SalesBarChart() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const [chartData, setChartData] = useState<{
        series: { name: string; data: number[] }[];
        options: ApexOptions;
    }>({
        series: [{ name: "Sales Amount", data: new Array(12).fill(0) }],
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
                labels: {
                    formatter: (val: number) =>
                        new Intl.NumberFormat("en-MW", {
                            style: "currency",
                            currency: "MWK",
                            minimumFractionDigits: 0,
                        }).format(val),
                },
            },
            tooltip: {
                y: {
                    formatter: (val: number) =>
                        new Intl.NumberFormat("en-MW", {
                            style: "currency",
                            currency: "MWK",
                            minimumFractionDigits: 0,
                        }).format(val),
                },
            },
            colors: ["#3498db"],
            plotOptions: {
                bar: { horizontal: false, columnWidth: "40%" },
            },
            dataLabels: { enabled: false },
        },
    });

    useEffect(() => {
        async function fetchSales() {
            try {
                const response = await fetch("https://aims-api-latest.onrender.com/sales", {
                    headers: {
                        authorization: `Bearer ` + token,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch data");

                const data: Sale[] = await response.json();
                const monthlySales = new Array(12).fill(0);

                data.forEach((sale) => {
                    const date = new Date(sale.timestamp);
                    const monthIndex = date.getMonth();
                    monthlySales[monthIndex] += sale.amount;
                });

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