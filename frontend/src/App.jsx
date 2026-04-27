import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestAPI from "./TestAPI.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test" element={<TestAPI />} />
      </Routes>
    </BrowserRouter>
  );
}