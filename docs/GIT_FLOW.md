# Git Flow - Padrao de Trabalho

Este projeto adota Git Flow como padrao de branching.

## Branches principais

- `main`: versoes estaveis em producao
- `develop`: integracao continua de features

## Branches de suporte

- `feature/*`: desenvolvimento de funcionalidades
- `release/*`: preparacao de versao
- `hotfix/*`: correcoes urgentes em producao

## Setup inicial (uma vez)

1. Inicialize Git, se necessario:

```bash
make git-init
```

2. Configure remoto:

```bash
make git-remote-origin ORIGIN_URL=git@github.com:nitaigf/astro-kovesh.git
```

3. Instale git-flow:

```bash
brew install git-flow-avh
```

4. Inicialize Git Flow com defaults:

```bash
make git-flow-init
```

## Fluxo diario

1. Nova feature:

```bash
make git-flow-feature-start NAME=minha-feature
```

2. Finalizar feature:

```bash
make git-flow-feature-finish NAME=minha-feature
```

3. Iniciar release:

```bash
make git-flow-release-start NAME=0.1.0
```

4. Finalizar release:

```bash
make git-flow-release-finish NAME=0.1.0
```

5. Iniciar hotfix:

```bash
make git-flow-hotfix-start NAME=0.1.1
```

6. Finalizar hotfix:

```bash
make git-flow-hotfix-finish NAME=0.1.1
```

## Convencoes

- Features: nomes curtos e descritivos, ex.: `chart-validation`
- Releases/Hotfixes: versionamento semantico, ex.: `0.1.0`, `0.1.1`
- Sempre sincronizar `develop` e `main` com o remoto apos `finish`

## Referencia

- Cheatsheet: https://danielkummer.github.io/git-flow-cheatsheet/
