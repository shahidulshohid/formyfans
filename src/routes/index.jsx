import Category from "../app/category";
import Chat from "../app/chat";
import HomePage from "../app/home";
import MarketPlace from "../app/market";
import Profile from "../app/profile";
import Settings from "../app/settins";
import LoginForm from "../screens/auth/login";
import ViewProfile from "../app/viewProfile";
import CreateAccount from "../screens/auth/createAccount";
import VerificationCode from "../screens/auth/otp";
import ForgotPassword from "../screens/auth/forgotPassword";
import NewPassword from "../screens/auth/newPassword";
import ForgotEmail from "../screens/auth/ForgotEmail";
import MarketProduct from "../screens/marketProduct";
import Cart from "../screens/cart/index";
import Order from "../screens/cart/shippingDetail/order";
import ShippingDetail from "../screens/cart/shippingDetail";
import ProductListing from "../screens/marketProduct/productListing/productListing";
import OrderListing from "../screens/marketProduct/productListing/orderListing";
import MyOrders from "../screens/orders/myOrders";
import CreateProduct from "../screens/marketProduct/createProduct";
import OrderDetails from "../screens/marketProduct/createProduct/orderDetails";
import Notifications from "../app/settins/notifications";
import LiveStreams from "../app/liveStreams";
import SubscriptionPlans from "../screens/subscriptionPlan";
import { Stories } from "../app/stories";
import CreateAiImage from "../app/aiContent/aiImage/CreateAiImage";
import AiGeneratedScript from "../app/aiContent/aiImage/AiGeneratedScript";
import AiImageReady from "../app/aiContent/aiImage/AiImageReady";
import CreateAiVideo from "../app/aiContent/aiVideo/CreateAiVideo";
import AiGeneratedVideoScript from "../app/aiContent/aiVideo/AiGeneratedVideoScript";
import AiVideoReady from "../app/aiContent/aiVideo/AiVideoReady";

const AUTH_LAYOUT = [
  {
    id: 2,
    name: "Login",
    path: "/login",
    component: <LoginForm />,
  },
  {
    id: 3,
    name: "Create Account",
    path: "/create-account",
    component: <CreateAccount />,
  },
  {
    id: 4,
    name: "Verification Code",
    path: "/verification-code",
    component: <VerificationCode />,
  },
  {
    id: 5,
    name: "Forgot Password",
    path: "/forgot-password",
    component: <ForgotPassword />,
  },
  {
    id: 6,
    name: "New Password",
    path: "/new-password",
    component: <NewPassword />,
  },
  {
    id: 7,
    name: "Enter Email",
    path: "/enter-email",
    component: <ForgotEmail />,
  },
];

const APP_LAYOUT = [
  {
    id: 0,
    name: "root",
    path: "/",
    component: <HomePage />,
  },
  {
    id: 1,
    name: "home",
    path: "/home",
    component: <HomePage />,
  },
  {
    id: 2,
    name: "profile",
    path: "/profile",
    component: <Profile />,
  },
  {
    id: 3,
    name: "settings",
    path: "/settings/*",
    component: <Settings />,
  },
  {
    id: 4,
    name: "settings",
    path: "/market",
    component: <MarketPlace />,
  },
  {
    id: 5,
    name: "settings",
    path: "/market-place",
    component: <MarketPlace />,
  },
  {
    id: 6,
    name: "Category",
    path: "/category",
    component: <Category />,
  },
  {
    id: 7,
    name: "chat",
    path: "/chat",
    component: <Chat />,
  },
  {
    id: 8,
    name: "view-profile",
    path: "/:username/",
    component: <ViewProfile />,
  },
  {
    id: 9,
    name: "view-profile-tab",
    path: "/:username/:tab",
    component: <ViewProfile />,
  },
  {
    id: 10,
    name: "market-product",
    path: "/market-product/:productCode",
    component: <MarketProduct />,
  },
  {
    id: 11,
    name: "cart",
    path: "/cart",
    component: <Cart />,
  },
  {
    id: 12,
    name: "order",
    path: "/order",
    component: <Order />,
  },
  {
    id: 13,
    name: "shipping-detail",
    path: "/shipping-detail",
    component: <ShippingDetail />,
  },
  {
    id: 14,
    name: "order-listing",
    path: "/order-listing",
    component: <OrderListing />,
  },
  {
    id: 15,
    name: "my-orders",
    path: "/my-orders",
    component: <MyOrders />,
  },
  {
    id: 16,
    name: "product-listing",
    path: "/product-listing",
    component: <ProductListing />,
  },
  {
    id: 17,
    name: "create-product",
    path: "/create-product",
    component: <CreateProduct />,
  },
  {
    id: 18,
    name: "order-details",
    path: "/order-details",
    component: <OrderDetails />,
  },
  {
    id: 19,
    name: "notifications",
    path: "/notifications",
    component: <Notifications />,
  },
  {
    id: 20,
    name: "live-streams",
    path: "/live-streams",
    component: <LiveStreams />,
  },
  {
    id: 21,
    name: "stories",
    path: "/stories",
    component: <Stories />,
  },
  {
    id: 22,
    name: "Subscription Plans",
    path: "/subscription-plans",
    component: <SubscriptionPlans />,
  },
  {
    id: 23,
    name: "ai-create-image",
    path: "/ai-create-image",
    component: <CreateAiImage />,
  },
  {
    id: 24,
    name: "ai-generated-script",
    path: "/ai-generated-script",
    component: <AiGeneratedScript />,
  },
  {
    id: 25,
    name: "ai-image-ready",
    path: "/ai-image-ready",
    component: <AiImageReady />,
  },
  {
    id: 26,
    name: "ai-create-video",
    path: "/ai-create-video",
    component: <CreateAiVideo />,
  },
  {
    id: 27,
    name: "ai-video-generated-script",
    path: "/ai-video-generated-script",
    component: <AiGeneratedVideoScript />,
  },
  {
    id: 28,
    name: "ai-video-ready",
    path: "/ai-video-ready",
    component: <AiVideoReady />,
  },
];

export { AUTH_LAYOUT, APP_LAYOUT };
