import { useEffect } from "react";

export default function LoginRegister() {

    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "cancelled") {
        console.log("User cancel login");
        window.close();
    }

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== "http://localhost:5000") return;

            const { token } = event.data;

            if (token) {
                localStorage.setItem("token", token);
                console.log("Token:", token);
                window.location.href = "/login-success";
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    const handleLogin = () => {
        const width = 500;
        const height = 600;

        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        window.open(
            "http://localhost:5000/auth/google/login",
            "Google Login",
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    const handleRegister = () => {
        const width = 500;
        const height = 600;

        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        window.open(
            "http://localhost:5000/auth/google/register",
            "Google Login",
            `width=${width},height=${height},top=${top},left=${left}`
        );
    }

    return (
    <div>
        <button onClick={handleLogin}>
            Login with Google
        </button>
        <button onClick={handleRegister}>
            Register with Google
        </button>
    </div>
    );
}