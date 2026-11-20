# Comanda Digital — Front-end (Angular)

Front-end do Trabalho Final de Desenvolvimento Full-Stack (UNASP-SP, Prof. Thiago Silva) — sistema **Boi Na Brasa**.

- **Site no ar:** https://boi-na-brasa-phi.vercel.app
- **API (Swagger):** https://comanda-digital-api-production-3501f934.up.railway.app/swagger-ui.html
- **Repositório do back-end:** comanda-digital-api

## Tecnologias

Angular 19 (standalone, signals, rotas lazy) · Tailwind CSS · Chart.js · HttpClient com interceptor JWT · Vercel.

## Como rodar (local)

```powershell
npm install
npx ng serve
```

Abra http://localhost:4200. A URL da API fica em `src/environments/environment.ts` (local) e `environment.prod.ts` (produção).

## Usuários de teste

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | admin@email.com | senha123 |
| GERENTE | gerente@email.com | senha123 |
| COZINHEIRO | cozinha@email.com | senha123 |
| ENTREGADOR | carlos@entrega.com | 123456 |
| CLIENTE | crie pelo cadastro do site | — |

## Telas

**Cliente:** cardápio com fotos e combos com escolhas, carrinho, checkout, meus pedidos e acompanhamento do pedido.

**Cozinha:** quadro de pedidos com avanço de status e cancelamento com motivo.

**Entregador:** pedidos prontos, aceite e entrega.

**Administração:** dashboard, pedidos (filtros por status, data e canal), cardápio e ficha técnica (food cost colorido), cardápio da semana, estoque (saldo, entrada, baixa por perda e movimentações, com alerta vermelho no menu), fornecedores com catálogo, compras com cotação comparativa, vendas e matriz BCG, e usuários internos (somente ADMIN).

## Deploy

Publicado na Vercel a partir da branch principal. Ao mudar o domínio do site, atualize `CORS_ALLOWED_ORIGINS` no Railway (back-end).
