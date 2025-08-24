import AuthGate from './components/AuthGate'
import AddLogForm from './components/AddLogForm'

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
      <h1>Habit Tracker Starter</h1>
      <p>まずは「入力フォーム → Firestore保存」まで実装しました。</p>

      <AuthGate>
        {(user) => (
          <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
            <section style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <h2>学習時間の記録</h2>
              <AddLogForm user={user} />
            </section>
          </div>
        )}
      </AuthGate>
    </div>
  )
}