// jsPDF is NOT statically imported — it is dynamically loaded on demand
// so it is never bundled into the main registration chunk.
import { RegistrationFormData } from "@/types";
import { events } from "@/data/events";
import { workshops } from "@/data/workshops";

export interface RegistrationDownloadData extends RegistrationFormData {
  registrationId: string;
  submissionDate: string;
}

/**
 * Generate and download registration data as PDF.
 * jsPDF is loaded lazily on demand — not bundled into the initial chunk.
 */
export const downloadRegistrationPDF = async (data: RegistrationDownloadData) => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Helper function to add text with word wrapping
  const addText = (
    text: string,
    fontSize: number = 10,
    isBold: boolean = false
  ) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }

    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.4);
    return yPosition;
  };

  const addSpacing = (space: number = 5) => {
    yPosition += space;
  };

  // Header
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Tech Fiesta 2.0: The Odyssey - Registration Confirmation", pageWidth / 2, 15, {
    align: "center",
  });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 35;

  // Registration ID and Date
  addText(`Registration ID: ${data.registrationId}`, 12, true);
  addText(`Submission Date: ${data.submissionDate}`, 10);
  addSpacing(10);

  // Personal Information
  addText("PERSONAL INFORMATION", 14, true);
  addSpacing(3);
  addText(`Name: ${data.name}`, 10);
  addText(`Department: ${data.department}`, 10);
  addText(`Email: ${data.email}`, 10);
  addText(`WhatsApp: ${data.whatsapp}`, 10);
  addText(`College: ${data.college}`, 10);
  addText(`Year of Study: ${data.year}`, 10);
  addSpacing(10);

  // Event Registrations
  if (
    data.selectedEvents.length > 0 ||
    data.selectedWorkshops.length > 0 ||
    data.selectedNonTechEvents.length > 0
  ) {
    addText("EVENT REGISTRATIONS", 14, true);
    addSpacing(3);

    // Technical Events
    if (data.selectedEvents.length > 0) {
      addText("Technical Events:", 12, true);
      data.selectedEvents.forEach((selectedEvent) => {
        const event = events.find((e) => e.id === selectedEvent.id);
        if (event) {
          addText(`• ${selectedEvent.title} - ${event.price || "₹69"}`, 10);
        }
      });
      addSpacing(5);
    }

    // Workshops
    if (data.selectedWorkshops.length > 0) {
      addText("Workshops:", 12, true);
      data.selectedWorkshops.forEach((selectedWorkshop) => {
        const workshop = workshops.find((w) => w.id === selectedWorkshop.id);
        if (workshop) {
          addText(
            `• ${selectedWorkshop.title} - ${workshop.price || "₹101"}`,
            10
          );
        }
      });
      addSpacing(5);
    }

    // Non-Tech Events
    if (data.selectedNonTechEvents.length > 0) {
      addText("Non-Technical Events:", 12, true);
      data.selectedNonTechEvents.forEach((selectedEvent) => {
        const event = events.find((e) => e.id === selectedEvent.id);
        if (event) {
          addText(`• ${selectedEvent.title} - Payment on arrival`, 10);
        }
      });
      addSpacing(5);
    }
  }

  // Team Information
  if (data.isTeamEvent && data.teamMembers && data.teamMembers.length > 0) {
    addText("TEAM INFORMATION", 14, true);
    addSpacing(3);
    addText(`Team Size: ${data.teamSize}`, 10);
    addText("Team Members:", 12, true);
    data.teamMembers.forEach((member, index) => {
      addText(`${index + 2}. ${member.name} (${member.email})`, 10);
      addText(`   Department: ${member.department}, Year: ${member.year}`, 9);
    });
    addSpacing(10);
  }

  // Payment Information
  const hasPayments = Object.keys(data.transactionIds).length > 0;
  if (hasPayments) {
    addText("PAYMENT INFORMATION", 14, true);
    addSpacing(3);
    Object.entries(data.transactionIds).forEach(([key, transactionId]) => {
      if (transactionId) {
        addText(`${key}: ${transactionId}`, 10);
      }
    });
    addSpacing(10);
  }

  // Important Notes
  addText("IMPORTANT NOTES", 14, true);
  addSpacing(3);
  addText("• Please bring this registration confirmation to the event", 10);
  addText("• Keep your payment receipts safe for verification", 10);
  addText("• Contact support if you need to make any changes", 10);
  addText("• Arrive at least 15 minutes before your event time", 10);

  // Footer
  addSpacing(15);
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "This is an automatically generated document. Please preserve it for your records.",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  // Save the PDF
  doc.save(`Tech-Fiesta-2.0-Registration-${data.registrationId}.pdf`);
};

/**
 * Generate and download registration data as JSON
 */
export const downloadRegistrationJSON = (data: RegistrationDownloadData) => {
  const jsonData = {
    registrationDetails: {
      registrationId: data.registrationId,
      submissionDate: data.submissionDate,
      personalInfo: {
        name: data.name,
        department: data.department,
        email: data.email,
        whatsapp: data.whatsapp,
        college: data.college,
        year: data.year,
      },
      eventRegistrations: {
        technicalEvents: data.selectedEvents.map((selectedEvent) => {
          const event = events.find((e) => e.id === selectedEvent.id);
          return event
            ? {
                id: selectedEvent.id,
                title: selectedEvent.title,
                price: event.price || "₹69",
              }
            : { id: selectedEvent.id, title: selectedEvent.title };
        }),
        workshops: data.selectedWorkshops.map((selectedWorkshop) => {
          const workshop = workshops.find((w) => w.id === selectedWorkshop.id);
          return workshop
            ? {
                id: selectedWorkshop.id,
                title: selectedWorkshop.title,
                price: workshop.price || "₹101",
              }
            : { id: selectedWorkshop.id, title: selectedWorkshop.title };
        }),
        nonTechEvents: data.selectedNonTechEvents.map((selectedEvent) => {
          const event = events.find((e) => e.id === selectedEvent.id);
          return event
            ? {
                id: selectedEvent.id,
                title: selectedEvent.title,
                note: "Payment on arrival",
              }
            : { id: selectedEvent.id, title: selectedEvent.title };
        }),
      },
      teamInfo: data.isTeamEvent
        ? {
            teamSize: data.teamSize,
            teamMembers: data.teamMembers || [],
          }
        : null,
      paymentInfo: data.transactionIds,
    },
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Tech-Fiesta-2.0-Registration-${data.registrationId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate and download registration data as text file
 */
export const downloadRegistrationText = (data: RegistrationDownloadData) => {
  let content = "=".repeat(60) + "\n";
  content += "          TECH FIESTA 2.0: THE ODYSSEY - REGISTRATION CONFIRMATION\n";
  content += "=".repeat(60) + "\n\n";

  content += `Registration ID: ${data.registrationId}\n`;
  content += `Submission Date: ${data.submissionDate}\n\n`;

  content += "PERSONAL INFORMATION\n";
  content += "-".repeat(30) + "\n";
  content += `Name: ${data.name}\n`;
  content += `Department: ${data.department}\n`;
  content += `Email: ${data.email}\n`;
  content += `WhatsApp: ${data.whatsapp}\n`;
  content += `College: ${data.college}\n`;
  content += `Year of Study: ${data.year}\n\n`;

  if (
    data.selectedEvents.length > 0 ||
    data.selectedWorkshops.length > 0 ||
    data.selectedNonTechEvents.length > 0
  ) {
    content += "EVENT REGISTRATIONS\n";
    content += "-".repeat(30) + "\n";

    if (data.selectedEvents.length > 0) {
      content += "Technical Events:\n";
      data.selectedEvents.forEach((selectedEvent) => {
        const event = events.find((e) => e.id === selectedEvent.id);
        if (event) {
          content += `  • ${selectedEvent.title} - ${event.price || "₹69"}\n`;
        }
      });
      content += "\n";
    }

    if (data.selectedWorkshops.length > 0) {
      content += "Workshops:\n";
      data.selectedWorkshops.forEach((selectedWorkshop) => {
        const workshop = workshops.find((w) => w.id === selectedWorkshop.id);
        if (workshop) {
          content += `  • ${selectedWorkshop.title} - ${
            workshop.price || "₹101"
          }\n`;
        }
      });
      content += "\n";
    }

    if (data.selectedNonTechEvents.length > 0) {
      content += "Non-Technical Events:\n";
      data.selectedNonTechEvents.forEach((selectedEvent) => {
        const event = events.find((e) => e.id === selectedEvent.id);
        if (event) {
          content += `  • ${selectedEvent.title} - Payment on arrival\n`;
        }
      });
      content += "\n";
    }
  }

  if (data.isTeamEvent && data.teamMembers && data.teamMembers.length > 0) {
    content += "TEAM INFORMATION\n";
    content += "-".repeat(30) + "\n";
    content += `Team Size: ${data.teamSize}\n`;
    content += "Team Members:\n";
    data.teamMembers.forEach((member, index) => {
      content += `  ${index + 2}. ${member.name} (${member.email})\n`;
      content += `     Department: ${member.department}, Year: ${member.year}\n`;
    });
    content += "\n";
  }

  const hasPayments = Object.keys(data.transactionIds).length > 0;
  if (hasPayments) {
    content += "PAYMENT INFORMATION\n";
    content += "-".repeat(30) + "\n";
    Object.entries(data.transactionIds).forEach(([key, transactionId]) => {
      if (transactionId) {
        content += `${key}: ${transactionId}\n`;
      }
    });
    content += "\n";
  }

  content += "IMPORTANT NOTES\n";
  content += "-".repeat(30) + "\n";
  content += "• Please bring this registration confirmation to the event\n";
  content += "• Keep your payment receipts safe for verification\n";
  content += "• Contact support if you need to make any changes\n";
  content += "• Arrive at least 15 minutes before your event time\n\n";

  content += "=".repeat(60) + "\n";
  content +=
    "This is an automatically generated document. Please preserve it for your records.\n";
  content += "=".repeat(60);

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Tech-Fiesta-2.0-Registration-${data.registrationId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
