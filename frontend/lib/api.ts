const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export interface Job {
  id: number;
  title: string;
  prompt: string;
  model_output: string;
  reference_output: string | null;
  created_at: string;
}

export interface Grader {
  id: number;
  type: string;
  name: string;
  pass_threshold: number;
  evaluation_metric: string;
}

export interface Result {
  id: number;
  job_id: number;
  grader_id: number;
  score: number;
  passed: boolean;
  created_at: string;
}

export async function listJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/jobs`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json();
}

export async function getJob(id: number): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch job: ${res.status}`);
  return res.json();
}

export async function updateJobReference(
  id: number,
  reference_output: string
): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}/reference`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference_output }),
  });
  if (!res.ok) throw new Error(`Failed to update job reference: ${res.status}`);
  return res.json();
}

export async function listGraders(): Promise<Grader[]> {
  const res = await fetch(`${API_BASE}/graders`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch graders: ${res.status}`);
  return res.json();
}

export async function createGrader(grader: {
  type: string;
  name: string;
  pass_threshold: number;
  evaluation_metric: string;
}): Promise<Grader> {
  const res = await fetch(`${API_BASE}/graders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grader),
  });
  if (!res.ok) throw new Error(`Failed to create grader: ${res.status}`);
  return res.json();
}

export async function getJobResults(jobId: number): Promise<Result[]> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/results`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  return res.json();
}

export async function runGrader(
  graderId: number,
  jobId: number
): Promise<Result> {
  const res = await fetch(`${API_BASE}/graders/${graderId}/run/${jobId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to run grader: ${res.status}`);
  return res.json();
}
