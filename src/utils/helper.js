import axios from "axios";
import moment from "moment";
import ProfileImage from "../assets/icon/profile-home-page.svg";

const CLOUD_NAME = "dj2l2eqmi";
const UPLOAD_PRESET = "fans-only-admin";

export const uploadMediaService = async (file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");

    const url =
        isVideo || isAudio
            ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
            : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    return new Promise((resolve, reject) => {
        axios
            .post(url, form, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    resolve(response.data);
                } else {
                    reject("File uploading failed.");
                }
            })
            .catch(() => {
                reject("File uploading failed.");
            });
    });
};

const getCloudinaryResourceType = (url = "") => {
    if (url.includes("/video/")) return "video";
    if (url.includes("/raw/")) return "raw";
    return "image";
};

export const getCloudinaryPublicId = (urlOrPublicId = "") => {
    if (!urlOrPublicId) return "";

    if (!urlOrPublicId.includes("res.cloudinary.com")) {
        return urlOrPublicId;
    }

    const uploadPath = urlOrPublicId.split("/upload/")[1];
    if (!uploadPath) return "";

    const withoutVersion = uploadPath.split("?")[0].replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
};

export const deleteMediaService = async ({
    publicId,
    url,
    resourceType,
    deleteToken,
} = {}) => {
    if (deleteToken) {
        const form = new FormData();
        form.append("token", deleteToken);

        return new Promise((resolve, reject) => {
            axios
                .post(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`,
                    form,
                )
                .then((response) => {
                    if (response.data?.result === "ok") {
                        resolve(response.data);
                    } else {
                        reject(
                            response.data?.error?.message ||
                            "Media deletion failed.",
                        );
                    }
                })
                .catch((err) => {
                    reject(
                        err?.response?.data?.error?.message ||
                        "Media deletion failed.",
                    );
                });
        });
    }

    const resolvedPublicId = publicId || getCloudinaryPublicId(url);
    if (!resolvedPublicId) {
        throw new Error("publicId or url is required to delete media.");
    }

    const resolvedResourceType =
        resourceType || (url ? getCloudinaryResourceType(url) : "image");

    const form = new FormData();
    form.append("public_id", resolvedPublicId);
    form.append("upload_preset", UPLOAD_PRESET);

    const destroyUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resolvedResourceType}/destroy`;

    return new Promise((resolve, reject) => {
        axios
            .post(destroyUrl, form)
            .then((response) => {
                if (response.data?.result === "ok") {
                    resolve(response.data);
                } else {
                    reject(
                        response.data?.error?.message || "Media deletion failed.",
                    );
                }
            })
            .catch((err) => {
                reject(
                    err?.response?.data?.error?.message || "Media deletion failed.",
                );
            });
    });
};

export const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short",
});

export const formatChatTime = (date) => {
    const now = moment();
    const msgDate = moment(date);

    if (now.isSame(msgDate, "day")) {
        return msgDate.format("hh:mm a");
    }

    if (now.subtract(1, "day").isSame(msgDate, "day")) {
        return "Yesterday";
    }

    return msgDate.format("DD/MM/YYYY");
};

export const getShortTimeAgo = (date) => {
    if (!date) return "";

    const seconds = moment().diff(moment(date), "seconds");
    if (seconds < 60) return "now";

    const minutes = moment().diff(moment(date), "minutes");
    if (minutes < 60) return `${minutes}m`;

    const hours = moment().diff(moment(date), "hours");
    if (hours < 24) return `${hours}h`;

    const days = moment().diff(moment(date), "days");
    if (days < 7) return `${days}d`;

    const weeks = moment().diff(moment(date), "weeks");
    if (weeks < 5) return `${weeks}w`;

    const months = moment().diff(moment(date), "months");
    if (months < 12) return `${months}mo`;

    return `${moment().diff(moment(date), "years")}y`;
};

export const modifyConversations = (conversations, user) => {
    return conversations?.map((item) => {
        const sender = item?.participants?.find(
            (participant) => participant._id !== user?._id
        );

        const receiver = item?.participants?.find(
            (participant) => participant._id === user?._id
        );

        return {
            ...item,
            participant: {
                sender: sender,
                receiver: receiver,
            },
        };
    });
};

export const createVideoThumbnail = (file, seekTo = 1, maxWidth = 640, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);

        video.src = url;
        video.muted = true;
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            const targetTime =
                video.duration > 0 ? Math.min(seekTo, video.duration / 2) : 0;
            video.currentTime = targetTime;
        };

        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            const scale = maxWidth / video.videoWidth;
            canvas.width = maxWidth;
            canvas.height = video.videoHeight * scale;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) {
                        const thumbnailFile = new File([blob], `thumb_${file.name}.jpg`, {
                            type: "image/jpeg",
                        });
                        resolve(thumbnailFile);
                    } else {
                        reject(new Error("Thumbnail creation failed"));
                    }
                },
                "image/jpeg",
                quality
            );
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Video load failed"));
        };
    });
};

export const formatMessageTime = (date) => {
    const now = moment();
    const msgDate = moment(date);

    if (now.isSame(msgDate, "day")) {
        return `Today ${msgDate.format("hh:mm a")}`;
    }

    return msgDate.format("DD/MM/YYYY hh:mm a");
};

export const downloadFile = async (file) => {
    if (!file?.url) {
        throw new Error(
            "File download URL not available. Please try again or contact administrator."
        );
    }

    try {
        const response = await fetch(file?.url, { mode: "cors" });
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = file?.name || file?.originalName || "download";
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw new Error(
            error?.message ||
            "Download failed. Please try again or contact administrator."
        );
    }
};

export const isAudio = (file) => {
    return file && file.type.startsWith("audio/");
};

export const getInitialName = (user = { firstName: "", lastName: "" }) => {
    const { firstName, lastName } = user;
    return [firstName, lastName].filter(Boolean).join(" ").slice(0, 2).toUpperCase();
};

export const getDisplayName = (user = { firstName: "", lastName: "" }) => {
    const { firstName, lastName } = user;
    return [firstName, lastName].filter(Boolean).join(" ");
};

export const getUserHandle = (user = { username: "@user" }) => {
    const { username } = user;
    return username
        ? `@${username}`
        : "@user";
};

export const getUserProfileImage = (user = { image: null }) => {
    const { image } = user;
    return image
        ? image
        : null;
};

export const getUserCoverImage = (user = { coverImage: null }) => {
    const { coverImage } = user;
    return coverImage
        ? coverImage
        : null;
};


export const getProfileCompletion = (user) => {
    const emptyResult = {
        percentage: 0,
        isComplete: false,
        completed: 0,
        total: 0,
        missing: [],
    };

    if (!user) return emptyResult;

    const hasValue = (value) =>
        typeof value === "string" ? value.trim().length > 0 : Boolean(value);

    const checks = [
        { field: "firstName", label: "First Name", done: hasValue(user.firstName) },
        { field: "lastName", label: "Last Name", done: hasValue(user.lastName) },
        { field: "phoneNumber", label: "Phone Number", done: hasValue(user.phoneNumber) },
        { field: "bio", label: "Bio", done: hasValue(user.bio) },
        { field: "tagLine", label: "Tagline", done: hasValue(user.tagLine) },
        { field: "image", label: "Profile Photo", done: hasValue(user.image) },
        { field: "coverImage", label: "Cover Photo", done: hasValue(user.coverImage) },
        { field: "interests", label: "Interests", done: Array.isArray(user.interests) && user.interests.length > 0 },
    ];

    const completed = checks.filter((item) => item.done).length;
    const total = checks.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;
    const isComplete = percentage === 100;
    const missing = checks
        .filter((item) => !item.done)
        .map(({ field, label }) => ({ field, label }));

    return { percentage, isComplete, completed, total, missing };
};


export const getVideoDuration = (file) =>
    new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };

        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error("Invalid video file"));
        };

        video.src = URL.createObjectURL(file);
    });