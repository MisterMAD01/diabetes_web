import React, { useState, useEffect } from "react";
import axios from "axios";
import UserForm from "../../components/Admin/UserFormModal";
import UserEditForm from "../../components/Admin/UserEditFormModal";
import UserViewModal from "../../components/Admin/UserViewModal";
import UserTable from "../../components/Admin/UserTable";
import "./ManageAccounts.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API;

function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // จำนวนรายการต่อหน้า

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
      const filtered = response.data.accounts.filter(
        (account) => account.id !== currentUser.id
      );
      setAccounts(filtered);
      setFilteredAccounts(filtered);
      setCurrentPage(1);
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลบัญชีได้!");
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchTerm(keyword);

    const filtered = accounts.filter(
      (account) =>
        `${account.firstName} ${account.lastName}`
          .toLowerCase()
          .includes(keyword) || account.email.toLowerCase().includes(keyword)
    );

    setFilteredAccounts(filtered);
    setCurrentPage(1);
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAccounts = filteredAccounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPaginationRange = () => {
    const total = totalPages;
    const current = currentPage;
    const range = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) range.push(i);
    } else {
      if (current <= 3) {
        range.push(1, 2, 3, "...", total);
      } else if (current >= total - 2) {
        range.push(1, "...", total - 2, total - 1, total);
      } else {
        range.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }

    return range;
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

      const updatedAccounts = [...accounts, newUser];
      setAccounts(updatedAccounts);
      setFilteredAccounts(updatedAccounts);
      setIsAddingUser(false);
      toast.success("เพิ่มผู้ใช้สำเร็จ!");
      setCurrentPage(1);
    } catch (error) {
      const message =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

      toast.error(`${message}`);
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
      const message =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

      toast.error(`${message}`);
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
      <div className="manage-accounts-header">
        <h2 className="manage-accounts-title">จัดการบัญชีผู้ใช้</h2>

        {!editingUser && !isAddingUser && (
          <div className="search-and-add">
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button
              className="add-user-button"
              onClick={() => setIsAddingUser(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              {" เพิ่มผู้ใช้"}
            </button>
          </div>
        )}
      </div>

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
        <>
          <UserTable
            users={currentAccounts}
            handleView={handleView}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleApprove={handleApprove}
            handleRevoke={handleRevoke}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="custom-pagination-controls">
              <button
                className="custom-page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ก่อนหน้า
              </button>

              {getPaginationRange().map((page, idx) =>
                page === "..." ? (
                  <span key={idx} className="custom-dots">
                    ...
                  </span>
                ) : (
                  <button
                    key={idx}
                    className={`custom-page-btn ${
                      currentPage === page ? "custom-active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="custom-page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ถัดไป
              </button>
            </div>
          )}
        </>
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
