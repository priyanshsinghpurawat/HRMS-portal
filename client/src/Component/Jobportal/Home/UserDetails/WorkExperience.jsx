import { useEffect, useState } from "react";
import {
  addExperienceApi,
  updateExperienceApi,
  deleteExperienceApi,
} from "../../../Api";
import { useUserProfile } from "../../../Context/UserProfileContext";

function WorkExperience() {
  const { profileData, updateProfileSection } = useUserProfile();

  const [experiences, setExperiences] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [formData, setFormData] = useState({
    company: "",
    title: "",
    experienceLevel: "fresher",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  });

  useEffect(() => {
    if (profileData?.experience?.length > 0) {
      setExperiences(profileData.experience);
    }
  }, [profileData?.experience]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "currentlyWorking" && checked ? { endDate: "" } : {}),
    }));
  };

  const resetForm = () => {
    setFormData({
      company: "",
      title: "",
      experienceLevel: "fresher",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    });
    setEditingId(null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.company.trim() === "" ||
      formData.title.trim() === "" ||
      formData.experienceLevel.trim() === "" ||
      formData.startDate.trim() === "" ||
      (!formData.currentlyWorking && formData.endDate.trim() === "") ||
      formData.description.trim() === ""
    ) {
      setMessageType("error");
      setMessage("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        company: formData.company.trim(),
        title: formData.title.trim(),
        experienceLevel: formData.experienceLevel,
        startDate: formData.startDate,
        endDate: formData.currentlyWorking ? "" : formData.endDate,
        currentlyWorking: formData.currentlyWorking,
        description: formData.description.trim(),
      };

      const result = editingId
        ? await updateExperienceApi(editingId, payload)
        : await addExperienceApi(payload);

      if (result.response.ok) {
        const savedData = result.data?.data || {
          ...payload,
          _id: editingId || `exp_${Date.now()}`,
        };

        let newList;
        if (editingId) {
          newList = experiences.map((item) => (item._id === editingId ? { ...item, ...savedData } : item));
          setMessageType("success");
          setMessage("Experience updated successfully");
        } else {
          newList = [...experiences, savedData];
          setMessageType("success");
          setMessage("Experience added successfully");
        }

        setExperiences(newList);
        updateProfileSection('experience', newList);
        resetForm();
      } else {
        setMessageType("error");
        setMessage(result.data?.message || "Failed to save experience");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Something went wrong");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setMessage("");
    setFormData({
      company: item.company || "",
      title: item.title || "",
      experienceLevel: item.experienceLevel || "fresher",
      startDate: item.startDate?.slice(0, 10) || "",
      endDate: item.endDate?.slice(0, 10) || "",
      currentlyWorking: item.currentlyWorking || false,
      description: item.description || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const { response, data } = await deleteExperienceApi(id);
      if (response.ok) {
        const newList = experiences.filter((item) => item._id !== id);
        setExperiences(newList);
        updateProfileSection('experience', newList);
        setMessageType("success");
        setMessage("Experience deleted successfully");
      } else {
        setMessageType("error");
        setMessage(data?.message || "Failed to delete experience");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Company Name *</label>
          <input type="text" name="company" placeholder="Enter company name" value={formData.company} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Job Title *</label>
          <input type="text" name="title" placeholder="Enter job title" value={formData.title} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Experience Level *</label>
          <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full rounded-xl border p-3">
            <option value="fresher">Fresher</option>
            <option value="0-1 years">0-1 years</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-7 years">5-7 years</option>
            <option value="7-10 years">7-10 years</option>
            <option value="10-15 years">10-15 years</option>
            <option value="15+ years">15+ years</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Start Date *</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">End Date {!formData.currentlyWorking && "*"}</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={formData.currentlyWorking} className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-gray-100" />
        </div>
        <div className="flex items-center gap-3 pt-8">
          <input type="checkbox" name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleChange} className="h-4 w-4" />
          <label className="font-semibold text-gray-700">Currently Working</label>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block font-semibold text-gray-700">Description *</label>
          <textarea name="description" placeholder="Enter work description" value={formData.description} onChange={handleChange} className="min-h-[90px] w-full rounded-xl border p-3" />
        </div>
        <button type="submit" className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">
          {editingId ? "Update Experience" : "Add Experience"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="rounded-xl bg-gray-300 px-5 py-3 font-semibold">Cancel</button>
        )}
      </form>

      {message && (
        <div className={`rounded-xl border p-3 text-sm font-semibold ${messageType === "success" ? "border-green-200 bg-green-50 text-green-600" : "border-red-200 bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {experiences.map((item) => (
          <div key={item._id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow">
            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
            <p className="font-semibold text-orange-600">{item.company}</p>
            <p className="text-sm text-gray-600">{item.experienceLevel} | {item.startDate?.slice(0, 10)} - {item.currentlyWorking ? "Present" : item.endDate?.slice(0, 10)}</p>
            <p className="mt-2 text-gray-700">{item.description}</p>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => handleEdit(item)} className="rounded-lg bg-blue-500 px-4 py-2 text-white">Edit</button>
              <button type="button" onClick={() => handleDelete(item._id)} className="rounded-lg bg-red-500 px-4 py-2 text-white">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkExperience;