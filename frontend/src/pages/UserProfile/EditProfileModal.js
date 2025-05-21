// src/pages/UserProfile/EditProfileModal.js

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  TextField,
  Button,
  Slider,
} from "@mui/material";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../components/Utils/cropImage";
import { UserContext } from "../../contexts/UserContext";
import "./EditProfileModal.css";

const API_URL = process.env.REACT_APP_API;
const getInitial = (name) =>
  name && name.trim() ? name.trim().charAt(0).toUpperCase() : "?";

export default function EditProfileModal({
  open,
  onClose,
  formData,
  onChange,
  onSave,
}) {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCropperModal, setShowCropperModal] = useState(false);

  // Load preview, now prioritizing deleteAvatar flag
  useEffect(() => {
    // 1) ถ้ามีคำสั่งลบรูป ให้ล้าง preview ทันที
    if (formData.deleteAvatar === "true") {
      setPreviewImage(null);
      return;
    }
    // 2) ถ้ามีไฟล์ใหม่ ให้โชว์ preview จากไฟล์
    if (formData.avatarFile) {
      const url = URL.createObjectURL(formData.avatarFile);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
    // 3) ถ้าไม่มีไฟล์ใหม่ ให้ fallback ไปที่ user.picture
    if (user?.picture) {
      setPreviewImage(
        user.picture.startsWith("http")
          ? user.picture
          : `${API_URL}/api/user/uploads/${user.picture}`
      );
    } else {
      setPreviewImage(null);
    }
  }, [formData.deleteAvatar, formData.avatarFile, user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropperModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  // ลบ preview ใน modal และตั้ง flag deleteAvatar
  const handleRemoveAvatar = () => {
    // เคลียร์ preview
    setPreviewImage(null);
    // ตั้ง flag ให้ลบตอนบันทึก
    onChange({ target: { name: "deleteAvatar", value: "true" } });
    // ล้าง avatarFile ด้วย
    onChange({ target: { name: "avatarFile", files: [] } });
  };

  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleCropSave = async () => {
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, 180);
      const file = new File([blob], "avatar.jpg", { type: blob.type });
      onChange({ target: { name: "avatarFile", files: [file] } });
      setShowCropperModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // ป้องกันปิด modal โดยกด backdrop/esc
  const handleModalClose = (_, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };

  return (
    <>
      {/* Main Edit Modal */}
      <Modal
        open={open}
        onClose={handleModalClose}
        disableEscapeKeyDown
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, className: "backdrop-blur" }}
      >
        <Fade in={open}>
          <Box className="modal-box">
            <Typography variant="h6" gutterBottom>
              แก้ไขข้อมูลผู้ใช้
            </Typography>

            <Box className="avatar-preview" sx={{ position: "relative" }}>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={handleAvatarClick}
                />
              ) : (
                <div
                  className="user-avatar-placeholder"
                  style={{ width: 100, height: 100, cursor: "pointer" }}
                  onClick={handleAvatarClick}
                >
                  {getInitial(user?.name || user?.username)}
                </div>
              )}

              {previewImage && (
                <Button
                  size="small"
                  onClick={handleRemoveAvatar}
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    minWidth: 0,
                    padding: "4px 8px",
                  }}
                  color="error"
                >
                  ลบรูป
                </Button>
              )}

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, cursor: "pointer" }}
                onClick={handleAvatarClick}
              >
                คลิกเพื่อเปลี่ยนรูปภาพ
              </Typography>

              <input
                ref={fileInputRef}
                name="avatarFile"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Box>

            <TextField
              name="name"
              label="ชื่อ"
              value={formData.name}
              onChange={onChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="email"
              label="อีเมล"
              value={formData.email}
              onChange={onChange}
              fullWidth
              margin="normal"
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
              <Button variant="outlined" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button variant="contained" onClick={onSave}>
                บันทึกข้อมูล
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Cropper Modal */}
      <Modal
        open={showCropperModal}
        onClose={() => setShowCropperModal(false)}
        disableEscapeKeyDown
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, className: "backdrop-blur" }}
      >
        <Fade in={showCropperModal}>
          <Box className="modal-box small">
            <Typography variant="h6" gutterBottom>
              ครอปรูปภาพ
            </Typography>
            <Box
              className="cropper-container"
              sx={{ position: "relative", width: "100%", height: 300 }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </Box>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e, z) => setZoom(z)}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button onClick={() => setShowCropperModal(false)}>
                ยกเลิกการครอป
              </Button>
              <Button variant="contained" onClick={handleCropSave}>
                ใช้รูปนี้
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
