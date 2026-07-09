"use client";

import { useEffect } from "react";
import { greenolaConfig } from "@/lib/greenola/config";
import { initGreenolaApp } from "@/lib/greenola/init";
import { GreenolaMarkup } from "@/components/GreenolaMarkup";

export function GreenolaApp() {
  useEffect(() => {
    window.GREENOLA_CONFIG = greenolaConfig;
    initGreenolaApp();
  }, []);

  return <GreenolaMarkup />;
}
