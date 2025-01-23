import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";

export default function AdminSales() {

    return (
        <div className="h-screen flex bg-gray-100">
            <SidebarAdmin/>

            <div className="flex-1 flex flex-col">

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
                                d="M8 2h8l-2 4h-4l-2-4z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 8c-1.5 1.5-1.5 6.5 0 8s6 6 7 6 6-3 7-6 1.5-6.5 0-8H5z"
                            />
                        </svg>
                        <span>Sales</span>
                        <div className="ml-auto">
                            <Navbar/>
                        </div>

                    </header>
                </div>
            </div>
        </div>
    )
}