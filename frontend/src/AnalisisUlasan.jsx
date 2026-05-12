    import React, { useState, useEffect } from 'react';
    import Sidebar from './SideBar.jsx';
    import {
        BarChart,
        Bar,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
        PieChart,
        Pie,
        Cell
    } from 'recharts';

    import Footer from './footer';
    import Header from './header.jsx';
    import { useAuth } from "../utils/auth";

    const PINK_DARK = "#D82F5A";
    const PINK_MEDIUM = "#E2A7B8";
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

                    <Header
                        formData={user}
                        profileImg={user?.profileImg}
                    />

                    <div className="p-8 flex-1">

                        {/* TITLE */}
                        <div className="mb-8">

                            <h1 className="text-2xl font-semibold text-gray-800">
                                Analisis Statistik Pelanggan
                            </h1>

                            <p className="text-sm text-gray-400 mt-1">
                                Visualisasi data churn customer dan insight bisnis
                            </p>

                        </div>

                        {/* STATS */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

                            <div className="bg-white rounded-[4px] border p-6">

                                <p className="text-xs text-gray-400">
                                    Total Customer
                                </p>

                                <h2 className="text-3xl font-bold mt-2">
                                    {stats.totalCustomer}
                                </h2>

                            </div>

                            <div className="bg-white rounded-[4px] border p-6">

                                <p className="text-xs text-gray-400">
                                    High Risk Customer
                                </p>

                                <h2 className="text-3xl font-bold text-red-500 mt-2">
                                    {stats.highRisk}
                                </h2>

                            </div>

                            <div className="bg-white rounded-[4px] border p-6">

                                <p className="text-xs text-gray-400">
                                    Churn Customer
                                </p>

                                <h2 className="text-3xl font-bold text-yellow-500 mt-2">
                                    {stats.churnCustomer}
                                </h2>

                            </div>

                            <div className="bg-white rounded-[4px] border p-6">

                                <p className="text-xs text-gray-400">
                                    Total Revenue
                                </p>

                                <h2 className="text-3xl font-bold text-green-500 mt-2">
                                    ${stats.totalRevenue}
                                </h2>

                            </div>

                        </div>

                        {/* CHART */}
                        <div className="grid grid-cols-12 gap-6 mb-10">

                            {/* BAR CHART */}
                            <div className="col-span-8 bg-white rounded-[4px] border p-6">

                                <h2 className="text-lg font-semibold mb-1">
                                    Subscription vs Churn
                                </h2>

                                <p className="text-xs text-gray-400 mb-6">
                                    Perbandingan churn berdasarkan subscription
                                </p>

                                <div className="h-72">

                                    <ResponsiveContainer width="100%" height="100%">

                                        <BarChart data={subscriptionData}>

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />

                                            <XAxis dataKey="name" />

                                            <YAxis />

                                            <Tooltip />

                                            <Bar
                                                dataKey="churn"
                                                fill={PINK_DARK}
                                                radius={[4, 4, 0, 0]}
                                            />

                                            <Bar
                                                dataKey="nonChurn"
                                                fill={PINK_MEDIUM}
                                                radius={[4, 4, 0, 0]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>

                            {/* PIE */}
                            <div className="col-span-4 bg-white rounded-[4px] border p-6">

                                <h2 className="text-lg font-semibold mb-1">
                                    Distribusi Risk
                                </h2>

                                <p className="text-xs text-gray-400 mb-6">
                                    Distribusi customer berdasarkan risk
                                </p>

                                <div className="h-72">

                                    <ResponsiveContainer width="100%" height="100%">

                                        <PieChart>

                                            <Pie
                                                data={riskData}
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >

                                                {
                                                    riskData.map((entry, index) => (

                                                        <Cell
                                                            key={index}
                                                            fill={
                                                                COLORS_PIE[
                                                                index % COLORS_PIE.length
                                                                ]
                                                            }
                                                        />

                                                    ))
                                                }

                                            </Pie>

                                            <Tooltip />

                                        </PieChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>

                        </div>

                        <div className="bg-white rounded-[4px] border p-6 mb-10">

                            <h2 className="text-lg font-semibold mb-6">
                                Segment Insight
                            </h2>

                            <div className="grid grid-cols-3 gap-6">

                                {
                                    segmentData.map((item, index) => (

                                        <div
                                            key={index}
                                            className="border rounded-[4px] p-5"
                                        >

                                            <h3 className="font-semibold text-[#D82F5A] mb-2">
                                                {item.segment}
                                            </h3>

                                            <p className="text-sm text-gray-500 mb-4">
                                                Total Customer :
                                                <span className="font-semibold ml-1">
                                                    {item.total}
                                                </span>
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Avg Monthly Charges :
                                                <span className="font-semibold ml-1">
                                                    ${item.avgMonthly}
                                                </span>
                                            </p>

                                            <p className="text-sm text-gray-500 mt-2">
                                                Avg Watch Hours :
                                                <span className="font-semibold ml-1">
                                                    {item.avgView}
                                                </span>
                                            </p>

                                        </div>

                                    ))
                                }

                            </div>

                        </div>

                    </div>

                    <Footer />

                </main>

            </div>

        );

    };

    export default AnalisisUlasan;