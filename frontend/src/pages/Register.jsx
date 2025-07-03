import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const Register = () => {
  const [data, setData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/user/register";
      const { data: res } = await axios.post(url, data);
      toast.success(res.message);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 300 &&
        error.response.status <= 500
      ) {
        toast.error(error.response.data.message);
      }
    }
  };
  return (
    <section className="bg-dark h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md bg-primary/90 rounded-2xl shadow-2xl p-8 md:p-10 mx-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create an account</h1>
        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                First Name
              </label>
              <input
                onChange={handleChange}
                value={data.firstName}
                type="text"
                name="firstName"
                id="firstName"
                placeholder="John"
                className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primarySecond focus:border-primarySecond"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">
                Last Name
              </label>
              <input
                onChange={handleChange}
                value={data.lastName}
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Doe"
                className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primarySecond focus:border-primarySecond"
                required
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-white">
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
          <div className="flex items-start">
            <input
              id="terms"
              aria-describedby="terms"
              type="checkbox"
              className="w-4 h-4 border rounded bg-gray-700 border-gray-600 focus:ring-primarySecond"
              required
            />
            <label className="ml-2 text-sm text-gray-300">
              I accept the{' '}
              <a className="font-medium text-primarySecond hover:underline" href="#">
                Terms and Conditions
              </a>
            </label>
          </div>
          <button
            type="submit"
            className="w-full text-white font-semibold rounded-lg text-base px-5 py-2.5 bg-primarySecond hover:bg-primary transition shadow-lg"
          >
            Create an account
          </button>
          <p className="text-sm font-light text-gray-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primarySecond hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;