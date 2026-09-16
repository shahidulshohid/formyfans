import axios from "axios";
import moment from "moment";
import ProfileImage from "../assets/icon/profile-home-page.svg";
import { getFullS3Url } from "./s3Helper";
import { getPresignedUrlApi } from "../api/modules/s3Upload";
  
export const uploadMediaService = async (file, folder = "media") => {
  try {
    const res = await getPresignedUrlApi(file.name, file.type, folder);

    const isSuccess = res?.status >= 200 && res?.status < 300;
    if (!isSuccess) {
      const message = res?.data?.message || "Failed to get presigned URL";
      throw new Error(message);
    }

    const { presignedUrl, fileName } = res?.data?.data ?? res?.data;

    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
    });

    return {
      secure_url: fileName,
      public_id: fileName,
      fileName: fileName,
      bytes: file.size,
    };
  } catch (err) {
    const message = err?.response?.data?.message || err.message || "File uploading failed.";
    throw new Error(message);
  }
};

export const deleteMediaService = async () => {
  return { result: "ok" };
};

export const numberFormatter = new Intl.NumberFormat("en-US", {
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

export const formatTime = (date) => {
  const now = moment();
  const msgDate = moment(date);
  const diffInSeconds = now.diff(msgDate, "seconds");
  const diffInMinutes = now.diff(msgDate, "minutes");
  const diffInHours = now.diff(msgDate, "hours");
  const diffInDays = now.diff(msgDate, "days");
  const diffInWeeks = now.diff(msgDate, "weeks");
  const diffInMonths = now.diff(msgDate, "months");
  const diffInYears = now.diff(msgDate, "years");

  if (diffInSeconds < 60) {
    return "now";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  return `${diffInYears}y`;
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
      (participant) => participant._id !== user?._id,
    );

    const receiver = item?.participants?.find(
      (participant) => participant._id === user?._id,
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

export const createVideoThumbnail = (
  file,
  seekTo = 1,
  maxWidth = 640,
  quality = 0.8,
) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.muted = true;
    video.preload = "metadata";
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const targetTime =
        video.duration > 0 ? Math.min(seekTo, video.duration / 2) : 0;
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      // Chhota delay taake frame properly paint ho jaye
      setTimeout(() => {
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
          quality,
        );
      }, 200); // 200ms delay
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
      "File download URL not available. Please try again or contact administrator.",
    );
  }

  try {
    const fullUrl = getFullS3Url(file.url);
    const response = await fetch(fullUrl, { mode: "cors" });
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
        "Download failed. Please try again or contact administrator.",
    );
  }
};

export const isAudio = (file) => {
  return file && file.type.startsWith("audio/");
};

export const getInitialName = (user = { firstName: "", lastName: "" }) => {
  const { firstName, lastName } = user;
  return [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .slice(0, 2)
    .toUpperCase();
};

export const getDisplayName = (user = { firstName: "", lastName: "" }) => {
  const { firstName, lastName } = user;
  return [firstName, lastName].filter(Boolean).join(" ");
};

export const getUserHandle = (user = { username: "@user" }) => {
  const { username } = user;
  return username ? `@${username}` : "@user";
};

export const getUserProfileImage = (user = { image: null }) => {
  const { image } = user;
  return image ? getFullS3Url(image) : null;
};

export const getUserCoverImage = (user = { coverImage: null }) => {
  const { coverImage } = user;
  return coverImage ? getFullS3Url(coverImage) : null;
};

export const getLocationDisplayAddress = (location) => {
  if (!location) return "";
  if (typeof location === "string") return location.trim();

  if (location.country?.trim()) {
    return location.country.trim();
  }

  if (location.address?.trim()) {
    return location.address.trim();
  }

  return [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");
};

export const parseCountryPlaceToLocation = (place) => {
  const components = place?.address_components || [];
  const countryComp = components.find((c) => c.types.includes("country"));
  const country = countryComp?.long_name || place?.name || "";
  const lat = place?.geometry?.location?.lat?.() || 0;
  const lng = place?.geometry?.location?.lng?.() || 0;

  return {
    type: "Point",
    coordinates: [lng, lat],
    city: "",
    state: "",
    country,
    address: country,
  };
};

export const normalizeLocationObject = (location) => {
  if (!location) return null;
  if (typeof location === "string") {
    const country = location.trim();
    return {
      type: "Point",
      coordinates: [0, 0],
      city: "",
      state: "",
      country,
      address: country,
    };
  }

  const country = location.country?.trim() || getLocationDisplayAddress(location);

  return {
    type: location.type || "Point",
    coordinates: location.coordinates || [0, 0],
    city: "",
    state: "",
    country,
    address: country,
  };
};

export const hasValidLocation = (location) =>
  Boolean(normalizeLocationObject(location)?.country);

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
    // {
    //   field: "phoneNumber",
    //   label: "Phone Number",
    //   done: hasValue(user.phoneNumber),
    // },
    { field: "bio", label: "Bio", done: hasValue(user.bio) },
    { field: "tagLine", label: "Tagline", done: hasValue(user.tagLine) },
    { field: "image", label: "Profile Photo", done: hasValue(user.image) },
    {
      field: "coverImage",
      label: "Cover Photo",
      done: hasValue(user.coverImage),
    },
    {
      field: "interests",
      label: "Interests",
      done: Array.isArray(user.interests) && user.interests.length > 0,
    },
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

export const calculateAge = (dobString) => {
  const dob = new Date(dobString);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};
