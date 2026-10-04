// Normalização de nomes para reconhecer a mesma pessoa entre aparelhos.
// "José  da Silva" e "jose da silva" viram "jose da silva".
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Chave de reconhecimento: nome completo + localidade. Cargo fica de fora de
// propósito — é o campo digitado de mais formas diferentes ("Gerente de PA",
// "Gerente P.A.") e mudaria a chave sem mudar a pessoa.
export function chaveIdentidade(nome: string, localidade: string): string {
  return `${normalizar(nome)}|${normalizar(localidade)}`;
}

const PARTICULAS = new Set(["de", "da", "do", "das", "dos", "e"]);

// Chave frouxa para apontar POSSÍVEIS duplicatas na base: primeiro + último nome.
// "Maria Silva" e "Maria da Silva Souza Silva" batem; serve para sinalizar, nunca
// para juntar automaticamente (duas Marias Silva diferentes também batem).
export function chaveSemelhanca(nome: string): string {
  const partes = normalizar(nome).split(" ").filter((p) => p && !PARTICULAS.has(p));
  if (partes.length === 0) return "";
  return partes.length === 1 ? partes[0] : `${partes[0]} ${partes[partes.length - 1]}`;
}
