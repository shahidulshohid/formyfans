import { EMAIL_REGEX, USERNAME_REGEX } from "../constants/regex";

const loginValidation = (obj, setErrors) => {
  const errors = {};
  if (!obj.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(obj.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (!obj.password.trim()) {
    errors.password = "Password is required";
  }
  setErrors(errors);
  return !Object.values(errors).some(Boolean);
};

const createAccountValidation = (
  obj,
  { isUsernameReady, usernameStatus },
  setErrors,
) => {
  const errors = {};

  if (!obj.firstName.trim()) {
    errors.firstName = "First name is required";
  }
  if (!obj.lastName.trim()) {
    errors.lastName = "Last name is required";
  }
  if (!obj.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(obj.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (!obj.username.trim()) {
    errors.username = "Username is required";
  } else if (!USERNAME_REGEX.test(obj.username.trim())) {
    errors.username =
      "Username can only use letters, numbers, periods and underscores";
  } else if (!isUsernameReady) {
    if (usernameStatus === "taken") {
      errors.username = "Username is already taken";
    } else if (usernameStatus === "checking") {
      errors.username = "Checking username availability...";
    } else {
      errors.username = "Please choose an available username";
    }
  }
  if (!obj.password) {
    errors.password = "Password is required";
  } else if (obj.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (!obj.image) {
    errors.image = "Profile photo is required";
  }

  setErrors(errors);
  return !Object.values(errors).some(Boolean);
};

const updateProfileValidation = (obj, setInputError) => {
  let errors = {};

  if (!obj.image) {
    errors.image = "Profile photo is required";
  }

  if (!obj.coverImage?.trim()) {
    errors.coverImage = "Cover photo is required";
  }

  if (!obj.firstName?.trim()) {
    errors.firstName = "First name is required";
  }
  if (!obj.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }
  if (!obj.phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  }
  if (!obj.tagLine?.trim()) {
    errors.tagLine = "Tag line is required";
  }
  if (!obj.bio?.trim()) {
    errors.bio = "Bio is required";
  }
  // if (!obj.interests?.length) {
  //     errors.interests = "Interests are required";
  // }

  setInputError(errors);
  return Object.keys(errors).length > 0;
};

const changePasswordValidation = (obj, setInputError) => {
  let errors = {};

  if (!obj.currentPassword?.trim()) {
    errors.currentPassword = "Current password is required";
  }

  if (!obj.newPassword?.trim()) {
    errors.newPassword = "New password is required";
  }

  if (!obj.confirmNewPassword?.trim()) {
    errors.confirmNewPassword = "Confirm new password is required";
  } else if (obj.newPassword !== obj.confirmNewPassword) {
    errors.confirmNewPassword = "Passwords do not match";
  }

  setInputError(errors);
  return Object.keys(errors).length > 0;
};

const exclusiveContentValidation = (obj, setErrors) => {
  const errors = {};

  if (!obj.selectedType?.trim()) {
    errors.selectedType = "Please select a content type";
  }

  if (!obj.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!obj.description?.trim()) {
    errors.description = "Description is required";
  }

  if (!obj.image) {
    errors.image = "Please add an image or video";
  }

  setErrors(errors);
  return !Object.values(errors).some(Boolean);
};


export {
  loginValidation,
  createAccountValidation,
  updateProfileValidation,
  changePasswordValidation,
  exclusiveContentValidation,
};
