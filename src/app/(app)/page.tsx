"use client";

import { useState } from "react";
import HomePage from "@/components/feature/HomePage";
import GeneratorApp from "@/components/feature/GeneratorApp";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  return isStarted ? (
    <GeneratorApp />
  ) : (
    <HomePage onStart={() => setIsStarted(true)} />
  );
}
