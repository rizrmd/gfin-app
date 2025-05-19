import type { aiOnboard } from "@/lib/ai/onboard";
import { type FC } from "react";

export const SummaryQA: FC<{
  ai: ReturnType<typeof aiOnboard>;
}> = ({ ai }) => {
  const qa_final = ai.local.qa_final;
  return (
    <div className="flex flex-col items-stretch gap-2">
      {Object.entries(qa_final).map(([q, a]) => {
        return (
          <div key={q} className="flex flex-col">
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900">Q:</span>
              <span className="text-gray-700">{q}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900">A:</span>
              <span className="text-gray-700">
                {typeof a} {a}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
