import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import logochurn from './assets/logo churn.png';

import {
    IconBrandMyOppo,
    IconUserCircle,
    IconLogout2
} from '@tabler/icons-react';

export default function CostumerDetail() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const prediction_id = searchParams.get("prediction_id");
    const CustomerID = searchParams.get("CustomerID");

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const [chatMessage, setChatMessage] = useState("");
    const [emailMessage, setEmailMessage] = useState("");

    const [showPopup, setShowPopup] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [promoName, setPromoName] = useState("");
    const [promoDiscount, setPromoDiscount] = useState("");
    const [expiredDate, setExpiredDate] = useState("");

    const getRetentionRecommendation = () => {

        if (detail.Risk === "High") {

            if (detail.Segment === "Basic Frustrated User") {
                return "Berikan diskon besar dan rekomendasi film favorit customer untuk mencegah churn.";
            }

            if (detail.Segment === "Basic User") {
                return "Berikan promo subscription dan rekomendasi content populer.";
            }

            return "Berikan loyalty offer dan rekomendasi exclusive content.";
        }

        if (detail.Risk === "Medium") {

            if (detail.Segment === "Basic Frustrated User") {
                return "Kirim rekomendasi film dan reminder untuk meningkatkan engagement.";
            }

            if (detail.Segment === "Basic User") {
                return "Rekomendasikan film trending berdasarkan genre favorit.";
            }

            return "Berikan reward kecil dan rekomendasi content premium.";
        }

        return "Tidak perlu diskon, cukup rekomendasikan film populer.";
    };

    const handleGenerateEmail = async () => {

        try {

            const response = await axios.post(
                `http://localhost:5000/email/generate`,
                {
                    promo_name: promoName,
                    promo_discount: promoDiscount,
                    expired_date: expiredDate,
                    risk: detail.Risk,
                    segment: detail.Segment,
                    genre: detail.GenrePreference,
                    email: detail.email
                }
            );

            setEmailMessage(response.data.html);
            setChatMessage(response.data.html);

            setShowPopup(false);

        } catch (err) {

            console.log(err);

        }
    };

    useEffect(() => {

        const fetchDataUserDetail = async () => {

            const token = localStorage.getItem("token");

            try {

                const response = await axios.get(
                    `http://localhost:5000/prediction/costumer-detail?customerid=${CustomerID}&predictionid=${prediction_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setDetail(response.data.data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }
        };

        fetchDataUserDetail();

    }, []);

    const handleSendChat = async () => {

        try {

            await axios.post(
                `http://localhost:5000/email/send`,
                {
                    html: chatMessage,
                    email: detail.email
                }
            );

            setChatMessage("");
            setEmailMessage("");

        } catch (error) {

            console.log(error);

        }
    };

    if (loading) {

        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );

    }

    if (!detail) {

        return (
            <div className="flex justify-center items-center h-screen">
                Data tidak ditemukan
            </div>
        );

    }

    const stats = [
        {
            label: 'Customer ID',
            value: detail.CustomerID,
            icon: 'ti-id'
        },
        {
            label: 'Email',
            value: detail.email,
            icon: 'ti-mail'
        },
        {
            label: 'Usia Akun',
            value: `${detail.AccountAge} Bulan`,
            icon: 'ti-calendar-time'
        },
        {
            label: 'Tagihan Bulanan',
            value: `$${detail.MonthlyCharges}`,
            icon: 'ti-receipt-2'
        },
        {
            label: 'Jam Menonton',
            value: `${detail.ViewingHoursPerWeek}/minggu`,
            icon: 'ti-device-tv'
        },
        {
            label: 'Durasi Menonton',
            value: `${detail.AverageViewingDuration}m`,
            icon: 'ti-clock'
        },
        {
            label: 'Rating User',
            value: `${detail.UserRating} / 5`,
            icon: 'ti-star'
        },
        {
            label: 'Subscription',
            value: detail.SubscriptionType,
            icon: 'ti-crown'
        },
    ];

    return (

        <div className="flex min-h-screen bg-[#F9FAFB] font-['Plus_Jakarta_Sans',sans-serif] text-[#1F2937]">

            {/* SIDEBAR */}
            <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-20">

                <div className="pt-10 pb-4 flex flex-col items-center">

                    <img
                        src={logochurn}
                        alt="logochurn"
                        className="w-28 h-auto"
                    />

                    <div className="w-[85%] border-b border-gray-100 mt-4"></div>

                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">

                    <div
                        onClick={() => navigate('/DashboardUser')}
                        className="bg-[#FEF5F6] text-[#D82F5A] flex items-center gap-4 px-5 py-3 rounded-[4px] cursor-pointer"
                    >
                        <i className="ti ti-home text-xl"></i>
                        <span className="text-sm">Dashboard</span>
                    </div>

                    <div className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer">
                        <i className="ti ti-chart-bar text-xl"></i>
                        <span className="text-sm">Analisis</span>
                    </div>

                    <div className="text-[#E2A7B8] flex items-center gap-4 px-6 py-4 rounded-[4px] hover:bg-gray-50 cursor-pointer">
                        <i className="ti ti-history text-xl"></i>
                        <span className="text-sm">Riwayat</span>
                    </div>

                </nav>

            </aside>

            {/* MAIN */}
            <main className="flex-grow flex flex-col">

                {/* HEADER */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-10 gap-6 sticky top-0 z-50">

                    <div className="relative">

                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => setIsOpen(!isOpen)}
                        >

                            <img
                                src="https://ui-avatars.com/api/?name=User&background=D82F5A&color=fff"
                                className="w-10 h-10 rounded-xl"
                                alt=""
                            />

                            <div>
                                <p className="text-sm font-semibold">
                                    Customer Analyst
                                </p>

                                <p className="text-xs text-[#D82F5A]">
                                    admin@gmail.com
                                </p>
                            </div>

                        </div>

                        {
                            isOpen && (

                                <div className="absolute right-0 mt-4 w-72 bg-white rounded-[4px] shadow-xl border z-50">

                                    <div className="p-2">

                                        <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#FEF5F6] rounded-xl cursor-pointer">
                                            <IconUserCircle stroke={1.5} />
                                            <span>Profile</span>
                                        </div>

                                        <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#FEF5F6] rounded-xl cursor-pointer">
                                            <IconBrandMyOppo stroke={1.5} />
                                            <span>Member</span>
                                        </div>

                                        <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#FEF5F6] rounded-xl cursor-pointer">
                                            <IconLogout2 stroke={1.5} />
                                            <span>Logout</span>
                                        </div>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                </header>

                {/* CONTENT */}
                <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px]">

                    {/* LEFT */}
                    <div className="lg:col-span-8 space-y-6">

                        <div>

                            <h1 className="text-2xl font-semibold">
                                Detail Customer Insight
                            </h1>

                            <div className="flex items-center gap-2 mt-1">

                                <span
                                    onClick={() => navigate('/DashboardUser')}
                                    className="text-[11px] text-gray-400 cursor-pointer hover:text-[#D82F5A]"
                                >
                                    Dashboard
                                </span>

                                <i className="ti ti-chevron-right text-[10px] text-gray-300"></i>

                                <span className="text-xs text-[#D82F5A]">
                                    Customer Insight
                                </span>

                            </div>

                        </div>

                        {/* TOP BOX */}
                        <div className="bg-white p-10 rounded-[4px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">

                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D82F5A]"></div>

                            <div className="relative flex items-center justify-center w-48 h-48 border-[14px] border-[#D82F5A] border-t-gray-50 rounded-full">

                                <div className="text-center">

                                    <p className="text-sm text-gray-400 mb-2">
                                        Probabilitas
                                    </p>

                                    <p className="text-4xl font-semibold text-gray-900">
                                        {detail.Score}%
                                    </p>

                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-x-16 gap-y-8 flex-grow">

                                <div>
                                    <p className="text-xs text-gray-400 mb-1">
                                        Customer ID
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {detail.CustomerID}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 mb-1">
                                        Usia Akun
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {detail.AccountAge} Bulan
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-[#D82F5A] mb-1">
                                        Churn Score
                                    </p>
                                    <p className="text-sm font-semibold text-[#D82F5A]">
                                        {detail.Score}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 mb-1">
                                        Prediksi
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {detail.Prediction === 1 ? "Churn" : "Non-Churn"}
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* STATS */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                            {
                                stats.map((s, i) => (

                                    <div
                                        key={i}
                                        className="bg-white p-5 rounded-[4px] border border-gray-100 shadow-sm"
                                    >

                                        <div className="flex items-center gap-2 mb-2 text-gray-400">

                                            <i className={`ti ${s.icon} text-lg text-[#D82F5A]`}></i>

                                            <p className="text-xs">
                                                {s.label}
                                            </p>

                                        </div>

                                        <p className="text-xs font-semibold text-gray-800">
                                            {s.value}
                                        </p>

                                    </div>

                                ))
                            }

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-4 flex flex-col space-y-6">

                        <div className="bg-white rounded-[4px] border border-gray-100 shadow-sm overflow-hidden">

                            <div className="bg-gray-50 p-5 border-b border-gray-100 flex items-center gap-3">

                                <div className="w-8 h-8 bg-black rounded-[4px] flex items-center justify-center text-white">
                                    <i className="ti ti-messages text-lg"></i>
                                </div>

                                <div>
                                    <h2 className="font-semibold text-base">
                                        Communication Center
                                    </h2>

                                    <p className="text-xs text-gray-400">
                                        Interaksi langsung pelanggan
                                    </p>
                                </div>

                            </div>

                            <div className="p-6 space-y-5">

                                {/* CHAT */}
                                <div>

                                    <label className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                                        <i className="ti ti-message-2 text-[#D82F5A]"></i>
                                        Kirim Chat
                                    </label>

                                    <textarea
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Tulis pesan..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-[4px] p-4 text-xs h-28 outline-none"
                                    />

                                    <button
                                        onClick={handleSendChat}
                                        className="w-full mt-3 bg-black text-white py-3 rounded-[4px]"
                                    >
                                        Kirim Pesan
                                    </button>

                                </div>

                                <div className="border-t"></div>

                                {/* EMAIL */}
                                <div>

                                    <label className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                                        <i className="ti ti-mail-fast text-[#D82F5A]"></i>
                                        Generated Email
                                    </label>

                                    <div className="bg-gray-50 border rounded-[4px] p-4 min-h-[200px] max-h-[250px] overflow-auto">

                                        {
                                            emailMessage ? (

                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: emailMessage
                                                    }}
                                                />

                                            ) : (

                                                <p className="text-xs text-gray-400">
                                                    Generated email preview...
                                                </p>

                                            )
                                        }

                                    </div>

                                    <div className="flex gap-3 mt-4">

                                        <button
                                            onClick={() => setShowPopup(true)}
                                            className="w-full bg-[#D82F5A] text-white py-3 rounded-[4px]"
                                        >
                                            Generate Email
                                        </button>

                                        <button
                                            onClick={() => {

                                                const previewWindow = window.open("", "_blank");

                                                previewWindow.document.write(emailMessage);

                                                previewWindow.document.close();

                                            }}
                                            className="w-full bg-black text-white py-3 rounded-[4px]"
                                        >
                                            Preview
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

            {/* POPUP */}
            {
                showPopup && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

                        <div className="bg-white w-full max-w-md rounded-[4px] shadow-2xl overflow-hidden border">

                            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">

                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <i className="ti ti-settings-automation text-[#D82F5A]"></i>
                                    Konfigurasi Campaign
                                </span>

                                <button
                                    onClick={() => setShowPopup(false)}
                                >
                                    <i className="ti ti-x"></i>
                                </button>

                            </div>

                            <div className="p-8 space-y-5">

                                <div className="grid grid-cols-2 gap-4">

                                    <div>

                                        <label className="text-xs text-gray-400">
                                            Risk Level
                                        </label>

                                        <div className="bg-gray-50 border rounded-[4px] p-3 text-xs font-bold text-orange-500 mt-1">
                                            {detail.Risk}
                                        </div>

                                    </div>

                                    <div>

                                        <label className="text-xs text-gray-400">
                                            Segment
                                        </label>

                                        <div className="bg-gray-50 border rounded-[4px] p-3 text-xs mt-1">
                                            {detail.Segment}
                                        </div>

                                    </div>

                                </div>

                                <div>

                                    <label className="text-xs text-gray-400">
                                        Rekomendasi Retensi
                                    </label>

                                    <textarea
                                        readOnly
                                        value={getRetentionRecommendation()}
                                        className="w-full bg-gray-50 border rounded-[4px] p-3 text-xs h-24 mt-1"
                                    />

                                </div>

                                <div className="space-y-4 bg-gray-50 p-4 rounded-[4px] border">

                                    <div>

                                        <label className="text-xs text-gray-400">
                                            Promo Name
                                        </label>

                                        <input
                                            type="text"
                                            value={promoName}
                                            onChange={(e) => setPromoName(e.target.value)}
                                            className="w-full border rounded-[4px] p-3 text-xs mt-1"
                                        />

                                    </div>

                                    <div>

                                        <label className="text-xs text-gray-400">
                                            Discount %
                                        </label>

                                        <input
                                            type="number"
                                            value={promoDiscount}
                                            onChange={(e) => setPromoDiscount(e.target.value)}
                                            className="w-full border rounded-[4px] p-3 text-xs mt-1"
                                        />

                                    </div>

                                    <div>

                                        <label className="text-xs text-gray-400">
                                            Expired Date
                                        </label>

                                        <input
                                            type="date"
                                            value={expiredDate}
                                            onChange={(e) => setExpiredDate(e.target.value)}
                                            className="w-full border rounded-[4px] p-3 text-xs mt-1"
                                        />

                                    </div>

                                </div>

                            </div>

                            <div className="p-6 bg-gray-50 border-t flex gap-3">

                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="flex-1 py-3 border border-[#D82F5A] text-[#D82F5A] rounded-[4px]"
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={handleGenerateEmail}
                                    className="flex-1 py-3 bg-black text-white rounded-[4px]"
                                >
                                    Generate
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>
    );
}