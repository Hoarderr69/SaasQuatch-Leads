import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { userStats, industryDistribution } from '../data/mockData';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [viewMode, setViewMode] = useState('Industry');

  const industries = Object.entries(industryDistribution);
  const total = industries.reduce((sum, [, count]) => sum + count, 0);

  // Calculate pie chart segments
  const colors = ['#00d4ff', '#00bcd4', '#0099cc'];
  let currentAngle = -90;
  const segments = industries.map(([name, count], index) => {
    const percentage = (count / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      name,
      count,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: colors[index % colors.length],
    };
    currentAngle += angle;
    return segment;
  });

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      'L',
      x,
      y,
      'Z',
    ].join(' ');
  };

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Hi, suryansh_dubey</h1>
          <Link
            to="/how-to-use"
            className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00bcd4] transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            How to use SaaSquatch
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Leads */}
          <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white bg-teal-700 px-4 py-2 rounded-lg inline-block w-fit">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-bold text-white">{userStats.totalLeads}</p>
            </CardContent>
          </Card>

          {/* Remaining Credits */}
          <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white bg-teal-700 px-4 py-2 rounded-lg inline-block w-fit">
                Remaining Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-bold text-white">{userStats.remainingCredits}</p>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white bg-teal-700 px-4 py-2 rounded-lg inline-block w-fit">
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-bold text-white">{userStats.subscription}</p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold w-full">
                Upgrade
              </Button>
              <p className="text-sm text-gray-400 text-center">{userStats.subscriptionStatus}</p>
            </CardContent>
          </Card>
        </div>

        {/* Industry Distribution */}
        <Card className="bg-[#1a1d29] border-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm">
              Industry Distribution
            </div>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="bg-[#0f1117] text-gray-300 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-[#00d4ff] text-sm"
            >
              <option>Industry</option>
              <option>Location</option>
              <option>Company Size</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <svg width="300" height="300" viewBox="0 0 300 300">
                  {segments.map((segment, index) => (
                    <path
                      key={index}
                      d={describeArc(150, 150, 120, segment.startAngle, segment.endAngle)}
                      fill={segment.color}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-6">Top 5 Industries</h3>
                {industries.map(([name, count], index) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-gray-300 text-sm">{name}</span>
                    </div>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;