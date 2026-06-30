import {
  Award,
  Briefcase,
  FileText,
  GraduationCap,
  User,
} from "lucide-react";

const sidebarItems = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "experience", label: "Work Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "resume", label: "Resume", icon: FileText },
];

export default function ProfileSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="relative z-0 w-full self-start rounded-[2rem] border border-orange-100 bg-white p-6 shadow-2xl xl:sticky xl:top-6">
      <div className="space-y-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition duration-200 ${
                active
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                <Icon size={18} />
              </span>

              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}