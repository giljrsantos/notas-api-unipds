# Especificação: Gerenciamento de tarefas

## Objetivo

Disponibilizar o gerenciamento básico de tarefas por HTTP e pela interface de linha de comando (CLI), utilizando persistência em memória durante o processo da aplicação.

## Usuários e casos de uso

Como usuário, quero:

1. Criar uma tarefa informando um título.
2. Listar todas as tarefas, apenas as abertas ou apenas as concluídas.
3. Marcar uma tarefa como concluída.
4. Remover uma tarefa existente.

## Modelo de domínio

Uma tarefa possui:

- `id`: identificador estável gerado pela aplicação.
- `title`: título textual da tarefa.
- `done`: indicador booleano de conclusão.
- `createdAt`: data/hora ISO 8601 em UTC.

## Regras de negócio

- O título é obrigatório e não pode conter apenas espaços.
- O título é armazenado sem espaços vazios nas extremidades.
- Uma tarefa começa com `done = false`.
- IDs inexistentes não podem ser concluídos ou removidos.
- Concluir uma tarefa já concluída é uma operação idempotente e não cria erro.
- Remover uma tarefa inexistente não é uma operação válida e retorna erro previsível.
- Os filtros de listagem aceitam somente: `all`, `open` e `done`.
- A persistência é in-memory: os dados deixam de existir ao reiniciar o processo.

## API HTTP

### Criar tarefa

`POST /tasks`

Corpo JSON:

```json
{
  "title": "Estudar TypeScript"
}
```

Respostas esperadas:

- `201 Created`: tarefa criada, no corpo da resposta.
- `400 Bad Request`: JSON inválido, campos inválidos ou título ausente/vazio.

### Listar tarefas

`GET /tasks?status=all|open|done`

O parâmetro `status` é opcional. Quando omitido, usa-se `all`.

Respostas esperadas:

- `200 OK`: array de tarefas correspondentes ao filtro.

Erros:

- `400 Bad Request`: filtro diferente de `all`, `open` ou `done`.

### Concluir tarefa

`PATCH /tasks/:id/done`

Corpo vazio ou JSON vazio.

Respostas esperadas:

- `200 OK`: tarefa atualizada.
- `404 Not Found`: tarefa não encontrada.

### Remover tarefa

`DELETE /tasks/:id`

Respostas esperadas:

- `204 No Content`: tarefa removida.
- `404 Not Found`: tarefa não encontrada.

## Contrato de saída HTTP

As tarefas devem ser representadas em JSON:

```json
{
  "id": "...",
  "title": "Estudar TypeScript",
  "done": false,
  "createdAt": "2026-10-27T22:47:07.691Z"
}
```

Os erros HTTP previsíveis devem usar JSON:

```json
{
  "error": "TaskNotFound",
  "message": "Task not found"
}
```

## CLI

A CLI usa o mesmo serviço de domínio da API:

```text
npm run cli -- task create --title "Estudar TypeScript"
npm run cli -- task list [all|open|done]
npm run cli -- task done --id <id>
npm run cli -- task remove --id <id>
```

Formato de saída:

- `create`: imprime a tarefa criada em JSON.
- `list`: imprime o array de tarefas em JSON.
- `done`: imprime a tarefa atualizada em JSON.
- `remove`: imprime uma confirmação curta em texto, por exemplo `Task <id> removed`.

Erros de validação ou domínio devem ser apresentados na saída padrão de erro, sem stack trace, com um código de saída diferente de zero.

## Critérios de aceite

### Criação

- A API aceita uma requisição válida e retorna status `201` com a tarefa criada.
- A API rejeita título vazio, composto apenas de espaços ou JSON inválido com status `400`.
- A CLI cria uma tarefa para um título válido.
- A CLI rejeita criação sem título ou com título vazio.

### Listagem

- Sem filtro, HTTP e CLI retornam todas as tarefas.
- Os valores `all`, `open` e `done` restringem corretamente o resultado.
- HTTP rejeita filtro inválido com status `400`.
- CLI rejeita filtro inválido com código de saída diferente de zero.

### Conclusão

- Uma tarefa aberta passa para `done = true`.
- Concluir novamente retorna sucesso sem alterar o estado além do já concluído.
- ID inexistente retorna erro HTTP `404` ou erro previsível na CLI.

### Remoção

- Uma tarefa existente é removida e desaparece das próximas listagens.
- HTTP retorna `204` e CLI informa a remoção.
- ID inexistente retorna erro HTTP `404` ou erro previsível na CLI.

## Limites não funcionais

- Entradas externas são validadas com Zod.
- Implementação segue as camadas `HTTP/CLI -> service -> store -> domain`.
- O servidor HTTP deve ouvir na porta configurada ou em `3000` por padrão.
- A aplicação não deve depender de banco de dados ou serviços externos.
- Requisitos de autenticação, autorização, concorrência distribuída, auditoria e persistência permanente estão fora do escopo desta versão.

## Casos de erro adicionais

- Método HTTP não suportado em uma rota conhecida: status `404` ou `405`, conforme implementação definida na fase de planejamento.
- Rota inexistente: `404 Not Found` em JSON.
- Corpo JSON ausente ou malformado: `400 Bad Request` em JSON.
- Limite máximo de tamanho do corpo não foi especificado nesta fase; deve ser definido no planejamento.
