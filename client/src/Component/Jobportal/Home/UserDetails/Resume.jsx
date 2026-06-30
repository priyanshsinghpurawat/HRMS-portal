import { Download, Eye, Upload, Trash2, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfileApi,
  uploadResumeApi, 
  deleteResumeApi,
} from "./ProfileApi";
import { useUserProfile } from "../../../Context/UserProfileContext"

function Resume() {
  const { updateProfileSection, refreshProfile } = useUserProfile();

  const [resumeName, setResumeName] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchResume();
  }, []);

  async function fetchResume() {
    try {
      const { data } = await getProfileApi();
      const profileData = data?.data || data?.profile || data;

      // FIX: Check resume object structure properly
      const resumeObj = profileData?.resume;
      
      if (resumeObj) {
        // Resume exists - extract URL and name
        const url = resumeObj.url || resumeObj.resumeUrl || resumeObj.secure_url || "";
        const name = resumeObj.filename || resumeObj.resumeName || resumeObj.public_id || "resume.pdf";
        
        setResumeUrl(url);
        setResumeName(name);
      } else {
        setResumeUrl("");
        setResumeName("");
      }
    } catch (error) {
    }
  }

  async function handleResumeUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const { response, data } = await uploadResumeApi(file);

      if (!response.ok) {
        alert(data?.message || "Resume upload failed");
        return;
      }

      const resumeData = data?.data || data?.resume || data;
      
      const newResumeUrl = resumeData?.url || resumeData?.resumeUrl || "";
      const newResumeName = resumeData?.filename || resumeData?.resumeName || file.name;

      setResumeName(newResumeName);
      setResumeUrl(newResumeUrl);

      // SYNC WITH GLOBAL CONTEXT
      updateProfileSection('resume', { 
        url: newResumeUrl, 
        filename: newResumeName,
        public_id: resumeData?.public_id || ""
      });
      refreshProfile();

      alert("Resume uploaded successfully! You can now start applying.");
    } catch (error) {
      alert("Resume upload failed");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  async function handleDeleteResume() {
    if (!resumeUrl) {
      alert("No resume available");
      return;
    }

    try {
      setDeleteLoading(true);
      const { response, data } = await deleteResumeApi();

      if (!response.ok) {
        alert(data?.message || "Resume delete failed");
        return;
      }

      setResumeName("");
      setResumeUrl("");

      // SYNC WITH GLOBAL CONTEXT
      updateProfileSection('resume', null);
      refreshProfile();

      alert("Resume deleted successfully");
    } catch (error) {
      alert("Resume delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleViewResume() {
    if (!resumeUrl) {
      alert("No resume available");
      return;
    }
    window.open(resumeUrl, "_blank");
  }

  async function handleDownloadResume() {
    if (!resumeUrl) {
      alert("No resume available");
      return;
    }

    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = resumeName || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("Resume download failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Resume Center</h3>
            <p className="mt-2 text-gray-600">Upload your latest resume for recruiters and employers to view.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-3xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100">
              <Upload size={18} />
              {loading ? "Uploading..." : "Upload Resume"}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={loading} />
            </label>
            <button type="button" onClick={handleDownloadResume} disabled={!resumeUrl} className="inline-flex items-center gap-2 rounded-3xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">
              <Download size={18} /> Download
            </button>
            <button type="button" onClick={handleDeleteResume} disabled={deleteLoading || !resumeUrl} className="inline-flex items-center gap-2 rounded-3xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
              <Trash2 size={18} /> {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50 p-5">
            <p className="text-sm text-gray-500">Resume Status</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {resumeUrl ? "Uploaded & Ready" : "Not uploaded"}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5">
            <p className="text-sm text-gray-500">Current File</p>
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-words text-lg font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-all">
                {resumeName || "View my resume"}
              </a>
            ) : (
              <p className="mt-2 break-words text-lg font-semibold text-gray-900">No resume available</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleViewResume} disabled={!resumeUrl} className="inline-flex items-center gap-2 rounded-3xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <Eye size={18} /> View Resume
            </button>
            {resumeUrl && (
              <button type="button" onClick={() => navigate("/jobportal/alljobs")} className="inline-flex items-center gap-2 rounded-3xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 shadow-md shadow-green-600/20">
                <Briefcase size={18} /> Browse Jobs to Apply
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">Recommended formats: PDF, DOCX (Max 5MB)</p>
        </div>
      </div>
    </div>
  );
}

export default Resume;