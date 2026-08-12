"use client";

export const REGISTRATION_COMPLETE_PENDING_KEY =
  "approve_lawyers_registration_complete_pending";
export const REGISTRATION_COMPLETE_TRACKED_KEY =
  "approve_lawyers_registration_complete_tracked";

type GtagCommand = "js" | "config" | "event";

type GtagEventParams = {
  method?: string;
} & Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: GtagCommand,
      target: string | Date,
      params?: GtagEventParams,
    ) => void;
  }
}

export function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

export function logGtag(message: string, metadata?: Record<string, string>) {
  if (!isDevelopment()) {
    return;
  }

  if (metadata) {
    console.info(`[gtag] ${message}`, metadata);
    return;
  }

  console.info(`[gtag] ${message}`);
}

export function markRegistrationCompletePending() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(REGISTRATION_COMPLETE_PENDING_KEY, "true");
  logGtag("Pending registration_complete marker set");
}

export function isRegistrationCompletePending() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.sessionStorage.getItem(REGISTRATION_COMPLETE_PENDING_KEY) === "true"
  );
}

export function hasTrackedRegistrationComplete() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.sessionStorage.getItem(REGISTRATION_COMPLETE_TRACKED_KEY) === "true"
  );
}

export function markRegistrationCompleteTracked() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(REGISTRATION_COMPLETE_TRACKED_KEY, "true");
  window.sessionStorage.removeItem(REGISTRATION_COMPLETE_PENDING_KEY);
  logGtag("registration_complete marked as tracked");
}

export function trackRegistrationComplete() {
  return trackPortalEvent("registration_complete", {
    method: "otp",
  });
}

export function trackPortalEvent(
  eventName: string,
  params?: GtagEventParams,
) {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof window.gtag !== "function") {
    logGtag("window.gtag is not available yet");
    return false;
  }

  window.gtag("event", eventName, params);
  logGtag(`${eventName} event sent`, stringifyMetadata(params));
  return true;
}

function stringifyMetadata(params?: GtagEventParams) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, `${value}`]),
  );
}

export function trackDashboardViewed(hasCases: boolean) {
  return trackPortalEvent("dashboard_viewed", {
    has_cases: hasCases,
    next_step: hasCases ? "resume_case" : "start_case",
  });
}

export function trackCaseStarted(entryPoint: string) {
  return trackPortalEvent("case_started", {
    entry_point: entryPoint,
  });
}

export function trackCaseStepCompleted(stepIndex: number, stepLabel: string) {
  return trackPortalEvent("case_step_completed", {
    step_index: stepIndex + 1,
    step_label: stepLabel,
  });
}

export function trackCaseSubmitted(fileCount: number) {
  return trackPortalEvent("case_submitted", {
    files_attached: fileCount,
  });
}
