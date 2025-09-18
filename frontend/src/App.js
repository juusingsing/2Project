import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import HeroSection from "./pages/HeroSection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/main";
import Sensor from "./pages/Sensor";
import Page1 from "./pages/page1";
import Page2 from "./pages/page2";

import TopBar from "../src/componants/TopBar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route elment={<TopBar/>}>
        <Route path="/main" element={<Main />} />
        <Route path="/sensor" element={<Sensor />} />
        </Route>
        <Route path="/1" element={<Page1 />} />
        <Route path="/2" element={<Page2 />} />
      </Routes>
    </Router>
  );
}

export default App;