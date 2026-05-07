import axios from "axios";
import { useAuth } from "../utils/auth";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CostumerDetail() {

  const [searchParams] = useSearchParams();

  const prediction_id = searchParams.get("prediction_id");
  const CustomerID = searchParams.get("CustomerID");

  useEffect(() => {
    const fetchDataUserDetail = async () => {
        const token = localStorage.getItem('token')
        try{
            const response = await axios.get(`http://localhost:5000`)
        }catch(error){

        }
    }
  }, []);

  return (
    <div>
      
    </div>
  );
}