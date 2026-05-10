import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconLayoutDashboard,
  IconChartBar,
  IconHistory,
  IconMessageHeart,
  IconBell,
  IconChevronDown,
  IconStar,
  IconSend,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
  IconCircleCheck,
  IconSearch,
  IconSettings
} from '@tabler/icons-react';
import logochurn from './assets/logo churn.png';
import unggahdata from './assets/unggahdata.png';
import { IconBrandMyOppo } from '@tabler/icons-react';
import { IconUserCircle } from '@tabler/icons-react';
import { IconLogout2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif] text-[#111827] flex flex-col">
      <div className="flex flex-1">
        {/* SIDEBAR - Sharp 4px edges */}
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
            <div 
            onClick={() => navigate('/riwayatPrediksi')}
            className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-all">
              <i className="ti ti-history text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
              <span className="text-sm">Riwayat Prediksi</span>
            </div>


            <div className="bg-[#FEF5F6] text-[#D82F5A] flex items-center gap-4 px-5 py-3 rounded-[4px] cursor-pointer transition-all">
              <i className="ti ti-message text-xl" style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}></i>
              <span className="text-sm">User Feedback</span>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
          {/* TOPBAR - Full Stretch */}
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
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
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

          {/* PAGE CONTENT */}
          <div className="p-8 w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Penilaian Pelanggan</h1>
              <p className="text-sm text-gray-500 mt-1">Berikan feedback teknis untuk membantu optimalisasi algoritma AI kami.</p>
            </div>

            {/* Layout Grid */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">

              {/* FORM SECTION - Expanded Left */}
              <div className="flex-1 bg-white border border-gray-200 rounded-[4px] shadow-sm relative overflow-hidden w-full">
                <form className="p-8 space-y-8" onSubmit={handleSubmit}>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-black">Rating Sistem</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          onClick={() => setRating(star)}
                        >
                          <IconStar
                            size={24}
                            stroke={1.5}
                            className={`transition-all ${star <= (hover || rating)
                              ? 'fill-[#D82F5A] text-[#D82F5A]'
                              : 'text-gray-200'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">Topik Masukan</label>
                      <div className="relative">
                        <select className="w-full bg-white border border-[#ededed] h-10 px-3 rounded-[4px] outline-none text-xs text-gray-700 appearance-none focus:border-[#ededed] transition-colors">
                          <option>Pilih Kategori</option>
                          <option>UI Accuracy</option>
                          <option>Prediction Speed</option>
                          <option>Data Security</option>
                        </select>

                        {/* Icon Dropdown */}
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                          <IconChevronDown size={16} stroke={2} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">Subjek</label>
                      <input
                        type="text"
                        placeholder="Misal: Kendala sinkronisasi"
                        className="w-full bg-white border border-[#ededed] h-10 px-3 rounded-[4px] outline-none text-xs text-gray-700 focus:border-[#ededed] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Deskripsi Ulasan</label>
                    <textarea
                      placeholder="Deskripsikan masukan Anda secara mendetail..."
                      className="w-full border border-[#ededed] p-4 rounded-[4px] outline-none text-xs text-gray-700 focus:border-[#ededed] transition-colors min-h-[150px] resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="bg-black text-white px-8 h-10 rounded-[4px] font-medium text-xs hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    Kirim Feedback <IconSend size={14} />
                  </button>
                </form>

                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-20"
                    >
                      <IconCircleCheck className="text-green-600 mb-2" size={32} />
                      <p className="text-xs font-xs">Feedback Terkirim</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SIDEBAR INFO - Right Aligned */}
              <div className="w-full xl:w-80 space-y-4">
                <div className="bg-[#111827] p-6 rounded-[4px] text-white">
                  <h4 className="text-sm font-semibold mb-2">Technical Support</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Butuh bantuan integrasi data atau menemukan bug sistem?
                  </p>
                  <button className="w-full py-2.5 bg-[#D82F5A] text-white text-xs rounded-[4px] hover:bg-[#b52448] transition-colors">
                    Buka Tiket Bantuan
                  </button>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-[4px]">
                  <h4 className="text-sm font-semibold mb-2 text-gray-900">Privacy</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Data ulasan Anda digunakan sepenuhnya untuk peningkatan machine learning model.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* FOOTER - Full Width */}
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

export default Feedback;