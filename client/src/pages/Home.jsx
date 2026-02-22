import Banner from "../components/Banner";
import BestSeller from "../components/BestSeller";
import Category from "../components/Category";
import CategoryProducts from "../components/CategoryProducts";
import NewsLetter from "../components/NewsLetter";

const Home = () => {
  return (
    <div className="mt-0">
      <Banner />
      <Category />
      <BestSeller />
      <CategoryProducts />
      <NewsLetter />
    </div>
  );
};
export default Home;
