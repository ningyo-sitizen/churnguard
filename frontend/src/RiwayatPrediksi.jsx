import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ASSETS
import CSVicon from './assets/csv.png';
import unggahdata from './assets/unggahdata.png';
import logochurn from './assets/logo churn.png';

// ICONS - TABLER (Dikelompokkan jadi satu biar rapi)
import {
    IconLayoutDashboard,
    IconChartBar,
    IconHistory,
    IconSearch,
    IconFilter,
    IconBell,
    IconChevronDown,
    IconBrandInstagram,
    IconBrandX,
    IconBrandYoutube,
    IconCircleCheckFilled,
    IconAlertTriangle,
    IconTrash,
    IconUpload,
    IconBrandMyOppo,
    IconUserCircle,
    IconLogout2
} from '@tabler/icons-react';


const RiwayatPrediksi = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // State Data
    const [dataHistory, setDataHistory] = useState([
        { id: 1, title: 'Netflix Review.CSV', size: '190 KB', date: 'Kamis, 26 April 2026', churn: 35, total: 1205, risk: '20%', revenue: 'Rp.1.902.102,00' },
        { id: 2, title: 'Playstore Review.CSV', size: '2 GB', date: 'Kamis, 26 April 2026', churn: 35, total: 1205, risk: '20%', revenue: 'Rp.1.902.102,00' },
        { id: 3, title: 'Playstore Review.CSV', size: '2 GB', date: 'Kamis, 26 April 2026', churn: 35, total: 1205, risk: '20%', revenue: 'Rp.1.902.102,00' },
    ]);

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const openConfirmModal = (id) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        setDataHistory(dataHistory.filter(item => item.id !== selectedId));
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif] text-[#111827] flex flex-col relative">

            {/* MODAL KONFIRMASI HAPUS */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        {/* Backdrop: Glassmorphism tipis */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#000000]/10 backdrop-blur-[4px]"
                        />

                        {/* Modal Card: Horizontal Rectangle Clean Style */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="bg-white w-full max-w-[480px] rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 relative z-10 overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex gap-6">
                                    {/* Icon Section: Background Soft Red */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-red-50 rounded-[4px] flex items-center justify-center text-red-500">
                                            <IconTrash size={24} stroke={2} />
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1">
                                        <h3 className="text-[16px] font-bold text-gray-900 mb-1 tracking-tight">
                                            Hapus riwayat data CSV?
                                        </h3>
                                        <p className="text-[13px] text-gray-400 leading-relaxed font-medium">
                                            Data akan dihapus secara permanen dari server. Tindakan ini tidak dapat dibatalkan kembali.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons: Rapi di Pojok Kanan Bawah */}
                                <div className="flex justify-end gap-3 mt-10">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 rounded-[4px] text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest"
                                    >
                                        Batalkan
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-[#111827] hover:bg-red-600 text-white px-8 py-2.5 rounded-[4px] text-[11px] font-bold shadow-sm transition-all uppercase tracking-widest active:scale-95"
                                    >
                                        Ya, Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex flex-1">
                {/* SIDEBAR */}
                <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-20 font-['Plus_Jakarta_Sans',sans-serif]">
                    {/* Logo Section */}
                    <div className="pt-10 pb-4 flex flex-col items-center">
                        <div className="flex flex-col items-center mb-4">
                            <img
                                src={logochurn}
                                alt="logochurn"
                                className="w-28 h-auto" // Logo ukuran sedang (pas)
                            />
                        </div>
                        <div className="w-[85%] border-b border-gray-100"></div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-4 space-y-2 mt-4">

                        {/* Dashboard - ACTIVE (Pakai ti-home) */}
                        <div
                            onClick={() => navigate('/dashboarduser')} // Arahkan ke path dashboard
                            className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-all"
                        >
                            <i className="ti ti-home text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                            <span className="text-sm">Dashboard</span>
                        </div>
                        {/* Analisis Ulasan - INACTIVE */}
                        <div className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-all">
                            <i className="ti ti-chart-bar text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                            <span className="text-sm">Analisis Ulasan</span>
                        </div>

                        {/* Riwayat Prediksi - INACTIVE */}
                        <div className="bg-[#FEF5F6] text-[#D82F5A] flex items-center gap-4 px-5 py-3 rounded-[4px] cursor-pointer transition-all">
                            <i className="ti ti-history text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                            <span className="text-sm">Riwayat Prediksi</span>
                        </div>


                        <div
                            onClick={() => navigate('/feedback')}
                            className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-all">
                            <i className="ti ti-message text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                            <span className="text-sm">User Feedback</span>
                        </div>
                    </nav>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
                    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-10 gap-6 sticky top-0 z-50]">

                        {/* Notification Bell */}
                        <div className="w-10 h-10 border border-[#FEF5F6] rounded-xl flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-all group">
                            <i className="ti ti-bell text-xl group-hover:shake"></i>
                        </div>

                        {/* User Profile Section dengan Dropdown */}
                        <div className="relative">
                            {/* Trigger Area */}
                            <div
                                className="flex items-center gap-3 pl-6 border-l border-gray-100 h-10 cursor-pointer group"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <img
                                    src="https://ui-avatars.com/api/?name=Zahrah+Purnama&background=D82F5A&color=fff&bold=true"
                                    className="w-10 h-10 rounded-xl object-cover shadow-sm"
                                    alt="avatar"
                                />
                                <div className="flex flex-col text-left leading-tight">
                                    <p className="text-sm font-semibold text-[#111827]">Hai, Zahrah Purnama</p>
                                    <p className="text-xs text-[#D82F5A] ">zahrah.purnama@gmail.com</p>
                                </div>
                                <i className={`ti ti-chevron-down text-gray-400 text-sm ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                            </div>

                            {/* Dropdown Menu (Sesuai Gambar) */}
                            {isOpen && (
                                <>
                                    {/* Overlay untuk menutup dropdown saat klik di luar */}
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>

                                    <div className="absolute right-0 mt-4 w-72 bg-white rounded-[4px] shadow-[0px_10px_40px_rgba(0,0,0,0.08)] border border-gray-50 overflow-hidden animate-in fade-in zoom-in duration-200 z-50">

                                        {/* Header Dropdown */}
                                        <div className="p-5 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[4px] overflow-hidden bg-gray-100">
                                                <img
                                                    src="https://ui-avatars.com/api/?name=Zahrah+Purnama&background=E0E0E0&color=9E9E9E&bold=true"
                                                    alt="profile"
                                                />
                                            </div>
                                            <div className="flex flex-col text-left leading-tight">
                                                <p className="text-sm font-semibold text-[#111827]">Zahrah Purnama</p>
                                                <p className="text-xs text-[#D82F5A] ">User</p>
                                            </div>
                                        </div>

                                        <div className="border-b border-gray-100 mx-5"></div>

                                        {/* List Menu */}
                                        <div className="p-2">
                                            <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#FEF5F6] text-[#E2A7B8] cursor-pointer transition-all group">
                                                <IconUserCircle stroke={1.5} />
                                                <span className="text-sm ">Profile</span>
                                            </div>

                                            <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#FEF5F6] text-[#E2A7B8] cursor-pointer transition-all group">
                                                <IconBrandMyOppo stroke={1.5} />
                                                <span className="text-sm ">Member</span>
                                            </div>

                                            <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#FEF5F6] text-[#E2A7B8] cursor-pointer transition-all group">
                                                <IconLogout2 stroke={1.5} />
                                                <span className="text-sm ">Keluar</span>
                                            </div>
                                        </div>

                                    </div>
                                </>
                            )}
                        </div>
                    </header>

                    <div className="p-8 w-full">
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-gray-900 ">Riwayat Prediksi</h1>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                Arsip lengkap seluruh hasil prediksi yang pernah dilakukan di sistem ChurnGuard.
                            </p>
                        </div>

                        {/* Render Data atau Empty State */}
                        {dataHistory.length > 0 ? (
                            <>
                                <div className="flex justify-end gap-3 mb-8">
                                    <div className="relative w-64">
                                        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" placeholder="Cari........" className="w-full bg-white border border-gray-200 rounded-[4px] py-2 pl-10 pr-4 text-xs outline-none focus:border-[#D82F5A]" />
                                    </div>
                                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-[4px] text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all">
                                        Filter <IconFilter size={14} />
                                    </button>
                                </div>

                                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {dataHistory.map((item) => (
                                            <motion.div
                                                key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                                className="bg-white border border-gray-200 rounded-[4px] p-6 shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-start gap-4 mb-3">
                                                    <img src={CSVicon} alt="CSV Icon" className="w-10 h-10 object-contain" />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-xs text-gray-400 font-medium">{item.size} dari {item.size} •</span>
                                                            <div className="flex items-center gap-1 text-[#22C55E]">
                                                                <IconCircleCheckFilled size={14} />
                                                                <span className="text-xs text-gray-400 font-medium tracking-tight">Selesai</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>


                                                <p className="text-xs mt-4 text-gray-400 pb-3 border-b border-[#EDEDED]">
                                                    {item.date}
                                                </p>

                                                <div className="space-y-4 border-t border-gray-50 pt-3 mb-7 text-xs">
                                                    <div className="flex justify-between items-center"><span className="text-gray-400">Tingkat Pengunduran Diri</span><span className="font-medium">: {item.churn} Orang</span></div>
                                                    <div className="flex justify-between items-center"><span className="text-gray-400">Total Pelanggan</span><span className="font-medium">: {item.total} Orang</span></div>
                                                    <div className="flex justify-between items-center"><span className="text-gray-400">Beresiko Tinggi</span><span className="font-medium">: {item.risk}</span></div>
                                                    <div className="flex justify-between items-center"><span className="text-gray-400">Pendapatan yang Berisiko</span><span className="font-medium">: {item.revenue}</span></div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => openConfirmModal(item.id)}
                                                        className="bg-white border border-[#D82F5A] text-[#D82F5A] py-2.5 rounded-[4px] text-xs font-medium hover:bg-pink-50 transition-all "
                                                    >
                                                        Hapus
                                                    </button>
                                                    <button className="bg-black text-white py-2.5 rounded-[4px] text-xs font-medium hover:bg-gray-800 transition-all ">
                                                        Rincian
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </>
                        ) : (
                            /* EMPTY STATE */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-24 flex flex-col items-center justify-center text-center bg-white border border-dashed border-gray-200 rounded-[4px]"
                            >
                                <img src={unggahdata} alt="Unggah Data" className="w-56 h-auto mb-6" />
                                <h3 className="text-xl font-semibold text-[#111827] mb-2 tracking-tight">Belum ada riwayat prediksi</h3>
                                <p className="text-gray-400 text-xs mb-10 max-w-sm leading-relaxed px-4">
                                    Data riwayat prediksi akan ditampilkan di sini setelah Anda mengunggah file pelanggan untuk dianalisis.
                                </p>
                                <button
                                    onClick={() => navigate('/uploadData')}
                                    className="bg-[#D82F5A] text-white px-10 py-3.5 rounded-[4px] text-xs font-medium flex items-center gap-3 hover:bg-[#b5264b] transition-all duration-300 active:scale-95 shadow-xl shadow-[#D82F5A]/20"
                                >
                                    <IconUpload size={18} />
                                    <span>Mulai Unggah Data</span>
                                </button>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>

            {/* FOOTER */}
            <footer className="bg-white border-t border-gray-100 pt-12 px-10 flex-shrink-0">
                <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12 border-b border-gray-100 pb-8">

                    {/* BRAND SECTION & SOCIALS */}
                    <div className="space-y-8 text-left">
                        <div className="space-y-6">
                            <h3 className="text-2xl tracking-tight font-semibold">
                                ChurnGuard <span className="text-[#D82F5A]">CRM</span>
                            </h3>
                            <p className="text-[#616161] text-sm leading-relaxed">
                                Solusi cerdas menjaga loyalitas dan memperkuat hubungan pelanggan Anda secara berkelanjutan.
                            </p>
                        </div>

                        {/* Social Media Icons moved here */}
                        <div className="flex gap-4">
                            {['brand-instagram', 'brand-x', 'brand-youtube'].map(s => (
                                <div key={s} className="w-10 h-10 border border-[#D82F5A]/20 rounded-[4px] flex items-center justify-center text-[#D82F5A] hover:bg-[#D82F5A] hover:text-white hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm">
                                    <i className={`ti ti-${s} text-lg`}></i>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div>
                        <h4 className="text-sm mb-6 flex items-center gap-2 text-[#111827]">
                            <i className="ti ti-map-pin text-[#D82F5A]"></i> Alamat
                        </h4>
                        <p className="text-[#616161] text-[13px] leading-relaxed">
                            Gedung Perpustakaan PNJ, Beji, Depok, Jawa Barat 16425.
                        </p>
                    </div>

                    {/* PHONE */}
                    <div>
                        <h4 className="text-sm mb-6 flex items-center gap-2 text-[#111827]">
                            <i className="ti ti-phone text-[#D82F5A]"></i> No. Telepon
                        </h4>
                        <p className="text-[#616161] text-[13px] leading-relaxed">
                            +62 21 727 0036
                        </p>
                    </div>

                    {/* EMAIL */}
                    <div>
                        <h4 className="text-sm mb-6 flex items-center gap-2 text-[#111827]">
                            <i className="ti ti-mail text-[#D82F5A]"></i> Email
                        </h4>
                        <p className="text-[#616161] text-[13px] underline underline-offset-8 decoration-[#D82F5A]/30 hover:text-[#D82F5A] transition-colors cursor-pointer">
                            petisatukan@pnj.ac.id
                        </p>
                    </div>

                </div>

                {/* COPYRIGHT */}
                <div className="bg-black py-6 -mx-10">
                    <p className="text-center text-white text-sm opacity-70">
                        © 2026 CHURNGUARD CRM. Hak Cipta Dilindungi Undang-Undang.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default RiwayatPrediksi;