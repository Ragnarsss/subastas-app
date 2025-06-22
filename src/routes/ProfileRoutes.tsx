import { Routes, Route } from "react-router-dom";
import ProfileOverview from "../pages/profile/ProfileOverview";
import ProfileSettings from "../pages/profile/ProfileSettings";
import MyAuctions from "../pages/profile/MyAuctions";
import MyBids from "../pages/profile/MyBids";

function ProfileRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProfileOverview />} />
      <Route path="/settings" element={<ProfileSettings />} />
      <Route path="/my-auctions" element={<MyAuctions />} />
      <Route path="/my-bids" element={<MyBids />} />
    </Routes>
  );
}

export default ProfileRoutes;
