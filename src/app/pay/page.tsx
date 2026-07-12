"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PayComponent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>("Initializing secure environment...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryOptions, setRetryOptions] = useState<any>(null);

  useEffect(() => {
    // 1. Get options from search parameters
    const key = searchParams.get("key");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency") || "INR";
    const name = searchParams.get("name") || "Tech Fiesta 2026";
    const description = searchParams.get("description") || "Registration Fee";
    const prefill_name = searchParams.get("prefill_name") || "";
    const prefill_email = searchParams.get("prefill_email") || "";
    const prefill_contact = searchParams.get("prefill_contact") || "";
    const theme_color = searchParams.get("theme_color") || "#DC2626";
    const college = searchParams.get("college") || "";
    const department = searchParams.get("department") || "";
    const origin = searchParams.get("origin") || "*";

    if (!key || !orderId || !amount) {
      setStatus("Error");
      setErrorMessage("Invalid payment credentials or missing order parameters.");
      return;
    }

    // 2. Function to load Razorpay Script
    const loadScript = () => {
      return new Promise((resolve) => {
        if ((window as any).Razorpay) {
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

    const initializePayment = async () => {
      setStatus("Loading payment gateway...");
      const loaded = await loadScript();
      if (!loaded) {
        setStatus("Error");
        setErrorMessage("Failed to load payment script. Check your internet connection.");
        return;
      }

      setStatus("Opening secure Razorpay modal...");

      const options = {
        key,
        amount: Number(amount),
        currency,
        name,
        description,
        image: "/tech_fiesta_odyssey.png",
        order_id: orderId,
        prefill: {
          name: prefill_name,
          email: prefill_email,
          contact: prefill_contact,
        },
        notes: {
          college,
          department,
        },
        theme: {
          color: theme_color,
        },
        handler: function (response: any) {
          setStatus("Payment successful! Finalizing registration...");
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "payment.success",
                data: response,
              },
              origin
            );
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            setStatus("Success");
            setErrorMessage("Payment successful! You can close this window now.");
          }
        },
        modal: {
          ondismiss: function () {
            setStatus("Payment cancelled");
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "payment.failed",
                  data: { message: "Payment cancelled by user" },
                },
                origin
              );
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              setErrorMessage("Payment was cancelled. Please try again.");
            }
          },
        },
      };

      setRetryOptions(options);

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          console.error("Payment failed inside secure window:", response.error);
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "payment.failed",
                data: response.error,
              },
              origin
            );
            setTimeout(() => {
              window.close();
            }, 1500);
          } else {
            setStatus("Failed");
            setErrorMessage(response.error.description || "Payment failed");
          }
        });
        rzp.open();
      } catch (err: any) {
        setStatus("Error");
        setErrorMessage(err.message || "Failed to initialize checkout.");
      }
    };

    initializePayment();
  }, [searchParams]);

  const handleManualOpen = () => {
    if (retryOptions) {
      try {
        const rzp = new (window as any).Razorpay(retryOptions);
        rzp.open();
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to initialize checkout.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 relative font-mono select-text">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center mix-blend-luminosity"
        style={{ backgroundImage: "url('/vintage_map.png')" }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none" />

      <div className="max-w-md w-full p-8 rounded-2xl bg-black/90 border border-red-500/30 backdrop-blur-md shadow-[0_0_35px_rgba(220,38,38,0.15)] text-center relative z-10">
        <img
          src="/tech_fiesta_odyssey.png"
          alt="Tech Fiesta"
          className="h-16 mx-auto mb-6 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        />

        <h2 className="text-xl font-bold tracking-widest text-red-500 mb-2 uppercase">// SECURE PAYMENT BRIDGE</h2>
        
        <div className="w-12 h-0.5 bg-red-500/50 mx-auto my-4 animate-pulse" />

        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          {status}
        </p>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300 text-xs text-left">
            <span className="font-bold block mb-1">Details:</span>
            {errorMessage}
          </div>
        )}

        {status === "Payment cancelled" && retryOptions && (
          <button
            onClick={handleManualOpen}
            className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold uppercase transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:scale-[1.02]"
          >
            Retry Payment
          </button>
        )}

        <p className="text-[10px] text-gray-500 mt-8 font-mono">
          Powered by Razorpay Secure. Do not close this window manually until the transaction is finalized.
        </p>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center font-mono">
        Loading Payment Gateway...
      </div>
    }>
      <PayComponent />
    </Suspense>
  );
}
