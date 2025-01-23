import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";

export default function AdminInventory() {

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
                                d="M3.75 8.25h16.5M4.5 9.75l.843 8.43a2.25 2.25 0 0 0 2.242 2.07h9.33a2.25 2.25 0 0 0 2.242-2.07l.843-8.43M7.5 4.5h9a1.5 1.5 0 0 1 1.5 1.5v2.25h-12V6a1.5 1.5 0 0 1 1.5-1.5Z"
                            />
                        </svg>
                        <span>Inventory</span>
                        <div className="ml-auto">
                            <Navbar/>
                        </div>

                    </header>
                </div>
            </div>
        </div>
    )
}