import { Box, Typography } from "@mui/material";
import WomenImage from "../../assets/icon/live-stream-image.svg";
import YellowTick from "../../assets/icon/yellowTicket.svg";
import CustomButton from "../../components/cutomButon";
const Suggestion = () => {
  const personName = [
    {
      image: WomenImage,
      name: "George Jose",
      followers: "Followed on you",
      time: "3 mins ago",
      remove: "Remove",
      followBack: "Follow Back",
    },
    {
      image: WomenImage,
      name: "George Jose",
      followers: "Followed on you",
      time: "3 mins ago",
      remove: "Remove",
      followBack: "Follow Back",
    },
    {
      image: WomenImage,
      name: "George Jose",
      followers: "Followed on you",
      time: "3 mins ago",
      remove: "Remove",
      followBack: "Follow Back",
    },
    {
      image: WomenImage,
      name: "George Jose",
      followers: "Followed on you",
      time: "3 mins ago",
      remove: "Remove",
      followBack: "Follow Back",
    },
  ];
  return (
    <Box bgcolor={"background.darkBrown"} borderRadius={"15px"} p={1.5}>
      <Box>
        <Typography color="text.white" fontSize={"18px"} fontWeight={600}>
          Suggestions
        </Typography>
      </Box>
      <Box
        bgcolor={"rgba(94, 19, 33, 1)"}
        borderRadius={"30px"}
        mt={1}
        width={"100%"}
      >
        <Box borderRadius={"20px"} mt={0.5}>
          {personName.map((item, index) => (
            <Box
              bgcolor={"background.deepMaroon"}
              borderRadius={"10px"}
              p={1}
              key={index}
              mt={1}
              position={"relative"}
            >
              <Box display={"flex"} gap={"10px"}>
                <Box position={"absolute"} left={"28px"} top={"-2px"}>
                  <img src={YellowTick} />
                </Box>
                <Box>
                  <img
                    src={item.image}
                    style={{
                      width: "30px",
                      height: "40px",
                      borderRadius: "10%",
                      border: "2px solid rgba(254, 107, 123, 1)",
                    }}
                  />
                </Box>
                <Box>
                  <Typography color="text.white" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    gap={"20px"}
                    alignItems={"center"}
                    width={"100%"}
                  >
                    <Box>
                      <Typography fontSize="12px" color="text.halfWhite">
                        {item.followers}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography fontSize={"12px"} color="text.deepPink">
                        {item.time}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  backgroundColor: "background.softPink",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: "100%",
                  mt: "20px",
                  px: "3px",
                  height: "25px",
                }}
              >
                <CustomButton
                  title={item.remove}
                  handleClickBtn={() => {}}
                  sx={{
                    flex: 1,
                    borderRadius: "20px",
                    color: "white",
                    fontWeight: 600,
                    height: "30px",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                />

                <CustomButton
                  title={item.followBack}
                  sx={{
                    flex: 1,
                    borderRadius: "24px",
                    backgroundColor: "background.deepPink",
                    color: "text.darkBrown",
                    fontWeight: 800,
                    fontSize: "9px",
                    boxShadow: "none",
                    py: "2px",
                    px: "20px",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
        <Box mt={1}>
          <CustomButton
            title="Explore More"
            radius={"20px"}
            width={"100%"}
            handleClickBtn
            sx={{ color: "text.white", backgroundColor: "background.deepPink" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Suggestion;
