# Constitution - Notas API

Princípios não negociáveis que toda spec, plano, tarefa e código seguem.

1. **Camadas explícitas.** Dependências fluem `http/cli -> service -> store`. Domínio não faz IO.
2. **Validações na fronteira.** Todas as entradas externas são validadas com Zod antes de virar domínio.
3. **Erros são de domínio.** Falhas previsíveis viram classes de erro, traduzidas em status/saída na borda.
4. **Testes são parte da tarefa.** Nenhuma lógica nova entra sem teste. TypeCheck e testes sempre verdes.
5. **Segurança por padrão.** Sem segredos no repositório. Ações destrutivas passam por guardrails (deny list + pre-commit), não pela confiança no modelo.
6. **Spec antes de código.** Mudanças relevantes passam por spec -> plan -> task -> implement, com revisão humana entre as fases.
7. **Pequeno e reversível.** Cada tarefa cabe em um commit.

## Stack obrigatória

- Node.js 24
- TypeScript ESM strict
- Zod
- Node.js test runner via `tsx`
- `node:http`
