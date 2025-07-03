import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./Chat/Nav";
import { useProfile } from "../context/profileContext";
import SelectAvatar from "./SelectAvatar";

const Profile = () => {
  const { userDetails } = useProfile();
  // console.log(userDetails);

  const [formData, setFormData] = useState({});
  const [selectedLink, setSelectedLink] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put("/api/user/profile/update", {
        ...formData,
        avatarLink: selectedLink,
      });

      // Handle successful response (you may want to update state or show a success message)
      // console.log(response.data);
    } catch (error) {
      // Handle error (you may want to show an error message)
      console.error(error);
    }
  };
  useEffect(() => {
    setFormData(userDetails);
  },[userDetails]);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Nav />
      <main className="flex-1 flex items-center justify-center h-full">
        <div className="w-full max-w-xl bg-primary/90 rounded-2xl shadow-2xl p-8 md:p-12 mx-4 flex flex-col items-center">
          <h2 className="mb-6 text-3xl font-bold text-white text-center">Update Profile</h2>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid gap-6 mb-6 sm:grid-cols-2">
              <div className="w-full">
                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-white">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="border text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                  value={formData?.firstName || ""}
                  placeholder="First Name"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-white">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  className="border text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                  value={formData?.lastName || ""}
                  placeholder="Last Name"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  disabled
                  className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-400"
                  value={userDetails?.email || ""}
                  placeholder="Email"
                  required
                />
              </div>
            </div>
            <SelectAvatar setSelectedLink={setSelectedLink} selectedLink={selectedLink} />
            <div className="flex items-center justify-center mt-8">
              <button
                type="submit"
                className="text-white bg-primarySecond hover:bg-primary focus:ring-4 focus:outline-none focus:ring-primary-300 font-semibold rounded-lg text-base px-8 py-3 transition shadow-lg"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;