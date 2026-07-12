"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Event, RegistrationFormData, TeamMember, PaymentQR, SelectedItem } from "@/types";
import { events } from "@/data/events";
import { workshops } from "@/data/workshops";
import { validateEmail, validatePhone } from "@/utils/registration"

import { CheckCircle, MapPin, Plus  } from "lucide-react";
import { submitRegistration, checkDuplicateRegistration, createPaymentOrder, verifyPayment } from "@/services/registrationService";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";  
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


import { downloadRegistrationPDF, downloadRegistrationText, downloadRegistrationJSON, RegistrationDownloadData } from "@/utils/downloadUtils";

interface RegistrationFormProps {
  selectedEvents?: SelectedItem[];
  selectedWorkshops?: SelectedItem[];
  selectedNonTechEvents?: SelectedItem[];
  onUpdateEvents?: (events: SelectedItem[]) => void;
  onUpdateWorkshops?: (workshops: SelectedItem[]) => void;
  onUpdateNonTechEvents?: (nonTechEvents: SelectedItem[]) => void;
  onClearCart?: () => void;
}

export default function RegistrationForm({
  selectedEvents = [],
  selectedWorkshops = [],
  selectedNonTechEvents = [],
  onUpdateEvents,
  onUpdateWorkshops,
  onUpdateNonTechEvents,
  onClearCart,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    department: "",
    email: "",
    whatsapp: "",
    college: "",
    year: "",
    isTeamEvent: false,
    teamSize: 1,
    teamMembers: [],
    selectedEvents: selectedEvents,
    selectedWorkshops: selectedWorkshops,
    selectedNonTechEvents: selectedNonTechEvents,
    transactionIds: {},
    hasConsented: false,
    selectedPass: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [successData, setSuccessData] = useState<{
    registrationId: string;
    formData: RegistrationFormData;
    submissionDate: string;
  } | null>(null);
   const [techFiestaPass, setTechFiestaPass] = useState(false);

  // Payment QR data - Free entry, individual QRs for each event/workshop
  const generatePaymentQRs = (): PaymentQR[] => {
    return []; // Payments disabled for now
  };

  // Get tech and non-tech events
  const techEvents = events.filter(event => event.type === "tech");
  const nonTechEvents = events.filter(event => event.type === "non-tech");

  // Check if any selected events require teams and get the maximum team size allowed
  const getTeamRequirements = () => {
    const selectedEventsWithTeamLimits = formData.selectedEvents
      .map(selectedEvent => events.find(e => e.id === selectedEvent.id))
      .filter((event): event is Event => event !== undefined && event.maxTeamSize !== undefined);

    const allTeamEvents = selectedEventsWithTeamLimits;
    
    if (allTeamEvents.length === 0) {
      return { requiresTeam: false, maxTeamSize: 1 };
    }

    // Get the minimum maxTeamSize among selected events (most restrictive)
    const maxTeamSize = Math.min(...allTeamEvents.map(event => event.maxTeamSize!));
    
    return { requiresTeam: true, maxTeamSize };
  };

  const teamRequirements = getTeamRequirements();

  useEffect(() => {
    setFormData(prev => ({ ...prev, selectedEvents }));
  }, [selectedEvents]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, selectedWorkshops }));
  }, [selectedWorkshops]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, selectedNonTechEvents }));
  }, [selectedNonTechEvents]);

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      isTeamEvent: teamRequirements.requiresTeam,
      // Adjust team size if it exceeds the new limit
      teamSize: teamRequirements.requiresTeam 
        ? Math.min(prev.teamSize || 1, teamRequirements.maxTeamSize)
        : 1,
      // Remove excess team members if team size is reduced
      teamMembers: teamRequirements.requiresTeam && prev.teamMembers
        ? prev.teamMembers.slice(0, Math.max(0, teamRequirements.maxTeamSize - 1))
        : []
    }));
  }, [teamRequirements.requiresTeam, teamRequirements.maxTeamSize]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventSelection = (eventId: number, type: "event" | "workshop" | "non-tech") => {
    if (type === "event") {
      const event = techEvents.find(e => e.id === eventId);
      if (!event) return;
      
      const isSelected = formData.selectedEvents.some(item => item.id === eventId);
      const newSelection = isSelected
        ? formData.selectedEvents.filter(item => item.id !== eventId)
        : [...formData.selectedEvents, { id: event.id, title: event.title }];
      setFormData(prev => ({ ...prev, selectedEvents: newSelection }));
      onUpdateEvents?.(newSelection);
    } else if (type === "workshop") {
      const workshop = workshops.find(w => w.id === eventId);
      if (!workshop) return;
      
      const isSelected = formData.selectedWorkshops.some(item => item.id === eventId);
      const newSelection = isSelected
        ? formData.selectedWorkshops.filter(item => item.id !== eventId)
        : [...formData.selectedWorkshops, { id: workshop.id, title: workshop.title }];
      setFormData(prev => ({ ...prev, selectedWorkshops: newSelection }));
      onUpdateWorkshops?.(newSelection);
    } else {
      const event = nonTechEvents.find(e => e.id === eventId);
      if (!event) return;
      
      const isSelected = formData.selectedNonTechEvents.some(item => item.id === eventId);
      const newSelection = isSelected
        ? formData.selectedNonTechEvents.filter(item => item.id !== eventId)
        : [...formData.selectedNonTechEvents, { id: event.id, title: event.title }];
      setFormData(prev => ({ ...prev, selectedNonTechEvents: newSelection }));
      onUpdateNonTechEvents?.(newSelection);
    }
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...(formData.teamMembers || [])];
    if (!updatedMembers[index]) {
      updatedMembers[index] = { name: "", department: "", year: "", email: "", whatsapp: "" };
    }
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
  };

  const addTeamMember = () => {
    const currentTeamSize = formData.teamSize || 1;
    const maxAllowedSize = teamRequirements.maxTeamSize;
    
    if (currentTeamSize >= maxAllowedSize) {
      toast.error(`Maximum team size for selected events is ${maxAllowedSize} members.`, { duration: 4000 });
      return;
    }
    
    const newMember: TeamMember = { name: "", department: "", year: "", email: "", whatsapp: "" };
    setFormData(prev => ({
      ...prev,
      teamMembers: [...(prev.teamMembers || []), newMember],
      teamSize: (prev.teamSize || 1) + 1
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: (prev.teamMembers || []).filter((_, i) => i !== index),
      teamSize: Math.max(1, (prev.teamSize || 1) - 1)
    }));
  };

  const getRequiredQRs = () => {
    return []; // Payments disabled
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Basic validations
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp number is required";
    else if (!validatePhone(formData.whatsapp)) newErrors.whatsapp = "Invalid phone number format";
    if (!formData.college.trim()) newErrors.college = "College name is required";
    if (!formData.year) newErrors.year = "Year of study is required";
      
    // Team member validation
    if (formData.isTeamEvent && formData.teamMembers) {
      const currentTeamSize = formData.teamSize || 1;
      if (currentTeamSize > teamRequirements.maxTeamSize) {
        newErrors.teamSize = `Team size cannot exceed ${teamRequirements.maxTeamSize} members for selected events`;
      }
      
      formData.teamMembers.forEach((member, index) => {
        if (!member.name.trim()) newErrors[`team_${index}_name`] = `Team member ${index + 2} name is required`;
        if (!member.email.trim()) newErrors[`team_${index}_email`] = `Team member ${index + 2} email is required`;
        else if (!validateEmail(member.email)) newErrors[`team_${index}_email`] = `Invalid email for team member ${index + 2}`;
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hasConsented) {
      toast.error("Please consent to the terms and conditions");
      return;
    }
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      setIsCheckingDuplicates(true);
      const duplicateCheck = await checkDuplicateRegistration(
        formData.email,
        formData.whatsapp,
      );
      
      setIsCheckingDuplicates(false);
      
      if (duplicateCheck.exists) {
        toast.error(
          `Registration already exists with the same ${duplicateCheck.duplicateFields.join(', ')}. Please use different details.`,
          { duration: 6000 }
        );
        setIsSubmitting(false);
        return;
      }
      
      const result = await submitRegistration(formData);
      
      if (result.success) {
        if (result.requiresPayment) {
          toast.loading("Initiating secure payment gateway...", { id: "payment-toast" });
          
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            toast.error("Failed to load Razorpay SDK. Please check your internet connection.", { id: "payment-toast" });
            setIsSubmitting(false);
            return;
          }
          
          const orderResponse = await createPaymentOrder(formData, result.amount || 0);
          if (!orderResponse.success || !orderResponse.data) {
            toast.error(orderResponse.message || "Failed to create payment order", { id: "payment-toast" });
            setIsSubmitting(false);
            return;
          }
          
          const { orderId, amount, currency, key } = orderResponse.data;
          
          toast.dismiss("payment-toast");
          
          // Determine whether we need the cross-domain payment bridge
          const isVerifiedDomain = 
            typeof window !== "undefined" && 
            (window.location.hostname === "tech-fiesta-frontend.vercel.app" || 
             window.location.hostname === "localhost" || 
             window.location.hostname === "127.0.0.1");

          if (!isVerifiedDomain) {
            toast.loading("Redirecting to secure payment bridge...", { id: "payment-toast" });
            
            const targetOrigin = "https://tech-fiesta-frontend.vercel.app";
            const payUrl = `${targetOrigin}/pay?key=${encodeURIComponent(key)}&orderId=${encodeURIComponent(orderId)}&amount=${amount}&currency=${currency}&name=${encodeURIComponent("Tech Fiesta 2026")}&description=${encodeURIComponent("Registration Fee")}&prefill_name=${encodeURIComponent(formData.name)}&prefill_email=${encodeURIComponent(formData.email)}&prefill_contact=${encodeURIComponent(formData.whatsapp)}&theme_color=${encodeURIComponent("#DC2626")}&college=${encodeURIComponent(formData.college)}&department=${encodeURIComponent(formData.department)}&origin=${encodeURIComponent(window.location.origin)}`;

            toast.dismiss("payment-toast");

            // Open secure payment popup
            const popup = window.open(payUrl, "Razorpay Secure Payment", "width=550,height=750,status=no,titlebar=no,menubar=no");
            
            if (!popup || popup.closed || typeof popup.closed === "undefined") {
              // Popup blocker active
              toast.error(
                "Payment window was blocked by your browser. Please click the button below to complete your payment.",
                { id: "payment-toast", duration: 10000 }
              );
              
              const overlay = document.createElement("div");
              overlay.id = "payment-popup-overlay";
              overlay.className = "fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4";
              overlay.innerHTML = `
                <div class="bg-black border border-red-500/30 p-6 rounded-2xl max-w-sm w-full text-center font-mono">
                  <h3 class="text-white text-lg font-bold mb-4">// POPUP BLOCKED</h3>
                  <p class="text-gray-400 text-sm mb-6">Your browser blocked the secure payment window. Please click below to open it manually.</p>
                  <a href="${payUrl}" target="_blank" id="pay-popup-trigger-btn" class="inline-block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold uppercase transition-all duration-300">
                    Open Payment Window
                  </a>
                  <button id="pay-popup-cancel-btn" class="mt-4 text-gray-500 hover:text-gray-400 text-xs uppercase tracking-wider block mx-auto">
                    Cancel
                  </button>
                </div>
              `;
              document.body.appendChild(overlay);

              const triggerBtn = document.getElementById("pay-popup-trigger-btn");
              const cancelBtn = document.getElementById("pay-popup-cancel-btn");

              if (triggerBtn) {
                triggerBtn.addEventListener("click", () => {
                  overlay.remove();
                  setIsSubmitting(true);
                  toast.loading("Verifying payment window...", { id: "payment-toast" });
                });
              }
              if (cancelBtn) {
                cancelBtn.addEventListener("click", () => {
                  overlay.remove();
                  setIsSubmitting(false);
                  toast.error("Payment cancelled.");
                });
              }
            }

            // Listen for message from the popup
            const messageHandler = async function (event: MessageEvent) {
              if (event.origin !== targetOrigin) return;
              
              if (event.data.type === "payment.success") {
                window.removeEventListener("message", messageHandler);
                setIsSubmitting(true);
                toast.loading("Verifying payment transaction...", { id: "verification-toast" });
                
                try {
                  const verificationResult = await verifyPayment({
                    razorpay_order_id: event.data.data.razorpay_order_id,
                    razorpay_payment_id: event.data.data.razorpay_payment_id,
                    razorpay_signature: event.data.data.razorpay_signature,
                    registrationData: formData,
                  });
                  
                  toast.dismiss("verification-toast");
                  
                  if (verificationResult.success && verificationResult.data) {
                    const eventCount = formData.selectedEvents.length + formData.selectedWorkshops.length + formData.selectedNonTechEvents.length;
                    
                    setSuccessData({
                      registrationId: verificationResult.data.registrationId,
                      formData: { ...formData },
                      submissionDate: new Date().toLocaleString()
                    });
                    
                    toast.success(
                      `Payment verified & registered! Events: ${eventCount}. Confirmation email will be sent to: ${formData.email}.`,
                      { duration: 8000 }
                    );
                    onClearCart?.();
                  } else {
                    toast.error(verificationResult.message || "Payment verification failed. Please contact support.");
                  }
                } catch (verificationError) {
                  console.error("Payment verification error:", verificationError);
                  toast.dismiss("verification-toast");
                  toast.error("An error occurred during payment verification. Please contact support.");
                } finally {
                  setIsSubmitting(false);
                }
              } else if (event.data.type === "payment.failed") {
                window.removeEventListener("message", messageHandler);
                setIsSubmitting(false);
                toast.error("Payment failed or cancelled.");
              }
            };

            window.addEventListener("message", messageHandler);
            setIsSubmitting(false);
          } else {
            const options = {
              key: key,
              amount: amount,
              currency: currency,
              name: "Tech Fiesta 2026",
              description: "Registration Fee",
              image: "/tech_fiesta_odyssey.png",
              order_id: orderId,
              prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.whatsapp,
              },
              notes: {
                college: formData.college,
                department: formData.department,
              },
              theme: {
                color: "#DC2626",
              },
              handler: async function (response: any) {
                setIsSubmitting(true);
                toast.loading("Verifying payment transaction...", { id: "verification-toast" });
                
                try {
                  const verificationResult = await verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    registrationData: formData,
                  });
                  
                  toast.dismiss("verification-toast");
                  
                  if (verificationResult.success && verificationResult.data) {
                    const eventCount = formData.selectedEvents.length + formData.selectedWorkshops.length + formData.selectedNonTechEvents.length;
                    
                    setSuccessData({
                      registrationId: verificationResult.data.registrationId,
                      formData: { ...formData },
                      submissionDate: new Date().toLocaleString()
                    });
                    
                    toast.success(
                      `Payment verified & registered! Events: ${eventCount}. Confirmation email will be sent to: ${formData.email}.`,
                      { duration: 8000 }
                    );
                    onClearCart?.();
                  } else {
                    toast.error(verificationResult.message || "Payment verification failed. Please contact support.");
                  }
                } catch (verificationError) {
                  console.error("Payment verification error:", verificationError);
                  toast.dismiss("verification-toast");
                  toast.error("An error occurred during payment verification. Please contact support.");
                } finally {
                  setIsSubmitting(false);
                }
              },
              modal: {
                ondismiss: function () {
                  setIsSubmitting(false);
                  toast.error("Payment cancelled by user.");
                },
              },
            };
            
            const rzp = new (window as any).Razorpay(options);
            
            rzp.on("payment.failed", function (response: any) {
              console.error("Payment failed:", response.error);
              setIsSubmitting(false);
              toast.error(`Payment failed: ${response.error.description || "Unknown error"}`);
            });
            
            rzp.open();
            setIsSubmitting(false);
          }
        } else {
          const eventCount = formData.selectedEvents.length + formData.selectedWorkshops.length + formData.selectedNonTechEvents.length;
          
          setSuccessData({
            registrationId: result.registrationId || "",
            formData: { ...formData },
            submissionDate: new Date().toLocaleString()
          });
          
          toast.success(
            `Successfully registered! Events registered: ${eventCount}. Confirmation email will be sent to: ${formData.email}.`,
            { duration: 8000 }
          );
          onClearCart?.();
          setIsSubmitting(false);
        }
      } else {
        toast.error(result.message, { duration: 6000 });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      toast.error("Registration failed. Please try again.");
      setIsSubmitting(false);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Download functions
  const handleDownloadPDF = () => {
    if (!successData) return;
    const downloadData: RegistrationDownloadData = {
      ...successData.formData,
      registrationId: successData.registrationId,
      submissionDate: successData.submissionDate
    };
    downloadRegistrationPDF(downloadData);
    toast.success("Registration PDF downloaded successfully!", { duration: 3000 });
  };

  const handleDownloadText = () => {
    if (!successData) return;
    const downloadData: RegistrationDownloadData = {
      ...successData.formData,
      registrationId: successData.registrationId,
      submissionDate: successData.submissionDate
    };
    downloadRegistrationText(downloadData);
    toast.success("Registration text file downloaded successfully!", { duration: 3000 });
  };

  const handleDownloadJSON = () => {
    if (!successData) return;
    const downloadData: RegistrationDownloadData = {
      ...successData.formData,
      registrationId: successData.registrationId,
      submissionDate: successData.submissionDate
    };
    downloadRegistrationJSON(downloadData);
    toast.success("Registration JSON file downloaded successfully!", { duration: 3000 });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      department: "",
      email: "",
      whatsapp: "",
      college: "",
      year: "",
      isTeamEvent: false,
      teamSize: 1,
      teamMembers: [],
      selectedEvents: [],
      selectedWorkshops: [],
      selectedNonTechEvents: [],
      transactionIds: {},
      hasConsented: false,
      selectedPass: null,
    });
    setErrors({});
    setSuccessData(null);
    setTechFiestaPass(false);
    onClearCart?.();
    toast.success("Form reset! You can now submit a new registration.", { duration: 3000 });
  };

  return (
    <div className="w-full py-2">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 font-[family-name:var(--font-bebas-neue)] tracking-wider text-center text-white">
            Registration Center
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-red-500 mb-4 font-mono tracking-widest uppercase text-center">
            // SECURING ENTRY PROTOCOL
          </p>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-2 text-center font-mono tracking-wide mb-2">
            Register for events and workshops to cement your legacy.
          </p>
          <p className="text-sm sm:text-base text-center font-mono mb-8">
            <span className="text-gray-400">Access via </span>
            <span className="text-white font-bold">Odyssey Pass</span>
            <span className="text-red-400 font-bold"> · ₹149</span>
            <span className="text-gray-500"> per person</span>
          </p>
        </div>

        {/* Combo Pass Banner */}
        <div className="mb-8 sm:mb-10 w-full max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-black/90 via-red-950/20 to-black/90 border border-red-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_1px_8px_rgba(220,38,38,0.06)] overflow-hidden relative">

            {/* Subtle top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            {/* Header row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/35 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-red-400/90 tracking-widest uppercase mb-0.5">// ODYSSEY_PASS · ALL-ACCESS</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-bebas-neue)] tracking-wider leading-none">
                  Combo Pass — One Pass, Full Access
                </h3>
              </div>
              <div className="flex-shrink-0 text-right bg-red-600/15 border border-red-500/30 rounded-xl px-4 py-2">
                <span className="text-3xl font-bold text-white font-[family-name:var(--font-bebas-neue)] tracking-wide">₹149</span>
                <p className="text-gray-400 text-xs font-mono">per person</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm font-mono mb-5 leading-relaxed border-l-2 border-red-500/50 pl-3">
              One pass. Three access points. Covers all events at Tech Fiesta 2.0 — no separate entry fees.
            </p>

            {/* 3 pillars — uniform styling */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pillar 1 — Tech Events */}
              <div className="flex items-center gap-3 bg-white/[0.04] border border-red-500/25 rounded-xl p-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight">Technical Events</p>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">Coding, hardware &amp; more</p>
                </div>
              </div>

              {/* Pillar 2 — Workshops */}
              <div className="flex items-center gap-3 bg-white/[0.04] border border-red-500/25 rounded-xl p-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight">Workshops</p>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">Hands-on expert sessions</p>
                </div>
              </div>

              {/* Pillar 3 — Non-Tech Events */}
              <div className="flex items-center gap-3 bg-white/[0.04] border border-red-500/25 rounded-xl p-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight">Non-Tech Events</p>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">Quizzes, debates &amp; more</p>
                </div>
              </div>
            </div>

            {/* Bottom note */}
            <div className="mt-5 pt-4 border-t border-white/8 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-500 text-xs font-mono">
                Select your preferred events &amp; workshops below. Your pass covers all chosen items.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full">
          {/* Personal Information */}
          <div className="bg-black/85 border border-red-500/20 backdrop-blur-sm shadow-[0_1px_8px_rgba(220,38,38,0.07)] rounded-2xl p-4 sm:p-6 w-full overflow-hidden transition-all duration-300">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center font-[family-name:var(--font-bebas-neue)] tracking-wider">
              <span className="break-words">Personal Information</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_8px_rgba(239,68,68,0.12)] transition-all duration-300 ${
                    errors.name ? 'border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.08)]' : 'border-red-500/20'
                  }`}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Science, Electronics, etc."
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_8px_rgba(239,68,68,0.12)] transition-all duration-300 ${
                    errors.department ? 'border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.08)]' : 'border-red-500/20'
                  }`}
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
                {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_8px_rgba(239,68,68,0.12)] transition-all duration-300 ${
                    errors.email ? 'border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.08)]' : 'border-red-500/20'
                  }`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210 or 9876543210"
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_8px_rgba(239,68,68,0.12)] transition-all duration-300 ${
                    errors.whatsapp ? 'border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.08)]' : 'border-red-500/20'
                  }`}
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                />
                {errors.whatsapp && <p className="text-red-400 text-sm mt-1">{errors.whatsapp}</p>}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your college/university name"
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_8px_rgba(239,68,68,0.12)] transition-all duration-300 ${
                    errors.college ? 'border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.08)]' : 'border-red-500/20'
                  }`}
                  value={formData.college}
                  onChange={(e) => handleInputChange("college", e.target.value)}
                />
                {errors.college && <p className="text-red-400 text-sm mt-1">{errors.college}</p>}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Year of Study *</label>
                <select
                  required
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_8px_rgba(239,68,68,0.12)] transition-all duration-300 ${
                    errors.year ? 'border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.08)]' : 'border-red-500/20'
                  }`}
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                >
                  <option value="" className="text-gray-400 bg-black">Select Year</option>
                  <option value="1st" className="text-white bg-black">1st Year</option>
                  <option value="2nd" className="text-white bg-black">2nd Year</option>
                  <option value="3rd" className="text-white bg-black">3rd Year</option>
                  <option value="4th" className="text-white bg-black">4th Year</option>
                  <option value="Postgraduate" className="text-white bg-black">Postgraduate</option>
                </select>
                {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year}</p>}
              </div>
            </div>
          </div>

          {/* Event Selection */}
          <div className="bg-black/85 border border-red-500/20 backdrop-blur-sm shadow-[0_1px_8px_rgba(220,38,38,0.07)] rounded-2xl p-4 sm:p-6 w-full overflow-hidden transition-all duration-300">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex flex-wrap items-center gap-2 font-[family-name:var(--font-bebas-neue)] tracking-wider">
              <span className="break-words">Select Events & Workshops</span>
            </h3>
            {errors.events && <p className="text-red-400 text-sm mb-4">{errors.events}</p>}
            
            {/* Technical Events */}
            <div className="space-y-4 w-full">
              <h4 className="text-lg font-semibold text-red-500 mb-4 flex flex-wrap items-center gap-2 font-mono">
                <span className="break-words">// TECHNICAL_EVENTS</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {techEvents.map(event => (
                  <label key={event.id} className="group relative flex items-start space-x-3 p-4 bg-black/55 border border-red-500/20 rounded-xl hover:bg-red-500/5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-red-500/50 w-full overflow-hidden">
                    <input
                      type="checkbox"
                      checked={formData.selectedEvents.some(item => item.id === event.id)}
                      onChange={() => handleEventSelection(event.id, "event")}
                      className="w-5 h-5 text-red-600 bg-black/40 border border-red-500/30 rounded focus:ring-red-500/50 focus:ring-offset-black flex-shrink-0 mt-1 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-white font-medium group-hover:text-red-300 transition-colors break-words">{event.title}</span>
                        {event.maxTeamSize && (
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded whitespace-nowrap">
                            Team: max {event.maxTeamSize}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm flex flex-wrap items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="break-words">{event.venue}</span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Workshops */}
            <div className="space-y-4 w-full">
              <h4 className="text-lg font-semibold text-red-500 my-4 flex flex-wrap items-center gap-2 font-mono">
                <span className="break-words">// WORKSHOPS</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {workshops.map(workshop => (
                  <label key={workshop.id} className="group relative flex items-start space-x-3 p-4 bg-black/55 border border-red-500/20 rounded-xl hover:bg-red-500/5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-red-500/50 w-full overflow-hidden">
                    <input
                      type="checkbox"
                      checked={formData.selectedWorkshops.some(item => item.id === workshop.id)}
                      onChange={() => handleEventSelection(workshop.id, "workshop")}
                      className="w-5 h-5 text-red-600 bg-black/40 border border-red-500/30 rounded focus:ring-red-500/50 focus:ring-offset-black flex-shrink-0 mt-1 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-medium group-hover:text-red-300 transition-colors block break-words">{workshop.title}</span>
                      <p className="text-gray-400 text-sm flex flex-wrap items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="break-words">{workshop.venue}</span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Non-Tech Events */}
            <div className="space-y-4 w-full">
              <h4 className="text-lg font-semibold text-amber-500 my-4 flex flex-wrap items-center gap-2 font-mono">
                <span className="break-words">// NON_TECHNICAL_EVENTS</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {nonTechEvents.map(event => (
                  <label key={event.id} className="group relative flex items-start space-x-3 p-4 bg-black/55 border border-red-500/20 rounded-xl hover:bg-red-500/5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-red-500/50 w-full overflow-hidden">
                    <input
                      type="checkbox"
                      checked={formData.selectedNonTechEvents.some(item => item.id === event.id)}
                      onChange={() => handleEventSelection(event.id, "non-tech")}
                      className="w-5 h-5 text-amber-600 bg-black/40 border border-red-500/30 rounded focus:ring-red-500/50 focus:ring-offset-black flex-shrink-0 mt-1 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-medium group-hover:text-amber-300 transition-colors block break-words">{event.title}</span>
                      <p className="text-gray-400 text-sm flex flex-wrap items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="break-words">{event.venue}</span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Team Details */}
          {formData.isTeamEvent && (
            <div className="bg-black/85 border border-red-500/20 backdrop-blur-sm shadow-[0_1px_8px_rgba(220,38,38,0.07)] rounded-2xl p-4 sm:p-6 w-full overflow-hidden transition-all duration-300">
              <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-bebas-neue)] tracking-wider">Team Details</h3>
                <div className="text-sm bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
                  Max team size: {teamRequirements.maxTeamSize} members
                </div>
              </div>
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  <strong>Team Required:</strong> The selected events require team participation. 
                  Please add your team members below (including yourself, max {teamRequirements.maxTeamSize} total).
                </p>
              </div>
              <div className="space-y-4">
                {(formData.teamMembers || []).map((member, index) => (
                  <div key={index} className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-red-500/20 w-full overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">Team Member {index + 2}</h4>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Name"
                        className="w-full px-3 py-2 bg-black/40 border border-red-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/5 transition-all duration-300"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        className="w-full px-3 py-2 bg-black/40 border border-red-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/5 transition-all duration-300"
                        value={member.department}
                        onChange={(e) => handleTeamMemberChange(index, "department", e.target.value)}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 bg-black/40 border border-red-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/5 transition-all duration-300"
                        value={member.email}
                        onChange={(e) => handleTeamMemberChange(index, "email", e.target.value)}
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp"
                        className="w-full px-3 py-2 bg-black/40 border border-red-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/5 transition-all duration-300"
                        value={member.whatsapp}
                        onChange={(e) => handleTeamMemberChange(index, "whatsapp", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addTeamMember}
                  disabled={(formData.teamSize || 1) >= teamRequirements.maxTeamSize}
                  className={`w-full py-2.5 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-102 shadow-[0_4px_12px_rgba(220,38,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
                >
                  {(formData.teamSize || 1) >= teamRequirements.maxTeamSize 
                    ? `Team limit reached (${teamRequirements.maxTeamSize} max)`
                    : '+ Add Team Member'
                  }
                </button>
              </div>
            </div>
          )}

          {/* Registration Summary */}
          {(formData.selectedEvents.length > 0 || formData.selectedWorkshops.length > 0 || formData.selectedNonTechEvents.length > 0) && (
            <div className="bg-black/85 border border-red-500/20 backdrop-blur-sm shadow-[0_1px_8px_rgba(220,38,38,0.07)] rounded-2xl p-4 sm:p-6 w-full overflow-hidden transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center font-[family-name:var(--font-bebas-neue)] tracking-wider">
                <span className="break-words">Registration Summary</span>
              </h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Tech Events */}
                {formData.selectedEvents.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-red-500/35 hover:bg-white/10 transition-all duration-300">
                    <h4 className="font-semibold text-red-500 mb-3 font-mono">// TECH_EVENTS ({formData.selectedEvents.length})</h4>
                    <ul className="space-y-2">
                      {formData.selectedEvents.map(selectedEvent => (
                        <li key={selectedEvent.id} className="text-sm text-white break-words">• {selectedEvent.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Workshops */}
                {formData.selectedWorkshops.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-red-500/35 hover:bg-white/10 transition-all duration-300">
                    <h4 className="font-semibold text-red-500 mb-3 font-mono">// WORKSHOPS ({formData.selectedWorkshops.length})</h4>
                    <ul className="space-y-2">
                      {formData.selectedWorkshops.map(selectedWorkshop => (
                        <li key={selectedWorkshop.id} className="text-sm text-white break-words">• {selectedWorkshop.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Non-Tech Events */}
                {formData.selectedNonTechEvents.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-amber-500/35 hover:bg-white/10 transition-all duration-300">
                    <h4 className="font-semibold text-amber-500 mb-3 font-mono">// NON_TECH_EVENTS ({formData.selectedNonTechEvents.length})</h4>
                    <ul className="space-y-2">
                      {formData.selectedNonTechEvents.map(selectedEvent => (
                        <li key={selectedEvent.id} className="text-sm text-white break-words">• {selectedEvent.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

      {/* ================= SPECIAL PASS ================= */}

<div className="mt-8 rounded-2xl overflow-hidden border border-red-500/25 bg-gradient-to-br from-[#180606] via-[#0d0505] to-black shadow-[0_0_30px_rgba(220,38,38,0.18)]">

  {/* Animated Shine */}
  <div className="relative overflow-hidden">

    <div className="absolute inset-0">
      <div className="absolute -left-40 top-0 h-full w-32 rotate-12 bg-gradient-to-r from-transparent via-red-400/20 to-transparent animate-[shine_5s_linear_infinite]" />
    </div>

    <div className="relative p-5">

      <div className="flex items-center justify-between">

        {/* Left */}
        <div>

          <p className="text-[11px] uppercase tracking-[4px] text-red-400 font-mono">
            SPECIAL PASS
          </p>

          <h3 className="mt-1 text-2xl font-bold text-white">
            Tech Fiesta Pass
          </h3>

          <p className="mt-2 text-sm text-gray-400 max-w-sm">
            Includes <span className="text-red-400 font-semibold">any 3 registrations</span>
            <br />
            (Events, Workshops or a Mix of both)
          </p>

        </div>

        {/* Premium Vertical Barcode */}
<div className="hidden md:flex items-center rounded-lg border border-red-500/20 bg-black/30 px-3 py-3 backdrop-blur-sm">

  <div className="flex gap-[2px]">

    {[2,4,2,3,5,2,4,2,3,2,5,2,4,3,2,5].map((w, i) => (
      <div
        key={i}
        style={{ width: `${w}px` }}
        className="h-[92px] rounded-full bg-gradient-to-b from-red-100 via-red-400 to-red-700"
      />
    ))}

  </div>

  <div className="ml-3 flex flex-col items-center">
    <span className="text-[9px] tracking-[2px] text-red-400 [writing-mode:vertical-rl] rotate-180 font-mono">
      TECHFIESTA2026
    </span>
  </div>

</div>
</div>

      {/* Bottom */}

      <div className="mt-5 flex items-center justify-between">

        <div>

          <p className="text-3xl font-bold text-red-400">
            ₹149
          </p>

          <p className="text-xs text-gray-500">
            One Pass • Three Registrations
          </p>

        </div>

        {!techFiestaPass ? (

          <button
            type="button"
            onClick={() => {
              setTechFiestaPass(true);
              handleInputChange("selectedPass", 1);
            }}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Add Pass
          </button>

        ) : (

          <button
            type="button"
            onClick={() => {
              setTechFiestaPass(false);
              handleInputChange("selectedPass", null);
            }}
            className="flex items-center gap-2 rounded-lg border border-green-500 bg-green-500/15 px-5 py-2.5 font-semibold text-green-400 transition hover:bg-green-500/20"
          >
            <CheckCircle className="h-4 w-4" />
            Pass Added
          </button>

        )}

      </div>

    </div>

  </div>

</div>
          {/* Consent */}
          <div className="bg-black/85 border border-red-500/20 backdrop-blur-sm shadow-[0_1px_8px_rgba(220,38,38,0.07)] rounded-2xl p-4 sm:p-6 w-full overflow-hidden transition-all duration-300">
            <label className="flex items-start space-x-4 cursor-pointer">
              <input
                type="checkbox"
                className="w-6 h-6 text-red-600 bg-black/40 border border-red-500/35 rounded focus:ring-red-500/50 mt-1 flex-shrink-0 cursor-pointer"
                checked={formData.hasConsented}
                onChange={(e) => handleInputChange("hasConsented", e.target.checked)}
              />
              <div className="text-gray-300 leading-relaxed break-words">
                <p className="font-medium text-white mb-2 font-mono">// DATA_CONSENT_&_VERIFICATION</p>
                <p className="text-sm text-gray-400">
                  I hereby confirm that all the information provided above is <span className="text-red-400 font-medium">accurate and complete</span>. 
                  I understand that any false information may lead to <span className="text-red-400 font-medium">disqualification</span> from the events. 
                  I consent to the processing of my personal data for registration and event management purposes in accordance with privacy guidelines.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="text-center w-full">
            <button
              type="submit"
              disabled={!formData.hasConsented || isSubmitting || isCheckingDuplicates || successData !== null}
              className="w-full max-w-md mx-auto py-3 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-[0_2px_8px_rgba(220,38,38,0.15)] hover:shadow-[0_4px_12px_rgba(220,38,38,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isCheckingDuplicates ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking details...
                </>
              ) : isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Registration...
                </>
              ) : successData ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Registration Submitted!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Registration
                </>
              )}
            </button>
          </div>

          {/* Download Section - Show after successful registration */}
          {successData && (
            <div className="bg-black/85 border border-red-500/20 backdrop-blur-sm shadow-[0_1px_8px_rgba(220,38,38,0.07)] rounded-2xl p-4 sm:p-6 w-full overflow-hidden transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-bold text-red-500 mb-4 flex items-center font-[family-name:var(--font-bebas-neue)] tracking-wider">
                <CheckCircle className="w-6 h-6 mr-3" />
                Registration Successful!
              </h3>
              
              <div className="text-center mb-6 font-mono">
                <p className="text-white text-lg mb-2">
                  <span className="font-semibold text-gray-400">Registration ID:</span> 
                  <span className="text-red-500 font-bold ml-2">{successData.registrationId}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Submitted on: {successData.submissionDate}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/10">
                <h4 className="text-white font-semibold mb-3 text-center font-mono">// DOWNLOAD_DETAILS</h4>
                <p className="text-gray-400 text-sm text-center mb-4">
                  Save your registration receipt details locally. Choose format:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF Document
                  </button>
                  
                  <button
                    onClick={handleDownloadText}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Text File
                  </button>
                  
                  <button
                    onClick={handleDownloadJSON}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    JSON Data
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={resetForm}
                  className="py-2.5 px-6 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
                >
                  Start New Registration
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
