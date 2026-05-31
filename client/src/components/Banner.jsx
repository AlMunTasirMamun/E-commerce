import bannerImage from "../assets/banner_pic.png";

const Banner = () => {
  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">

      {/* Banner Image */}
      <img
        src={bannerImage}
        alt="সদাই Banner"
        className="w-screen h-[260px] md:h-[300px] lg:h-[340px] object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-end px-6 md:px-16 lg:px-24">
        <div className="max-w-lg text-right text-white">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
            Everything You Need <br />
            In One <span className="text-indigo-400">Marketplace</span>
          </h1>

          <p className="mt-2 text-gray-200 text-sm md:text-base">
            Electronics, fashion, books & groceries — shop smarter every day.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Banner;
