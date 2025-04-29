import {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";

export default function LoanTile() {
    const [accumulatedDebt, setAccumulatedDebts] = useState(0);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchLoans = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { user } = jwtDecode(token);

            try {
                const response = await fetch(`http://localhost:3002/loans`);
                if (response.ok) {
                    const data = await response.json();

                    const totalDebt = data
                        .filter(loan =>
                            loan.applicant?.username === user &&
                            loan.status === "approved"
                        )
                        .reduce((sum, loan) => sum + loan.amount, 0);

                    console.log("Total Approved Debt:", totalDebt);
                    setAccumulatedDebts(totalDebt);
                }
            } catch (e) {
                console.log(e);
            }
        };

        fetchLoans();
    }, []);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center  w-1/3 h-64 font-custom">
            <p className="text-red-600 font-bold text-xl">
                {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'MWK'}).format(accumulatedDebt)}
            </p>
            <div className="h-3"/>
            <h2 className="text-xl font-bold text-gray-700 ">Debt accumulated</h2>
        </div>
    )
}