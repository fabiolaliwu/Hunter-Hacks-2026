import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/landing";
import AI from "./pages/ai/ai";
import Map from "./pages/map/map";
import Profile from "./pages/profile/profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ai" element={<AI />} />
      <Route path="/map" element={<Map />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}