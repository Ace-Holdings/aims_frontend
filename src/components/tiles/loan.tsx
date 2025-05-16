import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    user: {
        id: string;
        username: string;
        roles: string[];
    };
    exp?: number;
    iat?: number;
}

interface Loan {
    loanId: number;
    amount: number;
    status: string;
    applicant?: {
        username: string;
    };
}

export default function LoanTile() {
    const [accumulatedDebt, setAccumulatedDebts] = useState(0);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchLoans = async () => {
            if (!token) return;

            const decoded = jwtDecode<DecodedToken>(token);
            const username = decoded.user.username;

            try {
                const response = await fetch(`http://localhost:3002/loans`);
                if (response.ok) {
                    const data: Loan[] = await response.json();

                    const totalDebt = data
                        .filter((loan) => loan.applicant?.username === username && loan.status === "approved")
                        .reduce((sum, loan) => sum + loan.amount, 0);

                    setAccumulatedDebts(totalDebt);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchLoans();
    }, []);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center w-1/3 h-64 font-custom">
            <p className="text-red-600 font-bold text-xl">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "MWK" }).format(accumulatedDebt)}
            </p>
            <div className="h-3" />
            <h2 className="text-xl font-bold text-gray-700">Debt accumulated</h2>
        </div>
    );
}