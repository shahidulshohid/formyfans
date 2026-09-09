import { Box } from "@mui/material";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import SendIcon from "@mui/icons-material/Send";
// import MicIcon from "@mui/icons-material/Mic";
import ChatImage from "../../assets/icon/chat-img.svg";
import SmileIcon from "../../assets/icon/emoji-icon.svg";
import GalleryIcon from "../../assets/icon/gallery-icon.svg";
import CustomInput from "../../components/cutomInput";
// import MicIcon from "../../assets/icon/mic-icon.svg"
import MicIcon from "../../assets/icon/mic-icon.svg";
import PinkBackgroundColor from "../../assets/icon/pink-background.svg";
import SendIcon from "../../assets/icon/send-icon.svg";
import whiteBackgroundColor from "../../assets/icon/white-background.svg";
const ChatScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user;
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi, how are you? 😊",
            sender: "other",
            time: "10:30 AM",
        },
        {
            id: 2,
            text: "I'm doing well.. 😎",
            sender: "me",
            time: "10:32 AM",
        },
        {
            id: 3,
            image: ChatImage,
            sender: "other",
            time: "10:33 AM",
        },
        {
            id: 4,
            text: "How is This",
            sender: "other",
            time: "10:35 AM",
        },
    ]);

    const [inputMessage, setInputMessage] = useState("");
    const fileInputRef = useRef(null);

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            const newMessage = {
                id: messages.length + 1,
                text: inputMessage,
                sender: "me",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages([...messages, newMessage]);
            setInputMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newMessage = {
                    id: messages.length + 1,
                    image: event.target.result,
                    sender: "me",
                    time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
                setMessages([...messages, newMessage]);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box
            sx={{
                height: "685px",
                backgroundColor: "background.darkBrown",
                display: "flex",
                flexDirection: "column",
                borderRadius: "50px",
                mt: 2
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
            >
                {messages.map((message) => (
                    <Box
                        key={message.id}
                        sx={{
                            display: "flex",
                            justifyContent:
                                message.sender === "me" ? "flex-end" : "flex-start",
                            animation: "slideIn 0.3s ease",
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: "75%",
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                                mt: 2
                            }}
                        >
                            {message.image ? (
                                <Box
                                    component="img"
                                    src={message.image}
                                    sx={{
                                        maxWidth: "100%",
                                        maxHeight: "200px",
                                        borderRadius: "15px",
                                        objectFit: "cover",
                                        boxShadow:
                                            message.sender === "me"
                                                ? "0 4px 10px rgba(255, 255, 255, 0.2)"
                                                : "0 4px 10px rgba(255, 0, 110, 0.3)",
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        padding: "12px 18px",
                                        borderRadius: "20px",
                                        background:
                                            message.sender === "me"
                                                ? "rgba(255, 255, 255, 1)"
                                                : "rgba(255, 21, 114, 1)",
                                        color: message.sender === "me" ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
                                        backgroundImage: `url(${message.sender === "me" ? whiteBackgroundColor : PinkBackgroundColor
                                            })`,
                                        fontSize: "15px",
                                        fontWeight: 500,
                                        letterSpacing: "0.3px",
                                        boxShadow:
                                            message.sender === "me"
                                                ? "0 4px 10px rgba(0, 0, 0, 0.1)"
                                                : "0 4px 10px rgba(255, 0, 110, 0.3)",
                                        borderBottomLeftRadius:
                                            message.sender === "other" ? "5px" : "20px",
                                        borderBottomRightRadius:
                                            message.sender === "me" ? "5px" : "20px",
                                        wordWrap: "break-word",

                                    }}
                                >
                                    {message.text}
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Input Area */}
            {/* <Box
                sx={{
                    backgroundColor: "rgba(255, 21, 114, 1)",
                    padding: "15px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 -4px 15px rgba(255, 0, 110, 0.3)",
                }}
            >
                <IconButton
                    sx={{
                        color: "white",
                        background: "rgba(255,255,255,0.1)",
                        "&:hover": {
                            background: "rgba(255,255,255,0.2)",
                        },
                    }}
                >
                    <EmojiEmotionsIcon />
                </IconButton>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileUpload}
                />

                <IconButton
                    sx={{
                        color: "white",
                        background: "rgba(255,255,255,0.1)",
                        "&:hover": {
                            background: "rgba(255,255,255,0.2)",
                        },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <AttachFileIcon />
                </IconButton>

                <Box>
                    <CustomInput
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                </Box>

                <IconButton
                    sx={{
                        color: "white",
                        background: "rgba(255,255,255,0.1)",
                        "&:hover": {
                            background: "rgba(255,255,255,0.2)",
                        },
                    }}
                >
                    <MicIcon />
                </IconButton>

                <IconButton
                    onClick={handleSendMessage}
                    sx={{
                        color: "white",
                        background: "rgba(255,255,255,0.2)",
                        "&:hover": {
                            background: "rgba(255,255,255,0.3)",
                            transform: "scale(1.05)",
                        },
                        transition: "all 0.2s",
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Box> */}
            <Box
                sx={{
                    backgroundColor: "background.deepPink",
                    padding: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    mb: 5,
                    px: "30px",
                    borderRadius: "10px"
                }}
            >
                <Box display="flex" alignItems="center" gap="30px" width="100%">
                    <Box>
                        <img src={SmileIcon} />
                    </Box>

                    <Box>
                        <img src={GalleryIcon} />
                    </Box>

                    <Box flex={1}>
                        <CustomInput
                            placeholder="Type your message....."
                            InputEndIcon={<img src={MicIcon} />}
                            onChange={(e) => setInputMessage(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    background: "rgba(94, 19, 33, 1)",
                                    px: "20px",
                                    "& fieldset": {
                                        border: "none",
                                    },
                                    "&.Mui-focused fieldset": {
                                        border: "none",
                                    },
                                    "&:hover fieldset": {
                                        border: "none",
                                    },
                                },

                                "& .MuiInputBase-input": {
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                    color: "white",

                                    "&::placeholder": {
                                        color: "primary.white",
                                        opacity: 1,
                                        fontWeight: 400,
                                        fontSize: "13px",
                                    },
                                },
                            }}
                        />

                    </Box>

                    <Box>
                        <img src={SendIcon}
                            onClick={handleSendMessage}
                        />
                    </Box>
                </Box>
            </Box>

        </Box>
    );
};

export default ChatScreen;