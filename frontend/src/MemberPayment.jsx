import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconChevronDown,
  IconChevronUp,
  IconBell,
  IconQrcode,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
  IconMapPin,
  IconChevronRight,
  IconPhone,
  IconMail
} from '@tabler/icons-react';
import logoDana from './assets/dana.png';
import logoOvo from './assets/ovo.png';
import logoShopee from './assets/shopeepay.png';
import logochurn from './assets/logo churn.png';
import unggahdata from './assets/unggahdata.png';
import { IconBrandMyOppo } from '@tabler/icons-react';
import { IconUserCircle } from '@tabler/icons-react';
import { IconLogout2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import { useAuth } from '../utils/auth';

const MemberPayment = () => {
  const user = useAuth()
  const plans = [
    { id: 1, title: "Paket Premium Growth Strategist", duration: "1 Bulan", price: 499000, oldPrice: 549900 },
    { id: 2, title: "Paket Insight Enthusiast", duration: "3 Bulan", price: 199000, oldPrice: 549900 },
    { id: 3, title: "Paket Intelligence Master", duration: "3 Bulan", price: 949000, oldPrice: 1049000 }
  ];

  // State
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [isEWalletOpen, setIsEWalletOpen] = useState(true); // Default open agar terlihat
  const [selectedWallet, setSelectedWallet] = useState('Shopee Pay');
  const [isPromoActive, setIsPromoActive] = useState(false);
  const [linkedWallets, setLinkedWallets] = useState(['Shopee Pay']);
  const [isOpen, setIsOpen] = useState(false);

  const togglePromo = () => {
    if (!isPromoActive) {
      // Aktifkan Promo
      setSelectedPlan({
        ...plans[0],
        duration: "3 Bulan",
        price: 549000,
        title: "Paket Premium Growth Strategist (Promo)"
      });
      setIsPromoActive(true);
    } else {
      // Balik ke Normal
      setSelectedPlan(plans[0]);
      setIsPromoActive(false);
    }
  };

  const wallets = [
    { name: 'Dana', cashback: '35%', logo: logoDana },
    { name: 'OVO', cashback: '15%', logo: logoOvo },
    { name: 'Shopee Pay', cashback: '50%', logo: logoShopee },
  ];

  const handleConnect = (walletName) => {
    // Simulasi loading sebentar
    alert(`Menghubungkan ke ${walletName}...`);

    if (!linkedWallets.includes(walletName)) {
      setLinkedWallets([...linkedWallets, walletName]);
    }
  };

  // Helper untuk mendapatkan logo yang sedang terpilih di Ringkasan
  const getSelectedLogo = () => {
    if (selectedWallet === 'QRIS') return <IconQrcode size={14} className="text-gray-600" />;
    const wallet = wallets.find(w => w.name === selectedWallet);
    // Sekarang tinggal panggil wallet.logo yang isinya sudah variabel import
    return wallet ? <img src={wallet.logo} alt="" className="w-4 h-4 object-contain" /> : null;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Plus_Jakarta_Sans',sans-serif] text-[#1F2937]">
      {/* NAVBAR */}
      {/* Tambahkan justify-between dan z-index yang sangat tinggi (z-50 atau lebih) */}
      <Header formData={user} profileImg={user?.avatar} />
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-10 py-8 grid grid-cols-12 gap-8">

        {/* LEFT SECTION */}
        <div className="col-span-8 space-y-6">
          <div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1 tracking-tight">
                Pembayaran
              </h2>

              {/* BREADCRUMBS */}
              <div className="flex items-center gap-2 mb-6">
                <span
                  onClick={() => window.location.href = '/Member'}
                  className="text-xs  text-gray-400 cursor-pointer hover:text-[#D82F5A] transition-colors"
                >
                  Member
                </span>

                <IconChevronRight size={15} className="text-gray-300" />

                <span className="text-xs text-[#D82F5A] ">
                  Pembayaran
                </span>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-[4px] p-6 mb-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[#D82F5A] text-lg font-semibold">{selectedPlan.title}</h3>
                  <p className="text-gray-400 text-xs font-medium">{selectedPlan.duration}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-xl font-semibold">Rp {selectedPlan.price.toLocaleString('id-ID')}</span>
                    <span className="text-gray-400 text-xs font-medium">/ Bulan</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs text-green-600 px-1.5 py-0.5 font-medium">Diskon 10%</span>
                    <span className="text-gray-300 line-through text-xs font-medium">Rp {selectedPlan.oldPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 bg-[#FEF5F6] border border-[#D82F5A]/5 rounded-[4px] p-3 flex justify-center items-center gap-2">
                <p className="text-xs font-medium text-gray-600 text-center">
                  {isPromoActive
                    ? "Promo 3 bulan telah diaktifkan! Ingin kembali ke paket awal?"
                    : "Apakah Anda ingin mengubah paket yang lain menjadi 3 bulan hanya dengan tambahan RP 50.000?"
                  }
                </p>
                <button
                  onClick={togglePromo}
                  className={`text-xs font-medium hover:underline flex-shrink-0 ${isPromoActive ? 'text-gray-500' : 'text-[#D82F5A]'}`}
                >
                  {isPromoActive ? 'Cancel' : 'Ganti'}
                </button>
              </div>

              <div className="mt-1 space-y-4 pt-6">
                {plans.slice(1).map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      // Jika yang diklik adalah paket yang sudah terpilih, balikkan ke plans[0]
                      // Jika bukan, maka pilih paket tersebut
                      if (selectedPlan.id === plan.id) {
                        setSelectedPlan(plans[0]);
                        setIsPromoActive(false); // Pastikan status promo juga mati kalau balik ke awal
                      } else {
                        setSelectedPlan(plan);
                        setIsPromoActive(false); // Matikan status promo jika pilih paket manual
                      }
                    }}
                    className={`flex justify-between items-center p-3 cursor-pointer border rounded-[4px] transition-all ${selectedPlan.id === plan.id
                      ? 'border-[#D82F5A] bg-[#FEF5F6]/30 shadow-sm'
                      : 'border-[#ededed] hover:bg-gray-50'
                      }`}
                  >
                    <div>
                      <h4 className={`font-medium text-xs ${selectedPlan.id === plan.id ? 'text-[#D82F5A]' : 'text-gray-700'}`}>
                        {plan.title}
                      </h4>
                      <p className="text-xs text-gray-400">{plan.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-xs text-gray-700">
                        Rp {plan.price.toLocaleString('id-ID')} <span className="text-gray-400 font-normal">/ Bulan</span>
                      </p>
                      <p className="text-gray-300 line-through text-[9px]">
                        Rp {plan.oldPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD SECTION - UPDATED */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-4 tracking-tight">Metode Pembayaran</h2>
            <div className="bg-white border border-gray-100 rounded-[4px] overflow-hidden shadow-sm">
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => setIsEWalletOpen(!isEWalletOpen)}
              >
                <span className="font-semibold text-xs ">E-Wallet</span>
                {isEWalletOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </div>

              <AnimatePresence>
                {isEWalletOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-gray-50/30 border-t border-gray-50">
                    {wallets.map((wallet) => (
                      <div
                        key={wallet.name}
                        className="p-4 px-6 flex justify-between items-center border-b border-gray-50 last:border-b-0 hover:bg-white cursor-pointer transition-all"
                        onClick={() => setSelectedWallet(wallet.name)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13  rounded-[4px] p-2 flex items-center justify-center">
                            <img src={wallet.logo} alt={wallet.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{wallet.name}</p>
                            <p className="text-[9px] text-gray-400 font-medium">Cashback {wallet.cashback}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-4">

                            {/* Radio Button Indikator (CUKUP SATU INI SAJA) */}
                            <div className="flex items-center gap-4">
                              {/* 1. Logika Teks: Sambungkan vs Tersambung */}
                              {!linkedWallets.includes(wallet.name) ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConnect(wallet.name);
                                  }}
                                  className="text-xs text-[#929191]  hover:underline active:opacity-70 transition-all"
                                >
                                  Sambungkan
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-[#D82F5A] tracking-tight">
                                    Tersambung
                                  </span>
                                </div>
                              )}

                              {/* 2. Radio Button: HANYA SATU DIV INI SAJA */}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all 
    ${!linkedWallets.includes(wallet.name)
                                  ? 'bg-gray-50 border-gray-100 cursor-not-allowed'
                                  : selectedWallet === wallet.name
                                    ? 'border-[#D82F5A] bg-white'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                {/* Titik pink hanya muncul jika SUDAH tersambung DAN dipilih */}
                                {selectedWallet === wallet.name && linkedWallets.includes(wallet.name) && (
                                  <div className="w-2 h-2 bg-[#D82F5A] rounded-full" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="p-4 px-6 flex justify-between items-center border-t border-gray-50 cursor-pointer hover:bg-gray-50 transition-all"
                onClick={() => setSelectedWallet('QRIS')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-gray-100 rounded-[4px] flex items-center justify-center bg-white text-gray-500 shadow-sm">
                    <IconQrcode size={22} />
                  </div>
                  <span className="text-sm font-semibold">QRIS</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${selectedWallet === 'QRIS' ? 'border-[#D82F5A]' : 'border-gray-200'}`}>
                  {selectedWallet === 'QRIS' && <div className="w-2 h-2 bg-[#D82F5A] rounded-full" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR (RINGKASAN) - UPDATED WITH LOGO */}
        <div className="col-span-4">
          <div className="bg-white border border-gray-100 rounded-[4px] p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold text-base mb-6  border-b border-gray-50 pb-4">Ringkasan Pembelian</h3>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Transaction ID', value: '83636116273890091' },
                { label: 'Name', value: 'Zahrah Purnama' },
                { label: 'Paket', value: selectedPlan.title.replace('Paket ', '') },
                { label: 'Durasi', value: selectedPlan.duration },
                { label: 'Tanggal Pembelian', value: '03 Mei 2026' },
                { label: 'Tanggal Tenggat', value: selectedPlan.duration === "3 Bulan" ? '03 Ags 2026' : '03 Jun 2026' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-[#9f9f9f]">{item.label}</span>
                  <span className="text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-dashed border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Harga Awal</span>
                <span className="text-gray-700 ">Rp {selectedPlan.oldPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Potongan Diskon</span>
                <span className="text-[#D82F5A] ">-Rp {(selectedPlan.oldPrice - selectedPlan.price).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-50 mt-2">
                <span className="font-medium text-gray-500 text-xs">Total Harga</span>
                <span className="text-black font-semibold">Rp {selectedPlan.price.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* METODE PEMBAYARAN RINGKASAN WITH ICON */}
            <div className="mt-6 mb-4 flex justify-between items-center bg-gray-50 p-2.5 rounded-[2px] border border-gray-100">
              <span className="text-xs text-gray-400">Metode</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[2px] flex items-center justify-center p-0.5">
                  {getSelectedLogo()}
                </div>
                <span className="text-xs font- text-gray-700">{selectedWallet}</span>
              </div>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-colors">
              Bayar Sekarang
            </button>

            <p className="mt-4 text-[10px] text-[#FF1515] leading-tight">
              *Cek kembali paket & metode pembayaran Anda. Pilih paket yang tepat untuk tekan Churn Rate sebelum melanjutkan!
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 pt-12 px-10">
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
        <div className="bg-black py-6  -mx-10">
          <p className="text-center text-white text-sm opacity-70">
            © 2026 CHURNGUARD CRM. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MemberPayment;