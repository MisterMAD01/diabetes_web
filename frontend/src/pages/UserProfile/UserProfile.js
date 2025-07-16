import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CircularProgress, Box, Button, Typography } from "@mui/material";
import { UserContext } from "../../contexts/UserContext";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { formatDateShortThai } from "../../components/utils";
import "./UserProfile.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API;
const getInitial = (name) =>
  name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : "?";

export default function UserProfile() {
  const { accessToken, setUser } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarFile: null,
    deleteAvatar: "false",
  });
  const [loading, setLoading] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const p = res.data.profile;
        setProfile(p);
        setFormData({
          name: p.name || "",
          email: p.email || "",
          avatarFile: null,
          deleteAvatar: "false",
        });
      } catch (error) {
        console.error(error);
        toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.deleteAvatar === "true") data.append("deleteAvatar", "true");
      if (formData.avatarFile) data.append("avatar", formData.avatarFile);

      if (formData.avatarFile) {
        const previewUrl = URL.createObjectURL(formData.avatarFile);
        setUser((prev) => ({ ...prev, picture: previewUrl }));
        setProfile((prev) => ({ ...prev, picture: previewUrl }));
      } else if (formData.deleteAvatar === "true") {
        setUser((prev) => ({ ...prev, picture: null }));
        setProfile((prev) => ({ ...prev, picture: null }));
      }

      await axios.patch(`${API_URL}/api/user/me`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const res = await axios.get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const updated = res.data.profile;
      const fullUrl = updated.picture
        ? updated.picture.startsWith("http")
          ? updated.picture
          : `${API_URL}/api/user/uploads/${updated.picture}`
        : null;

      setUser((prev) => ({ ...prev, ...updated, picture: fullUrl }));
      setProfile((prev) => ({ ...prev, ...updated, picture: fullUrl }));

      toast.success("อัปเดตข้อมูลสำเร็จ!");
      setOpenProfileModal(false);
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถอัปเดตข้อมูลได้!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress color="primary" />
      </Box>
    );

  if (!profile)
    return (
      <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
        ไม่พบข้อมูลโปรไฟล์
      </Typography>
    );

  const avatarSrc = profile.picture
    ? profile.picture.startsWith("http")
      ? profile.picture
      : `${API_URL}/api/user/uploads/${profile.picture}`
    : null;

  return (
    <Box className="page-container">
      <Typography variant="h4" className="page-title" gutterBottom>
        โปรไฟล์ของฉัน
      </Typography>

      <Box className="content-box">
        <Box sx={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          <Box
            sx={{
              flexBasis: "180px",
              textAlign: "center",
            }}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User Avatar"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #2563eb",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "white",
                  fontSize: 72,
                  fontWeight: "bold",
                  lineHeight: "180px",
                  userSelect: "none",
                }}
              >
                {getInitial(profile.name)}
              </Box>
            )}
            <Typography sx={{ mt: 1 }}>รหัสผู้ใช้ : {profile.id}</Typography>
            <Typography>
              สร้างเมื่อ : {formatDateShortThai(profile.created_at)}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ข้อมูลผู้ใช้
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>ชื่อผู้ใช้ :</strong> {profile.username}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>ชื่อ-นามสกุล :</strong> {profile.name}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>อีเมล :</strong> {profile.email}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>สิทธิ์การใช้งาน :</strong> {profile.role}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpenProfileModal(true)}
            sx={{ minWidth: 140 }}
          >
            แก้ไขข้อมูล
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpenPasswordModal(true)}
            sx={{ minWidth: 140 }}
          >
            เปลี่ยนรหัสผ่าน
          </Button>
        </Box>
      </Box>

      <EditProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        formData={formData}
        onChange={handleInputChange}
        onSave={handleSave}
      />
      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
