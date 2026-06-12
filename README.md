# Desafio Técnico – Automação de Testes | EBAC Shop

## Objetivo

Este projeto foi desenvolvido como parte de um desafio técnico. O objetivo é validar e automatizar parte do fluxo crítico de compra da aplicação **EBAC Shop**, contemplando não apenas a implementação técnica da automação, mas também a análise estratégica de qualidade, priorização de cenários críticos e investigação de possíveis falhas em produção.

Aplicação utilizada no desafio:
**EBAC Shop**
http://lojaebac.ebaconline.art.br/

## Sumário

* [Stack Utilizada](#stack-utilizada)
* [Instalação e Execução](#instalação-e-execução)
* [Estrutura do Projeto](#estrutura-do-projeto)
* [Cenários de Teste Automatizados](#cenários-de-teste-autmatizados)
  * [Observações e Limitações](#observações-e-limitações)
* [Análise de Qualidade](#análise-de-qualidade)

  * [Fluxos priorizados](#fluxos-priorizados)
  * [Riscos identificados durante o mapeamento](#riscos-identificados-durante-o-mapeamento)
  * [O que foi testado](#o-que-foi-testado)
  * [Detalhamento do Risco por Cenários Automatizados](#detalhaento-do-risco-por-cenários-automatizados)
  * [O que não foi testado](#o-que-não-foi-testado)
* [Cenário de Investigação](#cenário-de-investigação)

  * [Problema reportado](#problema-reportado)
  * [Primeira ação de investigação](#primeira-ação-de-investigação)
* [Evidências](#evidências)
* [Considerações Finais](#considerações-finais)


---

# Stack Utilizada

| Tecnologia | Versão |
|------------|--------|
| [Cypress](https://www.cypress.io/) | 15.17.0 |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 |
| Node.js | >= 20 |

### Motivos da escolha

A escolha do Cypress com TypeScript foi realizada devido à facilidade de implementação, boa legibilidade do código, ampla adoção no mercado e suporte a testes end-to-end com execução simples e manutenção escalável.

---

# Instalação e Execução

- Node.js **>= 20** instalado (recomenda-se usar [nvm](https://github.com/nvm-sh/nvm))
- npm ou yarn

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd temp

# Instale as dependências
npm install
```

## Execução

```bash
# Modo interativo (abre o Cypress Test Runner)
npx cypress open

# Modo headless (executa no terminal)
npx cypress run
```
---

# Estrutura do Projeto

```
├── cypress/
│   ├── e2e/
│   │   └── loja-ebac.cy.ts        # Spec com todos os cenários E2E
│   └── support/
│       └── e2e.ts                  # Arquivo de suporte (carregado antes dos testes)
├── cypress.config.ts               # Configuração do Cypress (baseUrl, timeouts, viewport)
├── tsconfig.json                   # Configuração do TypeScript
├── package.json                    # Dependências do projeto
└── README.md
```
---

# Cenários de Teste Automatizados

| # | Cenário | Descrição |
|---|---------|-----------|
| 1 | Adição de produtos ao carrinho | Acessa home, navega a um produto, seleciona tamanho/cor, adiciona ao carrinho e verifica na página do carrinho |
| 2 | Atualização de quantidade | Altera quantidade no carrinho e verifica que o valor foi atualizado |
| 3 | Cálculo correto do valor total | Valida subtotal (preço × quantidade) e recalcula após mudança de quantidade |
| 4 | Checkout completo | Preenche dados de billing, cria conta, aceita termos, seleciona pagamento e finaliza a compra |
| 5 | Persistência do pedido | Faz login na conta criada e verifica que o pedido consta na seção de pedidos |

## Observações e Limitações

- Os testes utilizam a aplicação real sem stub de requisições.
- Os testes dependem do servidor externo estar disponível (http://lojaebac.ebaconline.art.br/). Se o servidor cair, todos os testes falharão.
- Cada execução gera um e-mail único (baseado em timestamp) para criação de conta.
- Os seletores utilizam classes e IDs disponíveis na página.
- Foi utilizado um produto fixo com tamanho e cores específicos. Caso o produto seja removido ou ficar sem estoque, os testes falham.
- Os campos de variação (tamanho/cor) usam selects ocultos com `{ force: true }`, para conseguir reconhecer elementos que estão ocultos no DOM (elementos não visíveis).
- Foram utilizados timeouts explícitos para acomodar a latência do servidor.
- Há dependência entre os testes de persistência do pedido e checkout (o primeiro utiliza a conta criada no segundo), o que não é o ideal, mas foi realizado devido a limitações de ambiente, tempo e foco da execução.
- Também devido às limitações do exercício, não há limpeza de estado (caminho, conta criada, etc). Em execuções repetidas no mesmo servidor, poderá ocorrer conflito (exemplo: email já cadastrado).

---

# Análise de Qualidade

## Fluxos priorizados

Os cenários automatizados foram selecionados com base em criticidade de negócio, priorizando etapas diretamente relacionadas à jornada principal de compra do usuário.

Os fluxos escolhidos representam pontos de maior impacto financeiro para a empresa.

## Riscos identificados durante o mapeamento

Principais riscos observados:

* Produto não ser adicionado corretamente ao carrinho
* Quantidade de itens não ser atualizada corretamente
* Divergência nos cálculos de subtotal e valor total
* Falhas durante o preenchimento ou envio do checkout
* Pedido ser pago mas não persistido corretamente no sistema
* Pedido não ser exibido ao cliente após conclusão da compra

## O que foi testado

Foram priorizados testes end-to-end cobrindo o fluxo principal de negócio:

* Navegação inicial
* Seleção de produtos
* Carrinho
* Alteração de quantidade
* Validação financeira
* Checkout
* Persistência do pedido (quando possível)


## Detalhamento do Risco por Cenários Automatizados

### 1. Adição de produtos ao carrinho

#### Objetivo

Validar se o produto selecionado é corretamente adicionado ao carrinho, preservando informações como nome, preço e quantidade inicial.

#### Risco de negócio

Caso o produto não seja corretamente adicionado ao carrinho, o usuário não consegue iniciar o processo de compra, impactando diretamente a conversão da plataforma.

---

### 2. Atualização de quantidade de itens

#### Objetivo

Validar se a alteração da quantidade de produtos no carrinho é refletida corretamente pela aplicação.

#### Risco de negócio

Divergências entre a quantidade selecionada e a quantidade efetivamente comprada podem gerar reclamações, cancelamentos e insatisfação do cliente.

---

### 3. Cálculo correto do valor total da compra

#### Objetivo

Garantir que alterações realizadas no carrinho atualizem corretamente os valores financeiros da compra.

#### Risco de negócio

Cobranças incorretas podem gerar prejuízo financeiro, perda de credibilidade e aumento no volume de atendimento ao cliente.

---

### 4. Checkout e finalização da compra

#### Objetivo

Validar se o usuário consegue concluir o fluxo principal de compra preenchendo os dados obrigatórios do checkout.

#### Risco de negócio

Falhas durante o checkout podem gerar abandono de carrinho e perda direta de receita.

---

### 5. Persistência e consulta de pedidos 

#### Objetivo

Validar se pedidos concluídos ficam devidamente registrados e disponíveis para consulta posterior pelo usuário.

#### Risco de negócio

Pedidos pagos que não aparecem para o cliente geram perda de confiança na plataforma, aumento de chamados de suporte e risco reputacional para o negócio.


## O que não foi testado

Durante o mapeamento dos cenários, outros testes funcionais foram considerados, porém não priorizados dentro do escopo da entrega.

Entre os cenários identificados e não contemplados estão:

* Remoção de produtos do carrinho
* Inclusão de múltiplos produtos em uma mesma compra
* Validação de comportamento para carrinho vazio
* Tentativas de checkout com campos obrigatórios não preenchidos
* Validação de mensagens de erro durante pagamento
* Validação de comportamento para cupons de desconto ou promoções
* Recuperação de sessão após navegação interrompida ou refresh da página
* Fluxos de autenticação isolados (login, logout e recuperação de senha)
* Comportamento da aplicação diante de falhas de integração externas durante a compra

Além dos cenários funcionais, também não fizeram parte deste escopo outras camadas de qualidade, como:

* Testes de performance
* Testes de segurança
* Testes de acessibilidade
* Compatibilidade cross-browser
* Testes exploratórios avançados
* Testes de carga e concorrência

A priorização foi realizada considerando o tempo disponível e o objetivo principal do desafio.

---

# Cenário de Investigação

### Problema reportado

*“Às vezes, o cliente paga, mas o pedido não aparece na tela de Meus Pedidos.”*

### Contexto

Não há acesso ao código-fonte da aplicação.
Existe apenas:
* Ambiente de produção
* Logs básicos
* Apoio dos times de Produto e Backend

---

## Primeira ação de investigação

Minha primeira ação seria verificar se o pedido foi efetivamente criado e persistido no backend após a confirmação do pagamento (com apoio do time de desenvolvedores backend).
Antes de investigar a tela de pedidos realizados, é necessário identificar em qual etapa ocorre a inconsistência do fluxo.

O objetivo inicial seria responder rapidamente às seguintes perguntas:
* O pagamento foi aprovado?
* O pedido foi criado após a aprovação?
* O pedido foi persistido corretamente no banco de dados?
* O pedido existe, mas não está sendo retornado pela consulta da área de pedidos?

Minha hipótese inicial seria uma falha de comunicação entre serviços responsáveis pelo processamento do pagamento e a criação/persistência do pedido.

Possíveis cenários:

#### Cenário A

Pagamento aprovado → Evento enviado → Falha no processamento → Pedido não criado.

#### Cenário B

Pagamento aprovado → Pedido criado corretamente → API responsável pela consulta de pedidos falha → Pedido existe mas não aparece no frontend para o usuário visualizar.

---

Para entender o problema de forma rápida, eu seguiria os seguintes passos:

#### 1. Identificar um caso real reportado com apoio do time de produtos e coletar dados como:
* ID do pedido
* ID da transação de pagamento
* Conta do usuário afetado

#### 2. Consultar logs disponíveis no ambiente e verificar:
* Registro de aprovação do pagamento
* Registro de criação do pedido
* Possíveis erros entre integração dos serviços

#### 3. Comparar comportamentos com apoio novamente do time de produtos: 
Comparar um pedido que aparece corretamente com um pedido afetado pelo problema.

#### 4. Reproduzir o cenário
Se possível, tendo em vista que só tenho acesso ao ambiente produtivo, executar novas compras controladas para tentar identificar padrão de falha.

#### O objetivo principal da investigação seria localizar rapidamente em qual camada ocorre a inconsistência para reduzir a área de investigação o mais cedo possível antes de aprofundar a análise técnica.

---

# Evidências

As evidências de execução encontram-se disponíveis na pasta:

* /cypress/videos/

---

# Considerações Finais

A proposta desta entrega foi priorizar a validação automatizada dos fluxos críticos de negócio da aplicação, buscando equilibrar cobertura funcional, qualidade técnica da automação e análise estratégica de riscos.

A abordagem adotada teve como foco não apenas a implementação dos testes end-to-end solicitados, mas também a demonstração de critérios de priorização, visão de qualidade e capacidade investigativa diante de cenários de falha em produção.
