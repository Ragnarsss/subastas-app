import { Routes, Route } from "react-router-dom";
import AuctionHome from "../pages/auctions/AuctionHome";
import AuctionDetail from "../pages/auctions/AuctionDetail";
import CreateAuction from "../pages/auctions/CreateAuction";

function AuctionRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuctionHome />} />
      <Route path="/:id" element={<AuctionDetail />} />
      <Route path="/create" element={<CreateAuction />} />
    </Routes>
  );
}

export default AuctionRoutes;
