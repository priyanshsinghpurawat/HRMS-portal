import { useState, useEffect } from "react";
import {
  addEducationApi,
  updateEducationApi,
  deleteEducationApi,
} from "../../../Api";
import { useUserProfile } from "../../../Context/UserProfileContext";

const emptyForm = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  educationLevel: "high-school",
  startDate: "",
  endDate: "",
  currentlyStudying: false,
  grade: "",
};

const convertToISO = (date) => {
  return new Date(date).toISOString();
};

function Education() {
  const { profileData, updateProfileSection } = useUserProfile();

  const [educationList, setEducationList] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Load from global context on mount
  useEffect(() => {
    if (profileData?.education?.length > 0) {
      setEducationList(profileData.education);
    }
  }, [profileData?.education]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.institution.trim() === "" ||
      formData.degree.trim() === "" ||
      formData.fieldOfStudy.trim() === "" ||
      formData.educationLevel.trim() === "" ||
      formData.startDate.trim() === "" ||
      formData.endDate.trim() === "" ||
      formData.grade.trim() === ""
    ) {
      setMessage("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        institution: formData.institution.trim(),
        degree: formData.degree.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim(),
        educationLevel: formData.educationLevel,
        startDate: convertToISO(formData.startDate),
        endDate: convertToISO(formData.endDate),
        currentlyStudying: formData.currentlyStudying,
        grade: formData.grade.trim(),
      };

      // Check for duplicate (same institution + degree)
      const existingEdu = educationList.find(
        edu => edu.institution?.toLowerCase() === payload.institution.toLowerCase() && 
               edu.degree?.toLowerCase() === payload.degree.toLowerCase()
      );

      let result;
      if (existingEdu && !editingId) {
        // Update existing to avoid MongoDB duplicate key error
        result = await updateEducationApi(existingEdu._id, payload);
      } else {
        result = editingId
          ? await updateEducationApi(editingId, payload)
          : await addEducationApi(payload);
      }

      if (result.response.ok) {
        const savedEducation = result.data?.data || {
          ...payload,
          _id: editingId || existingEdu?._id || `edu_${Date.now()}`,
        };

        let newList;
        if (editingId) {
          newList = educationList.map((item) =>
            item._id === editingId ? { ...item, ...savedEducation } : item
          );
          setMessage("Education updated successfully");
        } else if (existingEdu && !editingId) {
          newList = educationList.map((item) =>
            item._id === existingEdu._id ? { ...item, ...savedEducation } : item
          );
          setMessage("Education updated successfully");
        } else {
          newList = [...educationList, savedEducation];
          setMessage("Education added successfully");
        }

        setEducationList(newList);
        // Update global context (which also stores in localStorage)
        updateProfileSection('education', newList);
        resetForm();
      } else {
        // Handle MongoDB duplicate key error
        if (result.data?.message?.includes('E11000') || result.data?.message?.includes('duplicate')) {
          setMessage("This education entry already exists. Please use a different institution or degree.");
        } else {
          setMessage(result.data?.message || "Failed to save education");
        }
      }
    } catch (error) {
      console.error("Education Submit Error:", error);
      setMessage("Something went wrong");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setMessage("");
    setFormData({
      institution: item.institution || "",
      degree: item.degree || "",
      fieldOfStudy: item.fieldOfStudy || "",
      educationLevel: item.educationLevel || "high-school",
      startDate: item.startDate?.slice(0, 10) || "",
      endDate: item.endDate?.slice(0, 10) || "",
      currentlyStudying: item.currentlyStudying || false,
      grade: item.grade || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const { response, data } = await deleteEducationApi(id);
      if (response.ok) {
        const newList = educationList.filter((item) => item._id !== id);
        setEducationList(newList);
        updateProfileSection('education', newList);
        setMessage("Education deleted successfully");
      } else {
        setMessage(data?.message || "Failed to delete education");
      }
    } catch (error) {
      console.error("Education Delete Error:", error);
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Institution *</label>
          <input name="institution" value={formData.institution} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Degree *</label>
          <input name="degree" value={formData.degree} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Field Of Study *</label>
          <input name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Education Level *</label>
          <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full rounded-xl border p-3">
            <option value="high-school">High School</option>
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor</option>
            <option value="master">Master</option>
            <option value="phd">PhD</option>
            <option value="certification">Certification</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Start Date *</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">End Date *</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <label className="flex items-center gap-3 pt-8 font-semibold text-gray-700">
          <input type="checkbox" name="currentlyStudying" checked={formData.currentlyStudying} onChange={handleChange} />
          Currently Studying
        </label>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Grade *</label>
          <input name="grade" value={formData.grade} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <button type="submit" className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">
          {editingId ? "Update Education" : "Add Education"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="rounded-xl bg-gray-300 px-5 py-3 font-semibold">Cancel</button>
        )}
      </form>

      {message && (
        <p className={`rounded-xl border p-3 font-semibold ${message.includes('already exists') || message.includes('duplicate') ? 'border-red-200 bg-red-50 text-red-700' : 'border-orange-200 bg-orange-50 text-orange-700'}`}>
          {message}
        </p>
      )}

      <div className="space-y-4">
        {educationList.map((item) => (
          <div key={item._id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow">
            <h3 className="text-xl font-bold text-gray-900">{item.degree}</h3>
            <p className="font-semibold text-orange-600">{item.institution}</p>
            <p className="text-gray-700">{item.fieldOfStudy}</p>
            <p className="text-sm text-gray-600">{item.educationLevel} | {item.startDate?.slice(0, 10)} - {item.currentlyStudying ? "Present" : item.endDate?.slice(0, 10)}</p>
            <p className="mt-2 text-gray-700">{item.grade}</p>
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

export default Education;