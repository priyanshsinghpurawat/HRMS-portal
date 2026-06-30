import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';
import LeaveStatsCards from './LeaveStatsCards';
import HRLeaveTable from './HRLeaveTable';
import LeaveActionModal from '../../../LeaveActionModal';

const BASE_URL = window.API_BASE_URL;

const LeaveRequest = () => {
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState({
    fetch: true,
    action: false,
  });
  
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust this number as needed

  const getAuthToken = () => {
    return Cookies.get('jobdekho_token') || sessionStorage.getItem('companyToken') || sessionStorage.getItem('employeeToken') || sessionStorage.getItem('accessToken') || null;
  };

  const fetchAllLeaves = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/attendance/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = response.data?.data;
      let leavesArray = [];
      if (Array.isArray(data)) {
        leavesArray = data;
      } else if (data && typeof data === 'object') {
        leavesArray = data.leaves || data.data || [];
      }
      
      setAllLeaves(leavesArray);
      setCurrentPage(1); // Reset to first page on new data fetch
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to load leave requests';
      toast.error(msg);
      setAllLeaves([]);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  const handleLeaveAction = async (leaveId, status, hrComment) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const token = getAuthToken();
      const response = await axios.put(`${BASE_URL}/attendance/leave/${leaveId}`, {
        status,
        hrComment: hrComment || ''
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state directly so it reflects immediately without a reload
      setAllLeaves(prev => prev.map(leave => 
        (leave._id === leaveId || leave.id === leaveId)
          ? { ...leave, status, hrComment: hrComment || leave.hrComment }
          : leave
      ));

      toast.success(response.data?.message || `Leave ${status.toLowerCase()} successfully!`);
      setIsModalOpen(false);
      setSelectedLeave(null);
    } catch (error) {
      console.error('Action error:', error);
      const msg = error.response?.data?.message || error.message || `Failed to ${status.toLowerCase()} leave`;
      toast.error(msg);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const openActionModal = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchAllLeaves();
  }, [fetchAllLeaves]);

  // Pagination Logic
  const indexOfLastLeave = currentPage * itemsPerPage;
  const indexOfFirstLeave = indexOfLastLeave - itemsPerPage;
  const currentLeaves = allLeaves.slice(indexOfFirstLeave, indexOfLastLeave);
  const totalPages = Math.ceil(allLeaves.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff' } }} />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and review employee leave applications</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pass allLeaves to Stats so it counts total data, not just the current page */}
        <LeaveStatsCards leaves={allLeaves} />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <HRLeaveTable
            leaves={currentLeaves}
            onActionClick={openActionModal}
            loading={loading.fetch}
            actionLoading={loading.action}
          />

          {/* Pagination Controls */}
          {allLeaves.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstLeave + 1}</span> to <span className="font-medium">
                      {Math.min(indexOfLastLeave, allLeaves.length)}
                    </span> of <span className="font-medium">{allLeaves.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 transition-colors ${
                          currentPage === index + 1
                            ? 'z-10 bg-orange-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <LeaveActionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedLeave(null); }}
        leave={selectedLeave}
        onAction={handleLeaveAction}
        loading={loading.action}
      />
    </div>
  );
};

export default LeaveRequest;