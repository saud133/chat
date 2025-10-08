import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUsageStats, getAllUsers } from '../utils/usageTracker';
import './DashboardPage.css';

const DashboardPage = () => {
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState({
    totalUsage: 0,
    totalUsers: 0,
    registeredUsers: 0,
    guestUsers: 0,
    recentActivity: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getUsageStats();
      if (data) {
        setStats(data);
      } else {
        throw new Error('No data received');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className={`dashboard-page ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="dashboard-container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-page ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="dashboard-container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Chat Usage Dashboard</h1>
          <p>Monitor chat activity and user engagement</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <h3>Total Messages</h3>
              <p className="stat-number">{formatNumber(stats.totalUsage)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-number">{formatNumber(stats.totalUsers)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Registered Users</h3>
              <p className="stat-number">{formatNumber(stats.registeredUsers)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h3>Guest Users</h3>
              <p className="stat-number">{formatNumber(stats.guestUsers)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🕐</div>
            <div className="stat-content">
              <h3>Recent Activity</h3>
              <p className="stat-number">{formatNumber(stats.recentActivity)}</p>
              <p className="stat-subtitle">Last 24 hours</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-section">
          <h2>User Activity</h2>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>User ID</th>
                  <th>Type</th>
                  <th>Messages</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      <div className="user-info">
                        <span className="username">{user.username}</span>
                        {user.email && <span className="email">{user.email}</span>}
                      </div>
                    </td>
                    <td>
                      <code className="user-id">{user.user_id}</code>
                    </td>
                    <td>
                      <span className={`user-type ${user.is_registered ? 'registered' : 'guest'}`}>
                        {user.is_registered ? 'Registered' : 'Guest'}
                      </span>
                    </td>
                    <td>
                      <span className="usage-count">{formatNumber(user.usage_count)}</span>
                    </td>
                    <td>
                      <span className="last-activity">{formatDate(user.last_used_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="dashboard-actions">
          <button onClick={() => { setLoading(true); fetchStats(); fetchUsers(); }} className="refresh-btn">
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
