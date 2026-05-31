import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";

import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "https://e-commerce-production-0858.up.railway.app";

// Axios response interceptor for 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only show toast for protected routes, not for auth status checks
      const isAuthCheckRequest = error.config?.url?.includes("/is-auth");
      if (!isAuthCheckRequest) {
        toast.error("Please log in to purchase with us");
      }
    }
    return Promise.reject(error);
  }
);

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // check seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      }
    } catch (error) {
      // User is not a seller - silent fail
    }
  };

  // fetch user auth status ,user Data and cart items
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cart);
      }
    } catch (error) {
      // User is not logged in - this is expected on first load
      // Silent fail, user will see login modal when trying to purchase
    }
  };

  // fetch products
  const fetchProducts = async (broadcast = false) => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
        // Broadcast to other tabs if needed
        if (broadcast && typeof window !== 'undefined') {
          window.localStorage.setItem('products-updated', Date.now().toString());
        }
        return data.products; // Return products for immediate use
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Listen for product updates from other tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handler = () => fetchProducts();
      window.addEventListener('storage', (e) => {
        if (e.key === 'products-updated') handler();
      });
      return () => window.removeEventListener('storage', handler);
    }
  }, []);
  // add product to cart
const addToCart = (itemId) => {
  let cartData = structuredClone(cartItems || {});

  const product = products.find((p) => p._id === itemId);

  if (!product) return;

  const currentQty = cartData[itemId] || 0;

  // original stock = current stock + already added quantity
  const availableStock = product.stock + currentQty;

  if (currentQty >= availableStock) {
    toast.error(`Cannot add more than available stock (${availableStock})`);
    return;
  }

  cartData[itemId] = currentQty + 1;

  setProducts((prevProducts) =>
    prevProducts.map((p) =>
      p._id === itemId
        ? {
            ...p,
            stock: p.stock - 1,
          }
        : p
    )
  );

  setCartItems(cartData);

  toast.success("Added to cart");
};

  // update cart item quantity
  const updateCartItem = (itemId, quantity) => {
  let cartData = structuredClone(cartItems);

  const product = products.find((p) => p._id === itemId);

  if (!product) return;

  // original stock
  const originalStock = product.stock + (cartItems[itemId] || 0);

  if (quantity > originalStock) {
    toast.error(`Cannot set quantity above stock (${originalStock})`);
    return;
  }

  // update visible stock
  setProducts((prevProducts) =>
    prevProducts.map((p) =>
      p._id === itemId
        ? {
            ...p,
            stock: originalStock - quantity,
          }
        : p
    )
  );

  cartData[itemId] = quantity;

  if (quantity <= 0) {
    delete cartData[itemId];
  }

  setCartItems(cartData);
};

  // total cart items
  const cartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };
  // total cart amount
  const totalCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (cartItems[items] > 0) {
        totalAmount += cartItems[items] * itemInfo.offerPrice;
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };
  // remove product from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
      toast.success(`remove from cart`);
      setCartItems(cartData);
    }
  };
  useEffect(() => {
    fetchSeller();
    fetchProducts();
    fetchUser();
  }, []);

  // update database cart items
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });

        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (user) {
      updateCart();
    }
  }, [cartItems]);
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    cartCount,
    totalCartAmount,
    axios,
    fetchProducts,
    setCartItems,
    isChatOpen,
    setIsChatOpen,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
