"use client";

import { Suspense } from "react";
import RegistrationForm from "@/components/RegistrationForm";

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationForm />
    </Suspense>
  );
}
