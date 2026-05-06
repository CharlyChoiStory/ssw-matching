"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  calculateMatches,
  jobTypes,
  loadJobs,
  loadSeniors,
  newId,
  regions,
  saveJobs,
  type Job,
  type JobType,
  type Region
} from "../data";

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState<Region>("서울특별시");
  const [jobType, setJobType] = useState<JobType>("경비");
  const [requiredCareer, setRequiredCareer] = useState(0);
  const [error, setError] = useState("");
  const [lastRematchedAt, setLastRematchedAt] = useState(new Date().toLocaleString("ko-KR"));

  const seniors = useMemo(() => loadSeniors(), []);
  const matches = calculateMatches(seniors, jobs);
  const seniorSummaries = seniors.map((senior) => {
    const seniorMatches = matches.filter((match) => match.seniorId === senior.id);
    const bestScore = seniorMatches[0]?.score ?? 0;

    return {
      senior,
      bestScore,
      status: bestScore > 0 ? "pending" : "unmatched"
    };
  });

  const kpis = {
    seniors: seniors.length,
    pending: seniorSummaries.filter((item) => item.status === "pending").length,
    unmatched: seniorSummaries.filter((item) => item.status === "unmatched").length
  };

  function handleAddJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length < 2) {
      setError("공고명은 2자 이상 입력해주세요.");
      return;
    }

    const nextJobs = [
      {
        id: newId("job"),
        title: title.trim(),
        region,
        jobType,
        requiredCareer,
        createdAt: new Date().toISOString()
      },
      ...jobs
    ];

    setJobs(nextJobs);
    saveJobs(nextJobs);
    setTitle("");
    setRegion("서울특별시");
    setJobType("경비");
    setRequiredCareer(0);
    setError("");
    setLastRematchedAt(new Date().toLocaleString("ko-KR"));
  }

  function handleDeleteJob(jobId: string) {
    const nextJobs = jobs.filter((job) => job.id !== jobId);
    setJobs(nextJobs);
    saveJobs(nextJobs);
    setLastRematchedAt(new Date().toLocaleString("ko-KR"));
  }

  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">담당자 화면</p>
        <h1>관리자 대시보드</h1>
        <p>일자리 공고를 관리하고 시니어별 최고 매칭 점수를 확인합니다.</p>
      </section>

      <section className="kpi-grid" aria-label="핵심 지표">
        <article className="kpi-card blue">
          <span>등록 시니어</span>
          <strong>{kpis.seniors}</strong>
        </article>
        <article className="kpi-card green">
          <span>매칭 대기</span>
          <strong>{kpis.pending}</strong>
        </article>
        <article className="kpi-card orange">
          <span>미매칭</span>
          <strong>{kpis.unmatched}</strong>
        </article>
      </section>

      <section className="admin-layout">
        <div className="panel">
          <div className="panel-heading">
            <h2>일자리 추가</h2>
            <p>저장하면 전체 매칭 결과가 바로 갱신됩니다.</p>
          </div>

          {error ? <div className="notice error">{error}</div> : null}

          <form className="compact-form" onSubmit={handleAddJob}>
            <label>
              공고명
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 관악구 경비원 모집" />
            </label>
            <label>
              지역
              <select value={region} onChange={(event) => setRegion(event.target.value as Region)}>
                {regions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              직종
              <select value={jobType} onChange={(event) => setJobType(event.target.value as JobType)}>
                {jobTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              요구 경력
              <input
                type="number"
                min="0"
                max="50"
                value={requiredCareer}
                onChange={(event) => setRequiredCareer(Number(event.target.value))}
              />
            </label>
            <button className="primary-button" type="submit">
              일자리 등록
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>매칭 재실행</h2>
            <p>마지막 실행: {lastRematchedAt}</p>
          </div>
          <button className="secondary-button wide" onClick={() => setLastRematchedAt(new Date().toLocaleString("ko-KR"))}>
            전체 재매칭 실행
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>일자리 목록</h2>
          <p>현재 {jobs.length}개의 공고가 등록되어 있습니다.</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>공고명</th>
                <th>지역</th>
                <th>직종</th>
                <th>요구 경력</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.region}</td>
                  <td>{job.jobType}</td>
                  <td>{job.requiredCareer}년</td>
                  <td>
                    <button className="text-button danger" onClick={() => handleDeleteJob(job.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>시니어 목록</h2>
          <p>최고 점수 기준으로 상태를 표시합니다.</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>지역</th>
                <th>희망 직종</th>
                <th>최고 점수</th>
                <th>상태</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {seniorSummaries.map(({ senior, bestScore, status }) => (
                <tr key={senior.id}>
                  <td>{senior.name}</td>
                  <td>{senior.region}</td>
                  <td>{senior.desiredJob}</td>
                  <td>{bestScore}점</td>
                  <td>
                    <span className={`status-pill ${status}`}>{status === "pending" ? "매칭 대기" : "미매칭"}</span>
                  </td>
                  <td>
                    <Link className="text-button" href={`/recommendations?senior_id=${senior.id}`}>
                      보기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
