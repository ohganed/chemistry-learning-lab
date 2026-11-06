# Chemistry Structure Lab

高校化学から大学化学へ段階的に進む、AIなしでも利用できるHTMLベースの化学学習アプリです。

## 現在の教材（2026-11-06 詳細解説版）

- ホーム、学習分野マップ、導入教材4講
- 原子・化学結合・物質量・化学反応式の説明
- 探索型周期表（最初の36元素）
- 電子配置インタラクティブ教材（原子番号1〜30、軌道とスピン、Cr/Cuの例外）
- 原子軌道・4つの量子数・スピンの対話型教材と5問の理解確認（模式図は厳密な確率等値面ではありません）
- 高校化学29章の日英詳細解説：計87節、29の解説付き例題、29の誤解しやすい点、29の知識接続、29の任意探究問題を収録。
- 発展・分野横断の解説18項目。状態図、溶解度積、工業化学、測定と不確かさ、環境化学、立体異性体などを補強。
- 各章で「原理から」「例題から」「知識のつながりから」学ぶ経路を選べる。iPhoneでは長い内容を段階的に開いて閲覧可能。
- 29章に対応する既存の確認問題と学習履歴・検索は維持。理解度による進行制限なし。
- [知識アトラス](knowledge-atlas.html) は高校化学と大学化学9分野の67概念・96接続を探索。
- 各講の確認問題と正誤のローカル記録
- スマートフォン・タブレット・PC対応
- Service Worker による初回オンライン表示後のオフライン閲覧

## 日英バイリンガル教材

[高校化学（日本語）](high-school-chemistry.html) と [High School Chemistry (English)](high-school-chemistry-en.html) は29章の説明・問題・解説をそれぞれの言語で持ち、共通の章ID・進捗記録を使用します。英語表示を追加したのは高校化学29章であり、他の専用ページの全訳は今後の課題です。国際的な大学で推薦されうる品質を長期目標として、英語の科学的正確性・アクセシビリティ・検証可能性を重視します。いかなる大学からも推薦・承認を受けたと主張しません。

## 大学化学の体系・他アプリ連携

学習分野とデータ交換の設計書は [architecture/chemistry-curriculum-and-interop.md](architecture/chemistry-curriculum-and-interop.md) を参照。大学化学は9基幹分野と専門・学際タグで整理します。学習記録は [learning-interchange.html](learning-interchange.html) から共通JSON形式で書き出し・復元できます。現段階では手動でのファイル受け渡しで、自動同期ではありません。

## 公開

GitHubをCloudflare Pagesに接続し、Production branchを `main`、Framework presetを `None`、Build commandを空欄、Build output directoryを `/` にして公開します。

## 教材の編集

高校化学の詳細教材は `data/chemistry-depth-0.json` 〜 `chemistry-depth-5.json`、発展教材は `data/chemistry-depth-extensions-v1.json` に分離しています。表示ロジックは `chemistry-depth-viewer.js` です。旧29章と確認問題は変更せず、詳細原稿を追加読み込みしています。

[完成基準・未解決課題](architecture/high-school-chemistry-completion.md) には、説明の詳細化と自律学習の成立を区別する品質基準を記録しています。教材データの検証は GitHub Actions と `tests/validate-depth.mjs` で実施します。

## 注意

29章の詳細原稿は整備しましたが、専門家査読・全範囲の細目照合・豊富な演習・実機による独学検証が済んだ完成版ではありません。確認問題の学習記録はブラウザのlocalStorageに保存され、端末間の自動同期は未実装（JSONの手動エクスポートには対応）です。初回アクセス時はオンライン接続が必要です。オフラインにする前に一度ページを開いてください。
