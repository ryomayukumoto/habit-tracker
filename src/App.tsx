import AuthGate from './components/AuthGate';
import AddLogForm from './components/AddLogForm';
import LogsTable from './components/LogsTable';
import WeeklyChart from './components/WeeklyChart';
import StatsSummary from './components/StatsSummary';

import DebugPanel from "./components/DebugPanel";

import type React from 'react';
import Badges from './components/Badges';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
      <h1>Habit Tracker Starter</h1>

      <AuthGate>
        {(user) => (
          <div style={{ display: "grid", gap: 24 }}>
            <section style={ card }>
              <h2>学習時間の記録</h2>
              <AddLogForm user={user} />
            </section>

            <section style={card}>
              <StatsSummary user={user} />
            </section>

            <section style={ card }>
              <h2>直近2週間のグラフ</h2>
              <WeeklyChart user={ user }/>
            </section>

            <section style={card}>
              <h2>バッジ</h2>
              <Badges user={user} />
            </section>

            <section style={ card }>
              <h2>一覧</h2>
              <LogsTable user={user} />
            </section>

            <DebugPanel user={user} />
          </div>

        )}
      </AuthGate>
    </div>
  )
}

const card: React.CSSProperties = {
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 8,
}