import { Box, Typography, Avatar, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "../../components/header";

const LiveStreams = () => {
  const navigate = useNavigate();

  const liveStreams = [
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
      avatar: "https://i.pravatar.cc/150?img=11",
      title: "Hunting Terminal",
      username: "Gamer07",
      category: "Fortnite",
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=400&fit=crop",
      avatar: "https://i.pravatar.cc/150?img=5",
      title: "Fashion Vloging Expert",
      username: "sashavlog",
      category: "youtube",
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
      avatar: "https://i.pravatar.cc/150?img=12",
      title: "Travel Vloging",
      username: "Traveler92",
      category: "Traveling",
    },
  ];

  const categories = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop",
      title: "Gaming",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
      title: "Fashion",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=500&fit=crop",
      title: "Travel",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=500&fit=crop",
      title: "Cooking",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Back Button & Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            onClick={() => navigate(-1)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid #5E1321",
              cursor: "pointer",
              color: "#5E1321",
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 600,
              color: "#5E1321",
            }}
          >
            Live on For my fans only
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          {liveStreams.map((stream) => (
            <Box key={stream.id}>
              <Box
                component="img"
                src={stream.thumbnail}
                sx={{
                  width: 387,
                  height: { xs: 223, sm: 220, md: 240 },
                  objectFit: "cover",
                  borderRadius: 14,
                  display: "block",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  mb: 2.5,
                }}
              />
              {/* Stream Info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  src={stream.avatar}
                  sx={{
                    width: 65,
                    height: 65,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#5E1321",
                    }}
                  >
                    {stream.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#FF1572",
                      }}
                    >
                      {stream.username}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "#8E8E8E",
                      fontWeight: 600,
                    }}
                  >
                    {stream.category}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ borderTop: "1px solid #000000", mb: 3 }} />
        <Typography
          sx={{ fontSize: 28, fontWeight: 600, color: "#5E1321", mb: 2 }}
        >
          <Box component="span" sx={{ color: "#FF1572", fontWeight: 700 }}>
            Categories
          </Box>{" "}
          we think you&apos;ll like
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 4,
          }}
        >
          {categories.map((category) => (
            <Box key={category.id}>
              <Box
                component="img"
                src={category.image}
                sx={{
                  width: 285,
                  height: { xs: 354, md: 354 },
                  objectFit: "cover",
                  borderRadius: 8,
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default LiveStreams;
