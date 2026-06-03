import Link from "next/link";
import { listJobs } from "@/lib/api";

export default async function HomePage() {
  const jobs = await listJobs().catch(() => null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Jobs</h1>
        <Link
          href="/graders"
          className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          Manage Graders
        </Link>
      </div>
      {!jobs ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load jobs. Make sure the backend is running on 127.0.0.1:8001.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prompt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model Output
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {job.prompt}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {job.model_output}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
