# Contribution Graph

任意の GitHub ユーザーのコントリビューション・アクティビティを可視化する Web アプリケーション。

## Tech Stack

- React 19 / TypeScript
- Hono (API server)
- Tailwind CSS 4
- Vite (frontend build)
- Cloudflare Workers (deploy)

## セットアップ

```bash
pnpm install
```

## 開発

```bash
pnpm dev
```

Vite でフロントエンドをビルド後、wrangler でローカルサーバーが起動します（`.wrangler` キャッシュは自動削除）。

> `pnpm dev:vite` で Vite 単体の HMR 開発も可能です（API は動作しません）。

## ビルド

```bash
pnpm build
```

`dist/` にフロントエンド成果物が出力されます。

## デプロイ

```bash
pnpm deploy
```

Cloudflare Workers にデプロイされます（事前に `wrangler login` が必要）。
