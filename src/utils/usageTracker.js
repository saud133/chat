// Usage tracking utility
// This utility tracks chat usage and sends data to the API

// Dynamic API base URL for both local and production environments
const getApiBaseUrl = () => {
  // In browser environment, use relative URLs for same-origin requests
  if (typeof window !== 'undefined') {
    return '';
  }
  // For server-side rendering or testing
  return process.env.REACT_APP_API_BASE_URL || '';
};

export const trackChatUsage = async (userId, userData = null) => {
  try {
    // Determine if user is registered based on userData
    const isRegistered = !!userData;
    const username = userData?.name || null;
    const email = userData?.email || null;

    const payload = {
      userId,
      username,
      email,
      isRegistered
    };

    const apiBase = getApiBaseUrl();
    const response = await fetch(`${apiBase}/api/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn('Failed to track usage:', response.statusText);
    }

    return response.ok;
  } catch (error) {
    console.warn('Usage tracking error:', error);
    return false;
  }
};

export const getUsageStats = async () => {
  try {
    const apiBase = getApiBaseUrl();
    const response = await fetch(`${apiBase}/api/usage`);
    if (!response.ok) throw new Error('Failed to fetch usage stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const apiBase = getApiBaseUrl();
    const response = await fetch(`${apiBase}/api/usage/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};
