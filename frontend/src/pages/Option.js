import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Input,
  Button,
  Modal,
  Divider,
} from "@mui/material";
import optionCard from "../image/optionCard.png";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import CloseIcon from "@mui/icons-material/Close";
import { useOutletContext } from "react-router-dom";
import axios from "axios"

export default function Option() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { user, setUser } = useOutletContext();

  const [info, setInfo] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    department: "",
    position: "",
  });

  useEffect(() => {
    const id = user?.id ?? sessionStorage.getItem("user_id") ?? "";
    InfoSet(id);
    
  }, [user?.name, user?.email]);

  const InfoSet = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/users/userInfo/${id}`);
      console.log("res", res);
      setInfo(res?.data);
    } catch (err) {
      console.error("회원정보 불러오기 실패", err);
    }
  }

  const openEdit = () => {
    setEditForm({
      name: info?.name ?? "",
      email: info?.email ?? "",
      phone: info?.phone ?? "",
      company: info?.company ?? "",
      department: info?.department ?? "",
      position: info?.position ?? "",
    });
    setEditModalOpen(true);
  };

  const closeEdit = () => setEditModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // 실제로는 API 호출(put/patch) 후 setInfo
    setInfo({ ...editForm });
    setEditModalOpen(false);
    alert("수정되었습니다.")
  };

  // const LabelInput = ({ label, name, placeholder, }) => (
  //   <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
  //     <Typography sx={{ color: "#fff", fontSize: 14 }}>{label}</Typography>
  //     <Input
  //       name={name}
  //       value={editForm[name]}
  //       onChange={handleChange}
  //       disableUnderline
  //       placeholder={placeholder}
  //       sx={{
  //         mt: "6px",
  //         width: "100%",
  //         bgcolor: "#fff",
  //         height: 40,
  //         borderRadius: "10px",
  //         px: "10px",
  //       }}
  //     />
  //   </Box>
  // );


  return (
    <>
      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={(e, reason) => {
          if (reason === 'backdropClick') return;
          closeEdit();
        }}
        keepMounted
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus>
        <Box
          // onClick={closeEdit}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            bgcolor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Paper
            sx={{
              width: 400,
              bgcolor: "#41515B",
              borderRadius: "15px",
              p: "20px",
              color: "#fff",
              outline: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography sx={{ fontSize: "20px", fontWeight: 700 }}>
                회원정보 수정
              </Typography>
              <CloseIcon
                onClick={closeEdit}
                sx={{ fontSize: 22, cursor: "pointer" }}
              />
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 2 }} />

            <Box sx={{ display: "grid", gap: 1, p: '10px 10px 20px 10px' }}>
              <Typography sx={{ color: "#ffffffff" }}>이름</Typography>
              <Input label="이름" name="name" placeholder="이름"
              disableUnderline
              value={editForm.name ?? ""}
              onChange={handleChange}
                sx={{
                  width: "100%",
                  bgcolor: "#fff",
                  height: 40,
                  borderRadius: "10px",
                  px: "10px",
                }} />
              <Typography sx={{ color: "#ffffffff" }}>이메일</Typography>
              <Input label="이메일" name="email" placeholder="email@domain.com"
              disableUnderline
              value={editForm.email ?? ""}
              onChange={handleChange}
                sx={{
                  width: "100%",
                  bgcolor: "#fff",
                  height: 40,
                  borderRadius: "10px",
                  px: "10px",
                }}
              />
              <Typography sx={{ color: "#ffffffff" }}>연락처</Typography>
              <Input label="연락처" name="phone" placeholder="010-0000-0000"
              disableUnderline
              value={editForm.phone ?? ""}
              onChange={handleChange}
                sx={{
                  width: "100%",
                  bgcolor: "#fff",
                  height: 40,
                  borderRadius: "10px",
                  px: "10px",
                }}
              />
              <Typography sx={{ color: "#ffffffff" }}>회사</Typography>
              <Input label="회사" name="company" placeholder="회사명"
              disableUnderline
               value={editForm.company ?? ""}
               onChange={handleChange}
                sx={{
                  width: "100%",
                  bgcolor: "#fff",
                  height: 40,
                  borderRadius: "10px",
                  px: "10px",
                }} />
              <Typography sx={{ color: "#ffffffff" }}>부서</Typography>
              <Input label="부서" name="department" placeholder="부서명"
              disableUnderline
              value={editForm.department ?? ""}
              onChange={handleChange}
                sx={{
                  width: "100%",
                  bgcolor: "#fff",
                  height: 40,
                  borderRadius: "10px",
                  px: "10px",
                }} />
              <Typography sx={{ color: "#ffffffff" }}>직책</Typography>
              <Input label="직책" name="position" placeholder="직책"
              disableUnderline
              value={editForm.position ?? ""}
              onChange={handleChange}
                sx={{
                  width: "100%",
                  bgcolor: "#fff",
                  height: 40,
                  borderRadius: "10px",
                  px: "10px",
                }}
              />
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  mt: 2,
                  width: '70%',
                  height: 44,
                  bgcolor: "#001929",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "#02253b" },
                }}
              >
                수정
              </Button>
            </Box>
          </Paper>
        </Box>
      </Modal>

      <Box sx={{ display: "flex", flexDirection: 'column', backgroundColor: '#92a5b6ff', minHeight: '100vh', width: "100%" }}>
        {/* Header */}
        <Typography sx={{ fontSize: "24px", fontWeight: 600, p: "20px 0 0 60px", color: '#ffffffff' }}>
          설정
        </Typography>

        {/* Profile Card */}
        <Paper sx={{ bgcolor: "#41515B", m: "20px 50px", borderRadius: "15px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                component="img"
                src={optionCard}
                alt="option"
                sx={{ width: 200, borderRadius: "12px" }}
              />
              <Divider orientation="vertical" sx={{ borderColor: "rgba(255, 255, 255, 0.58)", mr: 2 }} />
              <Box sx={{ color: "#fff", display: "grid", gap: 0.6, }}>
                <Typography>이름: {info?.name ?? "-"}</Typography>
                <Typography>이메일: {info?.email ?? "-"}</Typography>
                <Typography>연락처: {info?.phone ?? "-"}</Typography>
                <Typography>회사: {info?.company ?? "-"}</Typography>
                <Typography>부서: {info?.department ?? "-"}</Typography>
                <Typography>직책: {info?.position ?? "-"}</Typography>
              </Box>
            </Box>

            <EditSquareIcon
              sx={{
                fontSize: 30,
                color: "#fff",
                mr: 1,
                cursor: "pointer",
              }}
              onClick={openEdit}
            />
          </Box>
        </Paper>

        {/* Recent Login */}
        <Paper sx={{ bgcolor: "#41515B", m: "20px 50px", borderRadius: "15px" }}>
          <Typography sx={{ fontWeight: 500, fontSize: "18px", color: "#fff", p: 2 }}>
            최근 로그인
          </Typography>
          <Box sx={{ p: 2, color: "#dbe2e8" }}>
            {/* TODO: 최근 로그인 내역 리스트/테이블 렌더링 */}
            기록 없음
          </Box>
        </Paper>
      </Box>
    </>
  );
}
