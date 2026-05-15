import React, { useState } from 'react';
import {
    Search,
    Calendar,
    Download,
    Smile,
    Meh,
    Frown,
    BarChart2,
    Cloud,
    Play,
    Activity,
    Upload,
    FileText,
    AlertCircle
} from 'lucide-react';
import Sidebar from './SideBar.jsx';
import Header from './header.jsx';
import Footer from './footer';

const SentimenAnalysis = () => {
    const [activeTab, setActiveTab] = useState("positif");
    const [searchApp, setSearchApp] = useState("");

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] font-['Plus_Jakarta_Sans',sans-serif]">
            <style jsx>{`
                @keyframes slow-pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                .animate-slow-pulse {
                    animation: slow-pulse 3s infinite ease-in-out;
                }
            `}</style>

            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <main className="p-10 max-w-[1200px] flex-grow">

                    {/* Header Section */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-2xl font-semibold text-[#111827]">Respon Pelanggan</h1>
                            <p className="text-sm text-gray-400 mt-1  flex items-center gap-2">
                               Mesin analisis sentimen otomatis yang akan mempermudah kamu!
                            </p>
                        </div>
                        <button className="bg-[#111827] hover:bg-[#D82F5A] text-white text-[13px] font-medium px-6 py-2.5 rounded-[4px] transition-all flex items-center gap-2  shadow-sm active:scale-95">
                            <Download size={16} />
                            export data
                        </button>
                    </div>

                    {/* Input Area (Search & Upload) */}
                    <div className="space-y-4 mb-10">
                        <div className="bg-white border border-gray-200 p-1.5 rounded-[4px] flex items-center gap-2 shadow-sm">
                            {/* Search Input */}
                            <div className="flex-[2] flex items-center px-4 gap-3">
                                <Search size={18} className="text-gray-300" />
                                <input
                                    type="text"
                                    placeholder="masukkan nama aplikasi atau link playstore..."
                                    className="w-full py-2 text-[13px] focus:outline-none text-gray-600 placeholder:text-gray-300 "
                                    value={searchApp}
                                    onChange={(e) => setSearchApp(e.target.value)}
                                />
                            </div>

                            <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                            {/* File Upload Input */}
                            <div className="flex-1 flex items-center px-2">
                                <label className="flex items-center gap-2 cursor-pointer group w-full">
                                    <Upload size={16} className="text-gray-300 group-hover:text-[#D82F5A] transition-colors" />
                                    <span className="text-[12px] text-gray-400 group-hover:text-gray-600 transition-colors">upload file (.csv/.xlsx)</span>
                                    <input type="file" className="hidden" />
                                </label>
                            </div>

                            <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                            {/* Date Picker */}
                            <div className="flex items-center gap-3 px-4">
                                <Calendar size={16} className="text-gray-300" />
                                <input type="date" className="text-[12px] text-gray-400 focus:outline-none bg-transparent cursor-pointer" />
                                <span className="text-gray-200">—</span>
                                <input type="date" className="text-[12px] text-gray-400 focus:outline-none bg-transparent cursor-pointer" />
                            </div>

                            <button className="bg-[#D82F5A] text-white px-8 py-2.5 rounded-[4px] text-[13px] font-semibold hover:bg-black transition-all flex items-center gap-2 ">
                                proses <Play size={12} fill="currentColor" />
                            </button>
                        </div>

                        {/* Syarat & Ketentuan Input (Informasi Kecil) */}
                        <div className="flex items-start gap-4 px-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400  italic">
                                <AlertCircle size={12} className="text-amber-400" />
                                <span>maksimal ukuran file 5mb</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400  italic">
                                <FileText size={12} className="text-blue-400" />
                                <span>format kolom harus menyertakan 'review' atau 'comment'</span>
                            </div>
                        </div>
                    </div>

                    {/* Statistik Ringkas */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {[
                            { label: "Sentimen positif", val: "72.4%", color: "text-[#D82F5A]", icon: <Smile size={20} /> },
                            { label: "Sentimen netral", val: "18.1%", color: "text-[#111827]", icon: <Meh size={20} /> },
                            { label: "Sentimen negatif", val: "9.5%", color: "text-gray-400", icon: <Frown size={20} /> }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 p-6 rounded-[4px] shadow-sm flex items-start justify-between group hover:border-[#D82F5A]/30 transition-all cursor-default">
                                <div>
                                    <p className="text-[12px] text-gray-400 mb-2 ">{item.label}</p>
                                    <span className="text-3xl font-semibold text-[#111827]">{item.val}</span>
                                </div>
                                <div className={`${item.color} opacity-80 group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Baris Visualisasi */}
                    <div className="grid grid-cols-12 gap-6 mb-10">
                        {/* Box Distribusi */}
                        <div className="col-span-4 bg-white border border-gray-100 p-8 rounded-[4px] shadow-sm flex flex-col">
                            <div className="w-full mb-10 border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-2">
                                    <BarChart2 size={16} className="text-[#D82F5A]" />
                                    <p className="text-[13px] font-semibold text-[#111827] ">distribusi</p>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    perbandingan sentimen dari total data yang diolah.
                                </p>
                            </div>

                            <div className="flex-1 flex items-center justify-center relative">
                                <div className="absolute w-44 h-44 rounded-full border border-gray-100 animate-slow-pulse"></div>
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-50" />
                                        <circle
                                            cx="80" cy="80" r="70" stroke="#D82F5A" strokeWidth="12"
                                            strokeDasharray={440} strokeDashoffset={440 - (440 * 72) / 100}
                                            strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-semibold text-[#111827]">72%</span>
                                        <span className="text-[10px] text-gray-400 font-medium ">positif</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#D82F5A]"></div>
                                    <span className="text-[10px] text-gray-500 ">positif</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#111827]"></div>
                                    <span className="text-[10px] text-gray-500 ">netral</span>
                                </div>
                            </div>
                        </div>

                        {/* Box Word Cloud */}
                        <div className="col-span-8 bg-white border border-gray-100 rounded-[4px] shadow-sm flex flex-col">
                            <div className="p-8 pb-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Cloud size={16} className="text-[#D82F5A]" />
                                            <p className="text-[13px] font-semibold text-[#111827] ">kata kunci populer</p>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1 ">
                                            kumpulan kata yang paling sering muncul berdasarkan kategori.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        {['positif', 'netral', 'negatif'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-4 py-1.5 rounded-[4px] text-[11px] transition-all  ${activeTab === tab ? 'bg-[#FEF5F6] text-[#D82F5A] font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[1px] bg-gray-50 w-full mt-4"></div>
                            </div>

                            <div className="p-8 flex-1">
                                <div className="w-full h-full min-h-[250px] bg-[#F9FAFB] border border-gray-50 rounded-[4px] p-8 flex flex-wrap gap-6 items-center justify-center content-center">
                                    <span className="text-3xl font-semibold text-[#111827] hover:text-[#D82F5A] transition-colors cursor-default ">puas</span>
                                    <span className="text-lg font-medium text-[#D82F5A]/60 ">mudah</span>
                                    <span className="text-base text-gray-400 ">responsif</span>
                                    <span className="text-2xl font-semibold text-[#D82F5A] ">cepat</span>
                                    <span className="text-xl font-medium text-gray-700 ">membantu</span>
                                    <span className="text-sm text-gray-300 ">update</span>
                                    <span className="text-lg font-semibold text-[#D82F5A] ">terbaik</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Minimalis */}
                {/* FOOTER - Diletakkan di sini agar nempel di bawah konten utama */}
                <Footer />
            </div>
        </div>
    );
};

export default SentimenAnalysis;