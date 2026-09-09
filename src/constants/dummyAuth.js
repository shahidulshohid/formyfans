/**
 * Dummy Authentication & Demo Content Data
 * Includes dummy credentials, mock profile, sample posts, stories, and suggestions.
 */

export const DUMMY_CREDENTIALS = {
  email: "demo@formyfans.com",
  password: "password123",
};

export const DUMMY_USER = {
  _id: "65f1a2b3c4d5e6f7a8b9c0d1",
  id: "65f1a2b3c4d5e6f7a8b9c0d1",
  name: "Shahidul Islam",
  firstName: "Shahidul",
  lastName: "Islam",
  email: "demo@formyfans.com",
  username: "shahidul_demo",
  role: "creator",
  gender: "male",
  phoneNumber: "+1 234 567 8900",
  bio: "Welcome to ForMyFans! Passionate creator sharing music, lifestyle, and exclusive content with the community.",
  tagLine: "Creating unforgettable moments ✨",
  image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
  profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
  coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  interests: ["Music", "Art", "Gaming", "Fitness", "Fashion"],
  followingCount: 28,
  followersCount: 1420,
  postsCount: 15,
  moveToSubscription: false,
  isDummy: true,
};

export const DUMMY_TOKEN = "dummy_jwt_token_formyfans_auth_demo_key_xyz987";

export const DUMMY_POSTS = [
  {
    _id: "post_demo_1",
    author: {
      _id: "65f1a2b3c4d5e6f7a8b9c0d1",
      firstName: "Shahidul",
      lastName: "Islam",
      username: "shahidul_demo",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      role: "creator",
    },
    caption: "Excited to share our brand new acoustic studio session! 🎸 Dropping exclusive tracks here for all our amazing supporters. What song should we cover next?",
    media: [
      {
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    likesCount: 184,
    commentsCount: 32,
    sharesCount: 15,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: "post_demo_2",
    author: {
      _id: "author_emma_w",
      firstName: "Emma",
      lastName: "Watson",
      username: "emma_vibes",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      role: "creator",
    },
    caption: "Golden hour glow ✨ Just finished today's creative photoshoot. Thank you everyone for the incredible love & support in the live stream!",
    media: [
      {
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    likesCount: 342,
    commentsCount: 58,
    sharesCount: 27,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    _id: "post_demo_3",
    author: {
      _id: "author_alex_m",
      firstName: "Alex",
      lastName: "Morgan",
      username: "alex_travels",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      role: "creator",
    },
    caption: "Chasing horizons and capturing memories across the mountains. Nature never ceases to amaze me. 🏔️🌲",
    media: [
      {
        mediaType: "image",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    likesCount: 512,
    commentsCount: 89,
    sharesCount: 44,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const DUMMY_STORIES = [
  {
    author: {
      _id: "author_story_1",
      firstName: "Sophia",
      lastName: "Ray",
      username: "sophiaray",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    stories: [
      {
        _id: "s1",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        type: "image",
      },
    ],
  },
  {
    author: {
      _id: "author_story_2",
      firstName: "David",
      lastName: "Kim",
      username: "david_music",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    stories: [
      {
        _id: "s2",
        url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        type: "image",
      },
    ],
  },
  {
    author: {
      _id: "author_story_3",
      firstName: "Elena",
      lastName: "Rostova",
      username: "elena_art",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    },
    stories: [
      {
        _id: "s3",
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        type: "image",
      },
    ],
  },
  {
    author: {
      _id: "author_story_4",
      firstName: "Lucas",
      lastName: "Silva",
      username: "lucas_fit",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    },
    stories: [
      {
        _id: "s4",
        url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
        type: "image",
      },
    ],
  },
];

export const DUMMY_SUGGESTIONS = [
  {
    follower: {
      _id: "sug_1",
      firstName: "Jessica",
      lastName: "Taylor",
      username: "jessica_t",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      role: "creator",
    },
    isFollowing: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    follower: {
      _id: "sug_2",
      firstName: "Liam",
      lastName: "Brown",
      username: "liambrown",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      role: "creator",
    },
    isFollowing: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    follower: {
      _id: "sug_3",
      firstName: "Chloe",
      lastName: "Bennett",
      username: "chloeb",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      role: "creator",
    },
    isFollowing: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
];
