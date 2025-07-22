"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";
import apiClient from "@/services/api";
import Button from "@/components/Button";

export default function ProfileSetupPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    gender: user?.gender || "",
    date_of_birth: user?.date_of_birth || "",
    phone_number: user?.phone_number || "",
    country: user?.country || "",
    city: user?.city || "",
    known_conditions: Array.isArray(user?.known_conditions) ? user?.known_conditions : [],
    allergies: Array.isArray(user?.allergies) ? user?.allergies : [],
    medication: Array.isArray(user?.medication) ? user?.medication : [],
    privacy_consent: user?.privacy_consent || false,
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const countrySuggestions = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "India", "China", "Japan", "South Africa", "Ethiopia", "Brazil", "Mexico", "Italy", "Spain"
  ];
  const conditionSuggestions = [
    "Diabetes", "Venous Insufficiency", "Pressure Ulcer", "Arterial Ulcer", "Burn", "Surgical Wound", "Trauma", "Infection", "Cancer", "Neuropathy"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (name: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [name]: value.split(",").map(v => v.trim()).filter(Boolean),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let profilePicUrl = user?.profile_pic || "";
      if (profilePic) {
        const formData = new FormData();
        formData.append("image", profilePic);
        const uploadRes = await apiClient.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Upload response:", uploadRes.data);
        profilePicUrl = uploadRes.data.url;
      }
      const payload = {
        ...form,
        profile_pic: profilePicUrl,
      };
      console.log("Submitting profile data:", payload);
      const res = await apiClient.put("/users/me", payload);
      console.log("Profile update response:", res.data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4">
      <form className="bg-white p-10 rounded-2xl shadow-2xl max-w-xl w-full border border-gray-100" onSubmit={handleSubmit}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold mb-2 text-indigo-700">Finish Setting Up Your Account</h1>
          <p className="text-gray-500 text-sm">Complete your profile to unlock all features.</p>
        </div>
        <div className="mb-6 flex flex-col items-center">
          <label className="block text-sm font-medium mb-2 text-gray-700">Profile Picture</label>
          <div className="relative mb-2">
            <div className="h-28 w-28 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
              {profilePic ? (
                <img src={URL.createObjectURL(profilePic)} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl text-indigo-300">👤</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2 text-xs" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" required>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Date of Birth</label>
          <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Phone Number</label>
          <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Country</label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            required
            list="country-list"
          />
          <datalist id="country-list">
            {countrySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">City</label>
          <input name="city" value={form.city} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Known Conditions <span className="font-normal text-xs text-gray-400">(comma separated)</span></label>
          <input
            name="known_conditions"
            value={form.known_conditions.join(", ")}
            onChange={e => handleArrayChange("known_conditions", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            list="condition-list"
          />
          <datalist id="condition-list">
            {conditionSuggestions.map((cond) => (
              <option key={cond} value={cond} />
            ))}
          </datalist>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Allergies <span className="font-normal text-xs text-gray-400">(comma separated)</span></label>
          <input name="allergies" value={form.allergies.join(", ")} onChange={e => handleArrayChange("allergies", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Medication <span className="font-normal text-xs text-gray-400">(comma separated)</span></label>
          <input name="medication" value={form.medication.join(", ")} onChange={e => handleArrayChange("medication", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" />
        </div>
        <div className="mb-6 flex items-center">
          <input name="privacy_consent" type="checkbox" checked={form.privacy_consent} onChange={handleChange} className="mr-2 accent-indigo-600" required />
          <label className="text-sm text-gray-700">I consent to the privacy policy</label>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full py-3 text-lg rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white font-bold shadow">
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
