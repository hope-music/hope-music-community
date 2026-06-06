"use client";

import { useState, useEffect } from "react";

interface CooperationSubmission {
  id: number;
  name: string;
  gender: string;
  country: string;
  phone: string;
  email: string;
  socialMedia?: string;
  musicCategory: string;
  message?: string;
  createdAt: string;
}

interface BusinessSubmission {
  id: number;
  name: string;
  country: string;
  phone: string;
  email: string;
  projectType: string;
  message: string;
  createdAt: string;
}

export default function AdminCooperationPage() {
  const [cooperationSubmissions, setCooperationSubmissions] = useState<CooperationSubmission[]>([]);
  const [businessSubmissions, setBusinessSubmissions] = useState<BusinessSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<"cooperation" | "business">("cooperation");
  const [selectedItem, setSelectedItem] = useState<CooperationSubmission | BusinessSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    setIsLoading(true);
    try {
      const cooperation = JSON.parse(localStorage.getItem("cooperation_submissions") || "[]");
      const business = JSON.parse(localStorage.getItem("business_cooperation_submissions") || "[]");
      setCooperationSubmissions(cooperation);
      setBusinessSubmissions(business);
    } catch (e) {
    }
    setIsLoading(false);
  };

  const handleDelete = (id: number, type: "cooperation" | "business") => {
    if (!confirm("Delete this submission?")) return;

    const key = type === "cooperation" ? "cooperation_submissions" : "business_cooperation_submissions";
    const submissions = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = submissions.filter((s: any) => s.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));

    if (type === "cooperation") {
      setCooperationSubmissions(filtered);
    } else {
      setBusinessSubmissions(filtered);
    }
    setSelectedItem(null);
  };

  const handleDeleteAll = (type: "cooperation" | "business") => {
    if (!confirm(`Delete all ${type} submissions?`)) return;

    const key = type === "cooperation" ? "cooperation_submissions" : "business_cooperation_submissions";
    localStorage.setItem(key, "[]");

    if (type === "cooperation") {
      setCooperationSubmissions([]);
    } else {
      setBusinessSubmissions([]);
    }
    setSelectedItem(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      US: "United States", UK: "United Kingdom", CA: "Canada", AU: "Australia",
      DE: "Germany", FR: "France", JP: "Japan", KR: "South Korea", CN: "China",
      TW: "Taiwan", HK: "Hong Kong", SG: "Singapore", MY: "Malaysia", TH: "Thailand",
      VN: "Vietnam", PH: "Philippines", IN: "India", BR: "Brazil", MX: "Mexico",
      AR: "Argentina",
    };
    return countries[code] || code;
  };

  const getMusicCategoryName = (value: string) => {
    const categories: Record<string, string> = {
      singer: "Singer", piano: "Piano", guitar: "Guitar", drums: "Drums",
      violin: "Violin", saxophone: "Saxophone", trumpet: "Trumpet", producer: "Producer",
      songwriter: "Songwriter", arranger: "Arranger", mixing: "Mixing Engineer",
      vocalist: "Vocalist", conductor: "Conductor", band: "Band/Group", other: "Other",
    };
    return categories[value] || value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cooperation Submissions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage cooperation submissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{cooperationSubmissions.length}</div>
          <div className="text-sm text-gray-500">Musical Performance Team</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{businessSubmissions.length}</div>
          <div className="text-sm text-gray-500">Business Cooperation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => { setActiveTab("cooperation"); setSelectedItem(null); }}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "cooperation"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Musical Team ({cooperationSubmissions.length})
        </button>
        <button
          onClick={() => { setActiveTab("business"); setSelectedItem(null); }}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "business"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Business Cooperation ({businessSubmissions.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="font-medium text-gray-900">
              {activeTab === "cooperation" ? "Musical Performance Team" : "Business Cooperation"}
            </span>
            {(activeTab === "cooperation" ? cooperationSubmissions : businessSubmissions).length > 0 && (
              <button
                onClick={() => handleDeleteAll(activeTab)}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Delete All
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {(activeTab === "cooperation" ? cooperationSubmissions : businessSubmissions).length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">No submissions yet</div>
            ) : (
              (activeTab === "cooperation" ? cooperationSubmissions : businessSubmissions).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                    selectedItem?.id === item.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{getCountryName(item.country)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-1">{item.email}</div>
                  {activeTab === "cooperation" && (item as CooperationSubmission).musicCategory && (
                    <div className="text-xs text-gray-400 mt-1">
                      Category: {getMusicCategoryName((item as CooperationSubmission).musicCategory)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="font-medium text-gray-900">Details</span>
          </div>
          <div className="p-4">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Country</label>
                    <p className="mt-1 text-sm text-gray-900">{getCountryName(selectedItem.country)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.phone}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.email}</p>
                  </div>
                </div>

                {activeTab === "cooperation" && (selectedItem as CooperationSubmission).gender && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Gender</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{(selectedItem as CooperationSubmission).gender}</p>
                  </div>
                )}

                {activeTab === "cooperation" && (selectedItem as CooperationSubmission).musicCategory && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Music Category</label>
                    <p className="mt-1 text-sm text-gray-900">{getMusicCategoryName((selectedItem as CooperationSubmission).musicCategory)}</p>
                  </div>
                )}

                {activeTab === "business" && (selectedItem as BusinessSubmission).projectType && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Project Type</label>
                    <p className="mt-1 text-sm text-gray-900">{(selectedItem as BusinessSubmission).projectType}</p>
                  </div>
                )}

                {activeTab === "cooperation" && (selectedItem as CooperationSubmission).socialMedia && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Social Media</label>
                    <p className="mt-1 text-sm text-gray-900">{(selectedItem as CooperationSubmission).socialMedia}</p>
                  </div>
                )}

                {selectedItem.message && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Message</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedItem.message}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500">Submitted</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedItem.createdAt)}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 flex gap-2">
                  <a
                    href={`mailto:${selectedItem.email}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleDelete(selectedItem.id, activeTab)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Select a submission to view details</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
