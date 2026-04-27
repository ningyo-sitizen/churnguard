import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestAPI from "./TestAPI.jsx";
import LoginSuccess from "./LoginSuccess.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test" element={<TestAPI />} />
        <Route path="/login-success" element={<LoginSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}