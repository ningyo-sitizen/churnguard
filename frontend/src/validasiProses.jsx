import React, { useState, useEffect } from 'react'; // Tambahin useState biar gak error
import logochurn from './assets/logo churn.png';
import unggahdata from './assets/unggahdata.png';
import { IconBrandMyOppo } from '@tabler/icons-react';
import { IconUserCircle } from '@tabler/icons-react';
import { IconLogout2 } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../utils/auth";
import { jwtDecode } from "jwt-decode";
import { useNotif } from "./NotificationContext";
import Header from './Header';
import Footer from './footer';
import Sidebar from './SideBar';
import axios from 'axios';

const ValidasiProses = () => {
    const [disableButton, setDisableButton] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showRowDetail, setShowRowDetail] = useState(false);
    const [showHeaderDetail, setShowHeaderDetail] = useState(false);
    const navigate = useNavigate();

    const { showNotif } = useNotif()

    const user = useAuth()


    const [isLoadingProcess, setIsLoadingProcess] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const location = useLocation();

    const validation = location.state?.validation;
    const file = location.state?.file;

    useEffect(() => {
        console.log(validation)
        if (!validation) {
            navigate("/uploadData", { replace: true });
            showNotif("error", "mohon isi ulang file");
        }

    }, [validation, navigate]);
    const handleProcessData = () => {
        setLoadingProgress(0);
        setIsLoadingProcess(true);

        const timer = setInterval(() => {
            setLoadingProgress((oldProgress) => {
                if (oldProgress >= 100) {
                    clearInterval(timer);

                    setTimeout(() => {
                        setIsLoadingProcess(false);
                        navigate('/dashboardUser');
                    }, 800);

                    return 100;
                }

                // Simulasi kecepatan loading yang natural
                const diff = Math.random() * 15;
                return Math.min(oldProgress + diff, 100);
            });
        }, 150);
    };

    const handleUploadpy = async () => {
        if (!file) return alert("Pilih file dulu");

        try {


            const formData = new FormData();

            formData.append("file", file.raw);

            const token = localStorage.getItem("token");

            jwtDecode(token);

            await axios.post(
                "http://localhost:5000/csv/upload-csv-py",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            navigate("/dashboardUser");
        } catch (err) {
            console.log("Upload error:", err);
        } finally {

        }
    };

    const {
        totalRows = 0,
        totalError = 0,
        headerError = null,
        missingData = [],
        columnSummary = []
    } = validation || {};

    useEffect(() => {
        const noHeaderError =
            !headerError || Object.keys(headerError).length === 0;

        if (
            totalError === 0 &&
            noHeaderError &&
            missingData?.length === 0
        ) {
            setDisableButton(false);
        } else {
            setDisableButton(true);
        }
    }, [totalError, headerError, missingData]);


    return (
        <div className="flex min-h-screen bg-[#F9FAFB] text-[#111827]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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

                    <div onClick={() => navigate('/dashboardUser')}
                        className="bg-[#FEF5F6] text-[#D82F5A] flex items-center gap-4 px-5 py-3 rounded-[4px] cursor-pointer transition-all">
                        <i className="ti ti-home text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                        <span className="text-sm">Dashboard</span>
                    </div>

                    {/* Analisis Ulasan - INACTIVE */}
                    <div className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-all">
                        <i className="ti ti-chart-bar text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                        <span className="text-sm">Analisis Ulasan</span>
                    </div>

                    <div
                        onClick={() => navigate('riwayatPrediksi')}
                        className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-all"
                    >
                        <i className="ti ti-message text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                        <span className="text-sm">User Feedback</span>
                    </div>


                    <div
                        onClick={() => navigate('/feedback')}
                        className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-all"
                    >
                        <i className="ti ti-message text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
                        <span className="text-sm">User Feedback</span>
                    </div>

                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col">
                {/* HEADER - Benerin typo z-50 */}
                <Header formData={user} profileImg={user?.profileImg} />
                {/* CONTENT AREA */}
                <main className="p-10 flex-1">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                    </div>

                    {/* STEPPER */}
                    <div className="flex flex-col items-center mb-[85px] w-full max-w-4xl mx-auto">
                        <div className="relative flex items-center justify-between w-full">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-200 -translate-y-1/2 z-0"></div>

                            {/* Garis Progress: Pink */}
                            <div className="absolute top-1/2 left-0 w-1/2 h-[1px] bg-[#D82F5A] -translate-y-1/2 z-0"></div>

                            {/* Step 01 */}
                            <div className="relative z-10 flex flex-col items-center bg-[#F8F9FA] px-4">
                                <div className="w-8 h-8 rounded-full bg-[#D82F5A] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-pink-100">
                                    <i className="ti ti-check"></i>
                                </div>
                                <span className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-[#111827]">Upload File</span>
                            </div>

                            {/* Step 02 */}
                            <div className="relative z-10 flex flex-col items-center bg-[#F8F9FA] px-4">
                                <div className="w-8 h-8 rounded-full border-2 border-[#D82F5A] bg-white flex items-center justify-center shadow-[0_0_10px_rgba(216,47,90,0.2)]">
                                    <span className="text-[#D82F5A] text-xs font-medium">02</span>
                                </div>
                                <span className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-gray-400">Validasi & Proses</span>
                            </div>

                            {/* Step 03 */}
                            <div className="relative z-10 flex flex-col items-center bg-[#F8F9FA] px-4">
                                <div className="w-8 h-8 rounded-full border-2 border-gray-100 bg-white flex items-center justify-center">
                                    <span className="text-gray-300 text-xs font-medium">03</span>
                                </div>
                                <span className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-gray-400">Proses & Hasil</span>
                            </div>
                        </div>
                    </div>


                    {/* WARNING ALERT */}
                    <div className="bg-white border border-[#EDEDED] p-3 rounded-[4px] flex items-center gap-3 mb-10 shadow-sm">
                        <i className="ti ti-alert-triangle text-amber-400 text-xl"></i>
                        <p className="text-[#929191] text-sm ">Total {totalError} masalah ditemukan pada data Anda</p>
                    </div>

                    {/* ERROR SUMMARY */}
                    <h3 className="text-base font-medium mb-5 text-[#111827]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Ringkasan Error dan Peringatan
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-12">

                        {[
                            {
                                title: 'Total Rows',
                                count: `${columnSummary.length} data`,
                                desc: 'Jumlah total data yang berhasil diterima.',
                                isRows: true
                            },
                            {
                                title: 'missing data',
                                count: `${totalError} error ditemukan`,
                                desc: 'missing data validasi pada file csv.',
                                isError: true
                            },
                            {
                                title: 'Header Error',
                                count: `${headerError?.type ? 1 : 0} header bermasalah`,
                                desc: 'Periksa kembali nama kolom csv anda.',
                                isHeader: true
                            }
                        ].map((err, i) => (

                            <div
                                key={i}
                                className="bg-white border border-[#EDEDED] p-3 rounded-[4px]"
                            >

                                <div className="flex items-start gap-4">

                                    {/* ICON */}
                                    <div className="w-10 h-10 rounded-full bg-[#FEF5F6] flex items-center justify-center flex-shrink-0">
                                        <i className="ti ti-alert-triangle text-[#D82F5A] text-xl"></i>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1">

                                        <div className="flex items-start justify-between gap-3">

                                            <div>
                                                <h4 className="text-sm font-medium text-[#111827]">
                                                    {err.title}

                                                    <span className="text-[#D82F5A] ml-2 text-xs">
                                                        {err.count}
                                                    </span>
                                                </h4>

                                                <p className="text-xs text-[#929191] mt-1 leading-relaxed">
                                                    {err.desc}
                                                </p>
                                            </div>

                                            {/* BUTTON DETAIL */}
                                            {err.isError && missingData?.length > 0 && (
                                                <button
                                                    onClick={() =>
                                                        setShowRowDetail(!showRowDetail)
                                                    }
                                                    className="
                                    text-xs
                                    border
                                    border-[#D82F5A]
                                    text-[#D82F5A]
                                    px-3
                                    py-1
                                    rounded
                                    hover:bg-[#D82F5A]
                                    hover:text-white
                                    transition-all
                                "
                                                >
                                                    {showRowDetail
                                                        ? "Hide Detail"
                                                        : "View Detail"}
                                                </button>
                                            )}

                                            {err.isHeader && headerError?.type && (
                                                <button
                                                    onClick={() =>
                                                        setShowHeaderDetail(!showHeaderDetail)
                                                    }
                                                    className="
                                    text-xs
                                    border
                                    border-[#D82F5A]
                                    text-[#D82F5A]
                                    px-3
                                    py-1
                                    rounded
                                    hover:bg-[#D82F5A]
                                    hover:text-white
                                    transition-all
                                "
                                                >
                                                    {showHeaderDetail
                                                        ? "Hide Detail"
                                                        : "View Detail"}
                                                </button>
                                            )}

                                        </div>

                                        {/* ========================= */}
                                        {/* TOTAL ERROR DETAIL */}
                                        {/* ========================= */}

                                        {err.isError && showRowDetail && (

                                            <div className="mt-4 border-t pt-4">

                                                <p className="text-xs font-semibold text-[#111827] mb-3">
                                                    Missing Data Detail
                                                </p>

                                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">

                                                    {missingData.map((item, idx) => (

                                                        <div
                                                            key={idx}
                                                            className="
                                            border
                                            border-[#F3F4F6]
                                            rounded
                                            p-2
                                            text-xs
                                            bg-[#FAFAFA]
                                        "
                                                        >

                                                            <div className="flex items-center gap-2 flex-wrap">

                                                                <span className="px-2 py-1 bg-[#FEF2F2] text-[#D82F5A] rounded">
                                                                    Row {item.row}
                                                                </span>

                                                                <span className="px-2 py-1 bg-[#EFF6FF] text-[#2563EB] rounded">
                                                                    {item.column}
                                                                </span>

                                                            </div>

                                                            <p className="text-[#6B7280] mt-2">
                                                                {item.message}
                                                            </p>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>

                                        )}

                                        {/* ========================= */}
                                        {/* HEADER DETAIL */}
                                        {/* ========================= */}

                                        {err.isHeader &&
                                            showHeaderDetail &&
                                            headerError && (

                                                <div className="mt-4 border-t pt-4">

                                                    <div className="mb-4">

                                                        <p className="text-xs font-semibold text-[#111827] mb-2">
                                                            Error Type
                                                        </p>

                                                        <span className="px-2 py-1 bg-[#FEF2F2] text-[#D82F5A] rounded text-xs">
                                                            {headerError.type}
                                                        </span>

                                                    </div>

                                                    <div className="mb-4">

                                                        <p className="text-xs font-semibold text-[#111827] mb-2">
                                                            Expected Header
                                                        </p>

                                                        <div className="flex flex-wrap gap-2">

                                                            {headerError.expected?.map((item, idx) => (

                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-[#F3F4F6] rounded text-xs text-[#374151]"
                                                                >
                                                                    {item}
                                                                </span>

                                                            ))}

                                                        </div>

                                                    </div>

                                                    <div>

                                                        <p className="text-xs font-semibold text-[#111827] mb-2">
                                                            CSV Header Found
                                                        </p>

                                                        <div className="flex flex-wrap gap-2">

                                                            {headerError.got?.map((item, idx) => (

                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-[#FEF2F2] rounded text-xs text-[#D82F5A]"
                                                                >
                                                                    {item}
                                                                </span>

                                                            ))}

                                                        </div>

                                                    </div>

                                                </div>

                                            )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                    {/* TABLE PREVIEW */}
                    <h3 className="text-base font-medium mb-5">Panduan Pemetaan</h3>
                    <div className="bg-white border border-gray-100 rounded-[4px] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#D82F5A] text-white text-xs text-center">
                                <tr>
                                    <th className="p-5">Nama Kolom</th>
                                    <th className="p-5">Tipe Data</th>
                                    <th className="p-5 text-center">Data Unik</th>
                                    <th className="p-5">Data Sample</th>
                                    <th className="p-5 text-center">Status</th>
                                </tr>
                            </thead>
                            {/* GANTI BAGIAN TBODY DI KODE SEBELUMNYA DENGAN INI */}
                            <tbody className="text-[12px] text-gray-600 text-center">
                                {columnSummary?.length > 0 ? (
                                    columnSummary.map((row, i) => (
                                        <tr
                                            key={i}
                                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                        >

                                            {/* Nama Kolom */}
                                            <td className="p-5 font-semibold text-gray-800">
                                                {row.column}
                                            </td>

                                            {/* Tipe Data */}
                                            <td className="p-5">
                                                <div className="relative inline-block">
                                                    <select
                                                        className="appearance-none bg-gray-50 border border-gray-100 rounded-[4px] px-3 py-1.5 pr-8 outline-none focus:border-[#D82F5A]"
                                                        defaultValue={row.type}
                                                    >
                                                        <option value="string">String</option>
                                                        <option value="number">Number</option>
                                                        <option value="boolean">Boolean</option>
                                                    </select>

                                                    <i className="ti ti-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400"></i>
                                                </div>
                                            </td>


                                            {/* Unique Count */}
                                            <td className="p-5 text-center font-semibold">
                                                {row.uniqueCount}
                                            </td>

                                            {/* Sample */}
                                            <td className="p-5 text-gray-400 font-mono tracking-tighter">
                                                {row.sample || "-"}
                                            </td>



                                            {/* Status */}
                                            <td className="p-5 text-gray-400 font-mono tracking-tighter">
                                                {row.status || "-"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="p-10 text-center text-gray-400"
                                        >
                                            Tidak ada data validasi
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-12 flex justify-between">
                        <button
                            onClick={() => navigate('/uploadData')} // Sesuaikan path dengan route kamu
                            className="flex items-center gap-4 px-10 py-3 border border-[#D82F5A] text-[#D82F5A] rounded-[4px] text-sm font-medium hover:bg-pink-50 transition-all duration-300 active:scale-95"
                        >
                            <i className="ti ti-arrow-left text-base"></i>
                            <span>Kembali</span>
                        </button>

                        {/* Tombol Selanjutnya tetap di sini */}

                        {/* TOMBOL PROSES DATA */}
                        {/* 1. TOMBOL PROSES DATA (PASTIKAN INI ADA) */}
                        <button
                            disabled={disableButton}
                            onClick={handleUploadpy}
                            className=
                            {`px-8 py-2 bg-[#111827] text-white rounded-[4px] text-sm font-semibold hover:bg-black flex items-center gap-4 transition-all shadow-xl active:scale-95 group
                                    ${disableButton
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#D82F5A] hover:bg-[#bb244a]"
                                }`}
                        >
                            Proses Data
                            <i className="ti ti-chevron-right text-lg group-hover:translate-x-1 transition-transform"></i>
                        </button>

                        {/* 2. MODAL LOADING (HANYA SATU KALI SAJA) */}
                        <AnimatePresence>
                            {isLoadingProcess && (
                                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                                    {/* Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/40 backdrop-blur-[4px]"
                                    />

                                    {/* Modal Card */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.99, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.99, y: 10 }}
                                        className="bg-white w-full max-w-[380px] rounded-[4px] border border-[#ededed] shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative z-10 overflow-hidden"
                                    >
                                        {/* TOMBOL X (CLOSE) - Di Pojok Kanan Atas */}
                                        <button
                                            onClick={() => {
                                                setIsLoadingProcess(false);
                                                setLoadingProgress(0);
                                                // Jangan lupa kalau ada variable interval di luar, di clear di sini
                                            }}
                                            className="absolute top-4 right-4 text-gray-300 hover:text-[#D82F5A] transition-colors p-1"
                                        >
                                            <i className="ti ti-x text-xl"></i>
                                        </button>

                                        <div className="p-12">
                                            {/* Header Section */}
                                            <div className="flex justify-between items-end mb-8">
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-semibold text-gray-900">
                                                        Analisis Data
                                                    </h3>
                                                    <p className="text-xs text-gray-400 font-medium ">
                                                        {loadingProgress === 100 ? "Validasi Selesai" : "Sedang Berjalan"}
                                                    </p>
                                                </div>

                                                <span className="text-xl font-bold text-[#D82F5A] leading-none tabular-nums tracking-tighter">
                                                    {Math.round(loadingProgress)}%
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="relative w-full h-[4px] bg-gray-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="absolute top-0 left-0 h-full bg-[#D82F5A]"
                                                    style={{ width: `${loadingProgress}%` }}
                                                    transition={{ ease: "easeInOut" }}
                                                />
                                            </div>

                                            {/* Footer Info */}
                                            <div className="mt-8 flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <motion.div
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-[#D82F5A]"
                                                    />
                                                    <motion.div
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-[#D82F5A]"
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    Processing files...
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="bg-white border-t border-gray-100 pt-16 px-10">
                    <div className="max-w-[1200px] mx-auto grid md:grid-cols-4 gap-12 border-b border-gray-100 pb-20">

                        {/* BRAND SECTION & SOCIALS */}
                        <div className="space-y-8 text-left">
                            <div className="space-y-6">
                                <h3 className="text-xl tracking-tight font-semibold ">
                                    ChurnGuard <span className="text-[#D82F5A]">CRM</span>
                                </h3>
                                <p className="text-[#616161] text-sm leading-relaxed">
                                    solusi cerdas menjaga loyalitas pelanggan anda. jangan biarkan mereka pergi tanpa perjuangan.
                                </p>
                            </div>

                            {/* Social Media Icons */}
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
                            <h4 className="text-sm font-medium mb-6 flex items-center gap-2 text-[#111827]">
                                <i className="ti ti-map-pin text-[#D82F5A]"></i> Alamat
                            </h4>
                            <p className="text-[#616161] text-[13px] leading-relaxed">
                                Universitas indonesia, gedung perpustakaan, politeknik negeri jakarta, beji, depok.
                            </p>
                        </div>

                        {/* PHONE */}
                        <div>
                            <h4 className="text-sm font-medium mb-6 flex items-center gap-2 text-[#111827]">
                                <i className="ti ti-phone text-[#D82F5A]"></i> Kontak
                            </h4>
                            <p className="text-[#616161] text-[13px] leading-relaxed">
                                021-7270036 ext 303
                            </p>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <h4 className="text-sm font-medium mb-6 flex items-center gap-2 text-[#111827]">
                                <i className="ti ti-mail text-[#D82F5A]"></i> Email
                            </h4>
                            <p className="text-[#616161] text-[13px] underline underline-offset-8 decoration-[#D82F5A]/30 hover:text-[#D82F5A] transition-colors cursor-pointer">
                                perpustakaan@pnj.ac.id
                            </p>
                        </div>

                    </div>

                    {/* COPYRIGHT SECTION - BACKGROUND BLACK */}
                    <div className="bg-[#111827] py-4 -mx-10">
                        <p className="text-center text-white text-xs opacity-80">
                            © 2026 CHURNGUARD CRM. Hak Cipta Dilindungi Undang-Undang.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ValidasiProses;