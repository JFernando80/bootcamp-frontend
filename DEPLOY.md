# Deploy na Vercel

## Passo a Passo

### 1. Preparar o Projeto

Certifique-se de que o projeto está commitado no Git:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push
```

### 2. Deploy via Vercel Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab/Bitbucket
3. Clique em "Add New Project"
4. Selecione o repositório `bootcamp`
5. Configure o projeto:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `build/client`
   - **Install Command**: `npm install`
6. Configure as variáveis de ambiente (se necessário):
   - `NODE_ENV` = `production`
7. Clique em "Deploy"

### 3. Deploy via CLI (Alternativo)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login na Vercel
vercel login

# Deploy de produção
vercel --prod
```

## Configurações Importantes

### Build Settings (já configurado via vercel.json)

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "build/client",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

A configuração `rewrites` garante que todas as rotas do React Router funcionem corretamente (SPA routing).

### Variáveis de Ambiente (Opcional)

Configure na Vercel Dashboard > Project Settings > Environment Variables se precisar de configurações adicionais.

## Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ Página inicial carrega (/)
2. ✅ Página sobre carrega (/about)
3. ✅ Login funciona (/login)
4. ✅ Registro funciona (/register)
5. ✅ CRUD de cursos funciona para admins (/manageCourses)
6. ✅ Autenticação persiste após refresh
7. ✅ Navegação client-side funciona sem recarregar a página

## Problemas Comuns

### ❌ Erro 404 em rotas

**Solução**: Verifique se o `vercel.json` tem a configuração de rewrites para redirecionar todas as rotas para o index.html

### ❌ API não responde (CORS)

**Problema**: O backend pode bloquear requisições do domínio da Vercel

**Solução**: Configure CORS no backend Koyeb para aceitar requisições de:

- `https://seu-projeto.vercel.app`
- `https://*.vercel.app` (wildcards)

## Comandos Úteis

```bash
# Ver logs do deploy
vercel logs

# Ver informações do projeto
vercel inspect

# Remover projeto da Vercel (cuidado!)
vercel remove

# Criar deploy preview (para testar)
vercel

# Promover preview para produção
vercel promote
```

## Configuração do Backend

O backend está hospedado no Koyeb e já está configurado no código:

```
https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp
```

### CORS

Se houver erro de CORS após o deploy, peça ao responsável pelo backend para adicionar o domínio da Vercel na lista de origens permitidas.

## URLs do Projeto

Após o deploy, você terá:

- **Produção**: `https://seu-projeto.vercel.app`
- **Preview**: `https://seu-projeto-git-branch.vercel.app` (para cada branch)

## Dicas

1. ✅ Sempre teste localmente antes de fazer deploy
2. ✅ Use `vercel` (sem --prod) para criar previews e testar
3. ✅ Configure domínio customizado em Project Settings > Domains
4. ✅ Ative Analytics em Project Settings para monitorar
5. ✅ Configure notificações de deploy no GitHub

## Links Úteis

- 📦 [Vercel Dashboard](https://vercel.com/dashboard)
- 📚 [Documentação Vercel](https://vercel.com/docs)
- 🔧 [React Router v7 Docs](https://reactrouter.com/dev)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Links

- 📦 [Vercel Dashboard](https://vercel.com/dashboard)
- 📚 [Documentação Vercel](https://vercel.com/docs)
- 🔧 [React Router v7 Docs](https://reactrouter.com/dev)
