import { supabase } from "./supabase";

// Verificar se estamos em ambiente de build
const isBuildTime = typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';

export interface DeliveryZone {
  id: string;
  name: string;
  description: string | null;
  base_fee: number;
  free_delivery_threshold: number | null;
  min_distance: number;
  max_distance: number | null;
  cep_prefixes: string[];
  active: boolean;
  display_order: number;
}

export interface DeliverySettings {
  id: string;
  default_fee: number;
  free_delivery_min_amount: number;
  distance_calculation_enabled: boolean;
  manual_fee_allowed: boolean;
  currency: string;
}

/**
 * Extrai o prefixo do CEP (primeiros 5 dígitos)
 */
export function getCepPrefix(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.substring(0, 5);
}

/**
 * Busca a zona de entrega baseada no CEP
 */
export async function findDeliveryZoneByCep(cep: string): Promise<DeliveryZone | null> {
  if (isBuildTime || !supabase) {
    return null;
  }

  try {
    const cepPrefix = getCepPrefix(cep);
    
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .eq("active", true)
      .order("display_order");

    if (error) {
      console.error("Erro ao buscar zonas de entrega:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Procurar zona que corresponda ao prefixo do CEP
    const matchingZone = data.find((zone: any) => {
      if (!zone.cep_prefixes || zone.cep_prefixes.length === 0) {
        return false;
      }
      return zone.cep_prefixes.some((prefix: string) => 
        cepPrefix.startsWith(prefix.replace(/\D/g, ""))
      );
    });

    return matchingZone || null;
  } catch (error) {
    console.error("Erro ao buscar zona de entrega:", error);
    return null;
  }
}

/**
 * Busca configurações gerais de entrega
 */
export async function getDeliverySettings(): Promise<DeliverySettings | null> {
  if (isBuildTime || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("delivery_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Erro ao buscar configurações de entrega:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Erro ao buscar configurações de entrega:", error);
    return null;
  }
}

/**
 * Calcula o valor do frete baseado em:
 * - CEP do endereço
 * - Valor do pedido (para frete grátis)
 * - Configurações de zona
 */
export async function calculateDeliveryFee(
  cep: string,
  orderAmount: number,
  manualFee?: number | null
): Promise<{
  fee: number;
  isFree: boolean;
  zone: DeliveryZone | null;
  method: "zone" | "default" | "manual";
  message?: string;
}> {
  if (isBuildTime) {
    return {
      fee: 5.0,
      isFree: false,
      zone: null,
      method: "default",
      message: "Frete padrão",
    };
  }

  // Se houver frete manual definido, usar ele
  if (manualFee !== null && manualFee !== undefined && manualFee >= 0) {
    return {
      fee: manualFee,
      isFree: manualFee === 0,
      zone: null,
      method: "manual",
      message: manualFee === 0 ? "Frete grátis (manual)" : `Frete manual: ${manualFee.toFixed(2)}`,
    };
  }

  // Buscar configurações
  const settings = await getDeliverySettings();
  if (!settings) {
    // Retornar valor padrão se não houver configurações
    return {
      fee: 5.0,
      isFree: false,
      zone: null,
      method: "default",
      message: "Frete padrão",
    };
  }

  // Verificar frete grátis por valor mínimo
  if (settings.free_delivery_min_amount && orderAmount >= settings.free_delivery_min_amount) {
    return {
      fee: 0,
      isFree: true,
      zone: null,
      method: "default",
      message: `Frete grátis para pedidos acima de ${settings.free_delivery_min_amount.toFixed(2)}`,
    };
  }

  // Buscar zona por CEP
  const zone = await findDeliveryZoneByCep(cep);
  
  if (zone) {
    // Verificar frete grátis da zona
    if (zone.free_delivery_threshold && orderAmount >= zone.free_delivery_threshold) {
      return {
        fee: 0,
        isFree: true,
        zone: zone,
        method: "zone",
        message: `Frete grátis para pedidos acima de ${zone.free_delivery_threshold.toFixed(2)} na zona ${zone.name}`,
      };
    }

    return {
      fee: zone.base_fee,
      isFree: false,
      zone: zone,
      method: "zone",
      message: `Frete da zona ${zone.name}`,
    };
  }

  // Usar valor padrão
  return {
    fee: settings.default_fee,
    isFree: false,
    zone: null,
    method: "default",
    message: "Frete padrão",
  };
}

/**
 * Calcula distância entre duas coordenadas (Haversine)
 * Útil para cálculo futuro baseado em distância real
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

