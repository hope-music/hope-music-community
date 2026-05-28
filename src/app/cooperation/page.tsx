"use client";

import { useState } from "react";
import Link from "next/link";

const MUSIC_CATEGORIES = [
  { value: "", label: "Select a category" },
  { value: "singer", label: "Singer" },
  { value: "piano", label: "Piano" },
  { value: "guitar", label: "Guitar" },
  { value: "drums", label: "Drums" },
  { value: "violin", label: "Violin" },
  { value: "saxophone", label: "Saxophone" },
  { value: "trumpet", label: "Trumpet" },
  { value: "producer", label: "Producer" },
  { value: "songwriter", label: "Songwriter" },
  { value: "arranger", label: "Arranger" },
  { value: "mixing", label: "Mixing Engineer" },
  { value: "vocalist", label: "Vocalist" },
  { value: "conductor", label: "Conductor" },
  { value: "band", label: "Band/Group" },
  { value: "other", label: "Other" },
];

const COUNTRIES = [
  { value: "", label: "Select a country" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "TW", label: "Taiwan" },
  { value: "HK", label: "Hong Kong" },
  { value: "SG", label: "Singapore" },
  { value: "MY", label: "Malaysia" },
  { value: "TH", label: "Thailand" },
  { value: "VN", label: "Vietnam" },
  { value: "PH", label: "Philippines" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "AR", label: "Argentina" },
  { value: "other", label: "Other" },
];

export default function CooperationPage() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    country: "",
    phone: "",
    email: "",
    socialMedia: "",
    musicCategory: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Please select gender";
    }
    
    if (!formData.country) {
      newErrors.country = "Please select country";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (!formData.musicCategory) {
      newErrors.musicCategory = "Please select a music category";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    // Save to localStorage for demo purposes
    const submissions = JSON.parse(localStorage.getItem("cooperation_submissions") || "[]");
    submissions.unshift({
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("cooperation_submissions", JSON.stringify(submissions));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      country: "",
      phone: "",
      email: "",
      socialMedia: "",
      musicCategory: "",
      message: "",
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Thank You!</h1>
          <p className="mb-8 text-lg text-gray-600">
            Your cooperation request has been submitted successfully. We will contact you soon.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-[#D96A32] px-6 py-3 font-medium text-white transition hover:bg-[#c45a28]"
            >
              Back to Home
            </Link>
            <button
              onClick={resetForm}
              className="rounded-full border-2 border-[#D96A32] px-6 py-3 font-medium text-[#D96A32] transition hover:bg-[#D96A32]/10"
            >
              Submit Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#D96A32]">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Welcome to Our Musical Performance Team
          </h1>
          <p className="text-gray-600">
            Fill out the form below and we will get back to you soon
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#D96A32]/20 ${
                  errors.name ? "border-red-500" : "border-gray-300 focus:border-[#D96A32]"
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#D96A32]"
                  />
                  <span className="text-gray-700">Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#D96A32]"
                  />
                  <span className="text-gray-700">Female</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === "other"}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#D96A32]"
                  />
                  <span className="text-gray-700">Other</span>
                </label>
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#D96A32]/20 ${
                  errors.country ? "border-red-500" : "border-gray-300 focus:border-[#D96A32]"
                } ${!formData.country ? "text-gray-400" : "text-gray-900"}`}
              >
                {COUNTRIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#D96A32]/20 ${
                  errors.phone ? "border-red-500" : "border-gray-300 focus:border-[#D96A32]"
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#D96A32]/20 ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-[#D96A32]"
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Social Media */}
            <div>
              <label htmlFor="socialMedia" className="mb-2 block text-sm font-medium text-gray-700">
                Social Media <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="socialMedia"
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleChange}
                placeholder="Instagram, YouTube, TikTok, etc."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#D96A32] focus:ring-2 focus:ring-[#D96A32]/20"
              />
            </div>

            {/* Music Category */}
            <div>
              <label htmlFor="musicCategory" className="mb-2 block text-sm font-medium text-gray-700">
                Music Category <span className="text-red-500">*</span>
              </label>
              <select
                id="musicCategory"
                name="musicCategory"
                value={formData.musicCategory}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#D96A32]/20 ${
                  errors.musicCategory ? "border-red-500" : "border-gray-300 focus:border-[#D96A32]"
                } ${!formData.musicCategory ? "text-gray-400" : "text-gray-900"}`}
              >
                {MUSIC_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.musicCategory && <p className="mt-1 text-sm text-red-500">{errors.musicCategory}</p>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                Message <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about yourself and your music..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#D96A32] focus:ring-2 focus:ring-[#D96A32]/20 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#D96A32] py-4 text-base font-medium text-white transition hover:bg-[#c45a28] disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
