/**
 * 외부 스토어 - React 상태 관리 바깥의 mutable store
 *
 * 테어링의 근본 원인:
 * React의 동시성 렌더링이 time-slice 경계에서 yield하는 사이에
 * 이 값이 변경되면, 같은 렌더 패스 내에서
 * 서로 다른 컴포넌트가 서로 다른 값을 읽게 된다.
 */

export const COLORS = [
  "#e74c3c", // 빨강
  "#3498db", // 파랑
  "#2ecc71", // 초록
  "#f39c12", // 주황
  "#9b59b6", // 보라
  "#1abc9c", // 청록
] as const;

export const COLOR_NAMES = [
  "빨강",
  "파랑",
  "초록",
  "주황",
  "보라",
  "청록",
] as const;

type Listener = () => void;

// ── mutable 외부 상태 (React가 추적하지 않음) ──
let colorIndex = 0;

export const externalStore = {
  getColorIndex: () => colorIndex,
  getColor: () => COLORS[colorIndex],
  setColorIndex(idx: number) {
    colorIndex = ((idx % COLORS.length) + COLORS.length) % COLORS.length;
  },
  nextColor() {
    colorIndex = (colorIndex + 1) % COLORS.length;
  },
};

// ── useSyncExternalStore용 안전한 스토어 ──
let safeIndex = 0;
const listeners = new Set<Listener>();

export const safeStore = {
  getColorIndex: () => safeIndex,
  getColor: () => COLORS[safeIndex],
  setColorIndex(idx: number) {
    safeIndex = ((idx % COLORS.length) + COLORS.length) % COLORS.length;
    listeners.forEach((fn) => fn());
  },
  nextColor() {
    safeIndex = (safeIndex + 1) % COLORS.length;
    listeners.forEach((fn) => fn());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => safeIndex,
};
