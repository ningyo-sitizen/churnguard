import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login-register");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
      navigate("/login-register");
      return;
    }

    const fetchtest = async () => {
      try {
        await axios.get("http://localhost:5000/test/ping", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login-register");
        } else {
          console.log("error ping:", error.message);
        }
      }
    };

    fetchtest();
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login Success</h2>

      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
          <p>Google ID: {user.googleId}</p>

          <img
            src={user?.avatar || "https://via.placeholder.com/100"}
            alt="profile"
            width={100}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}