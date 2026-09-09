export const INTERESTS = [
  {
    type: "pop_culture",
    label: "Social Media Personalities",
    value: "social_media_personalities",
  },
  {
    type: "pop_culture",
    label: "Actors",
    value: "actors",
  },
  {
    type: "pop_culture",
    label: "Gamers",
    value: "gamers",
  },
  {
    type: "pop_culture",
    label: "TV Personalities",
    value: "tv_personalities",
  },
  {
    type: "pop_culture",
    label: "Celebrities",
    value: "celebrities",
  },
  {
    type: "humor",
    label: "Comedy",
    value: "comedy",
  },
  {
    type: "humor",
    label: "Movies",
    value: "movies",
  },
  {
    type: "sports",
    label: "Cricket",
    value: "cricket",
  },
  {
    type: "sports",
    label: "Gaming",
    value: "gaming",
  },
  {
    type: "sports",
    label: "Football",
    value: "football",
  },
  {
    type: "sports",
    label: "Swimming",
    value: "swimming",
  },
];

export const INTEREST_TYPE_LABELS = {
  pop_culture: "Pop Culture",
  humor: "Humor",
  sports: "Sports",
};

export const normalizeInterestValue = (interest) =>
  typeof interest === "string" ? interest : interest?.value;

export const getInterestLabel = (interest) => {
  const value = normalizeInterestValue(interest);
  return INTERESTS.find((item) => item.value === value)?.label || value;
};
