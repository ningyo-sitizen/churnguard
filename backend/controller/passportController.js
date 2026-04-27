const jwt = require("jsonwebtoken");

exports.googleCallback = (req, res) => {
  console.log("USER:", req.user);

  if (!req.user) {
    return res.status(500).send("User tidak ditemukan dari Google");
  }

  const profile = req.user;

  const user = {
    email: profile.email,
    name: profile.displayName,
    googleId: profile.id,
    userphotos: profile.photos
  };

  const token = require("jsonwebtoken").sign(user, "SECRET_KEY", {
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