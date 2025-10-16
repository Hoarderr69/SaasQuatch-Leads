import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { mockCompanies, industries, locations } from '../data/mockData';
import { Building2, MapPin, Users, DollarSign, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyFinder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    industry: '',
    location: '',
  });
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    // Filter mock companies based on search params
    const filtered = mockCompanies.filter((company) => {
      const matchesIndustry = !searchParams.industry || company.industry.toLowerCase().includes(searchParams.industry.toLowerCase());
      const matchesLocation = !searchParams.location || company.location.toLowerCase().includes(searchParams.location.toLowerCase());
      return matchesIndustry && matchesLocation;
    });
    setResults(filtered);
    setHasSearched(true);
  };

  const handleClear = () => {
    setSearchParams({ industry: '', location: '' });
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Company Finder</h1>
            <p className="text-gray-400">Find companies by industry and location</p>
          </div>
          <button
            onClick={() => navigate('/estimate-revenues')}
            className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00bcd4] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Estimate Revenues
          </button>
        </div>

        {/* Search Form */}
        <Card className="bg-[#1a1d29] border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Search Criteria</CardTitle>
            <p className="text-gray-400 text-sm">Enter industry and location to find companies</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Industry */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Industry</label>
                <Input
                  placeholder="Enter industry (e.g. Software, Healthcare)"
                  value={searchParams.industry}
                  onChange={(e) => setSearchParams({ ...searchParams, industry: e.target.value })}
                  className="bg-[#0f1117] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00d4ff]"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Location</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#0f1117] border border-gray-700 px-3 py-2 rounded-lg">
                    <img
                      src="https://flagcdn.com/w40/us.png"
                      alt="USA"
                      className="w-5 h-4 object-cover"
                    />
                    <span className="text-white text-sm">USA</span>
                  </div>
                  <Input
                    placeholder="Enter city or state"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    className="bg-[#0f1117] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#00d4ff] flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Clear
              </Button>
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Find Companies
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Found {results.length} {results.length === 1 ? 'Company' : 'Companies'}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {results.map((company) => (
                <Card key={company.id} className="bg-[#1a1d29] border-0 hover:border-[#00d4ff] border transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              {company.name}
                              {company.verified && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">{company.description}</p>
                          </div>
                          <div className="bg-[#00d4ff] text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {company.confidence}% Confidence
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#00d4ff]" />
                            <div>
                              <p className="text-xs text-gray-400">Industry</p>
                              <p className="text-sm text-white font-medium">{company.industry}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#00d4ff]" />
                            <div>
                              <p className="text-xs text-gray-400">Location</p>
                              <p className="text-sm text-white font-medium">{company.location}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#00d4ff]" />
                            <div>
                              <p className="text-xs text-gray-400">Employees</p>
                              <p className="text-sm text-white font-medium">{company.employeeCount}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#00d4ff]" />
                            <div>
                              <p className="text-xs text-gray-400">Revenue</p>
                              <p className="text-sm text-white font-medium">{company.revenue}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => navigate(`/companies/${company.id}`)}
                            className="bg-[#00d4ff] hover:bg-[#00bcd4] text-white text-sm"
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                          >
                            Add to List
                          </Button>
                          <a
                            href={`https://${company.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00d4ff] hover:text-[#00bcd4] text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.length === 0 && (
              <Card className="bg-[#1a1d29] border-0">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No companies found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyFinder;