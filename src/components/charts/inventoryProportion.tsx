"use client"

import dynamic from "next/dynamic"
import {useState} from "react";

export default function InventoryProportion() {
    const [orgSeries, setOrgSeries] = useState([10, 20]);

    const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

    const chartOptions = {
        labels: ["Shop", "Warehouse"],
        colors: ["#008000", "#FF0000"]
    };

    return (
        <div>
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center w-96  h-64 font-custom">

                <ApexChart
                    options={chartOptions}
                    series={orgSeries}
                    type="pie"
                    width="100%"
                    className="mb-1"
                />
                <div className="font-bold">Inventory proportion</div>
            </div>
        </div>
    )
}