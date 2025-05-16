import React, {useState, useEffect} from "react";
import {FiEdit, FiEye, FiMenu, FiTrash2} from "react-icons/fi";
import {LiaFileDownloadSolid} from "react-icons/lia";
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

interface Bid {
    bidId: any;
    description: string;
    deadline: Date;
    status: boolean;
}

interface ChecklistItem {
    requirement: string;
    fulfilled: boolean;
}

export default function BidTileEmployee ({ bid }: { bid: { id: number, description: string, deadline: Date, status: boolean } }) {
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
    const [downloadDialog, setDownloadDialog] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [editablePreviewUrl, setEditablePreviewUrl] = useState<string | null>(null);
    const [showChecklistDialog, setShowChecklistDialog] = useState(false);
    const [showChecklistUnavailableDialog, setShowChecklistUnavailableDialog] = useState(false);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

    const [shouldRenderDialog, setShouldRenderDialog] = useState(false);

    // update states
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [fileSend, setFileSend] = useState<File | null>(null);
    const [editableFileSend, setEditableFileSend] = useState<File | null>(null);
    const [fileType, setFileType] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (downloadDialog && selectedBid?.bidId) {
            previewBidFile(selectedBid.bidId);
            previewEditableFile(selectedBid.bidId);
        }
    }, [downloadDialog, selectedBid]);

    useEffect(() => {
        if (showDetailsDialog) {
            setShouldRenderDialog(true);
        } else {
            const timeout = setTimeout(() => setShouldRenderDialog(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [showDetailsDialog]);

    const openDetailsDialog= (bid: any) => {
        setSelectedBid(bid);
        setShowDetailsDialog(true);
    }

    const openUpdateDialog= (bid: any) => {
        setSelectedBid(bid);
        setShowUpdateDialog(true);
    }

    const router = useRouter();


    if (!token) {
        router.push("/");
        return null;
    }

    const decoded = jwtDecode<DecodedToken>(token);
    const user = decoded.user;

    const openDownloadDialog = (bid: any ) => {
        setSelectedBid(bid);
        setDownloadDialog(true);
    }



    const openChecklistDialog = (bid: any) => {
        setSelectedBid(bid);
        fetchForBidChecklist(bid.bidId);
        setShowChecklistDialog(true);
    }

    const fetchForBidChecklist = async (bidId: any) => {
        try {
            const response = await fetch(`http://localhost:3002/checklist/${bidId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error("Checklist not available");
            }

            const data = await response.json();
            setChecklist(data.checklist);
            setShowChecklistDialog(true);
        } catch (e) {
            console.error(e);
            setShowChecklistUnavailableDialog(true);
        }
    };


    // handler function to update a user
    const handleUpdateBid = async () => {
        try {
            const formData = new FormData();

            if (description) formData.append("description", description);
            if (deadline) formData.append("deadline", deadline.toISOString());
            if (fileSend) formData.append("bidDocumentFile", fileSend);
            if (editableFileSend) formData.append("editableFileForBid", editableFileSend);
            if (fileType) formData.append("fileType", fileType);
            formData.append("lastModifiedBy", user.username);


            const response = await fetch(`http://localhost:3002/bids/${selectedBid?.bidId}`, {
                method: "PUT",
                headers: {
                    "authorization": `Bearer ` + token,
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

    // handler function to download file
    const handleDownloadFile = async (bidId: number, fileType: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/file`, {
                headers: {
                    "authorization": `Bearer ` + token,
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

    // Fetch and preview the bid file (PDF)
    const fetchBidFile = async (bidId: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/file`, {
                headers: {
                    "authorization": "Bearer " + token,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setPdfPreviewUrl(url);
            } else {
                setPdfPreviewUrl(null);
                console.error("Failed to fetch bid file");
            }
        } catch (error) {
            console.error("Error fetching bid file:", error);
        }
    };

    // Fetch PDF and preview in iframe
    const previewBidFile = async (bidId: string) => {
        try {
            const response = await fetch(`http://localhost:3002/bids/${bidId}/filePreview`, {
                headers: {
                    "authorization": "Bearer " + token,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch bid file");

            const blob = await response.blob();
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
                    "authorization": "Bearer " + token,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch editable file");

            const blob = await response.blob();
            const fileUrl = URL.createObjectURL(blob);

            setEditablePreviewUrl(fileUrl);
            console.log(fileUrl);
        } catch (error) {
            console.error("Error fetching editable file:", error);
            setEditablePreviewUrl(null);
        }
    };

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
            <div className={`p-4 relative rounded-lg shadow-md border border-gray-200 font-custom h-60
            ${bid.status === true ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}>
                <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
                    <button
                        className={`text-blue-600 hover:text-blue-800  ${bid.status === false ? "bg-gray-100" : "bg-green-600"}  transition-colors duration-200
                            rounded-full p-2 hover:bg-blue-100`}
                        title="View Details"
                        onClick={() => openDetailsDialog(bid)}
                    >
                        <FiEye className="w-5 h-5" />
                    </button>
                    <div className="h-1/2"/>
                    <button
                        className={`text-yellow-300 hover:text-yellow-500  ${bid.status === false ? "bg-gray-100" : "bg-green-600"}  transition-colors duration-200
                            rounded-full p-2 hover:bg-yellow-100`}
                        title="View Details"
                        onClick={() => openUpdateDialog(bid)}
                    >
                        <FiEdit className="w-5 h-1/2"/>
                    </button>
                    <div className="h-1/2"/>
                    <button
                        className={`text-purple-600 hover:text-purple-800  ${bid.status === false ? "bg-gray-100" : "bg-green-600"}  transition-colors duration-200
                            rounded-full p-2 hover:bg-purple-100`}
                        title="View Details"
                        onClick={() => openDownloadDialog(bid)}
                    >
                        <LiaFileDownloadSolid className="w-6 h-6"/>
                    </button>
                    <div className="h-1/2"/>
                    <button
                        className={`text-black hover:text-gray-800  ${bid.status === false ? "bg-gray-100" : "bg-green-600"}  transition-colors duration-200
                            rounded-full p-2 hover:bg-gray-100`}
                        title="View Details"
                        onClick={() => openChecklistDialog(bid)}
                    >
                        <FiMenu className="w-5 h-5" />
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
                            <h3 className="text-lg  mb-6 text-center ">Bid Details</h3>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <strong>Bid ID:</strong>{selectedBid?.bidId}
                                </div>
                                <div>
                                    <strong>Description:</strong>{selectedBid?.description}
                                </div>
                                <div>
                                    <strong>Status:</strong>{selectedBid?.status}
                                </div>
                                <div>
                                    <strong>Deadline:</strong>{' '}
                                    {selectedBid?.deadline
                                        ? new Date(selectedBid.deadline).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                        })
                                        : 'N/A'}

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

            {/* modal for updating a bid */}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm text-black font-custom z-50 transition-opacity duration-300 ${
                        showUpdateDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto transform transition-all duration-300 ${
                            showUpdateDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h3 className="text-lg  mb-4 text-center ">Update bid</h3>
                        <form>
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
                                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                    Deadline
                                </label>
                                <div className="relative overflow-visible">
                                    <DatePicker
                                        selected={deadline}
                                        onChange={(e: any) => setDeadline(e)}
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
                                <label htmlFor="bidFile" className="block text-gray-700 font-medium mb-2">
                                    Bid File (PDF)
                                </label>
                                <input
                                    type="file"
                                    id="bidFile"
                                    accept="application/pdf"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    onChange={handleUpdateBidFileChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="editableFile" className="block text-red-600 font-medium mb-2">
                                    Editable file (DOCX)
                                </label>
                                <input
                                    type="file"
                                    id="editableFile"
                                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    onChange={handleUpdateEditableFileChange}
                                />
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                    type="button"
                                    onClick={() => setShowUpdateDialog(false)}
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

            {/* modal for downloading bid files */}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm text-black z-50 transition-opacity duration-300 ${
                        downloadDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg w-2/3 transform transition-all duration-300 ${
                            downloadDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h2 className="text-lg  mb-4 text-center ">Preview Bid Files</h2>

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

                        <div className="flex justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                                onClick={() => handleDownloadFile(selectedBid?.bidId, 'pdf')}
                            >
                                Download Bid File
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded-lg"
                                onClick={() => handleDownloadEditable(selectedBid?.bidId, 'docx')}
                            >
                                Download Editable File
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                onClick={() => setDownloadDialog(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* modal for displaying bid checklist */}
            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50 font-custom transition-opacity duration-300 ${
                        showChecklistDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg w-[1000px] mx-auto z-10 transform transition-all duration-300 ${
                            showChecklistDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <h3 className="text-lg mb-4 text-black text-center">Checklist</h3>
                        <div className="mb-6 space-y-2 text-black text-sm max-h-[300px] overflow-y-auto pr-2">
                            {checklist.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-100 px-4 py-2 rounded-md shadow-sm flex justify-between items-start"
                                >
                                    <span className="w-[95%]">{item.requirement}</span>
                                    <span className="text-lg">
              {item.fulfilled ? '✅' : (
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                  >
                      <path
                          fillRule="evenodd"
                          d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
                          clipRule="evenodd"
                      />
                  </svg>
              )}
            </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowChecklistDialog(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {ReactDOM.createPortal(
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50 font-custom transition-opacity duration-300 ${
                        showChecklistUnavailableDialog ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div
                        className={`bg-white p-6 rounded-lg shadow-lg w-[400px] mx-auto z-10 transform transition-all duration-300 ${
                            showChecklistUnavailableDialog ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                        }`}
                    >
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-bounce">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 text-center">Checklist Not Available</h2>
                        <p className="text-sm text-gray-600 mt-2 text-center">
                            We couldn’t find the checklist for this bid.
                        </p>
                        <div className="mt-4 flex justify-center">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setShowChecklistUnavailableDialog(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </>
    );

}