import { useEffect, useState } from "react";

export default function LoginRegister() {
    const [name, setName] = useState("");
    const [emailREG, setEmailREG] = useState("");
    const [emailLogin, setEmaiLogin] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);

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
                console.log("Google Token:", token);

                window.location.href = "/auth-check";
            }

            if (event.data?.error) {
                console.log("Error:", event.data.error);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);
    const handleOtpGet = async () => {
        try {
            const res = await fetch(
                `http://localhost:5000/auth/register/get-otp?email=${emailREG}`
            );
        } catch (err) {
            console.log("Register failed:", err);
        }
    }

    const handleRegister = async () => {
        try {
            const res = await fetch("http://localhost:5000/auth/register/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailREG }),
            });
            const data = await res.json();

            if (!res.ok) {
                console.log("Register error:", data.message);
                return;
            }
            setShowOtp(true);
            console.log("Email available, show OTP");
            handleOtpGet()
        } catch (err) {
            console.log("Register failed:", err);
        }
    };

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.log("Login error:", data.message);
                return;
            }

        } catch (err) {
            console.log("Login failed:", err);
        }
    };
    const openPopup = (url) => {
        const width = 500;
        const height = 600;

        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        window.open(
            url,
            "Google OAuth",
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    return (
        <div>
            <h2>Auth</h2>

            <input
                placeholder="email"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div>
                <button onClick={handleLogin}>Login</button>
            </div>

            <hr />
            <input
                placeholder="Email"
                value={emailREG}
                onChange={(e) => setEmailREG(e.target.value)}
            />
            <div>
                <button onClick={handleRegister}>Register</button>
            </div>

            <hr />
            {showOtp && (
                <div>
                    <input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button onClick={() => console.log("OTP:", otp)}>
                        Verify OTP
                    </button>
                </div>
            )}
            <hr />


            <div>
                <button onClick={() => openPopup("http://localhost:5000/auth/google/login")}>
                    Login with Google
                </button>

                <button onClick={() => openPopup("http://localhost:5000/auth/google/register")}>
                    Register with Google
                </button>
            </div>
        </div>
    );
}