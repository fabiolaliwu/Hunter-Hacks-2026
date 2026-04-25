import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/landing";
import AI from "./pages/ai/ai";
import Map from "./pages/map/map";
import Profile from "./pages/profile/profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/AI" element={<AI />} />
        <Route path="/Map" element={<Map />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}