import { Routes, Route } from "react-router-dom";
import TestAPI from "./TestAPI.jsx";
import LoginSuccess from "./LoginSuccess.jsx";
import LoginRegister from "./LoginRegister.jsx";
import AuthCheckUser from "./AuthCheckUser.jsx";
import Prediction from "./prediction.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/test" element={<TestAPI />} />
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/login-register" element={<LoginRegister />} />
      <Route path="/auth-check" element={<AuthCheckUser />} />
      <Route path="/prediction" element={<Prediction />} />
    </Routes>
  );
}