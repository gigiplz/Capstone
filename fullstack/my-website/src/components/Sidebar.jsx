// src/components/Sidebar.jsx
import React from 'react';
import './Sidebar.css';

function StepItem({ index, label, active }) {
  return (
    <li className={`ddc-step ${active ? 'active' : ''}`} aria-current={active ? 'step' : undefined}>
      <span className="ddc-step-index" aria-hidden="true">{index}</span>
      <span className="ddc-step-label">{label}</span>
    </li>
  );
}

/**
 * Sidebar
 * @param {1|2|3} currentStep - 현재 단계 (1: 업로드, 2: 장르 선택, 3: 영상 생성)
 * @param {string} version - 하단 작은 버전 표기(선택)
 */
export default function Sidebar({ currentStep = 1, version = 'v1.0' }) {
  const steps = [
    { label: '이미지 업로드' },
    { label: '장르 선택' },
    { label: '영상 생성' },
  ];

  return (
    <aside className="ddc-sidebar" role="complementary" aria-label="작업 진행 사이드바">
      <div className="ddc-brand">
        {/* Vite 기준 public/logo.png 경로 */}
        <img className="ddc-logo" src="/logo.png" alt="Do DoomChit 로고" />
        <h1 className="ddc-title">Do DoomChit</h1>
      </div>

      <nav className="ddc-steps" aria-label="페이지 진행 단계">
        <ol>
          {steps.map((s, i) => (
            <StepItem
              key={s.label}
              index={i + 1}
              label={s.label}
              active={currentStep === i + 1}
            />
          ))}
        </ol>
      </nav>

      <div className="ddc-footer">
        <span className="ddc-version">{version}</span>
      </div>
    </aside>
  );
}
