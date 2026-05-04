import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useAuth = (options = {}) => {
  const {
    redirect = true,     
    requireRole = "user",
    validateServer = false
  } = options;

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      if (redirect) navigate("/signup");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        throw new Error("expired");
      }

      if (requireRole && decoded.role !== requireRole) {
        navigate("/signup");
        return;
      }

      setUser(decoded);

      if (validateServer) {
        axios.get("http://localhost:5000/test/ping", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch((error) => {
          const status = error.response?.status;

          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            navigate("/signup");
          }
        });
      }

    } catch {
      localStorage.removeItem("token");
      if (redirect) navigate("/signup");
    }
  }, [navigate, redirect, requireRole, validateServer]);

  return user;
};