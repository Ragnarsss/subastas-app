import { Routes, Route } from "react-router-dom";
import AuctionHome from "../pages/auctions/AuctionHome";
import AuctionDetail from "../pages/auctions/AuctionDetail";
import CreateAuction from "../pages/auctions/CreateAuction";
import LiveBidding from "../pages/auctions/LiveBidding";

function AuctionRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuctionHome />} />
      <Route path="/create" element={<CreateAuction />} />
      <Route path="/live/:id" element={<LiveBidding />} />
      <Route path="/:id" element={<AuctionDetail />} />
    </Routes>
  );
}

export default AuctionRoutes;
