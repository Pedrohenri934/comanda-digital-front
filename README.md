# Comanda Digital — Front-end

Front-end Angular do sistema **Comanda Digital** (Dark Kitchen "Boi Na Brasa") — Trabalho Final de Desenvolvimento Full-Stack (UNASP-SP, Prof. Thiago Silva).

## Links de produção

| O quê | Endereço |
|---|---|
| Aplicação | https://comanda-digital-front-phi.vercel.app |
| API | https://comanda-digital-api-production-3501f934.up.railway.app |
| Swagger | https://comanda-digital-api-production-3501f934.up.railway.app/swagger-ui.html |
| Repositório do back | https://github.com/Pedrohenri934/comanda-digital-api |

## Usuários de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@email.com | senha123 |
| Gerente | gerente@email.com | senha123 |
| Cozinha | cozinha@email.com | senha123 |
| Cliente | criar conta pela tela de cadastro | — |

## Funcionalidades

- **Cliente:** cardápio público, carrinho, finalização de pedido, lista de pedidos e acompanhamento em tempo quase real.
- **Cozinha:** quadro de pedidos com atualização automática e mudança de status.
- **Administrador/Gerente:** gestão de pedidos (com cancelamento e motivo), categorias, pratos com ficha técnica, ingredientes e estoque, fornecedores, compras e dashboard com gráficos.
- Autenticação JWT, guards por perfil e interceptor HTTP.

## Tecnologias

Angular 19 (standalone, signals, rotas lazy), Tailwind CSS, Chart.js, deploy na Vercel.

## Como rodar localmente

Pré-requisitos: Node 18+ e o back-end rodando em `http://localhost:8080`.

```powershell
npm install
npx ng serve
```

Acesse http://localhost:4200. O endereço da API fica em `src/environments/environment.ts` (local) e `src/environments/environment.prod.ts` (produção).

## Build de produção

```powershell
npm run build
```

Saída em `dist/boi-na-brasa-angular/browser`. O `vercel.json` já configura o build e o redirecionamento das rotas para o `index.html`.

## Observação

Algumas telas administrativas antigas (Cardápio da Semana, Entregadores, Relatórios, Matriz BCG) ainda usam dados de demonstração e estão fora do escopo do SRS.

## Autor

Pedro Henrique — ADS, UNASP-SP.
