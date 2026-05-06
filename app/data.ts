"use client";

export type Region =
  | "서울특별시"
  | "부산광역시"
  | "대구광역시"
  | "인천광역시"
  | "광주광역시"
  | "대전광역시"
  | "울산광역시"
  | "세종특별자치시"
  | "경기도"
  | "강원도"
  | "충청북도"
  | "충청남도"
  | "전라북도"
  | "전라남도"
  | "경상북도"
  | "경상남도"
  | "제주특별자치도";
export type JobType = "경비" | "청소" | "조리" | "돌봄" | "기타";

export type Senior = {
  id: string;
  name: string;
  region: string;
  desiredJob: JobType;
  careerYears: number;
  createdAt: string;
};

export type Job = {
  id: string;
  title: string;
  region: string;
  jobType: JobType;
  requiredCareer: number;
  createdAt: string;
};

export type Match = {
  id: string;
  seniorId: string;
  jobId: string;
  score: number;
  scoreRegion: number;
  scoreJob: number;
  scoreCareer: number;
  status: "pending" | "assigned" | "done";
  createdAt: string;
};

export const regions: Region[] = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도"
];
export const jobTypes: JobType[] = ["경비", "청소", "조리", "돌봄", "기타"];

const seniorsKey = "sangsangwoori:seniors";
const jobsKey = "sangsangwoori:jobs";

export const starterSeniors: Senior[] = [
  {
    id: "senior-1",
    name: "홍길동",
    region: "서울특별시",
    desiredJob: "경비",
    careerYears: 5,
    createdAt: new Date("2026-05-01T09:00:00").toISOString()
  },
  {
    id: "senior-2",
    name: "김영희",
    region: "경기",
    desiredJob: "돌봄",
    careerYears: 8,
    createdAt: new Date("2026-05-01T10:00:00").toISOString()
  }
];

export const starterJobs: Job[] = [
  {
    id: "job-1",
    title: "관악구 경비원 모집",
    region: "서울",
    jobType: "경비",
    requiredCareer: 3,
    createdAt: new Date("2026-05-01T11:00:00").toISOString()
  },
  {
    id: "job-2",
    title: "분당 돌봄 지원 담당",
    region: "경기도",
    jobType: "돌봄",
    requiredCareer: 5,
    createdAt: new Date("2026-05-01T12:00:00").toISOString()
  },
  {
    id: "job-3",
    title: "인천 급식 조리 보조",
    region: "인천",
    jobType: "조리",
    requiredCareer: 1,
    createdAt: new Date("2026-05-01T13:00:00").toISOString()
  }
];

export function normalizeRegion(region: string): string {
  return region
    .replace(/특별시|광역시|특별자치시|특별자치도/g, "")
    .replace(/도$/g, "")
    .trim();
}

export function calculateMatch(senior: Senior, job: Job): Omit<Match, "id" | "status" | "createdAt"> {
  const scoreRegion = normalizeRegion(senior.region) === normalizeRegion(job.region) ? 3 : 0;
  const scoreJob = senior.desiredJob.trim() === job.jobType.trim() ? 2 : 0;
  const scoreCareer = senior.careerYears >= job.requiredCareer ? 1 : 0;

  return {
    seniorId: senior.id,
    jobId: job.id,
    score: scoreRegion + scoreJob + scoreCareer,
    scoreRegion,
    scoreJob,
    scoreCareer
  };
}

export function calculateMatches(seniors: Senior[], jobs: Job[]): Match[] {
  const now = new Date().toISOString();

  return seniors
    .flatMap((senior) =>
      jobs.map((job) => ({
        id: `${senior.id}:${job.id}`,
        ...calculateMatch(senior, job),
        status: "pending" as const,
        createdAt: now
      }))
    )
    .sort((a, b) => b.score - a.score);
}

export function loadSeniors(): Senior[] {
  return loadList(seniorsKey, starterSeniors);
}

export function saveSeniors(seniors: Senior[]) {
  window.localStorage.setItem(seniorsKey, JSON.stringify(seniors));
}

export function loadJobs(): Job[] {
  return loadList(jobsKey, starterJobs);
}

export function saveJobs(jobs: Job[]) {
  window.localStorage.setItem(jobsKey, JSON.stringify(jobs));
}

function loadList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") {
    return fallback;
  }

  const saved = window.localStorage.getItem(key);
  if (!saved) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(saved) as T[];
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
