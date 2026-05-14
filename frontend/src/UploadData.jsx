import React, { useState, useRef } from 'react';
import logochurn from './assets/logo churn.png';
import unggahdata from './assets/unggahdata.png';
import { IconBrandMyOppo } from '@tabler/icons-react';
import { IconUserCircle } from '@tabler/icons-react';
import { IconLogout2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../utils/auth";
import Sidebar from './SideBar';

const UploadDataFull = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('update');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const handleBrowseClick = () => fileInputRef.current.click();

    const user = useAuth()

    const processFile = (file) => {
        if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
            setSelectedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + " kb",
                raw: file
            });
        } else {
            alert("mohon unggah file format .csv");
        }
    };
    const handleUpload = async () => {

        if (!selectedFile) {
            return alert("Pilih file dulu");
        }

        try {

            const formData = new FormData();

            formData.append("file", selectedFile.raw);

            const token = localStorage.getItem("token");

            const res = await axios.post(
                "http://localhost:5000/csv/upload-csv",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            navigate("/validasiProses", {
                state: {
                    file: selectedFile,
                    validation: res.data
                }
            });

        } catch (err) {

            console.log(err);

        }

    };
    const handleFileChange = (e) => processFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    };


    return (
        <div className="flex min-h-screen bg-[#F9FAFB] text-[#111827]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* --- SIDEBAR --- */}
        <Sidebar></Sidebar>
            {/* --- MAIN SECTION --- */}
            <main className="flex-1 overflow-x-hidden">

                {/* TOPBAR */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-10 sticky top-0 z-50">

                    <div className="relative">

                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 cursor-pointer"
                        >

                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name}`}
                                className="w-10 h-10 rounded-xl"
                                alt="avatar"
                            />

                            <div>
                                <p className="text-sm font-semibold">
                                    {user?.name}
                                </p>

                                <p className="text-xs text-[#D82F5A]">
                                    {user?.email}
                                </p>
                            </div>

                        </div>

                        {
                            isOpen && (

                                <div className="absolute right-0 mt-4 w-72 bg-white rounded-[4px] shadow-xl border z-50">

                                    <div className="p-5 flex items-center gap-4">

                                        <img
                                            src={`https://ui-avatars.com/api/?name=${user?.name}`}
                                            className="w-12 h-12 rounded-xl"
                                            alt=""
                                        />

                                        <div>
                                            <p className="font-semibold">
                                                {user?.name}
                                            </p>

                                            <p className="text-xs text-[#D82F5A]">
                                                User
                                            </p>
                                        </div>

                                    </div>

                                    <div className="border-t">

                                        <div className="p-2">

                                            <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                <IconUserCircle stroke={1.5} />
                                                <span>Profile</span>
                                            </div>

                                            <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                <IconBrandMyOppo stroke={1.5} />
                                                <span>Member</span>
                                            </div>

                                            <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                <IconLogout2 stroke={1.5} />
                                                <span>Logout</span>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                </header>             {/* --- CONTENT AREA --- */}
                <div className="p-8 w-full">
                    <div className="mb-8">
                        {/* --- BREADCRUMB --- */}
                        <div className="mb-10">
                            <h1 className="text-2xl font-semibold text-[#111827]">Dashboard</h1>
                            <div className="flex items-center gap-2 mt-1 transition-all">
                                {/* Link Dashboard - Bisa di klik */}
                                <span
                                    onClick={() => window.location.href = '/DashboardUser'}
                                    className="text-xs text-gray-400  cursor-pointer hover:text-[#D82F5A] transition-colors"
                                >
                                    Dashboard
                                </span>

                                {/* Icon Next / Chevron */}
                                <i className="ti ti-chevron-right text-sm text-gray-300"></i>

                                {/* Current Page */}
                                <span className="text-xs text-[#D82F5A] ">
                                    Unggah Data
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stepper */}
                    {/* --- STEPPER SECTION --- */}
                    <div className="flex flex-col items-center mb-[85px] w-full max-w-4xl mx-auto">
                        <div className="relative flex items-center justify-between w-full">

                            {/* Background Line (Garis Abu-abu di Belakang) */}
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 z-0"></div>

                            {/* Step 01 */}
                            <div className="relative z-10 flex flex-col items-center bg-[#FDFDFD] px-4">
                                <div className="w-8 h-8 rounded-full border-2 border-[#D82F5A] bg-white flex items-center justify-center shadow-[0_0_10px_rgba(216,47,90,0.2)]">
                                    <span className="text-[#D82F5A] text-xs font-medium">01</span>
                                </div>
                                <span className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-[#111827]">Upload File</span>
                            </div>

                            {/* Step 02 */}
                            <div className="relative z-10 flex flex-col items-center bg-[#FDFDFD] px-4">
                                <div className="w-8 h-8 rounded-full border-2 border-gray-100 bg-white flex items-center justify-center">
                                    <span className="text-gray-300 text-xs font-medium">02</span>
                                </div>
                                <span className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-gray-400">Validasi & Proses</span>
                            </div>

                            {/* Step 03 */}
                            <div className="relative z-10 flex flex-col items-center bg-[#FDFDFD] px-4">
                                <div className="w-8 h-8 rounded-full border-2 border-gray-100 bg-white flex items-center justify-center">
                                    <span className="text-gray-300 text-xs font-medium">03</span>
                                </div>
                                <span className="absolute -bottom-8 whitespace-nowrap text-xs font-medium text-gray-400">Proses & Hasil</span>
                            </div>

                        </div>

                    </div>

                    <div className="grid grid-cols-12 gap-10 mt-5">
                        {/* Area Upload */}
                        <div className="col-span-7">
                            <h3 className="text-sm font-medium mb-4 text-black">Unggah file</h3>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed  bg-white rounded-[4px] p-16 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-[#D82F5A] bg-red-50/20' : 'border-[#D82F5A] bg-white hover:border-red-100'}`}
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#D82F5A"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-all duration-300 group-hover:scale-110"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                                    <path d="M7 9l5 -5l5 5" />
                                    <path d="M12 4l0 12" />
                                </svg></div>
                                <p className="text-base font-semibold">Pilih file atau seret dan lepaskan ke sini.</p>
                                <p className="text-xs text-gray-400 mt-1 ">format .csv (maksimal 10 mb)</p>
                                <button onClick={handleBrowseClick} className="mt-6 px-6 py-2 border border-[#D9D9D9] rounded-[4px] text-xs hover:bg-gray-50">Telusuri file</button>
                            </div>
                        </div>

                        {/* Pratinjau Data (Empty State by default) */}
                        <div className="col-span-5">
                            <h3 className="text-sm font-medium mb-4 text-black">Pratinjau data</h3>
                            {selectedFile ? (
                                <div className="bg-white border border-[#EDEDED]  p-4 rounded-[4px] overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                                    <div className="h-36 bg-gray-50 flex items-center justify-center"><i className="ti ti-file-spreadsheet text-[#1D6F42] text-5xl"></i></div>
                                    <div className="p-5">
                                        <h4 className="text-sm font-medium truncate">{selectedFile.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {/* Ukuran File */}
                                            <span className="text-[12px] text-gray-400">
                                                {selectedFile.size} dari {selectedFile.size}
                                            </span>

                                            {/* Titik Pemisah (Dot) */}
                                            <span className="text-gray-300 text-[10px]">●</span>

                                            {/* Icon Centang Hijau & Teks Selesai */}
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-4 h-4 bg-[#4ADE80] rounded-full flex items-center justify-center">
                                                    <i className="ti ti-check text-white text-xs"></i>
                                                </div>
                                                <span className="text-xs text-gray-500 ">Selesai</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <button className="flex-1 py-2 bg-[#111827] text-white text-xs rounded-[4px]">Rincian</button>
                                            <button onClick={() => setSelectedFile(null)} className="flex-1 py-2 border border-[#D82F5A] text-[#D82F5A] text-xs  rounded-[4px]">Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[305px] bg-white border border-[#EDEDED] border-dashed rounded-[4px] flex flex-col items-center justify-center text-center p-8 transition-all hover:border-red-200 group">

                                    {/* Lingkaran Ikon Pink */}
                                    <div className="w-15 h-15 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-50 group-hover:scale-110 transition-transform duration-300">
                                        <i className="ti ti-file-search text-[#D82F5A] text-2xl"></i>
                                    </div>

                                    {/* Judul Kecil (Hitam) */}
                                    <h4 className="text-sm font-medium text-[#111827] mb-2 tracking-tight">
                                        Pratinjau data belum tersedia
                                    </h4>

                                    {/* Teks Deskriptif (Abu-abu Tua) */}
                                    <p className="text-xs text-gray-500 max-w-[300px] leading-relaxed">
                                        unggah file csv anda di area sebelah kiri untuk melihat ringkasan data di sini.
                                    </p>


                                </div>
                            )}
                        </div>

                        {/* Metode & Footer Actions */}
                        <div className="col-span-12 mt-8">
                            <h3 className="text-sm font-medium text-[#111827] mb-5">Metode Upload</h3>

                            {/* Pembungkus ini harus flex dan items-end */}
                            <div className="flex flex-row items-end gap-5">

                                {/* Opsi 1 */}
                                <div
                                    onClick={() => setUploadMethod('new')}
                                    className={`max-w-[320px] flex-1 p-4 rounded-[4px] border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${uploadMethod === 'new' ? 'border-[#D82F5A] bg-[#FEF5F6]' : 'border-gray-100 bg-[#F9F9F9]'
                                        }`}
                                >
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${uploadMethod === 'new' ? 'border-[#D82F5A]' : 'border-gray-300'
                                        }`}>
                                        {uploadMethod === 'new' && <div className="w-2.5 h-2.5 bg-[#D82F5A] rounded-full"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${uploadMethod === 'new' ? 'text-[#111827]' : 'text-gray-700'}`}>Analisis Baru</p>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">Memproses data pelanggan sebagai analisis baru untuk insight terbaru.</p>
                                    </div>
                                </div>

                                {/* Opsi 2 */}
                                <div
                                    onClick={() => setUploadMethod('update')}
                                    className={`max-w-[320px] flex-1 p-4 rounded-[4px] border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${uploadMethod === 'update' ? 'border-[#D82F5A] bg-[#FEF5F6]' : 'border-gray-100 bg-[#F9F9F9]'
                                        }`}
                                >
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${uploadMethod === 'update' ? 'border-[#D82F5A]' : 'border-gray-300'
                                        }`}>
                                        {uploadMethod === 'update' && <div className="w-2.5 h-2.5 bg-[#D82F5A] rounded-full"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${uploadMethod === 'update' ? 'text-[#111827]' : 'text-gray-700'}`}>Update Data Lama</p>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">Memperbarui data yang sudah ada tanpa menghapus hasil sebelumnya.</p>
                                    </div>
                                </div>

                                {/* Tombol Selanjutnya - SEJAJAR SEBELAH KANAN */}
                                <div className="flex-none ml-auto">
                                    <button
                                        disabled={!selectedFile}
                                        onClick={handleUpload}
                                        className={`flex items-center gap-3 px-10 py-3 rounded-[4px] text-sm transition-all duration-300 active:scale-95 ${selectedFile
                                            ? 'bg-[#111827] text-white hover:bg-black'
                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            }`}
                                    >
                                        <span>Selanjutnya</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 6l6 6l-6 6" />
                                        </svg>
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div >

                {/* --- FOOTER --- */}
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
            </main >
        </div >
    );
};

export default UploadDataFull;