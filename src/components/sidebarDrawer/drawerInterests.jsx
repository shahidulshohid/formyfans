import useUserStore from "../../zustand/userUserStore";
import { normalizeInterests } from "../../constants/interests";
import UserInterests from "../../app/home/profileSection/userInterests";

const DrawerInterests = () => {
  const { user } = useUserStore();
  return <UserInterests userInterests={normalizeInterests(user?.interests)} />;
};

export default DrawerInterests;
