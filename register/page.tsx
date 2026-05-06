"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { jobTypes, loadSeniors, newId, regions, saveSeniors, type JobType, type Region } from "../data";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState<Region>("서울특별시");
  const [desiredJob, setDesiredJob] = useState<JobType>("경비");
  const [careerYears, setCareerYears] = useState(0);
  const [error, setError] = useState("");
  const [savedSeniorId, setSavedSeniorId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedSeniorId("");

    if (name.trim().length < 2) {
      setError("이름은 2자 이상 입력해주세요.");
      return;
    }

    if (careerYears < 0 || careerYears > 50) {
      setError("경력은 0년부터 50년 사이로 입력해주세요.");
      return;
    }

    const senior = {
      id: newId("senior"),
      name: name.trim(),
      region,
      desiredJob,
      careerYears,
      createdAt: new Date().toISOString()
    };

    saveSeniors([senior, ...loadSeniors()]);
    setError("");
    setSavedSeniorId(senior.id);
    setName("");
    setRegion("서울특별시");
    setDesiredJob("경비");
    setCareerYears(0);
  }

  return (
    <main className="page-shell narrow">
      <section className="page-title">
        <p className="eyebrow">Day 2 로컬 프로토타입</p>
        <h1>시니어 프로필 등록</h1>
        <p>입력한 정보는 이 브라우저에만 저장되고, 추천 점수는 즉시 다시 계산됩니다.</p>
      </section>

      <div className="stepper" aria-label="진행 단계">
        <span className="active">정보 입력</span>
        <span>제출 완료</span>
      </div>

      {error ? <div className="notice error">{error}</div> : null}
      {savedSeniorId ? (
        <div className="notice success">
          등록이 완료되었습니다.{" "}
          <Link href={`/recommendations?senior_id=${savedSeniorId}`}>추천 일자리 보기</Link>
        </div>
      ) : null}

      <form className="form-panel" onSubmit={handleSubmit}>
        <label>
          이름
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 홍길동"
            autoComplete="name"
          />
          <small>2자 이상 입력해주세요.</small>
        </label>

        <label>
          거주 지역
          <select value={region} onChange={(event) => setRegion(event.target.value as Region)}>
            {regions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <small>현재 Day 2 실습 범위에서는 광역 지역만 선택합니다.</small>
        </label>

        <label>
          희망 직종
          <select value={desiredJob} onChange={(event) => setDesiredJob(event.target.value as JobType)}>
            {jobTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <small>담당자가 등록한 일자리 직종과 비교됩니다.</small>
        </label>

        <label>
          경력 연수
          <input
            type="number"
            min="0"
            max="50"
            value={careerYears}
            onChange={(event) => setCareerYears(Number(event.target.value))}
          />
          <small>일자리 요구 경력 이상이면 1점이 더해집니다.</small>
        </label>

        <button className="primary-button" type="submit">
          등록하고 매칭 계산
        </button>
      </form>
    </main>
  );
}
