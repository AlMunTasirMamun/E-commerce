import { categories } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  // Find category info from categories list
  const searchCategory = categories.find(
    (item) =>
      item.path.toLowerCase().trim() ===
      category.toLowerCase().trim()
  );

  // Filter products by category
  const filteredProducts = products.filter(
    (product) =>
      product.category &&
      product.category.toLowerCase().trim() ===
      category.toLowerCase().trim()
  );

  return (
    <div className="mt-16 px-4">
      {/* Category Title */}
      {searchCategory && (
        <h1 className="text-3xl md:text-4xl font-medium mb-6">
          {searchCategory.text}
        </h1>
      )}

      {/* Products */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <h1 className="text-2xl text-gray-500">
          No products found
        </h1>
      )}
    </div>
  );
};

export default ProductCategory;
