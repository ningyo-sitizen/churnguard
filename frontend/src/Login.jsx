import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotif } from "./NotificationContext"
import { Link } from "react-router-dom";
import imgpnj from "./assets/logo_pnj.jpg";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

function Login() {
  const { showNotif } = useNotif();
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [failedLogin, setFailedLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      setFailedLogin("*Harap input username dan password");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        setFailedLogin("");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const userk = JSON.parse(localStorage.getItem('user'))
        console.log("LOCALSTORAGE USER:", localStorage.getItem("user"));
        console.log("PARSED:", JSON.parse(localStorage.getItem("user")));
        const user_name = userk.username || userk.name;
        const role = userk.role;
        const user_action = "user malakukan login"
        const action_status = "berhasil"

        //token if login
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const token = localStorage.getItem('token');
        const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const timePart = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const time = `${datePart} ${timePart}`;

        const res = await fetch("http://localhost:8080/api/logger/logging", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ user_name, role, user_action, action_status, time })


        })
        if (rememberMe) {
          localStorage.setItem("remember_name", name);
          localStorage.setItem("remember_password", (password));
        } else {
          localStorage.removeItem("remember_name");
          localStorage.removeItem("remember_password");
        }

        const logger = await res.json();
        console.log(logger);

        showNotif("success", `selamat datang di sistem! ${user_name}`);

        if (data.user.role == "super admin") {
          navigate("/dashboardSA")

        } else {
          navigate("/dashboard");
        }
        fetch("http://localhost:8080/api/summary/sync", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }).catch(err => {
          console.log("SYNC ERROR (diabaikan):", err);
        });
      } else {
        setFailedLogin("*Maaf, Username/Password yang anda masukan salah, silahkan coba lagi!");
      }

    } catch (err) {
      console.error("Error:", err);
      setFailedLogin("*Maaf, Username/Password yang anda masukan salah, silahkan coba lagi!");
    }
  };
  useEffect(() => {
    const savedName = localStorage.getItem("remember_name");
    const savedPw = localStorage.getItem("remember_password");

    if (savedName && savedPw) {
      setName(savedName);
      setPassword(savedPw);
      setRememberMe(true);
    }
  }, []);


  return (
    <main className="bg-white w-full min-h-screen font-jakarta mx-auto bg-gradient-to-b from-white to-[#F6EAEC]">
      <div className="relative flex flex-col lg:flex-row min-h-screen overflow-hidden">

        {/* Kiriiiiiiiii*/}
        <section className="flex-1 flex flex-col justify-center items-center lg:items-start text-center">
          <div className="hidden lg:block absolute inset-0 overflow-visible pointer-events-none">

            <div className="absolute top-1/2 -translate-x-[40%] -translate-y-1/2 w-[72vw] h-[73vw] rounded-full overflow-hidden">
              {/* GAMBAR */}
              <div
                className="absolute inset-0 bg-no-repeat bg-center bg-contain "
                style={{ backgroundImage: `url(${imgpnj})` }}></div>

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-[#172D8C] opacity-25"></div>
            </div>


            <div className="absolute top-1/2 -translate-x-[40%] -translate-y-1/2 w-[75vw] h-[73vw] rounded-full border-4 border-[#EDF1F3]">

            </div>
          </div>

        </section>

        {/* Kanannnnnnnn */}
        <div className="flex-1 flex justify-start lg:justify-start items-center min-h-screen ml-40 z-10">

          <div className="absolute max-w-lg lg:max-w-lg bg-[#F9FAFB] border border-[#EDEDED] rounded-lg p-8 shadow-sm"
          >

            <div className="text-left pt-4">
              <h2 className="text-2xl font-semibold text-black">Daftar Akun</h2>
              <p className="text-base font-normal text-[#9A9A9A] mt-2 mb-8">
                Masukkan detail akun Anda untuk mengakses dashboard!
              </p>
            </div>

            {/* persimpangan login sign up */}

            <div className="flex justify-between text-sm mb-2">
              <span
                onClick={() => setIsSignup(false)}
                className={!isSignup ? "text-black font-medium cursor-pointer" : "text-[#929191] cursor-pointer"}
              >
                Login
              </span>

              <span
                onClick={() => setIsSignup(true)}
                className={isSignup ? "text-black font-medium cursor-pointer" : "text-[#929191] cursor-pointer"}
              >
                Sign Up
              </span>
            </div>

            <div className="relative w-full border-t border-[#EDEDED] mb-4">
              <div
                className={`absolute top-0 w-1/2 border-t-2 border-[#D82F5A] transition-all ${isSignup ? "left-1/2" : "left-0"
                  }`}
              ></div>
            </div>

            {/* Username */}
            <form className="relative text-sm items-centerp-3 w-full mb-6"
              onSubmit={handleLogin}>
              {/* fungsi hanya placeholder */}
              <div className="relative w-full text-sm text-left">
                <p className="font-medium text-lg py-2">Otentikasi langkah ke satu</p>
                <p className="font-extralight text-[#616161]">Mulai langkah pertama Anda untuk menjaga setiap pelanggan tetap setia. Masukkan email kantor untuk mendaftar.</p>
              </div>
              <div className="relative text-left mt-4">
                <p className="text-regular">Email</p>
                <div className="flex text-sm items-center border border-gray-300 rounded-lg p-3 w-full focus-within:ring-2 focus-within:ring-[#023048] mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.25"
                    className="text-gray-400 mr-2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon icon-tabler icons-tabler-outline icon-tabler-mail">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
                    <path d="M3 7l9 6l9 -6" />
                  </svg>

                  <input
                    type="text"
                    placeholder="guess@gmail.com"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    className="outline-none w-full"

                  />
                </div>
              </div>


            </form>

            {/* Password */}
            <div className="flex text-sm items-center border border-gray-300 rounded-lg p-3 w-full focus-within:ring-2 focus-within:ring-[#023048] mb-3">
              <svg xmlns="http://www.w3.org/2000/svg"
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-gray-400 mr-2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
                <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
              </svg>

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="outline-none w-full pr-8"
                />
                {showPassword ? (
                  <IconEyeOff
                    size={18}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  />
                ) : (
                  <IconEye
                    size={18}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>
            </div>


            <button
              type="submit"
              className="bg-[#023048] text-white w-full h-12 rounded-lg hover:bg-[#034d66] transition duration-200 font-semibold"
            >
              LOGIN
            </button>

            <div className={`relative w-full text-left text-[#FF1515] text-xs mt-4  ${failedLogin ? "" : "hidden"}`}>
              {failedLogin}
            </div>
          </div>
        </div>

      </div>
    </main>

  );
}

export default Login;