import React, { useState, useEffect } from 'react';
import axios from "axios";
import logochurn from './assets/logo churn.png';
import unggahdata from './assets/unggahdata.png';
import Header from "./Header";
import Sidebar from './SideBar';
import Footer from './Footer';
import { useSearchParams } from "react-router-dom";



import {
    IconBrandMyOppo,
    IconUserCircle,
    IconLogout2
} from '@tabler/icons-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from "../utils/auth";
import { useNotif } from "./NotificationContext";

const DashboarHistory = () => {

    const [disableButton, setDisableButton] = useState(true);
    const [searchParams] = useSearchParams();

    const prediction_id = searchParams.get("prediction_id");

    const navigate = useNavigate();
    const { showNotif } = useNotif();
    const user = useAuth();

    const [isOpen, setIsOpen] = useState(false);



    const [predictionData, setPredictionData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const [showBulkPopup, setShowBulkPopup] = useState(false);
    const [showPredictionPopup, setShowPredictionPopup] = useState(false);

    const [promo_ALL_R_H_S, setpromo_ALL_R_H_S] = useState("")
    const [promo_ALL_R_H_S_value, setpromo_ALL_R_H_S_value] = useState("")
    const [promo_ALL_R_H_S_expired, setpromo_ALL_R_H_S_expired] = useState("")

    const [promo_H_M_R_L_S, setpromo_H_M_R_L_S] = useState("")
    const [promo_H_M_R_L_S_value, setpromo_H_M_R_L_S_value] = useState("")
    const [promo_H_M_R_L_S_expired, setpromo_H_M_R_L_S_expired] = useState("")


    const [promo_M_H_R_M_S, setpromo_M_H_R_M_S] = useState("")
    const [promo_M_H_R_M_S_value, setpromo_M_H_R_M_S_value] = useState("")
    const [promo_M_H_R_M_S_expired, setpromo_M_H_R_M_S_expired] = useState("")

    const [promo_L_R_M_L_S, setpromo_L_R_M_L_S] = useState("")
    const [promo_L_R_M_L_S_value, setpromo_L_R_M_L_S_value] = useState("")
    const [promo_L_R_M_L_S_expired, setpromo_L_R_M_L_S_expired] = useState("")

    const limit = 10;

    useEffect(() => {

        if (user) {
            fetchPredictionData(page);
        }

    }, [user, page]);

    const fetchPredictionData = async (currentPage = 1) => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/prediction/prediction-history?page=${currentPage}&limit=${limit}&prediction_id=${prediction_id}`,
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

                setPredictionData(data.data || []);
                setPage(data.page || 1);
                setTotalPages(data.totalPages || 1);
                setTotalData(data.totalData || 0);

            } else {

                setPredictionData([]);

            }

        } catch (err) {

            console.log(err);
            setPredictionData([]);

        } finally {

            setLoading(false);

        }

    };
    const handleBulkEmail = async () => {
        console.log("1")
        try {
            const token = localStorage.getItem("token")
            console.log(promo_ALL_R_H_S)
            const response = await axios.post(
                "http://localhost:5000/email/bulk-send",
                {
                    promo_ALL_R_H_S: promo_ALL_R_H_S,
                    promo_ALL_R_H_S_value: promo_ALL_R_H_S_value,
                    promo_ALL_R_H_S_expired: promo_ALL_R_H_S_expired,

                    promo_H_M_R_L_S: promo_H_M_R_L_S,
                    promo_H_M_R_L_S_value: promo_H_M_R_L_S_value,
                    promo_H_M_R_L_S_expired: promo_H_M_R_L_S_expired,

                    promo_M_H_R_M_S: promo_M_H_R_M_S,
                    promo_M_H_R_M_S_value: promo_M_H_R_M_S_value,
                    promo_M_H_R_M_S_expired: promo_M_H_R_M_S_expired,

                    promo_L_R_M_L_S: promo_L_R_M_L_S,
                    promo_L_R_M_L_S_value: promo_L_R_M_L_S_value,
                    promo_L_R_M_L_S_expired: promo_L_R_M_L_S_expired
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            showNotif('error', response.data.message)
            setShowBulkPopup(false)
        } catch (err) {
            console.log(err)
        }
    }

    const handleNOsave = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/prediction/no-save",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            showNotif("success", response.data.message);

            setShowPredictionPopup(false);

            fetchPredictionData(page);

        } catch (err) {

            console.log(err);

        }

    };

    const handleYESsave = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/prediction/yes-save",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            showNotif("success", response.data.message);

            setShowPredictionPopup(false);

            fetchPredictionData(page);

        } catch (err) {

            console.log(err);

        }

    };

    const highRisk =
        predictionData.filter(item => item.Risk === "High").length;

    const churnCustomer =
        predictionData.filter(item => item.Prediction === 1).length;

    return (

        <div
            className="flex min-h-screen bg-[#F9FAFB] text-[#111827]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >

            {/* SIDEBAR */}
            <Sidebar>

            </Sidebar>

            {/* MAIN */}
            <main className="flex-1 overflow-x-hidden">

                {/* TOPBAR */}
                <Header formData={user} profileImg={user?.avatar} />

                {/* CONTENT */}
                <div className="p-8">

                    {/* HEADER */}
                    <div className="mb-8">

                        <h1 className="text-2xl font-semibold">
                            Dashboard
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Analisis Risiko Kehilangan Pelanggan
                        </p>

                    </div>

                    {/* STAT CARD */}
                    <div className="bg-white rounded-[4px] border p-7 mb-10">

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 rounded bg-[#F6EAEC] flex items-center justify-center">
                                    <i className="ti ti-users text-[#D82F5A]"></i>
                                </div>

                                <div>

                                    <p className="text-xs text-gray-400">
                                        Total Customer
                                    </p>

                                    <h2 className="text-xl font-bold">
                                        {totalData}
                                    </h2>

                                </div>

                            </div>

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center">
                                    <i className="ti ti-alert-triangle text-red-500"></i>
                                </div>

                                <div>

                                    <p className="text-xs text-gray-400">
                                        High Risk
                                    </p>

                                    <h2 className="text-xl font-bold">
                                        {highRisk}
                                    </h2>

                                </div>

                            </div>

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 rounded bg-yellow-50 flex items-center justify-center">
                                    <i className="ti ti-chart-line text-yellow-500"></i>
                                </div>

                                <div>

                                    <p className="text-xs text-gray-400">
                                        Churn Customer
                                    </p>

                                    <h2 className="text-xl font-bold">
                                        {churnCustomer}
                                    </h2>

                                </div>

                            </div>

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 rounded bg-green-50 flex items-center justify-center">
                                    <i className="ti ti-database text-green-500"></i>
                                </div>

                                <div>

                                    <p className="text-xs text-gray-400">
                                        Total Pages
                                    </p>

                                    <h2 className="text-xl font-bold">
                                        {totalPages}
                                    </h2>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-[4px] border overflow-hidden">

                        <div className="p-6 flex justify-between items-center border-b">

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Data Pelanggan & Prediksi Churn
                                </h2>

                                <p className="text-xs text-gray-400 mt-1">
                                    Daftar pelanggan berdasarkan hasil prediksi
                                </p>

                            </div>

                            {
                                predictionData.length > 0 && (

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowBulkPopup(true)}
                                            disabled={disableButton}
                                            className={`
                                            px-5 py-3 rounded-[4px] text-white transition-all
                                            ${disableButton
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-green-500 hover:bg-green-600"
                                                }
    `}
                                        >
                                            Bulk Email
                                        </button>

                                        <button
                                            onClick={() => setShowBulkPopup(true)}
                                            disabled={disableButton}
                                            className={`
                                            px-5 py-3 rounded-[4px] text-white transition-all
                                            ${disableButton
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-green-500 hover:bg-green-600"
                                                }
    `}
                                        >
                                            Bulk Email
                                        </button>

                                    </div>

                                )
                            }

                        </div>

                        <div className="p-6">

                            {
                                loading ? (

                                    <div className="text-center py-20">
                                        Loading...
                                    </div>

                                ) : predictionData.length === 0 ? (

                                    <div className="py-24 flex flex-col items-center">

                                        <img
                                            src={unggahdata}
                                            className="w-40 mb-4"
                                            alt=""
                                        />

                                        <h2 className="text-2xl font-bold mb-2">
                                            Belum Ada Data
                                        </h2>

                                        <p className="text-gray-500 text-sm mb-6">
                                            Upload data pelanggan terlebih dahulu
                                        </p>

                                        <button
                                            onClick={() => navigate('/uploadData')}
                                            className="bg-[#D82F5A] text-white px-8 py-3 rounded-[4px]"
                                        >
                                            Upload Data
                                        </button>

                                    </div>

                                ) : (

                                    <>
                                        <div className="overflow-x-auto">

                                            <table className="w-full">

                                                <thead>

                                                    <tr className="bg-[#D82F5A] text-white">

                                                        <th className="p-4 text-xs">
                                                            Customer ID
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Account Age
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Monthly Charges
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Total Charges
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Score
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Risk
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Prediction
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Segment
                                                        </th>

                                                        <th className="p-4 text-xs">
                                                            Action
                                                        </th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {
                                                        predictionData.map((item, index) => (

                                                            <tr
                                                                key={index}
                                                                className="border-b hover:bg-gray-50"
                                                            >

                                                                <td className="p-4 text-center text-xs">
                                                                    {item.CustomerID}
                                                                </td>

                                                                <td className="p-4 text-center text-xs">
                                                                    {item.AccountAge}
                                                                </td>

                                                                <td className="p-4 text-center text-xs">
                                                                    ${item.MonthlyCharges}
                                                                </td>

                                                                <td className="p-4 text-center text-xs">
                                                                    ${item.TotalCharges}
                                                                </td>

                                                                <td className="p-4 text-center text-xs font-semibold">
                                                                    {item.Score}
                                                                </td>

                                                                <td className="p-4 text-center">

                                                                    <span className={`
                                                                        px-4 py-1 rounded text-white text-xs
                                                                        ${item.Risk === "High"
                                                                            ? "bg-red-500"
                                                                            : item.Risk === "Medium"
                                                                                ? "bg-yellow-500"
                                                                                : "bg-green-500"
                                                                        }
                                                                    `}>
                                                                        {item.Risk}
                                                                    </span>

                                                                </td>

                                                                <td className="p-4 text-center text-xs">

                                                                    {
                                                                        item.Prediction === 1
                                                                            ? (
                                                                                <span className="text-red-500 font-bold">
                                                                                    Churn
                                                                                </span>
                                                                            )
                                                                            : (
                                                                                <span className="text-green-500 font-bold">
                                                                                    Non-Churn
                                                                                </span>
                                                                            )
                                                                    }

                                                                </td>

                                                                <td className="p-4 text-center text-xs">
                                                                    {item.Segment}
                                                                </td>

                                                                <td className="p-4 text-center">

                                                                    <button
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/DashboardDetail?prediction_id=${item.prediction_id}&CustomerID=${item.CustomerID}`
                                                                            )
                                                                        }
                                                                        className="bg-[#D82F5A] hover:bg-[#bb244a] text-white px-4 py-2 rounded-[4px] text-xs"
                                                                    >
                                                                        Detail
                                                                    </button>

                                                                </td>

                                                            </tr>

                                                        ))
                                                    }

                                                </tbody>

                                            </table>

                                        </div>

                                        {/* PAGINATION */}
                                        <div className="flex justify-center items-center gap-4 mt-6">

                                            <button
                                                disabled={page === 1}
                                                onClick={() => setPage(page - 1)}
                                                className="px-5 py-2 rounded bg-gray-300"
                                            >
                                                Prev
                                            </button>

                                            <span>
                                                {page} / {totalPages}
                                            </span>

                                            <button
                                                disabled={page === totalPages}
                                                onClick={() => setPage(page + 1)}
                                                className="px-5 py-2 rounded bg-[#D82F5A] text-white"
                                            >
                                                Next
                                            </button>

                                        </div>

                                    </>
                                )
                            }

                        </div>

                    </div>
                    {
                        showBulkPopup && (

                            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                                <div className="bg-white rounded-2xl p-8 w-[1500px] shadow-2xl">



                                    <div className="mb-8">

                                        <h3 className="text-xl font-bold mb-4">
                                            Retention Strategy
                                        </h3>

                                        <div className="overflow-x-auto">

                                            <table className="w-full border border-gray-300">

                                                <thead className="bg-gray-100">

                                                    <tr>

                                                        <th className="p-3 border">
                                                            Risk
                                                        </th>

                                                        <th className="p-3 border">
                                                            Segment
                                                        </th>

                                                        <th className="p-3 border">
                                                            Promo Strategy
                                                        </th>

                                                        <th className="p-3 border">
                                                            Movie Recommendation
                                                        </th>

                                                        <th className="p-3 border">
                                                            Promo Name
                                                        </th>

                                                        <th className="p-3 border">
                                                            Discount %
                                                        </th>

                                                        <th className="p-3 border">
                                                            ekspired
                                                        </th>
                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    <tr className="hover:bg-gray-50">

                                                        <td className="p-3 border font-semibold text-red-500">
                                                            High, Medium, Low
                                                        </td>

                                                        <td className="p-3 border">
                                                            Basic Frustrated User
                                                        </td>

                                                        <td className="p-3 border">
                                                            30–40% comeback promo
                                                        </td>

                                                        <td className="p-3 border">
                                                            Favorite genre + trending movies
                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="text"
                                                                value={promo_ALL_R_H_S}
                                                                onChange={(e) => { setpromo_ALL_R_H_S(e.target.value) }}
                                                                placeholder="Ex: Comeback Premium"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="number"
                                                                value={promo_ALL_R_H_S_value}
                                                                onChange={(e) => { setpromo_ALL_R_H_S_value(e.target.value) }}
                                                                placeholder="40"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="date"
                                                                value={promo_ALL_R_H_S_expired}
                                                                onChange={(e) => { setpromo_ALL_R_H_S_expired(e.target.value) }}
                                                                placeholder="2 weeks"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                    </tr>

                                                    <tr className="hover:bg-gray-50">

                                                        <td className="p-3 border font-semibold text-orange-500">
                                                            High, Medium
                                                        </td>

                                                        <td className="p-3 border">
                                                            Experienced User
                                                        </td>

                                                        <td className="p-3 border">
                                                            Medium promo
                                                        </td>

                                                        <td className="p-3 border">
                                                            Popular movie recommendations
                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="text"
                                                                value={promo_H_M_R_L_S}
                                                                onChange={(e) => { setpromo_H_M_R_L_S(e.target.value) }}
                                                                placeholder="Ex: Loyalty Reward"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="number"
                                                                value={promo_H_M_R_L_S_value}
                                                                onChange={(e) => { setpromo_H_M_R_L_S_value(e.target.value) }}
                                                                placeholder="20"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="date"
                                                                value={promo_H_M_R_L_S_expired}
                                                                placeholder="20"
                                                                onChange={(e) => { setpromo_H_M_R_L_S_expired(e.target.value) }}
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                    </tr>

                                                    <tr className="hover:bg-gray-50">

                                                        <td className="p-3 border font-semibold text-yellow-500">
                                                            Medium, High
                                                        </td>

                                                        <td className="p-3 border">
                                                            Basic User
                                                        </td>

                                                        <td className="p-3 border">
                                                            Limited promo
                                                        </td>

                                                        <td className="p-3 border">
                                                            Trending genre movies
                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="text"
                                                                value={promo_M_H_R_M_S}
                                                                onChange={(e) => { setpromo_M_H_R_M_S(e.target.value) }}
                                                                placeholder="Ex: Weekend Promo"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="number"
                                                                value={promo_M_H_R_M_S_value}
                                                                onChange={(e) => { setpromo_M_H_R_M_S_value(e.target.value) }}
                                                                placeholder="15"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>
                                                        <td className="p-3 border">

                                                            <input
                                                                type="date"
                                                                value={promo_M_H_R_M_S_expired}
                                                                onChange={(e) => { setpromo_M_H_R_M_S_expired(e.target.value) }}
                                                                placeholder="15"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>


                                                    </tr>

                                                    <tr className="hover:bg-gray-50">

                                                        <td className="p-3 border font-semibold text-green-500">
                                                            Low
                                                        </td>

                                                        <td className="p-3 border">
                                                            Basic User, Experienced User
                                                        </td>

                                                        <td className="p-3 border">
                                                            Low promo
                                                        </td>

                                                        <td className="p-3 border">
                                                            Popular movie recommendations
                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="text"
                                                                value={promo_L_R_M_L_S}
                                                                onChange={(e) => { setpromo_L_R_M_L_S(e.target.value) }}
                                                                placeholder="Ex: Member Special"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="number"
                                                                value={promo_L_R_M_L_S_value}
                                                                onChange={(e) => { setpromo_L_R_M_L_S_value(e.target.value) }}
                                                                placeholder="10"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                        <td className="p-3 border">

                                                            <input
                                                                type="date"
                                                                value={promo_L_R_M_L_S_expired}
                                                                onChange={(e) => { setpromo_L_R_M_L_S_expired(e.target.value) }}
                                                                placeholder="10"
                                                                className="w-full border rounded-lg p-2"
                                                            />

                                                        </td>

                                                    </tr>

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                    {/* ACTION BUTTON */}
                                    <div className="flex justify-end gap-4">

                                        <button
                                            onClick={() => setShowBulkPopup(false)}
                                            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleBulkEmail}
                                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
                                        >
                                            Send Bulk Email
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    }

                    {/* NEW PREDICTION POPUP */}
                    {
                        showPredictionPopup && (

                            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                                <div className="bg-white rounded-2xl p-6 w-[450px] shadow-2xl">

                                    <h2 className="text-2xl font-bold mb-4">
                                        buat prediksi baru
                                    </h2>

                                    <p className="text-gray-700 mb-6">
                                        kamu akan membuat prediksi baru, apakah kamu mau save prediksi sekarang?
                                    </p>

                                    <div className="flex gap-3">

                                        <button
                                            onClick={handleNOsave}
                                            className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold"
                                        >
                                            No
                                        </button>

                                        <button
                                            onClick={handleYESsave}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
                                        >
                                            Yes
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    }

                </div>
                <Footer></Footer>
            </main>
        </div>

    );

};

export default DashboarHistory;