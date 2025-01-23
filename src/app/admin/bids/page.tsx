import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";

export default function AdminBids() {

    return (
        <div className="h-screen flex bg-gray-100">
            <SidebarAdmin/>

            <div className="flex-1 flex flex-col">

                <div className="bg-white p-4 sticky top-0 z-10">
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
                                d="M6 2.25A.75.75 0 0 0 5.25 3v18a.75.75 0 0 0 .75.75h13.5a.75.75 0 0 0 .75-.75V7.5l-5-5H6z"
                            />
                        </svg>
                        <span>Bids</span>
                        <div className="ml-auto">
                            <Navbar/>
                        </div>

                    </header>
                </div>
            </div>
        </div>
    )
}