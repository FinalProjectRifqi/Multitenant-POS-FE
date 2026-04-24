"use client";

import { getErrorMessage } from "@/lib/api/client";
import { useHealthQuery } from "@/lib/queries/health";

export function HealthStatusCard() {
  const { data, error, isError, isFetching, isPending, refetch } =
    useHealthQuery();

  return (
    <section className="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Health Check</h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isFetching ? "Refreshing..." : "Refetch"}
        </button>
      </div>

      {isPending && (
        <p className="text-sm text-zinc-600">
          Fetching status from /api/health...
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600">Error: {getErrorMessage(error)}</p>
      )}

      {data && (
        <dl className="space-y-2 text-sm text-zinc-700">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <dt className="font-medium">Status</dt>
            <dd className="font-mono text-zinc-900">{data.status}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-medium">Timestamp</dt>
            <dd className="font-mono text-zinc-900">{data.timestamp}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
