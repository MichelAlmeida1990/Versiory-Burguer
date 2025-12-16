import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug não fornecido" },
        { status: 400 }
      );
    }

    // Mapeamento de slug para nome do restaurante (fallback)
    const slugToName: Record<string, string> = {
      'tomjerry': 'Tom & Jerry',
      'tom-e-jerry': 'Tom & Jerry',
      'batatamaria': 'Batata Maria',
      'botecomario': 'Botecomario',
    };

    let restaurantSettings: any = null;

    // Tentar buscar pelo slug primeiro (se a coluna existir)
    const { data: settingsBySlug, error: errorBySlug } = await supabase
      .from("restaurant_settings")
      .select("restaurant_id, home_title, home_subtitle, home_description, home_banner_url, primary_color, secondary_color, restaurant_name, logo_url, slug, address, phone_1, phone_2, phone_3, instagram, facebook")
      .eq("slug", slug)
      .maybeSingle();

    // Se não houver erro e encontrou resultado, usar ele
    // Se houver erro 406 (coluna não existe), continuar para fallback
    if (errorBySlug) {
      if (errorBySlug.code === 'PGRST116' || errorBySlug.message?.includes('406')) {
        console.log("Campo slug não encontrado na tabela, usando fallback por nome");
      } else {
        console.error("Erro ao buscar pelo slug:", errorBySlug);
      }
    } else if (settingsBySlug) {
      // Garantir que o slug está presente
      restaurantSettings = {
        ...settingsBySlug,
        slug: settingsBySlug.slug || slug,
      };
    }

    // Se não encontrou pelo slug, buscar pelo nome do restaurante
    if (!restaurantSettings) {
      const restaurantName = slugToName[slug];
      if (restaurantName) {
        const { data: settingsByName, error: errorByName } = await supabase
          .from("restaurant_settings")
          .select("restaurant_id, home_title, home_subtitle, home_description, home_banner_url, primary_color, secondary_color, restaurant_name, logo_url, slug, address, phone_1, phone_2, phone_3, instagram, facebook")
          .ilike("restaurant_name", `%${restaurantName}%`)
          .maybeSingle();
        
        if (!errorByName && settingsByName) {
          // Se encontrou pelo nome mas não tem slug, adicionar o slug usado na busca
          restaurantSettings = {
            ...settingsByName,
            slug: settingsByName.slug || slug,
          };
        }
      }
    }

    if (!restaurantSettings) {
      return NextResponse.json(
        { error: "Restaurante não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurantSettings);
  } catch (error: any) {
    console.error("Erro ao buscar restaurante:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar restaurante" },
      { status: 500 }
    );
  }
}

