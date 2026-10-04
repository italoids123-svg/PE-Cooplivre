# Mapa Estratégico | Cooplivre

Webapp do evento de revisão do Mapa Estratégico 2027–2030 (Next.js, App Router).

## Fluxo

1. **`/`** — identificação (nome, cargo, localidade). Fica salva no navegador; sem login.
2. **`/mapa`** — mapa estratégico com os 5 pilares clicáveis e o progresso de revisão da pessoa.
3. **`/pilar/[slug]`** — objetivos do pilar com indicador → meta e iniciativas. Para cada objetivo o colaborador
   marca *Concordo / Concordo com ajustes / Discordo*; nos dois últimos precisa escrever ao menos uma sugestão.
   Cada objetivo é enviado separadamente e pode ser editado depois. O que foi digitado e não enviado fica como
   rascunho no navegador. No fim de cada pilar há "Falta algo neste pilar?".
4. **`/admin`** — painel com contagens por objetivo, sugestões escritas e download CSV (Excel pt-BR). Protegido por `ADMIN_KEY`.

## Conteúdo

Todo o conteúdo está em `lib/data.ts` (transcrito da planilha *Consolidado*, pós-workshop 19/08). Regras de
transcrição no topo do arquivo. Status/Observação da planilha **não** são exibidos. Objetivos com
`visivel: false` (hoje `rp-2` e `rp-3`, marcados "EXCLUIR") ficam fora do evento. Nunca reaproveite um `id`.

## Rodando localmente

```bash
npm install
echo "ADMIN_KEY=uma-chave" > .env.local
npm run dev
```

Sem Redis configurado, as respostas vão para `.data/respostas.json`.

## Deploy na Vercel

1. Importe o repositório em vercel.com/new.
2. **Storage → Marketplace → Upstash for Redis** e conecte ao projeto (injeta `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
   Sem isso a API recusa gravar (o disco da Vercel é efêmero e perderia respostas).
3. Em *Environment Variables* defina `ADMIN_KEY`.
4. Deploy. Antes do evento, teste o fluxo completo pelo celular e confira as respostas em `/admin`.
