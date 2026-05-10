import React, { useState } from 'react';
import { motion } from 'framer-motion';
import logochurn from './assets/logo churn.png';
// Pastikan icon ini sudah terinstall atau ganti dengan icon library pilihanmu
import { IconUserCircle, IconBrandMyOppo, IconLogout2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const Member = () => {
    const [selectedPlan, setSelectedPlan] = useState("Growth Strategist");
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); // Tambahkan ini


    const pricingPlans = [
        {
            title: "Insight Enthusiast",
            price: "Rp 149.000",
            description: "Paket paling hemat untuk memahami perasaan pelanggan.",
            features: [
                "Analisis Sentimen NLP (Positif/Negatif/Netral).",
                "Ringkasan topik otomatis.",
                "Limit 1.000 baris teks/bulan."
            ],
            isBestSeller: false,
        },
        {
            title: "Growth Strategist",
            price: "Rp 499.000",
            oldPrice: "Rp 549.900",
            description: "Paket paling hemat untuk memahami perasaan pelanggan.",
            features: [
                "Prediksi yang akan berhenti berlangganan.",
                "Fitur Email Marketing.",
                "Skor loyalitas pelanggan.",
                "Limit 50.000 profil pelanggan/bulan."
            ],
            isBestSeller: true,
        },
        {
            title: "Intelligence Master",
            price: "Rp 899.000",
            description: "Paket paling hemat untuk memahami perasaan pelanggan.",
            features: [
                "Semua Fitur NLP + Semua Fitur Prediksi.",
                "Analisis mendalam berdasarkan data sentimen.",
                "Prioritas pemrosesan data (Lebih cepat).",
                "Limit 100.000 profil & teks/bulan.",
                "Dukungan konsultasi teknis."
            ],
            isBestSeller: false,
        }
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-['Plus_Jakarta_Sans',sans-serif] text-[#1F2937] flex flex-col">
            {/* NAVBAR */}
            <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-[100]">

                {/* KIRI: Logo */}
                <div className="flex items-center">
                    <img
                        src={logochurn}
                        alt="Logo Churn"
                        className="h-14 w-auto object-contain cursor-pointer"
                        onClick={() => window.location.href = '/'}
                    />
                </div>

                {/* KANAN: Navigasi & Profile */}
                <div className="flex items-center gap-6">
                    {/* Notification Bell */}
                    <div className="w-10 h-10 border border-[#FEF5F6] rounded-xl flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-all group">
                        <i className="ti ti-bell text-xl group-hover:shake"></i>
                    </div>

                    {/* User Profile Section */}
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
                                <p className="text-xs text-[#D82F5A]">zahrah.purnama@gmail.com</p>
                            </div>
                            <i className={`ti ti-chevron-down text-gray-400 text-sm ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                        </div>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <>
                                {/* Overlay: Pastikan z-index di bawah dropdown tapi di atas konten lain */}
                                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

                                {/* Dropdown Container: z-50 agar di atas overlay */}
                                <div className="absolute right-0 mt-4 w-72 bg-white rounded-[4px] shadow-[0px_10px_40px_rgba(0,0,0,0.15)] border border-gray-50 overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
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
                                            <p className="text-xs text-[#D82F5A]">User</p>
                                        </div>
                                    </div>

                                    <div className="border-b border-gray-100 mx-5"></div>

                                    {/* List Menu */}
                                    <div className="p-2">
                                        <div
                                            onClick={() => window.location.href = '/Profile'}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#FEF5F6] text-gray-600 hover:text-[#D82F5A] cursor-pointer transition-all group"
                                        >
                                            <IconUserCircle stroke={1.5} size={20} />
                                            <span className="text-sm font-medium">Profile</span>
                                        </div>

                                        <div
                                            onClick={() => window.location.href = '/Member'}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#FEF5F6] text-gray-600 hover:text-[#D82F5A] cursor-pointer transition-all group"
                                        >
                                            <IconBrandMyOppo stroke={1.5} size={20} />
                                            <span className="text-sm font-medium">Member</span>
                                        </div>

                                        <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#FEF5F6] text-gray-600 hover:text-[#D82F5A] cursor-pointer transition-all group">
                                            <IconLogout2 stroke={1.5} size={20} />
                                            <span className="text-sm font-medium">Keluar</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT WRAPPER */}
            <main className="flex-grow">
                {/* HEADER SECTION */}
                <header className="py-16 text-center space-y-4 px-4">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full border border-[#D82F5A] text-[#D82F5A] text-xs font-medium bg-[#FEF5F6]"
                    >
                        Harga Membership 2026!
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-semibold text-gray-900 tracking-tight"
                    >
                        Struktur Harga yang Terkurasi
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-5xl mx-auto text-sm text-[#929191] leading-relaxed font-medium"
                    >
                        Gunakan analitik prediktif berbasis AI untuk mengidentifikasi pelanggan yang berisiko pergi sebelum mereka melakukannya. Ambil tindakan tepat waktu dan tingkatkan nilai seumur hidup pelanggan Anda.
                    </motion.p>
                </header>

                {/* PRICING CARDS SECTION */}
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-20">
                    {pricingPlans.map((plan, index) => {
                        const isSelected = selectedPlan === plan.title;

                        return (
                            <motion.div
                                key={index}
                                onClick={() => setSelectedPlan(plan.title)}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                className={`relative p-8 bg-white border-2 rounded-[4px] transition-all cursor-pointer flex flex-col h-full ${isSelected ? 'border-[#D82F5A]' : 'border-[#EDEDED]'
                                    }`}
                            >
                                {plan.isBestSeller && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                        {/* TAMBAHKAN 'border' dan 'border-[#D82F5A]' di bawah ini */}
                                        <div className="border border-[#D82F5A] text-[#D82F5A] text-xs font-medium bg-[#FEF5F6] px-4 py-0.5 rounded-full shadow-sm flex items-center gap-1.5">
                                            <div className="w-1 h-1 bg-[#D82F5A] rounded-full animate-pulse"></div>
                                            {/* Hapus class bg dan text yang double di span agar bersih */}
                                            <span className="font-medium">Recommended</span>
                                        </div>
                                    </div>
                                )}

                                {/* Plan Info */}
                                <div className="mb-8">
                                    <h3 className="text-[#D82F5A] text-sm font-medium mb-3">
                                        {plan.title}
                                    </h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-bold text-gray-900 tracking-tight">{plan.price}</span>
                                        <span className="text-gray-400 text-xs font-medium">/ Bulan</span>
                                    </div>
                                    {plan.oldPrice && (
                                        <span className="text-sm text-gray-300 line-through font-medium">{plan.oldPrice}</span>
                                    )}
                                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed teks-xs">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Features List */}
                                <div className="space-y-4 mb-10 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <i className="ti ti-check text-[#D82F5A] mt-0.5 font-bold"></i>
                                            <span className="text-xs font-medium text-gray-600 leading-relaxed">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Button */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/memberPayment')} // Navigasi saat diklik
                                    className="w-full bg-black text-white py-4 rounded-[4px]  font-medium text-sm hover:bg-gray-900 transition-colors shadow-lg shadow-black/5"
                                >
                                    Daftar Member
                                </motion.button>
                            </motion.div>
                        );

                    })}
                </div>
            </main>

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

export default Member;