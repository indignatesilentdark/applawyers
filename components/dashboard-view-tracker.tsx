"use client";

import { useEffect } from "react";
import { trackDashboardViewed } from "@/lib/gtag";

type DashboardViewTrackerProps = {
  hasCases: boolean;
};

export function DashboardViewTracker({
  hasCases,
}: DashboardViewTrackerProps) {
  useEffect(() => {
    trackDashboardViewed(hasCases);
  }, [hasCases]);

  return null;
}
