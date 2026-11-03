# Notas API

API HTTP e interface de linha de comando (CLI) para gerenciamento de tarefas. Este projeto foi desenvolvido como estudo acadêmico e demonstra uma organização em camadas com TypeScript, validação de dados com Zod e servidor HTTP nativo do Node.js.

> **Persistência em memória:** as tarefas existem somente enquanto o processo que as mantém estiver em execução. Não há banco de dados nem persistência entre reinicializações.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias e requisitos](#tecnologias-e-requisitos)
- [Instalação](#instalação)
- [Executar a API HTTP](#executar-a-api-http)
- [Referência da API](#referência-da-api)
- [Usar a CLI](#usar-a-cli)
- [Executar testes e verificação de tipos](#executar-testes-e-verificação-de-tipos)
- [Arquitetura e estrutura](#arquitetura-e-estrutura)
- [Modelo de tarefa](#modelo-de-tarefa)
- [Limitações e escopo](#limitações-e-escopo)
- [Especificações do projeto](#especificações-do-projeto)

## Funcionalidades

- Criar uma tarefa com título.
- Listar todas as tarefas ou filtrar tarefas abertas e concluídas.
- Marcar uma tarefa como concluída.
- Remover uma tarefa.
- Disponibilizar as operações por HTTP e CLI.
- Validar entradas externas com Zod.
- Retornar erros HTTP previsíveis em JSON.

## Tecnologias e requisitos

- Node.js 24 ou compatível.
- npm.
- TypeScript em módulos ES (ESM), com verificação estrita de tipos.
- `node:http` para o servidor HTTP, sem framework web.
- Zod para validação.
- `node:test` com `tsx` para execução dos testes.

## Instalação

Clone o repositório e entre na pasta do projeto. Em seguida, instale as dependências:

```bash
npm install
```

## Executar a API HTTP

Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

Por padrão, a API escuta em `http://localhost:3000`. Para escolher outra porta, defina a variável de ambiente `PORT`:

```bash
PORT=4000 npm run dev
```

O valor de `PORT` deve ser um número inteiro entre `1` e `65535`. Se não for informado ou não for válido, a aplicação usa a porta `3000`.

## Referência da API

Todas as respostas com conteúdo usam JSON, salvo a remoção bem-sucedida, que retorna `204 No Content`.

### Criar tarefa

```http
POST /tasks
Content-Type: application/json
```

Corpo:

```json
{
  "title": "Estudar TypeScript"
}
```

Resposta `201 Created`:

```json
{
  "id": "identificador-gerado",
  "title": "Estudar TypeScript",
  "done": false,
  "createdAt": "2026-10-27T22:47:07.691Z"
}
```

O título é obrigatório, deve conter pelo menos um caractere que não seja espaço e é armazenado sem espaços nas extremidades. Campos adicionais no objeto de criação não são aceitos.

Exemplo com `curl`:

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Estudar TypeScript"}'
```

### Listar tarefas

```http
GET /tasks
GET /tasks?status=all
GET /tasks?status=open
GET /tasks?status=done
```

O parâmetro `status` é opcional. Se omitido, o valor padrão é `all`.

| Valor | Resultado |
| --- | --- |
| `all` | Todas as tarefas. |
| `open` | Somente tarefas ainda não concluídas. |
| `done` | Somente tarefas concluídas. |

Resposta `200 OK`: array de tarefas, que pode estar vazio.

```bash
curl 'http://localhost:3000/tasks'
curl 'http://localhost:3000/tasks?status=open'
curl 'http://localhost:3000/tasks?status=done'
```

Um valor de `status` diferente de `all`, `open` ou `done` retorna `400 Bad Request`.

### Concluir tarefa

```http
PATCH /tasks/{id}/done
```

Resposta `200 OK`: retorna a tarefa com `done: true`. Concluir uma tarefa que já está concluída é idempotente: a operação continua sendo bem-sucedida.

```bash
curl -i -X PATCH http://localhost:3000/tasks/identificador-da-tarefa/done
```

Se o identificador não existir, a API retorna `404 Not Found`.

### Remover tarefa

```http
DELETE /tasks/{id}
```

Resposta `204 No Content`, sem corpo, quando a tarefa é removida.

```bash
curl -i -X DELETE http://localhost:3000/tasks/identificador-da-tarefa
```

Se o identificador não existir, a API retorna `404 Not Found`.

### Erros

Os erros previsíveis da API são apresentados em JSON no formato:

```json
{
  "error": "TaskNotFound",
  "message": "Task not found"
}
```

Os principais status de erro são:

| Status | Situação |
| --- | --- |
| `400 Bad Request` | JSON inválido, entrada inválida, filtro não suportado ou corpo da requisição maior que 1 MiB. |
| `404 Not Found` | Rota inexistente ou tarefa não encontrada. |
| `405 Method Not Allowed` | Método não permitido para uma rota reconhecida; a resposta inclui o cabeçalho `Allow`. |
| `500 Internal Server Error` | Erro inesperado durante o processamento. |

## Usar a CLI

Os comandos são executados com `npm run cli --`, passando os argumentos depois de `--`.

### Criar tarefa

```bash
npm run cli -- task create --title "Estudar TypeScript"
```

Imprime a tarefa criada em JSON.

### Listar tarefas

```bash
npm run cli -- task list
npm run cli -- task list all
npm run cli -- task list open
npm run cli -- task list done
```

Sem filtro, a listagem usa `all`. O resultado é impresso como um array JSON.

### Concluir tarefa

```bash
npm run cli -- task done --id identificador-da-tarefa
```

Imprime a tarefa atualizada em JSON.

### Remover tarefa

```bash
npm run cli -- task remove --id identificador-da-tarefa
```

Imprime uma confirmação em texto após a remoção.

Erros de validação, comandos inválidos e identificadores inexistentes são escritos em `stderr`; a CLI retorna código de saída diferente de zero nesses casos.

> **Importante sobre a CLI:** cada execução de `npm run cli` inicia um processo separado e, portanto, um armazenamento em memória novo. Assim, criar uma tarefa em um comando e tentar listá-la em outro não funciona: a tarefa não é compartilhada com o processo do servidor HTTP nem persiste entre comandos.

## Executar testes e verificação de tipos

Executar os testes automatizados:

```bash
npm run test
```

Verificar os tipos TypeScript sem gerar arquivos de saída:

```bash
npm run typecheck
```

## Arquitetura e estrutura

As dependências seguem o fluxo:

```text
HTTP / CLI -> service -> store
                    -> domain
```

- **Domain:** define o modelo, schemas de validação e erros de domínio; não realiza entrada e saída.
- **Service:** implementa os casos de uso e as regras de negócio.
- **Store:** abstrai o acesso às tarefas e fornece a implementação em memória.
- **HTTP e CLI:** validam ou traduzem entradas e apresentam os resultados na respectiva interface.

Estrutura principal:

```text
src/
├── domain/
│   ├── errors.ts             # Erros de domínio
│   ├── task.ts               # Tipo Task e schemas Zod
│   └── task.test.ts          # Testes de schemas do domínio
├── http/
│   ├── task-http.ts          # Rotas e tradução de respostas HTTP
│   └── task-http.test.ts     # Testes HTTP
├── service/
│   ├── task-service.ts       # Casos de uso de tarefas
│   └── task-service.test.ts  # Testes do serviço
├── store/
│   ├── task-store.ts         # Contrato e store em memória
│   └── task-store.test.ts    # Testes do store
├── cli.ts                    # Interface de linha de comando
├── cli.test.ts               # Testes da CLI
└── index.ts                  # Composição e inicialização do servidor
specs/
├── constitution.md                       # Princípios e stack do projeto
├── 001-gerenciamento-de-tarefas.md       # Especificação funcional
├── 001-gerenciamento-de-tarefas-plan.md  # Plano técnico
└── 001-gerenciamento-de-tarefas-tasks.md # Decomposição em tarefas
```

## Modelo de tarefa

Cada tarefa possui:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | Identificador único gerado pela aplicação com UUID. |
| `title` | `string` | Título obrigatório, normalizado sem espaços nas extremidades. |
| `done` | `boolean` | Estado de conclusão; começa como `false`. |
| `createdAt` | `string` | Data e hora de criação em formato ISO 8601 UTC. |

## Limitações e escopo

- O armazenamento é em memória: reiniciar o servidor remove os dados.
- A CLI não compartilha armazenamento com o servidor nem entre invocações.
- Não há banco de dados, autenticação ou autorização.
- Não há edição de título, paginação ou sincronização entre instâncias.
- O projeto usa o servidor HTTP nativo do Node.js e não depende de um framework web.
- O escopo não inclui serviços externos.

## Especificações do projeto

Os documentos de especificação, plano, tarefas e princípios arquiteturais estão em [`specs/`](./specs/). Eles registram o escopo funcional e as decisões de implementação desta versão.
