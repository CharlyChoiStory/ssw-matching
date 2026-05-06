"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { calculateMatches, loadJobs, loadSeniors } from "../data";

type Filter = "all" | "high" | "review";

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<main className="page-shell">추천 목록을 불러오는 중입니다.</main>}>
      <RecommendationsContent />
    </Suspense>
  );
}

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const seniorId = searchParams.get("senior_id") ?? "";
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const { seniors, jobs, matches } = useMemo(() => {
    const loadedSeniors = loadSeniors();
    const loadedJobs = loadJobs();
    return {
      seniors: loadedSeniors,
      jobs: loadedJobs,
      matches: calculateMatches(loadedSeniors, loadedJobs)
    };
  }, []);

  const visibleMatches = matches
    .filter((match) => (seniorId ? match.seniorId === seniorId : true))
    .filter((match) => {
      if (filter === "high") return match.score >= 5;
      if (filter === "review") return match.score >= 1 && match.score <= 4;
      return match.score > 0;
    })
    .filter((match) => {
      const senior = seniors.find((item) => item.id === match.seniorId);
      const job = jobs.find((item) => item.id === match.jobId);
      const keyword = query.trim().toLowerCase();
      if (!keyword) return true;
      return [senior?.name, senior?.region, job?.region, job?.title]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">자동 매칭 결과</p>
        <h1>추천 일자리 목록</h1>
        <p>지역 +3점, 직종 +2점, 경력 +1점 기준으로 높은 점수부터 보여줍니다.</p>
      </section>

      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="추천 필터">
          <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>
            전체
          </button>
          <button className={filter === "high" ? "selected" : ""} onClick={() => setFilter("high")}>
            고점수
          </button>
          <button className={filter === "review" ? "selected" : ""} onClick={() => setFilter("review")}>
            검토 필요
          </button>
        </div>
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="이름 또는 지역 검색"
        />
      </div>

      {visibleMatches.length === 0 ? (
        <div className="empty-state">
          현재 매칭되는 일자리가 없습니다. <Link href="/admin">관리자 화면에서 일자리를 추가해보세요.</Link>
        </div>
      ) : (
        <section className="recommendation-grid">
          {visibleMatches.map((match) => {
            const senior = seniors.find((item) => item.id === match.seniorId);
            const job = jobs.find((item) => item.id === match.jobId);
            if (!senior || !job) return null;

            return (
              <article className="match-card" key={match.id}>
                <div className="card-row">
                  <h2>
                    {senior.name} → {job.title}
                  </h2>
                  <span className={`score-badge score-${match.score}`}>{match.score}점 / 6점</span>
                </div>
                <div className="badge-row">
                  <span>지역 +{match.scoreRegion}</span>
                  <span>직종 +{match.scoreJob}</span>
                  <span>경력 +{match.scoreCareer}</span>
                </div>
                <p className="meta-line">
                  {senior.region} · {senior.desiredJob} · 경력 {senior.careerYears}년
                </p>
                <p className="meta-line">
                  공고 조건: {job.region} · {job.jobType} · 요구 {job.requiredCareer}년
                </p>
                <button className="secondary-button">추천 확정</button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
