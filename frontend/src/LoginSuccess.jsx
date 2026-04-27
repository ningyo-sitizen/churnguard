import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";


export default function LoginSuccess() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);
      console.log("User:", decoded);

      setUser(decoded);
    } else {
      console.log("Token tidak ada");
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login Success</h2>

      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
          <p>Google ID: {user.googleId}</p>

          {user?.userphotos?.length > 0 && (
            <img
              src={user.userphotos[0]?.value}
              alt="profile"
              width={100}
            />
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}