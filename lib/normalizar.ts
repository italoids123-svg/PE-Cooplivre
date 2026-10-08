// Normalização de nomes para reconhecer a mesma pessoa com grafias diferentes.
// "José  da Silva" e "jose da silva" viram "jose da silva".
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
