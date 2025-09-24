import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import HeroSection from "./pages/HeroSection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import Sensor from "./pages/Sensor";
import Video from "./pages/Video";

import Option from "./pages/Option";

import Page1 from "./pages/page1";
import Page2 from "./pages/page2";

import MainLayout from "./layouts/MainLayout";
import TopBar from "../src/componants/TopBar";
import Menu from "../src/componants/Menu";

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<MainLayout />}>
        <Route path="/main" element={<Main />} />
        <Route path="/sensor" element={<Sensor />} />
        <Route path="/option" element={<Option />} />
        <Route path="/video" element={<Video/>}/>
        </Route>
        <Route path="/1" element={<Page1 />} />
        <Route path="/2" element={<Page2 />} />
      </Routes>
    </Router>
  );
}

export default App;