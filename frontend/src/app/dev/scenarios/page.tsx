import { canEnableDevTools } from "@/config";
import { ScenarioDevPanel } from "@/mocks";
import { notFound } from "next/navigation";

export default function ScenariosPage() {
  if (!canEnableDevTools()) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <h1 className="font-display text-3xl font-semibold">Dev scenarios</h1>
      <ScenarioDevPanel />
    </main>
  );
}
