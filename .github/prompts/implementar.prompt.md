---
mode: agent
description: Implementa as tarefas pendentes uma a uma, com testes.
---

Implemente as tarefas pendentes da feature indicada.

## Feature

${input:feature:Informe o número ou o caminho da especificação da feature}

## Regras obrigatórias

- Identifique `spec.md`, `plan.md` e `task.md` da feature indicada.
- Leia também `specs/constitution.md` e todas as instruções aplicáveis ao código que será alterado.
- Siga o fluxo de dependências `HTTP/CLI -> service -> store -> domínio`, sem implementar decisões que contrariem o plano aprovado.
- Implemente uma única fatia coesa por vez, respeitando uma tarefa pendente por vez.
- Não implemente e não marque como concluída uma tarefa cujas dependências ainda não estejam prontas.
- Escreva ou atualize testes para toda lógica nova antes da validação final da tarefa.
- Execute `npm run test` e `npm run typecheck` após cada tarefa concluída.
- Só altere `- [ ]` para `- [x]` quando os testes e o typecheck estiverem verdes.
- Nunca desative testes, enfraqueça tipagem, use bypasses ou faça alterações somente para forçar uma validação a passar.
- Pare ao concluir uma fatia coesa e peça revisão humana antes de continuar.
- Se a especificação, o plano ou as tarefas estiverem incorretos, ambíguos ou conflitantes, pare, explique o problema e peça correção; não invente requisitos.
- Não leia arquivos `.env` nem introduza segredos no repositório.

## Processo

1. Localize `spec.md`, `plan.md` e `task.md` da feature.
2. Leia os documentos, em conjunto com `specs/constitution.md` e as instruções aplicáveis.
3. Procure a próxima tarefa com prefixo `- [ ]` cujas dependências estejam satisfeitas.
4. Implemente somente o necessário para essa tarefa, incluindo os testes diretamente relacionados.
5. Rode `npm run test` e `npm run typecheck`.
6. Se alguma validação falhar, corrija as alterações da tarefa atual; não desative cobertura ou verificações.
7. Só após todas as validações ficarem verdes, marque exatamente essa tarefa como `- [x]` em `task.md`.
8. Pare ao concluir uma fatia coesa, resuma o que foi feito, informe a próxima tarefa e peça revisão humana.

## Critérios de parada

Pare imediatamente e informe o usuário quando ocorrer qualquer uma das situações:

- os documentos exigem comportamento incompatível entre si;
- uma informação necessária não está definida na spec ou no plano;
- uma tarefa não pode ser concluída sem ampliar ou alterar o escopo;
- os testes ou a análise de tipos falharem por uma causa não relacionada à tarefa atual;
- houver risco de conflito com um princípio da constituição.
