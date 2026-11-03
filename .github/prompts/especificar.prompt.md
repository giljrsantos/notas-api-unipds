---
mode: agent
description: Cria a especificação (o QUE e por quê) de uma feature, sem código.
---

Escreva uma ESPECIFICAÇÃO para a feature descrita abaixo, sem implementar código e sem definir decisões técnicas de implementação.

## Feature

${input:feature:Descreva a feature que deve ser especificada}

## Regras obrigatórias

- Leia `specs/constitution.md` e respeite integralmente todos os princípios nele definidos.
- Não escreva código, pseudocódigo, classes, APIs, esquemas de banco de dados, rotas ou outras decisões de implementação.
- Pergunte antes de finalizar quando houver ambiguidade relevante, requisitos conflitantes ou informações necessárias para definir corretamente o comportamento.
- Não invente detalhes que não estejam explícitos na descrição ou que não possam ser inferidos com segurança.
- Produza somente uma especificação em Markdown, organizada no formato solicitado abaixo.

## Processo

1. Analise a feature e a constituição do projeto.
2. Verifique o diretório `specs/` e encontre o próximo número inteiro livre para o prefixo da especificação.
3. Gere um slug curto, em kebab-case, a partir do nome da feature.
4. Crie `specs/<NNN>-<slug>.spec.md`, substituindo `<NNN>` pelo número encontrado e `<slug>` pelo slug gerado.
5. Se houver ambiguidade que impeça uma especificação completa e correta, faça perguntas por meio da interface de interação disponível antes de criar ou finalizar o arquivo.

## Estrutura obrigatória

Use exatamente esta estrutura numerada no documento criado:

1. Contexto/problema
2. User Stories
3. Requisitos funcionais
4. Critérios de aceite
5. Fora de escopo
6. Questões em aberto

### User Stories

Use o formato:

- Como <papel>, quero <objetivo>, para <benefício>.

### Requisitos funcionais

Numere cada requisito como `RF-1`, `RF-2`, `RF-3` etc.

### Critérios de aceite

Escreva critérios verificáveis no formato EARS:

- Quando <evento ou condição>, o sistema deve <resposta ou comportamento observável>.

Mantenha os critérios alinhados aos requisitos funcionais e cubra os principais fluxos de sucesso, erros previsíveis e limites relevantes.

### Fora de escopo

Liste explicitamente aquilo que a feature não inclui.

### Questões em aberto

Liste dúvidas e decisões pendentes. Se nenhuma dúvida existir, indique: "Nenhuma."
