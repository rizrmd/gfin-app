import { useConversation } from "@11labs/react";
import { useEffect } from "react";
import { api } from "../gen/api";
import { useLocal } from "../hooks/use-local";
import { user } from "../user";
import { aiOnboardLocal } from "./onboard/local";
import { onboardQA } from "./onboard/qa";
import { useAI } from "./use-ai";

export const questions = [
  "What sets your company apart from others in the same field? Any unique qualifications, proprietary technologies, or differentiators that make your company stand out",
  "Have you worked with government agencies, grant officers or contractors before? If so, can you give an example of a successful project or partnership?",
  "Are there any specific types of contracts or grants that interest you the most (e.g., sole-source, competitive, teaming agreements)?",
  "Do you have any existing security clearances or bonding requirements that may impact your ability to work on government contracts?",
  "What is your organization's mission and primary goal? How do these align with the funding opportunity?",
  "Can you provide a brief overview of your company's services and capabilities?",
  "Have you previously been awarded grants or government contracts? If so, can you give an example of a successful project or partnership?",
  "Do you have any existing certifications (e.g., HUBZone, SDVOSB, WOSB) that may be relevant to the funding opportunity?",
];

export const aiOnboard = () => {
  const ai = useAI();
  const conv = useConversation();
  const local = useLocal(aiOnboardLocal({ questions, ai }));

  useEffect(() => {
    const start = async () => {
      const res = await api.ai_onboard({
        mode: "status",
        id: user.organization!.id!,
      });

      if (local.permission !== "granted") {
        const timeout = setTimeout(() => {
          local.permission = "requesting";
          local.render();
        }, 1000);

        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          local.permission = "granted";
          local.render();
        } catch (e) {
          console.error("Error requesting microphone access", e);
          local.permission = "denied";
          local.render();
        }
        clearTimeout(timeout);
      }

      if (local.permission === "denied") {
        return;
      }

      if (res?.organization?.onboard) {
        local.phase = res?.organization?.onboard;
        local.render();
      }

      if (res?.organization?.questions) {
        local.qa_final = res?.organization?.questions;
        local.render();
      }

      if (!local.phase.qa) {
        await onboardQA({ questions, local, conv, ai });
      }
    };

    local.start = start;
    local.render();
    start();
    return () => {};
  }, []);

  return {
    conv,
    local,
  };
};
