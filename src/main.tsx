import { createRoot } from 'react-dom/client';
import App from './App';

// StrictMode를 의도적으로 사용하지 않음
// StrictMode는 개발 중 이중 렌더링을 하여 테어링 시뮬레이션을 방해할 수 있음
createRoot(document.getElementById('root')!).render(<App />);
