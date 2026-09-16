import { Box, Container } from "@mui/material";
import Header from "../../components/header";
import Market from "./market";
import MarketplaceNavBar from "../../components/marketplace/MarketplaceNavBar";
import { useProductList } from "../../hook/productList";
import { useEffect } from "react";

const MarketPlace = () => {
  const { fetchProductList, loading, productList } = useProductList();

  useEffect(() => {
    fetchProductList();
  }, []);

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <MarketplaceNavBar activePath="/market-place" />
        <Box mt={4}>
          <Market data={productList} loading={loading} />
        </Box>
      </Container>
    </Box>
  );
};

export default MarketPlace;
