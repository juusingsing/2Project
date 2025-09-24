import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroSection from "./pages/HeroSection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import IdFind from "./pages/IdFind";
import IdFindResult from "./pages/IdFindResult";
import PwResetId from "./pages/PwResetId";
import PwReset from "./pages/PwReset";
import PwResetEmail from "./pages/PwResetEmail";
import Main from "./pages/Main";
import Sensor from "./pages/Sensor";
import Video from "./pages/Video";

import Option from "./pages/Option";

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
        <Route path="/idfind" element={<IdFind/>}/>
        <Route path="/idfindresult" element={<IdFindResult/>}/>
        <Route path="/pwresetid" element={<PwResetId/>}/>
        <Route path="/pwresetemail" element={<PwResetEmail/>}/>
        <Route path="/pwreset" element={<PwReset/>}/>
        <Route element={<MainLayout />}>
        <Route path="/main" element={<Main />} />
        <Route path="/sensor" element={<Sensor />} />
        <Route path="/option" element={<Option />} />
        <Route path="/video" element={<Video/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;