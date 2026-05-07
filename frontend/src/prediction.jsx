import axios from "axios";
import { useAuth } from "../utils/auth";
import { useState,useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function Prediction() {

  const user = useAuth();

  const [avatarSrc, setAvatarSrc] = useState(null);

  const [predictionData, setPredictionData] = useState([]);

  useEffect(() => {

    if (user) {

      setAvatarSrc(
        user.avatar || "https://via.placeholder.com/100"
      );

      fetchPredictionData();
    }

  }, [user]);

  const fetchPredictionData = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("⚠️ No token found in localStorage!");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/prediction/prediction-data",
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
      }

    } catch (error) {

      console.error(
        "❌ Error fetching prediction data:",
        error
      );

    }

  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>

      <h2>Login Success</h2>

      <p>Email: {user.email}</p>
      <p>Name: {user.name}</p>

      {user.googleId && (
        <p>Google ID: {user.googleId}</p>
      )}

      <img
        src={avatarSrc}
        alt="profile"
        width={100}
        onError={() => {
          setAvatarSrc(
            "https://via.placeholder.com/100"
          );
        }}
      />

      <div>
        <a href="/prediction">prediction</a>
      </div>

      <hr />

      <h2>Prediction Table</h2>

      <div style={{ overflowX: "auto" }}>

        <table
          border="1"
          cellPadding="10"
          style={{
            borderCollapse: "collapse",
            width: "100%"
          }}
        >

          <thead>

            <tr>
              <th>detail_id</th>
              <th>prediction_id</th>
              <th>AccountAge</th>
              <th>email</th>
              <th>TotalCharges</th>
              <th>Score</th>
              <th>Risk</th>
              <th>Prediction</th>
              <th>Segment</th>
              <th>detail</th>
            </tr>

          </thead>

          <tbody>

            {predictionData.map((item, index) => (

              <tr key={index}>
                <td>{item.detail_id}</td>
                <td>{item.prediction_id}</td>
                <td>{item.AccountAge}</td>
                <td>{item.MonthlyCharges}</td>
                <td>{item.TotalCharges}</td>
                <td>{item.Score}</td>
                <td>{item.Risk}</td>
                <td>{item.Prediction}</td>
                <td>{item.Segment}</td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}