import { Routes, Route, useLocation } from "react-router-dom";
import Products from "./pages/Products";
import SingleProduct from "./pages/SingleProduct";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Auth from "./modals/Auth";
import ProductCategory from "./pages/ProductCategory";
import Address from "./pages/Address";
import MyOrders from "./pages/MyOrders";
import MyRefunds from "./pages/MyRefunds";
import SellerLogin from "./components/seller/SellerLogin";
import SellerLayout from "./pages/seller/SellerLayout";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import Refunds from "./pages/seller/Refunds";
import Support from "./pages/seller/Support";
import Subscribers from "./pages/seller/Subscribers";
import Reviews from "./pages/seller/Reviews";
import about from "./pages/about";
import Career from "./pages/Career";
import Blog from "./pages/Blog";
import Partner from "./pages/Partner";
import HelpCenter from "./pages/HelpCenter";
import SafetyInformation from "./pages/SafetyInformation";
import CancellationOptions from "./pages/CancellationOptions";
import ContactUs from "./pages/ContactUs";
import Accessibility from "./pages/Accessibility";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Sitemap from "./pages/Sitemap";
import TransactionHistory from "./pages/TransactionHistory";
import Profile from "./pages/Profile";
import ChatWidget from "./components/ChatWidget";
const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin, isSeller } = useAppContext();
  return (
    <div className="text-default min-h-screen">
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Auth /> : null}
      <Toaster />
      <div
        className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/product/:category/:id" element={<SingleProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<Address />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-refunds" element={<MyRefunds />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<about />} />
          <Route path="/career" element={<Career />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/safety-information" element={<SafetyInformation />} />
          <Route path="/cancellation-options" element={<CancellationOptions />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/sitemap" element={<Sitemap />} />
          
          <Route 
            path="/seller"
            element={isSeller ? <SellerLayout /> : <SellerLogin />}
          >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route
              path="product-list"
              element={isSeller ? <ProductList /> : null}
            />
            <Route path="orders" element={isSeller ? <Orders /> : null} />
            <Route path="refunds" element={isSeller ? <Refunds /> : null} />
            <Route path="reviews" element={isSeller ? <Reviews /> : null} />
            <Route path="support" element={isSeller ? <Support /> : null} />
            <Route path="subscribers" element={isSeller ? <Subscribers /> : null} />
          </Route>
        </Routes>
      </div>
      {isSellerPath ? null : <Footer />}
      {isSellerPath ? null : <ChatWidget />}
    </div>
  );
};
export default App;
