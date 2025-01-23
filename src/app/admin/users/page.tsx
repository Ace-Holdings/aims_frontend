import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";

export default function UsersAdmin() {

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
                                d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0v.75H4.5v-.75Z"
                            />
                        </svg>
                        <span>Users</span>
                        <div className="ml-auto">
                            <Navbar/>
                        </div>

                    </header>
                </div>
            </div>
        </div>
    )
}