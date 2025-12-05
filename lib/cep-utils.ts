/**
 * Busca informações de endereço pelo CEP usando a API ViaCEP
 */
export async function fetchAddressByCep(cep: string): Promise<{
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  error?: string;
}> {
  const cleanedCep = cep.replace(/\D/g, "");
  
  if (cleanedCep.length !== 8) {
    return { error: "CEP deve ter 8 dígitos" };
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return { error: "CEP não encontrado" };
    }

    return {
      address: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return { error: "Erro ao buscar CEP. Tente novamente." };
  }
}

/**
 * Formata CEP para exibição (00000-000)
 */
export function formatCep(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length <= 5) {
    return cleaned;
  }
  return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 8)}`;
}

