import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search, MapPin, Briefcase, Clock, Loader2, X,
  SlidersHorizontal, History, Keyboard, Sparkles
} from 'lucide-react';

const BASE_URL = window.API_BASE_URL;

// ==========================
// DEBOUNCE HOOK
// ==========================
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// ==========================
// CUSTOM SELECT
// ==========================
const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full h-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full border rounded-2xl px-5 py-4 cursor-pointer flex justify-between items-center transition-all duration-300 bg-white ${
          isOpen ? "border-[#EA590D] ring-2 ring-orange-50 shadow-md" : "border-gray-200 hover:border-orange-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
            {value || placeholder}
          </span>
        </div>
        <svg
          className={`w-5 h-5 transition-all duration-500 ${isOpen ? "rotate-180 text-[#EA590D]" : "text-gray-400"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div
        className={`overflow-y-auto scrollbar-none max-h-48 absolute z-50 top-[110%] left-0 w-full bg-white border border-orange-100 rounded-2xl shadow-2xl py-2 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <div
          onClick={() => { onChange(""); setIsOpen(false); }}
          className="px-5 py-3 cursor-pointer text-gray-500 hover:bg-orange-50 hover:text-[#EA590D] text-sm font-medium"
        >
          Clear Selection
        </div>
        {options.map((opt) => (
          <div
            key={opt}
            onClick={() => { onChange(opt); setIsOpen(false); }}
            className={`px-5 py-3 cursor-pointer transition-all text-sm ${
              value === opt ? "bg-[#EA590D] text-white" : "text-gray-700 hover:bg-orange-50 hover:text-[#EA590D]"
            }`}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};

const SearchSuggestions = ({ suggestions, recentSearches, onSelect, onClearRecent }) => {
  if (suggestions.length === 0 && recentSearches.length === 0) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden z-50">
      {recentSearches.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3" /> Recent Searches
            </h4>
            <button onClick={onClearRecent} className="text-xs text-orange-600 hover:text-orange-700 font-medium">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button key={search} onClick={() => onSelect(search)}
                className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors">
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="p-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Suggestions
          </h4>
          {suggestions.map((suggestion, idx) => (
            <button key={idx} onClick={() => onSelect(suggestion)}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchBar = ({ onJobsFetched, compact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || "");
  const [localExperience, setLocalExperience] = useState(searchParams.get('experienceLevel') || searchParams.get('experience') || "");
  const [localLocation, setLocalLocation] = useState(searchParams.get('location') || "");
  const [localDepartment, setLocalDepartment] = useState(searchParams.get('department') || "");
  const [localEmploymentType, setLocalEmploymentType] = useState(searchParams.get('employmentType') || "");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentJobSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const debouncedSearch = useDebounce(localSearch, 400);

  const experienceOptions = ["Fresher", "Junior", "Mid", "Senior"];
  const locationOptions = ["Jaipur", "Ahmedabad", "Bangalore", "Pune", "Delhi", "Mumbai", "Hyderabad", "Chennai", "Remote"];
  const departmentOptions = ["MERN", "Frontend", "Backend", "Engineering", "Full Stack", "Java", "Python", "DevOps", "Mobile", "Data Science"];
  const employmentTypeOptions = ["Full-time", "Part-time", "Internship", "Contract"];

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) { setSuggestions([]); return; }
    try {
      const { data } = await axios.get(`${BASE_URL}/jobs/suggestions`, { params: { search: query } });
      setSuggestions(data.data || []);
    } catch (error) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      fetchSuggestions(debouncedSearch);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch, fetchSuggestions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') setShowSuggestions(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save to recent searches helper
  const saveToRecent = (term) => {
    if (!term || !term.trim()) return;
    const t = term.trim();
    const updated = [t, ...recentSearches.filter(s => s !== t)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentJobSearches', JSON.stringify(updated));
  };

  // Build params from a given values object (so we can pass overrides)
  const buildParams = (overrides = {}) => {
    const values = {
      search: overrides.search ?? localSearch,
      location: overrides.location ?? localLocation,
      experience: overrides.experience ?? localExperience,
      department: overrides.department ?? localDepartment,
      employmentType: overrides.employmentType ?? localEmploymentType,
    };
    const params = {};
    if (values.search && values.search.trim()) params.search = values.search.trim();
    if (values.location) params.location = values.location;
    if (values.experience) params.experienceLevel = values.experience.toLowerCase();
    if (values.department) params.department = values.department;
    if (values.employmentType) params.employmentType = values.employmentType.toLowerCase().replace(' ', '-');
    return params;
  };

  // ==========================
  // MAIN SEARCH HANDLER -> navigate to AllJobs
  // ==========================
  const handleSearch = (e, overrides = {}) => {
    e?.preventDefault?.();
    setShowSuggestions(false);

    const params = buildParams(overrides);

    // Save search term to recent
    if (params.search) saveToRecent(params.search);

    const queryString = new URLSearchParams(params).toString();

    // Update current URL params (in case we're already on alljobs)
    setSearchParams(params);

    // Navigate to alljobs page WITH search params
    navigate(`/jobportal/alljobs${queryString ? `?${queryString}` : ''}`);
  };

  // Clear all
  const handleClear = () => {
    setLocalSearch("");
    setLocalExperience("");
    setLocalLocation("");
    setLocalDepartment("");
    setLocalEmploymentType("");
    setSearchParams({});
    setShowSuggestions(false);
    navigate('/jobportal/alljobs', { replace: true });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentJobSearches');
  };

  // FIX: pass the chosen value directly into handleSearch via overrides
  const handleSuggestionSelect = (value) => {
    setLocalSearch(value);
    setShowSuggestions(false);
    handleSearch(null, { search: value });
  };

  const hasActiveFilters = localSearch || localExperience || localLocation || localDepartment || localEmploymentType;

  // ==========================
  // COMPACT MODE
  // ==========================
  if (compact) {
    return (
      <section className="px-4 md:px-6 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[32px] shadow-2xl border border-orange-100 p-4 md:p-5">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Title: React, MERN, Designer..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={() => (localSearch.length >= 2 || recentSearches.length > 0) && setShowSuggestions(true)}
                  className="w-full h-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#EA590D] focus:ring-2 focus:ring-orange-50 transition text-gray-800 placeholder-gray-400"
                />
                {localSearch && (
                  <button type="button" onClick={() => setLocalSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showSuggestions && (
                  <SearchSuggestions
                    suggestions={suggestions}
                    recentSearches={recentSearches}
                    onSelect={handleSuggestionSelect}
                    onClearRecent={handleClearRecent}
                  />
                )}
              </div>

              <CustomSelect value={localExperience} onChange={setLocalExperience} options={experienceOptions} placeholder="Experience" icon={Briefcase} />
              <CustomSelect value={localLocation} onChange={setLocalLocation} options={locationOptions} placeholder="Location" icon={MapPin} />

              <button type="submit" disabled={loading}
                className="w-full h-full min-h-[58px] bg-[#EA590D] hover:bg-orange-700 text-white rounded-2xl font-semibold transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Searching...</>) : (<><Search className="w-5 h-5" />Search Jobs</>)}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Keyboard className="w-3 h-3" />
              <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">K</kbd> to search</span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors flex items-center gap-1">
                <SlidersHorizontal className="w-4 h-4" />
                {showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}
              </button>
              {hasActiveFilters && (
                <button type="button" onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
                  <X className="w-4 h-4" /> Clear All
                </button>
              )}
            </div>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <CustomSelect value={localDepartment} onChange={setLocalDepartment} options={departmentOptions} placeholder="Department" icon={Briefcase} />
                <CustomSelect value={localEmploymentType} onChange={setLocalEmploymentType} options={employmentTypeOptions} placeholder="Employment Type" icon={Clock} />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ==========================
  // FULL MODE
  // ==========================
  return (
    <section className="px-4 md:px-6  bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by job title, company, or keywords..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={() => (localSearch.length >= 2 || recentSearches.length > 0) && setShowSuggestions(true)}
                  className="w-full h-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#EA590D] focus:ring-2 focus:ring-orange-50 transition text-gray-800 placeholder-gray-400"
                />
                {localSearch && (
                  <button type="button" onClick={() => setLocalSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showSuggestions && (
                  <SearchSuggestions
                    suggestions={suggestions}
                    recentSearches={recentSearches}
                    onSelect={handleSuggestionSelect}
                    onClearRecent={handleClearRecent}
                  />
                )}
              </div>
              <CustomSelect value={localExperience} onChange={setLocalExperience} options={experienceOptions} placeholder="Experience Level" icon={Briefcase} />
              <CustomSelect value={localLocation} onChange={setLocalLocation} options={locationOptions} placeholder="Location" icon={MapPin} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CustomSelect value={localDepartment} onChange={setLocalDepartment} options={departmentOptions} placeholder="Department" icon={Briefcase} />
              <CustomSelect value={localEmploymentType} onChange={setLocalEmploymentType} options={employmentTypeOptions} placeholder="Employment Type" icon={Clock} />

              <button type="submit" disabled={loading}
                className="h-full min-h-[58px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Searching...</>) : (<><Search className="w-5 h-5" />Search Jobs</>)}
              </button>

              {hasActiveFilters && (
                <button type="button" onClick={handleClear}
                  className="h-full min-h-[58px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2">
                  <X className="w-5 h-5" /> Clear All
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;