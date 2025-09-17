# Habit Tracker - ログのしやすさと可視化を両立
React + TypeScript / Firebase Auth + Firestore / Chart.js / 3層（Repo/Converter/Domain）

## デモ
- 本番URL:`デプロイURL`
- テスト用 Googleログイン（任意）

## スクリーンショット
1. Dashboard（今日の記録入力）
2. グラフ（直近14日）
3. バッジ（3/7/30日）

## 技術スタック
- React + TypeScript, Vite
- Firebase (Auth, Firestore) + serverTimestamp
- Repositoryパターン + FirestoreDataConverter
- Chart.js

## 設計の工夫
- Doc↔App型分離（Firestore依存をUIから排除）
- `YYYY-MM-DD` を DocID にして 1日1件を担保
- バッジ付与は固定IDで冪等
- UTC/JSTズレ対策：ローカルISOヘルパーで日付生成

## ローカル起動
```bash
cp .env.example .env # VITE_FIREBASE_* を埋める
npm i
npm run dev