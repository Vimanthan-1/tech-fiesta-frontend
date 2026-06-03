"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Event, RegistrationFormData, TeamMember, PaymentQR } from "@/types";
import { events } from "@/data/events";
import { workshops } from "@/data/workshops";
import { validateEmail, validatePhone, validateIndianTransactionId } from "@/utils/registration";
import { CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import PixelBlast from "./PixelBlast";
import { submitRegistration, checkDuplicateRegistration } from "@/services/registrationService";
import { downloadRegistrationPDF, downloadRegistrationText, downloadRegistrationJSON, RegistrationDownloadData } from "@/utils/downloadUtils";

export default function RegistrationForm() {
  const searchParams = useSearchParams();
  const preSelectedEventId = searchParams.get("eventId");
  const preSelectedEventType = searchParams.get("type") as "event" | "workshop" | "non-tech";

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
    selectedEvents: preSelectedEventId && preSelectedEventType === "event" ? 
      (() => {
        const event = events.find(e => e.id === parseInt(preSelectedEventId));
        return event ? [{ id: event.id, title: event.title }] : [];
      })() : [],
    selectedWorkshops: preSelectedEventId && preSelectedEventType === "workshop" ? 
      (() => {
        const workshop = workshops.find(w => w.id === parseInt(preSelectedEventId));
        return workshop ? [{ id: workshop.id, title: workshop.title }] : [];
      })() : [],
    selectedNonTechEvents: preSelectedEventId && preSelectedEventType === "non-tech" ? 
      (() => {
        const event = events.find(e => e.id === parseInt(preSelectedEventId) && e.type === "non-tech");
        return event ? [{ id: event.id, title: event.title }] : [];
      })() : [],
    transactionIds: {},
    hasConsented: false,
  });

  const [showQuickContact, setShowQuickContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [successData, setSuccessData] = useState<{
    registrationId: string;
    formData: RegistrationFormData;
    submissionDate: string;
  } | null>(null);

  // Payment QR data - Free entry, individual QRs for each event/workshop
  const generatePaymentQRs = (): PaymentQR[] => {
    const qrs: PaymentQR[] = [];
    
    // Individual QRs for selected tech events
    formData.selectedEvents.forEach(selectedEvent => {
      const event = techEvents.find(e => e.id === selectedEvent.id);
      if (event) {
        qrs.push({
          type: "event",
          eventId: event.id,
          eventTitle: event.title,
          amount: event.price || "₹69", // Default price if undefined
          qrCode: `/qr-codes/event-${event.id}.png`,
          description: `${event.title} Registration`
        });
      }
    });
    
    // Individual QRs for selected workshops
    formData.selectedWorkshops.forEach(selectedWorkshop => {
      const workshop = workshops.find(w => w.id === selectedWorkshop.id);
      if (workshop) {
        qrs.push({
          type: "workshop",
          eventId: workshop.id,
          eventTitle: workshop.title,
          amount: workshop.price || "₹101",
          qrCode: `/qr-codes/workshop-${workshop.id}.png`,
          description: `${workshop.title} Workshop`
        });
      }
    });
    
    return qrs;
  };

  // Get tech and non-tech events
  const techEvents = events.filter(event => event.type === "tech");
  const nonTechEvents = events.filter(event => event.type === "non-tech");

  // Check if any selected events require teams and get the maximum team size allowed
  const getTeamRequirements = () => {
    const selectedEventsWithTeamLimits = formData.selectedEvents
      .map(selectedEvent => events.find(e => e.id === selectedEvent.id))
      .filter((event): event is Event => event !== undefined && event.maxTeamSize !== undefined);
    
    // For now, workshops don't have team limits, but if they do in the future:
    // const selectedWorkshopsWithTeamLimits = formData.selectedWorkshops
    //   .map(selectedWorkshop => workshops.find(w => w.id === selectedWorkshop.id))
    //   .filter((workshop): workshop is Workshop & { maxTeamSize: number } => 
    //     workshop !== undefined && (workshop as any).maxTeamSize !== undefined);

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
    setFormData(prev => {
      if (type === "event") {
        const event = techEvents.find(e => e.id === eventId);
        if (!event) return prev;
        
        const isSelected = prev.selectedEvents.some(item => item.id === eventId);
        return {
          ...prev,
          selectedEvents: isSelected
            ? prev.selectedEvents.filter(item => item.id !== eventId)
            : [...prev.selectedEvents, { id: event.id, title: event.title }]
        };
      } else if (type === "workshop") {
        const workshop = workshops.find(w => w.id === eventId);
        if (!workshop) return prev;
        
        const isSelected = prev.selectedWorkshops.some(item => item.id === eventId);
        return {
          ...prev,
          selectedWorkshops: isSelected
            ? prev.selectedWorkshops.filter(item => item.id !== eventId)
            : [...prev.selectedWorkshops, { id: workshop.id, title: workshop.title }]
        };
      } else {
        const event = nonTechEvents.find(e => e.id === eventId);
        if (!event) return prev;
        
        const isSelected = prev.selectedNonTechEvents.some(item => item.id === eventId);
        return {
          ...prev,
          selectedNonTechEvents: isSelected
            ? prev.selectedNonTechEvents.filter(item => item.id !== eventId)
            : [...prev.selectedNonTechEvents, { id: event.id, title: event.title }]
        };
      }
    });
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
    return generatePaymentQRs().filter(qr => qr.amount !== "Free");
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
      // Check team size limit
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
    
    // Payment validation
    const requiredQRs = getRequiredQRs();
    requiredQRs.forEach(qr => {
      const transactionKey = qr.eventId ? `${qr.type}_${qr.eventId}` : qr.type;
      const transactionId = formData.transactionIds[transactionKey as keyof typeof formData.transactionIds];
      if (!transactionId?.trim()) {
        newErrors[`transaction_${transactionKey}`] = `Transaction ID for ${qr.description} is required`;
      } else if (!validateIndianTransactionId(transactionId)) {
        newErrors[`transaction_${transactionKey}`] = `Invalid transaction ID format for ${qr.description}`;
      }
    });
    
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
      // Check for duplicates first
      setIsCheckingDuplicates(true);
      const duplicateCheck = await checkDuplicateRegistration(
        formData.email,
        formData.whatsapp,
      );
      
      setIsCheckingDuplicates(false);
      
      if (duplicateCheck.exists) {
        toast.error(
          `Registration already exists with the same ${duplicateCheck.duplicateFields.join(', ')}. Please use different details or contact support.`,
          { duration: 6000 }
        );
        return;
      }
      
      // Submit registration to Firebase
      const result = await submitRegistration(formData);
      
      if (result.success) {
        const eventCount = formData.selectedEvents.length + formData.selectedWorkshops.length + formData.selectedNonTechEvents.length;
        const paymentTotal = getRequiredQRs().reduce((total, qr) => total + (qr.amount === "Free" ? 0 : parseInt(qr.amount.replace('₹', ''))), 0);
        
        // Store success data for download functionality
        setSuccessData({
          registrationId: result.registrationId,
          formData: { ...formData },
          submissionDate: new Date().toLocaleString()
        });
        
        toast.success(
          `${result.message} Events registered: ${eventCount} | ₹ Total payment: ₹${paymentTotal} | Confirmation email will be sent to: ${formData.email}. Please keep your transaction receipts safe for verification.`,
          { duration: 8000 }
        );
        
        // Don't reset form immediately, wait for user to download if they want
        // We'll reset it when they click a "Start New Registration" button
        
      } else {
        toast.error(result.message, { duration: 6000 });
      }
      
    } catch (error) {
      console.error('Registration submission error:', error);
      toast.error("Registration failed. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
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
    });
    setErrors({});
    setSuccessData(null);
    toast.success("Form reset! You can now submit a new registration.", { duration: 3000 });
  };

  return (
    <>
      {/* Fixed background with Vintage Map and PixelBlast */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-luminosity" 
          style={{ backgroundImage: "url('/vintage_map.png')" }}
        />
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#DC2626"
          patternScale={2.5}
          patternDensity={1.2}
          pixelSizeJitter={0.1}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.15}
          rippleIntensityScale={2.0}
          liquid={true}
          liquidStrength={0.08}
          liquidRadius={1.2}
          liquidWobbleSpeed={4.0}
          speed={0.4}
          edgeFade={0.3}
          transparent
        />
        <div className="absolute inset-0 bg-black/75"></div> {/* Overlay for better form readability */}
      </div>

      <div className="relative z-10 min-h-screen py-6 sm:py-12 px-4 overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2 sm:mb-4 leading-tight">
              Tech Fiesta 2.0 Registration
            </h1>
            <p className="text-red-500 font-mono tracking-widest uppercase mb-4 text-sm sm:text-base">
              Theme: The Odyssey
            </p>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-2">
              Register for exciting events and workshops! Entry is <span className="text-green-400 font-semibold">FREE</span> - pay only for the events you choose.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl w-full overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full">
            {/* Personal Information */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full overflow-hidden transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="break-words">Personal Information</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
              <div>
                <label className="block text-white font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300 ${
                    errors.name ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Science, Electronics, etc."
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300 ${
                    errors.department ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
                {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300 ${
                    errors.email ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210 or 9876543210"
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300 ${
                    errors.whatsapp ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                />
                {errors.whatsapp && <p className="text-red-400 text-sm mt-1">{errors.whatsapp}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your college/university name"
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300 ${
                    errors.college ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={formData.college}
                  onChange={(e) => handleInputChange("college", e.target.value)}
                />
                {errors.college && <p className="text-red-400 text-sm mt-1">{errors.college}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Year of Study *</label>
                <select
                  required
                  className={`w-full px-4 py-3.5 bg-white/10 backdrop-blur-sm border rounded-lg text-white focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300 ${
                    errors.year ? 'border-red-400' : 'border-white/30'
                  }`}
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                >
                  <option value="" className="text-black">Select Year</option>
                  <option value="1st" className="text-black">1st Year</option>
                  <option value="2nd" className="text-black">2nd Year</option>
                  <option value="3rd" className="text-black">3rd Year</option>
                  <option value="4th" className="text-black">4th Year</option>
                  <option value="Postgraduate" className="text-black">Postgraduate</option>
                </select>
                {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year}</p>}
              </div>
              </div>
            </div>

            {/* Event Selection */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full overflow-hidden transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
                <span className="break-words">Select Events & Workshops</span>
                <span className="text-xs sm:text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full whitespace-nowrap">Entry FREE</span>
              </h3>
              {errors.events && <p className="text-red-400 text-sm mb-4">{errors.events}</p>}
              
              {/* Technical Events */}
              <div className="space-y-4 w-full">
                <h4 className="text-lg font-semibold text-red-500 mb-4 flex flex-wrap items-center gap-2">
                  <span className="break-words">Technical Events</span>
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded whitespace-nowrap">₹69 each</span>
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  {techEvents.map(event => (
                    <label key={event.id} className="group relative flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 cursor-pointer transition-all duration-300 hover:scale-[1.02] w-full overflow-hidden">
                      <input
                        type="checkbox"
                        checked={formData.selectedEvents.some(item => item.id === event.id)}
                        onChange={() => handleEventSelection(event.id, "event")}
                        className="w-5 h-5 text-red-600 bg-white/10 border-white/30 rounded focus:ring-red-500 flex-shrink-0 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-white font-medium group-hover:text-red-300 transition-colors break-words">{event.title}</span>
                          {event.maxTeamSize && (
                            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded whitespace-nowrap">
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
                <h4 className="text-lg font-semibold text-green-400 my-4 flex flex-wrap items-center gap-2">
                  <span className="break-words">Workshops</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded whitespace-nowrap">Varies by workshop</span>
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  {workshops.map(workshop => (
                    <label key={workshop.id} className="group relative flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 cursor-pointer transition-all duration-300 hover:scale-[1.02] w-full overflow-hidden">
                      <input
                        type="checkbox"
                        checked={formData.selectedWorkshops.some(item => item.id === workshop.id)}
                        onChange={() => handleEventSelection(workshop.id, "workshop")}
                        className="w-5 h-5 text-green-600 bg-white/10 border-white/30 rounded focus:ring-green-500 flex-shrink-0 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium group-hover:text-green-300 transition-colors block break-words">{workshop.title}</span>
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
                <h4 className="text-lg font-semibold text-amber-500 my-4 flex flex-wrap items-center gap-2">
                  <span className="break-words">Non-Technical Events</span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded whitespace-nowrap">Payment on arrival</span>
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  {nonTechEvents.map(event => (
                    <label key={event.id} className="group relative flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 cursor-pointer transition-all duration-300 hover:scale-[1.02] w-full overflow-hidden">
                      <input
                        type="checkbox"
                        checked={formData.selectedNonTechEvents.some(item => item.id === event.id)}
                        onChange={() => handleEventSelection(event.id, "non-tech")}
                        className="w-5 h-5 text-amber-600 bg-white/10 border-white/30 rounded focus:ring-amber-500 flex-shrink-0 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium group-hover:text-amber-300 transition-colors block break-words">{event.title}</span>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-400 text-sm flex flex-wrap items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="break-words">{event.venue}</span>
                          </p>
                          <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded whitespace-nowrap">Pay on arrival</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Details */}
            {formData.isTeamEvent && (
              <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full overflow-hidden transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Team Details</h3>
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
                    <div key={index} className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 w-full overflow-hidden">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-medium">Team Member {index + 2}</h4>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Name"
                          className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Department"
                          className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300"
                          value={member.department}
                          onChange={(e) => handleTeamMemberChange(index, "department", e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300"
                          value={member.email}
                          onChange={(e) => handleTeamMemberChange(index, "email", e.target.value)}
                        />
                        <input
                          type="tel"
                          placeholder="WhatsApp"
                          className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300"
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
                    className={`w-full py-3 backdrop-blur-sm border rounded-lg transition-all duration-300 ${
                      (formData.teamSize || 1) >= teamRequirements.maxTeamSize
                        ? 'bg-gray-600/20 border-gray-500/50 text-gray-400 cursor-not-allowed'
                        : 'bg-white/10 border-red-500/50 text-red-500 hover:bg-white/15 hover:border-red-500'
                    }`}
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
              <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full overflow-hidden transition-all duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="break-words">Registration Summary</span>
                </h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                  {/* Tech Events */}
                  {formData.selectedEvents.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-red-500/30 hover:bg-white/15 transition-all duration-300">
                      <h4 className="font-semibold text-red-500 mb-3">Technical Events ({formData.selectedEvents.length})</h4>
                      <ul className="space-y-2">
                        {formData.selectedEvents.map(selectedEvent => {
                          const event = techEvents.find(e => e.id === selectedEvent.id);
                          return event ? (
                            <li key={selectedEvent.id} className="text-sm text-white break-words">• {selectedEvent.title} <span className="text-green-300">({event.price})</span></li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {/* Workshops */}
                  {formData.selectedWorkshops.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-400/30 hover:bg-white/15 transition-all duration-300">
                      <h4 className="font-semibold text-green-400 mb-3">Workshops ({formData.selectedWorkshops.length})</h4>
                      <ul className="space-y-2">
                        {formData.selectedWorkshops.map(selectedWorkshop => {
                          const workshop = workshops.find(w => w.id === selectedWorkshop.id);
                          return workshop ? (
                            <li key={selectedWorkshop.id} className="text-sm text-white break-words">
                              • {selectedWorkshop.title} <span className="text-green-300">({workshop.price})</span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {/* Non-Tech Events */}
                  {formData.selectedNonTechEvents.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-amber-500/30 hover:bg-white/15 transition-all duration-300">
                      <h4 className="font-semibold text-amber-500 mb-3">Non-Tech Events ({formData.selectedNonTechEvents.length})</h4>
                      <ul className="space-y-2">
                        {formData.selectedNonTechEvents.map(selectedEvent => {
                          const event = nonTechEvents.find(e => e.id === selectedEvent.id);
                          return event ? (
                            <li key={selectedEvent.id} className="text-sm text-white break-words">• {selectedEvent.title}</li>
                          ) : null;
                        })}
                      </ul>
                      <p className="text-yellow-300 font-medium mt-2">Payment on arrival</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <p className="text-center text-white break-words">
                    <span className="text-green-400 font-bold text-lg">Total Online Payment: </span>
                    <span className="text-2xl font-bold">
                      ₹{getRequiredQRs().reduce((total, qr) => total + (qr.amount === "Free" ? 0 : parseInt(qr.amount.replace('₹', ''))), 0)}
                    </span>
                  </p>
                  {formData.selectedNonTechEvents.length > 0 && (
                    <p className="text-center text-yellow-400 text-sm mt-1 break-words">
                      + Non-tech event fees to be paid on arrival
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Section */}
            {getRequiredQRs().length > 0 && (
              <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full overflow-hidden transition-all duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="break-words">Payment Details</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {getRequiredQRs().map((qr, index) => {
                    const transactionKey = qr.eventId ? `${qr.type}_${qr.eventId}` : qr.type;
                    return (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20 hover:border-red-500/50 transition-all duration-300 w-full overflow-hidden">
                        <div className="text-center mb-4">
                          <h4 className="text-white font-semibold mb-1 text-lg break-words">{qr.eventTitle || qr.description}</h4>
                          <p className="text-green-400 font-bold text-2xl mb-3">{qr.amount}</p>
                        </div>
                        <div className="w-full h-48 bg-gray-700/50 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-600">
                          <div className="text-center">
                            <div className="w-32 h-32 mx-auto mb-2 bg-white rounded-lg p-2 flex items-center justify-center">
                              <img 
                                src={qr.qrCode} 
                                alt="QR Code" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <svg className="w-16 h-16 text-gray-500 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4 0l2-2m-2 2l2 2M4 7h4v1.7M8 7a4 4 0 100 8m0-8V5a2 2 0 012-2h4.01M12 5h4a2 2 0 012 2v4" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">QR Code</p>
                            <p className="text-xs text-gray-500">Scan to pay {qr.amount}</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Transaction ID *</label>
                          <input
                            type="text"
                            placeholder="Enter transaction ID"
                            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all duration-300 ${
                              errors[`transaction_${transactionKey}`] ? 'border-red-400' : 'border-white/30'
                            }`}
                            value={formData.transactionIds[transactionKey as keyof typeof formData.transactionIds] || ""}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              transactionIds: {
                                ...prev.transactionIds,
                                [transactionKey]: e.target.value
                              }
                            }))}
                          />
                          {errors[`transaction_${transactionKey}`] && (
                            <p className="text-red-400 text-sm mt-1 break-words">{errors[`transaction_${transactionKey}`]}</p>
                          )}
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                          <p>• Enter the transaction ID after payment</p>
                          <p>• Keep the payment receipt safe</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Non-tech events payment notice */}
            {formData.selectedNonTechEvents.length > 0 && (
              <div className="bg-black/60 backdrop-blur-sm border border-amber-500/50 rounded-lg p-4 w-full overflow-hidden transition-all duration-300">
                <h4 className="text-amber-500 font-medium mb-2">Non-Technical Events Payment</h4>
                <p className="text-amber-300 break-words">
                  Payment for non-technical events will be collected on the day of the event. 
                  Please ensure you have the required amount ready.
                </p>
              </div>
            )}

            {/* Consent */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 w-full overflow-hidden transition-all duration-300">
              <label className="flex items-start space-x-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-6 h-6 text-red-600 bg-white/10 border-white/30 rounded focus:ring-red-500 mt-1 flex-shrink-0"
                  checked={formData.hasConsented}
                  onChange={(e) => handleInputChange("hasConsented", e.target.checked)}
                />
                <div className="text-gray-300 leading-relaxed break-words">
                  <p className="font-medium text-white mb-2">Data Consent & Verification</p>
                  <p className="text-sm">
                    I hereby confirm that all the information provided above is <span className="text-red-400 font-medium">accurate and complete</span>. 
                    I understand that any false information may lead to <span className="text-red-400 font-medium">disqualification</span> from the events. 
                    I consent to the processing of my personal data for registration and event management purposes in accordance with privacy guidelines.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Double-check all details before submission<br/>
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Keep payment receipts for verification<br/>
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Contact support for any issues
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="text-center w-full">
              <button
                type="submit"
                disabled={!formData.hasConsented || isSubmitting || isCheckingDuplicates || successData !== null}
                className="w-full max-w-md mx-auto py-4 px-8 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white font-bold text-lg rounded-xl hover:from-red-800 hover:via-red-700 hover:to-amber-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_30px_rgba(220,38,38,0.4)]"
              >
                {isCheckingDuplicates ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking for duplicates...
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
                    Registration Submitted Successfully!
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
              <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-green-400/50 w-full overflow-hidden transition-all duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Registration Successful!
                </h3>
                
                <div className="text-center mb-6">
                  <p className="text-white text-lg mb-2">
                    <span className="font-semibold">Registration ID:</span> 
                    <span className="text-green-400 font-mono text-xl ml-2">{successData.registrationId}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Submitted on: {successData.submissionDate}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                  <h4 className="text-white font-semibold mb-3 text-center">Download Your Registration Details</h4>
                  <p className="text-gray-300 text-sm text-center mb-4">
                    Save your registration information for your records. Choose your preferred format:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF Document
                    </button>
                    
                    <button
                      onClick={handleDownloadText}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Text File
                    </button>
                    
                    <button
                      onClick={handleDownloadJSON}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
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
                    className="py-3 px-6 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/15 hover:border-white/50 transition-all duration-300"
                  >
                    Start New Registration
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        </div>

        {/* Quick Contact Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowQuickContact(!showQuickContact)}
            className="bg-green-600/80 backdrop-blur-sm hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 border border-green-500/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          
          {showQuickContact && (
            <div className="absolute bottom-16 right-0 bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-xl border border-white/20 w-64 max-w-[calc(100vw-2rem)] z-50">
              <h4 className="text-white font-medium mb-2">Quick Contact</h4>
              <p className="text-gray-300 text-sm mb-3 break-words">
                Having payment or registration issues? Contact us immediately!
              </p>
              <div className="space-y-2">
                <a href="tel:+1234567890" className="flex items-center text-red-400 hover:text-red-300 transition-colors break-words">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  +91 12345 67890
                </a>
                <a href="https://wa.me/1234567890" className="flex items-center text-green-400 hover:text-green-300 transition-colors break-words">
                  <FaWhatsapp className="w-4 h-4 mr-2 flex-shrink-0" />
                  WhatsApp Support
                </a>
                <a href="mailto:support@asymmetric.in" className="flex items-center text-amber-400 hover:text-amber-300 transition-colors break-words">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  support@asymmetric.in
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
