"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Grader, listGraders, createGrader } from "@/lib/api";

export default function GradersPage() {
  const [graders, setGraders] = useState<Grader[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "text_similarity",
    evaluation_metric: "fuzzy_match",
    pass_threshold: "0.7",
  });

  useEffect(() => {
    const loadGraders = async () => {
      try {
        const data = await listGraders();
        setGraders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load graders");
      }
    };
    loadGraders();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
      setIsCreating(true);

      try {
        const pass_threshold = parseFloat(formData.pass_threshold);

        if (isNaN(pass_threshold) || pass_threshold <= 0 || pass_threshold > 1) {
          setError("Pass threshold must be a number between 0 and 1");
          setIsCreating(false);
          return;
        }

        if (!formData.name.trim()) {
          setError("Grader name is required");
          setIsCreating(false);
          return;
        }

        const newGrader = await createGrader({
          name: formData.name,
          type: formData.type,
          evaluation_metric: formData.evaluation_metric,
          pass_threshold,
        });

        setGraders((prev) => [...prev, newGrader]);
        setSuccess(`Grader "${newGrader.name}" created successfully!`);
        setFormData({
          name: "",
          type: "text_similarity",
          evaluation_metric: "fuzzy_match",
          pass_threshold: "0.7",
        });

        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create grader");
      } finally {
        setIsCreating(false);
      }
    },
    [formData]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Graders</h1>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back to jobs
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Create Grader Form */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Grader
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grader Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Fuzzy Matcher"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
              >
                <option value="text_similarity">Text Similarity</option>
                <option value="score_model">Score Model</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evaluation Metric
              </label>
              <select
                value={formData.evaluation_metric}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    evaluation_metric: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
              >
                <option value="fuzzy_match">Fuzzy Match</option>
                <option value="cosine">Cosine Similarity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pass Threshold (0-1)
              </label>
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={formData.pass_threshold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pass_threshold: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Score must be at or above this threshold to pass
              </p>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isCreating ? "Creating..." : "Create Grader"}
            </button>
          </form>
        </div>

        {/* Existing Graders List */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Saved Graders
          </h2>
          {graders.length === 0 ? (
            <p className="text-sm text-gray-500">No graders created yet</p>
          ) : (
            <div className="space-y-3">
              {graders.map((grader) => (
                <div
                  key={grader.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {grader.name}
                  </p>
                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                    <p>
                      <span className="font-medium">Type:</span> {grader.type}
                    </p>
                    <p>
                      <span className="font-medium">Metric:</span>{" "}
                      {grader.evaluation_metric}
                    </p>
                    <p>
                      <span className="font-medium">Threshold:</span>{" "}
                      {(grader.pass_threshold * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
