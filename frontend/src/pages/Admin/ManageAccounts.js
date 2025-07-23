import React, { useState, useEffect } from "react";
import axios from "axios";
import UserForm from "../../components/Admin/UserFormModal";
import UserEditForm from "../../components/Admin/UserEditFormModal";
import UserViewModal from "../../components/Admin/UserViewModal";
import UserTable from "../../components/Admin/UserTable";
import "./ManageAccounts.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faArrowLeft,
  faUserCog,
} from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API;

function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
        return;
      }
      const currentUser = JSON.parse(atob(token.split(".")[1]));
      const response = await axios.get(`${API_URL}/api/admin/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredAccounts = response.data.accounts.filter(
        (account) => account.id !== currentUser.id
      );
      setAccounts(filteredAccounts);
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลบัญชีได้!");
    }
  };

  const handleAddUser = async (user) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
        return;
      }
      const response = await axios.post(
        `${API_URL}/api/admin/accounts/add`,
        user,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newUser = response.data.user;

      setAccounts((prev) => [...prev, newUser]);
      setIsAddingUser(false);
      toast.success("เพิ่มผู้ใช้สำเร็จ!");
    } catch (error) {
      toast.error("ไม่สามารถเพิ่มผู้ใช้ได้!");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsAddingUser(false);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/admin/accounts/${updatedUser.id}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAccounts();
      setEditingUser(null);
      toast.success("แก้ไขข้อมูลสำเร็จ!");
    } catch (error) {
      toast.error("ไม่สามารถแก้ไขข้อมูลได้!");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/accounts/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
      toast.success("ลบบัญชีสำเร็จ!");
    } catch (error) {
      toast.error("ไม่สามารถลบบัญชีได้!");
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/admin/accounts/${userId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAccounts();
      toast.success("อนุมัติบัญชีสำเร็จ!");
    } catch (error) {
      toast.error("ไม่สามารถอนุมัติบัญชีได้!");
    }
  };

  const handleRevoke = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/admin/accounts/${userId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAccounts();
      toast.success("ยกเลิกอนุมัติสำเร็จ!");
    } catch (error) {
      toast.error("ไม่สามารถยกเลิกอนุมัติได้!");
    }
  };

  const handleView = (user) => {
    setViewingUser(user);
  };

  return (
    <div className="manage-accounts-container">
      <h2 className="manage-accounts-title">จัดการบัญชีผู้ใช้</h2>

      {!editingUser && !isAddingUser && (
        <button onClick={() => setIsAddingUser(true)}>
          <FontAwesomeIcon icon={faPlus} />
          {" เพิ่มผู้ใช้"}
        </button>
      )}

      {isAddingUser && (
        <UserForm
          handleSave={handleAddUser}
          handleCancel={() => setIsAddingUser(false)}
        />
      )}

      {editingUser && (
        <UserEditForm
          user={editingUser}
          handleSave={handleUpdateUser}
          handleCancel={() => setEditingUser(null)}
        />
      )}

      {!isAddingUser && !editingUser && (
        <UserTable
          users={accounts}
          handleView={handleView}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleApprove={handleApprove}
          handleRevoke={handleRevoke}
        />
      )}

      {viewingUser && (
        <UserViewModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onApprove={handleApprove}
          onRevoke={handleRevoke}
          onEdit={(user) => {
            setViewingUser(null);
            setEditingUser(user);
          }}
        />
      )}
    </div>
  );
}

export default ManageAccounts;
