"use client"

import SidebarAdmin from "@/components/layout/adminSidebar";
import Navbar from "@/components/layout/navbar";
import {useEffect, useState} from "react";
import SalesTile from "@/components/tiles/sales";
import  {jwtDecode} from "jwt-decode";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {useRouter} from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

interface InventoryItem {
    name: string;
    pricePerUnit: number;
    quantity?: number;
}

interface Sale {
    saleId: number;
    amount: number;
    quantity: number[];
    createdAt: string;
    customer: string;
    description: string;
    timestamp: Date;
    inventories: InventoryItem[];
    user: {
        username: string;
    };
}

interface Inventory {
    inventoryId: string;
    name: string;
    location: string;
    pricePerUnit: number;
}

interface CustomJsPDF extends jsPDF {
    lastAutoTable?: {
        finalY?: number;
    };
}

export default function AdminSales() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);

    const [quantity, setQuantity] = useState(0);
    const [item, setItem] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);
    const [customer, setCustomer] = useState("");
    const [issuer, setIssuer] = useState("");
    const [timestamp, setTimestamp] = useState<Date | null>(null);

    const [unitPrice, setUnitPrice] = useState(0);

    // search prop
    const [searchTerm, setSearchTerm] = useState("");

    const [filteredSales, setFilteredSales] = useState(sales);
    const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [inputQuantity, setInputQuantity] = useState(1);
    const [pdfFile, setPdfFile] = useState<Blob>(new Blob());
    const router = useRouter();

    const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
    const [availableSerials, setAvailableSerials] = useState<any[]>([]);
    const [selectedSerials, setSelectedSerials] = useState<string[]>([]);

    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedDay, setSelectedDay] = useState("");

    const [maxSelectable, setMaxSelectable] = useState(1);

    const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [confirmedItems, setConfirmedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // filtered sales by search
    useEffect(() => {
        const filtered = sales.filter((sale: any) =>
            sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSales(filtered);
    }, [searchTerm, sales]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    }

    useEffect(() => {
        const filtered = sales.filter((sale) => {
            const date = new Date(sale.createdAt);

            const matchesYear = selectedYear ? date.getFullYear() === Number(selectedYear) : true;
            const matchesMonth = selectedMonth ? (date.getMonth() + 1) === Number(selectedMonth) : true;
            const matchesDay = selectedDay ? date.getDate() === Number(selectedDay) : true;

            const matchesSearch = searchTerm
                ? sale.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            return matchesYear && matchesMonth && matchesDay && matchesSearch;
        });

        setFilteredSales(filtered);
    }, [sales, searchTerm, selectedYear, selectedMonth, selectedDay]);


    const handleSelectInventory = async (inventoryId: string) => {
        try {
            const response = await fetch(`https://aims-api-latest.onrender.com/inventory/${inventoryId}`, {
                headers: {
                    "authorization": `Bearer ` + token,
                }
            });

            if (response.ok) {
                const data = await response.json();


                setAvailableSerials([]);
                setInputQuantity(1);
                setMaxSelectable(1);
                setSelectedItemDetails({ id: inventoryId, name: data.name, unitPrice: data.pricePerUnit });

                setIsQuantityModalOpen(true); // Open quantity modal
            } else {
                console.log("Could not fetch inventory details");
            }
        } catch (error) {
            console.error("Error fetching inventory details:", error);
        }
    };

    const handleAddItem = async () => {
        if (!selectedItemDetails || inputQuantity < 1) return;

        try {
            const response = await fetch(`https://aims-api-latest.onrender.com/unit/serials/${selectedItemDetails.id}`);

            if (response.ok) {
                const data = await response.json();
                setAvailableSerials(data);
                setMaxSelectable(inputQuantity);
                setIsQuantityModalOpen(false);
                setIsSerialModalOpen(true);
            } else {
                console.log('failed to fetch inventory details');
            }
        } catch (e: any) {
            console.error("Error fetching inventory details");
        }

    }

    useEffect(() => {
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token);
                console.log(decodedToken);
                setUsername(decodedToken.user || "User");
            } catch (e: any) {
                console.error(e);
            }
        } else {
            setUsername("User");
        }
    }, []);

    useEffect(() => {
        const fetchInventories = async (query: string) => {
            try {
                const response = await fetch(`https://aims-api-latest.onrender.com/inventory/search?name=${query}`, {
                    method: "GET",
                    headers: {
                        "authorization": `Bearer ` + token,
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setInventories(data);
                } else {
                    console.log("Could not fetch inventories");
                }
            } catch (error) {
                console.error("Error fetching inventories:", error);
            }
        };

        if (searchQuery) {
            fetchInventories(searchQuery);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (username) {
            const fetchUserId = async () => {
                try {
                    const response = await fetch(`https://aims-api-latest.onrender.com/users/search?username=${username}`, {
                        method: "GET",
                        headers: {
                            "authorization": `Bearer ` + token,
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.length > 0) {
                            setUserId(data[0].userId);
                        }
                    } else {
                        console.log("Could not fetch users");
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            };
            fetchUserId();
        }
    }, [username]);

    useEffect(() => {
        const fetchSales = async () =>  {
            try {
                const response: any = await fetch('https://aims-api-latest.onrender.com/sales', {
                    method: "GET",
                    headers: {
                        "authorization": `Bearer ` + token,
                    }
                });

                const data = await response.json({});
                setSales(data);
            } catch (e) {
                console.error(e);
            }
        }
        fetchSales();
    }, []);

    useEffect(() => {
        const total = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        setAmount(total);
    }, [selectedItems]);

    useEffect(() => {

        if (!token) {
            router.push("/");
            return;
        }

        try {
            const decodedToken = jwtDecode(token) as { roles?: string[] };
            const roles: string[] = decodedToken.roles || [];

            if (!roles.includes("ROLE_ADMIN")) {
                router.push("/");
            }
        } catch (e) {
            console.log(e);
            router.push("/");
        }
    }, [router])

    const handleSerialConfirm = () => {
        if (selectedSerials.length !== inputQuantity) {
            alert(`You must select exactly ${inputQuantity} serial(s).`);
            return;
        }

        const serialData = availableSerials.filter((s) => selectedSerials.includes(s.unitId));

        const itemWithSerials = {
            ...selectedItemDetails,
            quantity: inputQuantity,
            serials: serialData,
        };

        setSelectedItems((prev) => [...prev, itemWithSerials]);
        setSelectedSerials([]);
        setAvailableSerials([]);
        setInputQuantity(1);
        setMaxSelectable(1);
        setSelectedItemDetails(null);
        setIsSerialModalOpen(false);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedState = window.localStorage.getItem("adminSidebarCollapsed");
            if (storedState !== null) {
                setIsSidebarCollapsed(storedState === "true");
            }
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);

        if (typeof window !== "undefined") {
            window.localStorage.setItem("adminSidebarCollapsed", String(newState));
        }
    };

    // handler function to submit sales transaction
    const handleSalesSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();

        const sale = {
            customer,
            amount,
            quantity: selectedItems.map(item => item.quantity),
            timestamp: new Date().toISOString(),
            userId,
            inventoryIds: selectedItems.map(item => item.id),
            items: selectedItems.map(({ name, quantity, unitPrice }) => ({ name, quantity, unitPrice })),
        };

        try {
            // 1. Submit the sale
            const saleRes = await fetch("https://aims-api-latest.onrender.com/sales", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ` + token,
                },
                body: JSON.stringify(sale),
            });

            if (!saleRes.ok) throw new Error("Failed to submit sale");
            const { saleId } = await saleRes.json();

            // 2. Generate and upload invoice
            const pdfBlob = generateInvoicePdf(sale);
            const invoiceForm = new FormData();
            invoiceForm.append("saleId", saleId);
            invoiceForm.append("file", pdfBlob);

            const invoiceRes = await fetch("https://aims-api-latest.onrender.com/invoices", {
                method: "POST",
                headers: {
                    authorization: `Bearer ` + token,
                },
                body: invoiceForm,
            });

            if (!invoiceRes.ok) throw new Error("Failed to upload invoice PDF");

            // 3. Update inventory quantities
            await Promise.allSettled(
                selectedItems.map(async (item) => {
                    try {
                        const invRes = await fetch(`https://aims-api-latest.onrender.com/inventory/${item.id}`, {
                            headers: {
                                authorization: `Bearer ` + token,
                            },
                        });

                        if (!invRes.ok) throw new Error(`Failed to fetch inventory for ID: ${item.id}`);
                        const inventoryData = await invRes.json();
                        const updatedQuantity = inventoryData.quantity - item.quantity;

                        await fetch(`https://aims-api-latest.onrender.com/inventory/${item.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                authorization: `Bearer ` + token,
                            },
                            body: JSON.stringify({ quantity: updatedQuantity }),
                        });
                    } catch (err) {
                        console.error(err);
                    }
                })
            );

            // 4. Delete used serials
            await Promise.allSettled(
                selectedItems.flatMap((item) =>
                    (item.serials || []).map((serial: any) =>
                        fetch(`https://aims-api-latest.onrender.com/unit/${serial.unitId}`, {
                            method: "DELETE",
                            headers: {
                                authorization: `Bearer ` + token,
                            },
                        }).catch((err) =>
                            console.error(`Error deleting serial ${serial.unitId}`, err)
                        )
                    )
                )
            );

            setSelectedItems([]);
            setSelectedSerials([]);
            setAvailableSerials([]);
            setInputQuantity(1);

            closeDialog();
            setLoading(false);
            if (typeof window !== 'undefined') {
                window.location.reload();
            }

        } catch (err) {
            console.error("Sales submission error:", err);
            setLoading(false);
        }
    };


    // function to generate invoice pdf
    const generateInvoicePdf = (sale: any) => {
        const doc = new jsPDF() as CustomJsPDF;

        const logoBase64 = 'data:image/png;base64,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'
        doc.addImage(logoBase64, "PNG", 155, 10, 50, 40);


        const address = `Ace Holdings Limited\nP.O. Box 1246\nBlantyre, Blantyre\nMalawi\n\nMobile: +265999257356\nwww.ace.co.mw`;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(address, 14, 40);


        doc.setLineWidth(0.5);
        doc.line(10, 65, 200, 65);

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Invoice", 14, 75);

        // Format sale date
        const formattedDate = new Date(sale.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        // Currency formatter for MWK
        const currencyFormatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "MWK",
            minimumFractionDigits: 2
        });

        // Customer and Sale Date
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Customer
        doc.text("Customer:", 14, 85); // Moved up
        doc.text(sale.customer, 40, 85); // Moved up

        // Sale Date
        doc.text("Sale Date:", 14, 93); // Moved up
        doc.text(formattedDate, 40, 93); // Moved up

        // Item List
        const tableData = sale.items.map((item: any) => [
            item.name,
            item.quantity,
            currencyFormatter.format(item.unitPrice),
            currencyFormatter.format(item.quantity * item.unitPrice)
        ]);

        autoTable(doc, {
            head: [["Item", "Quantity", "Unit Price (MWK)", "Total (MWK)"]],
            body: tableData,
            startY: 100,
            theme: "grid"
        });

        // Total Amount Calculation
        const totalAmount = sale.items.reduce(
            (total: number, item: any) => total + item.quantity * item.unitPrice,
            0
        );

        const formattedTotal = currencyFormatter.format(totalAmount);

        // Total Amount
        doc.setFont("helvetica", "bold");
        doc.text(`Total: ${formattedTotal}`, 14, ((doc as any).lastAutoTable?.finalY || 0) + 10);

        // Save the PDF
        doc.save("invoice.pdf");

        // store the pdf as a blob
        return doc.output('blob');

    };

    // function to generate sales report
    const generateSalesReportPdf = async (report: {
        startDate: Date;
        endDate: Date;
        salesData: any[];
        totalAmount: number;
        totalQuantity: number;
    }) => {
        const doc = new jsPDF();

        const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkYAAAGtCAYAAADztruwAAAAAXNSR0IArs4c6QAAIABJREFUeF7snQeYXUXZx9+ZOeW27WkEqYJKEQuoICrEhqCogISO9EgnIRDIBySxQAwQhIACQZCogAEUCC2CBulKVIQgnVBD6va999SZ73lnzt29WSnJ3rvl7r6HhyfJ7jlzZn5z9p7/vpUBHUSACBABIkAEiAARIAKaABtUDnh3NagzoJsTASJABIgAESACRKCbwOAKo0HcCNJkgwifbk0EiAARIAJEYIgSGLHCaIjuB02LCBABIkAEhiABpRRjjJGPYwjuTaWnRMKo0kRpPCIwUgiQ2XWk7DStkwiMKAJVI4xIrY+o55IWSwSIABEgAkRgUAhUjTAaFDp0UyJABIgAESACRGBEESBhNKK2mxZLBIgAESACRIAIfBABEkb0fBCBASNAQTkDhppuRASIABHoIwESRn0ER5cRASJABIgAESACw48ACaPht6e0IiJABIgAESACRKCPBIa+MCLvQx+3li4jAkRgZBOgD8+Rvf+0+r4SGPrCqK8ro+uIwAASoHISAwibblVBAiSeKgiThupFoFqfLhJGG/goV+sGb+Dy6DQiQAQ2gAB9DmwAJDqFCFQ5ARJGVb6BNH0iQASIABEgAkSgcgRIGFWOJY1EBIgAESACRIAIVDkBEkZVvoE0fSJABIgAESACRKByBDZIGFFgaeWA00jDmAAFoAzjzaWlEYEqJUCfSxu9cRskjDZ6VLqACBABIkAEiAARIAJVSICEURVuGk2ZCBABIkAEiAAR6B8CJIz6h2vfR6242bPiA/Z9bXQlESACRIAIEIEhToCE0RDfIJoeESACRKA3AYr7pGeCCPQfARJG/ceWRiYCRIAIEAEiQASqjAAJoyrbMJouESACRIAIEAEi0H8ESBj1H1samQgQASJABIgAEagyAiSMqmzDaLpEgAgQASJABIjAhxHoe+IRCaMPY0vfJwJEgAgggb5/zhI/IkAEqogACaNKbdYI/9Ac4cuv1FNE4xABIjAUCNAH2lDYhUGbAwmjQUNPNyYCRIAIEAEiQASGGgESRkNtR2g+RIAIEIGRQIABMAWgRsJaaY1VRYCEUVVt1yBPlszLg7wBdHsiQASIABHobwIkjPqbMI1PBIgAESACRIAIVA0BEkZVs1U0USJABIjAQBEg8/BAkab7DD0Cw0YY0Y/x0Hu4aEZEgAgQASJABKqNwLARRtUGnuZLBIgAESACRIAIDD0CJIyG3p7QjIjAiCRAHeNH5LbToonAkCNAwmjIbQlNiAgQASJABIgAERgsAiSMBos83ZcIEAEiQASIABEYcgRIGA25LaEJEQEiQASIABEgAoNFgITRYJGn+xIBIkAEiAARIAJDjgAJoyG3JTQhIrCRBKhWxUYCo9OJABEgAu9PgIQRPR1EgAgQASJABIgAEUgIkDCiR4EIEAEiQASIABEgAiSM6BnYUAJ98dRQTZoNpUvnEQEiQASIwFAiQBajobQbNBciQASIQBUSoF+EqnDTaMrvS4CEET0cRIAIEAEiQASIABEgVxo9A0SACBABIkAEiAARWJ8AWYzoiSACRIAIDBiBvkTsDdjk6EZEgAgAAAkjegyIABEgAkRggAmQQBxg4HS7jSBAwmgjYNGpRIAIEAEiQASIwPAmQMJoeO8vrY4IbBQB+j1+o3ANs5Np94fZhtJy+kiAhFEfwdFlw48ApRwPvz2lFREBIlDNBAZHrJMwquZnhuZOBIgAESACRIAIVJQACaOK4qTBiMDgEBic36sGZ610VyJABIhAfxIgYdSfdGnsPhKg13wfwVX/ZbT11b+HtIKyCZBbv2yE7zvAhrAlYVRh/hsCvcK3HLjh6KU1cKzpTkOAAD3wQ2ATBnwKw/ozfMBpVucNSRhV577RrN+HAH2o0aNBBIgAESAC5RAYMGE0ZH/3GrITK2db6VoiQASIABEgAkSgLwQGTBj1ZXJD9RrSUkN1Z2heI5EA/Txu+K6PWFYjduEb/mzQmT0ESBiNoKeB3EwjaLOTpXa/D+jFMPI2n1ZMBIhAnwiQMOoTNrqICBABIkAEhjQB+mVgSG/PUJ4cCaOhvDs0tw8mQB989IQQASJABIhAhQmQMKowUBqOCBABIkAEiAARqF4CJIyqd+9o5kSACBABIkAEiECFCZAwqjBQGo4IEAEiQASIwFAlQBEIH74zJIw+nBGdQQSIABEgAv1MgF7Y/QyYht9gAiSMNhgVnUgEiAARIAJEoHIEqIRK5VhWciQSRpWkSWMRASJABIgAESACVU2AhFFVbx9NnggQASJABIgAEagkARJGlaRJYxEBIkAEiAARIAIDSKDy0WkkjAZw++hWRIAIEAEiQASIwNAm0E/CqO8KjoLRhvYDQ7MjAh9MoO8/+0SWCBABIjAUCPSTMBoKS6M5EIEPIEDvb3o8BpIAPW8DSZvuRQTKIkDCqCx8dDERIAJEgAgQASIwnAiQMBpOu0lrIQJEgAgQASJABMoiQMKoLHx0MREgAkSACBABIjCcCJAwGk67SWshAkSACBABIkAEyiJAwqgsfAN4MQVvDiBsuhURIAJEgAiMVAIkjEbqzpe7bhJq5RIcGdfTczIy9plWSQSGA4Hk84qE0XDYTFoDESACRIAIEAEiUBECJIwqgrGyg9Av2ZXlSaMRASJABIgAEdhQAiSMNpQUnUcEiAARIAJEgAgMewIkjIb9FtMCiUB1E6A2QdW9fzR7IlBtBEgYVduO0XyrigC91Ktqu2iyRIAIEAEgYUQPAREgAkSACBABIkAEEgIkjOhRMAQo4pueBCJABIgAESACZDGiZ4AIEAEiQASIABEgAkUCZDGiZ4EIEAEiQASIABEgAuRKo2eACBABIkAEiAARIALrEyCLET0RRIAIEAEiQASIABEgi9FwewYoenq47SithwgQASJABAaeAFmMBp453ZEIEAEiQASIABEYogRIGA3RjaFpEQEiQASIABEgAgNPgITRwDOnOxIBIkAEiAARIAJDlAAJoyG6MTQtIkAEiAARIAJEYOAJkDAaeOZ0RyJABIgAESACRGAjCAxk30kSRhuxMXQqESACRIAIEAEiMLwJkDAa3vtLqyMCRIAIEAEiQAQ2ggAJo42ARacSASJABIgAESACw5sACaPhvb+0OiJABIgAESACRGAjCJAw2ghYdCoRIAJEgAgQASIwvAmQMBre+0urIwJEYAgRGMjMmiG0bJoKEagqAiSMqmq7aLJEgAgQgf4nQAKu/xnTHYYuARJGQ3dv3mdm1Cy26raMJkwEiAARIAJVQ4CEUdVsFU2UCBABIkAEiMDIITBYlksSRiPnGaOVDgABsucNAGS6BREgAkSgHwmQMOpHuDQ0ESiHwGD9tlTOnOlaIkAEyiBAv1mVAa9yl5IwqhxLGokIEAEiQASIABGocgIkjKp8A2n6RGAwCdAvuINJn+5NBIhAfxAgYdQfVGlMIkAEiEDFCZAMrThSGpAIvAeB4S2M6HOEHnoiMIgEBusHcLDu+wGoh+CUPvjBqLoJD+Jz3n+3pl3oP7YfNPLwFkaDw5TuSgSIABEgAkSACFQpARJGVbpxNG0iQASIABEgAkSg8nY1Ekb0VBEBIkAERigBKgkxQjeelv2BBEgY0QNCBIgAESACRIAIEIGEAAkjehSIABEgAkSACBABIjBShRGZjunZJwJEgAgMVQKVjxcZqiuleW04gYF+KshitOF7Q2cSASJABIgAESACw5wACaNhvsG0PCJABKqTwED/llydlGjW/0uAnpxynwoSRuUSLF5Pz2KlSPZhHILfB2h0CREYFAL00zoo2OmmG0FgxAoj+uHciKeETiUCRGCYEqBPwmG6sbSsMgiMWGFUBjO6lAgQASJABIgAEehNYJjobBJG9GgTASJABIgAESACRCAhQMKIHgUiQASIABEgAkSACJAwomeACBABIjD8CQwT78bw3yha4ZAhQBajIbMVNBEiQASIABEgAkRgsAmQMBrsHaD7EwEisB4BsnDQA0EEiMBgEiBhNJj06d5EYBgQoDY7w2ATaQlEgAh0EyBhRA8DESACRIAIEAEiQAQSAiSM6FEgAkSACBCB4UGA/LDDYx8HeRUkjAZ5A+j2RIAIvA8BesnRo0EEiMAgECBhNAjQ6ZZEgAgQASJABIjA0CRAwqiP+0IBp30ER5cRASJABIgAERjCBEgYDeHNoakRASJABIgAESACA0uAhFE/8abwiH4CS8MSASJABIgAEehHAiSM+hEuDU0EiAARIAJEoE8E6LfrPmGrxEUkjCpBkcYgAkRAE9iQ2LsZSnF4CDiMfo43uW73Z1DN25b+e4tr/ux9tNW2xTN32CFkjKn+wo3zn/nQQwJGj+Z4jx0A4DkAaHqzZ5749Zq0xToKkVq3ua/Ge55qeO01eeCBB8r+nFt/rZnGJQJEYH0CJIzoiSACRGBACKAgKtzy0GeXr8tP8N3asREXKaUUZ/oAJgTjClBbcCYBJYZijmNL3/MZC31Vm3F96fmrGjOZJ2pTdf+6aP/t1lVq4v9RKnvF1ffvu6LT/3Q6VZe1uLIj6bMIFEjOWchtAGDAlFCKxQwgBC4VqDiWIpYyzZTXlLKWNyi2aPaJe79eqXnROESACAw8ARJGA8+c7kgEKkIArRs4ULVYKa57fFnjXY8+c0XUuOn3u+y6bGyngMcoNgAEw6VoOaT/VMoYhZSUwIGBiENQoQc8imXWsd6N/a5fjx0Tz7124jfaKgHzyItv+3pXuvGG1lBsKtwME0pCFAXABIOYCYjBBgVoRMLZSAAWglIxQCzBERyU1wl2WOhKh12LPtpYN/nik7+9shLzojGIABGoBIGN80uSMKoEcxqDCAwwgSVKWX+5/eGt3lz3hn/jCUe8VQ3i6Ip773Ufe0NOXWfXTu5KNzbGVo5pYYRyQ+sgacRQIopAKS2UUDjZTIEMfLAgBkvFkfTz/xojuo77/aRvPFsuehSYh1x5zzEvrC5cOnabHep8HyAqdELasSGUMcSMgwIHJAgQEv8eAodQzzeIpT6PRQGIoAvcuHOF7bWcecgnUrdOnDgxLndudD0RGHYENk6jDMrySRgNCna6KRHoO4EZMxRfs9NTO6/obDs1CP2O2qw9+5ZD9nqr7yMO3JWTb/vHDi91BD9brdyv82xjVkkdyqNtMUpJLYJ6dBHTIikMQ7A5A8EkCBVB6OeVgHjNpm50+q1HffkP5YpCFEbfnXfnCW2ppovzcbZGgQW1rg1Bvgu4AG0pkuAAl8JYuCACznyIITaCKQZIuQKirjbgUXs8yonv4F7z9D9M/+FLA0eW7kQEiEClCJAwqhRJGocIDAABjNNZsejpnd/1olkF4BMsR3TG69Zcus92n7h8yhc3KwzAFMq6BYqQ/ec/8JUVvjUnPWbTnb0YBAoP/UukUonliIOSAJJx4NwIJ31IFEgKmIwh8POB0/bW1RM+W3fmrAkTonImhULz8do/HtmZHjUvdJtyoR9Dg+uC39UOAuPAlbEYMSlwssBlBMAL6PADFTuQ90LI5jKgwjxkXQltK19/YbNa65xPTP3BolmMGTMYHUSACFQNARJGVbNVNFEiADBl8bObPbe284Iup+4gnsvVFPyCtAutizYNvcm3HrnH8mpgNPfxtxofe375/zXH1onSzaVDJoBJE1PElBFCaLWRGG/EBERRpEWT41oQhR7IMADBpRwjO27a/2Pq+KMnTPDKXfcR1/91j+Xt7DaZGjNKgQCXxcACD2JAzYWWq5T+EwOuGYSgWF7fMi3qwAskThOCqABMBZDmhbXZuHPWoXsfcO3EHVlQ7tzoeiJABAaWAAmjgeVNdyMCfSZw5qKlo5a1hcf46bopom702OauAnAblON3vVLX3DJt2jG7LZrAWFnWkz5PbiMuRKvXf+Yu3E/mxv48b9d/1Be2CWTWhw61BgALUCpJDL7mHOJYgm3bEKEoEgxAeuAU1t3/9S1GHXrud3Zq2Yjbv+eph1x5/w4r49w9Kt24RcGPwJExuLYAKQNtudJWI8W6Y4wY87VYY7EDgtvghR44KRuAxRDlW/OpqOuSY4/43uyJm7Ehb8Url91Qu74KQliGGjKaTy8Cw0oYbUgNFXoCiEC1EcDnesri5z76j7fXTosbxh0gnWy9xSyd4x7IECwVeOnQv6Ohfc0Ftx+9x8vVsL75T742dvG/n7+slY8/MEzXWpEsAAgOQRSDbbkQhwqE4MBlCIKhywpAxhwEWpc4Bj13Ac+3LB2lwgPvmFx+evxRv1qy5asFdYuys58D5nCbWSDDCBQ3WXJcW47wsLRIwn9jwLgfxuCkXJCxCcaWMgYVeQEPveunHr739O9swcoWbdWwn/TZWw27RHPcUALDShht6KKHz3n0u9Hw2cv3Xgm+cM558L+b/Xtdfmo+3XBE5NbUxzrORYGMIh0DE4cFCUHwdn2Uv/yLm6SunTVhx86hzuWapUvtRYufP8Rr+PgFcbZpy46wU1iOAC5QFGGAEYBrWSBlAQSgZUZAHKOTywLOURB2ggraX6yV4VH3nvr1v/9PAPZG/mgcOHfRpq12w/wQxDcUcywmTWwRZqKhFUiAr5Fi2j5atSxpMulijmIoAiUjsLSIQn0Uh16+87Y9t9/8zAsP2P7dob4XAze/jdyUgZsY3YkIrEeAhNGHPBD0mxD9xAwmgbOWLBv35OtrT41zTZOsmlFNBT8GgS4lFkEcx5CyHfDzXVBr2VG07p0XNrfV1G0P3e2Bagj6vejuZxoefGX1qVHtuNN8FTdJISBlZyEo+GAzDpYAiKQPptC1pa1GEHPggoFUeWBhV0s69qcfe8pX509krKzU+EMuWTRqhXIuBTt3kGWnXInZcokwYioCpkOFFETK6hZG+rkQHMLIB64iwBBtBhw4AxnkOx4ao9b86PbzD6sKC95gPuN0byIw1AiQMBpqO0LzGYIEBuc33ePufHLsi53B1Cg36ofcrR/lB5Lp4F+B9osQLMeGOIy09cKOYqjhMrK8jht332rUtOlf+EjFqkL354bsd9UD263h6St4tm7PQHLLAhdUIMHRYkhChIUULZQcRhjxWAFH1xquXwZeKuq6+Buf+ehF5WbkTV3wn+xTb78xXaQbJisrlWbM7o4rwvgnFEZYTkAXelRMMzcWJAVYrxtLQEZYZwnjpWSsBETPsHffOPrBuT/8d3/yo7GJABGoPAESRpVnSiMSgbIJ/Gjxf8a8uKbj2M7sqFOt2tFj8515jq6bXDoNnudBICOwXRejkyH2Q0gzBg5XEAed//xkU+60q766xRPl1vcpexEbMMCMJctyD/3nzdNUzegzY5ZpxGBmXKcVR8CFBI9JkBbXAdBKMhCR1MKIKQm2CkM76Li5AVrPveXU763YgNu97yn3vqzceX+659TIrT0/UHatJdJY1DqpsIR/8UExBTFmzSkOAruCAEAoFbiuDUL64PkFcJ0U+L4PaYu/4uTfOuaeCw55pJx50bVEgAgMPAESRgPPnO5IBD6QwLSFS+ueDvzj4qbNp3SAPT7iFvhdnZB2HR3HEvoR2LYDYRgDlvlBe4oNHDo62yCTcdqh5d3LPl+f+cUv9vtMayVR94dbWVedvuHPu73Rweda2bFfYJDCAkbAIw9sW0AByygKoatPg1RgS6lT+xkTYMsgBq/1rxnv3bMWTTvomXKE4EKlxPU/+8P+gVt/CXfqNmMixfwARZgFike6qKPU/2HFxx5hFAMDy+LAYw/CIIB0Jgeel8fq3GvTwbpJd5+335/KmVcl94/GIgJEYMMIkDDaME50FhEYEAInLHygrpWPPmBF5EzpEqnthJPWIb1C+24k+EEEtnAgK7LgeQH40oOamiy0t7dDJpuGMCzEVqHtqWzL6nP+fOI3Hq6Gl/JFjzzT8Jf/vHtJYDX9EKwagZWvLRWDYhJ8hr3KkurY2BokEUamPUcgodD69FiRn/6D07/1YLlxRvv//A8TmgP7Mqdu3CcBUtyLTEsSHQmO7WSxLQlgzSWsZ4RyFMssWbqnmoPfx9ICwtaxXyr02zP+utPvm7n/AkZFHgfkZ4duQgQqRYCEUaVI0jhEoEwCd65RNX987Lkj3wr4CVG68ROxZTv4ko18DxyX6Zo+OiOKOxDlFbi2C5GIoeB3Arctnd4e+l3gQtzWAPLmjwn/3Epbjcpc4ntejnWNXpn/0D7vBvalgV27DQiHOzaDQqEAyrYhVgw4xvVgCDYyUAokpszHUvG4fUWqa82sUw/cfsE+225rUsf6eEy76dEdnn59zaXKbfy6Lx0h7LRmjgJNC6PucbGMAIo1tCZx8PJ5qEkzbcnKByEIIbA6tmf5zZfuvl3w41kTJ1KRxz7uCV1GBAaDAAmjwaBO9yQCvQgsXKacP7/23AGvdcGFYaruI5IJSwkOsYxA6q4S2kaiCwyC5MCkBYoB4OsaXT1YoRlr62Dnd0tKKWL5Vl3Qfuzdh3/+L9UAe8bCZc5Tq9ac2y7SZ8Ruuj5OCjtijzKsOG3FEjjGFSXiEGN9OFbDBq/NCdb+sk6smf370w5vL2etC5e1NS6458Gfd8maHzrZRtsLix+PRhxpgZRU5zYVui0AjH3S88Kq1wpihsHZGAMVSld23POJVOrIX0yeUFGXZjlrpGuJABH4cAIkjD6c0QCeMTjZTwO4QLrVexBYtEJl/vz0C197sTWYXHBzX47sjKWtIvifduFgpjjX7TLsWOi+YniY5qYYmByCAk/Hweju7+iLkizKhu2XfmvU+J+ctde4rmoAv++ld+1ayDZcW7DTO0rbZn4Qg+Bp4DG60BQIJUGgBQcFCLh69WGhuVCjOu4ZnwpOv77MAOyFj7+V/u2Dj5wTpMdMja2aTBgmvdqYBBNrjZYjbHSLogzvbmHYEzYMATvGAtfrCSNw4sKybca4E395/B7PVwN/miMR+B8CI/SVRMKIfhaIwCASwKDfxXe/cNDLa1rP5bVNH4+cjO1hcLGFsijGV7G2TGBnd6Ys3cQUM7I4C7WLCTBYWYXAWKe2WDBp0smx6GAqzj83Ouw46yujx/71tH3KczMNBKJzfv9Iw4uF8Lw3O8Pjo1Qul87Vs9hjYGM5AmlEEVPIBON7XMNBebETNP9r05T3w+tO/k5ZAgRdev+98OavrY6yvxLpUR/ldhZkjOWRjDBCixFa5DBrzlTAtiCSKE9jsKRp1xb1WIzAjr0W7rUcs/gnE++shlivgdhjugcRqAYCJIyqYZdK5tgfmUFVhmDYTBdF0b33vrD9y23eFcDcL7k19VYhjsGTETAHX8fa8qMzsLhEIYBWI/xqCAKwBQWG26SNQAAjjJRE1xO+y9F6FBTsrvaFm9nRhQt++OWXhjo45HHblXfs+05o/yw1fsvt1rV7zIG0rhnk4HoUWtCM9Qzz8HSWGg8h7lr75lg7PPjmyXs/Ue4aT7/xwZ2efq3tNyI77jMChVGIvdLAWIyYcefpD82k0GOkrUfYWw17p8VaGGFpAd3KRAYF5beefdD3trxm0i67mA2jgwgQgSFPgITRkN8imuBwJIAxRfe/8I+dXo3ck/107UG2FGkM9I0EQGxxLPAMQRyBq4y1iCtLW49MIHAMQkU6CFkprGWEBQZ9bc1QytEvbnwxcxkq6QVvjmH5uTtt4V07qwJd6Pt7Ly5Z8uKoB/757Mxmu+FwkRldx2ORtN/A6tJouTE1jbi0AWtAKrTUFJrXbVZvH/K7H+35QLnz+9mdz459/MUV1weibm8vAOZyrl2ZoUmM04IUg6xBGQGE5DnWlFKmVywKI4z00vxVEPPQn7/7p8afO6vCpRPKXSddTwR6CIxQf9kHPAIkjOjngwgMMAG0+h1162P7rvDgrM7M6F1Ypj4FgQ9h6INwHV3p2YuwQg6KAtPRHV1oKIrQcmGcSSZDTaFOwr/FMkktT/4tY2AyRrePX6sKz2zC1h49/9CvPjfAS93o2yGbE+b/ZdvXfOeKAs99TYBjoaWIA1puMIZHgGIYfG5rl5bNY/A71nSOceTpt0/+xvUbfcNeF2AQ+N9ffW1eyJuOicC2sDMaWorQRodB8CiMtCtNGZelwqa2KgRXmoS4gNsgUUkpFKYRdLQ3L960Jjr5jvMPfrXcudH1RIAIDAwBEkYDw3mI34V+YxioDcIX/6S7/7nZ8jZvfpiqm+Ap1+Z2CmKs8Mwwycm0vpCxAEc4ABG+iCPdckIH/2K1ZcYgYvgVpt1L+KJWGIPEGDC0aAAWQUSrBVbCLgDz2vIfqeVnbnfw56+thh5q6FK79bqnjl2ZFz+zmDVKaxMWQMwUBAJbylpgYc80BeAKDoW2VV4qbLvkgfO/f0G5sTy4P3tdeNc5IW+czp1sjoWhFqQRs7QwslWoLXRaGKH1ClC0RuDEnhZQPnd1UDwKI1ARyDBaZnurzvrL7CPuH6hnjO5DBIhAeQRIGJXHj64mAhtMQCnFJ9/x5OYv5+NjCpnGU/PKqXfsHPhRCBGLgWEZaxQ0Cl1n6Coy/cKKwgjT8bEtBrqTfKzIzABsjDnC97Su8oPWInwhx8BjtKoosAX6dwoq6Fh9y767b3XyuTtt0VI6YRQCDz30kIA991xvHTXG8ASPv/IKX/fo2/rvbFQn72xxuj8z8qmev+dcm8FagILbrr8vwjQPeSxStmCBJ1hoCeb6Bf0nft8JBPNSbbytpSP65qd2azt6wlYmejk59p9z/2c7nLrrgFmfkhpMjFUKIOBCZ4OhFc0Iwghs6UU1quta5yPNp906cWJZzWTx9ofPe+CAtXn72kIkGm2RlEVgmJovtYtMt3FLYox0/LuMwVHGYhRi8HXyNZ1XGAYrRNeqc/865/DflivaNvhBoxOJABEoiwAJo7Lw0cVEYMMJHPGrBWNa6jab3mbX/ZCnxtTlQ8YkR9eQyTTDH0aRNCfVbjL0yOiW8hKwHLR5IaN7DC0V2McdrzNlByM0UmjDX6zHQGGERQix2GAY5yGO2t4MS7hLAAAgAElEQVTORK0XfeejH71p8oStuuvqHDf/rq3eKagJwETWsl2MmxEyCgXjts0US8fAc5yxlJRCSC5TWFIImBQK1ZtkgrMUZ1xxhRUXMeBGKcvUEVAYHY1Z9lgF0VJKCikll1JaCn1NSnGUeABRS8pbd828g4/43bbbsu4CjTN+92Tt0nfWTvUgdaqTrauLZMy0Gw2LW8YYkI5DYPaeAOm1QY3yFo9tZN//zdET1hNYfUlWmHTVot1WNMtbApbeXFkZ7b5Dmx0eGOeEFqOekgnG1YZfw13RpRK6DwVh4LW5YfPMBy485HISRhv+s0JnDjABchqsB5yE0QA/f3S7YUZgIz5QLvv38voHXnjz9EJmzEn5KDVa2lkW4osWk791jR588RpTjS7cmLjXzAu5JJao+G8F3bFHgdBJ5Vo88Ri7v2PrCg4hFka08IuFSObXPLapUzj/1sP3eqzYpuK4BQ9st7zLurQAYhcvZm46neUM27TKmFncYng5AGeYGYfmLNQkwCKdo4X/W8oIBhQgyZ9GsCTbXKy6VBQM+KcpgGhOiALPbxLB7Ttvbp0163tf6m4Ei+Md8Ys79miN03N8SO3M3CwPYoAgVOCkMxAEge6lptcceZAKOv65ZT3/2rWTvtFW7hN24ty7t17R5d8Z2zU7+spNMs2MRU7HF0kMfjf7hu5PnT2IGYNo3cO4LkBbEQo3XV7AD1vevWjCZYf/pBrcmOWyo+uJwHAgQMJoOOwiraEqCKAr7dhbH//CK53R+V529DdZrkGEOsjaWIpMjSItMrT1B4OstWVEW5TMErHYoRY/2lpkLE0Y+2IsRvgi7hFG2iBjWRBKH5gVKh60rrVa3rlywlabXzJz313yON7UBYuz/23tOqmQGnNmYOfGKLBZFIRgcQmug32/sAWHKS6p59Rdz8fMR1fiNsJovT+L8y1uTJLUtd4+6bmHEaTCtmca5OpJfzjz4CdLT7jyweeb7vn785NDp+EkSNU0xBgAHQOkUindLsR10L0VQtDVAjU8fGnnj2+996zvfPy1ch+GI+cu2nRVW/hHaWc/J62MDrmWDA1lKOiSWkZJvJepJWWKbWprnQ4UVxBrHApCvxCkVfvFx336oBkTJ7Ky3Xzlro2uJwJE4MMJkDD6cEZ0BhGoGIElSlnX/u6xCWtqGue3MGsLgR4nHcCLHpmkanUiNLQg0k1MjWXCWCvMVEz1ZRNjg+/kSBiBxGN8eXOwIiNmsABhxEKwXAYQtKhRLFidK7Qfdstxe3e3Cpn+4LNj//Hq6mmQGz/JC60Mlg1I2Qp8Lw+2nbS4SFqQhIniKYozHYj8Xkfy9aJgQmHUWzzhZZlUGvKr3y7UQtuNH99q3JTLJn7R5L0nx9FXLd5sbZy+uC209o+5a7uWDWGIAeYAGHmkZGBS6P32lVkrmFwj848G7R2qqSkDH9t2W9jxU5/qniAWzc4UB87n8XomUxkF+TzkM/idDPgc2E1/+HNjS0H+VNru3jHYTjF+Cy9FV5rOCNStSVCMajuRzkTTAldFWjwV1SxTMuxa8+bVH02Jc397yZFVUYG8Yg97lQy0EUbfKlkRTbNcAiSMyiVI1xOBjSQw+4FX6/68ZtVv253UPjbPCRPIq1+75mVbYn3hWEcnsSAZyw26aFi3MMLsJ+z6roWRfjHjSxurRaNqEADcgkLkAbdRNBXA6mqO0kHH5V/K5s6blcTjoNvqW/Pu2Sfvjr4qFHVbCNsFR0QQBXl0ohkhJrGOkjKWKX3/HvfeBwmj4vfQ2vJewsj3PBhTn4H86jffHJeNjr7plH2XlMbi4Nx+cOVD31sbONfEIjvGYgC+70PKtbU2YdwGB61ihRYPwq4nXQjfsUTEZOQzyxLacqMQkOIakJBSiRjrPMXAWMxk7EsmBAa0M8UdZadr2ermvMVT7me5k9lGKS60NahooUtKJRRju0wXOxNWhUwsDM5O1Cu60pTCip1tv7WCN89cfNmU5o18VOh0IkAEBoEACaNBgE63HNkE9Mv+5oeObMnkZgdRemwMLjMvX+OuMi4yI5BYYqFJ6i0nbi0UR5i5ZoKtTX0j8+5Ha4XO2EITk2I6pR+b0RbCAtTmbBCFNiU62v7VIAunHHzi3k9NZMa9M2PJsnH/eKXjl128/jtSuLbndwB2uMfkeBM8ZF7+WLwQj6LbTwceJ0dp4HHRldZtMUrsNusHJwNYKEr8PPidzeEmbnzTt7/48WnH77r1qtIn5OCL/rTlal57HcuN+koUSlt3r4cIZMwhjDAiygIpPcWlH9mWlIJJhi5A/E8pnri1MEIcM/6UbjGiLT9YJBMCsBwBXhBBiGUSJAcrlVaRxKYszMLyCf8rivRO6a9r4YU90/ArOLYuvFn0mCmQ2NA3aF1cA22n/HH2sWW7+Ub2Tw6tnggMDAESRgPDme5CBNYjcO7D/xr9j1dXzZCZTY4IIFMTC8GKdXF0oLUOtja9wfDQVa91PItJP8NK2Fo8JfWN4m4/G2awcR2AjSP4sYRsXT20dmAiWgB1NgfV2Rqku/K3ZfzVF9xxtik8iGLt+/MWf6mZ1V5u1Y7+ZCGMLNsRABEmikmTlaUtW8ZahFly7yeKSoOrdZXo9zoSq1gcR2Brn1gMVr75tXTh7TMWXXDU3aVWo1Pvvdd96T/h8Z7VdL7kzmjLdlkcFkDgnJgLYRjrsgSW0F3ttUUJBAeONY8weU6LFmRmYrmQK1rW8M8w9rVLjlk2yFhBHMfgpjPaXRdGeGViMUusQDofUMd4FZUejmJpPnp8QGGUpPSjhU3GYMv8s3V210kLZxyCQe/vA4R+QPpCoC9Zh325D10zsgiQMBpZ+02rHSIEliplX/GHB/dZFdWfW7BqPhdwi8e6eKHJ8kKLDFo3WIxWDaktScY2g4ExKE7wRYwvfJPOL/Vl5mVvgoSNiBGWA21debAzjgkcDn1IyVCyQtcrDX7LtEPP2HtR0Wo0beHSuqdXNE8ppBonxSI9RjLOhDYoSQi05YSDkMJkzwFmX0WJY6nnXd9tEUoEUTErLRFfegWlWWs4VxQymUwGZL6l3c6/O2f3j29/+ayJO3YWtwpffodfvmiXlZ3WTyDb9LUQ0/9lBGnHxfqXaJUBYTGIAh/0/ZgEy0mBH0bammTC282BMVhFS5uuEWUJ8DwPXNeFKIrMWFpQmcy5nrmaQppFN5keq9sKhsU2i1lrWPEaBZURtCEKIx4sj9tXTH3gsuPuKGYDDpHHkKZBBIjAexAgYdTfjwVF9vU34aod/8q/v9304LI3jmq2a6eHtt0oU2nwFUAcKUgLGwS+xDG4mqEwSmrkJBliGKitrUqYtQboTlM6+BrbgGhbEQZL44sba/Dg90zVQW0pETICHvpe2m++cbet02fP2mfX9kSw8P2v+NP2HVbTT31Ruw/YWRurN2NVbt8yMUtuZIGtrS9YLiiCWJreZaUHiomiaCh+vdRO0hOQbTK40DqDQeK5lB2Hbe/+vS5uPf2u8w5ZWjrmVUuW5e5//MUfdIqGi3mmblToFcBxHC08jFzEhrvmvlrQJHWOMC5LS0ZdEypRMroZrIYDsS43YALZzYmJGyzJ8CtdS+mHpRkLbUUMpDLCCL9k6bLl2EDEjKPdmB3r1qVk50Vf3G2XebMm7hhU+oElq0mliQ6t8Wh/B34/SBgNPHO6IxHoJjDjyXW1jyx75eYoW7O3bzmsU6JLKKXFBwQROBwje2ItenS9nCQjDS03KI7MF1A4mRd1t+jQbSs4KM5BZ9xr8WJsTrqHWhgoJ2p/a7yTP/73x37tz8UJYTuO+37/5A/ebhOXxE7NR1CQ+YyBh8IIGKQCR3e6N8LIuNhKhdH7iaLegdc6o87ICTNv4UAcBlilO8/aVjz2zc9ueex53//8W6WPytyFb6UXv/bc7YFV8y18WSi07GBsFRqJUEQmAdIYS2Sy5dYXbFjzCAUS3tmwQrWEPdeS8xJRVLQKmaw/jPP63wdWJrWadLC74hACZhdiX7tIZ6ahoNVlFIBD6HcWssz7/bi0e9ZvZu3XXVyTfgyIABHYMAIDbV8gYbRh+0JnEYF+ITBjhuLPbPXkuSt9da5oGpWN3Rw0t+UhZ2cghX3T/DzaNSDmSfXHRBhZcRJ83W0NMVYl/dpXSrvijLUErzYiqXjouKQ4BhHnvUzQcvXH67Mz5h1urEZ4zP7bq598/Jk353ex3BfAdsEXFuRtYzFKBwysCCsK+WjrAcltU8OnJJuut2Wlx+XUk5lmhAtm0EVgWdh2w6ThO46jeKF5ZSNrm37SlH1/N4Ex9CUWx2eHzL3vvJY4NT3idirilu4bh/cvBoNjf7hiKYNiELsRlIk7Mqkmbliha9BY3ozLrOisNJWsi4eZf2J5KlmrjjdKxFQI2COtRxgJzBZUmC1ogYz8iEedzzS63g9u/emRy/vlQaJBiQARqBgBEkYVQ0kDEYG+ETh54b92e7Gl9TI/U/fpDpF27VQdqACAR9i0FCs6xiCFqYSNh65TFJtYH/PSVyB58rfEXaTDtLvrIiUWFG6CtzEuCVPJuQoVizpeqA/azj/xWx+9e59tt9UtOS5e/J/s0uffObNg1Z2aF6lRBdvR4ghNM06IpQCwwnOgLVXY0sS46cyhf7MraYtRGnxdGrdjpIbJosOSBFihG0sLRLECB/yoJmq5c8KnNpt85l6fXM9qdNSlt+/6Vnt8NcuO2t4HywaRSoor9ggi3VYliRHSNYf0YZr0otVIi7getdVdPNOwTaqH/0+IdFFYYpYbuuwwLNtYhnDEiOE8jDCy0GoERhhJYaPFSeXbV61sSsl975h92D/79pTQVUSACAwUARJGA0Wa7kME3ofA42+p9Nz7Fx/cbKXPk/WbbtUZcMalDWgrcfDFritb97QIQavI+wkj/dLXwiSJQUr6evXE/DCQOuZIaYsPj4PI6mp+eAurcN6NJ3/nyWLW1Dm/f6Rh2VtrL/FyYw4pWLl0JIyryMI4nqQlBlpaYkzpKjn+JwutpH6RFkOlgkPH8UidCcYtWwujfMEHl8eQCjvfycbrpvxp+sRbSzO5lixXqWv+cPux7az2/wIrM05G2JS2R7ToPmbdlcFNMcae7L0eQYRWtBI9Z8RSSasS7UZDAVT0oyUWN3S/mXAtUwVbCyDApr5GGGGMkYhDsFSoxwyYBdzm4Hc0t/Nw3Vl/vfy4+ZSZRh8FRODDCQy0+2y9z7EPnx6dQQSIQH8TuGjJ81v+Y8XqWW974hCndqwtQwdssLQIwf9QGKE7zcTwcLAjkTSQNXEzuq9ajx2kWxjpStglzWnxehyn6F7C0GGeb1+bk21XHLrHzpcd+alxujozxvAcNvf2vVdboy4r2DXbKJ7igBanJBUdSwIIhVl0yf0TK1Gp20wz65WuX5qlpu8jI/BDD7LZGt3/DFtsuFgZIN9WyMqO6/fa5eMXnvrNT6zXQ23m7x/Z7snl6y7weM2+rkhniun4RnMV3XpJqxVtGStWgTIB17pgZnJe1KtLR9GtVlxH92+OKIxw+SZIyayLYTwRFtjkELC0zii0YhNj5MhQ70vIbQgiHZPly87VV4zZo+bcWydOpNYg/f0DReMTgTIIkMWoDHh0KRGoFIGFC5W4JX//t9eozNWhVb8Jhyw2sddZTyh6AoGCxtwNg4utkOlXe4ztZouxRegqKv5EYy0jlAGxiTfCIGEtCHQVbSwImYwlY0g5LO5qWbV0FHhH3H36vi8X13TNw//d5Nan3vyp7zYeCjyVQp9QLAI9hiUzgA1kpQzXq2dUFBbFMXpbkHp/4GhBJ1G4CAgjX1thsHxSXOiSNVb8hupYOe+ofb529cQvbtbdKmTJEmVd8dSi3dui9NWCpT5heplhdhzqFbSIFe9usvCKViMdc5R8s9j7Dd2KupVKt0UoCXBPhjClD8w/SotWmsrXxmKEd/A5CiOeuBnDbmEUcwcKYQA2KlR/3a1u9Mrx982b1R3PVannh8YhAkSgcgRIGFWOJY1EBMoiMGPJP8Y99Y7/2y6o+UoUOY7gKW2ZQNcNtuJAYWRChgGs2HRz120nSoSRNmZoG7QRRhCZlPIeYYStabH7eyKMsEZR4KH8ahnHwqmHN71748TEorF0qbJn/e2Ow/JW0wXAa7fEIpSByGvxYckscGUDw2AoHR+NrjuT6aXjerSFxfxZWrcI71oag4T3TmXS0JnP6+awKvLA4aDnHHa2+fVW9HSj8E647qwfPFMK9+d3vlDzt+de/00E2f1iZmu9EzPM38Ng7ETI6Jw5tNYk4gatbbI0i65YQFOZqZbcoFQoFYO4jTgy4tKIJFOvSFuGdB0jtKIlYkxXJAfwIwaWg8UjA/Da3n20VrQfct+8094u60GhiwePwGD6dwZv1SPuzsNeGNFzvOHPNLHacFb9caa2hLz24NHNvGaKcBu3KXiRhRlbOqtM2vpFqzPRtYUDtGerp/3E+oJDv8QTN1axr1npnLvT5znT2WCu4HHK71y8uVuYdt2xe/63WIjwjF8/sPXzKzpPg9ymRweWXZuPWrFlBtj2aPDzPtgMe44FiRAzwkg3UdWyrPincT0VY3qKriwdqoMVGjlaopI6SyhtdP0mBU4swWVhp921cs6+E8ZffPSECVgjQB+66ONFdx23KshcDG59rRKMFcIIXDcFXiGArOtAFOaByYKuiB0FAWTTOSh4EXA7pe8XxQFY0pQMEJzrQpMcBNiWq91fuiFKUv9Jy1AVgcW4Rh75gS5K6UfoSkOLF7o4S9abFJXEApNeiFa2GMJ86z9rrPxh919+7Iv98fzQmESgXAJUM6n4S1W5JOl6IkAEugmUKy4XvNIx5tf3P3GyTDedJFK1ozAw2bQBMYUIMd6ou3ZPUom5GCi83jb0iu3pfU5xnlFiJpFeABnptaW8db/efrT1i7nH7KWzwZRS/LRrH9/qlY7oqk6wJtSOrnHWtXVCHKcg5ea08NDZWSXupt4WIj1O4sIqxkEVu9Gjh0nX+7FMixFsNaLdf1KYRq++B07U+o99d9/m2BP3+tSy0jWedOkdm73ebv+yQ6a+kamvdVs68uDYaajJZKG9pQUyjgDOfD0/FUtg3IEwwgw+oYURuvBstPpgXack9ghdbAzdcrGp/YRVsHEPdCafzjZj4NoO+jB1KxKJ6pRFOuha3ydpKGtqZHOQUaCz7rAxr9/R/Cp4K3+45OoTH6MfGSIw0gkMZRE27C1GI/3ho/VXFwH8sDjutw/t8FKndTGrGfUNpasYJm4pXApaXrAZRxLwol+/pT6gXoLog2J88LJ86ENtOguqy4MaAdLrXPOy5a+ZOW36QbcVawhhraWl2fuOaontC51c7ZhIcWY5OQjDSLdPNS6l5DetJJYJBcZ7WahQGBVjnYp1hFAYYct7/BOFka5FhFl5UkHaERB1rF5bo9adPfGCwxcU25fg2NhW5Wc/XnhoS5w6j9m5rYWb5thYFlt7xL4HuWxaW3a0ALJdCLHjK5YX0BNDAYQ2IaaFD5qBXN0vLdb/FtzWfc7w79jejAvQPdWi0AfBuD63UPDBEk63MMLA9N7CCOs0aWHIBEDYtYIFLSc8OO+oe6rrqaTZEoGRRYCE0cjab1ptFRBYuEw5Cx7/2ynrVPZ8x6mt15Wl0V2lRZDp5I4VldHLI3R2VE/F6/frat+97JIaQzpHy0LLjALW4YHDImjPNxeaUtGC7335M+dN2mX82uJ1B15yx/adTv28jtD6ip2qsVAw4P/o6jMyIzmK1aN7BTMn1qfuzLlidh3G/ODFMcdYpdgUpsQKBbGt3XNe5EHGDgOnsGrhnp/66Myzvr/za6Xp7geeN3+rLqt2asRrjgA7W5P3I22hyaVSEHgeCO4Y955wIUT3GJY9wIBr38xdoVBCwYQ9zSy08Jh12TZmk4XAuBFQ6EbDr2F17jDwwMG6TnoPjGXLpOcbVxoKVy2+MHMP1xbH4GMVcxG12KrzjM9feujvZrEkMKwKnkeaIhEYaQRIGI20Haf1VgWB0/741I7L1kZXh7xmN8kFFzzQlgu0pKBVAoUReqeYzugqhlL3xBUVF9mdpFYs/JhYl0x2GkAsJcRBCLXCgozrQJffKSFsfSnnt59017QDlhTHuWbpiszt9z18smrc+qz2fDwqZTOGvcqwIKNJl+9Jli+tB1RM1y8NuC6OiQHOPLa0pSgWWFvSCCMtGWQKpM6CY8CYr7i37p2M337d9z637cWT9t0lXxxjxpIl1rN/feczeZW6Wto1n42xoCJHV1gINhcQFVAUWbqnG7MYcIFWLgAoeOA4KQiQHxPa1WYqcRuWQnDdh42jAOIWeIGpS+RYNkRRkFTsdnRfO+SPrjTT0BeDuFEwYUAY1+63bpElg07w1/1498bs5bNmTax4z7SqeLBpkkSgCgiQMKqCTaIpjjwCNyxfnvrTva+e02Y1nBIIp9FiAUN3Dvb2UgrLPqJLCF/KvXqklQgfpPY/P+C96wrZFrBIAmANId8DK21DVOjoEn7L/F23GPXj2Yd9uaVI/+Il/93xj4+89tNUwybfjr28pS0o3FiwihYh/Nt7CaP32sGiMNL1qEUBFGaR6RYdApS0IcYebbqudAzSa4+a7Oi/W+QKP7jm9B90lxTAca9ZutS++/aXLo3thkksm3XyfqDisNDJpPRSPCUEiKjT8xWwiKXTggf5DpRdiqF6YWg1YspiFouiCGuF6/kHUWil0lnZ2uUpO5Wpc52cG8aKcV3JmmmrkV4/Wrd0nShj0dP1vHUfOIxaMsHlKCBjJUHGnh8X1lw1Snkzbv3lyZ0j76mmFROB6iBAwqg69olm+T8Eyg1zXn/Ayo5Wme064+Yntny2Vf5fl50+0GasDl/IplwjtudAgWTagRSbwybqZL2b9+5q3zsI2/M8kyaPTU/9EGrSKYgjH5QsvM67Vs0+/rvb3TBxR9MRfoZS/OXrH9vjldX5S0flanfyw1hgnZ4YqzsnlaK7b97LQoWtNtY/MFUeC1hi5pcEKbykTQlmtWGwuaNXVlARpDIu2Aygc9VbnVvk2P/dfO53rixmzRXHPH723V98szm/wLNrtrJS6dgR8o9eR+tCke/ssh2uYqmU4DHbZputoNDRqrYYV8+sCCBQoQqlZK7IQhgWlGuloJD3WXN7Gx+16abqleXvpN55t/XwTM2YbzMrnQ4j0C44LygYwQNMx0JhG1ktDrsb9hqBiBlvuD4UeTL2YiE7bodoxeQHrpzWXbSyMk8LjUIEiEClCJAwqhRJGocIVJgACpGlv1q8e4fVcLFi9ueYEDrOWqeQYwwOvpSTqte9BUnx3x8kjPCHH8WWDj5mDBxbgOzsgjgOQTh2FHetWnzMnruccvRum7xeHO/Ue+9133gte1ZHR2Eqt9N1sZUxAcclsUvYp6z3/THqprtEQFIcEQWQQIGHuXYMXWmYkYYWI/O/rt/EYh0EjW4pR4UqG3Tc+63dPnH0aftsu6YU97TZC+te7pDzWmRmP+ak06Hfdcuun91m6sUTd1zZe1s2RgTfsGR56o93Ljmzy0udna0ZVYuOONtNQyHoBC6wwKUZHYURCiSduI8p/brWkQSHcxOrZNsQhZ4UsvNhHq48ZfFVU56r8OMyCMNtDMlBmB7dkgj0kQAJoz6Co8uIwEAQuG5ZW+PtTzx7frtMT4qYkxYsCRqOLODcWFtKg69LW3CYAOeeWb5XGj229Ygg0r3TMFbGjSP9gveAKxF1vvgRNz/ld6fsvbjUQrP/ZXfu7oX21SHP7BBZaQYMRRqmr4cghK2dSFgTyBRsTCxFxVjjbleeyaZTugwBWlQwowsLKFr6/hYqDl0V2xRQZAytRhy85rWvbVrHztjzW3vfP2kXZsw0AIA1oK68/+r9vdRm09sCuZ2l5OLvfm3XM6Z8Y9xr5ezTEqWsS0+edyjYoy90s2PGFyLOsJAk8Fhnu+lpomMT246gXsU1MdOnDsUgViHAWkcojGIZqLjQ9lqWd514z5WTHqSeaeXsDF1LBPqPAAmj/mNLIxOBsglg+v6hv31o93c609fY9WM/0dm6jmczGQh8EzRcVD5Fa0zvlhy9e5eVBmPj9zBhHV/waJnBF3wqySoLlANM5vOZYN3NjeHKn9x03nFvFBfz6BpVc+Gvbp8eODUnSzubK4SKYSYYFkbEP9GihVYonSavxVsxotq01TCCrSdgHMeNsWeZrpLN9JIshQUWMRg7AstyoKUtBEc40FBbE65b8crfmnLezE/++LAnSrO7Tpi9sO7FVa2HublNzm9rWbfyO1/93Jnn77/DX8vZBM1/6i9374rq50a8bmcp0pg/B8JRxtoWxHq+QpvmjMUI/y8KIwgj7XLLhwFYLpYgKHTk174x9RN26oZrr53ULezKmSNdSwSIQGUJkDCqLE8ajQhUnMAV975cu/id5rmrPDgo6zq5OJSQytVBZ74LbJ02bo6ihajUrdX7B/x/Y4G4FjDozsLAY7RI6aBh6YKSgVSFtW80QOtPPn3uQTcWRQiKhf1m/maPvNv0c5Zq3FkKV+A9seBhEGD1aRdSbgby+byuKG3mZixHRUFUKpbMCUYUYWkC3fRVBWDLCFgUAFMMnFQj5L0QG80qwaN2O2qbPzrl/eT3sw5fr+/Y1AWLxzz7wtr7PD/+iBu2nL348tMWlGuZ2ffkuTtErGlOpn6zb7b5kRUCAzsroLOjDXJWBrg0Sfp4lAojbUVCgagUSIFZhApLZvuu6vj1uFR0zvVzju2o+MNCAxKBsgiQexTxkTAq6yGii4lA/xNAIXLIr5fs81be+oUr0ltyx7E8yYBjQcKiqyqZxntVuO4tnEr/rWN5dKq5CeLGOj/akqQsXdtH8MCXXSsf++TomkMvP/7rq4rXzr1/WePDT7940lrPOt3Njmpi6GtDC0qkgHNLZ2x5nqn6bI6krGJSAFJ/SbvXkqat2AhOWablCRowBrwAACAASURBVIQ6ZgeFhaWLSApgPAMBxvBg/A6EsYzyz4zNBkfcfM5314vVwfT9x+967o/czu0ed6ye+cAvz7qqd6D2xu7YgZPnbhpZ42dGVuMRzR0Ft37cGGjtXK0tRinpgCXRQmTKHxSFkdBLi4FLqatnY1kAL/DBtnncufaNJz6zTf0BV888cvXGzoXOJwJEoP8JkDDqf8Z0ByJQNoG5j7+VXrL0+SMju/bMkKc+2hkEPJWrgShx5RRvoH/fKw1+7pWeXxqDhNeUCinTbsS4uyyMnVH4lRh43NHlemuv2PdLO1148oQdu9PMj/n5zeNXQsNPQ5E7OAzDtLAccBwXfC+ECJvXujbIpBVIqevMxDqZ5rcYI4X3c2Jbtw1BfRRzbK2BliKAjLLBBgEdnR5YrgMiY0NbRytWyM6Pzqk5B5/zrZ+WVsPGNR12wbX7tQdipt/e8pcfTz565q7bNpXVzf7OR9fUXH3TPSdauXHTA3DqOsI85Opd8P0C2KENQveHMwIPs88wxghbnWinWhiZSt+WYwpyWgC2KryS5c2H3DLn2KVlPxg0ABEgAhUnQMKo4khpQCLQPwQOu+Lej6yN0zPyIn24k8um8n4ANjcVoruP0uywkkaypTFI3SIK08wxYhikrokUY4abNnsocNCNBRICbQMJlepY88ROmzWcetUxX/tX8Xq0ZO174d1f9e3a33DOP+KHEWDTVAwKR7eam8pogYTaaD0XmjZV9wgjLhk4oQ1Y1ygSEQQsBJkER7no0vNjbXmyHAGtXS1guzbUZHOw8vX/PvTpj9Uecd1pB6zXrf7cK29sem55YVYU+eLH044+f5fxtd0VvPuyMwsXKvG7h2/8dsgafiXSdeNDpqCtsAZyNRlgAcZEYXYdMsSK5Fpu6gBy/FpaWNBZyIOdyoAfR9CV74BRdakW2f7OKfdee9JNfZkPXUMEiED/EiBh1L98afQhQmAoNyzcUERYyPCexzoOaHdq5jDH2gyrMVvM0cKo9w9ysUfaewmi7irVOsjZuLh8gQKGA4uxtpAEWwa64GJkoTVEggj9NRm/7cdnHvbp6yZstVV3l/uj5twz7oX28LJspmZ/4JaDwsrBDvcetvgQJkBcH+Y+3cHhaC3SjjR0N3HIBI62XgU8hNCKwOf4fQF25GKPVi0ysHdrxD3MYdNFKaNCx8pU1PXz03/w7ev32bXHKoSNb79/xuWfk1xM2G7cqAVzph1Sds2gg09f8IWOILeApxo+FnEUjJ3G7ShNaxAtjFBYgoAYLUiJMFI+Bl1jgUcLlMUBBEChdWVng53/yeF7Nlw6ceLE3gWeNvRxoPOIABHoJwIkjPoJLA1LBPqDwIUPvt1037+evRyytQeBk7HiSHRbLFDAoMFHyxBMKU8sRt0ZUombrdhEFdtvYJ8vHdVjYfFI9GMZYSTA08IILUZo9UkLO3YLbU877a+fsmjOSU8W14a1lpZddPe3VnWFP0vXjd5JotmEMfALPmTQ1RfinHpahhhxhFUQk4KIut8bBzdytPspFAFEQkLATasREbtgKwG2YFDw2gEsLAnAIPRCqHFtGRU6npct78yY/atT7tqF9aTv47xenXnDp7tWrXv7T1efVXYsz4U3/r3pyb+/fis4DRN8yUCkIggiX1vISj9EpS5OybXVTafrSwWRkoChYFbKBT/Ig82jwIk7b/3KztueOO3YL1EAdn/8oNCYRKAMAiSMyoBHlxKBgSaAL/w3b/jLgS+vCy5xmjb9SEcBwOIWpHVvMAaRDEEJC9oLAeRytSC9QNcE4oAWHHSXJQJIOSbYWjenxRx6TKtHNxpL0usDUDrYSECMmWbYT6yztd3Jr56/62abzZx18oTuWKOf3/zo+AefX3l2nB19QhDGacyUw15laScNAQYNJQUgdXi3jmEKwVK+yX5LhITQRR0xgBkDrIsh2eYCdFVp1xs2f9UtQrTCw/OVzaPOwurlfzj2+9/4vyP32mY9AfTLux9puP+Pi6K7rp9TtviYsXCh8++H226R9vj98qEAN8WwLpEOwDbTQYYoAEv61UkFtoVuxRCb0oGTdsDz88BUpLgM/7zX57Y5dMpxX2we6GeI7kcEiMAHEyBhRE8IEagyApiS/nIHn7XSE0fatWMzTAqw/YKu+eNj09J0BvLYDzWUkAaR1ATC6BcTRyTRvaWFEX6loAWTbs0h0fpk3FsYAK2LPmI7McXBxvpCQUGqrrXLGzPR1B+cO3FRMehZKSVOueHRXV5a7S9Qdupj2mISRxD5EQg7g13JtLtJW7J04HUEAnwtbrQgS/qKlW5Dsf4SlhIwVqaeoPJu9yCKpTiQOct7I+evPPGmn5+4uHQMdJ/OnDmTzZo1a/2iSX3Ybxzrmydc8iuR2fZ45tRzBgEEgQ+6f50GWbTQ9fSK0+UT0CKGYi+KwbKxJV0AliWwidrSXT+91cTzj//C8j5Mhy4hAkSgHwmQMOpHuDQ0EegvAt+de+cuXaLmKg9yOyvhCFcpsAWHgu8Bd2wAy4XACyGFcT4S099NWHCMvbtQpKAwwsrSuscX1tvBN7zpedZdiRq/rxhY3Ablh5DBgs9+mwRv3V/23H2nE8/e55OvFteHAcrz/3v7BR6vmQLCzeFoNmZiRSbF3lhTioUejfVHS4n3iI/CL3dny0nT1LV4dP8ds+0w3R8tZH5b3OAEtxY6W4+6b95p2FukX46jZ/5+6jtrnZ9GkNWBT46D1ayNSxDjpMxR9GWarnZaNzEJEcaD2fhvBpwzWLtu9aujavhBd/zq+H/2y2Rp0AEkQLV/BhD2gNyKhNGAYKabEIHKEpj+26Wb/POdFRf6qYZDpEi76KrBwophrDvDg3Bc/RLGIGWsp2NcUSiKksyzogVHCyOevNg56Po7GBjNIu3SKgqjsOBBxuLgxHmQheZXP7ZF06m/OHbP+0pXdeTcO77+Rov6Nc80fSQMI25xAfifOYxwQKsWijNsq4ECTRdB7IWmtJWJwvb1ybFeP7YkhgddVTLoAh62L2Oy84B7557wUmVJ94x24kULT3j1HbgcrNoUCiIUOGhdM+sqrtNUvS72i1ORqXytm/TKCKLAAyE4utfeHN/Ej1ow57Al/TVfGpcIEIG+ESBh1DdudFVFCNBvWn3FuGyZcs674+YDgvTY6YFTu2Mhxto/FrhuWse0oKDALvBaZJQ0cMWg4KJbCj1c2sulsNo0WnUY1gdKhBFmWUldWwj7n0k/BgezsMICqKC9k6mOq7bfvGHOZcd9qztG5rifzR+7vMO5IE6PmVjbOLZp7bpWlrYt0xAWY4V0ODX2ROPgc1eLLlu3/TDip7fwKf1asRnuejWasM5ShLFMNniFjlYWtc3Zfusx1807bZ/1Gsz2lXHv646eueCrb6yAP7nZ0bVYfwnbnhRjjIrnYpVuPIofrDIM9T6gMEVLnIpRiKIVDFaPq2en3TB74h8qNT8ahwgQgcoQIGFUGY40ChEYcAI/v/OFmsVLn/5hnGs8n2frx+QjCbadBhYzUGEAtiMgKrZ/x6YVCpuzouUGU+GTrDCwut1ZpuJ1sSK1qTMkY276n8UmVkaFXeByJfPtq94QQeecL++49W9mHT1Bp+9jHM4xl9663VstMLNDud/L1Y1yVBhpYWSsKthsNdbp7CiMMFvNkpEWTO8njHoERy/hpOOOUKwJ8H0PM78wf/9lFjXPnn/F8Tdvy1jFXWqTZ9+0w39eLSxRVsNobQVCC1wSh9UthoppgYn7z+baOgRxFGiLnmsLCAIPOjs726yg7fwHbjrtynJblgz4g0c3JALDnAAJo2G+wbS84U3glHl/Hv9cc8cVrGnsd3zmuEra2i0mtAvHgkIcJlYhk1ZuxejqiQBjZEz2V48wYtL0STPFGJO6PImLCFt9YBkeFUeQdrCNfMELu5qfGJ+T59x49oFPFV/uS5Wyf3n5ou++0SIvDUTNFpwVywkkXeh1Ww8GIe+p/4OtR4rH+zbDTU5Y32IkQQYhpNNpbCACQdDp++0r7ztkv6+dfOo3Ny+7dlHvJ+f02Qs2f/ktdVcs6j8phM1939fWoFLxhqss7VknMPoaD7ToJda4KAow3Nx3oDD3M+O3umDWrAkmAIwOIkAEhgSBqhFGw6FA35DYcZrEsCKAPxcHzb1771XKmhfZNVsDpMAGByD0tKUHixFiPA/2IePousJWH7r1BwojCbEuUGgsRTreR7cQ6YnrwQKNGDwdRRHYXAC+1DEV37E5WFGhk3vrFuyz+9bnnrbPrt1tN65auCR31zOrrvDsusM4TzvoqsOaSUV3GN6vaFgpbVFSFD3aCpPEW3cXoyzZteLXcL6OEJDvKoByUpghplTQ3u54K79/37wf/a3SlphjZ1zX+Pa78obYatjLsTNuhEIySdfvma+ZaLHAJiBTzOxLxJ+wmHbBxWEQB13rflfT9dapd91VfjmBYfVQ9/diyIPf34SrfvyqEUZVT5oWQAT6icDRV92x2bueuNznuX2ZlbN8L4as7ULe6wLm2t3CCONfbN3Dq0cYAbN1/SKdQp8IIxODlHw0YHyQbhVSzAwzQdw640qFKuxa9589PrnFMT855HP/Ll3eYRct3O+tNrganIbRlp1hDmfg+yEANpgVDKTXBZbNIUp6qRWvLa3KvR6uXj3f8DwUWzZTUAhCEHZKB3VD7MWW6pzt5NouXDRzUr6SyKdevCC77KX2i5Q95mjF3BxOqWgR6uk5V4wxMm42DIA3RyI2k4a9cRxLIfOPpGXzj27/zdQXKjlPGosIEIHyCJAwKo8fXU0EBp3AkuUqNW/hbce0xPY0sOo2s9xa5mMWWS4L+cA3wihJxbciE4wtWWRiiNCVpnPGIkDrRjHOSBX7ryV/YvaVafpqChnqTDaMGYoLzbyweta3PrPV/CkTv1gowtBFH59+/fLAafxmrJwabA5iWQ74EQPOJNTa6AYrQMQc7Vr7IGFUakHC80xAOVqgTD8yrHWkhK2DumUcAJNdT/PCuilbfGrnR6+dtIsJpqrAoZSyvn/q/BNi3nR+vhCNzdbUM13LaD3rVo8w0ly76y8l9ZhQIukMNaks6b0qC+9Ouu/mc/9agel9+BBkKflwRnQGEShJniAYRIAIVDGBny58fNOnXlt5Zqtvn5DKjc5KbkFXwdNtKMyBlaWx3o7SL2t0o+kgbOyPhq1EwARBa2uRxDgkTD8vtvIonlusKYQmJOzRFgPIIFL51Q/XB2vPv+PSk54ouq+w6ONeU6/6amyPO8/KNu0Wx2ALkYFCzCAOCtBohxD4eQA7rfuLrZeR1qugo5m9OUpjkDBCisWRcRnqFPmkCrX0Cvn2tbc25dRP7rrsuFcqta3Yg+27J161jy9rZnO7djus8IRjr+f2S/6xvljqCWovBmxj1iBX3ioRtp7znS998feTKijgKrVeGocIjFQCZDEaqTtP6x52BKbe+OBOL73r3dgR2TvFdoansnWAAcLdwkLGJi2/pJeaLrSIwdZMVxdKavCgWLJNtpp2oWEpABOTpCWKYoBB3magQLGwo7VRdN4yvik6Z95ph3fHGv360Rdqrv/tA5MyjVucFYv0mBhbg1hZ4CqCVNgGFvZhY65uU1J6vJ+FaL2TtGsNVVyshVEcmHgfzgVIGSvPb18VF5rP30GIG6+9dlLFrEbfPe7inTpk/dxMZswesWRWsX1vt7BLhFF3jFFS7bsolHSNKMxmQ2Ekgw4Zts93nI6Zd10/rey2JcPugaYFEYFBIkDCaJDA022JQKUJLFy4zPnjGy9Pa1fZyYFd1+CFKBTQ5QW6LYhJ00crEOuuRo0p7xhfhDWxdSXp7n5f2DKE6yBi/X3sz4ruNxRFWLQxaSmCYzoslJ1r33j1Y5vUH3r9tO8tLV3XiXNv2/rVFf6vYrfha1JkRSQ5pLC2kdcGFsYaKYF2qvWsQd1CrpeFqLdVSdcDYubqOMTGt4kwwo6tLI6CQvMtImyZ+pfrzlhVKdb7n3zJFoV41GxhN+7v+dLBauPrz7dX95EkNmp9Sxe603Devq+CjttG59SU3159YtmNbiu1RhqHCIx0AiSMRvoTQOsfVgQOmH7jTh3p+isKdv2XwM4K7FzPtaUIU8RNrzQUNjFahAALOqKIQMGD4scII924QqIwYrrjPVqTGGCpIhRQpkwjKOOii+MQsG8YxJ7f4MZzTv3Sd388YQLrTj9H99PBM24+fnWQnePWjK7t6OiCFFblxkKHmKmlU8l6Wn4UN8NYqszxXhYk/XXd982chxW7ucSZWxCEHtjY+i3qei0urD75wfmnrtdDrZwN//mvH6358xPPnSFE05mMu3XohiwVRqZ4Y8/cS3u84XndxTV1nFQUCxn8M+MUTvzDtZP+Vc686FoiQAQqR4CEUeVY0khEYNAJLFy2Oveb2x+Z2uGOmqysTI2QnFlS6m726CqLUNOAAKnSpqo1us/QVYYWIS02MLXcAiZR+HAdw4PWIs78xLKU1D5Kvi+Vp+sleX4B8m2rHvveNz9/wrl7b/N8aar8KZfc9omly/O3uPWbbqfi0HaEg6Yd46YrqWFkhEMvkdQrG600vR9rVYZo8WIMXGFDkA8gbTkQhxgQHYNghTzEbddvv9nY6XOmfa8irqoDD1wo3uYrDhs7dps5eS8eq2s7rTfnpOhjb633Hll1HKSKvY6XG+vYCTf/6pi/DfrDQxMgAsOEQLl5BiSMhsmDQMsgAkUCx195/w4vrQmmi2zTAUrarqlRlNQtwk7vSRNZrGvEjeVCZ6kZYWRqHgFamtB6pHuSoVXJ02n+JgwaixgmrjaIIIyDpN1FvjXsWHVzrWq+9L55Z3c3mL3mmqX2wueePjS0aqfW1tRvF8Rc5H0JjpPS8ypWvi5ah4qWldJ/F//euxaSr4URQMpyIN/eCTk3qy1kmJ1m8xD8wrp3meyYftCh+99y9IStdIXusg6l2D7HXbV5Z8G+IZtr2oOB4FpMaiGUWIvQvddLGJXGHHWvBaTyu9pezqXzk+74zeSHyppXP15MNeT6ES4NPSQJkDAakttCkyICfSeAne4XPnfb3p6TuyZgufEmwBnrEaGgMS/tYgYaZqmZF3VP9WmdjYaZaSiBMKBZB2ebzLTuTLUkZb+7hQgLIPLaYwjbl6egY87FF//oxh0ZQ8Wkj0sWLR11zz0Pn5+pG3+ssuuy7b4A18mCJdEVl5QBSM59rwKPvd1tOoAZC1TqSSrtStNFJDFiKVkTWsJC348jv+3hbbceM+Xa6d//TyWKPh64cKFo/tNbZwu7bhqITE1tXRNvXrsOUmkHGFO6CCZavixL6HYgmUwGCl0FHVeUTmd1gUcsmGlhSl+h9YmUFZ1xx02Tn+77jtOVRIAIVJIACaNK0ixzLPrNrEyAdHk3gYsXPDbmkZdeXShTTV/weZZHDEshcqaFA8Rg6dggDMY2rTl6VaDutnesZ6HBLDAUUVL7jpgWJxEo7RWTfsBZyFXc6Ued6x7cfotNTv3l2RNXFic0Qyn+7JTLDg5Z7UWBqBkX8FqwrRTncaitRkUrSvH80irYJv1M67QSfaSYYkxFMmaMG2GEMVTGNVcsM2BGC/yuNa4IZret7pj/xK1TumstlfO4HHD83B1a2oL/Z+88wKso1v8/Zevp6SSAiuhVFMEC4r1WFGlKsVCkSQDpofeWREV6gFCUJkqxJCp6UbEgYG94bYgFpZf0ctq2Kf//BlFCC2B+grrneZTnydmdnfnOnN3PvvOWR7DovYYw5FdVFTJGGIYc21Fxtns7syH0iGM5BUCSpArmMy3L5lCqR0K7VYmvpKh0zcbcGeV/pD/OuY4CjgLVp4ADRtWnpdOSo8B5pcCE5Rvu+PrHfTcaWEQWlqFtMjqcGNGy0yraEWbcghja8VxHPvb3Nu8cN5AjxWhZRRU1wH5FFMRFiDjllmUxSQIQEZMb4ZJoDb+8LnfuiEo5hJ7Z/GP8mpxXO+nYFQ8ED4xoBnQJ6HCOomPL1P96vWNivA53y07oyKFt/OH013/tP2N6OJWlfSqroDVoDxGaRoQibn2n6MVvVSeA/LvDcDXJlZwSIbTu9dddK5vEqNCNAgJU4XCRNFtZw/bTqjDIMcYsCG0LkhE1w9u/++onmYKi3JwMq8LU5Hz+ZAX+qCfKn9xd53J/mgIOGP1pUjsXchT48xWwLTUnu2rGYUtMtX4yMmwTSQbIyMiwkeW49m2raLVesIrGDvfH/mRU/D8zM/OErPVn9unoazlW4nOlvHNdR4GTK/Cn3qSciXAUcBRwFHAUcBRwFHAUOJ8VcMDofJ6d861vfwHLs/MGfr4tGqc/fwUF/gI/7b+CjE4f/yYKOGD0N5lIZxiOAn8vBf74o/qPt/D3UtQZjaOAo8DpKeCA0enp5BzlKOAo4CjgKOAo4CjwD1DAAaN/wCQ7Q3QUcBRwFHAUcBQ47xQ4T826fyEwOk8VPO9WmtMhRwFHAUcBR4G/vALOI++cTeF5B0aO8+w5WwvOhR0FHAUcBRwFHAX+8Qqcd2D0j5+Rv5wAzmvNX27KnA47CjgKOAo4CpxUAQeMnMXhKOAo4CjgKOAocM4VcF4yz2gKzkKu0z3FAaMzmgnnYEcBRwFHgX+mAqf7UPlnquOM+u+kgANGf6fZdMZyXitQHf5zzsPpvJ5ip3OOAo4CfwMFHDD6G0yiMwRHAUcBRwFHAUcBR4HqUcABo+rR0WnFUcBR4J+gAOcVlXFPVCD3nzB8Z4yOAv8EBRww+ifMsjNGR4F/gAL2ViUAAH28H0if5OaCESM6atU6bLt9eJiLcnI4Wr0xUy4qLecf5WTpDihVq9JOY44C51QBB4zOqfzOxc9QAcfF5gwF+ycc/u8Ow1UfS7oYIyFF08MJHpd0STRU9L9uHdpsTE1tqleXBs27j3JbobjLTY27BI9Uy7QiF2EWPfDI9JEvNa2fGD71dSqgzWYqG6ycj6OAo8B5rIADRufx5PwTu9a37xIxsW7MxT417kJKKHC73eDgoYPgy+3bmCQLv6xfPXk3AMB5uJzG4khPT0f/204v1C128S1Nm4iCIIDtX33LLT1S1q9Xr6+bNq1zRtAwd+6LyQy5L8eSJJnMhNu/2w7CwXL9wd5dtrVpelnRaXTp/+SQlt1mXAaiSgbh4jWCCH2M6kwWyYLu97Za1LFj/SqA5fS79EDfJZcXFOlLBMkTMKgVi6AlkEjBS7Nmj57SpJ6v2G7piIO9/W9GxhYMU8JS3o79F3/17e5/cyTu+XTDo2876/f0NXeOdBQ4Fwo4YHQuVHeueVIF2vaakRIqMh+WZfV2SXTBkpJSFhMXz0rLSyxfQF7pNmpl5eR0YM7WRdWLqFVamswOJXQiRBwsyDAeIcQgBSASKf26dcsb0samtTtYdSu/H9Gq3ag2pumaIHv8CRwQoOtRKGKU1+6eOyYNevCmzWfSVnUe26Lb1GvDZWh5TEzNq1VVBeFwcYkeLp0zoFubBdUJRj2HLb165y/ht2RXTEDxuoVIqEhTUXDtlCkDxx8BIwA4BOkZ8IZPlQsEn9RWixTfqMjCpS4lLi4Uiqz5ZP34SY7lqDpn32nLUaD6FXDAqPo1dVo8awU4vOOex5oJqn+eAOQrMJYBFiVgWCZgjFqaWf52ImD35+aOsC0d54HV6Pze2du1iyu9h87s6fYlTiGc1EAIQAmJwIgWv3/rzfW6jB3Sev/pTpVtAWl9X3pHUUicLboCNSNaGPq8KgiW5+9pfse/+4/of/Mbp9tWdR8388mPr9248X8r3K74qyORCCCWXgpZdPqD/e5c1KNFw0h1Xa/XiCca5uWxzVD0+UN6FPq8khnK27F65qyx444Fo9u2X9Q8ZBhz/D54saqKgq5RWl5Sunhr48gonplhOyudB+u3upRx2nEU+HspcM7AqDpyuvy9psIZzfCsHPWzd3+e5PMlDhWw4mYUAsoBkBQXoNQCjBt5JFRyy9svDvnZ8dWoer1s3sWVmWMWpUIhbiIUcQrCAFqawTkt/aDF7Vc+MGLAHQeqbuX3I1q0f7gjVpNmK2p8raiuQUXFQAsd3HdP+9v69u9y3TkDo27Dllx76KC5wu1JvNo0TYAgKY2E8qd36d1sYb82jaJnMsZTHdstbU7DoiK0mWOPHysSpEQ3WahwTfb8iWPr1YIVW2ngVwftmzs8dZfq8i8QBXKRrkWAAGSDU+OJt55/cISzdqtrRpx2HAX+bxT4c8Do/H6x/r9R1mn1jBV4POfHmq+s2zgPS772CGGBcAA4wwAiDCjgwNCCIQmHO7/9zJANzsOlanlti9FDwxekCmrSJITFZNvzF0HKtejBLc1vq9dtbFrzM9pKa9FxekfGYrIUV1wKQxgyGgGQlu1tdue1/Uak/uecgdHN96Zfq0gpyyXZfzUUIIyEykoxD07r0KPpouoEo15pcxr+vDe60R9fO0AYx8SMGMgqX/PwyLRxTZoc9jE68rnj/sfvpkDKdqtKLUYpgACb5WX5Sz98bfjIXyPbqp5A5whHAUeBc6LAnwNG52RozkX/agrc2GbMDW5XnaVuX1z9iG2RUFzAMmnFdppJKABMN0y9YPqt9YKPZmZmkr/a+P7s/q5cuVl55r/f9ARiwmRR9SRzTiFiFjeMg1vuvKVOtzP1MWrRcWpHgGrMEWV/TQIgxIgCyyjYe/3Vdfo9OuaucwZGTdtPu05Wa6xAgqshgwwQK1JqaSXTew9oUb1baWnZDffnkS2yO97PIYKmETKscN6axTMyxtar96vF6NdJbtXx4RshdI3CHMdDBIFhEGKY5a9see3h+Q7U/9m/BOd6jgJnpsDfHowcY9WZLYhzdXROTg5+ZsPBByzinc2AmMQgAAgJACOxYjsNQQwMM8xEHMlp0/zGgQO7Nig9V339q1z3tp7pihiK7Qlw3CRR9aTY29eIWcDUD7zb7NaLu5wpGDXrOLUjQjWyBMWfwvhhD2tRqgAAIABJREFUMDIjxfvdSqTvy6tGbThXurTunNWIwZjlqivQkDADaHqw1IoUTe896K7qBaN+2Q0PFYPNSAn4OYIIMMOwoofWZE8dOrber1FpRzRY8coH3i82f13rputvEHft2gU+/d//gKCQkpfWzjxtv65zpadzXUeBf7oCf3sw+qdP8F9l/H37LnEdjITG65ZnGBZdHkVRACH2ZhpiJmFQlGSEMQVa6NDmGK/ZO3f56F1/lbGdq35u3rxLmb7wxZ5MsC1G7mTOIMSMAMPY/16zWy554EzBqHmHzE5ISJmD5EAKAxxiCAAzInsxKBnw6jMjXz9X47yve1aj/GK2wh+f1IBDCiwSKaPR4PSe/VsvrFbn67QVDfPyzE2iEuPnGGEAoqYe3Lf6kalDx/7ufH2uVPi/ua7zYvl/o6vT6vmtgANG5/f8/GN613/I4/V3Hoo8pXiSrwZQwpRazCJGgShI+wHA9aO6pciyAAQYOhAJ7p6y4JEua+rXr2/+YwQ6i4HaPkb9x87syVD8FFHx1eAcQIFRYGkH3296a3LnsWkPnJGPUasOj3biQuIcQfanVGylQQCIru/jWnG/t14efs4sRjMWfNDog0+/WyG7YxtY1AS6ESozokUzerVrs6BHj+qLSuuR9vQ1+3aWb1K9MT4sYWSRsIlI6ar0zAFHRaWdxUQ5pzgKOAqcVwo4YHReTcc/tzP3dJvdtTSMFvpjagZsfyKEqcGY8SYhZJOq+jIJFf0YQ0DMUo1ZhStG97kno1mzepUcXv+Ien9GlOSvJSsquvln5GE6DEZTezIhaYog+2oAhqDAOKD6ofdvveWizmdqMbLBCAiJWYLkTyaAQ4RQBRhZWnG/TX8AjP6o9llPfNDo1Tc/W+HyJDQgCABGtDJglc7sc/9d1ZrHaNDoF6/duad0k6y4vVAASNPLTTNUvGrRzAnjjvUx+iNrsapzj6yj6l5Dp7E+jzwvzirVwNHtHxljdY+hKu2c7x0FTkcBB4xORyXnmP9TBZYs2Sq+sum9FaJaoxPlomQQA4jYKItESufKkpzDkfA2556agiBByDQKWek7l9RUB2fP6r/jbDpm36BHj17tiiCr1v59JTUtgjxIwKLdFmOEM2poiioU1khJLki+vHZB5lmUlbCvkZn5qlqqafE/7vzpAigIMRgJMkICJNxkWlTTayXXKIrzegoDii8vI6NNtYWVH9Fk865dyvTxa3tynJCOpUASZwiKHAIazX//1ltrnTEY3W2DkZiUhSR/ssVZBRhxYu5jRnH/N3KGntZW2qhZb7qZocUKACbt3707sThIVFV1AV2PcFlFVq3aNYpEBA/542hJRlrX0Ok8OLOe2Nzorc1fr5DdSQ0MyoBhRMsRC87od3+LKsEoJ4fj7/bn+gtLypO0kH5BYX65SxRFePm/LicQsQgRjIMAqPvVqE97/9uvGnAqb3J5fV4kAERIyETEWD0l3d5Kq+x83TdjiUsFMfFeDLBuAECwBSHQyuZm9ik5ds3OmrXKXRTR4gwuIQUowCSAooBVMnt0j4ocTHYfN366NAZL4pX5B0v9JmFYNyiLT4grSUisucs4tC9/6dJ+1tn8FmatetNdsl+7cO+BvOSCQ/k+JEhIRJTVrnNhkUeSd1zS5uLifo0aWZxz1LbLnFiDaF6P6IYXXFCHubzMmDrh3nwIITvVtdPTNwuffbulhij5EqKWlSiKgtfONSrLCjeMaCgxMbHwwloJe3loa0lmZuYp2zqbMTrnOAqcqQIOGJ2pYs7x1apAejpH3+yY26a4HM+Nia9Vh0EEODa5ZRR9HYhXe7P/eL4OvlawQVWSb9M1IjJicglGCxEpHvzKc+NfOJ0H55EOv/76DnnRk89eb2igrewKXC1K7kstjgIUQhFDxC1KOAIACCJi1IxojNNyyLQfONff4yS4pU+XJl917NiRnkqAnG3bpOUTn7rG40+5J6KBRqLork0ojuUQuSgDFTAhiAhQSgngROMkGuLc2CkK/CNFpm+n9fz3p02bNq2WiDvbYtRv4qOpFCZOFuRADUhtMBKBpeW93/SWizufabj+3R2mVViMcIXFiECAASCWto+bxf3eev7kztd2Bm5YmHC1zsTbEHfdblqwlioKASxIXgpEBDECpqEBhDjzuWXDNMJBLVpyQJXBu9SIbk6fOXrrDZfGBU+m++xl667bvGXXSlFJusogtpO+FoQ8MqPfvbdlnyzzte3sv+yZHVeJsqc7ofgGwEEKwjgGcklgjHEAKeSIEA6NMkbZAc6kvRApxaLo6SGIohsiE5lmmcmN8OpHHh17FBjZNdEgv6Pt/KYcu9Ih0RNVFSKATVBWnvfsB6/PzDx2HN0HZt9bUFA6CUIl4FK8gAKUFwpH5sqCuEVj0RaSLP6Hc3gtZeBiywKSInkwgrJdL1ezqJ4vS3wb1UtffeCu5q+lpl5TVtUP1IacuztPvELT8G1Q9jeHUGkIAPAIIhIhwND+TXHODQBoHmX0K2JaOV17dP9izarV/TgXHoiNSZQ0zSRGOO+bOglCnxUrRhwHe3Yfnn7p07g1a167RZb9rYkp3YRFt8+u8sMRFEVRRFE9wkRRoIIItHCoZJ9HRl9xUP62Fsl7Z8v6peesxExV+jnf//0VcMDo7z/H5+UIjzh1vvlmnnv+0ucmid4aQ3STuwRZBIBrTAvtX3vz4Bt6ZTZtSlp0nTNX0+V+Xl+igjGGzIjoZiR/+r+vajQ1M/P0IMJ+g9/xxaG7RcEzTFViG3CoiIxDASoY6qYJBUHm2N7iqtjm4pxRq+JF2CIRCoEZImbkI7cbD1331OidJ4OxrKwcddPnPzXTDTRcVPxNRNGvmgYHLncAGIYF7a1AABigjADbuTwaDQNJRsDUdQYR1XS9dGuMHw3v1GLENx072sU7/thn165dSr9xz6YCIW6KbTGq2ErjGFha4QfNb7+k85kmePwdjLzJBNgWIwYMEtz3rzpx/RY+3OGEPkY2+H71y4wbIgTNYcB1mUuJ80Fgk2GFYQDa0YcccWADKacMMG7acMohpxxwQ6NWaI9LZcvGD+mxrFGjlBNa1WYvXnfdpg92rIRC4lUUKYASM4hYeEbv9recEIxsMOj20PLr9+WHJrm98bcBLrgEiCvmRNdMgDBgFNprAkLATHvbiIYihEqyyyIUqqKIsSQxSIwy0zJL10x9ZNzYRpfBSg/yFh1W30W5skCSaG0BWdAiUcJ5aOmG50YOPXb9tO8xp5tu4nkuT3ysaXGuafoBvzd2YVmoFCLO0yAGsYoiS4RRZPcxopkcclfFDqQgAkDMCGVU+wVa4cfa9GmXM6T1pcapVs49PR6L0zX8FOWuxoLqjwFYljg1gCgJLBIKcrs+oa5bQFZc0LIsixK6L6SFc9wuVy0OYCcMsCSJbkr1gs+Tk0rbrVwwofDY66Wn50iffv9Df8Bdw2QltqYoesWIZnGMMUMIQdMiQFYkSCi105QBLDCga+WEkOB+SSQLaqnwyaVLx5X/sV+Ac7ajwNkp4IDR2el2Xpx1Vr4Z51mYyeub99da8ETOPCb624mKV6DEBCLUjeQYIXNJVs9pttD39ZjZKwq8WQTIXklSEbTNLVrJi15KeubkDNershrZGbUP/lR8b0GJPkqSPFfKolvUIwyIigyiLAxERQSYypwZFnApAgCUQc2wX81FwJEFTGpyDETN0MueiQ+AhffdkbbtWHDZto1LMxcvb3uoIDQKSu6GgqjKAMoQMgEwCoCqSCAaCQJFRYADE1T451AOKAVAENwAAMxNUzM0o+C/F9SMyerVvvsXTZvCP2Q5qkjwOGZGKhaTJrtdMTUM3YQQMRAKHfqg9d2NO43tfdMZOV/f3XlaJ4gTsiwmJkuKCO0IMMMK7mvV7Pp+wx9sfBwY2evzvq5zLogSdSoUpQ5QEEUouKFlUCAjAQBoAduSYjELCFACnFYUYa3AU1H0ADuLNRd0qkWLvq8R5xvz3OKH3jzRts3sxa9et/mjnSsBjr3KJgViakGml8/s1K1Fdu92l4eO/bF26ffEpYcKwlNlV8xdFEmqJKgQ285JxOKaGTFcbtEIhksst1dFVCeS2xWjRKNMEFUvJ4ADQjWAOYMYRkwtemjN9McmHwdGd943vzUXYrNFUbzYHhiC1DC1oqVvvTB82LHrteuABd2Ky8VsQY2JCWk6l0Ql5JY9v2jBSJyIhZqAmQjLAFCgQYOUA1lyAwxjgA3dXKAV+SLtqYgEy79TBTi9yZX/WneyF4ZVb37tfmb1O10lGD/bMLFbcCnIJCaQRAioGTEAsyzIKRAkF2QcK4xJmEOBRnWtBIpIU0ShlogRhJwyI7z/00lp7drfcsullcDoMAzPulE3hIWyEqgvSz4U1U3AAeWKBK1wOEgwFKAgyYAwLsuqggiAwLIMwICdsEzfK0DzqcsvTVkxd1LHM8rOfl7cmM9VJ86ze/u5kqE6rvuPAKOzAojqUPekbTgr+Ig093Z99AYDxC1FaqB+xDCgKmFgRYqKb77uio6TR7fYZB/X9r4JDaLI/wR0xTRC2C0CwoFAje9FGmzd8LKyvVX5JTTvlFHf4K75shp3C+dYkLALQCZwDlhEA5G8SDS0T2BCkUABt/QQwgD54hNr1NGJlWBB5pUUBVOCgaWXRyVQ9s497W4a06/Lf344enqb3zf+cgji58nehNsNhgQsCIAx2wWHGpCSAxLi+wwzVGTpZZwBE2FRCkiy6xJRCiRalqgQIiFvwA84ipjloYNvuMXw6NdXTfjpjyxDG4wGT8xKZTAuHUNXomEY0OtXAWGhDy+/LKnzzLGnXyvN7sddXRZ25tw1C2G1piBhaDENmFZo790tmgwY2qPxcT5GrTqMT7DM+DGqJ7kfF6iXMg5MhrmABBMxWmSa5b9QWF7MqEVMjQK/NzYWY/wvJLgTGXeJ9p4jARqQRWAZWtmbSC8e9Ubu5B+P1WTGgtcavf3uTysEJbaBDUaMaGGsh2b0695yfrtjwGjVm3nutU89P4hzeZzi9gXsAiLUpBxpNCIh9rFGytfXrJW43RsjljOiSdTEcft3F1wT1cVrBZfvKo5xLYSQ6BIwpFa5SVnR2oczBo5pdJmvksWoVae5rSwYmI9F9RKvyw3Ly0o0Uy9Y9u4ro4ce2/8+gxd021skzhdc8QEmIGgYBgUGpAK1M1RQwyULZaXhwt0MRQ5hl8YIYXKkTLgwIeGiC7jEAxalSMEeLgIBlJcVf+V3Rx98ZW3at8deZ/PmAs/Mp57sHg6LI0UQf3FMIAlqTGOUGUEjWvYjouartWsmflZSdNBISEpx7Tt46DYsxtxiUtzA7fGrmmkABCh0uyQeLC1hEiz7/Mm5I9smJ8PfwMi+197b47Ery0Jogd9f81bKJEgY5yJGYS1a8rNpFH5c7/KLN5SVBHl8XKK4+8ChJhGTNUJQvsYTiI3VDQsCSDmzQuWCoC+qc5EyfXHmoPAf+R045zoKnKkC/wgwOlNRnOP/HAXS09PRVz962pkgdhFSvTW4YD+kQgCT4K66NeS7F8zpv93uyYzs12u9//n3MwzgaS+KfhcjECDTLMA0et/63L4fniqTsH2jvqPDwy3d/lqLoOC5KBzSoCSonBMQCYZCL7q94rpQsGy7yMUiAMqBHwBgISEAJfFak4BbRNXbUXL5kiilUIAmN7W8YkiKh294YfozR6wXFZaRB2fephnupUj211XcflBQeJAhzCPMMj9yi+hJFi3b2urem0oDIADKQBmQKIh/9Y1N/2Hc1dITSGlFiDtA7O0lbHLdLM1DSB/01ppRL1dlDTvVTNlgNHDcrFSTx0z2uuJqMM5tx28QiRR+Uv/yup3jhdb7TnR+RkblAr0ZGQBeeWUuXPpcUSckBmaKopICoAUtFgGUR/a2bXnDCcGoXfeHm+h67FxVjbve5BaWZBlENBK1DOsLwLRXVGxtuLNFozy7DxCrzAqVxG18770WxBTvxkrSDbLL56eIIEpNLnC2m5jF4998drTtV1Zpm3HRyi2N//vGN8skV3xD20fNMsIhwQjP7Nmx2bxjfYyad3ikDkS+WV5/QpuIbkkAS5xYhilT/lk4nD8hQdE+y83NrJQGws4g/sG2g0m7dxXer3jiMrCguLhFETGCJsQlJwUjg/uyJcVT16O6YHFRgS7A0NK3coceZzHqN3Rxt50H2HyoxMUgucLBByATEgmgciNS9g7RQ1sUn/iRoNI9Te5sBFVoSBtf/fo63RA6c8XVRpRUP+IyVLAEQsHyA5gUDNnw0sh1x66dR+a/cOnmD79/zO1LuYtoLlUS3SBihsPlwcJXAipcZoHiL7bkZv4GIUuWbHVt/emXm3ftK0yHgtpYkFTBnitmEa4oCieRvZ8un9uvXXKy9zcwsnNnPTJ3dU+kxE+R5bhk2/4jSZJlamUvcxRZBskvX7yZO/c3n6Ts13fIOz/9uuaunXmTIwa6X1YDbkIIcCmQFBXseD1tSKchHe+8cu+fc0dyruIocFgBB4yclXDOFOjZM10pjcSPNJF/PJNkt701o4jEJHr+pga13V2mTx9Ykd1627YCz4RZTw00uXc4QP4kyEUoWCxqGWWT9OKDC7ZsOXl5kK2ci5k95g8OG2I6lt0+VfHCSChaTnTrNdkFMwKWe2fuFd9xcEw0zObNXHj57Wfjtv9UmoFldy/OmaiqgIZK9peLPDhnwaxZWZdeCit8OTjnQtsuM3oDnDDd4q4AR5BbJBziNLoFsuiMOKhtPfZhe3hc26TFKz65YMeeomkuT822ECmSnYeHAU1nJDjzihq1pmdldahyq/BkE3h4K21aKoMJk9xKTLLtk4JFCDSjbLcEI08TUysXZany6RYGrGI/y67vxbnB7N08AWDs5uEwaOj1Jt2DBBwAUIeSzEFEL9nX7Jb6/cc8dFMli9E2zqUxD8zsD1H8BEnxJuqmZt9rDMtCG0ytfK4kh7/emDs2eCzUfv11nnvZMxsu/mVnqC8T1G6iovotSgExrLAoms83+Xe94ZmDmlayIMxbutEGo+WyL7GBnS2dWtEKMOpx/+3HgdG9D866K6IrWRzKlyour22dsYilfwu08CPt7rxiw5AhrU/qn9P+wcXXFZRqbwd8Sf6K2C0SMU1yaM3UR9LGHmsxuv3+6a0ASshWXL669tasaWi6AMPL3nh+0NBjx9xnwIJuh8rkbNEdFwgbIQAhMElE3w/06Fq3gtcUI7r/49wRur3UjkyW7Tye/dS3jUR33GNuX+ItnCDB3ookxCyVaGnmyIENFh3txG/7VTW/b3w7JsfORsh7kSLEQ0Yho0z7rry0oGcAiNs3bBhy3NjXrz/omvf0snskJS4TC+46AlYRggKIRqOU6oc+XbhwQLvLUn63lg1/9Oma274pfERSkjozqCgYyaCspGC3zyd1dOu/fHOi34E9pn6jnv73rp2Fc0Ul5jqM7QCBsjLGyt4dPbzrhGY31/1DltNzdoNzLvyXVeAfCEbONtb5slpTB2RdXFzsfVFQEhoyWYBlwXygymahV9Gm5SwdMfdIP22LTLeBWU2KI3guZf4msuSHEhF4qPzQ2954q+9LKwbvOdmYhg9fHvvV7vKX/HG1bowYREAIMS0c+Qwx8NCWBvu2g8wMfiqLU6v7Zza3mPw0QLYzBPgQAu0tFdGNOasm7T7yRt5z2NxASSF42uKBVrIaJ5QGS6kgks+jwUPDaqlff5Gbm3tKR+r7uk9vEdLcT3k88YlRw0QIccqp9ppplPa6qYFRWtVW4anAaODEWakMJk5SRF+ySSi0a4lhaBJVIpZpGIghiXMgcFjxyLVtYLZRAHEEGICQ2jVEmG4SgJEbQKhwBGX1MLxFsCRzqFuhPe2aXz9wcI9rKoFRz9GLahzaZz0pSXHNKMOi7VRtWdZORnFXXrzni1PBrN2TPsOW1dufpz0FRdd1iuLDuk4oJcGfL6kh3L14bp+fjx5z1vJ3rn/jzW3LsDuhAYTQBqOgaEZmPdS1+XFbac3vnZru8tYcaRLgxaLItWi4UBLIdLdlPJGbO0I71W+j58BFVx8sZRsVJTYGWAgBoBs6ObD2scwhx4NR+6mtkFKjAoyIQWwvbt0yCpZtfGG4vZVWKQ9Q6oAF3QrK5GzJFRcI6eUAMvMAINbsa+pc8OTMme2O85E60kfb2rJuxSsDRSUwWURqjCBIwLJ0Qw8dWJo2rMWUe5r+HqG2YweXB018NB3JMXZggIKpCizD1DW9fN7N9fMmZp7id2CH23/+w4dDCHBnSHKMF2MVmCahTMv7eOXCEfekpPzueH53p8kNQ4Z7seRJaiJKXkwsSkwj+mYCd7fLzelgL6oT5kCyrceffYeeEIXYFpSBj0RgrUtMdn/S7Ma+B6ojEOF8uec5/fhrKPAPBKPzZGIcPgNdUxfdX1wuPaF4E+J0ogMkUQ5Z6Y8CLer9ypqMj46eqadzPqr53KsfzgQgtqMqxwt62PYTjW5XlNCgdasHv3eyXCr9hz9d84ed5Z+IrkBNQVGhKGIrFCxbLlE2yQd85bm5HdipwOjuDunXhyNssqTCT26+9YbnEuXEvf36NaqUM6Zr2oxah/bz993eCy4gQK0o66ZFC55GZvGE0wGbDqmzrwiHpaeQELgai3ZYHmDECH0IWEnHxldECs4ejHYpgye/lBo2vZMUwZusyJ4KMLJoGIhABxhyYAEZUIArTMfYjr/nIrAfXRDYUWPUjhKzQcn+O6PUTg+JMUSAAkHDABmQGOE9d97ScOCY/pUtRg+mLal7qMhaJ4mxV3AOsShBqkUjH4cMrVtNnLg/J6cDO9U24fbdPHn4qJlPqL6k1haVBENnHDCtuFYCb/3U4r6fH702ZmS/cf37X+xdxpC3gf13ywgFJaLN7tu1xbyjfYzS0rLlnfnGGpN57nZ5/AqzbX1M+84MFw3691XaB1Xp3KP/nGt2HtDfiYm70O+W3Ki8PN9gsGjt1BOB0f3TWyEhfoHi8l8MOYc2glhWybJNLww73mI0eHG3ffkgG0neGCxxbujBXS7MMicPS3u2USPbQ/3kn64PLW1VGOFLZMlT264raEeRmVre82P73zOqWbOL84+cuXUrd6XPW5ytU95dVn0SN6C9hRgxtNJR760fvaSqu2Ln3tOuKSqhr8tqUpJJMPT6AlQP7v9k+by09keDUesu6VdTHniCCb5GguDCAAhU00JvJVBPmxP91n67DXIOm7cfORJjP69/xWUvu3CnXZmZp86PVFWfne8dBc5WAQeMzlY557w/pEDW8jdi33rt+xmSGtedQkmGIgeURS1iFK5J7XbPmC5tLqvkzMo5x91GLOtXXExnSELAY0QokARQZmkFcwaM6D6/3U0JJ3yzbt9twW266XlR8QZidGpBQw9rxIxOiMaLi+5OPkgzMjL4qR7Q69Z9GXjzw/dqderadn/Ta+qcMEdMj7Q51xzMA29hITEOiR6om1qE0bJMV5hkb9iQZlZVTb1d6pzaelh9nDBXM4/XJ9uQV16a/5ULRTu8+uLwXWfrZ2SH6/cYvipV9V04SRX8ySax3VoJkCVoR/4BammACzYYQYAq3uMRgMyGIw64HUllf4MogBgDziROmQAglCGAjHOsQ0Ijdqj4nvta/3tg/66Vna97j3j6mp/3lL/kdidcIGAJUaKTULBog0cS+ja+oqBK2Pv++2DcsMmLZkIpprusxoqcSQByPRhwh+99elGfd45efA8NXdR410G+HMq+BhhjQK1I0EXNOb26NJtbCYzS1/h+2X7oPSgmXAmwKNjWsKhW+L4KIwNee37y91Ut6P4jll+zJy+6GSCfD0MRMhIxCMtf89jDQ8cdu5XW/P7prSi2wch3MQIA6tGIAXnZ0jefH3ZcuH7v/gu7F4SUbI5dAUEGPBQq3MX1soyZk6Y8VxUYTZj6av0vvz+wSsTuhrYTtmlZRICh3OED7xnZ8paLDh0ZU3r6Zs8H325bJgf89zOOsEARM7VwCeKR/m+8MPylqsb+5Muf1X7huXfWSnLyf7DowcFQhEKz5JOnFg2rDEYdxl4VtTyLXL7E/yDRiygFPBoN75Ix7RvnRd88s6RvyYlfYjhc8eyHyT/u/TE0Y0yv8Nmu+arG4XzvKHA6CjhgdDoqOcdUqwIVzsrdZ7fWou4sxRt7qWYRqLhEHgwXlrhkY8R1Tw1fk2nHlR/zmTjnzdoffb79EwzdKR41AAw9SkRobPH7yZDViwed8MHWukP2aJP7M0S36uKccgRIkJjhEW89139lVcByuoNOHbqg28FDbJEgJ/oE2QMikUhQ00vGDn1gwLLT2QZo88DseJ34p6uu+M6aobtVVebUNPZIONpl3areH59uP449riKP0eTnUxlMmiJyV5Idgs0h44YeMoBRni9IjBLb0QTaLsu2xQgCaFuMAOeMWxxAAuwMxZQiRm1XYMGjyrIvwbAsjCSKIDYAN8N77rzj2oEjU2+ttJXWJW1ps/xCulZRExIs3YQIEiKJ5OXSaN7A93PHF1Wl/datJf7MrGUPE+TrJyvxshYBgJJgtO5F0oAls7qvOnqsbTo93NgAccuRHNvATp5p6qGgRLWszj1azu3W+tLfEkOOyng88asvy76Mia+bHDUpBNCyNCMvd8yg1FEtb0n4DSJOpneP/tnX5JXDLbIa62OEAWinkjQOrJ7x8PDjwaiT7WOUuABLrgowAnY6dS1v6Tu5I44Do+4PLeweNj3zTSYGLGgAAVh7ebRoyiPjJlRpMRo7/W3/xx99/bzHF3u7KCmibprE0otzB/W5b+R9LX8Ho7a9Vni1CHxKUKS2HCI7bRA1teB+yIM93nxhzPtVrbEvd/HAhHGPzRCl5FSTSqKsKkwPHvgk+9Eh7S47KofTG+/tTs5e+MxUKAYegIJbogQxhARmmdG9gmD86HJbn2LO32AQ5qs6jowZMyh05ZWAVJU9u6r+Od+Iu/mBAAAgAElEQVQ7ClSnAg4YVaeaTlunpcD6rQddix5bPQajxCFEgDF2tBIWES8q3r/96gb/Grwws82WEzVkJ4378MeD78pKzPUICIgRyiAnOwEvHbp+7YgNx75l2gDWtvPjWVHi6u+JDSjhSBmXBF7GaWT4hjWDVlXXW2mvtIWj8wt4uuhKdBsW4AyCiKaHViABvIEBoQI17T0bCKnFBYEA253Z/g8xxIEggEiEedzuGl0gVltDjNwQUkhN7ZDfTbu8sDz1hFqcjtA2GPUetyZVVC+cIjA1iQHBthhRiIyfoBl87NK6tQsurBXDKSBAlgGwNIvbHZMVAdhlWewPQxYnRACaKcAPP/i2qSgHeomSK8EgUay4ALCipXtaN2s0cOgxYPTAgMXt80vASkGM9auSCk0jTCyr6Pnbb7ly6ITBzaqscWc73I95ZMUULgaGIOyXIVAAYBE91q+NW7Ww7/zjwAgmLRfVmAaMk8M+RiQ6p2+X5pUsRsMnPl3zhx+LvxBciUkAinY+IlPTDzz5yJRBE25uEKhw9D/Vp3fa8mt25Ue2yK5YH4YQECtkGtqh1dMfHTW2ST1fpTHZzteCmLhAkN0VW2mMWoYRLVj6zovHg1HvIUu7H8zn2YIrJkCBnfW9fC82StMfHT/xmaosRhkZ613vfr0jR3X7mmNBEgnjJBopyBkz+P6RdzWtUxHxZ39adc32maZ3leBS7uKcCioWWbA8fw9kwc6bXp70WVVj37GD+9ImznpMEOMfqgAeCBiJ7vv0qXkj2x69lWZHpS1a8Vw33XRNluW42oRLnDNECWeIcYNCIawRqh0UgBSkhOwXMfgcQlKsG8FDfR56sMDtBfk4yPJbV5Gksqr+Ot87CvwRBRww+iPqOeeelQKvvPVDyvIVm7KhENdO9ahCRAsDDhkzteg7l16UMjRBde+48srCis2d0lL7hRuAgwdD/NChn+CeKJtPiNDLrXglO6yXWIYhYH36zLUDp9WHsFKYdYVD57b4xy3o6Sm4FEmSkZ2nqJQYpUPfzhm95qw6f4KT+g174rF9+42hohrnEhQvD+sajWrBkkDAF9bDuu1uShEn0E5jbGeLZjYRcQgYh1yLRCnCEpOl2ADDQkAUocy4BYgZzfN7QdeXlvbefLb9rLAYTcxNpSAuXQCuRFlWoUlNpmtlH19Vp1bnBTPPLI9Rm24LO4ajeLbqCaRQYGGELcCskj2t77j+ODDqPHhBp8JitMzjqeW1NAoETIiuHVo7e9aQ4Q0uhFVCSIVPzOxpE4EUNxIin2yXwOA0oteI1yYuy+qbdTwY1VguqoEG9lYhs8GIRmb3faCyj9GoSavqbPuh5BPRlZgIIAaU6aZFC54YPqTX5NY3nLzkyJFr9R6x/JpdB8JbJFecD9lGICtkclqy5uEpaWOOBaPmnWa3oiCwQFa9v4GRqRUs2fjCiOPC9XsOebz7oUKULSgxAQYoJ2bZHmSUpE89DYuRDUbvfbPjOcXlaYEFRSKMW9FIQe74oR1G/b6VxmGzDkt9hAlrXH5vS4tRQWaQWXrpLkEo6/TaM+O/qGqN2WA0eNLsqVhI6AuxS+KYMiO695PFcytHpdntTJiwLOn7X0LDCFMGedw1vGVh3RAlBQGBVeSlosyElAvcJSvcDIcpgoxhiZWEI8VFXr+4k7HIy5fXv/jFI7Xiquqb872jQHUr4IBRdSvqtFelAs+9sePaZU9sWCKpCddxyCFhFlDtm6Sh/wKY+b4kgrARCdo+RAgLGKseFygLaXaSHwoEd2OMpGsMk4kulwsZetQSBZKTNqpnvxYNQfToLRobjD7+Lu4JUY17UFJkqay8mKsSLoa0fPhrz46sNjBq0zEzC+GE/hS5FAYlxhBEtlsz57aNRgZ2/DvkCAJIGEAMAmQXGzn808OUMTvTJOUSZdgOC6MSgBYH3DooY7PHf58c9AfAiCt9JkzvhYXkKW45kKjrBuTI7pP5QTRa3HlT7ogzyip85z3TOgAYm+XyJdS03ZEICwFKC/fc1azRgLQHb6uU+brLoPmd80vwUozjvIjZDt06EVBwba3aYPjjv6ZhONVC2XqQuyaNmDkJCL4RAHtkwS6uapZpNePMiSsXDvotYtFuo02naY0NFr9c9MQ0oNw8KRiNS199yVffFX8suhLjoR3Wz3SDksIlQ4b0PE0wevyaXYf0LZIS70O2BxYJm4ZesHrGw5OOKyJrgxHACQsESakAI04M3dALlm58YdQJwehgEZovyjExtkM4MUJ7kFU8ZerYMVX6GNlFef/3yXfPKaqvuZ011LYYGdGC3LFDOx7lY3QYjFTVu1bntIWdH9UFBRuMdgLrUOe3Xn7kNMEoayoW4vtCrEocW0zX9n78eNag9keH6x+Z04kTn639zfd7ZyHkbW5YWJVcfsAwBASYWFRkIRpl0I6iEzkHogBtHOSU6QALlEWjJbuZWbbw5juuWp45qKOT3LHKO6pzQHUr4IBRdSvqtHdKBeztrZYdH24NUc1F/piUC3RTt2ODILIDmpntiBE1BAwANQ2oulTILBMaxEKy6uIGIYRzQZBlFUc1nbndboFSwkwz+Jlb1No0qFNYerQztQ1GH3zrf1zxJPSkjEmyJHKia8WMFg3b8PzYtdU1Vb0HPj6jqIwPRpJfsRjkECMkiFyPRsMG5iKvKMl52KGZU2ABgCA4XB0MQQVhaFkEEAYpFAFj2BA4oxwwXsis0IAtL0z+A1tpXHlo4qxUABOmCFxOsnX2+l2goHDPhz4U7vRq7qQzAqNWHaZ1kqRacyhypXC7yhmyHbgLd9/V/NqBx4JR18ELOuUXw2Ued7IXIwWEy0sJgqVrZ8wYfHoWo4PcNXnErIlIDowA2K3YgGnqpXpKPJmwYv6ASmDUstO0xozFLxe8MQ0YMwEh4aBsR6UdYzEal77i4i+3BT+W3EmJR8DIMgofHza8Z/rpWIxShy28dk++tfkwGAmAkYhpkeJVj00ZMO74rbTZrUziXuALxFYJRqlDF3c7UAizRTnuVzAK70ZWUfrpgtHWT757zlUBRrJEKCOGVpQ7duh9x4ERxuIaIqCWsuoSsAlZJJi/C6Oyzm+/OGlrVb8F22I0cELWVEFK7GtfhyGTGvq+T9ZkjavkfH10OzaIfvP1vs4ef8KNEY1eanHgZYirqtsnaTrEoiBjBUM7lxQAEHEkYECIXVOQcE6CuxgpTn90TOvnGzWqHAVaVV+d7x0F/qgCDhj9UQWd889IgSVL1rv++94vo7AQP1ozgFuWZW7fE6l12NcaI7uUBgOSKAKLWsCuu4pFARDTAhAjZpqEEYtyl8drF7jEhFtAQCQ/xiO2Xbuo09aj86TYINDs3unzBDWhL4dIcSkqJ1G9hNOSYa/lVJ/FKHXI4xML8sk4Dj0ejgUKEI9GoyUvcmZskRGikBHOIOOMGRWJE5m9k4YECCFGMkQIIYnphmFvoHHZKyFGLWxolun3ej7YsHbMgaoclU82ARWZrydnpUZNz5SAO7Yie7f9Vk5J6MMr617Uae7UNmcERne0e7STz3vRHIsrKUAAUBAp0PW8PXfded2AtAdvqmQx6jpw0f0FpXAFYKpPkb12zXZiGoXPzZzVb2j92vCE1diPHse2bdwzeuqcyUDwDMWCR4bAXgPles0kMH55Vr95Rx/bstPsxowFlgvewG9gJJn6rH7H5DEam7Hqgq++LflUcsfXOAxGphkNHlwyYVLfyXc2iq2yYOmvYLRJUhL8AheBneBR0/JWz3h0/AktRpJSM5tBVLfCYkQNw6jYSjveYmSD0cECmI3l2BgG7EPDeyrAaNzoKp2vbYvRZ59+97xb9d2J0cnACIAOHZb4SyFdJbi9rbGoCCxMGdWDexWhrNt/c8Z8WNWP+AgYiVJiX4hlCSCDGtF9n6yaN/6kYGS3mfPRPjW4v7zm+hfWXxTWjXisCLUAkOpRosaqqvsiwK2LsCC5GJBFUfYBy7Q31e3KaWEjEjqYM2xwh9Htjko7UFU/ne8dBapDAQeMqkNFp43TVqBL74UXFpRbSwU55nZF9Qq6HrXLC9h1Nqn94EZQhBEtSr1eP9QMA1NmgVi/nxeXFDJZlOzczZBROzOOAJidjRAxiCCNQtNMc5nup6+44jt+dD6atj3mZxhUHaWobrcW0rgCpCDgZSNeeT5tZXU5X3cduOih/AJzdiCmlg8iiR/M31siS+b4yQNGrLzttoqEQGf0yc3Nhbm59im5IDcn56RJ8apq9EgRWZfvAjsBYA1Dj0JRAiAUzH+/ScNLH5g66czAqPm90zq5PLWyOHQlU8AgZRoAPLindQUY/bsSGHUbvLhtYRF6KhBIDATLoxBQQGXZfKl2Lc+gBdM6HleN/dixfLKD+x6eNOthLnr7A6TIdn4lyyiL1k7Co1YuGPB4JTC6d3Zjho8BIxKd1e+ByrXShk1Ynbz9h8L/yZ7EJIgEGxItM1Ky6tExfcY2aVLZefpE2vYZOf+6nQfAO7KS4BM4hpRopmXmrx47asDYZsecf/v9s1tZxJvtDcTWhZyeciutIqqxEGWLUnwM5YhTM7QH6kXpUyeeHhh9XmExCjRHWJKo7aIUKcgdOeTeEb87X3PYpFWGt0Zirad0ILahFAkSdDGqledJoCB1/Qvj36pqLVWA0aTZU0Ux8SGE7ALJBrWiez9euWLCPSm+3xM8nqodO/v2zz8DMSwA9cvPfxY3vPbKBRCLjU3Cb9YM8TYOvckQuqGquu1tU0Zp6QddO9zRv8e9/zphxKmTCq6qWXO+P1sFHDA6W+Wc885YAXtr68NvcWeXO3mGBeQUKIgI2YHhxAxRyg4BxqkkuRChzE65DExiIYyxnZSRW1rUjpECIpaQJMpCOKrHqx63l3ITEcsgIhOeVCU+Yd2qHiVHW1geGPxkt4LC6AJJdgd8Lj+IlkQiRC8Y/forI5acTohwTg7HCQm7xdtuu8g4GUj1Gbnszp17I89j7I0RRBVEo+VBjMrH9c8Zu7TjMXW9TiSa/cDYsmW3dNttF5mV+8Th2VqL7OvYYNR37MyeDMRNkQW1BqqIxzcAtUrfbd2sSZe03jcdPJNJvKNdZidRqjFHVPwpEAPIke0kHt7T+k7bx6hxJTDqMXBJ07wS9IyAxUQIBSQhhTIrvH7k6Af73nLt70VHT3b9b77hMeOnzp6GXYFUDhXJBiNTLw3XSkS9VszvV4GNRz4tfwUj7PE34LbdjYSD0gnAaPz4p+O++LHwK8mdmAIwRpxZRGL6+ge7txnavkXNE9aNO/o6fUYsvmHXAfKGoiT6MMeQk6ipkcI1UzNHjmlSD1aKSmvVdUErBmKysSjXhbaXPdVO6mOUOnRet0P5wnxBSYi1wYjo4d3ILMmYOnHE6VmMPvvuWZcSaC5gWbbByAjnHwNGALRtO8NrutTlFpbvEUWvqApeHirKL1Fx6cD1L47OqWodHAaj6VNlnNIXIEWCWKdW9MAn8x8d3P6yYwroHmnLtthmZOSKV17ZgZ4sbUXFMfNe9v/4Y9HQiCYMVeSEQGlZGMbEuHmwbO92I3qwz5b1Uz+pqn/O944C1amAA0bVqabT1ikVyMp6I/atD7+dJ6hxHZGkynZUGWPMNIzQBlWkKxkDFY6WAsYgampcktSKaqHEoABSxgUBAIQRNHQzTnYnDAEQN5ZlWbIsC1CD/g9jc3j04L6PtmzJoEeAonv/5fX3FpVs9PmSEqkFIbKQiVkwu/mt9TIHHVNz60Sdv6/L6Eu1iHw3o+DLe9q0/6xf3+s0u5jV0WUdug3MuuRQAXvX5amRDJEIASdaVDswZ/qo0dMaNYI20Z3y06FHxgUlRYVtGjZq/MNljet/3K9No6j9wDh8mROXUKiqzSNg1H/s3J5ISZwMmZAsCAhCZIJg6Z53W97euMvYtOZnBEZ3d57WCQmJcwB2pVBgZ8PhgJi2xegEYDRgcYO8UrROlFwXAo6xiBUWCRa+PfXhfj2vrw9/CyM/2Tj+t4MnTJ6YPZcrno4ASKJdP8vUS0O1EuHdK+b3f+9YMLKwf7nsjmnAge18HS7Hlj772K20tPQ1vu+35X0gu5MuhwiJFVmcIqWf33jj5f2mjGz5dVWa9h6+vM2eA+YaRbHD9QXAzIhpmPlrHnl09HFgdGP72a0kJSFbUV117fBDSDTdiB5a8s66ccOOvU6fwfO67S/C8wUlPtaO1jobMFKU2Oa29x0nFjGiebkjB3c4ymIEgF0Q9vk3Ns5TfDV6cKRKkOCK2ikyCmasW9NvVlVj/zVc/1EB2T5Gqmz7GBFt78dPZk+oVBLkSDvp6Rwxdd1V73/0/tUej/DRq8/M2nGqa6Rnv17r0493rmLcd7MkugXT0rgkRn/U9YMPbczN+KCq/jnfOwpUpwIOGFWnmn9CW4cfmGf/sPwTunjSS6RPW3/b/77Zu4Aj95W2u7UoykDXzRBg4cd6Db17fsf/1D5FraoK60kFj8xY8aFn89tfzkXY190luiVdMwHhVh5A5jTJVbLymtrRyJHttNS07IS8Mn0T5/56GLkQI5wCpn+AUVnfV58Zc8qbtT2Qtl2mNo2E0RJJVgsgEF4SBLSRhwt+Xr8+4zfgSRufnfDzzsh/gRhoJMkxgmEYRDeKN9S9wJe2Yk6fk9ZxOyJU59Q5/zmYH3ocK94gEPF/L6iVsimqFf54RUJBtKoyFaeaz8MWo7k9KYqbJCvuFADt0mcWN7W89/5/Yc4uY9PanREYteo8sxOHvjmCHJNCOaqoDEL04j333XPzgL6dG1SyGKUOWHzx3mLzRVGNu4pxESsCZkak+Ju6Ke4Oi+d2r1Tr7ERjGDZu3UU/7SxaYQD5Vl9MDA4GSxnm4YILa6itls1L/eroc1rfN6ORjmKWu30JDamhAUD1cm4FZ6Z2bJbdsWP936Ka+mYsce39yXiOAW8zSZBVzgiDzPg5Et4/ftMrGa/YIYGn0rP74JX9S0rYLFHyeSzD4JhbJjOK104eN3JMkyaVLUY3dlraCmElWxLluj6XAiNlRTrRC5ZsWjf+ODDqN3hOt91FcD5SEmIJETlj+m6JlmXMmjz0ufr1K6egOLZ/FVFpW395Fome5qIoyroeJNgqyR01pN3Ilrdc8VvSym3buDQqY/Z4KgTGCrJfQQhzU9MIp9q6G1s365mZWscuUnvSz5df8sDEqQseBSjQR3J5ZMII0UK7Pl69aMC9KUcVkd26dau46OlvAgXF5TfrmtWDc3aB14smvbJ6TKUEoMdeyM7M/cWP3z/LcWxLyrCgKphHI4d+kEH5Q//NmVClD9S5vK851/77KeCA0d9vTs/LEa3cvEt54fHnJzMQO9TtiXOb1AQICpwxtjtUsmfwpvWjj0vQeLKB2HB4V5esvrKcOINq3O/xBECZFrIMK/QmROVjNj4/5ocjlpYdnMu975k0yeerM4IBVcV2mLIZKde1vGfqXX7hlMendz1pTh37YTJhRvawqAbTff5EJRgMRiAlxYJQvjB76riFl14KK7IgbuVcnNzpkaEEeCYrriQvB4KdX7qUkdJnrqiXOGPOxM77TwazW7dy8eF52QMjlpgJgKJALBqMaiXMKFgxe9LErOuuA9rZgrANRv3GLUilKHaSqKrJtm4CZdyIHnjvzlsvPmMwsi1GVAhkCWJMMuC2ZYwBapXsuf2mKweMGljZ+XrGile8WzbuejjCXL28vgQvIBbkVjgEzLKZ9a6o8cTs9AdOWBrC3rp898t1gZ0/7e/IJe8k1R2bEoxGgChSnUSL3kuIoV2fXTqqUrmYI2DkDSQ1BKZhW3LKLaNsRq/Ody44GowA5/Dm9hm9Pf6LpnCCayqyjDQjGMVQ3xQTAyasXZj27YnWnF1E9Yttn9chSJ2OBHdbBuwHt5sTI2hyrWTtrMdGjql3zFbarZ2WtqJInO9RvZcwYkJgaTo3i5e8/eKY48AodcC8bgfK4HxPbO1YO6NCsLRgt8JKM+Y9Mva0wOiTD797zu1PutOu8CthQqzggdzhvdqNbNnydzCyt2tbdZrWEooJMy2uXOZyebBpmkCPhosUCWYjK/IKl4r2bFibETry27Hn4oILStxrnn/hwt0Ho00oUQfI3riGukWwbhlExkUfrZwz8r4jCR7tsj133T++PeX+kViMvwQLahxETNeiRU9OGDx8dNOm8ITwZa/LMRmvtvpm+775sppwCQcYECvKICn9oGfXlgM6tr90+3l5U3M69bdVwAGjv+3Unl8DGzr1maSfvilcJCqJ7SkVsV2cyw61J6b2mQuXDvzvcyO/PJMej374pVs/++KX53ze+BqirALNNJlhhneJChl6w0VpG44UoLQfCHd3eKwjdiXPoVytwQFGooSYZZTkR6NlUzxY2JAS4y5YsqQvycjIgHaV8Zyc78TPftxZ89vtO64lBh7nCyRdG9FNpKoqiERCYUZKJne6s+miI8Vk7Rt7uwcea42U+MURTaotiB47soZzrpUZWsHKJtfVW1o3seZO+3j7WHucGRlbcJAUJn317barGXJPdPlqNJJdfsEwLBCNlIYxCE1tf1O9eWlprWy/oxNWJK9Kr827uDJzzKJUigMTBUVJqQAjxrkZOfj+7U3rPHCmFqO7ukztDJB/tiD6U2wwsuupUaLtbnZrw4HD+1b2MbIfknfe+2g7rKZMs4Bc1469UwTIEdV2RUKFT1/XqP6GGv+K+W5Ex/9UWAntvjVNzZB9uqs+A2pLCwhdFFfgUotzgTHKTaOsCNPowppubeZTT2VWesDe23Va4/yQZ2kgUONqwAkANBq0zOD0Ph2PASMAQGu7lheInRXwX3S7ZlCREZ2LIg0So/SZenVrZc5/rMtvhVftfuXk5OBVL+5oqFG5tyjH3M8BTnC7/dAwNG4aYYNZwWcee/R4H6MbWz7S2h9Xex6EwiW2iVfCSC8p27dky8vHg9H9vRZ1DRpitgmUWMBFLkNrt0hKMjJGDz0tH6P/ffbLc0B0/b/27jtMiiLvA3hVx+metJG0CqIgCigKKKinB+aEp5wgSDjAAHqnJ56e6RR4T0GJKgcqomACZQ2YsyCgGMAIKBkkw6aJnbvea5R7SLLs7uzuzOzXf3x87O6q+vx6Zr7boeo8RVFkU6uwtdi2OaNvH3TbWXutleaNZdITC5q+8eFXt0u+3IGS6M+3mcsEiXNKS7aXqpL4rUTph44dW3R825bm0c1bsPfee7Op5QgncoJytksDHV0m5ihqUBBkgURi5a7olnw+c+JdPfcKRtxlV919GRUKJ3FiQXPbkTlvynfTim8kbvyOFsc2WlAk9t219+KwvXrN4Y9q6y9cvnLD/YKc01+QgpJlmVTXSk1ilb10x41Dbj/33Mb71KSy8x7/HwKHFqj8sX0EI5xDdSJwTq8RbQlp9Jjia/QHm4gcL3prX2kuZybfIea2v73z6r8qveW0d0fvGv3qsd8t/2WuIIWOM2yOcoLAYtHSmEj0O0b87Z/Tu3en3qobu//584DRXSJxeaqkNjrJJSJHeG96PsNxHOtnw3G/dh1tTb4kbPMWm9dNS2WMFmi2054KYluf4j9Gkn1qwrCpJElOecWOnwQuesvZ7cx5e9/meu7VZR1eKv5gGic17kz5AOfYlNiO7gr/fe+a2clPXSv+oyDRrY7rarbjKIKgFhqm2Ya4rG0wt+DYSNL2S7LCua5rJ5NlqwKS9s+Q/fWHxcXFh7y9c6jiecHoodunDnH40H2CT27EMUIFlzArsW3RH88+vk+VnzHqd/9VjhueIEihZtyvs1FSw4xvPP/sjjfsH4y8fr3w8trWM19+5yFRyb2E5yVR0zTCE+ZIAt2VNCuWU+J+SRm3TRBozExaCsdxRaovp4vJ3BNdRguI9049T4koOE40sn1JvkruePXZuxbu/9D88BEvd16+KjJdkHI7sN3TESQith17cFiv8/+zzxUjQsiHS9aGHxz7/B2ir+hGy5FDquqjjqO5thHdZmuR6UVNcl5qFizcuovFXJnzCet/2XZq0qA3qGruabzoy/emWPDG4YVkU48YlMRm/d+/bj3gGaPz/jzhYlHMe1hR/K1c26GaphmWE3n849eGH3DF6IwrHuqnBps8Sjk1z1uf1zGiG0SzbOS/D/OttG+Xrn3RYsJ5OTk5shYrtx2ttPjem6+9tXv3Rvs8yzVvHhMefOLfpzkk+G+BD50l+/zEYN4jc5TpScOWqFTKXGuTbiStnNwg07VEiFC+gBd8+YLklwzT3r2MHs97UzW4brx8w+LHHx1+xd4TPPa6ZkSrkp3uA2qgqIfkK/AxIrLy8lJDUfifLSP2FaH64hy//4ecHL8VrUiomml3NCzWXlLCl5uW24xw3ssWlDE3urOiZP0jd/+1zyM9enSu9Dm9OvkSQyMNRgDBqMGUuv4GOuK/V22WDHjkUsMKTJbEvCM5SaZJM05Ezkoys2Ji36GXPDC4+6Gfcdi/9966aQuWrZwhB4t6Ej7g4ziO8MSyImUbnpo85c7bOjShiT37fPjh2vDkp16+2STBG6iY05gTVe9NNkJFnnhLrhl6whJ0w/YJAmc5JiepfupQ770r3luolvMpfmJY3jtIscWyqD+saWvfW1w8aZ/nob7/frv/1nsnD6Vi41s4MacZYzKvKEHCHJvZluYS13J4gZq6bXgTQIqy5Be8WxkiR71Jj0ggL49URMstQozvbL3sP63aNH/jufED/zeG6lRv0IgZvs0/JwYzLnSPLMvNqEupyKhjJLYv6ta9TZUfvr7wqgf7uDQ8TpbCRTwTKeUcohklGy+64NRhfx986nv799G7FTP3k8mddkSMSYIQ6CorYaolTep601t6FxMc16I2cSRe9CZg4DTDkVTVz1uWRf1+PzGMJOGoxWwzso04ZfcN6XnFc717t99n2RevzTFTP+k0b/Gmpygf7kCJ7r2VVuEaFQ8Nuva8yQMv6HCAYd+/P3zixjBvASAAACAASURBVM3GxFDuEWc6tiu6tk1kiSeOoWsCR2PRSHk8lJPnJjVd5gWfKsq+sG5YgqSopm2bvMjxnMtsKnKGHivfMHvcmDv2WxKE0TN6z7yI56RJomO2ylFVkkzGNc2IPjn/jeHD93c6s/fU/oIceISncp4iisxJlq2n5o4Ro+66+6XK1krznjFa/OWKWaIcPl+WZZ/AUTteurn4r30vvrV37/YHPOTuXZm78ppJnbSkPMNwuOaEJ/5gTi5nJGyq+EJES+hElCWvv4QKhPgUiURjCUeSfJaiKLxj2ZxtJoksUTdSuvbL2Y+P2Ofha+8Kbf+bJx9Xst28XZAKriRUVTgqurqlE1H0FlKx9WQiaXAcJaIoiZQS2XWIJPqU3fPFCyLz1nDbQlnk6cIQ99js6ffgalF1PvzYp0YCCEY14sPOhyMwYMA4/w5duIUTcu5g1BdUAyGSNKLENio28nbsbx+8fPvb1Xn76qK+998St8MjeSkc8l7rF4htm/HtH/Xrc0m/a3u332cSwVvufOyolesr/sHEgisJrxZSwvOE40nSNokkiCRHUog3JQDjCUlaBuN9AZbQEizslzgtmbSTmv2LwFu38eqO9+bvdytnj8HtI2Y0+WHF1r/JSuMBjusr4jiV9+b2o4wjPE+pN3Glt4SsdyuCEcLisRgL+VRm25a3gplDBGdLRWTLqFNOPm7u1FE1Xwph9xWjf/1niE0CdwuS2JS4jBMZb5vxkoVnnXlsv3uGX1jpivJ7xub9oF509YQ+LguNFcVgU54KnMC51LBKN5zT/YQbbr32zAOCkbev90PZ969Tr9lVkrhfVXNzXU4VLEap4JNIIpEgPioQQzNJbm4BSWoG4UXZu4JBkvEokXjbccxIlCOJd5u3zL9j+tjrNh/sfBsz9f1O785bM11Q8k8SBea9lVbumJGxw/584QFXjLz9vWfH7n9y2pU7dhr/JNTXNhTKFS3DJMz25iP3ZmAnxKcqxNC9KTddLyi48WQyqajyj5auncyII+aEQlykfIvu42Kz7rv35r0Wkf31VumpfZ66WOCUiWGJthaZy4jr6padnPbu7GEHBKOuVzzaLxTKeUTgxDzOtYkZK1knseiIkffcN+dwgtHXX62YxSuh83le9LmubSfKts8Zc+/N/+h+auCgb//NmzdPeGDi5z2lQN7lRKBn2g4rVMQwb5ouz/MSlWWZOMxybcdyE0bCEHhpA8fxyygVmlu60UngKSfzxLWN7V9Oun9oz4O9rn/xwNHHmjFuMqPh03z+HEUUZZrUtD2/NywQCFLbtqllmDQQ9BNvvUTLTjKeN3ZZVvlTkkInvTvj7krnuzqc7x9sA4GqCiAYVVUM21dZ4NJe9xQ5NGe8KOf3sBxOVAMqn9DLnLKSLYsDnNvv4zfv31qd52h6Xzfu3Kjmn+KQQHNVVcVI6Q5XkfUf83PoVc9PvXWfN5+8H/Z+f5vQfOdO7TrCBfq7Ls0LBHMlw2G8IiokUZKkfn+AuiJlSddhmk2Jt+isq5UbrqH/4pPlZxWVn/rG09fEDgUw6MaxTVb/UjK4SeNW15eXJ5v41VzmOlQQRVlglLqGpROXOISTRSYJIhUsl0QqyrWkHdnMi/bzBS0CU+Y+PLyiysgH2WHEiBm+xWt3DbZc5W5eEAq8H3zRFV1Tr/j83DPbD6xOMHKYfywvBAqp97AWdZmW2LXhsh5n3nTLkC7v/16frxgwspHjSDeZjq+nQ/wtCCdL1Cd5U1gxRaCcyAu0Ip50FTVEdNOi3mznrmPozIpvYWb5J0WNg08889hN3//evFOTnn6v49z3fn5S8OW3E6jt3eKqcK34xKsHX/gfb+qDg/XLe0Nt46qSKxkN38lxgaNdh/KUcZxfDXG27ZKkrhHvqpVp6vq2ndu3FBYWfK4ZsXm2bowNBQOSoel8wM/Zpra9+P4H/nHAkiBn9Jt8ke0IE8M+oXkynvAWf7GbNi2Y/tKjV/5j//70GT776q2btk0SOS4n7FeJHivdyLuxkSPufqD4cILR0q+XzSKicg4vibvfiCRmbO6df73mtkv2u5W2d7vvvLNanvDkGy14Yl/ImNtT5JTGkiTnGabJ8wKhSSMWE33yFkEUv4tq+hshIf8Xi/C3qFLwL47jiAJhTiy66Ysp027v2abZgRM8zmGMf/qqe86lLOdvpiucJklKUFb83t1RanhXnSyHCjxPecpR701T3YgaLtFKmRN7O6yS8a8+M3J1db4TUvG5wTGqLlD5UztVP2Z97pGyYJTJr5HXZwEaQtu9+v+rTUWCH8zzwYDjMsaJhE8aZY4qcx/1PLv5O0OHDrWq4/DXu/6Tv/ynsgEuVVpKkiQIHCHMiMYco/SZj95++KCz5d5006MyyfEfJ3LBk7/95rsTXYE/kmd+ISgViLrucglmO2IgYJTG43FVplvCPvP741o1/cItDeyY/OhF5t5Ljvxen1evZvIjz848ljhyh5Ur1x2ta3ZLjkqqpPr9HEcF0zUc0zQMQmlCdNwtJ5zY/ntGrS9oZPvWyZNv3v2mWyr+8d54u3P8vWfYrnwhFXiFOd5DOzKxjdiGC87v9PRdN15a6Sr3e/rhfb4v7vNAF4dJfya8ojquQ6h3w9HVo5eef/rzf7+2+7JD9dl7syvpbG3JSKjbj6vXtTAc9whCSVgRJTmZSPByIOAahmNalhWRfOIWkWMb2jTP+5wmy1ZVZjLh6blHzn196QBBDDfhiOXdujQItefdcf3gTy6+uPXves5jTHjzvpfa6czXdeOGTW2SCasFx4kK5UXOZa5JmVNOefptm2NbfWjx1vpEaSTv5xUrbszLzZFsw+K88auS++0D9w57pUOHJvvcsus1/IkTykrifV1Lz+F42TU1ZuXl5X/x+vQhL+3vdH6f/+sicOJVpq57N3eJyDnlIZV/64VnRi6tbAoB75by/O9XDhVUXyvvwX3vsqlrJFcoovXyR8UPHWKZkz2ThzJ6/ci3lBwWzyEaDVNZEwixXMqJCSNavuO004ab3uSMi35mwXtvn3x/IJB7PUcl2Xvy3rZ2fSI6W69+7bUx+0xuufc5M3zkzLBjyh1Wr95wpmmZRYbt5ufk5vkT8SSvqAFX05I6T1hp0RGNl/hU+jlRzLXTRg7FM0Wp+ALAMaotkLJgVO0eYMesF/BmvCakndCuXVtSXq7vfsMqN3cdXb58uV2TeXq843gTyZFu87lmq4I0N9dHFy78hBqG7E6bVnnY8m4prIrHJVsLcO8996mP0hzekF2LRRzDbFbgkA0b7PnzR/3vIe7qFMobe36XLqK8qRFv+Rxl9cq1QuNmPjvcKNcwiOxECg1rVPfuNWrjUP3aPbPw/Pne7y3xjLx/T1s6jSx54gm7qn+Re9bt2i0XvBpuPTbG9hzv+us7VelYXp8mv7tG4uOG+OrsN2S/jwmMyA5VHOOY9i3t044gZu/evav00Ln39tjywkLq9cnr26j5810yatRhL8fi7b+LFCoBQZXfmvcx17Z1c+ODhUutz+dM1Pd28rbb411efjSXm7vOPVhf97i321XI7TnnZ89+kx3sfPK2nTZtqbDnuF7/R3br5hxufUaMGCE0a9aDen3xDMjuZYfnu4f6bHlvgxXP6XXYy818u57l/PPWieNkX95AUfJLrusaiYrNsxqHYre88MKoaGWfjb3GKPK5ps/SmSD6qC3pfqOiQLVvuqhVtd++rKxt/H8IVFUAwaiqYtgeAhCoBYGaLX9SCx3KoENW3a7LRSNCjZuqbO/JUA814H/c80qL735aP9vvb3Sq5VLesMwEx2Kjjm/CPVrZFb0MgkRXIbBbAMEIJwIEIACBrBVgdMQIb36uUe7EOZ8rb7z6aWPG8acYcefvxNU/Civk0feLR+3zosL+FN5t0AXfLBzCq43HB0OFgYSmuQ4xS5LxbcMWz73r9eq8OJG13BhYVgggGGVFGTEICEBgHwFvIs0arjVXPdFf30rzXjv02v81lIxkv/539SbqrF4/ft3Lu5U7yvt3u17CvPc+vtzR7T8xm3ZWfcFmZrJ8jc+n/fOD50d8+HttePv/sDZ0guaoj7hUPV2U/aJmJG3T1VZTo/SGha/d/WlN+od9IZCOAghG6VgV9AkCEKiZwG8zjNdHGDmg4/+ds2HESPLfgOTFo9SFo1+f3RtJRo0k7PfH+esVo8WJgJIokUdwDrlGFVQ/dSXRsTSdcrGP27Zp9ShHyUpBpBVK8pvEqJEj2YiRxWKZScKr1m8+zrKk6xxXvkz2B0PhcJhu37HJlGT3Aye2bfj8N0ZVuu5dzQqJvSFwMIHafQ8OwQhnHQQOIeC92TVt6VvHBMN5QcnQ1o35y7kHfQMnlYg3TpkSMGnu0aIokeOLOqy8+RBvVlWlXe8B2KETZuczJXzELrOCqDLZOOvGg68V9483lxSs27KtiFLG+11783M39NxZlbYOte1tz77vLzetlpLIc62V8Oo9y4LU5Pje2AaOf65QzWvUdJfOpApOokmHUllyXUUUiKA73nyFxEd11zETyXNP/8OGoZ2b1fjtp92TWG5+pUVcVfK8WQx0k+O8J+ljRpJZokCiBmOSqzA1kbAKWeSXt+86/DcBD+Vx/rhn/URq3NLyEb/kU5hkmIwkkyRfDVol8V27zu7aq2z4aeR/D457IWqdedwpFbsi9ySi5mmUqgFe4JgomA7P0WQ0mkiInLDOdbgveY5ahmMWibKvK3Npvk8J5POiX2TeDN563FZVuiYW3THmht4Xv3iwCTdrUkfsC4F0EEAwSocqoA9pKzBszsdF5ZZyH3WdDqR056Q25T2L917rKdUd3z3f0sPFHdxQ/l2mZUhNc4J3TOlz5qpUtPPEEiZ+8Nlb59mh/L8nZSK48bInH7ruklc6U7rPdAkTP9+kfPTzqj5xUenDbFvKc4wnX7/2vFmp6IM3vgFT3jw5zsl3ctSR84yKe6ffcvUPNT32iDnLpCUl8d4Jkevtqr4ClxOYw7uEZw6LRRI0J9iESpTjZG8pi61rNoatitGv39r7oIvGVqUvTy36OfjKV2v/GvP5L1EKm0qm6VJCbMqJlsu8F9852eUsxvidsUQ4XvLg3Dt6fFyV4x90W2/qhIkft94hkNuVpsETbJtRVydunpLPtEhC55mzhnP0b/2iveji68/6eehv9X1zyVZ11pOvnVWyM3GDGi7qrpkGT1yTF0VeksQgNQ1iJzXdkCSJSD6JN11d4kWO82ZoV2SZJKMRl7raDj1eOq1p00ZTimfcnKUTMNbu1Yga1x8HqHUBBKNaJ0YDmSww6OUvWsfE8AzH1k/Jd417Ljg+8Gjv9gcuS5GqMXozRV/9+Lvd7Lwmkw3T9nFGWd+511741eEd/9Bf6F4weve7RX30UKOHEzL1s2Tk7dOb5Px9bPfW+8woff3cH05YFXfHkmDwj5ZlaFJk54PzhvxxfEpuSzFG+z7+SXc9EJgsclwgV4sOOCd09mfeXDmHN8aDb3XTo+/IG6WCYYbfd4PrVxob1HZcjhNcbzZJ0U8NjegSJYQzIk7QrljLl2z6+2vDey+uSZvevg8uWRt+97M1o3OP63DNrkSC+gUhLgmOrcd2uMGAj9N005VdwVU0uyzfNu+aMuTMt2raJmGMnjXpo/akUZP/kBz5dEKImSP6TSOqu9SR6e6FN+xEghgVPzZR2ZNHB/j3R/420aU3seP7nyw8af3W+Kikwx0nCFy+IMoqcyWOEJnwvERM2/YmhScuMQmh3kLBusMTS+NsfS1zkrMG9rvy+b5/Om5rjceBA0AgTQUQjNK0MOhWegjc8Pr3bXbxwWdManYK2/H7zg7lT6rqum5VGYkXjAbP/vScEilvsuYwKeSUDXy1b7fPDndOm0O15S0iOmHjoquTuUWTkxwNMccuk2PlYxrLiceLe3ePe/MUrWi3LriTWUM5n3KXTViOZibLQnpk7Jlruo5LxZWy3VfEnv60W1TxTxV4GgjZ8YGXin9cUNNg5B339uc+OEoLhFuZkqIYPlnaphlnxph0lcV46qP8LL9rfRZM7rSbClY0YGnfPtiv5re1HlxSFn73m5Wj3SaNB1sityrM7ImqndyYxxOWIxAiMcYiZTtZSFaNEBXW3d2zS0puxV725IITywOFjxNVbS8S55FCGv9csR3bdPzBUs3uaPL0AsknHcP0+OaAmZxYYJbMmTa0x+5bh57V3WNmFGzbabTbFTN7aSb9o6HbOYoSVCTRp9qmw3mzdzJmJoljJEwjui6o8h/kqMo71/TpsbL7761riAstVfmoY9s0FkAwSuPioGv1L3DzmytabybqzIgb7ZzPmSMvCtR+MBr04rzu2+Umk3XHlsNGxcDX+535eaqC0fhfPuuXzG02URekPMpzNovHvgpQ9+7Trzjus21Ll9LVWwpPrTDsO1RZOIcKVDYsPRLUomM/6dNpbCquGHk/ylc9+2k3Tc19zLZNNd/WB14m/2FhTYPR/meKt3Dx4pe/7F3GlIdkf5AJWuyuRu6Jc4preGVq/3a8K0Yffb9rdCI/b6DNuV/lUHfYh5cevyYVVoc6+y+b/unJpf6Cx2xeOEoyYsP6H9/p7aGdqeX53vxuWXBZ+aZzI6Y9VPEpXWVLX3qUwO57qm+nAwL2s+9/7/9x+aaOK5evbJ3UjGaCILfgKC9QRpKOZWwgxNp80rHHft2xXdtf8DxR/X8foQd1I4BgVDfOaCVDBa55fVmrMjlnRsQqPyWPJv/vknaNJg5u2VKvreF4V4yGzF7QbYevcHLSduWwER04t/9pi1MRjOYsY9LzSxf1T+Y0fsiRFUHwKW6ivFxw9ORLRzUrnPTLjm2WLQdvdSl/ScAn7WTEKYrFIr4C23ro9BWdUnbFqPeMBd21YN5Ux3XVsBsd2JNPfTDyAsIFM+b/2c0vGhuLarasx+789NozXkuF4961nzRvfc68jZtGlyr+/o4kfiU5zg0Lrjx59e5tdk8ZkLq30HYf87erMl4wiubkPeEyt0jRS6+/Ri55b+8ZuId/vkn5bmtFD1dVxhnJhBI2Yo93bVY0etTvXO3xvN56a6niKnlBgaeU8rajOEKsW7ejjFSb1dZnB8eFQKoEEIxSJYnjZKWAF4y2S8GZhpvslEfj/+6a02TSracfqdXWYP8XjOSCKUmHiXlm7C+v9OuakitG76xeLU//YtuAeLDRg66krlEDgW/1WOJyzdAEl5LZSdNQRL9yEaF2eVBVxhu6PkxPJI4NGdrYfHHL+OIqLtNxUCPGaM9nvzgnJvunCALvCzrlg45vdMbCUd1pSpdF8RYxnTH94ysTwUajOV621PJd951y3Rkvj6L0sJcJOZwaT124Mfe9NWtGx4ON+pmCuJEY0ZmyIGy0tYRDTZsP8w4pEOW4bNjfTR3c/aCr3R9OO/tv0+uFz07awatP8gJr7k+UD+vRLvzW0M6df32I/repCk57dnEzKxyezvPcWXy8/OtuRTl9R5/Vdlt12sM+EGhIAghGDanaGGuVBa55b02rjbYww3GSHZvK1gOdQ3m1HowGvbiwe6lcOCVmO2KhYwwq7tNxUSr+aveC0VNfbhsYVwsfsgX5e1UNTtAi5QM5QTw35nJRKnICdaKy42hzQ371Ed0yphCHa6fE4+O6NjMnpGRNNy8Yzfn6nAj1TyHEVUIkOejEwlMX1EYweuG5BVdVBJqMtmzXDJRuv+/aYd2Ke9OaPeS9/wk09YeNuXO+WTeaBBsPsgnPOMuIW0bSdhhxRImjPDGJz3E3ypp1f8fW3IcpMSSEXP7CJ53KxLwnBSYUqfHosB4dpP8Foz2TOnY7aVCo1DEnBwO+nqx8x7pzmudefv8ZrddW+UOAHSDQwAQQjBpYwTHcqglc/87qY9YxeQYlRscwS45u36Tw4ZEpmP/m93rhXTG69sXF3bcouVMSpi0WMmvwK71PXpiqYDTzy20DK9T8B00qfqNKyq0hjuRH4sm7S1z+FF4kvGSVLsgJyxOIwK+IJq0XLc1uH2ZkwhGtuAnT9lyRqBrhvlszRv806+tzkv68KaapK7k0ObhDwSmfpjoYec8YfTdzQZ+SYOF4QfKZ4djOO0++usucVF8xGvPDxtw3l6x+UM4pGiTKgWTYJyxlrq0zkXJUFHjbiNqCZW6gJdFn2jYzvklVMPrz7EWdK/z5092k3ThoWUNPPiLyzv+O/dstvFOf+SnfCslTZM79k2iULT/jyMIrHzyt5YaalA/7QqAhCCAYNYQqY4zVFvjLa6uP2Sn5nqYc66QYkTEtFffh8Rd0SFT7gJXs6AWjQV4wUncHI6kpZw16pWeqghGTp3/x2YBYIP8hjXFLZY67pX+HVuve/25lv+0OfwdhttPcZ4w86aQOb3y9ZpV/c3mkWNdI+zxOnNSVF8eP6p2CaQq8Z39mfXGOFWo01bY1Oc9ODqmNYLR7vqQ5S/psVQsmapZphOMld3YZcHqtBKNPVmwaKwSb9LcYv0LhzH8FfNwvRJK8t+gJ5xpM21muK7pY8kK/LrFUPXN09VtLO211pOm8bjcL2foNF7YR39z7Vpo30/a7x/zQQgqHn6VEPy2XMz5q10jqN6bL8Sl5K662zn8cFwLpIIBglA5VQB/SVuCmd1Yfs8xgMzmePzns4x8qoM6j5eVL49V73qby95l3B6OXF3ffIoemxE2bbyw4Q+b+KTW30ryHr2d/t6h/LFAw1mDuEoXZt71/xYnL+774RYuEnHezwFmxDkeIk0d2blMy7LM1jdaUJV8yXOEEPqk/fJQeGT9zcPcaP3TuTQmwuN2Sc3RRncJcx1doJ/9yQqMuKX/GyAtGvWYuvKo0v9mjCcsyc42KW9/r27U4FVfe9j5ZvStG81dsHavRQH8qi1/n+bmhJ57beqW3zYriYlrcq5ebqjC0d7uXzV7UOSoHposcPcLPjBvPbp/7+s2tWpleIFrRbrmwyxZDvI+7wOXpGN5OBAp4fdrpUt6IVM2inrYf2Abescq/YRo4UGXD/w0QwagyKPz/Bi0w+K0fjt4mB6dXaOYpik+eFGL2k67paCG+3GzV/Gi3WZ7tbl1puM2Cpc71nTrZNf3h9YJRv1nzzy7PbTSlwtD5Qs4ZcvJlpyxKxS2gX99KW9Bfy2s8Nm6YX6lC8raPL++6wlvWopgsaB6W5WTRZV12eW0NmresyYa4XZywpbaioU08VotOmDGoW43fUPKC0TcdvulWQchUnjFfgakN6t3nDwtT/ezP7mkBnl/UpySnySOaaznBeMnw968+86Wa1mf/D8P0ZZG82d8sG2cHC/u7PP+VQLW/nXRSu1UlK3ZwulRC2x7Vzi6z17A8w2ArVqxwqheoD/wIXj7n81NjcugJ09Fb5AYDt+UJ2qsJWTOim4nC5Nzjkga9mBeFi/wiacmi2+e3CYrjHu7RpcYTWjboLwMMvsEIIBg1mFKnbqDej06qf2BS17vUHumvb3/TYg0Tn4xS/nQqiktEwi31efec9JglcoSY8YgZFnnXKtv1YxvZ/9G4Aecna2Kzez2zOR9328AFHksyRzhC4a5tc2nXBakIRk8sWSJ+tNrot5Py4xyeLsml1m0df/zwp1GjRrleuyNHeivBj9r91tZd36wu/GpDxcsJIrdTGJtQ4KycUNy7t1lT3V5z5vCxZE43Pr9gqpmMq02JO/DS3n9cUDvB6NM+pTmNH7aI46jlW259d8D5KQ9GEz/flPf++s0TSLjJwKTt/OIT2CzTiG0P+FU+FinlQxJv27rOeEosWYsueXVQjyWpuILU8/n5p8R8wSeYJB1vU+dDRs3vdItYIucPE1dsb1nslJDEB4RE6VfHFwbH9Gh9/CfdW9IaX/Graf2zYX9clcmGKh56DAhG2V9jjLAGArfO/fTIn006zQ0Ez7Ipz+uaa3Kc91wtR5mlcxKlLMgTi6soffG8k7vcfW37cFkNmts9K/F1M9/6Yzw3/7GE4/oCTuKaK3qd/2kqgoO3IO5D37/XjzRqOiauxb5X7fg/26/8YtmeMLR34L3zrYW5PyW516OucEJAFMY1bcHGpeLha++h6LXFH5+jc9IUgRIlEI0MKBp0aUqC397u3lj6v/BR3+2yMoEKnBkoK7n9tSE9Un4rzXsr7YOV28fHuNBAIirENqIxkeOIly4lnieOoTHCTEp5IRkgiUknFLiPpOIB7Gtf+KRTVM59wpB9HXdqiTgNSC7jJE5PWDSkhl2FCAlSUbamXb7y2KWtj34Noagmn0rs29AEEIwaWsUx3ioJzPh2fc7X6zcNjjD3REuQfRzxcabJOEnmOcIR4lgm4ZJxK+QY88/r2PH53u0bxavUwEE2nvz+kuN+KK+4LsZMKU92p0654pKfa3IVak8T3i2zN0uK/6CpoV6SyG1qfUzjF0Z17bDPOml7th0xb55v03b3TkPwH2nEYm+0aym8nYofdO/41818o53lE4fo0YTUxOebOmlAasa3P+Xo+d+ctqw8McA2DJZrRJ9/4i89U34ryVtw95u1P/VLCjlnUCWkSBLjGGOSabkcz1HiFwXXNgw3kkwkgsx87XJxx+t7T8RY3XPltmffb1lKfENIUG1d7lgOp/qI7rrUR31JI2Gs9zNhXZ5P+Hlgx7Y/n34krbV5t6rbf+wHgXQWQDBK9+qwdO5g7fetvm/bee1/VkICokwkgxJOSxD6y4addNUvG6nmVHDhQICWlpWSNqFA4pbLu0VSEWDmMSYIERL8eOF8/tJLu0U6/7Y6eiq0vcDTrlVHNdcfcs7NJXF6iHl9XvhhY+5XX34nnXvJKbEezZrtXmcrFf94t/SWLl0VDgaDpG/fS1M6vr37t5ox+enXPg7k5+bQtkd0il3cmhqp6P/+x5i3kwU+/XKpL6+oiC5bv1ogEie6TOR93lyLsbgrc4Lr2tSWzPL42Gv+FEtFH7wJLAsrSJDX42KgSYBs3x4nJBAgX82fz86/MdNUSAAACy9JREFUtFvCIMTqTlM7aWYq+o1jQCATBBCMMqFK6CMEIHCAQH2HZpSkdgVQ39r1xdF/XwDBCGcHBCAAAQhAAAIQ+E0AwQinAgQgAAEIQAACEEAwwjkAAQhAAAIQgAAE9hXAFSOcERCohgDmMqkGGnaBAAQgkAECCEYZUCR0EQIQgAAEIACBuhFAMKobZ7QCAQhAAAIQgEAGCCAYZUCR0EUIQAACEIAABOpGAMGobpzRCgQgAAEIQAACGSCAYJQBRUIXIQABCEAAAhCoGwEEo7pxRisQyA4BvI6XHXXEKCAAgd8VQDDCyQEBCEAAAhCAAAR+E0AwwqkAAQhAAAIQgAAEEIxwDkAAAhCAAAQgAIF9BXDFCGcEBCAAAQhAAAIQwBWjLDwH8GBsFhYVQ4IABCAAgdQJVP5DiStGqdPGkSAAAQhAAAIQyHABBKMMLyC6D4GMF6j8D7jaGWJ9tVs7o8FRIQCBFAkgGKUIEoeBAAQgAAEIHFwAKTyTzgwEo0yqFvoKAQhAAAIQgECtCiAY1SovDg4BCEAAAhCAQCYJIBhlUrXQ17oVwNXvuvVGaxCAAATSQADBKA2KgC5AYI8AY4xSShlEIAABCECgfgQQjOrHHa1CAAIQgAAEIJCGAghGaVgUdAkCEIAABCAAgfoRQDCqH3e0CoE0EMBDVGlQBHQBAhBIMwEEozQrCLoDAQhAAAIQgED9CSAY1Z89WoYABCAAAQhAIM0EEIwOsyC46XCYUNgMAhCAQDoL4Ms8nauTFn1DMEqLMqATEIAABCAAAQikgwCCUTpUAX2oewH81Vj35mixUgGclpUSYQMI1LoAglGtE6MBCEAAAhCAAAQyRQDBKFMqhX5CAAIQgAAEIFDrAghGtU6MBiAAAQhAAAIQyBQBBKNMqRT6CQEIQAACEIBArQsgGNU6MRqAAAQgAAEIQCBTBDImGGHV8Uw5pdBPCEAAAhCAQOYKZEwwylxi9BwCEIAABH5fAJMU4OzYT6CeTwkEI5yREIAABCAAAQhA4DcBBCOcChCAAAQgAAEIQCCbg1E9X4XDyQUBCEAAAhCAQIYK4IpRhhYO3YYABCAAAQhAIPUCCEapN8URIQABCEAAAhDIUAEEowwtXP12Gzcr69cfrWebAKYjybaKYjyZLIBglM7VQ/5I5+qgbxCAAAQgkIUCCEZZWFQMCQIQgAAEIACB6gkgGFXPDXtBAAIQgAAEIJCFAghGWVhUDAkCEIAABLJbAM+l1V59EYxqzxZH/p8AHpbCyQABCEAAApkhgGCUGXXKil4iHmVFGTEICEAAAlktgGCU1eXF4CAAAQhAAAIQqIoAglFVtLAtBCCQhQK4lpmFRcWQIFBtAQSjatNhRwhAAAIQgAAEsk0AwSjbKorxpKUArkmkZVnQKQhAAAIHCCAY4aSAAAQgAAEIQAACvwkgGOFUgAAEIACBlAvgKmnKSXHAOhJAMKojaDQDAQhAAAIQgED6CyAYpX+N0EMIQAACEIAABOpIAMGojqDRDAQgAAEIQOBgArjtmF7nBYJRetUDvYEABCAAAQhAoB4FEIzqER9NQwACEIAABCCQXgIIRulVD/QGAhCAAAQgAIF6FEAwqkd8NA0BCEAAAhCAQHoJIBilVz0acG/w+GEDLj6GDgEIQCBtBBCM0qYU6AgEIAABCEAAAvUtgGBU3xVA+xCAAAQgAAEIpI0AglHalAIdgQAEUimAm7Op1MSxIJCNAgf/lkAwysZaY0wQSIEAgkUKEHEICEAg4wQQjDKuZOgwBCAAAQikUoAxRimlLJXHxLEyVyALglEt/V1bS4fN3FMFPYcABKongC+T6rlhLwjUj0AWBKP6gUOrEKhNAfyU1qYujg0BCEDg9wUQjHB2QAACEEi5AKJtyklxQAjUkQCCUR1BZ3Iz+IrP5Oqh7xCAAAQgUBUBBKOqaGFbCEAAAhCAAASyWgDBqNLy4npJpUTYAAIQgAAEIJAlAghGWVJIDAMCEIAABCAAgZoLIBjV3BBHgAAEIAABCEAgSwQQjLKkkBgGBCAAAQjUlQAesagr6fpoB8GoPtTRJgQgAAEIQAACaSmAYJSWZUGnIAABCEAAAhCoDwEEo8NUx4XTw4TCZhCAAAQgAIEMFkAwyuDioesQgAAEGqQA/lJtkGWvq0EjGNWVNNqBAAQyWAC/xBlcPHQdAlUSQDCqEhc2hgAEIAABCFQuwBijlFJW+ZbYIt0EEIzSrSLoDwQgAAEIQAAC9SaAYFRv9GgYAhCAAAQgAIF0E0AwSreKoD8QgAAEIAABCNSbAIJRvdGjYQhAAAIQgAAE0k0AwSjdKoL+QAACEIBA3QvgxcO6N0/TFhGM0rQw6BYE0kMAvxbpUQf0AgIQqCsBBKO6kkY7EIAABCAAAQikvQCCUdqXCB2EAAQgAAEIQKCuBBCM6koa7UAAAhCAAAQgkPYCCEZpXyJ0EAIQgAAEMkEAs11XpUrp+/wiglFV6ohtIQABCEAAAhDIagEEo6wuLwYHAQhAAAIQgEBVBBCMqqKFbSEAAQhAAAINQiB9b3XVNj+CUW0L4/gQgAAEIAABCGSMAIJRxpQKHYUABCAAAQhAoLYFEIxqWziNjo83JtKoGOgKBCAAAQikpQCCUVqW5eCdarh3fDOoSOgqBCAAAQhktACCUUaXD52HACEEiRmnAQQgAIGUCSAYpYwSB4IABCAAAQhAINMFEIwyvYLoPwQgAAEIQAACKRNAMEoZJQ4EAQhAAAIQgECmCyAYZXoF0X8IQAACEKgzATzSV2fU9dYQglG90aNhCEAAAhCAAATSTQDBKN0qgv7UowD+FqxH/LpvGuWue3O0CIEMEEAwyoAioYsQgAAEIAABCNSNQPYFI/wVWDdnDlqBAAQgAAEIZKFA9gWjLCwShgQBCEAAAlUUwB/JVQTD5nsEsiYY4TOAkxoCEIAABCAAgZoKZE0wqikE9ocABCAAAQhAAAIIRik+B7CCfYpBcTgIQAACEIBAHQogGKUYG8EoxaA4HATqQgD34qusjO+6KpNhhwwRQDDKkEKhmxCAAAQgAAEI1L4AglHtG6MFCEAAAhCAAAQyRADBKEMKhW5CAAIQgAAEIFD7AghGtW+MFiAAAQhAAAL1LIAH6Q63AAhGhyuF7SAAAQhAAAIQyHoBBKOsLzEGCIEsFsAfwVlcXAwNAvUjUKVghO+g+ikSWoUABCAAAQhAoG4EqhSM6qZLaAUCEIAABDJaAH9FZ3T5GnrnsyAY4RPY0E9ijB8CEIAABCCQKoEsCEaposBxIAABCEAAAhBo6AIIRg39DMD4IQABCOwRwAV4nAsQIAhGOAkgAAEIQAACEIDAbwIIRjgVIAABCEAAAhCAAIIRzgEIQAACEIAABCCwrwCuGOGMSE8BPOuQnnVBryAAAQhkuUB6BiP8KGb5aYfhQQACEIAABNJTID2DUXpaoVcNUAAZvWpFZ4xRSimr2l7YGgIQgED6CCAYpU8t0BMIQAACEIAABOpZAMGonguA5iEAAQhAAAIQSB8BBKP0qQV6kgIB3MpJASIOAQEIQKABCyAYNeDiY+gQSL0AnspKvSmOCAEI1KUAglFdaqMtCEAgCwTqJ/zhamgWnDoYQkYIVDsY1c9XQ0aYopMQgAAEIACBBiuQ6SG+2sEo2yqe6YXMtnqkZjyI76lxxFEgAAEINBwBBKOGU2uMFAIQgAAEIACBSgQQjHCKQAACEIAABCAAgd8EEIxwKkAAArUkkP23MnELvpZOHRwWAvUogGBUj/jZ3XT6/yimfw+z+wzB6CAAAQikowCCUTpWBX2CAAQgAAEIQKBeBP4fr0xkA4LuYLQAAAAASUVORK5CYII='

        const formattedStartDate = new Date(report.startDate).toLocaleDateString("en-GB"); // dd/mm/yyyy
        const formattedEndDate = new Date(report.endDate).toLocaleDateString("en-GB");

        doc.addImage(logoBase64, "PNG", 155, 10, 50, 40);

        // Company address
        const address = `Ace Holdings Limited\nP.O. Box 1246\nBlantyre, Malawi\nMobile: +265999257356\nwww.ace.co.mw`;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(address, 14, 40);

        doc.setLineWidth(0.5);
        doc.line(10, 65, 200, 65);

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Sales Report", 14, 75);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Report Period: ${formattedStartDate} to ${formattedEndDate}`, 14, 85);

        console.log("DEBUG Report:", report);
        doc.text(`Total Sales Amount: ${new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(report.totalAmount)}`, 14, 93);
        doc.text(`Total Items Sold: ${report.totalQuantity}`, 14, 101);

        // Table Data
        const tableData = report.salesData.map((sale: any) => [
            new Date(sale.timestamp).toLocaleDateString(),
            sale.inventories.map((inv: any) => inv.name).join(", "), // Join inventory item names
            sale.quantity.reduce((sum: number, q: number) => sum + q, 0), // Sum quantities
            `${new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }).format(sale.amount)}` // Format the total amount
        ]);

        autoTable(doc, {
            head: [["Date", "Product", "Quantity", "Total Amount"]],
            body: tableData,
            startY: 110,
            theme: "striped"
        });

        // Chart creation
        let canvas: HTMLCanvasElement | null = null;
        let ctx: CanvasRenderingContext2D | null = null;

        if (typeof window !== "undefined" && typeof document !== "undefined") {
            canvas = document.createElement("canvas");
            canvas.width = 600;
            canvas.height = 300;
            ctx = canvas.getContext("2d");
        }

        const salesByDate = report.salesData.reduce((acc: any, sale: any) => {
            const date = new Date(sale.timestamp).toLocaleDateString();
            acc[date] = (acc[date] || 0) + sale.amount;
            return acc;
        }, {});

        const labels = Object.keys(salesByDate);
        const dataPoints = Object.values(salesByDate);

        const chart = new Chart(ctx!, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Sales Amount (MWK)",
                    data: dataPoints,
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        const chartBase64 = canvas?.toDataURL("image/png");
        if (chartBase64) {
            doc.addPage();
            doc.setFontSize(16);
            doc.text("Sales Overview Chart", 14, 20);
            doc.addImage(chartBase64, "PNG", 10, 30, 190, 100);
        }

        // Save PDF
        doc.save("sales_report.pdf");

        return doc.output("blob");
    };

    const triggerReportGeneration = () => {
        const filteredSales = sales.filter((sale) => {
            const saleDate = new Date(sale.timestamp).getTime();
            const start = startDate ? new Date(startDate).getTime() : 0;
            const end = endDate ? new Date(endDate).getTime() : Date.now();
            return saleDate >= start && saleDate <= end;
        });

        const totalQuantity = filteredSales.reduce((acc: any, sale: any) => {
            const saleQuantity = Array.isArray(sale.quantity)
                ? sale.quantity.reduce((sum: any, q: any) => sum + q, 0)
                : 0;
            return acc + saleQuantity;
        }, 0);

        if (!startDate || !endDate) {
            alert("Please select a valid start and end date.");
            return;
        }


        const report = {
            startDate: startDate,
            endDate: endDate,
            salesData: filteredSales,
            totalAmount: filteredSales.reduce((acc, s) => acc + s.amount, 0),
            totalQuantity: totalQuantity,
        }

        generateSalesReportPdf(report);
    }

    return (
        <>
            <div className={` flex bg-gray-100 ${isDialogOpen ? "blur-sm" : ""} font-custom `}>
                <div
                    className={`fixed top-0 left-0 h-screen ${isSidebarCollapsed ? 'w-16' : 'w-64'} z-10 shadow-md transition-all duration-300`}>
                    <SidebarAdmin isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}/>
                </div>
                <div
                    className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 mb-10`}>

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

                    {/* Section with Add Sale Button and Horizontal Line */}
                    <div className="py-6 mt-4 items-center font-custom">
                        <div className="flex justify-center gap-4">
                            {/* Sales Report Button */}
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-6 rounded-lg flex items-center gap-2"
                                onClick={() => setIsGenerateReportModalOpen(true)}
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
                                        d="M16.5 3.75v4.5a.75.75 0 00.75.75h4.5M19.5 21h-15a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 014.5 3h9.75L21 9.75v9.75A1.5 1.5 0 0119.5 21z"
                                    />
                                </svg>
                                Sales Report
                            </button>

                            {/* Add Sale Button */}
                            <button
                                className="btn bg-blue-500 hover:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg flex items-center gap-2"
                                onClick={openDialog}
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
                                Add Sale
                            </button>
                        </div>
                        <div className="mt-4">
                            {/* Extra content here if needed */}
                        </div>
                    </div>

                    <div className="h-4"/>

                    <div className="flex flex-col items-center">
                        {/* Search, Date, and Time Filters */}
                        <div className="flex gap-4 mb-4">
                            {/* Search, Date, and Time Filters */}
                                <input
                                    type="text"
                                    placeholder="Search by customer..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="p-2 border border-gray-300 rounded-lg shadow-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                />
                                {/* Year Filter */}
                                <select
                                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">All Years</option>
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                {/* Month Filter */}
                                <select
                                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="">All Months</option>
                                    {[
                                        "January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"
                                    ].map((month, index) => (
                                        <option key={index} value={index + 1}>
                                            {month}
                                        </option>
                                    ))}
                                </select>

                                {/* Day Filter */}
                                <select
                                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                >
                                    <option value="">All Days</option>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sales Tiles */}
                        <div className="max-w-4xl w-full mx-auto space-y-6 flex flex-col items-center">
                            {filteredSales.length > 0 ? (
                                [...filteredSales]
                                    .sort((a, b) => b.saleId - a.saleId)
                                    .map((sale) => (
                                        <SalesTile
                                            key={sale.saleId}
                                            id={sale.saleId}
                                            title={sale.inventories.length > 0 ? sale.inventories.map(inv => inv.name).join(", ") : "Unknown"}
                                            date={sale.createdAt}
                                            amount={sale.amount}
                                            quantity={sale.quantity.join(", ")}
                                            issuer={sale.user.username}
                                            customer={sale.customer}
                                            description={sale.description}
                                            pricePerUnit={sale.inventories.length > 0 ? sale.inventories.map(inv => inv.pricePerUnit).join(", ") : "Unknown"}
                                            inventory={undefined} user={undefined}                                        />
                                    ))
                            ) : (
                                <p className="text-gray-500">No sales found</p>
                            )}
                        </div>
                    </div>
                </div>

            {/* modal for generating a sale */}
            <div
                className={`fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-black font-custom transition-opacity duration-300 ${
                    isDialogOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg w-1/3 transform transition-all duration-300 ${
                        isDialogOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                    }`}
                >
                    <h2 className="text-lg font-medium mb-4 text-center font-bold">Add sales transaction</h2>
                    <div className="h-2" />
                    <form onSubmit={handleSalesSubmit}>
                        <div className="mb-4 relative">
                            <label htmlFor="item" className="block text-gray-700 font-medium mb-2">
                                Search Inventories
                            </label>
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                                type="text"
                                id="item"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Type to search for items"
                            />
                            {searchQuery && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                                    {inventories
                                        .filter(
                                            (inventory) =>
                                                inventory.location.toLowerCase() === 'shop' &&
                                                inventory.name.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((inventory) => (
                                            <li
                                                key={inventory.inventoryId}
                                                onClick={() => {
                                                    handleSelectInventory(inventory.inventoryId);
                                                    setSearchQuery('');
                                                }}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {inventory.name}
                                                <p className="text-green-600 font-bold">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'MWK',
                                                    }).format(inventory.pricePerUnit)}
                                                </p>
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Selected Items</label>
                            <ul>
                                {selectedItems.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center p-2 border-b">
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'MWK',
                                }).format(item.unitPrice * item.quantity)}
                            </span>
                                        <button
                                            type="button"
                                            className="text-red-500 ml-2"
                                            onClick={() =>
                                                setSelectedItems(selectedItems.filter((_, i) => i !== index))
                                            }
                                        >
                                            ❌
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                Description
                            </label>
                            <input
                                value={description}
                                onChange={(e: any) => {
                                    setDescription(e.target.value);
                                }}
                                type="text"
                                id="title"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Item description"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                Customer
                            </label>
                            <input
                                value={customer}
                                onChange={(e: any) => {
                                    setCustomer(e.target.value);
                                }}
                                type="text"
                                id="title"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Name of item"
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

            {/* modal for entering quantity of selected item for sale transaction*/}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-black transition-opacity duration-300 ${
                    isQuantityModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg w-1/4 transform transition-all duration-300 ${
                        isQuantityModalOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                    }`}
                >
                    <h2 className="text-lg mb-4 text-center">Enter Quantity</h2>
                    <input
                        type="number"
                        min="1"
                        value={inputQuantity}
                        onChange={(e) => setInputQuantity(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex justify-end mt-4 gap-4">
                        <button
                            onClick={() => setIsQuantityModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded"
                        >
                            Add Item
                        </button>
                    </div>
                </div>
            </div>

            {/* modal for selecting serial numbers for sale */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-black transition-opacity duration-300 ${
                    isSerialModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg w-[400px] text-black flex flex-col transform transition-all duration-300 ${
                        isSerialModalOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                    }`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg  text-center flex-grow">Select Serials</h3>
                        <span className="text-sm text-gray-600">
                {selectedSerials.length} of {maxSelectable}
            </span>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSerialConfirm();
                        }}
                        className="flex flex-col flex-grow"
                    >
                        <div className="overflow-y-auto mb-4 pr-2 space-y-2" style={{ maxHeight: '200px' }}>
                            {availableSerials.map((serial: any) => {
                                const isChecked = selectedSerials.includes(serial.unitId);
                                const isDisabled = !isChecked && selectedSerials.length >= maxSelectable;

                                return (
                                    <div
                                        key={serial.id}
                                        className={`bg-gray-100 rounded-md px-3 py-2 flex justify-between items-center ${
                                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <span className="text-sm">{serial.serialNumber}</span>
                                        <input
                                            type="checkbox"
                                            value={serial.unitId}
                                            checked={isChecked}
                                            disabled={isDisabled}
                                            className="w-5 h-5 accent-green-600"
                                            onChange={(e) => {
                                                const id = serial.unitId;
                                                setSelectedSerials((prev) =>
                                                    e.target.checked
                                                        ? [...prev, id]
                                                        : prev.filter((s) => s !== id)
                                                );
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsSerialModalOpen(false)}
                                className="text-gray-500 bg-gray-200 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Confirm
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* modal for generating a sales report */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
                    isGenerateReportModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-white p-6 rounded-lg shadow-lg text-black w-full max-w-md transform transition-all duration-300 ${
                        isGenerateReportModalOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
                    }`}
                >
                    <h2 className="text-lg mb-4 text-center">Generate Sales Report</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">From:</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Select a date"
                                className="w-[300px] p-2 border border-gray-300 rounded-lg bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">To:</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Select a date"
                                className="w-[300px] p-2 border border-gray-300 rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            className="px-4 py-2 mr-2 bg-gray-300 rounded"
                            onClick={() => setIsGenerateReportModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={triggerReportGeneration}
                        >
                            Generate
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="w-16 h-16 border-8 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </>
    )
}

