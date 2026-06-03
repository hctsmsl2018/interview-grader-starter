"use client";

import { useCallback, useEffect, useState } from "react";
import { Grader, Result, updateJobReference, listGraders, runGrader, getJobResults } from "@/lib/api";

interface JobDetailClientProps {
  jobId: number;
  initialReferenceOutput: string | null;
}

export default function JobDetailClient({
  jobId,
  initialReferenceOutput,
}: JobDetailClientProps) {
  const [referenceOutput, setReferenceOutput] = useState(
    initialReferenceOutput || ""
  );
  const [isEditingReference, setIsEditingReference] = useState(false);
  const [isSavingReference, setIsSavingReference] = useState(false);

  const [graders, setGraders] = useState<Grader[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isRunningGrader, setIsRunningGrader] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load graders and results on mount
    const loadData = async () => {
      try {
        const gradersData = await listGraders();
        setGraders(gradersData);

        const resultsData = await getJobResults(jobId);
        setResults(resultsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    };

    loadData();
  }, [jobId]);

  const handleSaveReference = useCallback(async () => {
    setIsSavingReference(true);
    try {
      await updateJobReference(jobId, referenceOutput);
      setIsEditingReference(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reference");
    } finally {
      setIsSavingReference(false);
    }
  }, [jobId, referenceOutput]);

  const handleRunGrader = useCallback(
    async (graderId: number) => {
      setIsRunningGrader(graderId);
      try {
        const newResult = await runGrader(graderId, jobId);
        setResults((prev) => [newResult, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to run grader");
      } finally {
        setIsRunningGrader(null);
      }
    },
    [jobId]
  );

  const getGraderName = (graderId: number) => {
    const grader = graders.find((g) => g.id === graderId);
    return grader?.name || `Grader ${graderId}`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Reference Output Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Reference Output
          </p>
          <button
            onClick={() => setIsEditingReference(!isEditingReference)}
            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            {isEditingReference ? "Cancel" : "Edit"}
          </button>
        </div>
        {isEditingReference ? (
          <div>
            <textarea
              value={referenceOutput}
              onChange={(e) => setReferenceOutput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm font-mono mb-2"
              rows={4}
            />
            <button
              onClick={handleSaveReference}
              disabled={isSavingReference}
              className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSavingReference ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
            {referenceOutput || "(No reference output set)"}
          </p>
        )}
      </div>

      {/* Graders Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Available Graders
        </p>
        {graders.length === 0 ? (
          <p className="text-sm text-gray-500">No graders available</p>
        ) : (
          <div className="space-y-2">
            {graders.map((grader) => (
              <div
                key={grader.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{grader.name}</p>
                  <p className="text-xs text-gray-500">
                    {grader.type} • {grader.evaluation_metric} • threshold:{" "}
                    {grader.pass_threshold}
                  </p>
                </div>
                <button
                  onClick={() => handleRunGrader(grader.id)}
                  disabled={isRunningGrader === grader.id || !referenceOutput}
                  className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isRunningGrader === grader.id ? "Running..." : "Run"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Evaluation Results
        </p>
        {results.length === 0 ? (
          <p className="text-sm text-gray-500">No evaluations yet</p>
        ) : (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                className={`p-3 border rounded ${
                  result.passed
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getGraderName(result.grader_id)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        result.passed ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.passed ? "✓ Passed" : "✗ Failed"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-gray-900">
                      {(result.score * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
