import { useEffect, useRef, useState, useTransition } from "react";
import { COLORS, COLOR_NAMES, externalStore } from "./externalStore";

/**
 * ❌ 진짜 동시성 렌더링 테어링
 *
 * 1. startTransition으로 concurrent render를 스케줄링
 * 2. 각 셀이 ~5ms busy-wait로 time-slice를 소진 → React가 yield
 * 3. yield 틈에 setInterval이 렌더 바깥에서 스토어를 변경
 * 4. React가 돌아와서 다음 셀을 렌더링할 때 변경된 값을 읽음 → 테어링!
 */

function UnsafeCell({ id }: { id: number }) {
  // 렌더링 시점에 외부 스토어를 직접 읽음 (useSyncExternalStore 없이)
  const colorIndex = externalStore.getColorIndex();

  // ~5ms busy-wait: React의 time-slice(5ms)를 소진시켜 yield를 유도
  // yield하는 동안 setInterval 콜백이 실행되어 스토어를 변경할 수 있음
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

export default function UnsafeGrid() {
  const [isPending, startTransition] = useTransition();
  const [, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerRerender = () => {
    // 1. startTransition: 이 안의 setState는 낮은 우선순위로 처리되어
    //    렌더링이 중단 가능(interruptible)해진다 — 이것이 핵심!
    startTransition(() => {
      setTick((t) => t + 1);
    });

    // 2. 렌더 바깥에서 비동기로 스토어를 반복 변경
    //    React가 yield할 때마다 이 콜백이 실행되어 스토어 값이 바뀜
    if (intervalRef.current) clearInterval(intervalRef.current);
    let count = 0;
    intervalRef.current = setInterval(() => {
      externalStore.nextColor();
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

  // tick을 key에 반영하여 transition 때 셀 트리가 재생성되도록 함
  const cells = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    cells.push(<UnsafeCell key={i} id={i} />);
  }

  return (
    <div className="grid-container">
      <div className="grid-header unsafe">
        <h2>❌ 안전하지 않은 방식</h2>
        <p>렌더링 중 외부 스토어 직접 읽기 (useSyncExternalStore 미사용)</p>
      </div>
      <button className="trigger-btn" onClick={triggerRerender}>
        색상 변경 (테어링 유발)
      </button>
      <div className="grid-meta">
        {isPending && <span className="pending">렌더링 중...</span>}
      </div>
      <div className="grid">{cells}</div>

      <div className="explanation">
        <strong>왜 테어링이 발생하나요?</strong>
        <p>
          <code>startTransition</code> 안의 렌더링은 중단 가능합니다. 각 셀이
          ~5ms 동안 렌더링되면서 React의 time-slice를 소진하면, React는 메인
          스레드에 양보(yield)합니다. 이 틈에 <code>setInterval</code>이
          실행되어 외부 스토어를 변경합니다. React가 돌아와서 다음 셀을
          렌더링할 때 <strong>변경된 값</strong>을 읽게 되어, 같은 렌더
          패스인데도 셀마다 다른 색상이 표시됩니다.
        </p>
      </div>
    </div>
  );
}
