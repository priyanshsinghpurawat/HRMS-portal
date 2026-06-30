import { useEffect, useState } from "react";
import {
  addCertificationApi,
  updateCertificationApi,
  deleteCertificationApi,
} from "../../../Api";
import { useUserProfile } from "../../../Context/UserProfileContext";

const emptyForm = {
  certificationName: "",
  issuingOrganization: "",
  issueDate: "",
  expirationDate: "",
  doesNotExpire: false,
  credentialId: "",
  credentialUrl: "",
  description: "",
  certificate: null,
};

export default function Certifications() {
  const { profileData, updateProfileSection } = useUserProfile();

  const [formData, setFormData] = useState(emptyForm);
  const [certifications, setCertifications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profileData?.certifications?.length > 0) {
      setCertifications(profileData.certifications);
    }
  }, [profileData?.certifications]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      ...(name === "doesNotExpire" && checked ? { expirationDate: "" } : {}),
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const makeApiFormData = () => {
    const apiFormData = new FormData();
    apiFormData.append("certificationName", formData.certificationName.trim());
    apiFormData.append("issuingOrganization", formData.issuingOrganization.trim());
    apiFormData.append("issueDate", formData.issueDate);
    apiFormData.append("doesNotExpire", String(formData.doesNotExpire));
    if (!formData.doesNotExpire) apiFormData.append("expirationDate", formData.expirationDate);
    if (formData.credentialId.trim()) apiFormData.append("credentialId", formData.credentialId.trim());
    if (formData.credentialUrl.trim()) apiFormData.append("credentialUrl", formData.credentialUrl.trim());
    if (formData.description.trim()) apiFormData.append("description", formData.description.trim());
    if (formData.certificate) apiFormData.append("certificate", formData.certificate);
    return apiFormData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.certificationName.trim() === "" || formData.issuingOrganization.trim() === "" || formData.issueDate.trim() === "") {
      setMessage("Please fill all required fields");
      return;
    }

    if (!formData.doesNotExpire && formData.expirationDate.trim() === "") {
      setMessage("Please select expiration date or check Does Not Expire");
      return;
    }

    try {
      const apiFormData = makeApiFormData();
      const result = editingId
        ? await updateCertificationApi(editingId, apiFormData)
        : await addCertificationApi(apiFormData);

      if (result.response.ok) {
        const savedData = result.data?.data || {
          ...Object.fromEntries(apiFormData.entries()),
          _id: editingId || `cert_${Date.now()}`,
          certificate: formData.certificate ? { url: URL.createObjectURL(formData.certificate) } : null,
        };

        let newList;
        if (editingId) {
          newList = certifications.map((item) => (item._id === editingId ? { ...item, ...savedData } : item));
          setMessage("Certification updated successfully");
        } else {
          newList = [...certifications, savedData];
          setMessage("Certification added successfully");
        }

        setCertifications(newList);
        updateProfileSection('certifications', newList);
        resetForm();
      } else {
        setMessage(result.data?.message || "Failed to save certification");
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      certificationName: item.certificationName || "",
      issuingOrganization: item.issuingOrganization || "",
      issueDate: item.issueDate?.slice(0, 10) || "",
      expirationDate: item.expirationDate?.slice(0, 10) || "",
      doesNotExpire: item.doesNotExpire || false,
      credentialId: item.credentialId || "",
      credentialUrl: item.credentialUrl || "",
      description: item.description || "",
      certificate: null,
    });
  };

  const handleDelete = async (id) => {
    try {
      const { response, data } = await deleteCertificationApi(id);
      if (response.ok) {
        const newList = certifications.filter((item) => item._id !== id);
        setCertifications(newList);
        updateProfileSection('certifications', newList);
        setMessage("Certification deleted successfully");
      } else {
        setMessage(data?.message || "Failed to delete certification");
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Certification Name *</label>
          <input type="text" name="certificationName" value={formData.certificationName} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Issuing Organization *</label>
          <input type="text" name="issuingOrganization" value={formData.issuingOrganization} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Issue Date *</label>
          <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Expiration Date {!formData.doesNotExpire && "*"}</label>
          <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} disabled={formData.doesNotExpire} className="w-full rounded-xl border p-3 disabled:bg-gray-100" />
        </div>
        <label className="flex items-center gap-3 pt-8 font-semibold text-gray-700">
          <input type="checkbox" name="doesNotExpire" checked={formData.doesNotExpire} onChange={handleChange} />
          Does Not Expire
        </label>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Credential ID</label>
          <input type="text" name="credentialId" value={formData.credentialId} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Credential URL</label>
          <input type="url" name="credentialUrl" value={formData.credentialUrl} onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-gray-700">Certificate File</label>
          <input type="file" name="certificate" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="w-full rounded-xl border p-3" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block font-semibold text-gray-700">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="min-h-[90px] w-full rounded-xl border p-3" />
        </div>
        <button type="submit" className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">
          {editingId ? "Update Certification" : "Add Certification"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="rounded-xl bg-gray-300 px-5 py-3 font-semibold">Cancel</button>
        )}
      </form>

      {message && (
        <p className="rounded-xl border border-orange-200 bg-orange-50 p-3 font-semibold text-orange-700">{message}</p>
      )}

      <div className="space-y-4">
        {certifications.map((item) => (
          <div key={item._id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow">
            <h3 className="text-xl font-bold text-gray-900">{item.certificationName}</h3>
            <p className="font-semibold text-orange-600">{item.issuingOrganization}</p>
            <p className="text-sm text-gray-600">{item.issueDate?.slice(0, 10)} - {item.doesNotExpire ? "No Expiry" : item.expirationDate?.slice(0, 10)}</p>
            {item.credentialUrl && (
              <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="mt-2 block text-orange-600 underline">View Credential</a>
            )}
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