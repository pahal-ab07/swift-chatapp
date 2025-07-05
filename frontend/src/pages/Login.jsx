import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/user/login";
      console.log("Attempting login...");
      const response = await axios.post(url, data, {
        withCredentials: true,
      });
      console.log("Login response:", response);
      console.log("Response headers:", response.headers);
      
      if (response.status == 200) {
        toast.success(response.data.message);
        console.log("Login successful, checking for cookies...");
        
        // Check if cookie was set
        const token = document.cookie.split(';').find(row => row.startsWith('authToken='));
        console.log("Cookie found:", token);
        
        // Store token in localStorage as backup if cookie doesn't work
        if (response.data.user) {
          localStorage.setItem("authToken", response.data.user._id);
        }
        
        setAuthenticated(true);
        // Navigate to chat home after successful login
        navigate("/chathome");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred during login");
      }
    }
  };
  return (
    <section className="bg-dark h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md bg-primary/90 rounded-2xl shadow-2xl p-8 md:p-10 mx-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign in to your account</h1>
        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
              Your email
            </label>
            <input
              onChange={handleChange}
              value={data.email}
              type="email"
              name="email"
              id="email"
              className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primarySecond focus:border-primarySecond"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
              Password
            </label>
            <input
              onChange={handleChange}
              value={data.password}
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primarySecond focus:border-primarySecond"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                aria-describedby="remember"
                type="checkbox"
                className="w-4 h-4 border rounded bg-gray-700 border-gray-600 focus:ring-primarySecond"
                required
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm font-medium hover:underline text-primarySecond">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full text-white font-semibold rounded-lg text-base px-5 py-2.5 bg-primarySecond hover:bg-primary transition shadow-lg"
          >
            Sign in
          </button>
          <p className="text-sm font-light text-gray-400 text-center">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-medium text-primarySecond hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;