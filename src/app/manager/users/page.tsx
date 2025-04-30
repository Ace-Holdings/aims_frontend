"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import TotalUsers from "@/components/tiles/numberOfUsers";
import TotalActiveUsers from "@/components/tiles/numberOfActiveUsers";
import UsersTable from "@/components/tables/usersTable";
import ManagerSidebar from "@/components/layout/managerSidebar";
import {useEffect, useState} from "react";
import "react-datepicker/dist/react-datepicker.css";
import {jwtDecode} from "jwt-decode";
import {useRouter} from "next/navigation";

export default function UsersManager() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSalariesDialogOpen, setIsSalariesDialogOpen] = useState(false);
    const [isLoansDialogOpen, setIsLoansDialogOpen] = useState(false);
    const [isDirectGrantDialogOpen, setIsDirectGrantDialogOpen] = useState(false);

    // states for forms
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [roleId, setRoleId] = useState("");
    const [salaryId, setSalaryId] = useState("");
    const router = useRouter();

    // states for updating salary
    const [salaryClass, setSalaryClass] = useState("A");
    const [amount, setAmount] = useState(0);
    const [salaries, setSalaries] = useState([]);
    const [activeTab, setActiveTab] = useState("manage");

    const [loanRequests, setLoansRequests] = useState([]);

    const [grantedRequests, setGrantedRequests] = useState<Set<number>>(new Set());

    const [searchTerm, setSearchTerm] = useState('');
    const [applicantResults, setApplicantResults] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    // for direct grant
    const [loanAmount, setLoanAmount] = useState(0);
    const [purpose, setPurpose] = useState("");

    const [isSuccessVisible, setIsSuccessVisible] = useState(false);

    const [newLoan, setNewLoan] = useState({
        userId: '',
        amount: '',
        interestRate: '',
        termMonths: '',
    });


    useEffect(() => {
        const fetchLoanRequests = async () => {
            try {
                const response = await fetch('http://localhost:3002/loanRequests');
                if (response.ok) {
                    const data = await response.json();
                    setLoansRequests(data);

                    const approvedIds = data
                        .filter((request) => request.status === "approved")
                        .map((request) => request.requestId);

                    setGrantedRequests(new Set(approvedIds));
                }
            } catch (e) {
                console.log(e);
            }
        }
        fetchLoanRequests();
    }, []);



    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const openSalariesDialog = () => {
        setIsSalariesDialogOpen(true);
    }

    const openLoansDialog = () => {
        setIsLoansDialogOpen(true);
    }

    useEffect(() => {
        const storedState = localStorage.getItem("adminSidebarCollapsed");
        if (storedState !== null) {
            setIsSidebarCollapsed(storedState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("adminSidebarCollapsed", String(newState));
    };

    useEffect(() => {
        const fetchSalaries = async () => {
            try {
                const response = await fetch('http://localhost:3002/salaries', {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                const data = await response.json();
                setSalaries(data);
            } catch (e) {
                console.log(e);
            }
        }
        fetchSalaries();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token) {
            router.push("/");
        }

        try {
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles || [];

            if (!roles.includes("ROLE_MANAGER")) {
                router.push("/");
            }
        } catch (e) {
            console.error(e);
            router.push("/");
        }

    }, [router]);

    const handleUpdateSalaryClick = () => {
        const selectedSalary = salaries.find(salary => salary.class === salaryClass);
        console.log(selectedSalary)
        if (!selectedSalary) {
            alert("Please select a valid salary class.");
            return;
        }

        const salaryId = selectedSalary.salaryId;
        handleUpdateSalary(salaryId);
        window.location.reload();
    };

    const handleUpdateSalary = async (id: number) => {
        try {
            const updatedSalary = {
                ...(amount && {amount}),
                ...(salaryClass && {class: salaryClass })
            };

            const response = await fetch(`http://localhost:3002/salaries/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedSalary),
            })

            if (!response.ok) {
                console.log('an error occured');
            }
        } catch (e) {
            console.log(e);
        }
    }

    const handleGrantLoanApplication = async (request: any) => {
        const { requestId, applicantId, amountRequested, purpose } = request;

        try{
            const approveResponse = await fetch(`http://localhost:3002/loanRequests/${requestId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "approved" })
            });

            if (!approveResponse.ok) {
                console.log("Failed to approve loan request.");
                return;
            }

            const loanResponse = await fetch('http://localhost:3002/loans', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: applicantId,
                    amount: amountRequested,
                    purpose: purpose,
                    status: "approved"
                })
            });

            if (!loanResponse.ok) {
                console.log("Failed to create loan.");
                return;
            }

            setGrantedRequests(prev => new Set(prev).add(requestId));
        } catch (error) {
            console.error("Error processing loan:", error);
        }
    };

    const handleUserRegistration = async (e: any) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3002/users', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    firstName: firstname,
                    surname: lastname,
                    username: username,
                    password: password,
                    email: email,
                    idNumber: idNumber,
                    salaryId: parseInt(salaryId),
                    roleId: [parseInt(roleId)]
                })
            })

            if (response.ok) {
                closeDialog();
                window.location.reload();
            }
        } catch(e) {
            console.log(e);
        }
    }

    // handler for opening a dialog to create a loan to a user directly
    const handleOpenDirectGrandDialog = () => {
        setIsLoansDialogOpen(false);
        setIsDirectGrantDialogOpen(true);
    }

    // handler for cancelling the direct loan grant
    const handleCloseDirectGrandDialog = () => {
        setIsDirectGrantDialogOpen(false);
        setIsLoansDialogOpen(true);
    }

    const handleApplicantSearch = async (term: string) => {
        setSearchTerm(term);

        if (term.length < 2) {
            setApplicantResults([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3002/users/search?username=${term}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                }
            });
            if (response.ok) {
                const results = await response.json();
                setApplicantResults(results);
            } else {
                setApplicantResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setApplicantResults([]);
        }
    };

    const handleSelectApplicant = (user: User) => {
        setSelectedApplicant(user);
        setNewLoan((prev) => ({ ...prev, userId: user.userId }));
        setApplicantResults([]);
        setSearchTerm('');
    };

    const directApplicationGrant = async () => {
        const userId = selectedApplicant?.userId;

        try {
            const response = await fetch('http://localhost:3002/loans', {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    amount: loanAmount,
                    purpose: purpose,
                    status: "approved"
                }),
            });

            if (response.ok) {
                setIsSuccessVisible(true);
                setIsDirectGrantDialogOpen(false);

                setLoanAmount(0);
                setPurpose("");

                setTimeout(() => {
                    setIsSuccessVisible(false);
                }, 3000);
                window.location.reload();
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <div className={`h-screen flex bg-gray-100 ${(isDialogOpen || isSalariesDialogOpen || isLoansDialogOpen) ? "blur-sm" : ""} `}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <ManagerSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>
                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                    <div className="bg-white  p-4 sticky top-0 z-10">
                        <header className="flex gap-2 items-center text-gray-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0v.75H4.5v-.75Z"
                                />
                            </svg>
                            <span>Users</span>
                            <div className="ml-auto">
                                <Navbar/>
                            </div>

                        </header>
                    </div>
                    <div className="ml-6 mt-10 font-custom">
                        <div className="flex-row gap-4 flex">
                            <TotalUsers/>
                            <div className="w-10"/>
                            <TotalActiveUsers/>
                        </div>
                        <div className="h-7"/>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={openDialog}
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                                Add user
                            </button>
                            <div className='w-2'/>
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                                onClick={openLoansDialog}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4l8 16H4l8-16z"
                                    />
                                </svg>
                                Loans
                            </button>
                            <div className='w-2'/>
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                                onClick={openSalariesDialog}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 12h14"
                                    />
                                </svg>
                                Salaries
                            </button>
                        </div>
                    </div>
                    <div className="h-7"/>
                    <UsersTable/>
                </div>
            </div>

            {isDialogOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center text-bold">Add User</h2>
                        <div className="h-2"/>
                        <form onSubmit={handleUserRegistration}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    firstName
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter user firstname"
                                    onChange={(e):void => setFirstname(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    lastName
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter user lastname"
                                    onChange={(e)=>setLastname(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    username
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter username"
                                    onChange={(e)=>setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    password
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter password"
                                    onChange={(e)=>setPassword(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    defaultValue=""
                                    onChange={(e) => setRoleId(e.target.value)}
                                    value={roleId}
                                >
                                    <option value="" disabled>
                                        Select a role
                                    </option>
                                    <option value="2">Manager</option>
                                    <option value="3">Employee</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    email
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter user email"
                                    onChange={(e)=>setEmail(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                                    Salary
                                </label>
                                <select
                                    id="role"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    defaultValue=""
                                    onChange={(e) => setSalaryId(e.target.value)}
                                    value={salaryId}
                                >
                                    <option value="" disabled>
                                        Select a salary class
                                    </option>
                                    <option value="1">A</option>
                                    <option value="2">B</option>
                                    <option value="3">C</option>
                                    <option value="4">D</option>
                                    <option value="5">E</option>
                                    <option value="6">F</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    idNumber
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter location name"
                                    value={idNumber}
                                    onChange={(e)=>setIdNumber(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                    onClick={closeDialog}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isSalariesDialogOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-medium mb-4 text-center">Manage Salaries</h2>
                        <div className="mb-4">
                            {/* Dropdown to select salary class */}
                            <label className="block text-gray-700 font-medium mb-1">Select Class</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={salaryClass}
                                onChange={(e) => setSalaryClass(e.target.value)}
                            >
                                <option value="" disabled>Select a class</option>
                                {salaries.map((salary) => (
                                    <option key={salary.class} value={salary.class}>
                                        {salary.class} ({new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(salary.amount)})
                                    </option>
                                ))}
                            </select>

                            {/* Amount input field */}
                            <div className="mt-4">
                                <label className="block text-gray-700 font-medium mb-1">Amount</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}

                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="btn bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-lg mr-2"
                                onClick={() => setIsSalariesDialogOpen(false)}
                            >
                                Close
                            </button>
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg"
                                onClick={handleUpdateSalaryClick}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoansDialogOpen && (
                <div className="fixed inset-0 bg-black font-custom bg-opacity-50 flex justify-center items-center z-50">
                    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">

                        <button
                            onClick={() => setIsLoansDialogOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <div className="h-4"/>
                        <div className="flex border-b-2 mb-6">
                            <button
                                className={`flex-1 text-center pb-2 text-lg  ${
                                    activeTab === "manage" ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500"
                                }`}
                                onClick={() => setActiveTab("manage")}
                            >
                                Manage Loans
                            </button>
                            <button
                                className={`flex-1 text-center pb-2 text-lg  ${
                                    activeTab === "requests" ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500"
                                }`}
                                onClick={() => setActiveTab("requests")}
                            >
                                Loan Requests
                            </button>
                        </div>

                        <div className="relative min-h-[300px]">
                            <div
                                key={activeTab}
                                className="absolute inset-0 animate-fade-slide flex flex-col"
                            >
                                {activeTab === "manage" && (
                                    <div className="flex flex-col items-center space-y-6">
                                        <button
                                            className="w-2/3 bg-blue-500 hover:bg-blue-600 text-white text-xl  py-6 rounded-lg shadow-md transition-all"
                                            onClick={handleOpenDirectGrandDialog}
                                        >
                                            Grant a Loan
                                        </button>
                                        <button
                                            className="w-2/3 bg-green-500 hover:bg-green-600 text-white text-xl  py-6 rounded-lg shadow-md transition-all"
                                            disabled
                                        >
                                            Generate Loans PDF
                                        </button>
                                    </div>
                                )}

                                {activeTab === "requests" && (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {[...loanRequests].reverse().map((request, index) => (
                                            <div
                                                key={request.requestId}
                                                className="flex justify-between items-center p-4 h-32 bg-gray-100 text-black rounded-md shadow-sm hover:bg-gray-200 transition-all"
                                            >
                                                <div>
                                                    <h3 className="text-lg font-semibold">{request.applicant.username}</h3>
                                                    <div className="h-1"/>
                                                    <p className="text-sm text-gray-600">
                                                        Amount: MWK {request.amountRequested.toLocaleString()}
                                                    </p>
                                                    <div className="h-1"/>
                                                    <p className="text-sm text-gray-600">Purpose: {request.purpose}</p>
                                                </div>

                                                {grantedRequests.has(request.requestId) ? (
                                                    <div className="text-green-500 transition-transform animate-bounce-in">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-8 w-8"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 transform hover:scale-105"
                                                        onClick={() => handleGrantLoanApplication(request)}
                                                    >
                                                        Grant
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDirectGrantDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center font-custom bg-black text-black bg-opacity-30 backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-xl font-semibold mb-4 text-center ">Grant New Loan</h2>
                        <form  className="space-y-4"   onSubmit={(e) => {
                            e.preventDefault();
                            directApplicationGrant();
                        }}>
                            <div className="relative mb-4">
                                <label className="block text-sm font-medium">Applicant</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleApplicantSearch(e.target.value)}
                                    placeholder="Search applicant by username"
                                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                />
                                {applicantResults.length > 0 && (
                                    <ul className="absolute w-full bg-white border rounded shadow-lg z-10 max-h-48 overflow-auto">
                                        {applicantResults.map((user) => (
                                            <li
                                                key={user.userId}
                                                onClick={() => handleSelectApplicant(user)}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {user.username} ({user.firstName})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {selectedApplicant && (
                                    <div className="mt-2">
            <span className="bg-gray-200 p-1 rounded inline-block">
                {selectedApplicant.username}
                <button
                    type="button"
                    onClick={() => {
                        setSelectedApplicant(null);
                        setNewLoan((prev) => ({ ...prev, userId: '' }));
                    }}
                    className="ml-2 text-red-500"
                >
                    &times;
                </button>
            </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Loan Amount (MWK)</label>
                                <input
                                    type="text"
                                    value={loanAmount.toLocaleString("en-US")}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/,/g, "");
                                        if (!isNaN(Number(raw))) {
                                            setLoanAmount(Number(raw));
                                        }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter amount"
                                    inputMode="numeric"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium ">Purpose</label>
                                <textarea
                                    value={purpose}
                                    onChange={(e) => {setPurpose(e.target.value)}}
                                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="bg-gray-300  px-4 py-2 rounded"
                                    onClick={handleCloseDirectGrandDialog}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isSuccessVisible && (
                <div className="fixed inset-0 flex items-center justify-center font-custom bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-md w-full animate-scale-in">
                        <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-bounce">
                                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" strokeWidth="2"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Loan granted!</h2>
                        <p className="text-sm text-gray-600 mt-2">Loan has been granted to {selectedApplicant?.username}</p>
                    </div>
                </div>
            )}

        </>
    )
}