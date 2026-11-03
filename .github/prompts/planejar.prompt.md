---
mode: agent
description: Gera o plano técnico (COMO) a partir de uma spec existente.
---

Gere o PLANO TÉCNICO da feature indicada, sem implementar código.

## Feature

${input:feature:Informe o número ou o caminho da especificação da feature}

## Regras obrigatórias

- Leia a especificação da feature indicada e `specs/constitution.md`, respeitando integralmente ambos.
- Não altere nem implemente código da aplicação.
- Não invente requisitos, contratos ou decisões não definidos pela especificação.
- Aponte explicitamente riscos, ambiguidades e pontos que precisam de decisão humana.
- Pergunte antes de finalizar quando uma decisão ambígua impedir um plano completo ou seguro.
- Identifique a feature pelo número ou pelo caminho fornecido; aceite caminhos relativos ao diretório do projeto.
- Crie o arquivo `plan.md` na mesma pasta que contém o arquivo da especificação.

## Processo

1. Localize e leia o arquivo da especificação fornecido.
2. Leia `specs/constitution.md`.
3. Verifique e resolva referências ambíguas pelo contexto das specs disponíveis; pare e pergunte se não for possível identificar com segurança.
4. Crie o plano técnico na pasta da especificação, sem modificar arquivos fora dele além do próprio `plan.md`.

## Estrutura obrigatória

O arquivo `plan.md` deve conter exatamente estas seções numeradas:

1. Arquitetura
2. Modelo de dados
3. Contratos
4. Decisões e trade-offs
5. Estratégia de testes

### 1. Arquitetura

Descreva:

- Camadas e responsabilidades, seguindo o fluxo `HTTP/CLI -> service -> store`.
- Arquivos criados ou alterados em `src/domain/`, `src/service/`, `src/store/`, `src/http/` ou `src/cli.ts`.
- Dependências permitidas entre as camadas; nunca permita que domínio ou store faça IO diretamente.

### 2. Modelo de dados

Descreva tipos de domínio, entidades, valores de entrada, validações externas e schemas Zod necessários, sem escrever código de implementação.

### 3. Contratos

Documente os contratos aplicáveis:

- Rotas HTTP, com método, caminho, entrada, saída e erros esperados; ou
- Comandos CLI, com invocação, argumentos, saída e erros esperados.

Considere também como erros de domínio serão traduzidos na borda HTTP ou CLI.

### 4. Decisões e trade-offs

Registre decisões técnicas propostas, alternativas consideradas e trade-offs relevantes. Destaque pontos que exigem revisão humana antes da implementação.

### 5. Estratégia de testes

Defina testes com `node:test` e `tsx`, indicando:

- Cobertura por camada ou unidade principal.
- Casos de sucesso, erros previsíveis, validações e limites.
- Comandos de validação existentes, incluindo `npm run typecheck` e `npm run test`.
