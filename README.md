# Mapa Estratégico | Cooplivre

Webapp do evento de revisão do Mapa Estratégico 2027–2030 (Next.js, App Router).

## Fluxo

1. **`/`** — identificação (nome, cargo, localidade), sem login. O servidor reconhece a pessoa por **nome +
   localidade** (ignorando maiúsculas, acentos e espaços): quem volta em outro aparelho, ou depois de "Sair",
   retoma a mesma revisão — em andamento, ou enviada (só leitura). Cargo não entra na chave.
2. **`/mapa`** — mapa estratégico com os 5 pilares clicáveis e o progresso de revisão da pessoa.
3. **`/pilar/[slug]`** — objetivos do pilar com indicador → meta e iniciativas. O colaborador avalia **todos** os
   objetivos (*Concordo / Concordo com ajustes / Discordo*; nos dois últimos precisa escrever ao menos uma sugestão)
   e clica em **Salvar pilar**, que grava no servidor e volta ao mapa. O que foi digitado e não salvo fica como
   rascunho no navegador. "Falta algo neste pilar?" é opcional.
   Depois de salvos os 5 pilares (e sem alterações pendentes), aparece no mapa o botão **Enviar revisão**. O
   servidor confere que tudo foi avaliado, registra a data de envio e passa a recusar alterações (só leitura).
   **Realizar ajustes** reabre a revisão enviada; depois de ajustar e salvar, a pessoa toca em **Reenviar revisão**.
   Cada envio fica registrado (nº de envios, primeiro/último envio, data da reabertura).
4. **`/admin`** — painel com contagens por objetivo e sugestões escritas, e botão **Baixar base (Excel)**. Protegido por `ADMIN_KEY`.

## Base exportada (.xlsx)

| Aba | Conteúdo |
| --- | --- |
| Resumo (enviadas) | Concordo / com ajustes / discordo, % de concordância e nº de sugestões por objetivo — quem enviou ao menos uma vez, **uma revisão por pessoa** (ver duplicatas abaixo) |
| Contribuições | Versão atual de cada pessoa em cada objetivo, com status (Enviada / Em andamento), ao lado do indicador/meta/iniciativas propostos; nº de edições, primeiro envio e última alteração |
| Histórico de alterações | Uma linha por campo alterado: quando, quem (cargo/localidade da época), objetivo, valor antes → depois |
| Participantes | Quem se identificou, status, pilares salvos, data de envio e última atividade |

Horários em Brasília.

**Duplicatas.** O reconhecimento por nome + localidade não pega variações ("Maria Silva" × "Maria da Silva") nem
troca de localidade. A base sinaliza na coluna *Possível duplicata* todo nome com mesmo primeiro + último nome. Só
sai do Resumo quem bate também a localidade (fica o envio mais recente); nomes iguais em localidades diferentes
são apenas sinalizados — confira manualmente. Cada envio que muda algo vira uma linha no histórico (`pe:historico`); reenvios idênticos não geram linha.

## Conteúdo

Todo o conteúdo está em `lib/data.ts` (transcrito da planilha *Cooplivre PE - Revisão*, aba Revisado), incluindo o **intuito** de cada pilar, exibido abaixo do nome na página do pilar. Regras de
transcrição no topo do arquivo. Status/Observação da planilha **não** são exibidos. Objetivos com
`visivel: false` (hoje S3.6, R2.2 e R2.3 — linhas cinza "excluída/realocada") ficam fora do evento. Nunca reaproveite um `id`.

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
5. Depois de testar, apague os dados de teste no console do Upstash (Data Browser → chaves `pe:*`).

Capacidade: cada envio usa ~4 comandos Redis. Um evento com 300 pessoas × 25 envios ≈ 30 mil comandos —
confira se cabe no limite do plano gratuito da Upstash vigente. Testado localmente com 960 envios simultâneos
(120 pessoas × 8 objetivos) sem perda de respostas nem de histórico.
