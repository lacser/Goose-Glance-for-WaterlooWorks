import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { getJob, subscribeJob, JobRecord } from "./useIndexedDB";

export type SummaryData = {
  job_title?: string;
  company_name?: string;
  key_roles?: string[];
  technical_skills?: string[];
  soft_skills?: string[];
  working_country_iso3166_alpha2?: string;
  working_location?: string;
  work_type?: string;
  work_term_year?: number[];
  work_term_month?: string[];
  work_term_date?: number[];
  driver_license?: string;
  speak_french?: string;
  background_check?: boolean;
  canadian_citizen_or_pr?: string;
  other_special_requirements?: string[];
};

function parseSummary(summary: string | null | undefined): SummaryData | null {
  if (!summary) return null;
  try {
    const obj = JSON.parse(summary);
    return obj ?? null;
  } catch (e) {
    console.error("Failed to parse summary JSON:", e);
    return null;
  }
}

export function useJobData(jobId?: string) {
  const onJobId = useAppSelector((s) => s.waterlooworks.onJobId);
  const effectiveJobId = jobId ?? onJobId ?? null;

  const [record, setRecord] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    async function load() {
      if (!effectiveJobId) {
        setRecord(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rec = await getJob(effectiveJobId);
        if (!cancelled) setRecord(rec);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to read IndexedDB");
      } finally {
        if (!cancelled) setLoading(false);
      }
      // 订阅变更
      unsubscribe = subscribeJob(effectiveJobId, async () => {
        try {
          const rec = await getJob(effectiveJobId);
          if (!cancelled) setRecord(rec);
        } catch {
          // ignore
        }
      });
    }
    load();
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [effectiveJobId]);

  const parsed = useMemo(() => parseSummary(record?.summary), [record?.summary]);

  return {
    id: effectiveJobId,
    description: record?.description ?? null,
    rawSummary: record?.summary ?? null,
    summary: parsed,
    loading,
    error,
  };
}

export function useJobSummary(jobId?: string) {
  const data = useJobData(jobId);
  return {
    id: data.id,
    summary: data.summary,
    loading: data.loading,
    error: data.error,
  };
}
