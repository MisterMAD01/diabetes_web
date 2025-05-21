// src/pages/admin/AdminApproveUsersPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminApproveUsers from '../frontend/src/components/admin/AdminApproveUsers';

function AdminApproveUsersPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchPendingUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/users', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setPendingUsers(response.data.users);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching pending users:', error);
                setError('ไม่สามารถดึงข้อมูลผู้ใช้ที่รออนุมัติได้');
                setLoading(false);
            }
        };

        fetchPendingUsers();
    }, []);

    const handleApproveUser = async (userId) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/admin/approve-user/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setPendingUsers(pendingUsers.filter((user) => user.id !== userId));
            setSuccessMessage('อนุมัติผู้ใช้เรียบร้อยแล้ว');
        } catch (error) {
            console.error('Error approving user:', error);
            setError('ไม่สามารถอนุมัติผู้ใช้ได้');
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/admin/reject-user/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setPendingUsers(pendingUsers.filter((user) => user.id !== userId));
            setSuccessMessage('ปฏิเสธผู้ใช้เรียบร้อยแล้ว');
        } catch (error) {
            console.error('Error rejecting user:', error);
            setError('ไม่สามารถปฏิเสธผู้ใช้ได้');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Pending Users</h1>
            <AdminApproveUsers 
                pendingUsers={pendingUsers}
                handleApprove={handleApproveUser}
                handleReject={handleRejectUser}
                error={error}
                successMessage={successMessage}
            />
        </div>
    );
}

export default AdminApproveUsersPage;
