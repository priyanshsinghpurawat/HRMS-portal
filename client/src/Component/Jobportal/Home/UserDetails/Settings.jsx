// import { Mail, ShieldCheck, Settings as SettingsIcon } from "lucide-react";
// import { useState } from "react";

// export default function Settings() {
//   const [emailNotifications, setEmailNotifications] = useState(true);
//   const [smsNotifications, setSmsNotifications] = useState(false);
//   const [privateProfile, setPrivateProfile] = useState(true);

//   return (
//     <div className="space-y-6">
//       <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm uppercase tracking-[0.2em] text-orange-600">Account</p>
//             <h3 className="mt-2 text-2xl font-bold text-gray-900">Change Password</h3>
//           </div>
//           <ShieldCheck size={24} className="text-orange-500" />
//         </div>
//         <p className="mt-4 text-gray-600">Update your password regularly to keep your JobDekhoo account secure.</p>
//         <div className="mt-6">
//           <button className="rounded-3xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
//             Update Password
//           </button>
//         </div>
//       </div>

//       <div className="grid gap-6 xl:grid-cols-2">
//         <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm uppercase tracking-[0.2em] text-orange-600">Notifications</p>
//               <h3 className="mt-2 text-2xl font-bold text-gray-900">Notification Settings</h3>
//             </div>
//             <Mail size={24} className="text-orange-500" />
//           </div>
//           <p className="mt-4 text-gray-600">Choose how you want JobDekhoo updates delivered.</p>
//           <div className="mt-6 space-y-4">
//             <label className="flex items-center justify-between rounded-3xl border border-orange-100 bg-orange-50 px-4 py-4">
//               <div>
//                 <p className="font-semibold text-gray-900">Email notifications</p>
//                 <p className="text-sm text-gray-500">Receive job alerts and profile updates by email.</p>
//               </div>
//               <input
//                 type="checkbox"
//                 checked={emailNotifications}
//                 onChange={() => setEmailNotifications((prev) => !prev)}
//                 className="h-5 w-5 rounded border-gray-300 text-orange-600"
//               />
//             </label>
//             <label className="flex items-center justify-between rounded-3xl border border-orange-100 bg-orange-50 px-4 py-4">
//               <div>
//                 <p className="font-semibold text-gray-900">SMS alerts</p>
//                 <p className="text-sm text-gray-500">Get urgent updates on your phone.</p>
//               </div>
//               <input
//                 type="checkbox"
//                 checked={smsNotifications}
//                 onChange={() => setSmsNotifications((prev) => !prev)}
//                 className="h-5 w-5 rounded border-gray-300 text-orange-600"
//               />
//             </label>
//           </div>
//         </div>

//         <div className="rounded-[2rem] border border-orange-100 bg-orange-50 p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm uppercase tracking-[0.2em] text-orange-600">Preferences</p>
//               <h3 className="mt-2 text-2xl font-bold text-gray-900">Account Preferences</h3>
//             </div>
//             <SettingsIcon size={24} className="text-orange-500" />
//           </div>
//           <div className="mt-6 space-y-4">
//             <label className="flex items-center justify-between rounded-3xl border border-orange-100 bg-white px-4 py-4">
//               <div>
//                 <p className="font-semibold text-gray-900">Private profile</p>
//                 <p className="text-sm text-gray-500">Limit employer visibility on your dashboard.</p>
//               </div>
//               <input
//                 type="checkbox"
//                 checked={privateProfile}
//                 onChange={() => setPrivateProfile((prev) => !prev)}
//                 className="h-5 w-5 rounded border-gray-300 text-orange-600"
//               />
//             </label>
//             <div className="rounded-3xl border border-orange-100 bg-white p-4">
//               <p className="font-semibold text-gray-900">Preferred job alerts</p>
//               <p className="mt-2 text-sm text-gray-600">Keep your job alert preferences updated to receive the most relevant opportunities.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
