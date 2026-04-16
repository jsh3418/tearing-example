# React Tearing 시뮬레이션

React 18의 동시성 렌더링(Concurrent Rendering)에서 외부 스토어를 직접 읽을 때 발생하는 **테어링(Tearing)** 현상을 시각적으로 보여주는 데모 프로젝트입니다.

## 테어링(Tearing)이란?

React 18의 동시성 렌더링에서는 렌더링이 **중단(yield)** 되고 **재개**될 수 있습니다. 이때 외부 스토어의 값을 직접 읽으면, 렌더링이 중단된 사이에 스토어 값이 변경되어 같은 렌더 패스 내의 컴포넌트들이 **서로 다른 값**을 표시하게 됩니다.

```
셀 렌더링 시작 → time-slice 소진 → React가 yield → setInterval이 스토어 변경 → 다음 셀은 다른 색상!
(색상: 빨강)       (5ms 경과)                         (빨강 → 파랑)              (테어링 발생 💥)
```

## 데모

https://jsh3418.github.io/tearing-example/

## 동작 방식

### 안전하지 않은 방식 (테어링 발생)

```tsx
function UnsafeCell() {
  // 렌더링 시점에 외부 스토어를 직접 읽음
  const colorIndex = externalStore.getColorIndex();

  // ~5ms busy-wait로 time-slice를 소진시켜 React의 yield를 유도
  const start = performance.now();
  while (performance.now() - start < 5) {}

  return <div style={{ backgroundColor: COLORS[colorIndex] }} />;
}
```

- `startTransition`으로 concurrent render를 스케줄링
- 각 셀이 ~5ms busy-wait로 React의 time-slice를 소진 → React가 yield
- yield 사이에 `setInterval`이 외부 스토어를 변경
- React가 돌아와서 다음 셀을 렌더링할 때 변경된 값을 읽음 → **테어링!**

### 안전한 방식 (테어링 없음)

```tsx
function SafeCell() {
  // useSyncExternalStore: 렌더 패스 전체에서 동일한 스냅샷을 보장
  const colorIndex = useSyncExternalStore(
    safeStore.subscribe,
    safeStore.getSnapshot,
  );

  const start = performance.now();
  while (performance.now() - start < 5) {}

  return <div style={{ backgroundColor: COLORS[colorIndex] }} />;
}
```

- `useSyncExternalStore`는 렌더링 시작 시점의 **스냅샷**을 캡처
- 렌더링 도중 스토어가 변경되어도 모든 셀이 동일한 스냅샷을 읽음
- 스토어 변경이 감지되면 React가 새 스냅샷으로 전체 트리를 다시 렌더링

## 프로젝트 구조

```
src/
├── App.tsx            # 메인 앱 컴포넌트 (탭 네비게이션, 개념 설명)
├── UnsafeGrid.tsx     # 테어링이 발생하는 그리드 (외부 스토어 직접 읽기)
├── SafeGrid.tsx       # 테어링이 없는 그리드 (useSyncExternalStore 사용)
├── externalStore.ts   # 외부 스토어 정의 (unsafe + safe 버전)
├── index.css          # 스타일
└── main.tsx           # 엔트리 포인트
```

## 실행 방법

```bash
npm install
npm run dev
```

## 기술 스택

- React 18
- TypeScript
- Vite
