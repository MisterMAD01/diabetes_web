import React, { useState, useContext } from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";
import "./ChangePasswordModal.css";

const API_URL = process.env.REACT_APP_API;

export default function ChangePasswordModal({ open, onClose }) {
  const { accessToken } = useContext(UserContext);
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/user/change-password`, form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert("เปลี่ยนรหัสผ่านสำเร็จ");
      onClose();
    } catch {
      alert("ไม่สามารถเปลี่ยนรหัสผ่านได้");
    } finally {
      setLoading(false);
    }
  };

  // ป้องกันปิด modal ด้วย backdrop หรือ ESC
  const handleModalClose = (e, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      disableEscapeKeyDown
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500, className: "backdrop-blur" }}
    >
      <Fade in={open}>
        <Box className="modal-box small">
          <Typography variant="h6" gutterBottom>เปลี่ยนรหัสผ่าน</Typography>
          <TextField
            label="รหัสผ่านเดิม"
            name="oldPassword"
            type="password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            label="รหัสผ่านใหม่"
            name="newPassword"
            type="password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            disabled={loading}
          />

          <Box className="modal-actions">
            <Button onClick={onClose} disabled={loading}>ยกเลิก</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
