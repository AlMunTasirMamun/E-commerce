import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
import { useAppContext } from "../context/AppContext";

const Products = () => {
  const { products, searchQuery } = useAppContext();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    brand: [],
    priceRange: [0, 10000],
    freeShipping: false,
  });

  const applyFilters = () => {
    let result = products;

    // Apply search filter
    if (searchQuery.length > 0) {
      result = result.filter((product) =>
        product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Apply brand filter
    if (filters.brand.length > 0) {
      result = result.filter((product) =>
        filters.brand.includes(product.brand || "General")
      );
    }

    // Apply price filter
    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Apply free shipping filter
    if (filters.freeShipping) {
      result = result.filter((product) => product.freeShipping);
    }

    setFilteredProducts(result);
  };

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, filters]);

  return (
    <div className="mt-16 px-4">
      <h1 className="text-3xl lg:text-4xl font-medium mb-8">
        All Products
      </h1>

      <div className="flex flex-col md:flex-row">
        {/* Filter Sidebar */}
        <ProductFilter products={products} onFilterChange={setFilters} />

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl text-gray-500">No products found</h2>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;