import { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const ProductList = () => {
  const { products, fetchProducts, axios } = useAppContext();
  const [editModal, setEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [editOfferPrice, setEditOfferPrice] = useState("");
  const [editFreeShipping, setEditFreeShipping] = useState(false);
  const [editStock, setEditStock] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesStock = filterStock === "all" || 
                        (filterStock === "inStock" && (product.stock > 0 || product.inStock)) ||
                        (filterStock === "outOfStock" && (product.stock === 0 || !product.inStock)) ||
                        (filterStock === "lowStock" && product.stock > 0 && product.stock <= 5);
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Stats
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 0 || p.inStock).length,
    outOfStock: products.filter(p => p.stock === 0 || !p.inStock).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
  };

  // Update Stock
  const updateStock = async (id, stock) => {
    try {
      const { data } = await axios.post("/api/product/stock", { id, stock: Number(stock) });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Quick stock update
  const quickStockUpdate = async (id, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change);
    await updateStock(id, newStock);
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setEditProduct(product);
    setEditPrice(product.price.toString());
    setEditOfferPrice(product.offerPrice.toString());
    const discount = Math.round(((product.price - product.offerPrice) / product.price) * 100);
    setEditDiscount(discount >= 0 ? discount.toString() : "0");
    setEditFreeShipping(product.freeShipping || false);
    setEditStock(product.stock?.toString() || "10");
    setEditModal(true);
  };

  // Handle Edit Price Change
  const handleEditPriceChange = (newPrice) => {
    setEditPrice(newPrice);
    if (newPrice && editDiscount) {
      const calculatedOffer = Math.round(newPrice - (newPrice * editDiscount / 100));
      setEditOfferPrice(calculatedOffer.toString());
    } else if (newPrice) {
      setEditOfferPrice(newPrice);
    }
  };

  // Handle Edit Discount Change
  const handleEditDiscountChange = (newDiscount) => {
    const discountValue = Math.min(100, Math.max(0, newDiscount));
    setEditDiscount(discountValue.toString());
    if (editPrice && discountValue >= 0) {
      const calculatedOffer = Math.round(editPrice - (editPrice * discountValue / 100));
      setEditOfferPrice(calculatedOffer.toString());
    } else if (editPrice) {
      setEditOfferPrice(editPrice);
    }
  };

  // Handle Edit Offer Price Change
  const handleEditOfferPriceChange = (newOfferPrice) => {
    setEditOfferPrice(newOfferPrice);
    if (editPrice && newOfferPrice) {
      const calculatedDiscount = Math.round(((editPrice - newOfferPrice) / editPrice) * 100);
      setEditDiscount(calculatedDiscount >= 0 ? calculatedDiscount.toString() : "0");
    }
  };

  // Save Edited Product
  const saveEditedProduct = async () => {
    if (!editProduct) return;
    try {
      // Update price and shipping
      const { data } = await axios.post("/api/product/update-price", {
        id: editProduct._id,
        price: Number(editPrice),
        offerPrice: Number(editOfferPrice),
        freeShipping: editFreeShipping,
      });
      
      // Update stock
      await axios.post("/api/product/stock", {
        id: editProduct._id,
        stock: Number(editStock),
      });

      if (data.success) {
        fetchProducts();
        toast.success("Product updated successfully!");
        setEditModal(false);
        setEditProduct(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-indigo-100 p-2 rounded-lg">📦</span>
              Product Inventory
            </h1>
            <p className="text-gray-500 mt-1">Manage your product catalog and stock levels</p>
          </div>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => setFilterStock("all")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filterStock === "all" 
              ? "bg-indigo-600 text-white shadow-lg" 
              : "bg-white border border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${filterStock === "all" ? "text-white" : "text-indigo-600"}`}>{stats.total}</p>
              <p className={`text-sm ${filterStock === "all" ? "text-indigo-100" : "text-gray-500"}`}>Total Products</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>
        <div 
          onClick={() => setFilterStock("inStock")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filterStock === "inStock" 
              ? "bg-green-600 text-white shadow-lg" 
              : "bg-white border border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${filterStock === "inStock" ? "text-white" : "text-green-600"}`}>{stats.inStock}</p>
              <p className={`text-sm ${filterStock === "inStock" ? "text-green-100" : "text-gray-500"}`}>In Stock</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>
        <div 
          onClick={() => setFilterStock("lowStock")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filterStock === "lowStock" 
              ? "bg-yellow-500 text-white shadow-lg" 
              : "bg-white border border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${filterStock === "lowStock" ? "text-white" : "text-yellow-600"}`}>{stats.lowStock}</p>
              <p className={`text-sm ${filterStock === "lowStock" ? "text-yellow-100" : "text-gray-500"}`}>Low Stock</p>
            </div>
            <span className="text-3xl">⚠️</span>
          </div>
        </div>
        <div 
          onClick={() => setFilterStock("outOfStock")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filterStock === "outOfStock" 
              ? "bg-red-600 text-white shadow-lg" 
              : "bg-white border border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${filterStock === "outOfStock" ? "text-white" : "text-red-600"}`}>{stats.outOfStock}</p>
              <p className={`text-sm ${filterStock === "outOfStock" ? "text-red-100" : "text-gray-500"}`}>Out of Stock</p>
            </div>
            <span className="text-3xl">🚫</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg transition ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg transition ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filteredProducts.map((product) => {
            const discount = product.price > 0 
              ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
              : 0;
            const isOutOfStock = product.stock === 0 || !product.inStock;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            
            return (
              <div
                key={product._id}
                className={`bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group ${
                  isOutOfStock ? "ring-1 ring-red-200" : isLowStock ? "ring-1 ring-yellow-200" : "shadow-sm hover:shadow-md"
                }`}
              >
                {/* Product Image Container */}
                <div className="relative bg-gradient-to-br from-slate-50 to-slate-100">
                  {/* Image */}
                  <div className="aspect-square p-2 flex items-center justify-center">
                    <img
                      src={`http://localhost:5000/images/${product.image[0]}`}
                      alt={product.name}
                      className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? "opacity-40 grayscale" : ""}`}
                    />
                  </div>

                  {/* Discount Badge - Top Left */}
                  {discount > 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        {discount}%
                      </span>
                    </div>
                  )}

                  {/* Stock Out Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                        OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2.5">
                  {/* Category */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                      {product.category}
                    </span>
                    {!isOutOfStock && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isLowStock 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {product.stock || 0}
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className="font-medium text-gray-800 text-xs line-clamp-2 mb-1.5 min-h-[32px] leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Price Row */}
                  <div className="flex items-baseline gap-1 mb-2 pb-2 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-900">৳{product.offerPrice?.toLocaleString()}</span>
                    {product.price > product.offerPrice && (
                      <span className="text-[10px] text-gray-400 line-through">৳{product.price?.toLocaleString()}</span>
                    )}
                    {product.freeShipping && (
                      <span className="ml-auto text-[8px] font-medium text-green-600 bg-green-50 px-1 rounded">
                        Free
                      </span>
                    )}
                  </div>

                  {/* Stock Controls */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => quickStockUpdate(product._id, product.stock || 0, -1)}
                        disabled={product.stock === 0}
                        className="w-6 h-6 rounded bg-red-50 text-red-600 font-bold hover:bg-red-100 transition disabled:opacity-40 text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={product.stock || 0}
                        onChange={(e) => updateStock(product._id, e.target.value)}
                        className="flex-1 text-center py-1 bg-gray-50 border-0 rounded text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                        min="0"
                      />
                      <button
                        onClick={() => quickStockUpdate(product._id, product.stock || 0, 1)}
                        className="w-6 h-6 rounded bg-green-50 text-green-600 font-bold hover:bg-green-100 transition text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(product)}
                    className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Price</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock === 0 || !product.inStock;
                const isLowStock = product.stock > 0 && product.stock <= 5;
                
                return (
                  <tr key={product._id} className={`hover:bg-gray-50 transition ${isOutOfStock ? "bg-red-50/50" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ${isOutOfStock ? "opacity-50" : ""}`}>
                          <img
                            src={`http://localhost:5000/images/${product.image[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-sm text-gray-500 md:hidden">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="font-semibold text-green-600">৳{product.offerPrice?.toLocaleString()}</span>
                        {product.price > product.offerPrice && (
                          <span className="text-xs text-gray-400 line-through">৳{product.price?.toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => quickStockUpdate(product._id, product.stock || 0, -1)}
                          disabled={product.stock === 0}
                          className="w-8 h-8 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200 transition disabled:opacity-50 text-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={product.stock || 0}
                          onChange={(e) => updateStock(product._id, e.target.value)}
                          className="w-16 text-center py-1.5 border border-gray-200 rounded-lg font-semibold focus:ring-2 focus:ring-indigo-500 text-sm"
                          min="0"
                        />
                        <button
                          onClick={() => quickStockUpdate(product._id, product.stock || 0, 1)}
                          className="w-8 h-8 rounded-lg bg-green-100 text-green-600 font-bold hover:bg-green-200 transition text-sm"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isOutOfStock ? (
                        <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          STOCK OUT
                        </span>
                      ) : isLowStock ? (
                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          IN STOCK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <span className="text-4xl">📦</span>
              <p className="mt-4 text-gray-500">No products found</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      {editModal && editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button
                onClick={() => setEditModal(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <img
                  src={`http://localhost:5000/images/${editProduct.image[0]}`}
                  alt={editProduct.name}
                  className="w-20 h-20 object-contain bg-white rounded-xl p-2"
                />
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-2">{editProduct.name}</p>
                  <p className="text-sm text-indigo-600">{editProduct.category}</p>
                </div>
              </div>

              {/* Stock Input */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Stock Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditStock(Math.max(0, Number(editStock) - 1).toString())}
                    className="w-12 h-12 rounded-xl bg-red-100 text-red-600 font-bold text-xl hover:bg-red-200 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="flex-1 text-center py-3 border-2 border-gray-200 rounded-xl font-bold text-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                  />
                  <button
                    onClick={() => setEditStock((Number(editStock) + 1).toString())}
                    className="w-12 h-12 rounded-xl bg-green-100 text-green-600 font-bold text-xl hover:bg-green-200 transition"
                  >
                    +
                  </button>
                </div>
                {Number(editStock) === 0 && (
                  <p className="mt-2 text-sm text-red-600 font-medium">⚠️ Product will be marked as "Stock Out"</p>
                )}
                {Number(editStock) > 0 && Number(editStock) <= 5 && (
                  <p className="mt-2 text-sm text-yellow-600 font-medium">⚠️ Low stock warning will be shown</p>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Original Price (৳)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => handleEditPriceChange(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Discount (%)</label>
                    <input
                      type="number"
                      value={editDiscount}
                      onChange={(e) => handleEditDiscountChange(e.target.value)}
                      min="0"
                      max="100"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Offer Price (৳)</label>
                    <input
                      type="number"
                      value={editOfferPrice}
                      onChange={(e) => handleEditOfferPriceChange(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {editPrice && editOfferPrice && Number(editPrice) > Number(editOfferPrice) && (
                  <div className="bg-green-100 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 font-medium">
                      💰 Customer Savings: ৳{(editPrice - editOfferPrice).toLocaleString()} ({editDiscount || 0}% off)
                    </p>
                  </div>
                )}
              </div>

              {/* Free Shipping Toggle */}
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-semibold text-gray-800">Free Shipping</p>
                    <p className="text-sm text-gray-500">No shipping charge for this product</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={editFreeShipping}
                    onChange={(e) => setEditFreeShipping(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full transition"></div>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition"></span>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedProduct}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
