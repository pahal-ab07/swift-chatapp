import { Link } from "react-router-dom";
import hero from "../assets/hero.png";
import { useAuth } from "../context/authContext";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-dark">
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold mb-6 text-white leading-tight">
            Swift Chat: Instant Connections, Effortless Conversations
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto md:mx-0">
            Connect Seamlessly, Chat Effortlessly: Elevate Your Conversations with Our Intuitive Chat Application!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            {!isAuthenticated && (
              <Link
                to={"/login"}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white rounded-lg bg-primarySecond hover:bg-primary transition shadow-lg"
              >
                Login
                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to={"/chathome"}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white rounded-lg bg-primarySecond hover:bg-primary transition shadow-lg"
              >
                Chat Home
                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to={"/register"}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold border rounded-lg text-white border-gray-700 hover:bg-gray-700 transition shadow-lg"
              >
                Register
              </Link>
            )}
          </div>
        </div>
        <div className="flex-1 flex justify-center mb-8 md:mb-0">
          <img src={hero} alt="Chat Illustration" className="max-w-xs md:max-w-md rounded-xl shadow-lg" />
        </div>
      </div>
    </section>
  );
};

export default Hero;