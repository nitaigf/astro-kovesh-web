Você é um engenheiro de software sênior responsável por construir a **primeira versão funcional** de um produto composto por:

1. **API pública** em **FastAPI**
2. **Frontend web** em **SolidJS**
3. Sem banco de dados
4. Sem cache
5. Sem cadastro de usuários
6. Sem painel administrativo
7. Sem filas
8. Com foco em simplicidade, clareza, boa organização e facilidade de evolução futura

## Objetivo do produto

Criar um serviço capaz de receber do usuário:

* data
* hora
* local

E retornar os **dados astrológicos daquele instante e local informados**.

O site é apenas uma camada de demonstração e consumo da API.
O **produto principal gratuito é a API pública** e a documentação de uso com Bruno e Openapi.

---

# Regras de escopo desta primeira versão

## Não implementar nesta fase

* banco de dados
* autenticação de usuário final
* cadastro/login
* histórico de consultas
* dashboard administrativo
* cache persistente
* filas assíncronas
* observabilidade complexa
* billing
* sistema de planos
* internacionalização
* integração com pagamentos
* interpretação textual astrológica
* geração de PDF
* multi-idioma
* mapas gráficos complexos no estilo carta astral circular

## Implementar nesta fase

* API FastAPI funcional
* Frontend SolidJS funcional
* Cálculo astrológico com base em bibliotecas adequadas
* Rate limiting/configurações internas simples para proteger consumo de APIs gratuitas externas
* Estrutura preparada para crescimento futuro
* Docker opcional, se isso não complicar demais
* Documentação clara de setup e execução

---

# Escopo funcional obrigatório

A aplicação deve aceitar como entrada:

* `date` no formato ISO, ex: `2026-04-20`
* `time` no formato `HH:mm` ou `HH:mm:ss`
* `location`, podendo começar de forma simples com:

  * nome textual da cidade/local
  * ou latitude/longitude se necessário como fallback
* `timezone`, quando aplicável
* parâmetros astrológicos:

  * `zodiac_mode`: `tropical` ou `sidereal`
  * `house_system`: `placidus`, `koch`, `whole_sign`

A aplicação deve retornar pelo menos:

## 1. Posições planetárias

Incluir:

* Sol
* Lua
* Mercúrio
* Vênus
* Marte
* Júpiter
* Saturno
* Urano
* Netuno
* Plutão

## 2. Pontos adicionais

* Ascendente
* Casas
* Nodo lunar

## 3. Asteroides

Incluir pelo menos estrutura pronta para alguns principais, como:

* Quíron
* Ceres
* Pallas
* Juno
* Vesta

Se algum corpo não puder ser calculado facilmente na primeira iteração com a biblioteca escolhida, documentar isso claramente e deixar a arquitetura preparada.

## 4. Aspectos

Calcular aspectos principais entre corpos relevantes:

* conjunção
* sextil
* quadratura
* trígono
* oposição

Retornar:

* corpos envolvidos
* tipo de aspecto
* orbe

## 5. Modos

* zodiacal tropical
* zodiacal sideral
* sistemas de casas:

  * Placidus
  * Koch
  * Whole Sign

---

# Diretrizes técnicas

## Backend

Usar:

* Python 3.12+
* FastAPI
* Pydantic
* Uvicorn

### Backend responsibilities

O backend deve:

* validar entrada
* resolver local em latitude/longitude quando possível
* resolver timezone quando necessário
* converter data/hora local em UTC corretamente
* calcular dados astrológicos
* retornar JSON limpo, estável e bem estruturado
* expor documentação OpenAPI
* ter configuração por `.env`
* ter proteção simples de uso para não estourar cotas de serviços gratuitos externos

### Bibliotecas

Escolha as bibliotecas mais adequadas para:

* efemérides/cálculos astrológicos
* geocoding
* timezone lookup

Dê preferência a bibliotecas maduras, estáveis e simples de integrar.

Se usar Swiss Ephemeris ou equivalente:

* organize bem a camada de serviço
* abstraia dependências externas
* documente claramente instalação e eventuais arquivos necessários

## Frontend

Usar:

* SolidJS
* Vite
* TypeScript

### Frontend responsibilities

Criar uma interface simples de consulta da API contendo:

* fundo com estética de espaço sideral
* card central com estilo glassmorphism
* formulário com:

  * data
  * hora
  * local
  * modo zodiacal
  * sistema de casas
* botão de consulta
* área de resultado organizada
* gráfico do mapa criado com canva ou svg, e um select para escolher o sistema de casas a ser apresentado

### Visual

Desejo:

* fundo escuro estilo cosmos
* card/transparência estilo glass
* layout clean
* visual elegante, simples e moderno
* responsivo
* sem exageros de animação

---

# Arquitetura desejada

## Estrutura geral

Monte um monorepo simples ou duas pastas raiz, por exemplo:

* `/api`
* `/web`

Ou outra estrutura clara e justificável.

## Backend architecture

Organize o backend em camadas simples, por exemplo:

* `main.py`
* `api/routes`
* `schemas`
* `services`
* `core/config`
* `utils`

Separar bem:

* validação de input
* geocoding
* timezone resolution
* astrology calculation
* formatting of response

## Frontend architecture

Organize o frontend com:

* páginas
* componentes
* serviços de API
* tipos
* estilos

---

# Contrato inicial da API

Crie pelo menos:

## Healthcheck

* `GET /health`

## Endpoint principal

* `POST /v1/chart`

Entrada esperada, exemplo:

```json
{
  "date": "2026-04-20",
  "time": "14:30:00",
  "location": {
    "query": "São Paulo, SP, Brasil"
  },
  "zodiac_mode": "tropical",
  "house_system": "placidus"
}
```

Também permitir, se conveniente:

```json
{
  "date": "2026-04-20",
  "time": "14:30:00",
  "location": {
    "lat": -23.5505,
    "lng": -46.6333,
    "name": "São Paulo, SP, Brasil",
    "timezone": "America/Sao_Paulo"
  },
  "zodiac_mode": "sidereal",
  "house_system": "whole_sign"
}
```

Saída esperada: JSON consistente com:

* entrada normalizada
* UTC calculado
* coordenadas
* timezone
* corpos celestes
* casas
* ascendente
* aspectos

---

# Regras de qualidade

## Código

* código limpo
* nomes claros
* boa separação de responsabilidades
* comentários apenas quando agregarem valor
* evitar overengineering
* evitar abstrações desnecessárias nesta fase
* tipagem forte onde fizer sentido
* tratamento explícito de erros

## Erros

A API deve retornar mensagens claras para:

* data inválida
* hora inválida
* local não encontrado
* timezone não resolvido
* falha em serviço externo
* parâmetro astrológico inválido

## Segurança básica

Implementar apenas o mínimo necessário:

* CORS configurável
* rate limiting simples por IP ou por processo, se possível sem complicar
* limites configuráveis para chamadas de geocoding
* timeouts em chamadas externas
* validação estrita de payload

---

# Sobre integrações externas

Como o produto não terá banco nem cache nesta primeira fase, usar integrações externas com muito cuidado.

## Requisitos

* configurar limites internos para evitar exceder cotas gratuitas
* centralizar essas configurações em `.env`
* falhar com mensagens claras quando limite interno for atingido
* preferir bibliotecas ou estratégias locais quando possível
* geocoding deve ser o mais econômico possível

Se necessário, começar com suporte híbrido:

* entrada por `location.query`
* entrada manual por `lat/lng/timezone`

Assim, se o geocoding falhar, o sistema continua útil.

---

# Entregáveis esperados

Quero que você gere a **primeira versão funcional completa do projeto**, incluindo:

## 1. Código do backend

* FastAPI funcionando
* endpoint `/health`
* endpoint `/v1/chart`
* schemas e services organizados
* integração de cálculo funcionando

## 2. Código do frontend

* SolidJS funcionando
* formulário de consulta
* consumo da API
* renderização dos resultados

## 3. Arquivos de configuração

* `.env.example`
* instruções de variáveis necessárias

## 4. Documentação

Criar um `README.md` na raiz com:

* visão geral
* stack
* estrutura de pastas
* como rodar backend
* como rodar frontend
* como configurar `.env`
* limitações atuais
* próximos passos recomendados

## 5. Sugestão de roadmap

Ao final, documentar uma seção com evolução futura:

* autenticação para API
* cache
* banco de dados
* planos de uso
* histórico
* gráficos de mapa astral
* interpretação textual
* observabilidade

---

# Modo de execução desejado

Quero que você trabalhe em modo incremental e pragmático:

1. Defina a estrutura de pastas
2. Escolha as bibliotecas
3. Implemente o backend primeiro
4. Depois implemente o frontend
5. Depois ajuste integração entre ambos
6. Depois refine README e `.env.example`

---

# Instrução importante sobre tomada de decisão

Se houver mais de uma alternativa técnica possível:

* escolha a mais simples
* escolha a mais estável
* escolha a que entregue valor mais rápido
* explique resumidamente no README as decisões importantes

Não invente complexidade desnecessária.

---

# Desejo adicional de UX

No frontend:

* mostrar loading durante consulta
* mostrar erros de forma amigável
* exibir resultado em blocos, por exemplo:

  * dados normalizados
  * posições planetárias
  * ascendente e casas
  * aspectos

---

# Resultado esperado do seu trabalho

Ao final, eu quero abrir o projeto e ter:

* backend rodando localmente
* frontend rodando localmente
* formulário funcional
* retorno astrológico real via API
* código organizado para eu continuar evoluindo depois

Comece agora pela estrutura do projeto e pela implementação da primeira versão funcional.
