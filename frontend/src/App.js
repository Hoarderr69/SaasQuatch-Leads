import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CompanyFinder from "./pages/CompanyFinder";
import Persons from "./pages/Persons";
import EmailGenerator from "./pages/EmailGenerator";
import SequenceBuilder from "./pages/SequenceBuilder";
import ResponseTracker from "./pages/ResponseTracker";
// Removed ComingSoon routes to keep the app focused on implemented features

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="App">
      <BrowserRouter>
        <div className="flex h-screen bg-[#0f1117]">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-y-auto pt-20">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/companies" element={<CompanyFinder />} />
                <Route path="/persons" element={<Persons />} />
                <Route path="/email-generator" element={<EmailGenerator />} />
                <Route path="/sequences" element={<SequenceBuilder />} />
                <Route path="/tracker" element={<ResponseTracker />} />
                {/* Pruned routes removed */}
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
