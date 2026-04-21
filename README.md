# Astro Kovesh Web

Frontend oficial do Astro Kovesh, separado da API para deploy independente na Vercel.

Repositorio da API:

- `nitaigf/astro-kovesh-api`

Repositorio pai (orquestracao, contratos e docs compartilhadas):

- `nitaigf/astro-kovesh`

## Stack

- SolidJS
- Vite
- TypeScript
- Bun
- Three.js

## Executar localmente

1. Instalar dependencias:

```bash
bun install
```

2. Configurar ambiente:

```bash
cp .env.example .env
```

3. Subir em dev:

```bash
bun run dev
```

Aplicacao:

- `http://localhost:5173`

## Variaveis de ambiente

- `VITE_API_BASE_URL` (URL publica da API)
- `VITE_COSMOS_ENABLED`
- `VITE_COSMOS_STARS`

Diretrizes de integracao:

- consumir somente endpoints versionados (`/v1/*`)
- tratar indisponibilidade de engine na API (`503 astrology_engine_unavailable`)
- manter URL da API configurada por ambiente

## Testes

```bash
bun run test
```

## Build

```bash
bun run build
```

## Deploy na Vercel

Este repositorio deve ser publicado como projeto web.

Configuracao sugerida:

- Framework Preset: Vite
- Build Command: `bun run build`
- Output Directory: `dist`

Variavel obrigatoria na Vercel:

- `VITE_API_BASE_URL=https://<seu-dominio-da-api>`

Compatibilidade:

- alinhar releases com `contracts/release-compatibility.md` no repositorio pai.
