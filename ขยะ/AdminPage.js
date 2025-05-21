import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function AdminPage() {
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUnapprovedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/users/unapproved', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnapprovedUsers(res.data);
      } catch (error) {
        console.error('Error fetching unapproved users:', error);
      }
    };

    if (user?.isAdmin) {
      fetchUnapprovedUsers();
    }
  }, [user]);

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/approve-user/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnapprovedUsers(unapprovedUsers.filter(u => u.id !== userId)); // Remove from list
      // Optionally refresh the list
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  if (!user?.isAdmin) {
    return <div>Access Denied. You are not an admin.</div>;
  }

  return (
    <div>
      <h1>Admin Panel - Approve Users</h1>
      {unapprovedUsers.length > 0 ? (
        <ul>
          {unapprovedUsers.map(user => (
            <li key={user.id}>
              {user.username} ({user.email})
              <button onClick={() => handleApproveUser(user.id)}>Approve</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users awaiting approval.</p>
      )}
    </div>
  );
}

export default AdminPage;