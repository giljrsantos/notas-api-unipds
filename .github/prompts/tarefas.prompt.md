---
mode: agent
description: Quebra o plano em tarefas pequenas, ordenadas e testáveis.
---

Gere a lista de tarefas da feature indicada, sem implementar código.

## Feature

${input:feature:Informe o número ou o caminho da especificação da feature}

## Regras obrigatórias

- Leia `specs/constitution.md`, a especificação da feature e o respectivo `plan.md`.
- Não altere nem implemente código da aplicação.
- Crie um arquivo `task.md` na mesma pasta da especificação e do plano.
- Quebre o plano em tarefas pequenas, ordenadas pelas dependências.
- Cada tarefa deve caber em um único commit.
- Cada tarefa deve ter um critério claro de pronto, preferencialmente verificável por testes existentes ou comandos do projeto.
- Declare dependências entre tarefas quando houver.
- Use exatamente a sintaxe `- [ ]` no início de cada item numerado.
- Não invente tarefas fora do escopo definido pela especificação e pelo plano.
- Pergunte antes de finalizar quando uma ambiguidade impedir a decomposição correta ou a definição de dependências.

## Processo

1. Localize a especificação pelo número ou caminho fornecido.
2. Leia `specs/constitution.md`, o arquivo `spec.md` da feature e o `plan.md` na mesma pasta.
3. Garanta que todas as tarefas derivam de requisitos ou decisões presentes nos documentos.
4. Organize os itens do domínio para as bordas HTTP/CLI, seguindo o fluxo de dependências `domain -> store -> service -> HTTP/CLI` quando aplicável.
5. Crie `task.md` na mesma pasta da especificação.

## Formato obrigatório

Use uma lista numerada Markdown com tarefas iniciadas por `- [ ]`. Cada tarefa deve incluir, ao mínimo:

1. O objetivo da tarefa.
2. Os arquivos ou camadas previstos, quando aplicável.
3. A dependência, ou indique "Nenhuma".
4. Os critérios de pronto, incluindo testes ou validações relevantes.

Modelo:

```markdown
1. - [ ] Implementar ...
   - Dependências: nenhuma.
   - Pronto quando: ... passam e `npm run typecheck` permanece verde.
```

Se cada tarefa representar alteração de código, priorize casos na ordem seguinte: domínio e validações, persistência, regras de negócio, borda HTTP/CLI e integração final. Inclua testes e documentação diretamente relacionada quando fizerem parte da tarefa.
