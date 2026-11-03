# Tarefas 001: Gerenciamento de tarefas

## Ordem de implementação

Cada tarefa é pequena, reversível e deve incluir os testes diretamente relacionados.

### T001 — Criar domínio, erros e validações

Arquivos principais:

- `src/domain/task.ts`
- `src/domain/errors.ts`

Entregas:

- Definir o tipo `Task` com `id`, `title`, `done` e `createdAt`.
- Criar schemas Zod para título, status e entrada HTTP de criação.
- Normalizar título removendo espaços das extremidades.
- Definir `TaskNotFoundError`.

Critérios:

- Título vazio ou apenas com espaços é rejeitado.
- Status aceita somente `all`, `open` e `done`.
- Campos inválidos são representados por `ZodError` ou erro de domínio.

Dependências: nenhuma.

### T002 — Implementar store in-memory com testes

Arquivos principais:

- `src/store/task-store.ts`
- `src/store/task-store.test.ts`

Entregas:

- Definir interface `TaskStore`.
- Implementar `InMemoryTaskStore` em `Map`.
- Cobrir criação, busca por ID, busca de todas, atualização e remoção.

Critérios:

- A ordem de inserção é preservada.
- Remover tarefa existente retorna sucesso.
- Remover tarefa inexistente retorna falso.

Dependências: T001.

### T003 — Implementar serviço de tarefas com testes

Arquivos principais:

- `src/service/task-service.ts`
- `src/service/task-service.test.ts`

Entregas:

- Implementar criação de tarefa, listagem, conclusão e remoção.
- Gerar ID com `crypto.randomUUID()`.
- Gerar timestamp ISO UTC.
- Filtrar por `all`, `open` e `done`.
- Tornar conclusão idempotente.

Critérios:

- Nova tarefa começa com `done = false`.
- Concluir ou remover ID inexistente lança `TaskNotFoundError`.
- Concluir tarefa já concluída mantém o estado e retorna sucesso.
- Remover remove efetivamente do store.

Dependências: T001, T002.

### T004 — Implementar adaptação HTTP com testes

Arquivos principais:

- `src/http/task-http.ts`
- `src/http/task-http.test.ts`

Entregas:

- Implementar `POST /tasks`.
- Implementar `GET /tasks` com filtro opcional.
- Implementar `PATCH /tasks/:id/done`.
- Implementar `DELETE /tasks/:id`.
- Ler corpo JSON com limite de 1 MB.
- Traduzir `ZodError`, `TaskNotFoundError` e erros inesperados.

Critérios:

- Respostas usam JSON e os status definidos pela especificação/plano.
- JSON inválido, corpo ausente e payload excessivo retornam `400` quando aplicável.
- Filtro inválido retorna `400`.
- Tarefa inexistente retorna `404`.
- Remoção retorna `204` sem corpo.
- Rota conhecida com método incorreto retorna `405` com `Allow`.
- Rota desconhecida retorna `404`.

Dependências: T003.

### T005 — Implementar CLI e testes

Arquivos principais:

- `src/cli.ts`
- `src/cli.test.ts`

Entregas:

- Validar sintaxe de `create`, `list`, `done` e `remove`.
- Criar store local da execução do comando.
- Chamar apenas `TaskService` após validação.
- Escrever JSON ou texto em `stdout`.
- Escrever erro previsível em `stderr` e usar código de saída diferente de zero.

Critérios:

- Todos os subcomandos especificados funcionam.
- Título, status e ID obrigatórios são validados por Zod.
- Argumentos desconhecidos ou incompletos falham sem stack trace.
- Erros de domínio são apresentados como mensagens previsíveis.

Dependências: T003.

### T006 — Compor aplicação HTTP e atualizar documentação

Arquivos principais:

- `src/index.ts`
- `README.md`

Entregas:

- Compor `InMemoryTaskStore -> TaskService -> HTTP handler`.
- Iniciar o servidor na porta `PORT`, limitada a porta válida, ou em `3000`.
- Documentar instalação, execução HTTP e comandos CLI.

Critérios:

- `npm run dev` inicia a API.
- `npm run cli` executa os comandos definidos.
- README não descreve o projeto como apenas um esqueleto.

Dependências: T004, T005.

### T007 — Executar validação completa

Arquivos principais:

- Nenhum arquivo novo obrigatório.

Entregas:

- Executar `npm run typecheck`.
- Executar `npm run test`.
- Corrigir somente falhas causadas por esta implementação.
- Verificar os comandos HTTP e CLI principais, quando viável.

Critérios:

- Typecheck verde.
- Todos os testes verdes.
- Nenhum comportamento básico da especificação deixa de funcionar.

Dependências: T006.

## Dependências resumidas

```text
T001
  └─> T002
        └─> T003
              ├─> T004
              └─> T005
                    └─> (T004 + T005) -> T006 -> T007
```

## Escopo para implementação

Após revisão humana desta decomposição:

1. Implementar primeiro T001–T003 como núcleo funcional.
2. Implementar T004 e T005 como interfaces.
3. Implementar T006 e validar com T007.
4. Não iniciar implementação sem o comando `/implementar 001` ou instrução equivalente.
