import { HealthStatusCard } from "@/components/health-status-card";

const envSnippet = `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api`;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 bg-zinc-50 px-6 py-16 sm:px-8">
      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Axios + TanStack Query + Zod Starter
        </h1>
        <p className="text-sm leading-6 text-zinc-600 sm:text-base">
          This project is now wired with a typed API client, schema-based
          response validation, and React Query provider setup.
        </p>
      </section>

      <HealthStatusCard />

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Where to start</h2>
        <ul className="space-y-2 text-sm text-zinc-700">
          <li>
            API client: <code className="font-mono">lib/api/client.ts</code>
          </li>
          <li>
            Query provider: <code className="font-mono">app/providers.tsx</code>
          </li>
          <li>
            Zod schema example:{" "}
            <code className="font-mono">lib/schemas/health.ts</code>
          </li>
          <li>
            Query hook example:{" "}
            <code className="font-mono">lib/queries/health.ts</code>
          </li>
          <li>
            Sample endpoint:{" "}
            <code className="font-mono">app/api/health/route.ts</code>
          </li>
        </ul>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-800">
            Optional environment variable
          </p>
          <pre className="overflow-x-auto rounded-md bg-zinc-900 px-3 py-2 text-xs text-zinc-100 sm:text-sm">
            {envSnippet}
          </pre>
        </div>
      </section>
    </main>
  );
}
