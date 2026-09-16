import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const CustomTabs = ({ tabs = [], activeTab, setActiveTab }) => {
  return (
    <Box>
      {/* ── Tab bar ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          gap: "4px",
          borderBottom: "0.5px solid",
          borderColor: "divider",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.link;
          return (
            <Box
              key={tab.id}
              component="button"
              onClick={() => setActiveTab(tab)}
              sx={{
                position: "relative",
                background: "none",
                border: "none",
                px: 2.5,
                py: 1.2,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "text.primary" : "text.secondary",
                cursor: "pointer",
                borderRadius: "6px 6px 0 0",
                transition: "color 0.2s, background 0.2s",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: "action.hover",
                },
                // Pink underline on active
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-0.5px",
                  left: 0,
                  right: 0,
                  height: "2px",
                  backgroundColor: isActive
                    ? "background.deepPink"
                    : "transparent",
                  borderRadius: "2px 2px 0 0",
                  transition: "background-color 0.2s",
                },
              }}
            >
              {tab.label}
            </Box>
          );
        })}
      </Box>

      {/* ── Tab content ─────────────────────────────────────── */}
      <Box mt={2}>
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <Typography
                key={tab.id}
                fontSize={14}
                color="text.secondary"
                lineHeight={1.7}
              >
                {tab.content}
              </Typography>
            ),
        )}
      </Box>
    </Box>
  );
};

export default CustomTabs;
