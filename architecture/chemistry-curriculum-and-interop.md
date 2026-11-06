# Chemistry Structure Lab — 学習体系・連携設計 v1.0

## 長期方針（2026-11-06 確定）

- 高校「化学基礎」「化学」から大学学部・大学院まで段階的に進む。
- 大学の中心は **物理化学、量子化学、無機化学、有機化学、分析化学、生化学、高分子化学、理論化学、計算化学** の9分野とする。
- 専門・学際分野は重複を許すタグ／横断リンクとして登録する。特に熱力学・反応速度・分光・電気化学・固体・錯体・有機金属・天然物・材料・環境・土壌・植物栄養・肥料化学を忘れない。
- 章には安定ID、基礎知識（prerequisites）、学習目標、説明、数式、図のモデル条件、確認問題、次の章へのリンクを持たせる。
- 同じ概念を他分野の教材から参照可能にし、無用な重複実装を避ける。
- AIなし・オフラインで基本教材と学習記録を利用できる。AIは後付けの解説支援であり必須依存にはしない。
- 数式はLaTeX互換表現を基本とし、オフラインで描画できる構成へ発展させる。
- iPhone/iPad/Mac対応。GitHubでソース管理、Cloudflare Pagesで公開。
- 物理アプリ・語学アプリ・Learning & Life OS・Research OSとの連携を見据え、データ形式を安定化する。

## 学習分野の参照構造

高校化学 → 大学9基幹分野 → 49分野候補の専門・学際タグ。
大学分野は1本の一本道ではない。必要に応じて数学、物理、統計、プログラミング教材へ外部参照を張る。

## 共通データ交換仕様：learning-interchange / 1.0

JSONトップレベル：

```json
{
  "schema": "learning-interchange",
  "schemaVersion": "1.0",
  "sourceApp": "chemistry-structure-lab",
  "exportedAt": "2026-11-06T00:00:00.000Z",
  "records": [
    {
      "recordId": "chemistry-structure-lab-v01",
      "recordType": "app-local-state",
      "namespace": "chemistry",
      "payload": {}
    }
  ]
}
```

- `recordId` はアプリ内で使用した localStorage の既存キーに対応。現段階では旧形式をそのまま包む **可逆なアーカイブ**。個々の採点履歴への正規化は次段階。
- `recordType=app-local-state` は状態スナップショットであり、イベント履歴だと誤認しない。
- 他アプリは `schema` と `schemaVersion` を確認してから取り込む。未知キー／未知型は勝手に実行せず、隔離受信箱へ保存するか無視する。
- 個人情報・APIキーは含めない。出力ファイルはユーザーの手元で管理する。
- 化学アプリへの復元は既知のキーのみ、明示的な確認操作の後で行う。現在の記録の上書きを伴うため先にバックアップを推奨する。
- 自動同期、外部送信、別ドメインの localStorage アクセスは行わない。

## 今後の互換性

次の段階で `learning-record / 1.0` の正規化フィールド（app, subject, conceptId, lessonId, questionId, attempts, correct, timestamp, reviewDue, provenance）を追加する。その際も旧形式のインポートを保ち、保存データにマイグレーションを用意する。
