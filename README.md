# JPCF — Blog de artigos

Site estático simples para publicar artigos, sem banco de dados e sem painel administrativo.
Cada artigo é um arquivo Markdown; o site é gerado automaticamente sempre que você envia
(`commit`) um arquivo novo ou editado para o GitHub.

## Como publicar/editar um artigo (do jeito mais simples, direto do navegador — funciona no iPad)

1. No GitHub, entre no repositório e abra a pasta `content/articles/`.
2. Para criar um artigo novo: clique em **Add file → Create new file**, dê um nome tipo
   `meu-artigo.md` e cole o modelo abaixo. Para editar um existente: clique no arquivo e
   depois no ícone de lápis (editar).
3. Preencha o cabeçalho entre as linhas `---` e escreva o texto em Markdown depois dele.
4. Role até o fim da página e clique em **Commit changes**.
5. Pronto. Em cerca de 1 minuto o GitHub Actions gera o site atualizado automaticamente
   (você pode acompanhar na aba **Actions** do repositório).

### Modelo de artigo

```markdown
---
title: Título do artigo
slug: titulo-do-artigo
date: 2026-08-22
category: Geral
excerpt: Um resumo curto de uma ou duas linhas que aparece na lista de artigos.
---

Texto do artigo aqui, em Markdown normal.

## Um subtítulo

Parágrafo com **negrito**, _itálico_ e [um link](https://exemplo.com).
```

Campos do cabeçalho:

- `title` — título do artigo.
- `slug` — parte da URL (`#/artigo/slug`); use só letras minúsculas, números e hífen. Se
  omitir, é gerado a partir do título.
- `date` — formato `AAAA-MM-DD`. Define a ordem (mais recentes primeiro).
- `category` — usada no filtro por categoria na barra lateral.
- `excerpt` — texto curto mostrado na lista de artigos.

Para apagar um artigo: apague o arquivo `.md` correspondente (ou mova para uma pasta como
`content/articles/_rascunhos/`, que não é lida pelo site).

## Estrutura do projeto

```
index.html            página única (SPA), roteamento por # (#/, #/sobre, #/artigo/slug)
css/style.css          estilo do site
js/app.js               lógica: busca, categorias, listagem e leitura de artigo
content/config.json     nome do blog, autor, bio, texto do rodapé
content/articles/*.md   os artigos (fonte de verdade)
scripts/build.js        lê os .md e gera data/articles.json
data/articles.json      gerado automaticamente — não editar à mão
.github/workflows/      GitHub Actions: roda o build a cada push na branch main
```

## Editar textos fixos do site

- **Nome do blog, autor, bio, rodapé:** edite `content/config.json`.
- **Cores/visual:** edite `css/style.css` (variáveis no topo do arquivo, em `:root`).

## Rodando localmente (opcional, no Mac mini)

Só é necessário se você quiser testar antes de publicar, ou editar vários artigos de uma vez
por fora do navegador.

```bash
npm install
npm run build      # gera data/articles.json a partir dos .md
npx serve .        # ou: python3 -m http.server 8000
```

Depois abra `http://localhost:3000` (ou a porta que aparecer).

## Publicando no GitHub Pages

1. Crie um repositório no GitHub (pode ser público ou privado) e envie todos estes arquivos.
2. Em **Settings → Pages**, em "Build and deployment", escolha **Deploy from a branch**,
   branch `main`, pasta `/ (root)`.
3. O GitHub Actions (arquivo `.github/workflows/build-deploy.yml`) já está configurado para
   gerar `data/articles.json` automaticamente a cada `push` na branch `main` — você só edita
   os arquivos `.md`, nunca precisa gerar isso manualmente.
4. Acesse a URL que o GitHub Pages fornecer (algo como
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`).

## Usando seu domínio próprio

Você mencionou que já tem um domínio com e-mail configurado no Google Workspace — isso não
tem conflito nenhum com hospedar o site, porque são registros DNS diferentes:

- **E-mail (Google Workspace):** registros `MX` — continuam exatamente como estão.
- **Site (GitHub Pages):** registros `A`/`CNAME` — são adicionados à parte, sem mexer no e-mail.

Passos:

1. No painel DNS do seu domínio (onde você o registrou/gerencia), adicione:
   - Se for usar um subdomínio, por exemplo `blog.seudominio.com.br`: um registro **CNAME**
     apontando para `SEU-USUARIO.github.io`.
   - Se for usar o domínio raiz (`seudominio.com.br`): quatro registros **A** apontando para
     os IPs do GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153,
     185.199.111.153).
2. No repositório, crie um arquivo chamado `CNAME` (sem extensão) na raiz, contendo apenas o
   domínio escolhido, por exemplo:
   ```
   blog.seudominio.com.br
   ```
3. Em **Settings → Pages**, no campo "Custom domain", coloque o mesmo domínio e aguarde a
   verificação (pode levar alguns minutos a algumas horas). Marque "Enforce HTTPS" quando
   disponível.

Nenhum desses passos afeta os e-mails já configurados no Google Workspace.
