# Plano de implementação 001: Gerenciamento de tarefas

## Base da implementação

A especificação ativa é `specs/001-gerenciamento-de-tarefas.md`.

O estado atual não possui implementação funcional. A solução será construída em camadas:

```text
HTTP/CLI → service → store → domain
```

A aplicação manterá uma única instância do store em memória compartilhada pelos adaptadores HTTP e CLI. O CLI será executado como um processo separado; portanto, seus dados não persistem entre comandos. Isso é coerente com a persistência in-memory especificada, mas significa que os testes e uma execução CLI prolongada devem compartilhar a mesma instância dentro do processo.

## Estrutura planejada

- `src/domain/task.ts`: tipo de tarefa e schemas Zod de entradas externas relacionadas a tarefas.
- `src/domain/errors.ts`: erros previsíveis de domínio, como tarefa não encontrada.
- `src/store/task-store.ts`: interface do repositório e implementação in-memory.
- `src/service/task-service.ts`: casos de uso de criar, listar, concluir e remover.
- `src/http/task-http.ts`: tradução entre HTTP e serviço, incluindo JSON, status e erros.
- `src/cli.ts`: parser de argumentos, validação na fronteira e tradução para texto/JSON/erro.
- `src/index.ts`: composição da aplicação e inicialização do servidor HTTP.
- `src/**/*.test.ts`: testes por camada para validar domínio, serviço, HTTP e CLI.

## Decisões técnicas

### Identificador

Usar `crypto.randomUUID()` para gerar IDs estáveis. Não há dependência externa.

### Ordem das tarefas

A implementação retornará as tarefas pela ordem de criação, usando o array do store como fonte. Não será feita ordenação por `createdAt` em caso de datas iguais de relógio; a ordem de inserção é determinística.

### Validação

Zod será usado nas fronteiras HTTP e CLI:

- título como string com `trim()` implícito por normalização do serviço ou transformação do schema;
- mínimo de um caractere após remoção das extremidades;
- status limitado a `all`, `open` e `done`;
- ID não vazio e fornecido como argumento obrigatório.

Schemas de entrada não devem aceitar campos desconhecidos para criação HTTP, reduzindo ambiguidades e rejeitando payloads malformados pelo contrato atual.

### Erros de domínio

Definir classes previsíveis:

- `TaskNotFoundError` para conclusão ou remoção de ID inexistente;
- opcionalmente `InvalidTaskInputError` apenas se um caso não puder ser representado diretamente por erros de Zod.

`ZodError` será traduzido pelos adaptadores HTTP/CLI. O serviço não conhece status HTTP nem argumentos de linha de comando.

### HTTP

Usar exclusivamente `node:http`, sem framework. O servidor terá limite de corpo de `1 MB`.

Rotas definidas:

- `POST /tasks`;
- `GET /tasks`;
- `PATCH /tasks/:id/done`;
- `DELETE /tasks/:id`.

Comportamento adicional definido pelo plano:

- rota conhecida com método incorreto: `405 Method Not Allowed` + JSON de erro;
- rota inexistente ou caminho inválido: `404 Not Found` + JSON de erro;
- corpo excedendo 1 MB ou conexão inválida: `400 Bad Request`;
- respostas de erro previsíveis terão formato `{ error, message }`;
- `Allow` será enviado em respostas `405`.

A porta será `PORT` se válida, com fallback para `3000`.

### CLI

O parser aceitará somente a sintaxe especificada:

```text
npm run cli -- task create --title "..."
npm run cli -- task list [all|open|done]
npm run cli -- task done --id <id>
npm run cli -- task remove --id <id>
```

Argumentos serão validados antes da chamada ao serviço. Erros previsíveis serão escritos em `stderr` e o processo terminará com código diferente de zero. Não haverá stack trace para erros previsíveis.

Como o store é in-memory, os comandos CLI executados em processos separados não compartilharão dados. No mesmo processo, os testes poderão injetar uma instância compartilhada por meio da composição da CLI.

## Design do store

`TaskStore` será uma interface com operações assíncronas ou síncronas? Nesta versão não há IO. Para favorecer substituição futura e manter a camada consistente, todos os métodos serão assíncronos (`Promise`) com contrato mínimo:

- `create(task)`;
- `findAll()`;
- `findById(id)`;
- `update(task)`;
- `delete(id)`.

`InMemoryTaskStore` guardará um `Map<string, Task>`. A remoção de uma tarefa retornará `true` ou `false`, permitindo ao serviço levantar `TaskNotFoundError`.

O serviço continuará responsável pelas regras de negócio e não confiará apenas no formato do store:

- `create` normaliza o título, gera o modelo e salva;
- `list` filtra por `done`;
- `complete` busca, retorna o mesmo objeto quando já concluído, ou atualiza;
- `remove` verifica/remete erro quando a tarefa não existe.

## Composição

`src/index.ts` criará:

```text
InMemoryTaskStore → TaskService → HTTP handler
```

A CLI criará a mesma cadeia com o store correspondente ao processo do comando.

Nenhuma camada HTTP ou CLI deverá acessar o store diretamente.

## Testes

Os testes serão escritos antes ou junto da implementação correspondente, usando `node:test` e `tsx`.

Coberturas mínimas:

1. **Domain/store**
   - criação do título normalizado;
   - rejeição de título vazio por schema;
   - status inválido;
   - armazenamento, busca e remoção in-memory.

2. **Service**
   - criar com `done = false`;
   - listar `all`, `open` e `done`;
   - concluir tarefa aberta;
   - conclusão idempotente;
   - erro ao concluir/remover ID inexistente;
   - remoção efetiva.

3. **HTTP**
   - `POST /tasks` válido e inválido;
   - JSON inválido e corpo ausente;
   - listagem com filtro omitido/permitido/inválido;
   - conclusão válida/inexistente e idempotência;
   - remoção válida/inexistente;
   - rota inexistente e método incorreto;
   - limite de 1 MB.

4. **CLI**
   - criação válida;
   - título ausente/vazio;
   - listagem dos três filtros;
   - conclusão/removção válida;
   - ID inexistente sem stack trace;
   - argumentos inválidos com código de saída não zero.

Os testes HTTP iniciarão um servidor em porta aleatória ou invocarão o handler diretamente quando necessário.

## Sequenciamento em tarefas pequenas

1. Implementar domínio, store e erros, com testes.
2. Implementar serviço e testes dos casos de uso.
3. Implementar servidor HTTP e testes da API.
4. Implementar CLI e testes dos comandos.
5. Compor `src/index.ts` e finalizar documentação de execução.
6. Executar `npm run typecheck` e `npm run test`.

## Critérios de conclusão do plano

- Todas as operações da especificação estão disponíveis via HTTP e CLI.
- Entradas externas passam por schemas Zod.
- Erros previsíveis são traduzidos sem vazamento de stack trace na borda.
- Nenhuma operação HTTP/CLI acessa o store diretamente.
- TypeCheck e testes passam com o estado final do repositório.
- Comandos de execução estão documentados no README.

## Dependências e integrações

Nenhuma integração externa é necessária. Dependências novas não são previstas além das já declaradas em `package.json`.
