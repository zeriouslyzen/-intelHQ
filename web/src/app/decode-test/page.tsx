import DecodeTestPanel from "@/components/DecodeTestPanel";

export default function DecodeTestPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3">
        <h1 className="text-sm font-semibold text-amber-900">
          Decode test (no LLM)
        </h1>
        <p className="mt-1 text-xs text-amber-800">
          Why it matters + ELI5 from lookup; Decode badges from phrase lists.
          Switch to Live to run decode on real conflict headlines.
        </p>
      </div>
      <DecodeTestPanel />
    </div>
  );
}
