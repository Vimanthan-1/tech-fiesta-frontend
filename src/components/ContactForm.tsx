"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mail, Send, CheckCircle, User, MessageSquare, Tag } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) tempErrors.subject = "Subject is required";
    if (!formData.message.trim()) {
      tempErrors.message = "Message cannot be empty";
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = "Message should be at least 10 characters long";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!db) {
        console.warn("Firebase is not configured. Mocking contact message submission.");
      } else {
        // Add document to contact_messages collection in Firestore
        await addDoc(collection(db, "contact_messages"), {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          createdAt: Timestamp.now(),
          status: "unread",
        });
      }

      toast.success("Your message has been sent successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact message:", error);
      toast.error("Failed to send message. Please try again or contact support directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Visual cyber elements */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/50 pointer-events-none" />

      <h3 className="text-2xl font-bold text-white mb-6 flex items-center font-[family-name:var(--font-bebas-neue)] tracking-wider">
        <Mail className="w-6 h-6 mr-3 text-red-500 flex-shrink-0 animate-pulse" />
        <span>TRANSMIT MESSAGE</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
            <User className="w-4 h-4 mr-2 text-red-400" /> Full Name *
          </label>
          <input
            type="text"
            placeholder="Spartan Soldier"
            className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300 ${
              errors.name ? "border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.15)]" : "border-white/20"
            }`}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
            <Mail className="w-4 h-4 mr-2 text-red-400" /> Email Address *
          </label>
          <input
            type="email"
            placeholder="soldier@odyssey.com"
            className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300 ${
              errors.email ? "border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.15)]" : "border-white/20"
            }`}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-red-400" /> Subject *
          </label>
          <input
            type="text"
            placeholder="Inquiry about Cyber Arena event"
            className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300 ${
              errors.subject ? "border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.15)]" : "border-white/20"
            }`}
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
          />
          {errors.subject && <p className="text-red-400 text-xs mt-1.5">{errors.subject}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-red-400" /> Message *
          </label>
          <textarea
            rows={5}
            placeholder="State your transmission here..."
            className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300 resize-none ${
              errors.message ? "border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.15)]" : "border-white/20"
            }`}
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
          />
          {errors.message && <p className="text-red-400 text-xs mt-1.5">{errors.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-[0_4px_12px_rgba(220,38,38,0.2)] hover:shadow-[0_4px_16px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Transmitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Transmit Signature
            </>
          )}
        </button>
      </form>
    </div>
  );
}
