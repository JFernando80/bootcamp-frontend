# Configuração do Firebase (Storage e Firestore)

O upload de vídeos usa Firebase Storage. URLs longas são armazenadas no Firestore para respeitar o limite de 150 caracteres do backend.

## 1. Criar projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. No menu lateral, vá em **Build** → **Storage**
4. Clique em **Começar** e siga o assistente
5. No menu lateral, vá em **Build** → **Firestore Database**
6. Clique em **Criar banco de dados** (modo produção ou teste)
7. Escolha as regras de segurança (em produção, restrinja por autenticação)

## 2. Obter as credenciais

1. No Firebase Console, clique no ícone de engrenagem → **Configurações do projeto**
2. Na aba **Geral**, role até **Seus apps**
3. Clique em **</>** (Web) para adicionar um app
4. Registre o app e copie o objeto `firebaseConfig`

## 3. Configurar variáveis de ambiente

Crie ou edite o arquivo `.env` na raiz do projeto com:

```
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 4. Regras de Storage

O app usa autenticação própria (não Firebase Auth). Edite as regras em **Storage** → **Regras**:

**Desenvolvimento** (permite qualquer upload):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**Produção** (recomenda-se integrar Firebase Auth ou usar Cloud Functions para validar tokens):
Por enquanto, use as mesmas regras. Em produção com muitos usuários, considere adicionar validação.

## 5. Uso no app

- Se o Firebase **não** estiver configurado: apenas a opção "URL do vídeo" aparece
- Se estiver configurado: o usuário pode escolher entre "URL do vídeo" ou "Fazer upload"
- Vídeos são salvos em `videos/{userId}/{moduleId}/{timestamp}.{ext}`
- Formatos aceitos: MP4, WebM, OGG (máx. 500MB)
- URLs longas do Storage são armazenadas na coleção `videoRefs` do Firestore (limite de 150 chars do backend)
