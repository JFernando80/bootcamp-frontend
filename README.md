# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

## API Client (Axios)

Este projeto inclui um cliente Axios configurado em `app/api/httpClient.ts` com dois interceptors:

- Request: adiciona o header `Authorization: Bearer <token>` automaticamente usando o `token` do `useAuthStore` (Zustand persistido).
- Response: se a API retornar **401 Unauthorized**, o usuário é deslogado (`logout()`) e redirecionado para `/login`.

### Base URL

Defina a variável de ambiente opcional `VITE_API_BASE_URL` para apontar para sua API. Exemplo em `.env`:

```bash
VITE_API_BASE_URL=https://api.seuservico.com
```

### Uso rápido

```ts
// Importar instância ou helpers
import httpClient, { apiGet, apiPost } from "./app/api/httpClient";
import { useAuthStore } from "./app/stores/authStore";

// GET tipado
type Course = { id: string; title: string };
const courses = await apiGet<Course[]>("/courses");

// Login e armazenar token
type LoginResponse = { token: string };
const data = await apiPost<LoginResponse, { email: string; password: string }>(
  "/auth/login",
  { email: "user@example.com", password: "secret" }
);
useAuthStore.getState().login(data.token);

// Chamada usando a instância direta
const resp = await httpClient.get("/profile");
console.log(resp.data);
```

### Tratamento de 401

Não é necessário tratar manualmente o 401 em cada chamada. Ao receber 401 o cliente:

1. Executa `logout()`.
2. Redireciona para `/login` (somente no browser).

Se quiser comportamento diferente (ex: refresh token) ajuste no interceptor em `httpClient.ts`.
