// import { useContext, useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// //  import { AuthContext } from "../../../context/AuthContext";
// import API from "../../../Api";
// import ProfileSidebar from "./ProfileSidebar";
// import PersonalInformation from "./PersonalInformation";


// import Certifications from "./Certifications";
// import Resume from "./Resume";
// import SettingsSection from "./Settings";

// const tabTitles = {
//   personal: "Personal Information",
//   experience: "Work Experience",
//   education: "Education",
//   certifications: "Certifications",
//   resume: "Resume",
//   settings: "Settings",
// };

// function Profile() {
//   const navigate = useNavigate();
//   const { user, authLoading, logoutUser } = useContext(AuthContext);

//   const [activeTab, setActiveTab] = useState(() => {
//     return localStorage.getItem("profileActiveTab") || "personal";
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState(null);
//   const [profileLoading, setProfileLoading] = useState(true);
//   const [profileError, setProfileError] = useState("");

//   useEffect(() => {
//     localStorage.setItem("profileActiveTab", activeTab);
//     setIsEditing(false);
//   }, [activeTab]);

//   useEffect(() => {
//     if (authLoading) return;

//     const storedUser = localStorage.getItem("jobdekho_user");

//     if (!user && !storedUser) {
//       navigate("/login", { replace: true });
//       return;
//     }

//     async function fetchProfile() {
//       try {
//         setProfileLoading(true);
//         setProfileError("");

//         const { data } = await API.get("v1/profile");

//         const finalProfile =
//           data?.data || data?.profile || data?.user || data || null;

//         setProfileData(finalProfile);
//       } catch (error) {
//         console.log("Profile API Error:", error.response?.data || error.message);

//         const localUser = storedUser ? JSON.parse(storedUser) : null;

//         if (error.response?.status === 401) {
//           if (localUser || user) {
//             setProfileData(user || localUser);
//             setProfileError("");
//             return;
//           }

//           navigate("/login", { replace: true });
//           return;
//         }

//         if (
//           error.response?.status === 404 ||
//           error.response?.data?.message === "Profile not found"
//         ) {
//           setProfileData(user || localUser);
//           setProfileError("");
//           return;
//         }

//         setProfileData(user || localUser);
//         setProfileError("Failed to load profile data");
//       } finally {
//         setProfileLoading(false);
//       }
//     }

//     fetchProfile();
//   }, [navigate, user, authLoading]);

//   async function handleLogout() {
//     await logoutUser();
//     navigate("/login", { replace: true });
//   }

//   const storedUser = localStorage.getItem("jobdekho_user");
//   const localUser = storedUser ? JSON.parse(storedUser) : null;

//   const currentUser = profileData || user || localUser;

//   const userName = useMemo(
//     () => currentUser?.name || currentUser?.user?.name || "User",
//     [currentUser]
//   );

//   const userInitials = useMemo(() => {
//     if (!userName) return "U";

//     return userName
//       .split(" ")
//       .map((part) => part.charAt(0))
//       .join("")
//       .slice(0, 2)
//       .toUpperCase();
//   }, [userName]);

//   const commonProps = {
//     profileData: profileData || currentUser,
//     isEditing,
//     setIsEditing,
//   };

//   const renderActiveTab = () => {
//     switch (activeTab) {
//       case "experience":
//         return <WorkExperience {...commonProps} />;
//       case "education":
//         return <Education {...commonProps} />;
//       case "certifications":
//         return <Certifications {...commonProps} />;
//       case "resume":
//         return <Resume {...commonProps} />;
//       case "settings":
//         return <SettingsSection {...commonProps} />;
//       default:
//         return <PersonalInformation user={currentUser} {...commonProps} />;
//     }
//   };

//   if (authLoading || profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-orange-50">
//         <p className="text-lg font-semibold text-orange-600">
//           Loading profile...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-[#fff3e6] px-4 py-8 sm:px-6 lg:px-10">
//       <div className="mx-auto max-w-7xl space-y-6">
//         {profileError && (
//           <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
//             {profileError}
//           </div>
//         )}

//         <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-2xl">
//           <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//             <div className="space-y-3">
//               <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
//                 Profile Dashboard
//               </p>

//               <h1 className="text-4xl font-extrabold text-gray-900">
//                 Welcome back, {userName}
//               </h1>

//               <p className="max-w-2xl text-gray-600">
//                 Manage your career profile, experience, education,
//                 certifications, resume, and account settings from one polished
//                 dashboard.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleLogout}
//               className="inline-flex items-center justify-center rounded-3xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
//           <ProfileSidebar
//             activeTab={activeTab}
//             setActiveTab={setActiveTab}
//             userName={userName}
//             userInitials={userInitials}
//           />

//           <main className="space-y-6">
//             <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-2xl">
//               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//                 <div>
//                   <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
//                     {tabTitles[activeTab]}
//                   </p>

//                   <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
//                     {tabTitles[activeTab]} Dashboard
//                   </h2>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setIsEditing(true)}
//                   disabled={isEditing}
//                   className={`inline-flex items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold transition ${
//                     isEditing
//                       ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                       : "bg-orange-500 text-white hover:bg-orange-600"
//                   }`}
//                 >
//                   {isEditing ? "Editing..." : "Edit"}
//                 </button>
//               </div>
//             </div>

//             <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-2xl">
//               {renderActiveTab()}
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Profile;