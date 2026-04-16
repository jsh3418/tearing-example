import { useState } from "react";
import SafeGrid from "./SafeGrid";
import UnsafeGrid from "./UnsafeGrid";
import "./index.css";

type Tab = "both" | "unsafe" | "safe";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("both");

  return (
    <div className="app">
      <header className="app-header">
        <h1>React 테어링(Tearing) 시뮬레이션</h1>
        <p className="subtitle">
          동시성 렌더링에서 외부 스토어 사용 시 발생하는 UI 불일치 현상
        </p>
        <a
          className="github-link"
          href="https://github.com/jsh3418/tearing-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub에서 보기
        </a>
      </header>

      <div className="concept-box">
        <h3>테어링(Tearing)이란?</h3>
        <p>
          React 18의 동시성 렌더링에서는 렌더링이 <strong>중단</strong>되고{" "}
          <strong>재개</strong>될 수 있습니다. 이때 외부 스토어를 직접 읽으면,
          렌더링 중간에 스토어 값이 변경되어 같은 데이터를 보여줘야 하는
          컴포넌트들이 <strong>서로 다른 값</strong>을 표시하게 됩니다.
        </p>
        <div className="concept-diagram">
          <div className="diagram-step">
            <div className="diagram-icon">1️⃣</div>
            <span>
              셀 렌더링 시작
              <br />
              <small>색상: 빨강</small>
            </span>
          </div>
          <div className="diagram-arrow">→</div>
          <div className="diagram-step highlight">
            <div className="diagram-icon">5ms</div>
            <span>
              time-slice 소진
              <br />
              <small>React가 yield</small>
            </span>
          </div>
          <div className="diagram-arrow">→</div>
          <div className="diagram-step highlight">
            <div className="diagram-icon">⚡</div>
            <span>
              setInterval 실행
              <br />
              <small>스토어: 빨강→파랑</small>
            </span>
          </div>
          <div className="diagram-arrow">→</div>
          <div className="diagram-step torn">
            <div className="diagram-icon">💥</div>
            <span>
              다음 셀은 파랑!
              <br />
              <small>테어링 발생</small>
            </span>
          </div>
        </div>
      </div>

      <nav className="tab-nav">
        <button
          className={activeTab === "both" ? "active" : ""}
          onClick={() => setActiveTab("both")}
        >
          나란히 비교
        </button>
        <button
          className={activeTab === "unsafe" ? "active" : ""}
          onClick={() => setActiveTab("unsafe")}
        >
          ❌ 안전하지 않은 방식만
        </button>
        <button
          className={activeTab === "safe" ? "active" : ""}
          onClick={() => setActiveTab("safe")}
        >
          ✅ 안전한 방식만
        </button>
      </nav>

      <div className={`grids-wrapper ${activeTab}`}>
        {(activeTab === "both" || activeTab === "unsafe") && <UnsafeGrid />}
        {(activeTab === "both" || activeTab === "safe") && <SafeGrid />}
      </div>

      <footer className="app-footer">
        <div className="code-comparison">
          <div className="code-block unsafe-code">
            <h4>❌ 테어링 발생 코드</h4>
            <pre>
              <code>{`function useUnsafeColor() {
  // 렌더링 시점에 직접 읽기
  return externalStore.getColor();
}`}</code>
            </pre>
          </div>
          <div className="code-block safe-code">
            <h4>✅ 안전한 코드</h4>
            <pre>
              <code>{`function useSafeColor() {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  );
}`}</code>
            </pre>
          </div>
        </div>
      </footer>
    </div>
  );
}
