import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { LiaFileDownloadSolid } from "react-icons/lia"
import ReactDOM from "react-dom";
import React, {useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {jwtDecode} from "jwt-decode";

export default function BidTile({ bid }: { bid: { id: number, description: string, deadline: Date, status: string } }) {
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBid, setSelectedBid] = useState(null);
    const [downloadDialog, setDownloadDialog] = useState(false);

    // update states
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [fileSend, setFileSend] = useState<File | null>(null);
    const [editableFileSend, setEditableFileSend] = useState<File | null>(null);
    const [fileType, setFileType] = useState("");
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [editablePreviewUrl, setEditablePreviewUrl] = useState<string | null>(null);

    const openDetailsDialog= (bid: any) => {
        setSelectedBid(bid);
        setShowDetailsDialog(true);
    }

    const user = jwtDecode(localStorage.getItem("token")).user;

    const openUpdateDialog= (bid: any) => {
        setSelectedBid(bid);
        setShowUpdateDialog(true);
    }

    const openDeleteDialog = (bid: any) => {
        setSelectedBid(bid);
        setShowDeleteDialog(true);
    }

    const openDownloadDialog = (bid: any ) => {
        setSelectedBid(bid);
        setDownloadDialog(true);
    }


    useEffect(() => {
        if (downloadDialog && selectedBid?.bidId) {
            previewBidFile(selectedBid.bidId);
            previewEditableFile(selectedBid.bidId);
        }
    }, [downloadDialog, selectedBid]);

    // handler function for deleting bid
    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${selectedBid.bidId}`, {
                method: "DELETE",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                }
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
            const formData = new FormData();

            if (description) formData.append("description", description);
            if (deadline) formData.append("deadline", deadline);
            if (fileSend) formData.append("bidDocumentFile", fileSend);
            if (editableFileSend) formData.append("editableFileForBid", editableFileSend);
            if (fileType) formData.append("fileType", fileType);
            formData.append("lastModifiedBy", user);


            const response = await fetch(`http://localhost:3002/bids/${selectedBid.bidId}`, {
                method: "PUT",
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
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

    // Fetch PDF and preview in iframe
    const previewBidFile = async (bidId: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/filePreview`, {
                headers: {
                    "authorization": "Bearer " + localStorage.getItem("token"),
                },
            });

            if (!response.ok) throw new Error("Failed to fetch bid file");

            const blob = await response.blob();
            console.log(blob);
            const fileType = blob.type;

            if (fileType === "application/pdf") {
                const url = URL.createObjectURL(blob);
                console.log(url);
                setPdfPreviewUrl(url);
            } else {
                setPdfPreviewUrl(null);
                console.error("Unsupported file type for preview");
            }
        } catch (error) {
            console.error("Error fetching bid file:", error);
            setPdfPreviewUrl(null);
        }
    };

    // Fetch Editable File (DOCX)
    const previewEditableFile = async (bidId: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/editablePreview`, {
                headers: {
                    "authorization": "Bearer " + localStorage.getItem("token"),
                },
            });

            if (!response.ok) throw new Error("Failed to fetch editable file");

            const blob = await response.blob();
            console.log(blob);
            const fileUrl = URL.createObjectURL(blob);

            setEditablePreviewUrl(fileUrl);
            console.log(fileUrl);
        } catch (error) {
            console.error("Error fetching editable file:", error);
            setEditablePreviewUrl(null);
        }
    };

    // handler function to download file
    const handleDownloadFile = async (bidId: number, fileType: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/file`, {
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });
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

    const handleDownloadEditable = async (bidId: number, fileType: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/editable`, {
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (!response.ok) {
                throw new Error('failed to fetch editable file');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `editable_file.${fileType}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (e) {
            console.error(e);
        }
    }

    // handlers for file changes
    const handleUpdateBidFileChange = (e: any) => {
        setFileSend(e.target.files[0]);
    }

    const handleUpdateEditableFileChange = (e: any) => {
        setEditableFileSend(e.target.files[0]);
    }

    return (
        <>
            <div className={`p-4 relative rounded-lg shadow-md border border-gray-200 font-custom h-48
            ${bid.status === true ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}>
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
                        onClick={() => openDownloadDialog(bid)}
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
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Bid File
                                </label>
                                <input
                                    type="file"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Name of item"
                                    onChange={handleUpdateBidFileChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-red-600 font-medium mb-2">
                                    Editable file
                                </label>
                                <input
                                    type="file"
                                    id="title"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Name of item"
                                    onChange={handleUpdateEditableFileChange}
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

            {downloadDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black text-black bg-opacity-30 backdrop-blur-sm z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
                        <h2 className="text-lg font-medium mb-4 text-center font-bold">Preview Bid Files</h2>

                        {/* Two iframes side by side */}
                        <div className="flex justify-between space-x-4 mb-4">
                            {/* PDF Preview */}
                            <div className="flex flex-col items-center w-1/2">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Bid File (PDF)</h3>
                                {pdfPreviewUrl ? (
                                    <iframe
                                        src={pdfPreviewUrl}
                                        className="w-full h-60 border border-gray-300 rounded-lg"
                                    />
                                ) : (
                                    <p className="text-center text-gray-500">No preview available</p>
                                )}
                            </div>

                            {/* Editable File Preview */}
                            <div className="flex flex-col items-center w-1/2">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Editable File (DOCX)</h3>
                                {editablePreviewUrl ? (
                                    <iframe
                                        src={editablePreviewUrl}
                                        className="w-full h-60 border border-gray-300 rounded-lg"
                                    />
                                ) : (
                                    <p className="text-center text-gray-500">No preview available</p>
                                )}
                            </div>
                        </div>

                        {/* Buttons Below Previews */}
                        <div className="flex justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                                onClick={() => handleDownloadFile(selectedBid?.bidId, "pdf")}
                            >
                                Download Bid File
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded-lg"
                                onClick={() => handleDownloadEditable(selectedBid?.bidId, "docx")}
                            >
                                Download Editable File
                            </button>
                        </div>

                        {/* Close Button */}
                        <div className="mt-4 text-center">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                onClick={() => setDownloadDialog(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}