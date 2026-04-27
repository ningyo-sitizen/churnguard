import { useEffect } from "react";

export default function LoginSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token:", token);
    }
  }, []);

  return <h2>Login Success</h2>;
}