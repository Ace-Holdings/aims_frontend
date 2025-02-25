import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { LiaFileDownloadSolid } from "react-icons/lia"
import ReactDOM from "react-dom";
import React, {useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BidTile({ bid }: { bid: { id: number, description: string, deadline: Date, status: string } }) {
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBid, setSelectedBid] = useState(null);

    // update states
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [fileSend, setFileSend] = useState("");
    const [fileType, setFileType] = useState("");

    const openDetailsDialog= (bid: any) => {
        setSelectedBid(bid);
        setShowDetailsDialog(true);
    }

    const openUpdateDialog= (bid: any) => {
        setSelectedBid(bid);
        setShowUpdateDialog(true);
    }

    const openDeleteDialog = (bid: any) => {
        setSelectedBid(bid);
        setShowDeleteDialog(true);
    }

    const directFileDownload= (bid: any) => {
        setSelectedBid(bid);
        handleDownloadFile(selectedBid.bidId, "pdf");
    }

    // handler function for deleting bid
    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${selectedBid.bidId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.log('failed to delete bid')
            }
            setShowDeleteDialog(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
        }
    }

    // handler function to update a user
    const handleUpdateBid = async () => {
        try {
            const updatedBid = {
                ...(description && {description: description }),
                ...(deadline && {deadline: deadline}),
                ...(fileSend && {file: fileSend }),
                ...(fileType && {fileType: fileType}),
            };

            const response = await fetch(`http://localhost:3002/bids/${selectedBid.bidId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedBid),
            });

            if (!response.ok) {
                console.log("Failed to user");
                return;
            }

            setShowUpdateDialog(false);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    };

    // handler function to download file
    const handleDownloadFile = async (bidId: number, fileType: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/file`);
            if (!response.ok) {
                throw new Error('failed to download bid');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `bid_file.${fileType}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <div className={`p-4 relative rounded-lg shadow-md border border-gray-200 font-custom h-48
            ${bid.status === "Active" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}>
                <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
                    <button
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="View Details"
                        onClick={() => openDetailsDialog(bid)}
                    >
                        <FiEye className="w-5 h-5"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Edit"
                        onClick={() => openUpdateDialog(bid)}
                    >
                        <FiEdit className="w-5 h-5"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        title="Delete"
                        onClick={() => directFileDownload(bid)}
                    >
                        <LiaFileDownloadSolid className="w-6 h-6"/>
                    </button>
                    <div className="h-1"/>
                    <button
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Delete"
                        onClick={() => openDeleteDialog(bid)}
                    >
                        <FiTrash2 className="w-5 h-5"/>
                    </button>
                </div>


                <h3 className="text-lg font-semibold">{bid.description}</h3>
                <p className="text-sm">
                    Deadline: {new Date(bid.deadline).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
                </p>
                <p className="font-bold">{bid.status}</p>
            </div>

            {showDetailsDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 text-black font-custom backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-lg font-semibold mb-6 text-center text-gray-400">Bid Details</h3>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <strong>Bid ID:</strong>{selectedBid.bidId}
                            </div>
                            <div>
                                <strong>Description:</strong>{selectedBid.description}
                            </div>
                            <div>
                                <strong>Status:</strong>{selectedBid.status}
                            </div>
                            <div>
                                <strong>Deadline:</strong>{selectedBid.deadline}
                            </div>
                            <div>
                                <strong>Recently accessed user:</strong>{selectedBid.userId}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowDetailsDialog(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showUpdateDialog && ReactDOM.createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm text-black font-custom z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center text-gray-400">Update bid</h3>
                        <form>
                            <div className="mb-4 ">
                                <label>Description</label>
                                <input
                                    type="text"
                                    className="border p-2 w-full bg-white"
                                    value={description}
                                    onChange={(e: any) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Deadline
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker
                                        selected={deadline}
                                        onChange={(e: any) => setDeadline(e.target.value)}
                                        dateFormat="yyyy-MM-dd h:mm aa"
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={15}
                                        className="grow p-2 bg-white w-[220px] border border-gray-300"
                                        placeholderText="Select start date and time"
                                        popperClassName="z-50"
                                        popperPlacement="bottom"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="fileType" className="block text-gray-700 font-medium mb-2">
                                    File Type
                                </label>
                                <select
                                    id="fileType"
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                    value={fileType}
                                    onChange={(e: any) => setFileType(e.target.value)}
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="docx">DOCX</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    File
                                </label>
                                <input
                                    type="file"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Name of item"
                                    value={fileSend}
                                    onChange={(e: any) => setFileSend(e.target.value)}
                                />
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                    onClick={() => setShowUpdateDialog(true)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                    onClick={handleUpdateBid}
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {showDeleteDialog &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 flex items-center justify-center bg-black  text-black  font-custom bg-opacity-30 backdrop-blur-sm z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto z-10">
                            <h3 className="text-xl font-semibold mb-4 text-gray-400 text-center">Confirm Delete</h3>
                            <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this bid</p>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md" onClick={() => setShowDeleteDialog(false)}>
                                    Cancel
                                </button>
                                <button className="bg-red-600 text-white px-4 py-2 rounded-md" onClick={handleDelete}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

        </>
    );
}