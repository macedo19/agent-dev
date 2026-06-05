# Agent Dev — Assistente de Engenharia com IA

Microserviço backend que expõe uma API REST com um agente de IA capaz de executar quatro fluxos de automação voltados ao processo de desenvolvimento: revisão de código, avaliação de aderência a tarefas, geração de documentação técnica e geração de testes unitários.

---

## Decisões Técnicas

### Linguagem e Framework
**Node.js + TypeScript + Express**

TypeScript foi escolhido por segurança de tipos em tempo de compilação, especialmente relevante ao lidar com payloads dinâmicos de LLM. Express foi preferido ao Fastify pela maior familiaridade do ecossistema e pela necessidade de rapidez na entrega, sem sacrificar organização — a arquitetura em camadas (controller → service → repository) garante separação de responsabilidades independente do framework HTTP.

### Banco de Dados
**PostgreSQL (via Docker)**

Escolhido por ser o banco mais próximo do ambiente de produção real de um sistema como o CPJ-Cobrança, que lida com dados financeiros. SQLite seria mais simples para o case, mas PostgreSQL permite validar o schema com tipos reais (UUID nativo via `@db.Uuid`, JSON nativo para `input_payload` e `output_payload`). O Prisma foi usado como ORM pela geração de tipos TypeScript alinhada com o schema, eliminando a necessidade de tipos manuais para as entidades de banco.

### Provedor de IA
**Ollama (local) — 100% sem chave de API**

O Ollama foi escolhido para que os avaliadores possam executar o projeto sem custo e sem configuração de chaves externas. O cliente suporta tanto modelos locais quanto instâncias cloud via variável de ambiente `USE_OLLAMA_CLOUD`. Modelos validados durante o desenvolvimento:

- **Local:** `mistral-medium-3.5`, `kimi-k2.6`
- **Cloud:** `gemma4:31b-cloud`

### Cache
**Redis** para cache por hash do input — entradas idênticas retornam o resultado cacheado sem invocar o LLM, reduzindo latência e custo de inferência.

### Proxy Reverso
**Nginx** como ponto de entrada único na porta `80`, com proxy para a aplicação na porta `3000`.

---

## Como subir o projeto

### Pré-requisitos
- Docker e Docker Compose instalados
- Mínimo 8 GB de RAM disponível (para o modelo Ollama local)

### Passos

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd agent-dev

# 2. Configure o ambiente
cp .env.example .env
# Edite o .env conforme necessário (veja seção abaixo)

# 3. Suba todos os serviços
docker compose up --build

# 4. Verifique que a aplicação está no ar
curl http://localhost/health
# Resposta esperada: { "status": "ok" }
```

> O serviço Ollama baixa e inicializa o modelo automaticamente na primeira execução. Aguarde o log `model loaded` antes de fazer as primeiras requisições.

---

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `POSTGRES_VERSION` | Versão da imagem PostgreSQL | `17` |
| `POSTGRES_DB` | Nome do banco de dados | `app_db` |
| `POSTGRES_USER` | Usuário do banco | `app_user` |
| `POSTGRES_PASSWORD` | Senha do banco | `senha_segura` |
| `POSTGRES_PORT` | Porta exposta do banco | `5432` |
| `DATABASE_URL` | Connection string completa do Prisma | `postgresql://app_user:senha@localhost:5432/app_db` |
| `PORT` | Porta interna da aplicação | `3000` |
| `USE_OLLAMA_CLOUD` | `true` para usar instância cloud, `false` para local | `false` |
| `OLLAMA_HOST_LOCAL` | Endereço do Ollama local | `http://ollama:11434` |
| `OLLAMA_HOST_CLOUD` | Endereço do Ollama cloud | `https://seu-ollama-cloud.com` |
| `OLLAMA_MODEL` | Modelo a ser usado | `mistral-medium-3.5` |
| `OLLAMA_API_KEY` | Chave de autenticação (cloud) | `sua_chave` |
| `REDIS_PORT` | Porta exposta do Redis | `6379` |
| `REDIS_HOST` | URL de conexão do Redis | `redis://redis:6379` |

---

## Fluxos do Agente — Exemplos de Request e Response

### GET /health

```http
GET http://localhost/health
```

```json
{ "status": "ok" }
```

---

### POST /api/v1/review — Code Review Automatizado

**Campos de entrada:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | string | ✅ | Trecho de código a ser revisado (max 10.000 chars) |
| `language` | `Python` \| `JavaScript` \| `TypeScript` | ✅ | Linguagem do código |
| `context` | string | ❌ | Descrição opcional do módulo ou contexto |

**Request:**
```http
POST http://localhost/api/v1/review
Content-Type: application/json

{
  "language": "TypeScript",
  "context": "Módulo de cálculo de oferta de negociação de dívidas",
  "code": "export async function calcularOferta(devedorId: string, prazo: number) {\n  const db = require('../db');\n  const divida = await db.query(\n    `SELECT * FROM dividas WHERE devedor_id = '${devedorId}'`\n  );\n  if (!divida) return null;\n  let desconto = 0;\n  if (prazo <= 30) desconto = 0.20;\n  if (prazo <= 15) desconto = 0.30;\n  if (prazo <= 7)  desconto = 0.40;\n  const valorOferta = divida[0].valor_total * (1 - desconto);\n  console.log('Calculando oferta para devedor: ' + devedorId + ' valor: ' + valorOferta);\n  return valorOferta;\n}"
}
```

**Response:**
```json
{
  "data": {
    "overall_quality": "critical",
    "score": 2,
    "issues": [
      {
        "severity": "high",
        "line_hint": "db.query(`SELECT * FROM dividas WHERE devedor_id = '${devedorId}'`)",
        "description": "SQL Injection: o valor de devedorId é interpolado diretamente na query sem sanitização.",
        "suggestion": "Use queries parametrizadas: db.query('SELECT * FROM dividas WHERE devedor_id = $1', [devedorId])"
      },
      {
        "severity": "high",
        "line_hint": "require('../db')",
        "description": "Uso de require() dentro de função assíncrona — acoplamento implícito e impossível de mockar em testes.",
        "suggestion": "Injete a dependência de banco via parâmetro ou construtor."
      },
      {
        "severity": "medium",
        "line_hint": "console.log",
        "description": "Dados sensíveis (devedorId e valorOferta) expostos em log sem estrutura.",
        "suggestion": "Use um logger estruturado e evite logar valores financeiros de clientes."
      },
      {
        "severity": "medium",
        "line_hint": "if (prazo <= 30) ... if (prazo <= 15)",
        "description": "Lógica de desconto com condições sobrepostas — prazo 7 aplica apenas 40% mas passa pelas três condições.",
        "suggestion": "Use else if para garantir exclusividade das condições."
      }
    ],
    "positives": [
      "Tipagem básica nos parâmetros da função (string, number)"
    ],
    "summary": "O código apresenta falha crítica de segurança por SQL Injection e viola o princípio de inversão de dependência ao usar require() internamente. A lógica de desconto tem bug silencioso por condições sobrepostas. Requer refatoração completa antes de ir para produção."
  }
}
```

---

### POST /api/v1/compliance — Avaliação de Aderência a Tarefa

**Campos de entrada:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | string | ✅ | Código implementado |
| `language` | `Python` \| `JavaScript` \| `TypeScript` | ✅ | Linguagem do código |
| `task_description` | string | ❌ | História, ticket ou critérios de aceite |

**Request:**
```http
POST http://localhost/api/v1/compliance
Content-Type: application/json

{
  "language": "TypeScript",
  "task_description": "História: Registrar tentativa de contato com devedor\n\nCritérios de aceite:\n- Deve salvar: id do devedor, canal (telefone/email/whatsapp), data/hora, resultado\n- Deve impedir mais de 3 tentativas no mesmo canal no mesmo dia\n- Deve retornar erro descritivo se o devedor não existir\n- Deve ser auditável (created_by é obrigatório)\n- Não deve expor dados do devedor na resposta além do id",
  "code": "app.post('/contatos', async (req, res) => {\n  const { devedor_id, canal, resultado } = req.body;\n  const devedor = await DevedorRepository.findById(devedor_id);\n  if (!devedor) return res.status(404).json({ error: 'Devedor não encontrado' });\n  const contato = await ContatoRepository.create({ devedor_id, canal, resultado, data_hora: new Date() });\n  return res.status(201).json(contato);\n});"
}
```

**Response:**
```json
{
  "data": {
    "compliant": false,
    "compliance_score": 33,
    "covered_requirements": [
      "Salvar id do devedor, canal e resultado",
      "Retornar erro quando devedor não existe (404)"
    ],
    "missing_requirements": [
      "Impedir mais de 3 tentativas no mesmo canal no mesmo dia",
      "Campo created_by obrigatório para auditoria"
    ],
    "partial_requirements": [
      "Salvar data/hora — implementado, mas não há validação de fuso horário ou formato",
      "Não expor dados do devedor — a resposta retorna o objeto contato completo, que pode incluir dados sensíveis"
    ],
    "verdict": "A implementação cobre apenas os requisitos básicos de persistência e validação de existência do devedor. Os requisitos de negócio mais críticos estão ausentes: o limite de tentativas por canal/dia (exigido pelo BACEN) e o campo de auditoria created_by não foram implementados. A resposta da API retorna o objeto completo do contato, o que pode expor dados além do id do devedor conforme especificado."
  }
}
```

---

### POST /api/v1/document — Geração de Documentação Técnica

**Campos de entrada:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | string | ✅ | Módulo, classe ou função a ser documentada |
| `language` | `Python` \| `JavaScript` \| `TypeScript` | ✅ | Linguagem do código |
| `doc_type` | `technical` \| `operational` | ✅ | Tipo de documentação |

**Request (doc_type: technical):**
```http
POST http://localhost/api/v1/document
Content-Type: application/json

{
  "language": "Python",
  "doc_type": "technical",
  "code": "from datetime import date\nfrom typing import Literal\n\nAgeingBucket = Literal['current', '1-30', '31-60', '61-90', '91-180', '180+']\n\ndef classify_aging(due_date: date, reference_date: date | None = None) -> AgeingBucket:\n    ref = reference_date or date.today()\n    days_overdue = (ref - due_date).days\n    if days_overdue <= 0:   return 'current'\n    if days_overdue <= 30:  return '1-30'\n    if days_overdue <= 60:  return '31-60'\n    if days_overdue <= 90:  return '61-90'\n    if days_overdue <= 180: return '91-180'\n    return '180+'"
}
```

**Response:**
```json
{
  "data": {
    "doc_type": "technical",
    "title": "classify_aging",
    "description": "Classifica uma dívida em um bucket de aging com base na diferença em dias entre a data de referência e a data de vencimento. Retorna o bucket correspondente ao intervalo de atraso.",
    "inputs": [
      { "name": "due_date", "type": "date", "description": "Data de vencimento da dívida." },
      { "name": "reference_date", "type": "date | None", "description": "Data base para cálculo. Se None, usa date.today()." }
    ],
    "outputs": [
      { "name": "bucket", "type": "AgeingBucket", "description": "Literal com o intervalo de atraso: 'current', '1-30', '31-60', '61-90', '91-180' ou '180+'." }
    ],
    "side_effects": [],
    "usage_example": "from datetime import date\n\nbucket = classify_aging(due_date=date(2024, 1, 1), reference_date=date(2024, 2, 15))\n# Retorna: '31-60'",
    "notes": "A função é pura — sem efeitos colaterais. Para days_overdue <= 0 (dívida no prazo ou futura), retorna 'current'. Os intervalos são fechados no limite superior."
  }
}
```

---

### POST /api/v1/tests — Geração de Testes Unitários

**Campos de entrada:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | string | ✅ | Função ou módulo a ser testado |
| `language` | `Python` \| `JavaScript` \| `TypeScript` | ✅ | Linguagem do código |
| `test_framework` | `jest` \| `vitest` \| `mocha` \| `pytest` | ✅ | Framework de testes |

**Request:**
```http
POST http://localhost/api/v1/tests
Content-Type: application/json

{
  "language": "TypeScript",
  "test_framework": "jest",
  "code": "export function calcularJurosSimples(principal: number, taxaMensal: number, meses: number): number {\n  if (principal < 0 || taxaMensal < 0 || meses < 0) {\n    throw new Error('Parâmetros não podem ser negativos');\n  }\n  return parseFloat((principal * (1 + taxaMensal * meses)).toFixed(2));\n}"
}
```

**Response:**
```json
{
  "data": {
    "framework": "jest",
    "test_file": "import { calcularJurosSimples } from './parcelas.service'\n\ndescribe('calcularJurosSimples', () => {\n\n  describe('happy path', () => {\n    it('should return correct amount with standard inputs', () => {\n      expect(calcularJurosSimples(1000, 0.05, 12)).toBe(1600.00)\n    })\n\n    it('should return principal when taxaMensal is zero', () => {\n      expect(calcularJurosSimples(1000, 0, 12)).toBe(1000.00)\n    })\n  })\n\n  describe('edge cases', () => {\n    it('should return principal when meses is zero', () => {\n      expect(calcularJurosSimples(1000, 0.05, 0)).toBe(1000.00)\n    })\n\n    it('should handle very small decimal values without floating point error', () => {\n      expect(calcularJurosSimples(0.01, 0.01, 1)).toBe(0.01)\n    })\n  })\n\n  describe('error cases', () => {\n    it('should throw when principal is negative', () => {\n      expect(() => calcularJurosSimples(-100, 0.05, 12)).toThrow('Parâmetros não podem ser negativos')\n    })\n\n    it('should throw when taxaMensal is negative', () => {\n      expect(() => calcularJurosSimples(1000, -0.05, 12)).toThrow('Parâmetros não podem ser negativos')\n    })\n\n    it('should throw when meses is negative', () => {\n      expect(() => calcularJurosSimples(1000, 0.05, -1)).toThrow('Parâmetros não podem ser negativos')\n    })\n  })\n})",
    "test_cases": [
      { "name": "should return correct amount with standard inputs", "type": "happy_path", "description": "Verifica o cálculo com taxa e prazo válidos representativos." },
      { "name": "should return principal when taxaMensal is zero", "type": "happy_path", "description": "Taxa zero não deve gerar juros." },
      { "name": "should return principal when meses is zero", "type": "edge_case", "description": "Zero meses retorna exatamente o principal sem acréscimo." },
      { "name": "should handle very small decimal values without floating point error", "type": "edge_case", "description": "Valores mínimos não devem gerar erro de ponto flutuante." },
      { "name": "should throw when principal is negative", "type": "error_case", "description": "Principal negativo deve lançar exceção com mensagem descritiva." },
      { "name": "should throw when taxaMensal is negative", "type": "error_case", "description": "Taxa negativa deve lançar exceção." },
      { "name": "should throw when meses is negative", "type": "error_case", "description": "Prazo negativo deve lançar exceção." }
    ],
    "coverage_hints": [
      "Testar comportamento com valores muito altos de meses (ex: 1200) requer validação de overflow de ponto flutuante em ambiente real.",
      "A função é pura — não há dependências externas a mockar."
    ]
  }
}
```

---

### GET /api/v1/history — Últimas 20 execuções

```http
GET http://localhost/api/v1/history
```

```json
{
  "data": [
    {
      "id": "a1b2c3d4-0000-0000-0000-000000000001",
      "type": "review",
      "timestamp": "2025-06-04 14:32:10"
    },
    {
      "id": "a1b2c3d4-0000-0000-0000-000000000002",
      "type": "compliance",
      "timestamp": "2025-06-04 14:28:55"
    }
  ]
}
```

---

### GET /api/v1/history/:id — Resultado completo de uma execução

```http
GET http://localhost/api/v1/history/a1b2c3d4-0000-0000-0000-000000000001
```

```json
{
  "data": {
    "id": "a1b2c3d4-0000-0000-0000-000000000001",
    "createdAt": "2025-06-04T14:32:10.000Z",
    "flowType": "review",
    "inputPayload": { "code": "...", "language": "TypeScript" },
    "outputPayload": { "overall_quality": "critical", "score": 2, "..." : "..." },
    "durationMs": 4821
  }
}
```

---

## Diferenciais Implementados

### Cache por hash do input (Redis)
Cada entrada é convertida em um hash SHA-256. Antes de invocar o LLM, o serviço consulta o Redis. Se a entrada já foi processada anteriormente, o resultado cacheado é retornado imediatamente — sem latência de inferência.

```
Input idêntico → hash SHA-256 → hit no Redis → resposta em <10ms
Input novo     → hash SHA-256 → miss no Redis → LLM → salva no cache + banco
```

### Prompt templating estruturado
Cada fluxo tem um arquivo de prompt dedicado em `src/common/prompts/`, com separação clara entre:
- Regras do sistema (papel do agente, linguagens suportadas, critérios)
- Exemplos de raciocínio com código real do domínio CPJ-Cobrança
- Dados do usuário injetados via `%placeholders`
- Formato de saída JSON com schema explícito e regras de validação

### Logs estruturados em JSON (Winston)
Todos os logs são emitidos em JSON com `timestamp` automático, facilitando ingestão por ferramentas como Datadog, Loki ou CloudWatch.

### Validação de schema na entrada (Zod)
Todos os endpoints validam o payload de entrada com Zod antes de qualquer processamento. Erros de validação retornam `400` com lista detalhada dos problemas, incluindo validação de formato UUID no endpoint de histórico.

### Hierarquia de erros centralizada
Erros tipados (`AppError`, `DtoError`, `OllamaClientError`, `RedisError`) com middleware centralizado — nenhum handler de rota precisa conhecer os detalhes de HTTP status.

---

## O que faria diferente com mais tempo

- **Retry com backoff exponencial nas chamadas ao LLM** — modelos locais podem falhar por timeout, especialmente sob carga. Uma estratégia de retry com jitter evitaria falhas cascata.
- **TTL no cache Redis** — atualmente o cache não expira. Com TTL configurável por fluxo, seria possível balancear frescor dos resultados com economia de inferência.
- **Separação do modelo de domínio em DTOs de escrita e leitura** — a classe `ExecutionAgent` serve tanto para criar registros (sem `id`/`createdAt`) quanto para tipar leituras do banco, o que exige campos opcionais desnecessários. Separar em `CreateExecutionAgentDto` e usar o tipo gerado pelo Prisma para leitura eliminaria esse acoplamento.
- **Testes automatizados dos endpoints** — prioridade alta para garantir que os contratos de entrada/saída não quebrem silenciosamente ao evoluir os prompts.
- **Streaming via SSE no endpoint de review** — respostas de revisão de código tendem a ser longas; streaming melhoraria a percepção de latência para o usuário.
- **`model_used` e `token_count` no registro de execução** — o Ollama já retorna `total_duration` e metadados do modelo; persistir esses dados permitiria análise de custo e desempenho por fluxo.
