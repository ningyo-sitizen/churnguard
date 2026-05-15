import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar.jsx';
import Header from './header.jsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';
import Footer from './footer';
import { useAuth } from "../utils/auth";

// Color Palette dari design sebelumnya
const PINK_DARK = "#D82F5A";
const PINK_MEDIUM = "#E2A7B8";
const PINK_LIGHT = "#FEF5F6";
const BLACK_MAROON = "#4A0E1C";
const COLORS_PIE = [BLACK_MAROON, PINK_DARK, PINK_MEDIUM];

const AnalisisUlasan = () => {
    const user = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCustomer: 0,
        highRisk: 0,
        churnCustomer: 0,
        totalRevenue: 0
    });

    const [riskData, setRiskData] = useState([]);
    const [subscriptionData, setSubscriptionData] = useState([]);
    const [segmentData, setSegmentData] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                "http://localhost:5000/prediction/analytics",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            if (data.status === "success") {
                setStats(data.stats);
                setRiskData(data.riskDistribution);
                setSubscriptionData(data.subscriptionVsChurn);
                setSegmentData(data.segmentInsight);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] font-['Plus_Jakarta_Sans',sans-serif]">
            <Sidebar />

            <main className="flex-1 flex flex-col">
                {/* Header Section dengan data user asli */}
                <Header formData={user} profileImg={user?.profileImg} />

                <div className="p-8 flex-1">
                    {/* JUDUL DAN SUBJUDUL HALAMAN */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-800">Analisis Statistik Pelanggan</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Visualisasi data churn customer dan insight bisnis secara real-time.
                        </p>
                    </div>

                    {/* Filter & Dataset Info (Static placeholder from previous design) */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-white border border-gray-100 px-4 py-2 rounded-[4px] flex items-center gap-3 shadow-sm">
                            <span className="text-xs text-gray-400">Dataset :</span>
                            <select className="text-xs font-medium outline-none bg-transparent">
                                <option>Live_Database_Connection</option>
                            </select>
                        </div>
                        <span className="text-xs text-gray-400">{stats.totalCustomer.toLocaleString()} Data terdeteksi</span>
                    </div>

                    {/* Stats Cards dengan Design Berwarna & Divider */}
                    <div className="bg-white rounded-[4px] border border-[#EDEDED] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 mb-12">
                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 mb-5">
                            {[
                                {
                                    label: "Total Pelanggan",
                                    val: stats.totalCustomer,
                                    icon: "ti-users",
                                    col: "text-[#DE869D] bg-[#F6EAEC]"
                                },
                                {
                                    label: "Berisiko Tinggi",
                                    val: stats.highRisk,
                                    icon: "ti-trending-up",
                                    col: "text-[#EAAD62] bg-[#FDF0ED]"
                                },
                                {
                                    label: "Pelanggan Churn",
                                    val: stats.churnCustomer,
                                    icon: "ti-arrow-big-down-lines",
                                    col: "text-[#BE78E3] bg-[#F1EDF8]"
                                },
                                {
                                    label: "Total Pendapatan",
                                    val: `Rp. ${stats.totalRevenue.toLocaleString()}`,
                                    icon: "ti-cash",
                                    col: "text-[#C6CE56] bg-[#F6F7E6]"
                                }
                            ].map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="flex items-center gap-5 flex-1 min-w-[200px] px-4">
                                        <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center text-2xl ${item.col}`}>
                                            <i className={`ti ${item.icon}`}></i>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs text-gray-400">{item.label}</p>
                                            <p className="text-base font-semibold text-gray-800">{item.val}</p>
                                        </div>
                                    </div>
                                    {idx !== 3 && <div className="hidden md:block w-[1px] h-12 bg-gray-100"></div>}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Analisis Note Design */}
                        <div className="flex items-center justify-between bg-gray-50/50 border border-[#DCDBDB] rounded-[4px] p-4 px-8 group cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-[#D82F5A] font-semibold">Live Insight</span>
                                <span className="text-gray-400 text-xs">|</span>
                                <span className="text-gray-600 text-xs">
                                    Data diperbarui secara otomatis berdasarkan aktivitas database terbaru.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Charts - Grid Layout */}
                    <div className="grid grid-cols-12 gap-6 mb-12">
                        {/* Bar Chart Section */}
                        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-[4px] border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-[#111827]">Subscription vs Churn</h3>
                                    <p className="text-[10px] text-gray-400 mt-1">Perbandingan churn berdasarkan jenis paket</p>
                                </div>
                                <div className="flex gap-4 text-[10px] font-semibold mt-1">
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-[#D82F5A]"></div>
                                        <span className="text-gray-600">Churn</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-[#E2A7B8]"></div>
                                        <span className="text-gray-600">Non-Churn</span>
                                    </span>
                                </div>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subscriptionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#F9FAFB' }} />
                                        <Bar dataKey="churn" fill={PINK_DARK} radius={[4, 4, 0, 0]} barSize={30} />
                                        <Bar dataKey="nonChurn" fill={PINK_MEDIUM} radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart Section */}
                        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-[4px] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-semibold mb-1">Distribusi Risiko</h3>
                            <p className="text-[10px] text-gray-400 mb-6">Sebaran pelanggan berdasarkan tingkat risiko</p>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={riskData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                                            {riskData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {riskData.map((item, i) => (
                                    <div key={i} className="text-left bg-gray-50 p-2 rounded">
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">{item.name}</p>
                                        <p className="text-xs font-bold" style={{ color: COLORS_PIE[i % COLORS_PIE.length] }}>{item.value}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Segment Insight Section (Design "Solusi" style) */}
                    <div className="mb-12">
                        <h3 className="text-md font-semibold text-gray-800 mb-6">Segment Insight</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {segmentData.map((item, i) => (
                                <div key={i} className="bg-white rounded-[4px] border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="bg-[#FEF5F6] p-3 border-b border-[#FDEEEF]">
                                        <p className="text-[10px] font-semibold text-[#D82F5A] flex items-center gap-2">
                                            <i className="ti ti-chart-bubble"></i> SEGMENT: {item.segment.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] text-gray-400">Total Customer</span>
                                            <span className="text-xs font-semibold text-gray-800">{item.total}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-500">Avg Monthly Charges:</span>
                                                <span className="font-medium text-gray-700">${item.avgMonthly}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-500">Avg Watch Hours:</span>
                                                <span className="font-medium text-gray-700">{item.avgView}h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
};

export default AnalisisUlasan;