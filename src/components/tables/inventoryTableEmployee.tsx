import React, {useEffect, useState} from "react";
import {FiEdit, FiEye, FiMenu, FiTrash2} from "react-icons/fi";
import DataTable from "react-data-table-component";
import ReactDOM from "react-dom";
import DatePicker from "react-datepicker";
import {jwtDecode} from "jwt-decode";
import {useRouter} from "next/navigation";

interface DecodedToken {
    user: {
        id: string;
        username: string;
        roles: string[];
    };
    exp?: number;
    iat?: number;
}

interface SelectedItem {
    inventoryId: any;
    name: string;
    description: string;
    quantity: number;
    pricePerUnit: number;
    dateAdded: string | Date;
    location: string;
}

export default function InventoryTableEmployee() {
    const [stock, setStock] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);

    // states for updating inventory
    const [quantity, setQuantity] = useState(0);
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dateAdded, setDateAdded] = useState<Date | null>(null);
    const [location, setLocation] = useState("");

    const [showSerialDialog, setShowSerialDialog] = useState(false);

    const [serials, setSerials] = useState([]);

    const [serialNumbersUpdate, setSerialNumbersUpdate] = useState<string[]>([]);

    const [isSerialDialogOpen, setIsSerialDialogOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:3002/inventory', {
            method: 'GET',
            headers: {
                "authorization": 'Bearer ' + localStorage.getItem("token"),
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setStock(data);
                setFilteredData(data);
            });
    }, []);

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);


    const openDetailDialog = (item: any) => {
        setSelectedItem(item);
        setShowDetailsDialog(true);
    }

    const openUpdateDialog = (item: any) => {
        setSelectedItem(item);
        setShowUpdateDialog(true);
    }

    const openSerialDialog = async (item: any) => {
        setSelectedItem(item);
        try {
            const response = await fetch(`http://localhost:3002/unit/serials/${item.inventoryId}`, {
                method: 'GET',
                headers: {
                    "authorization": 'Bearer ' + localStorage.getItem("token"),
                }
            });
            if (!response.ok) {
                console.error("Failed to fetch serials");
                return;
            }
            const data = await response.json();
            setSerials(data);
            setShowSerialDialog(true);
        } catch (error) {
            console.error(error);
        }
    };

    const submitSerialsAndUpdateStock = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return null;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        const user = decoded.user;

        try {
            const inventoryCheckResponse = await fetch(`http://localhost:3002/unit/serials/${selectedItem?.inventoryId}`);

            const inventoryCheckData = await inventoryCheckResponse.json();

            if (Array.isArray(inventoryCheckData) && inventoryCheckData.length > 0) {
                const deleteResponse = await fetch(`http://localhost:3002/unit/inventory/${selectedItem?.inventoryId}`, {
                    method: "DELETE",
                });

                if (!deleteResponse.ok) {
                    console.error("Failed to delete existing inventory units");
                    return;
                }
            }

            // 2. Prepare updated inventory payload
            const updatedStock = {
                inventoryId: selectedItem?.inventoryId,
                ...(quantity && { quantity }),
                ...(pricePerUnit && { pricePerUnit }),
                ...(name && { name }),
                ...(description && { description }),
                ...(dateAdded && { dateAdded: dateAdded.toISOString() }),
                ...(location && { location }),
                ...(status !== "" && { status }),
            };

            // 3. UPDATE the inventory record
            const updateResponse = await fetch(`http://localhost:3002/inventory/${selectedItem?.inventoryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": 'Bearer ' + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    ...updatedStock,
                    lastModifiedBy: user,
                }),
            });

            if (!updateResponse.ok) {
                console.error("Failed to update inventory");
                return;
            }

            // 4. CREATE new inventory units with updated serial numbers
            const inventoryUnits = serialNumbersUpdate.map((serialNumber) => ({
                serialNumber,
                inventoryId: selectedItem?.inventoryId,
            }));

            const createUnitsResponse = await fetch("http://localhost:3002/unit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inventoryUnits),
            });

            if (!createUnitsResponse.ok) {
                console.error("Error creating inventory units");
                return;
            }

            // 5. Close dialogs and refresh
            setIsSerialDialogOpen(false);
            setShowUpdateDialog(false);
            window.location.reload();
        } catch (error) {
            console.error("Submission error:", error);
        }
    };

    // handler function to update stock item
    const handleUpdateStock1 = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return null;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        const user = decoded.user;

        if (!quantity || quantity === selectedItem?.quantity) {
            try {
                const updatedStock = {
                    inventoryId: selectedItem?.inventoryId,
                    ...(quantity && { quantity }),
                    ...(pricePerUnit && { pricePerUnit }),
                    ...(name && { name }),
                    ...(description && { description }),
                    ...(dateAdded && { dateAdded: dateAdded.toISOString() }),
                    ...(location && { location }),
                    ...(status !== "" && { status }),
                };

                const response = await fetch(`http://localhost:3002/inventory/${selectedItem?.inventoryId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": 'Bearer ' + localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        ...updatedStock,
                        lastModifiedBy: user,
                    }),
                });

                if (!response.ok) {
                    console.log("Failed to update inventory");
                    return;
                }

                setShowUpdateDialog(false);
                window.location.reload();
            } catch (error) {
                console.log(error);
            }

        } else {
            // Quantity changed – ask for new serial numbers
            setSerialNumbersUpdate(Array(quantity).fill(""));
            setShowUpdateDialog(false);
            setIsSerialDialogOpen(true);
        }
    };

    // Columns Definition
    const columns: any[] = [
        { name: "ID", selector: (row: any) => row.inventoryId, sortable: true },
        { name: "Item name", selector: (row: any) => row.name, sortable: true },
        { name: "Quantity", selector: (row: any) => row.quantity, sortable: true },
        {
            name: "Price per unit",
            selector: (row: any) => row.pricePerUnit.toLocaleString("en-US", {
                style: "currency",
                currency: "MWK",
            }),
        },
        { name: "Description", selector: (row: any) => row.description },
        { name: "Location", selector: (row: any) => row.location },
        {
            name: "Actions",
            selector: (row: any) => (
                <div className="flex">
                    <button
                        className="text-purple-600 hover:text-purple-800 transition-colors duration-200
               rounded-md p-2 hover:bg-purple-100 bg-gray-200"
                        onClick={() => openSerialDialog(row)}
                    >
                        <FiMenu className="w-5 h-5" />
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-green-600 hover:text-green-800 transition-colors duration-200
               p-2 hover:bg-green-100 bg-gray-200 rounded-md"
                        onClick={() => {openUpdateDialog(row)}}
                    >
                        <FiEdit className="size-6"/>
                    </button>
                    <div className="w-2"/>
                    <button
                        className="text-blue-600 p-2
                        hover:text-blue-800 hover:bg-blue-100 transition-colors duration-200 bg-gray-200 rounded-md"
                        title="View Details"
                        onClick={() => {
                            openDetailDialog(row)
                        }}
                    >
                        <FiEye className="w-5 h-5"/>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: "250px"
        },
    ];

    // Custom styles for table
    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "13px",
            },
        },
    };

    // Handle Filter Change
    // Handle Filter Change
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilter(value);

        const filtered =
            value === "All"
                ? stock
                : stock.filter((item: any) => item.location.toLowerCase() === value.toLowerCase());

        setFilteredData(
            filtered.filter((item: any) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    // Handle Search Change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        const filtered = stock.filter((item: any) =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredData(
            filter === "All"
                ? filtered
                : filtered.filter((item: any) => item.status === filter)
        );
    };

    return (
        <>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4 text-black">
                    {/* Filter Dropdown */}
                    <select
                        value={filter}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="All">All</option>
                        <option value="shop">Shop</option>
                        <option value="warehouse">Warehouse</option>
                    </select>

                    {/* Search Bar */}
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by name..."
                        className="border border-gray-300 rounded-md px-2 py-1"
                    />
                </div>

                {/* DataTable Component */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    customStyles={customStyles}
                    pagination
                    highlightOnHover
                    striped
                />
            </div>

            {/* modal for inventory details */}
            {shouldRenderDialog &&
                ReactDOM.createPortal(
                    <div
                        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black backdrop-blur-sm font-custom z-50 transition-opacity duration-300 ${
                            showDetailsDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <div
                            className={`bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto transition-all transform duration-300 ${
                                showDetailsDialog ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
                            }`}
                        >
                            <h3 className="text-lg  mb-6 text-center text-black">Stock Item Details</h3>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <strong>Item name:</strong> {selectedItem?.name}
                                </div>
                                <div>
                                    <strong>Description:</strong> {selectedItem?.description}
                                </div>
                                <div>
                                    <strong>Quantity:</strong> {selectedItem?.quantity}
                                </div>
                                <div>
                                    <strong>Unit price:</strong>{" "}
                                    {selectedItem?.pricePerUnit !== undefined
                                        ? new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "MWK",
                                        }).format(selectedItem.pricePerUnit)
                                        : "N/A"}
                                </div>

                                <div>
                                    <strong>Date added:</strong>{" "}
                                    {selectedItem?.dateAdded
                                        ? new Date(selectedItem.dateAdded).toLocaleString("en-US", {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })
                                        : "N/A"}
                                </div>
                                <div>
                                    <strong>Location:</strong> {selectedItem?.location}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                    onClick={() => setShowDetailsDialog(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* update inventory modal */}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm text-black font-custom z-50 transition-opacity duration-300 ${
                        showUpdateDialog ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto transform transition-all duration-300 ${
                            showUpdateDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h3 className="text-lg  mb-4 text-center ">Update Stock Item</h3>
                        <form>
                            <div className="mb-4">
                                <label className="block mb-2">Quantity</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const newQty = parseInt(e.target.value, 10);
                                        if (!isNaN(newQty)) {
                                            setQuantity(newQty);
                                        }
                                    }}
                                    className="p-2 border border-gray-300 rounded-lg w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="pricePerUnit" className="block text-gray-700 font-medium mb-2">Price Per Unit</label>
                                <input
                                    type="text"
                                    id="pricePerUnit"
                                    value={pricePerUnit.toLocaleString("en-US")}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/,/g, "");
                                        if (!isNaN(Number(rawValue))) {
                                            setPricePerUnit(Number(rawValue));
                                        }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Price per item"
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="mb-4">
                                <label>Description</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Location</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                >
                                    <option value="" disabled>Select location</option>
                                    <option value="shop">Shop</option>
                                    <option value="warehouse">Warehouse</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                    onClick={() => setShowUpdateDialog(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                    onClick={handleUpdateStock1}
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* modal for showing inventory item serials */}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm text-black font-custom z-50 transition-opacity duration-300 ${
                        showSerialDialog ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 ${
                            showSerialDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h3 className="text-lg mb-4 text-center ">
                            Serial numbers of items in stock for {selectedItem?.name} {selectedItem?.description}
                        </h3>

                        <div className="border border-gray-300 rounded-md overflow-y-auto p-2 max-h-[9.5rem]">
                            {serials.length > 0 ? (
                                serials.map((serial: any, idx: number) => (
                                    <div key={idx} className="border-b py-2 px-1">
                                        <span className="font-medium text-sm text-gray-700">{serial.serialNumber || "N/A"}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No serials found.</p>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowSerialDialog(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* modal for entering inventory item serial numbers */}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom transition-opacity duration-300 ${
                        isSerialDialogOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg w-1/4 transform transition-all duration-300 ${
                            isSerialDialogOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h2 className="text-lg font-medium mb-4 text-center">Enter Serial Numbers</h2>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {Array.from({ length: quantity }).map((_, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={serialNumbersUpdate[idx] || ''}
                                    onChange={(e) => {
                                        const updated = [...serialNumbersUpdate];
                                        updated[idx] = e.target.value;
                                        setSerialNumbersUpdate(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder={`Serial #${idx + 1}`}
                                />
                            ))}
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => {
                                    setIsSerialDialogOpen(false);
                                    setShowUpdateDialog(true);
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                            >
                                Back
                            </button>
                            <button
                                className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                                onClick={submitSerialsAndUpdateStock}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}