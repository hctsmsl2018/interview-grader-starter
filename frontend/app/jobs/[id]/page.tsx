import Link from "next/link";
import { getJob } from "@/lib/api";
import JobDetailClient from "./client";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(Number(id)).catch(() => null);

  if (!job) {
    return (
      <div className="max-w-3xl">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block"
        >
          ← All jobs
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load this job. Make sure the backend is running on 127.0.0.1:8001.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block"
      >
        ← All jobs
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">{job.title}</h1>

      <div className="space-y-4 mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Prompt
          </p>
          <p className="text-sm text-gray-800 font-mono">{job.prompt}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Model Output
          </p>
          <p className="text-sm text-gray-800 font-mono whitespace-pre-wrap">{job.model_output}</p>
        </div>
      </div>

      <JobDetailClient
        jobId={job.id}
        initialReferenceOutput={job.reference_output}
      />
    </div>
  );
}
