import AuthGate from '../components/AuthGate';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Habit Tracker Starter</h1>
      <p>Vite + React + TypeScript + Firebase 初期化済みテンプレです。</p>
      <AuthGate>
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <h2>ログイン済みエリア</h2>
          <p>ここにフォームやグラフなどを追加していけます。</p>
        </div>
      </AuthGate>
    </div>
  )
}
