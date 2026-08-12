"use client";

import { useEffect } from "react";

import {
  hasTrackedRegistrationComplete,
  isRegistrationCompletePending,
  logGtag,
  markRegistrationCompleteTracked,
  trackRegistrationComplete,
} from "@/lib/gtag";

export function OnboardingRegistrationTracker() {
  useEffect(() => {
    if (hasTrackedRegistrationComplete()) {
      logGtag("registration_complete already tracked this session");
      return;
    }

    if (!isRegistrationCompletePending()) {
      logGtag("No pending registration_complete marker found");
      return;
    }

    let attempts = 0;

    const tryTrack = () => {
      attempts += 1;

      const tracked = trackRegistrationComplete();

      if (!tracked) {
        if (attempts >= 8) {
          logGtag("registration_complete was not sent after retries");
          return;
        }

        window.setTimeout(tryTrack, 500);
        return;
      }

      markRegistrationCompleteTracked();
    };

    tryTrack();
  }, []);

  return null;
}
