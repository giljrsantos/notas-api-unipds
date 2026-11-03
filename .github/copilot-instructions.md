# Memória do projeto

## Stack
- Node.js 24 LTS; TypeScript ESM com `strict`.
- Zod valida entradas nas fronteiras HTTP e CLI.
- Testes com `node:test` via `tsx`.
- HTTP usa `node:http` de propósito, sem framework.

## Comandos
- `npm run dev` — executa `tsx src/index.ts`; API prevista em `localhost:3000`.
- `npm run cli` — executa `tsx src/cli.ts`.
- `npm run test` — executa `node --import tsx --test "src/**/*.test.ts"`.
- `npm run typecheck` — executa `tsc --noEmit`.

## Estrutura
- `src/domain/` — tipos e schemas Zod; sem IO.
- `src/store/` — persistência in-memory, acessada por interface.
- `src/service/` — regras de negócio.
- `src/http/` — API HTTP.
- `src/cli.ts` — interface de linha de comando.
- `specs/` — especificações e demais artefatos spec-driven.

## Convenções
- Camadas não pulam: `HTTP/CLI → service → store`.
- Valide entradas externas com Zod.
- Erros de domínio são classes; traduza-os na borda HTTP/CLI.
- Lógica nova nasce com teste.
- Mantenha `npm run typecheck` e `npm run test` sempre verdes.
- Nunca commite secrets; nunca leia `.env`.

## Fluxo de trabalho
- Siga `/especificar` → `/planejar` → `/tarefas` → `/implementar`.
- Faça revisão humana entre cada fase; guarde os artefatos em `specs/`.
