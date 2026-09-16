import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getProfile, updateProfile } from "../../api/modules/profile";
import AccountIcon from "../../assets/icon/account.svg";
import { AppInput } from "../../components/input";
import ProfileCoverImageSection from "../../components/profileCoverImageSection";
import SettingHeader from "../../components/settingHeader";
import {
  getInterestLabel,
  normalizeInterestValue,
  normalizeInterests,
} from "../../constants/interests";
import { updateProfileValidation } from "../../utils/validation";
import {
  getLocationDisplayAddress,
  normalizeLocationObject,
  parseCountryPlaceToLocation,
} from "../../utils/helper";
import useInterestDialogStore from "../../zustand/interestDialogStore";
import useUserStore from "../../zustand/userUserStore";
import CustomButton from "../../components/cutomButon";
import { UpdateUsernameDialog } from "../../components/dialogs";
import { GooglePlacesInput } from "../../components/googlePlaceInput";

const labelStyles = {
  fontSize: { xs: 12, md: 14 },
  fontWeight: 600,
  color: "#5E1321",
  mb: 0.5,
};

const initialInputValues = {
  coverImage: null,
  image: null,
  firstName: "",
  lastName: "",
  email: "",
  // phoneNumber: "",
  tagLine: "",
  bio: "",
  interests: [],
  location: null,
  gender: "prefer_not_to_say",
  dob: "",
};

const normalizeLocation = normalizeLocationObject;

const AccountSection = () => {
  // Open update username dialog ref
  const updateUsernameDialogRef = useRef(null);
  // Get User Data from Zustand
  const { user, setUserData } = useUserStore();
  // Get Interest Dialog from Zustand
  const { openInterestDialog } = useInterestDialogStore();
  // Store Loading State
  const [loading, setLoading] = useState({
    profile: true,
    updateProfile: false,
  });
  // Input Values
  const [inputValues, setInputValues] = useState(initialInputValues);
  // Store Input Errors
  const [inputErrors, setInputErrors] = useState({});
  // Store Profile Details
  const [uploadingImage, setUploadingImage] = useState(false);

  // Function to Get Profile Details
  const handleGetProfile = async () => {
    try {
      const response = await getProfile();
      if (response?.status === 200 || response?.status === 201) {
        const profileUser = response?.data?.user;
        setInputValues({
          coverImage: profileUser?.coverImage || null,
          image: profileUser?.image || null,
          firstName: profileUser?.firstName || "",
          lastName: profileUser?.lastName || "",
          email: profileUser?.email || "",
          tagLine: profileUser?.tagLine || "",
          bio: profileUser?.bio || "",
          interests: normalizeInterests(profileUser?.interests),
          gender: profileUser?.gender || "prefer_not_to_say",
          dob: profileUser?.dateOfBirth
            ? new Date(profileUser.dateOfBirth).toISOString().split("T")[0]
            : "",
          location: normalizeLocation(profileUser?.location),
        });
      }
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setLoading((prev) => ({
        ...prev,
        profile: false,
      }));
    }
  };

  useEffect(() => {
    if (user) {
      handleGetProfile();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    const validate = updateProfileValidation(inputValues, setInputErrors);
    if (validate) return;

    try {
      const payload = {
        image: inputValues?.image,
        coverImage: inputValues?.coverImage,
        firstName: inputValues?.firstName,
        lastName: inputValues?.lastName,
        // phoneNumber: inputValues?.phoneNumber,
        tagLine: inputValues?.tagLine,
        bio: inputValues?.bio,
        interests: inputValues?.interests,
        gender: inputValues?.gender,
        dateOfBirth: inputValues?.dob,
        location: normalizeLocationObject(inputValues?.location),
      };
      setLoading((prev) => ({
        ...prev,
        updateProfile: true,
      }));
      const response = await updateProfile(payload);
      if (response?.status === 200 || response?.status === 201) {
        setUserData({
          ...user,
          ...response?.data?.user,
        });
        toast.success("Profile updated successfully");
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setLoading((prev) => ({
        ...prev,
        updateProfile: false,
      }));
    }
  };

  const handleChangeInputValue = (event) => {
    const { name, value } = event.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
    setInputErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProfileImageChange = (imageUrl) => {
    setInputValues((prev) => ({ ...prev, image: imageUrl }));
    setInputErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleCoverImageChange = (coverImageUrl) => {
    setInputValues((prev) => ({ ...prev, coverImage: coverImageUrl }));
    setInputErrors((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleSaveInterests = async (interests) => {
    const response = await updateProfile({ interests });
    if (response?.status === 200 || response?.status === 201) {
      setInputValues((prev) => ({ ...prev, interests }));
      setUserData({
        ...user,
        ...response?.data?.user,
      });
      toast.success("Interests updated successfully");
      return;
    }
    toast.error(response?.data?.message || "Failed to update interests");
    throw new Error("Failed to update interests");
  };

  const handleOpenInterestDialog = () => {
    const hasInterests = inputValues?.interests?.length > 0;
    openInterestDialog({
      selectedInterests: inputValues?.interests || [],
      title: hasInterests ? "Update Interests" : "Add Interests",
      onSave: handleSaveInterests,
    });
  };

  const handlePlaceSelected = ({ place }) => {
    if (!place) return;
    const locationObj = parseCountryPlaceToLocation(place);
    setInputValues((prev) => ({ ...prev, location: locationObj }));
    setInputErrors((prev) => ({ ...prev, location: "" }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <SettingHeader title="Account Settings" icon={AccountIcon} />

      {loading?.profile ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress sx={{ color: "#FF1572" }} />
        </Box>
      ) : (
        <React.Fragment>
          <Box sx={{ px: { xs: 0.5, md: 1 } }}>
            <ProfileCoverImageSection
              profileImage={inputValues?.image}
              coverImage={inputValues?.coverImage}
              onProfileImageChange={handleProfileImageChange}
              onCoverImageChange={handleCoverImageChange}
              onUploadingChange={setUploadingImage}
              profileError={inputErrors?.image}
              coverError={inputErrors?.coverImage}
            />
          </Box>

          {/* Account Form */}
          <Box sx={{ px: { xs: 0.5, md: 1 } }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppInput
                  id="firstName"
                  variantStyles="darkBrown"
                  inputLabel="First Name"
                  type="text"
                  placeholder="Enter Your Name"
                  fullWidth
                  size="small"
                  name="firstName"
                  value={inputValues?.firstName || ""}
                  onChange={handleChangeInputValue}
                  error={Boolean(inputErrors?.firstName)}
                  helperText={inputErrors?.firstName}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppInput
                  id="lastName"
                  variantStyles="darkBrown"
                  inputLabel="Last Name"
                  type="text"
                  placeholder="Enter Your Last Name"
                  fullWidth
                  size="small"
                  name="lastName"
                  value={inputValues?.lastName || ""}
                  onChange={handleChangeInputValue}
                  error={Boolean(inputErrors?.lastName)}
                  helperText={inputErrors?.lastName}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppInput
                  variantStyles="darkBrown"
                  inputLabel="Email"
                  type="email"
                  placeholder="Enter Your Email"
                  fullWidth
                  size="small"
                  name="email"
                  value={inputValues?.email || ""}
                  readOnly
                />
              </Grid>
              {/* <Grid size={{ xs: 12, md: 6 }}>
                <AppInput
                  variantStyles="darkBrown"
                  inputLabel="Phone Number"
                  type="number"
                  placeholder="Enter Your Phone Number"
                  fullWidth
                  size="small"
                  name="phoneNumber"
                  value={inputValues?.phoneNumber || ""}
                  onChange={handleChangeInputValue}
                  error={Boolean(inputErrors?.phoneNumber)}
                  helperText={inputErrors?.phoneNumber}
                />
              </Grid> */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AppInput
                  variantStyles="darkBrown"
                  inputLabel="Tag Line"
                  type="text"
                  placeholder="Enter Your Tag Line"
                  fullWidth
                  size="small"
                  name="tagLine"
                  value={inputValues?.tagLine || ""}
                  onChange={handleChangeInputValue}
                  error={Boolean(inputErrors?.tagLine)}
                  helperText={inputErrors?.tagLine}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppInput
                  variantStyles="darkBrown"
                  inputLabel="Date of Birth"
                  type="date"
                  placeholder="Enter Your Date of Birth"
                  fullWidth
                  size="small"
                  name="dob"
                  value={inputValues?.dob || ""}
                  onChange={handleChangeInputValue}
                  error={Boolean(inputErrors?.dob)}
                  helperText={inputErrors?.dob}
                  inputProps={{
                    max: new Date().toISOString().split("T")[0],
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyles}>Gender</Typography>
                <FormControl fullWidth error={Boolean(inputErrors?.gender)}>
                  <Select
                    name="gender"
                    value={inputValues?.gender || "prefer_not_to_say"}
                    onChange={handleChangeInputValue}
                    displayEmpty
                    size="small"
                    sx={{
                      bgcolor: "background.darkBrown",
                      color: "text.white",
                      borderRadius: "4px",
                      height: 40,
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      "& .MuiSvgIcon-root": { color: "text.deepPink" },
                    }}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="prefer_not_to_say">
                      Prefer not to say
                    </MenuItem>
                  </Select>
                  {inputErrors?.gender && (
                    <Typography color="error" fontSize={12} mt={0.5}>
                      {inputErrors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyles}>Country</Typography>
                <GooglePlacesInput
                  name="location_input"
                  value={getLocationDisplayAddress(inputValues?.location)}
                  onChange={(e) =>
                    setInputValues((prev) => ({
                      ...prev,
                      location: {
                        type: "Point",
                        coordinates: prev.location?.coordinates || [0, 0],
                        city: "",
                        state: "",
                        country: e.target.value,
                        address: e.target.value,
                      },
                    }))
                  }
                  placeholder="Search country..."
                  onPlaceSelected={handlePlaceSelected}
                  fullWidth
                  backgroundColor="rgba(94, 19, 33, 1)"
                  borderRadius="4px"
                  color="#fff"
                  error={Boolean(inputErrors?.location)}
                  helperText={inputErrors?.location}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppInput
                  variantStyles="darkBrown"
                  inputLabel="Username"
                  type="text"
                  placeholder="Username"
                  fullWidth
                  size="small"
                  value={user?.username || ""}
                  readOnly
                  endIcon={
                    <CustomButton
                      title="Change"
                      width={22}
                      height={30}
                      fontSize={13}
                      sx={{
                        borderRadius: 1,
                      }}
                      onClick={() =>
                        updateUsernameDialogRef.current?.open({
                          username: user?.username,
                        })
                      }
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={labelStyles}>Bio</Typography>
                  <Typography fontSize={12}>
                    {inputValues?.bio?.length || 0}/200
                  </Typography>
                </Stack>
                <AppInput
                  variantStyles="darkBrown"
                  type="text"
                  placeholder="Enter Your Bio"
                  fullWidth
                  size="small"
                  name="bio"
                  value={inputValues?.bio || ""}
                  onChange={handleChangeInputValue}
                  error={Boolean(inputErrors?.bio)}
                  helperText={inputErrors?.bio}
                  multiline
                  rows={4}
                  inputProps={{
                    maxLength: 200,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  mb={1}
                >
                  <Typography sx={{ ...labelStyles, mb: 0 }}>
                    Interests
                  </Typography>
                  <Button
                    onClick={handleOpenInterestDialog}
                    sx={{
                      bgcolor: "#FF1572",
                      color: "#fff",
                      borderRadius: 21,
                      px: 2,
                      py: 0.5,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 12,
                      minWidth: "auto",
                      "&:hover": { bgcolor: "#E0115F" },
                    }}
                  >
                    {inputValues?.interests?.length
                      ? "Update Interests"
                      : "Add Interests"}
                  </Button>
                </Box>

                {inputValues?.interests?.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {inputValues.interests.map((interest) => (
                      <Chip
                        key={normalizeInterestValue(interest)}
                        label={getInterestLabel(interest)}
                        sx={{
                          bgcolor: "#FF1572",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography fontSize={13} color="#8B92A4">
                    No interests selected yet.
                  </Typography>
                )}
                {inputErrors?.interests && (
                  <Typography color="error" fontSize={12} mt={0.5}>
                    {inputErrors.interests}
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: { xs: 4, md: 6 } }}>
              <Button
                sx={{
                  bgcolor: "#FF1572",
                  height: { xs: 32, md: 35 },
                  color: "#fff",
                  borderRadius: 21,
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 2, md: 2.5 },
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: { xs: 12, md: 14 },
                  "&:hover": {
                    bgcolor: "#E0115F",
                  },
                }}
                onClick={handleUpdateProfile}
                disabled={loading?.updateProfile || uploadingImage}
                loading={loading?.updateProfile}
              >
                {loading?.updateProfile
                  ? "Saving..."
                  : uploadingImage
                    ? "Uploading..."
                    : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </React.Fragment>
      )}
      <UpdateUsernameDialog ref={updateUsernameDialogRef} />
    </Box>
  );
};

export default AccountSection;
