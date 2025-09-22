// components/SegmentedToggle.jsx
import React from "react";
import { Box } from "@mui/material";

export default function Toggle({
  value = "auto",
  onChange,
  labels = { auto: "자동", manual: "수동" },
  width = 70,
  height = 20,
}) {
  const isAuto = value === "auto";

  return (
    <Box
      role="tablist"
      aria-label="제어 모드"
      sx={{
        position: "relative",
        width: '101px',
        height: '31px',
        p: "3px",                         
        bgcolor: "#c7c7c7",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "3px",                        
        userSelect: "none",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
      onClick={() => onChange?.(isAuto ? "manual" : "auto")}
    >
      {/* 하얀 슬라이더 */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "3px",                      
          left: "3px",                     
          width: '48px',      
          height: '25px',          
          borderRadius: "10px",
          bgcolor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,.25)",
          transform: isAuto
            ? "translateX(0)"
            : `translateX(46px)`, 
          transition: "transform .22s ease",
          zIndex: 0,
        }}
      />

      {/* 자동 */}
      <Box
        sx={{
          flex: 1,
          textAlign: "center",
          zIndex: 1,
          fontWeight: 700,
          fontSize: 12,
          lineHeight: 1,
          color: isAuto ? "#000" : "rgba(0,0,0,.45)",
        }}
        onClick={(e) => { e.stopPropagation(); onChange?.("auto"); }}
      >
        {labels.auto}
      </Box>

      {/* 수동 */}
      <Box
        sx={{
          flex: 1,
          textAlign: "center",
          zIndex: 1,
          fontWeight: 700,
          fontSize: 12,
          lineHeight: 1,
          color: isAuto ? "rgba(0,0,0,.45)" : "#000",
        }}
        onClick={(e) => { e.stopPropagation(); onChange?.("manual"); }}
      >
        {labels.manual}
      </Box>
    </Box>
  );
}
