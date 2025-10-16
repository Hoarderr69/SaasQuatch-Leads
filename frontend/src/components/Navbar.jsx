import React from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Navbar = ({ onMenuClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-[#1a1d29] border-b border-gray-800 z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            aria-haspopup="dialog"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="logoGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#00d4ff", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#0099cc", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M30 20 L30 80 L40 70 L40 30 L60 50 L60 80 L70 70 L70 20 Z"
                  fill="url(#logoGradient)"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">SaaSquatch</span>
              <span className="text-xl font-bold text-[#00d4ff]">Leads</span>
            </div>
          </Link>
        </div>

        {/* Center Section */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-yellow-400 font-semibold text-sm tracking-wider hover:text-yellow-300 transition-colors"
          >
            HOME
          </Link>
          <Link to="/companies">
            <Button className="bg-[#00d4ff] hover:bg-[#00bcd4] text-white font-semibold px-6 text-sm">
              ENRICH
            </Button>
          </Link>
          <button className="flex items-center gap-1 text-white font-semibold text-sm hover:text-gray-300 transition-colors">
            HELP
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              1
            </span>
          </button>

          <Avatar className="w-10 h-10 border-2 border-gray-600 cursor-pointer hover:border-[#00d4ff] transition-colors">
            <AvatarFallback className="bg-gray-700 text-white font-semibold">
              A
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
