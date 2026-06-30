import { useEffect, useMemo, useState } from "react";
import {
  getProfileApi,
  updateProfileApi,
  updateProfileImageApi,
} from "../../../Api";
import { useUserProfile } from "../../../Context/UserProfileContext";

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return (
    image.url ||
    image.secure_url ||
    image.path ||
    image.location ||
    image.profileImage ||
    ""
  );
}

function formatLocation(loc) {
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  if (typeof loc === "object") {
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    return loc.address || "";
  }
  return "";
}

function FieldDisplay({ label, value, field, type = "text", isEditing, draftData, handleChange }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50 p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      {isEditing ? (
        <div className="mt-3">
          {field === "about" ? (
            <textarea value={draftData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} rows={4} className="w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          ) : field === "gender" ? (
            <select value={draftData[field] || "male"} onChange={(e) => handleChange(field, e.target.value)} className="w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : field === "experienceLevel" ? (
            <select value={draftData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} className="w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
              <option value="">Select Level</option>
              <option value="fresher">Fresher</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5-7 years">5-7 years</option>
              <option value="7-10 years">7-10 years</option>
              <option value="10-15 years">10-15 years</option>
              <option value="15+ years">15+ years</option>
            </select>
          ) : (
            <input type={type} value={draftData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} className="w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          )}
        </div>
      ) : (
        <p className="mt-3 text-lg font-semibold text-gray-900">{value || "Not specified"}</p>
      )}
    </div>
  );
}

function SocialLinkField({ label, field, value, isEditing, draftData, handleChange }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50 p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      {isEditing ? (
        <input type="url" value={draftData[field] || ""} onChange={(e) => handleChange(field, e.target.value)} placeholder="https://..." className="mt-3 w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
      ) : (
        <p className="mt-3 break-all text-sm font-semibold text-gray-900">
          {value ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">{value}</a> : "Not specified"}
        </p>
      )}
    </div>
  );
}

export default function PersonalInformation({ user, isEditing, setIsEditing }) {
  const { updateProfileSection, refreshProfile } = useUserProfile();

  const emptyProfile = {
    userName: "",
    title: "",
    about: "",
    gender: "male",
    profileImage: "",
    language: "",
    experienceLevel: "",
    location: "",
    linkedin: "",
    github: "",
    twitter: "",
    email: "",
    skills: [],
  };

  const [profileData, setProfileData] = useState(emptyProfile);
  const [draftData, setDraftData] = useState(emptyProfile);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isEditing) {
      setDraftData(profileData);
    }
  }, [isEditing, profileData]);

  async function fetchProfile() {
    try {
      const { response, data } = await getProfileApi();

      const apiData = data?.data?.profile || data?.data || data?.profile || data;
      const apiUser = data?.data?.user || apiData?.user || user || {};

      const imageUrl = getImageUrl(
        apiData?.profileImage || apiData?.image || apiData?.avatar || apiUser?.profileImage
      );

      const initial = {
        userName: apiUser?.name || apiData?.userName || apiData?.name || user?.name || "User",
        email: apiUser?.email || apiData?.email || user?.email || "",
        title: apiData?.title || "",
        about: apiData?.about || "",
        gender: apiData?.gender || "male",
        profileImage: imageUrl,
        language: apiData?.language || "",
        experienceLevel: apiData?.experienceLevel || "",
        location: formatLocation(apiData?.location) || formatLocation(apiData?.address) || "",
        linkedin: apiData?.linkedin || apiData?.socialLinks?.linkedin || "",
        github: apiData?.github || apiData?.socialLinks?.github || "",
        twitter: apiData?.twitter || apiData?.twitterURL || apiData?.socialLinks?.twitter || "",
        skills: apiData?.skills || [], 
      };

      setProfileData(initial);
      setDraftData(initial);
      setImagePreview(initial.profileImage || "");

      if (response.ok) {
        localStorage.setItem("jobdekho_user", JSON.stringify(initial));
      }
    } catch (error) {
    }
  }

  const initials = useMemo(() => {
    return (profileData.userName || "User")
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profileData.userName]);

  function handleChange(field, value) {
    setDraftData((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    try {
      setSaving(true);

      const locationParts = draftData.location ? draftData.location.split(',') : ["", ""];
      const locationObject = {
        city: locationParts[0]?.trim() || draftData.location,
        country: locationParts[1]?.trim() || "",
        address: draftData.location
      };

      // Clean up empty skills and whitespace before sending to API
      const cleanedSkills = Array.isArray(draftData.skills) 
        ? draftData.skills.map(s => s.trim()).filter(Boolean) 
        : [];

      const payload = {
        name: draftData.userName,
        title: draftData.title,
        about: draftData.about,
        gender: draftData.gender,
        language: draftData.language,
        experienceLevel: draftData.experienceLevel,
        location: locationObject,
        linkedin: draftData.linkedin,
        github: draftData.github,
        twitter: draftData.twitter,
        skills: cleanedSkills,
      };

      const { response, data } = await updateProfileApi(payload);

      if (!response.ok) {
        alert(data?.message || "Profile update failed");
        return;
      }

      let finalImageUrl = profileData.profileImage || imagePreview;

      if (imageFile) {
        const imageResult = await updateProfileImageApi(imageFile);
        if (!imageResult.response.ok) {
          alert(imageResult.data?.message || "Image upload failed");
          return;
        }

        const imageData = imageResult.data?.data || imageResult.data?.profile || imageResult.data;
        finalImageUrl =
          getImageUrl(imageData?.profileImage) ||
          getImageUrl(imageData?.image) ||
          getImageUrl(imageData?.avatar) ||
          getImageUrl(imageData?.profile?.profileImage) ||
          getImageUrl(imageData) ||
          imagePreview;
      }

      const updatedProfile = { 
        ...draftData, 
        profileImage: finalImageUrl, 
        skills: cleanedSkills 
      };

      setProfileData(updatedProfile);
      setImagePreview(finalImageUrl);
      localStorage.setItem("jobdekho_user", JSON.stringify(updatedProfile));

      // SYNC WITH GLOBAL CONTEXT
      updateProfileSection('user', { name: draftData.userName, email: draftData.email });
      updateProfileSection('title', draftData.title);
      updateProfileSection('about', draftData.about);
      updateProfileSection('gender', draftData.gender);
      updateProfileSection('location', draftData.location);
      updateProfileSection('experienceLevel', draftData.experienceLevel);
      updateProfileSection('profileImage', finalImageUrl);
      
      if (cleanedSkills.length > 0) {
        updateProfileSection('skills', cleanedSkills);
      }

      refreshProfile();

      setImageFile(null);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      alert("Profile update failed");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraftData(profileData);
    setImagePreview(profileData.profileImage || "");
    setImageFile(null);
    setIsEditing(false);
  }

  return (
    <div className="relative z-0 space-y-4">
      <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50 p-5 shadow-sm">
        <p className="text-sm text-gray-500">Personal Information</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Profile Details</h2>
      </div>

      <div className="rounded-[2rem] border border-orange-100 bg-orange-50 p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-100" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-orange-100 text-4xl font-bold text-orange-700 ring-4 ring-orange-100">
                {initials || "U"}
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-orange-600 shadow-md ring-2 ring-orange-100 hover:bg-orange-50">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <span className="text-sm font-bold">+</span>
              </label>
            )}
          </div>
          <div className="w-full min-w-0">
            <p className="break-words text-2xl font-bold text-gray-900">{profileData.userName || "User"}</p>
            <p className="mt-1 break-words text-base text-gray-600">{profileData.email || "No email available"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldDisplay label="User" value={profileData.userName} field="userName" isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
        <FieldDisplay label="Title" value={profileData.title} field="title" isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
      </div>

      <FieldDisplay label="About" value={profileData.about} field="about" isEditing={isEditing} draftData={draftData} handleChange={handleChange} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldDisplay label="Gender" value={profileData.gender} field="gender" isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
        <FieldDisplay label="Profile Image" value={imagePreview ? "Image uploaded" : "No image"} field="profileImage" isEditing={false} draftData={draftData} handleChange={handleChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldDisplay label="Language" value={profileData.language} field="language" isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
        <FieldDisplay label="Experience Level" value={profileData.experienceLevel} field="experienceLevel" isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
      </div>

      <FieldDisplay label="Location" value={profileData.location} field="location" isEditing={isEditing} draftData={draftData} handleChange={handleChange} />

      {/* NEW SKILLS FIELD INTEGRATION */}
      <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-500">Skills</p>
        {isEditing ? (
          <div className="mt-3">
            <input 
              type="text" 
              value={(draftData.skills || []).join(',')} 
              onChange={(e) => handleChange('skills', e.target.value.split(','))} 
              placeholder="React, Node.js, MongoDB, etc."
              className="w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" 
            />
            <p className="text-xs text-gray-500 mt-2 ml-2">Separate skills with commas</p>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {profileData.skills && profileData.skills.length > 0 ? (
              profileData.skills.map((skill, idx) => (
                <span key={idx} className="bg-white border border-orange-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                  {skill.trim()}
                </span>
              ))
            ) : (
              <p className="text-lg font-semibold text-gray-900">Not specified</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-500">Social Links</p>
        <div className="mt-4 space-y-4">
          <SocialLinkField label="LinkedIn" field="linkedin" value={profileData.linkedin} isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
          <SocialLinkField label="GitHub" field="github" value={profileData.github} isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
          <SocialLinkField label="Twitter / Portfolio" field="twitter" value={profileData.twitter} isEditing={isEditing} draftData={draftData} handleChange={handleChange} />
        </div>
      </div>

      {isEditing && (
        <div className="flex flex-wrap gap-3 rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
          <button type="button" onClick={handleSave} disabled={saving} className="rounded-3xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={handleCancel} className="rounded-3xl border border-orange-300 bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}