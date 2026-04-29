import { useEffect } from "react";

export default function LoginRegister() {

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");

        if (error === "cancelled") {
            console.log("User cancel login");
            window.close();
        }
        const handleMessage = (event) => {
            if (!event.origin.includes("localhost")) return;

            const { token } = event.data;

            if (token) {
                localStorage.setItem("token", token);
                console.log("Token:", token);

                window.location.href = "/auth-check";
            }

            if (event.data.error) {
                console.log("Error:", event.data.error);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    const openPopup = (url) => {
        const width = 500;
        const height = 600;

        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        window.open(
            url,
            "Google Login",
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    return (
        <div>
            <button onClick={() => openPopup("http://localhost:5000/auth/google/login")}>
                Login with Google
            </button>

            <button onClick={() => openPopup("http://localhost:5000/auth/google/register")}>
                Register with Google
            </button>
        </div>
    );
}