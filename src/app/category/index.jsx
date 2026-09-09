import { Box, Container, Grid, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import ChatIcon from "../../assets/icon/chat.svg";
import SearchIcon from "../../assets/icon/search-brown.svg";
import CustomInput from "../../components/cutomInput";
import Header from "../../components/header";
import { useDebounce } from "../../hooks/useDebounce";
import useCreatorsStore from "../../zustand/creatorsStore";
import useSearchKeyStore from "../../zustand/searchKeyStore";
import CategorySection from "./category";
import { AppInput } from "../../components/input/AppInput";

const Category = () => {
  const { creator_search_value, setCreatorSearchValue } = useSearchKeyStore();
  const debouncedCreatorSearchValue = useDebounce(creator_search_value, 500);
  const {
    pagination,
    isInitialized,
    scrollPosition,
    fetchCreators,
    setScrollPosition,
  } = useCreatorsStore();
  const hasRestoredScroll = useRef(false);

  useEffect(() => {
    if (!isInitialized) {
      fetchCreators({
        page: 1,
        reset: true,
        search: debouncedCreatorSearchValue,
      });
    }
  }, [isInitialized, fetchCreators]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrollPosition]);

  useEffect(() => {
    if (!isInitialized || hasRestoredScroll.current || scrollPosition <= 0) {
      return;
    }

    const restoreScroll = () => {
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
      hasRestoredScroll.current = true;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(restoreScroll);
    });
  }, [isInitialized, scrollPosition]);

  useEffect(() => {
    fetchCreators({
      page: 1,
      reset: true,
      search: debouncedCreatorSearchValue,
    });
  }, [debouncedCreatorSearchValue]);

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <Box
          mt={1}
          bgcolor="background.deepPink"
          px={2}
          py={1}
          borderRadius={{ xs: "10px", sm: "20px", md: "40px" }}
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent={{ xs: "center", md: "space-between" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={{ xs: "10px", md: "20px" }}
        >
          <Typography
            fontSize="28px"
            fontWeight={600}
            color="neutral.darkBrown"
          >
            Creators
          </Typography>

          <AppInput
            variantStyles="creatorSearch"
            placeholder="Search By Name"
            value={creator_search_value}
            onChange={(e) => setCreatorSearchValue(e.target.value)}
            startIcon={<img src={SearchIcon} alt="search" />}
            endIcon={<img src={ChatIcon} alt="chat" width={26} />}
          />
        </Box>

        <Box mt={4}>
          <CategorySection />
        </Box>
      </Container>
    </Box>
  );
};

export default Category;
