import { useAuth } from "../utils/auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Prediction() {

  const goto = useNavigate();

  const user = useAuth();

  const [avatarSrc, setAvatarSrc] = useState(null);

  const [predictionData, setPredictionData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalData, setTotalData] = useState(0);

  const limit = 10;

  useEffect(() => {

    if (user) {

      setAvatarSrc(
        user.avatar || "https://via.placeholder.com/100"
      );

      fetchPredictionData(page);

    }

  }, [user, page]);

  const fetchPredictionData = async (currentPage = 1) => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found!");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/prediction/prediction-data?page=${currentPage}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.status === "success") {

        setPredictionData(data.data);

        setPage(data.page);

        setTotalPages(data.totalPages);

        setTotalData(data.totalData);

      }

    } catch (error) {

      console.error(
        "Error fetching prediction data:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  if (!user) {

    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">

          <div className="flex items-center gap-4">

            <img
              src={avatarSrc}
              alt="profile"
              className="w-20 h-20 rounded-full border"
              onError={() => {
                setAvatarSrc(
                  "https://via.placeholder.com/100"
                );
              }}
            />

            <div>

              <h1 className="text-3xl font-bold">
                Prediction Dashboard
              </h1>

              <p className="text-gray-600 mt-1">
                Welcome back, {user.name}
              </p>

              <p className="text-gray-500 text-sm">
                {user.email}
              </p>

            </div>

          </div>

        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-md p-6">

          {/* TOP INFO */}
          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                Prediction Table
              </h2>

              <p className="text-gray-500 mt-1">
                Total Data: {totalData}
              </p>

            </div>

            <div className="text-sm text-gray-500">

              Page {page} of {totalPages}

            </div>

          </div>

          {/* LOADING */}
          {
            loading ? (

              <div className="text-center py-10 text-lg">
                Loading data...
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full border border-gray-300">

                  <thead className="bg-gray-100">

                    <tr>

                      <th className="p-3 border">
                        Detail ID
                      </th>

                      <th className="p-3 border">
                        Prediction ID
                      </th>

                      <th className="p-3 border">
                        Customer ID
                      </th>

                      <th className="p-3 border">
                        Account Age
                      </th>

                      <th className="p-3 border">
                        Monthly Charges
                      </th>

                      <th className="p-3 border">
                        Total Charges
                      </th>

                      <th className="p-3 border">
                        Score
                      </th>

                      <th className="p-3 border">
                        Risk
                      </th>

                      <th className="p-3 border">
                        Prediction
                      </th>

                      <th className="p-3 border">
                        Segment
                      </th>

                      <th className="p-3 border">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {
                      predictionData.length > 0 ? (

                        predictionData.map((item, index) => (

                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition"
                          >

                            <td className="p-3 border">
                              {item.detail_id}
                            </td>

                            <td className="p-3 border">
                              {item.prediction_id}
                            </td>

                            <td className="p-3 border">
                              {item.CustomerID}
                            </td>

                            <td className="p-3 border">
                              {item.AccountAge}
                            </td>

                            <td className="p-3 border">
                              ${item.MonthlyCharges}
                            </td>

                            <td className="p-3 border">
                              ${item.TotalCharges}
                            </td>

                            <td className="p-3 border font-semibold">
                              {item.Score}
                            </td>

                            <td className="p-3 border">

                              <span
                                className={`
                                  px-3 py-1 rounded-full text-white text-sm
                                  ${
                                    item.Risk === "High"
                                      ? "bg-red-500"
                                      : item.Risk === "Medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }
                                `}
                              >
                                {item.Risk}
                              </span>

                            </td>

                            <td className="p-3 border">

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

                            <td className="p-3 border">
                              {item.Segment}
                            </td>

                            <td className="p-3 border">

                              <button
                                onClick={() =>
                                  goto(
                                    `/costumerDetail?prediction_id=${item.prediction_id}&CustomerID=${item.CustomerID}`
                                  )
                                }
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                              >
                                Detail
                              </button>

                            </td>

                          </tr>

                        ))

                      ) : (

                        <tr>

                          <td
                            colSpan={11}
                            className="text-center p-6"
                          >
                            No data found
                          </td>

                        </tr>

                      )
                    }

                  </tbody>

                </table>

              </div>

            )
          }

          {/* PAGINATION */}
          <div className="flex justify-center items-center gap-4 mt-6">

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`
                px-5 py-2 rounded-lg text-white font-semibold
                ${
                  page === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-500 hover:bg-gray-600"
                }
              `}
            >
              Previous
            </button>

            <span className="font-semibold">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`
                px-5 py-2 rounded-lg text-white font-semibold
                ${
                  page === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }
              `}
            >
              Next
            </button>

          </div>

        </div>

      </div>

    </div>

  );
}