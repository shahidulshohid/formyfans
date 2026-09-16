import { Box } from "@mui/material";
import CustomTabs from "../../components/customTabs";
import { useState } from "react";
import Posts from "./posts";
import Photos from "./photos";
import Videos from "./videos";
import ExclusiveContent from "./exclusiveContent";
import useUserStore from "../../zustand/userUserStore";
import CustomButton from "../../components/cutomButon";
import { useNavigate, useParams } from "react-router-dom";
import ExlusiveContentPage from "./exclusiveContentPage";

const tabs = [
  {
    id: 1,
    label: "All Post",
    link: "all-posts",
  },
  {
    id: 2,
    label: "Photos",
    link: "photos",
  },
  {
    id: 3,
    label: "Videos",
    link: "videos",
  },
  {
    id: 4,
    label: "Exclusive Content",
    link: "exclusive-content",
  },
];

const UserFeeds = () => {
  const navigate = useNavigate();
  const { tab, username } = useParams();
  const { user } = useUserStore();

  const renderContent = (tab) => {
    switch (tab) {
      case "all-posts":
        return <Posts />;
      case "photos":
        return <Photos />;
      case "videos":
        return <Videos />;
      case "exclusive-content":
        return <ExlusiveContentPage />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box mt={2}>
        <CustomTabs
          tabs={tabs}
          activeTab={tab}
          setActiveTab={(tab) => navigate(`/${username}/${tab.link}`)}
        />
      </Box>
      <Box>{renderContent(tab)}</Box>
    </Box>
  );
};

export default UserFeeds;
