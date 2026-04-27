const jwt = require("jsonwebtoken");

exports.googleCallback = (req, res) => {
  const profile = req.user;

  const user = {
    email: profile.email,
    name: profile.displayName,
    googleId: profile.id
  };

  const token = jwt.sign(user, "SECRET_KEY", {
    expiresIn: "1d"
  });

  res.redirect(`http://localhost:5173/login-success?token=${token}`);
};