# Astro Kovesh - v0.1

Primeira versao funcional de um produto com API publica de dados astrologicos e frontend web de demonstracao.

## Visao geral

O projeto recebe:

- `date` (`YYYY-MM-DD`)
- `time` (`HH:mm` ou `HH:mm:ss`)
- `location` por texto (`location.query`) ou por coordenadas (`lat/lng`)
- `timezone` opcional
- `zodiac_mode` (`tropical` ou `sidereal`)
- `house_system` (`placidus`, `koch`, `whole_sign`)

E retorna:

- entrada normalizada
- datetime em UTC
- coordenadas e timezone resolvidos
- posicoes planetarias
- pontos adicionais (Ascendente e Nodo Norte)
- asteroides principais (Chiron, Ceres, Pallas, Juno, Vesta)
- casas
- aspectos maiores (conjunction, sextile, square, trine, opposition)

## Stack

### API

- Python 3.12+
- FastAPI
- Pydantic v2
- Uvicorn
- Swiss Ephemeris (`pyswisseph`)
- Geopy (Nominatim)
- TimezoneFinder

### Web

- SolidJS
- Vite
- TypeScript
- Bun
- Three.js

## Estrutura

```text
.
├── api/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env.example
├── web/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── .env.example
├── bruno/astro-kovesh/
├── docker-compose.yml
└── README.md
```

## Decisoes tecnicas (simples e estaveis)

1. `pyswisseph` para calculo astrologico (maduro e amplamente usado).
2. `geopy + Nominatim` para geocoding gratuito com limitacao interna simples por processo.
3. `timezonefinder` para resolver timezone localmente a partir de coordenadas.
4. Rate limiting simples por IP na API e limiter separado para geocoding.
5. Sem banco/cache/fila nesta fase para manter foco no core do produto.

## Como rodar localmente

## 0) Pre-requisito

- API: Python 3.12+
- Web: Bun 1.2+

Crie os arquivos de ambiente (voce ja criou):

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env
```

## 1) API

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m app.run
```

Para desenvolvimento completo (inclui Swiss Ephemeris e testes):

```bash
pip install -r requirements-dev.txt
```

Observacao: `python3 -m app.run` usa `api/.env` para host/porta/configuracoes da API.

OpenAPI:

- Swagger UI: `http://localhost:8010/docs`
- ReDoc: `http://localhost:8010/redoc`

Endpoints principais:

- `GET /health`
- `POST /v1/chart`

## 2) Web

```bash
cd web
bun install
bun run dev
```

Observacao: o web usa `web/.env` (exemplo: `VITE_API_BASE_URL`).

## Rodar em dois terminais (modo recomendado local)

Terminal 1:

```bash
cd api
source .venv/bin/activate
python3 -m app.run
```

Terminal 2:

```bash
cd web
bun run dev
```

Ou, em um unico comando (do diretorio raiz):

```bash
make dev
```

Frontend:

- `http://localhost:5173`

## 3) Docker (opcional)

```bash
docker compose up --build
```

No Docker Compose, os servicos carregam variaveis diretamente de:

- `api/.env`
- `web/.env`

Modo atual do `docker-compose.yml` e orientado a producao:

- API em modo `production`
- Web buildado estaticamente e servido por Nginx

## Testes automatizados minimos

### API

```bash
cd api
pytest -q
```

Cobertura inicial:

- healthcheck
- chart por coordenadas (sucesso)
- erro de geocoding
- hora invalida
- falha externa mapeada

### Web

```bash
cd web
bun run test
```

Cobertura inicial:

- render da tela principal
- submit e exibicao de resultado
- erro amigavel de API
- servico de API (sucesso/erro)

## Atalhos com Makefile

```bash
make install
make api-run
make web-run
make dev
make test
```

## Git Flow (Padrao do Projeto)

Este repositorio adota Git Flow como padrao de trabalho.

Fluxo:

- `main`: producao
- `develop`: integracao
- `feature/*`, `release/*`, `hotfix/*`

Comandos utilitarios:

```bash
make git-init
make git-remote-origin ORIGIN_URL=git@github.com:nitaigf/astro-kovesh.git
make git-flow-init
make git-flow-feature-start NAME=minha-feature
make git-flow-feature-finish NAME=minha-feature
make git-flow-release-start NAME=0.1.0
make git-flow-release-finish NAME=0.1.0
make git-flow-hotfix-start NAME=0.1.1
make git-flow-hotfix-finish NAME=0.1.1
```

Guia detalhado:

- `docs/GIT_FLOW.md`

## Diretrizes do Copilot

As instrucoes para colaboracao com Copilot estao em:

- `.github/copilot-instructions.md`

Esse arquivo descreve stack, arquitetura, padrao visual e principios de evolucao incremental com foco em performance, seguranca e respeito a limites de uso em APIs/servicos gratuitos.

## Contrato inicial da API

### Healthcheck

`GET /health`

Resposta:

```json
{
  "status": "ok"
}
```

### Chart

`POST /v1/chart`

Exemplo por texto:

```json
{
  "date": "2026-04-20",
  "time": "14:30:00",
  "location": {
    "query": "Sao Paulo, SP, Brasil"
  },
  "zodiac_mode": "tropical",
  "house_system": "placidus"
}
```

Exemplo por coordenadas:

```json
{
  "date": "2026-04-20",
  "time": "14:30:00",
  "location": {
    "lat": -23.5505,
    "lng": -46.6333,
    "name": "Sao Paulo, SP, Brasil",
    "timezone": "America/Sao_Paulo"
  },
  "zodiac_mode": "sidereal",
  "house_system": "whole_sign"
}
```

## Colecao Bruno

Colecao pronta em:

- `bruno/astro-kovesh`

Inclui:

- `Healthcheck`
- `Chart by location query`
- `Chart by coordinates`
- environment `dev` com `baseUrl=http://localhost:8010`

## Variaveis de ambiente

### API (`api/.env`)

- `APP_NAME`
- `APP_ENV`
- `APP_HOST`
- `APP_PORT`
- `CORS_ORIGINS`
- `REQUEST_TIMEOUT_SECONDS`
- `DEFAULT_TIMEZONE`
- `GEOCODER_USER_AGENT`
- `GEOCODER_CALLS_PER_MINUTE`
- `GEOCODER_MIN_SECONDS_BETWEEN_CALLS`
- `IP_RATE_LIMIT_PER_MINUTE`

### Web (`web/.env`)

- `VITE_API_BASE_URL`
- `VITE_COSMOS_ENABLED`
- `VITE_COSMOS_STARS`

## Execucao com .env

- API local: `api/.env` e carregado pelo `pydantic-settings` + `python -m app.run`.
- Web local: `web/.env` e carregado automaticamente pelo Vite/Bun.
- Docker Compose: `env_file` em `docker-compose.yml` injeta `api/.env` e `web/.env` nos containers.

## UX da web nesta versao

- fundo cosmos procedural dinamico com Three.js
- card central glassmorphism
- formulario com data, hora, local, zodiac mode e house system
- loading durante consulta
- erro amigavel
- resultado em blocos:
  - dados normalizados
  - posicoes planetarias
  - ascendente e casas
  - aspectos
- grafico do mapa em SVG

## Frontend Visual Enhancement

O frontend agora usa um background procedural com Three.js:

- renderizado em `canvas` WebGL fullscreen
- estrelas com `BufferGeometry` + `Points` + `PointsMaterial`
- distribuicao 3D com profundidade
- drift suave e rotacao minima para sensacao de infinito
- randomizacao a cada reload
- fallback automatico para gradiente quando WebGL nao esta disponivel

Arquivos principais:

- `web/src/components/CosmosBackground.tsx`
- `web/src/styles.css`

Como ajustar densidade de estrelas:

- `VITE_COSMOS_STARS=1800` em `web/.env`

Como desativar o fundo dinamico:

- `VITE_COSMOS_ENABLED=false` em `web/.env`

## Preparacao para Producao

1. Ajuste variaveis de ambiente:

- `api/.env` (host, porta, limites, CORS)
- `web/.env` (`VITE_API_BASE_URL`, cosmos)

2. Build e subida com Docker Compose:

```bash
docker compose up --build -d
```

3. Endpoints esperados:

- Web: `http://localhost:5173`
- API: `http://localhost:8010`

4. Logs:

```bash
docker compose logs -f api web
```

## Deploy na Vercel (Monorepo)

Este repositorio pode ser publicado na Vercel em dois projetos separados:

1. Projeto Web

- Root Directory: `web`
- Build Command: `bun run build`
- Output Directory: `dist`
- Variavel obrigatoria: `VITE_API_BASE_URL` apontando para a URL publica da API

2. Projeto API

- Root Directory: `api`
- Entry point serverless: `api/index.py`
- Configuracao: `api/vercel.json`
- Variaveis de ambiente: mesmas chaves da secao de API em `.env`

Observacao importante sobre runtime serverless:

- Em ambientes sem suporte a extensoes nativas C, a engine astrologica (`pyswisseph`) pode nao estar disponivel.
- Nessa situacao, a API inicia normalmente e `POST /v1/chart` responde `503` com codigo `chart_request_error` e mensagem iniciando com `astrology_engine_unavailable`.

Arquivos de dependencias:

- `api/requirements.txt`: runtime minimo (compatibilidade maior com serverless)
- `api/requirements-astro.txt`: dependencias astrologicas nativas
- `api/requirements-dev.txt`: runtime + astrologia + testes

Recomendacao oficial nesta etapa:

1. Manter frontend na Vercel.
2. Publicar API na Vercel apenas se aceitar modo degradado sem engine astrologica nativa.
3. Para resposta astrologica completa em producao, usar runtime com suporte a extensoes C (ex.: container dedicado).

## Decisao sobre tRPC

Nesta etapa nao faremos migracao para tRPC.

Motivo principal:

- o produto prioriza API publica estavel e independente de framework frontend.

tRPC pode ser reavaliado no futuro apenas como camada interna complementar, sem substituir o contrato HTTP publico.

## Limitacoes atuais

1. Sem cache: chamadas repetidas com `location.query` dependem de geocoding externo.
2. Rate limiting in-memory: ao reiniciar o processo, contadores sao resetados.
3. Asteroides dependem do suporte local do Swiss Ephemeris instalado no ambiente.
4. Whole Sign nesta versao usa abordagem simples baseada no signo do ascendente.
5. Sem interpretacao textual astrologica; somente dados tecnicos.

## Roadmap sugerido

1. Autenticacao de API (API keys/JWT de servico).
2. Cache (Redis) para geocoding e respostas frequentes.
3. Banco de dados para historico e auditoria minima.
4. Planos de uso e limites por chave.
5. Historico de consultas por usuario/aplicacao.
6. Graficos de mapa astral mais completos (carta circular rica).
7. Interpretacao textual automatizada por regras/camadas de IA.
8. Observabilidade (logs estruturados, metricas, tracing, alertas).
