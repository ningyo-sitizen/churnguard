const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");


exports.googleCallback = async (req, res) => {
  const mode = req.query.state;

  if (!req.user) {
    return res.status(500).send("User tidak ditemukan dari Google");
  }
  

  const profile = req.user;
  const avatar = profile.photos?.[0]?.value || null;

  let sessionVersion = 1;

  if (mode === "login") {
    const [existing] = await churnguard_con.query(
      "SELECT * FROM users WHERE email = ?",
      [profile.email]
    );

    if (existing.length === 0) {
      console.log("User belum terdaftar")
      return res.send(`
        <script>
          window.opener.postMessage(
            { error: "User belum terdaftar" },
            "http://localhost:5173"
          );
          window.close();
        </script>
      `);
    }

    if(existing.length > 0 && existing[0].google_id === null){
      console.log("akun ini tidak dibuat menggunakan via google login")
      return res.send(`
        <script>
          window.opener.postMessage(
            { error: "akun ini tidak dibuat menggunakan via google login" },
            "http://localhost:5173"
          );
          window.close();
        </script>
      `);
    }

    sessionVersion = existing[0].session_version + 1;
    
    await churnguard_con.query(
      "UPDATE users SET session_version = ? WHERE email = ?",
      [sessionVersion, profile.email]
    );

  } else if (mode === "register") {

    const [existing] = await churnguard_con.query(
      "SELECT * FROM users WHERE email = ?",
      [profile.email]
    );

    if (existing.length > 0) {
      return res.send(`
        <script>
          window.opener.postMessage(
            { error: "User sudah ada, silakan login" },
            "http://localhost:5173"
          );
          window.close();
        </script>
      `);
    }
    
    sessionVersion = 1;

    await churnguard_con.query(
      "INSERT INTO users (email, name, google_id, avatar_url, session_version) VALUES (?, ?, ?, ?, ?)",
      [profile.email, profile.displayName, profile.id, avatar, sessionVersion]
    );
  }
    const [rows] = await churnguard_con.query(
      "SELECT * FROM users WHERE email = ?",
      [profile.email]
    );

  const user = {
    email: profile.email,
    sessionVersion: sessionVersion,
    role: rows[0]?.role
  };

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.send(`
    <script>
      window.opener.postMessage(
        { token: "${token}" },
        "http://localhost:5173"
      );
      window.close();
    </script>
  `);
};