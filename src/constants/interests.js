export const INTERESTS = [
  { label: "Skin Care", value: "skin_care" },
  { label: "Beauty", value: "beauty" },
  { label: "Fashion", value: "fashion" },
  { label: "Fitness", value: "fitness" },
  { label: "Wellness", value: "wellness" },
  { label: "Travel", value: "travel" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Food", value: "food" },
  { label: "Tech", value: "tech" },
  { label: "Gaming", value: "gaming" },
  { label: "Parenting", value: "parenting" },
  { label: "Luxury", value: "luxury" },
  { label: "Home Decor", value: "home_decor" },
  { label: "Photography", value: "photography" },
  { label: "Music", value: "music" },
  { label: "Sustainability", value: "sustainability" },
];

const VALID_INTEREST_VALUES = new Set(INTERESTS.map((item) => item.value));

export const normalizeInterestValue = (interest) =>
  typeof interest === "string" ? interest : interest?.value ?? "";

export const normalizeInterests = (interests) => {
  if (!Array.isArray(interests)) return [];

  return interests
    .map(normalizeInterestValue)
    .filter((value) => VALID_INTEREST_VALUES.has(value));
};

export const getInterestLabel = (interest) => {
  const value = normalizeInterestValue(interest);
  const match = INTERESTS.find((item) => item.value === value);
  if (match) return match.label;

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
