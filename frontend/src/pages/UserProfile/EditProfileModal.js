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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
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
  isGoogleUser,
}) {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef();

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [emailError, setEmailError] = useState("");

  // 🟡 แยกชื่อ นามสกุล
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // 🟡 เมื่อเปิด modal โหลดชื่อเข้า first/last name
  useEffect(() => {
    if (formData.name) {
      const parts = formData.name.trim().split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [formData.name]);

  useEffect(() => {
    if (formData.deleteAvatar === "true") {
      setPreviewImage(null);
      return;
    }
    if (formData.avatarFile) {
      const url = URL.createObjectURL(formData.avatarFile);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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

  const handleRemoveAvatar = () => {
    setPreviewImage(null);
    onChange({ target: { name: "deleteAvatar", value: "true" } });
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
      toast.error("เกิดข้อผิดพลาดในการครอปรูปภาพ");
    }
  };

  const handleModalClose = (_, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmailError(validateEmail(value) ? "" : "รูปแบบอีเมลไม่ถูกต้อง");
    }
    onChange(e);
  };

  // 🟡 handle change แยกชื่อ-นามสกุล แล้วรวมใส่ formData.name
  const handleFirstNameChange = (e) => {
    const newFirst = e.target.value;
    setFirstName(newFirst);
    onChange({
      target: { name: "name", value: `${newFirst} ${lastName}`.trim() },
    });
  };

  const handleLastNameChange = (e) => {
    const newLast = e.target.value;
    setLastName(newLast);
    onChange({
      target: { name: "name", value: `${firstName} ${newLast}`.trim() },
    });
  };

  const handleSaveClick = async () => {
    if (emailError) {
      toast.error("กรุณากรอกอีเมลให้ถูกต้องก่อนบันทึก");
      return;
    }
    setLoadingSave(true);
    try {
      await onSave();
      onClose();
    } catch (error) {
      toast.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <>
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

            {/* Avatar */}
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

            {/* 🟡 ชื่อ-นามสกุล */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                name="firstName"
                label="ชื่อ"
                value={firstName}
                onChange={handleFirstNameChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="lastName"
                label="นามสกุล"
                value={lastName}
                onChange={handleLastNameChange}
                fullWidth
                margin="normal"
              />
            </Box>

            <TextField
              name="email"
              label="อีเมล"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              disabled={isGoogleUser}
              error={!!emailError}
              helperText={emailError}
            />
            {isGoogleUser && (
              <Typography
                sx={{
                  mt: 0.5,
                  mb: 2,
                  color: "Black",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <strong>เชื่อมต่อด้วย :</strong>
                <FontAwesomeIcon icon={faGoogle} className="icon-google" />
                Google แก้ไขเมลไม่ได้
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loadingSave}
              >
                ยกเลิก
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveClick}
                disabled={loadingSave}
              >
                {loadingSave ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Cropper Modal */}
      <Modal
        open={showCropperModal}
        onClose={() => setShowCropperModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, className: "backdrop-blur" }}
      >
        <Fade in={showCropperModal}>
          <Box className="modal-box" sx={{ width: 400, height: 400, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ครอปรูปภาพ
            </Typography>
            {imageSrc && (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 300,
                  background: "#333",
                }}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>ซูม</Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(_, value) => setZoom(value)}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setShowCropperModal(false)}
              >
                ยกเลิก
              </Button>
              <Button variant="contained" onClick={handleCropSave}>
                บันทึกรูป
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
