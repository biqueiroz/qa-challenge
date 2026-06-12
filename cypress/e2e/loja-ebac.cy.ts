// Testes E2E para Loja EBAC: operações de carrinho, checkout e persistência de pedido

describe('Loja EBAC - Fluxo de Compra E2E', () => {
  // Auxiliar: gera dados de usuário únicos por execução de teste
  const timestamp: number = Date.now()
  const userEmail: string = `testuser_${timestamp}@test.com`
  const userPassword: string = 'Test@12345!'

  // Produto usado nos testes
  const productUrl: string = '/product/ingrid-running-jacket/'
  const productName: string = 'Ingrid Running Jacket'

  /**
   * Função auxiliar para adicionar um produto ao carrinho a partir da página do produto.
   * Seleciona tamanho e cor por botões de rádio, define a quantidade e clica em adicionar ao carrinho.
   */
  function addProductToCart(
    url: string,
    size: string = 'M',
    color: string = 'Orange',
    quantity: number = 1
  ): void {
    cy.visit(url)

    // Seleciona tamanho pelo elemento select oculto e dispara evento change
    cy.get('#size').select(size, { force: true })

    // Seleciona cor pelo elemento select oculto e dispara evento change
    cy.get('#color').select(color, { force: true })

    // Define a quantidade usando o input do tipo spinbutton
    cy.get('.quantity input[type="number"]').clear().type(quantity.toString())

    // Clica em "Comprar" (Adicionar ao Carrinho)
    cy.get('.single_add_to_cart_button').click()

    // Aguarda o produto ser adicionado — mensagem de sucesso ou atualização do carrinho
    cy.get('.woocommerce-message', { timeout: 15000 }).should('be.visible')
  }

  describe('Adição de produtos ao carrinho', () => {
    it('adiciona produto ao carrinho e verifica na página do carrinho', () => {
      // Visita página inicial
      cy.visit('/')
      cy.get('.products', { timeout: 15000 }).should('be.visible')

      // Navega para um produto específico
      addProductToCart(productUrl, 'M', 'Orange', 1)

      // Navega para a página do carrinho
      cy.visit('/carrinho/')

      // Verifica que o produto está no carrinho
      cy.get('.shop_table.cart', { timeout: 15000 }).should('be.visible')
      cy.get('.cart_item').should('have.length.at.least', 1)
      cy.get('.cart_item .product-name').should('contain', productName)
    })
  })

  describe('Atualização de quantidade no carrinho', () => {
    beforeEach(() => {
      // Adiciona produto ao carrinho antes de testar alterações de quantidade
      addProductToCart(productUrl, 'M', 'Orange', 1)
      cy.visit('/carrinho/')
      cy.get('.shop_table.cart', { timeout: 15000 }).should('be.visible')
    })

    it('altera quantidade do produto e verifica atualização', () => {
      const newQuantity: number = 3

      // Atualiza a quantidade
      cy.get('.cart_item .qty').clear().type(newQuantity.toString())

      // Clica no botão atualizar carrinho
      cy.get('[name="update_cart"]').click()

      // Aguarda atualização do carrinho
      cy.get('.woocommerce-message', { timeout: 15000 }).should('contain', 'atualizado')

      // Verifica se a nova quantidade foi refletida
      cy.get('.cart_item .qty').should('have.value', newQuantity.toString())
    })
  })

  describe('Cálculo correto do valor total', () => {
    beforeEach(() => {
      // Adiciona produto com quantidade 2
      addProductToCart(productUrl, 'M', 'Orange', 2)
      cy.visit('/carrinho/')
      cy.get('.shop_table.cart', { timeout: 15000 }).should('be.visible')
    })

    it('verifica subtotal e total com quantidade inicial', () => {
      // Obtém o preço unitário e verifica se o subtotal corresponde a quantidade * preço unitário
      cy.get('.cart_item .product-price .amount').invoke('text').then((priceText: string) => {
        // Converte preço de texto como "R$84,00"
        const unitPrice: number = parseFloat(
          priceText.replace('R$', '').replace('.', '').replace(',', '.')
        )

        cy.get('.cart_item .product-quantity .qty').invoke('val').then((qty) => {
          const expectedSubtotal: number = unitPrice * parseInt(qty as string)

          cy.get('.cart_item .product-subtotal .amount').invoke('text').then((subtotalText: string) => {
            const subtotal: number = parseFloat(
              subtotalText.replace('R$', '').replace('.', '').replace(',', '.')
            )
            expect(subtotal).to.eq(expectedSubtotal)
          })
        })
      })

      // Verifica se a seção de totais do carrinho está visível e contém um total
      cy.get('.cart_totals').should('be.visible')
      cy.get('.order-total .amount').should('be.visible')
    })

    it('altera quantidade e verifica recalculo dos valores', () => {
      const newQuantity: number = 4

      // Obtém preço unitário inicial
      cy.get('.cart_item .product-price .amount').invoke('text').then((priceText: string) => {
        const unitPrice: number = parseFloat(
          priceText.replace('R$', '').replace('.', '').replace(',', '.')
        )

        // Atualiza a quantidade
        cy.get('.cart_item .qty').clear().type(newQuantity.toString())
        cy.get('[name="update_cart"]').click()

        // Aguarda atualização do carrinho
        cy.get('.woocommerce-message', { timeout: 15000 }).should('be.visible')

        // Verifica se o subtotal foi recalculado
        const expectedSubtotal: number = unitPrice * newQuantity
        cy.get('.cart_item .product-subtotal .amount').invoke('text').then((subtotalText: string) => {
          const subtotal: number = parseFloat(
            subtotalText.replace('R$', '').replace('.', '').replace(',', '.')
          )
          expect(subtotal).to.eq(expectedSubtotal)
        })
      })
    })
  })

  describe('Checkout completo', () => {
    it('finaliza compra com criação de conta e pagamento', () => {
      // Adiciona um produto ao carrinho
      addProductToCart(productUrl, 'S', 'Red', 1)

      // Vai para o checkout
      cy.visit('/checkout/')
      cy.get('#billing_first_name', { timeout: 15000 }).should('be.visible')

      // Preenche os dados de cobrança
      cy.get('#billing_first_name').clear().type('Teste')
      cy.get('#billing_last_name').clear().type('Automacao')
      cy.get('#billing_company').clear().type('EBAC Testes')

      // Seleciona país (dropdown Select2) — define valor e dispara change via jQuery
      cy.get('#billing_country').select('BR', { force: true })
      cy.get('#billing_country').then(($select) => {
        $select.trigger('change')
      })

      cy.get('#billing_address_1').clear().type('Rua dos Testes, 123')
      cy.get('#billing_city').clear().type('São Paulo')

      // Seleciona estado (dropdown Select2) — aguarda carregamento após mudança de país
      cy.get('#billing_state', { timeout: 10000 }).should('not.be.disabled')
      cy.get('#billing_state').select('SP', { force: true })
      cy.get('#billing_state').then(($select) => {
        $select.trigger('change')
      })

      cy.get('#billing_postcode').clear().type('01001-000')
      cy.get('#billing_phone').clear().type('11999999999')
      cy.get('#billing_email').clear().type(userEmail)

      // Cria conta durante o checkout
      cy.get('#createaccount').check()
      cy.get('#account_password', { timeout: 5000 }).should('be.visible')
      cy.get('#account_password').clear().type(userPassword)

      // Seleciona método de pagamento (verifica opções disponíveis)
      cy.get('#payment').should('be.visible')
      // Usa o primeiro método de pagamento disponível (normalmente transferência bancária ou pagamento na entrega em lojas de teste)
      cy.get('#payment .payment_methods li:first-child input[type="radio"]').check({ force: true })

      // Aceita termos e condições
      cy.get('#terms').check({ force: true })

      // Finaliza o pedido
      cy.get('#place_order').click()

      // Verifica se o pedido foi feito com sucesso
      cy.get('.woocommerce-order-received', { timeout: 30000 }).should('be.visible')
      cy.get('.woocommerce-thankyou-order-received, .woocommerce-order-overview', { timeout: 15000 })
        .should('be.visible')
    })
  })

  describe('Persistência do pedido', () => {
    it('verifica que o pedido aparece na conta do usuário', () => {
      // Login com a conta criada durante o checkout
      cy.visit('/minha-conta/')

      cy.get('#username').clear().type(userEmail)
      cy.get('#password').clear().type(userPassword)
      cy.get('[name="login"]').click()

      // Navega para a seção de pedidos
      cy.get('.woocommerce-MyAccount-navigation', { timeout: 15000 }).should('be.visible')
      cy.visit('/minha-conta/orders/')

      // Verifica se existe ao menos um pedido
      cy.get('.woocommerce-orders-table', { timeout: 15000 }).should('be.visible')
      cy.get('.woocommerce-orders-table__row').should('have.length.at.least', 1)

      // Verifica se o pedido contém o produto que compramos
      cy.get('.woocommerce-orders-table__row:first-child .woocommerce-orders-table__cell-order-number a')
        .click()

      // Na página de detalhes do pedido, verifica as informações do produto
      cy.get('.order_details', { timeout: 15000 }).should('be.visible')
      cy.get('.order_details').should('contain', productName)
    })
  })
})
