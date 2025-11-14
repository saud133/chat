/**
 * Admin Dashboard Component
 * 
 * Displays analytics and monitoring data for the legal n8n-based chat system.
 * Shows summary statistics and a paginated list of interactions.
 * 
 * Protected route: Only accessible to authenticated users
 * Route: /admin
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminDashboard.css';

const API_BASE = 'http://localhost:4000/api';

const AdminDashboard = () => {
  const { t, isRTL } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // Fetch summary statistics
  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/summary`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch interactions with pagination
  const fetchInteractions = async (pageNum = 1) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/interactions?page=${pageNum}&pageSize=${pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        setInteractions(data.interactions);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  // Load data on mount and when page changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchInteractions(page)]);
      setLoading(false);
    };
    loadData();
  }, [page]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Shorten session ID for display
  const shortenId = (id) => {
    if (!id) return 'N/A';
    return id.substring(0, 8) + '...';
  };

  // Truncate text for table display
  const truncate = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Legal Chat Analytics & Monitoring</p>
      </div>

      {/* Summary Cards */}
      <div className="admin-summary">
        <div className="summary-card">
          <div className="summary-label">Total Users</div>
          <div className="summary-value">{summary?.totalUsers || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Registered Users</div>
          <div className="summary-value">{summary?.totalRegisteredUsers || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Visitors</div>
          <div className="summary-value">{summary?.totalVisitors || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Visits</div>
          <div className="summary-value">{summary?.totalVisits || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Interactions</div>
          <div className="summary-value">{summary?.totalInteractions || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Today's Interactions</div>
          <div className="summary-value">{summary?.interactionsToday || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Last 24 Hours</div>
          <div className="summary-value">{summary?.last24HoursInteractions || 0}</div>
        </div>
      </div>

      {/* Interactions Table */}
      <div className="admin-interactions">
        <h2>Recent Interactions</h2>
        <div className="interactions-table-container">
          <table className="interactions-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Session ID</th>
                <th>User ID</th>
                <th>Source</th>
                <th>Question</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              {interactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No interactions found</td>
                </tr>
              ) : (
                interactions.map((interaction) => (
                  <tr key={interaction.id}>
                    <td>{formatDate(interaction.created_at)}</td>
                    <td className="monospace">{shortenId(interaction.session_id)}</td>
                    <td>{interaction.user_id || 'Guest'}</td>
                    <td>
                      <span className={`source-badge source-${interaction.source_page}`}>
                        {interaction.source_page}
                      </span>
                    </td>
                    <td className="text-cell">{truncate(interaction.question_text, 60)}</td>
                    <td className="text-cell">{truncate(interaction.answer_text, 60)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

