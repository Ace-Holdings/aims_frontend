"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

export default function InventoryProportion() {
    const [orgSeries, setOrgSeries] = useState([0, 0]);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch('https://aims-api-latest.onrender.com/inventory', {
                    method: "GET",
                    headers: {
                        "authorization": 'Bearer ' + token,
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const total = data.reduce((sum: any, item: any) => sum + item.quantity, 0);
                    const warehouseStock = data.filter((item: any) => item.location === "warehouse");
                    const shopStock = data.filter((item: any) => item.location === "shop");
                    const warehouseTotal = warehouseStock.reduce((sum: any, item: any) => sum + item.quantity, 0);
                    const shopTotal = shopStock.reduce((sum: any, item: any) => sum + item.quantity, 0);
                    const warehousePortion = warehouseTotal/total * 100;
                    const shopPortion = shopTotal/total * 100;
                    setOrgSeries([shopPortion, warehousePortion]);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchInventory();
    }, []);

    const chartOptions = {
        labels: ["Shop", "Warehouse"],
        colors: ["#008000", "#FF0000"],
    };

    return (
        <div
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center items-center w-[400px] h-64 font-custom">
            <h2 className="font-bold text-left">Inventory proportion by location</h2>
            <br/>
            <ApexChart
                options={chartOptions}
                series={orgSeries}
                type="pie"
                width={300}
                height={300}
                className="mb-2"
            />
        </div>
    );
}