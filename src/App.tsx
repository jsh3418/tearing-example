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
