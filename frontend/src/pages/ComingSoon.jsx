import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Clock } from 'lucide-react';

const ComingSoon = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-[#0f1117] p-6 flex items-center justify-center">
      <Card className="bg-[#1a1d29] border-0 max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-gray-400 text-lg mb-8">{description}</p>
          <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-semibold">
            Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;