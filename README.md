# Chemistry Structure Lab

高校化学から大学化学へ段階的に進む、AIなしでも利用できるHTMLベースの化学学習アプリです。

## 現在の教材（v0.3）

- ホーム、学習分野マップ、導入教材4講
- 原子・化学結合・物質量・化学反応式の説明
- 探索型周期表（最初の36元素）
- 電子配置インタラクティブ教材（原子番号1〜30、軌道とスピン、Cr/Cuの例外）
- 原子軌道・4つの量子数・スピンの対話型教材と5問の理解確認（模式図は厳密な確率等値面ではありません）
- 高校化学の全領域を横断する29章の教材（理論・無機・有機・高分子）、各章1問の復習問題、進捗表示・検索。全範囲を一巡できる初版であり、網羅的な教科書の完成版ではありません。
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

現在は `index.html` 内の `pages` と `quiz` に教材があります。今後教材量が増えたら章ごとのJSON等へ分離します。

## 注意

現段階は教科書全体の完成版ではなく、教材を順次拡張しています。確認問題の学習記録はブラウザのlocalStorageに保存され、端末間の自動同期は未実装（JSONの手動エクスポートには対応）です。初回アクセス時はオンライン接続が必要です。オフラインにする前に一度ページを開いてください。
