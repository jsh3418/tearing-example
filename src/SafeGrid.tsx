import { useEffect, useRef, useState, useTransition, useSyncExternalStore } from "react";
import { COLORS, COLOR_NAMES, safeStore } from "./externalStore";

/**
 * ✅ 안전한 방식: useSyncExternalStore
 *
 * 동일한 조건(startTransition + busy-wait + setInterval 변이)에서도
 * useSyncExternalStore는 렌더 시작 시점의 스냅샷을 고정한다.
 * 렌더링 도중 스토어가 변경되면 이를 감지하고
 * 전체 트리를 새 스냅샷으로 동기적으로 다시 렌더링한다.
 */

function SafeCell({ id }: { id: number }) {
  // useSyncExternalStore: 렌더 패스 전체에서 동일한 스냅샷을 보장
  const colorIndex = useSyncExternalStore(
    safeStore.subscribe,
    safeStore.getSnapshot,
  );

  // 동일한 ~5ms busy-wait — 공정한 비교
  const start = performance.now();
  while (performance.now() - start < 5) {}

  return (
    <div
      className="grid-cell"
      style={{ backgroundColor: COLORS[colorIndex] }}
      title={`Cell ${id}: ${COLOR_NAMES[colorIndex]}`}
    />
  );
}

const CELL_COUNT = 50;

export default function SafeGrid() {
  const [isPending, startTransition] = useTransition();
  const [, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerRerender = () => {
    startTransition(() => {
      setTick((t) => t + 1);
    });

    // 동일한 조건: 렌더 바깥에서 비동기로 스토어를 반복 변경
    if (intervalRef.current) clearInterval(intervalRef.current);
    let count = 0;
    intervalRef.current = setInterval(() => {
      safeStore.nextColor();
      count++;
      if (count >= 30) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 10);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const cells = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    cells.push(<SafeCell key={i} id={i} />);
  }

  return (
    <div className="grid-container">
      <div className="grid-header safe">
        <h2>✅ 안전한 방식</h2>
        <p>useSyncExternalStore 사용</p>
      </div>
      <button className="trigger-btn safe-btn" onClick={triggerRerender}>
        색상 변경 (테어링 없음)
      </button>
      <div className="grid-meta">
        {isPending && <span className="pending">렌더링 중...</span>}
      </div>
      <div className="grid">{cells}</div>

      <div className="explanation">
        <strong>왜 안전한가요?</strong>
        <p>
          <code>useSyncExternalStore</code>는 렌더링 시작 시점의
          <strong> 스냅샷</strong>을 캡처합니다. 동일하게 time-slice 경계에서
          yield가 발생하고 <code>setInterval</code>이 스토어를 변경하더라도,
          모든 셀은 캡처된 동일한 스냅샷을 읽습니다. 스토어 변경이 감지되면
          React가 새 스냅샷으로 전체 트리를 다시 렌더링합니다.
        </p>
      </div>
    </div>
  );
}
