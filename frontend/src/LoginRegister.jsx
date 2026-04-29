import { useState } from "react";

export default function LoginRegister() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // 🔥 REGISTER
    const handleRegister = async () => {
        try {
            const res = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.log("Register error:", data.message);
                return;
            }

            localStorage.setItem("token", data.token);
            console.log("Register success:", data);
            window.location.href = "/dashboard";

        } catch (err) {
            console.log("Register failed:", err);
        }
    };

    // 🔥 LOGIN
    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.log("Login error:", data.message);
                return;
            }

            localStorage.setItem("token", data.token);
            console.log("Login success:", data);
            window.location.href = "/dashboard";

        } catch (err) {
            console.log("Login failed:", err);
        }
    };

    return (
        <div>
            <h2>Auth</h2>

            <input
                placeholder="Name (register only)"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div>
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleRegister}>Register</button>
            </div>
        </div>
    );
}