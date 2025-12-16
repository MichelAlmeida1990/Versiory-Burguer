"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { supabase } from "@/lib/supabase";
import { AuthGuard } from "@/components/admin/auth-guard";
import toast from "react-hot-toast";
import { Save, Upload } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    restaurant_name: "",
    logo_url: "",
    home_banner_url: "",
    home_title: "",
    home_subtitle: "",
    home_description: "",
    primary_color: "#ccff00",
    secondary_color: "#ff0000",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }

      const { data: settings, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .eq("restaurant_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = não encontrado, o que é ok (primeira vez)
        throw error;
      }

      if (settings) {
        setFormData({
          restaurant_name: settings.restaurant_name || "",
          logo_url: settings.logo_url || "",
          home_banner_url: settings.home_banner_url || "",
          home_title: settings.home_title || "",
          home_subtitle: settings.home_subtitle || "",
          home_description: settings.home_description || "",
          primary_color: settings.primary_color || "#ccff00",
          secondary_color: settings.secondary_color || "#ff0000",
        });
      } else {
        // Se não existe, usar nome padrão do email
        const emailName = user.email?.split("@")[0] || "Meu Restaurante";
        setFormData({
          ...formData,
          restaurant_name: emailName.charAt(0).toUpperCase() + emailName.slice(1),
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: "logo" | "banner") => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      const filePath = `restaurant/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      if (type === "logo") {
        setFormData({ ...formData, logo_url: publicUrl });
      } else {
        setFormData({ ...formData, home_banner_url: publicUrl });
      }

      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      if (!formData.restaurant_name.trim()) {
        toast.error("Nome do restaurante é obrigatório");
        setSaving(false);
        return;
      }

      // Tentar atualizar primeiro
      const { data: existing } = await supabase
        .from("restaurant_settings")
        .select("restaurant_id")
        .eq("restaurant_id", user.id)
        .single();

      const settingsData = {
        restaurant_id: user.id,
        restaurant_name: formData.restaurant_name.trim(),
        logo_url: formData.logo_url.trim() || null,
        home_banner_url: formData.home_banner_url.trim() || null,
        home_title: formData.home_title.trim() || null,
        home_subtitle: formData.home_subtitle.trim() || null,
        home_description: formData.home_description.trim() || null,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (existing) {
        // Se existe, atualizar
        const { error: updateError } = await supabase
          .from("restaurant_settings")
          .update(settingsData)
          .eq("restaurant_id", user.id);
        error = updateError;
      } else {
        // Se não existe, inserir
        const { error: insertError } = await supabase
          .from("restaurant_settings")
          .insert(settingsData);
        error = insertError;
      }

      if (error) throw error;

      toast.success("Configurações salvas com sucesso!");
      // Recarregar a página para aplicar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-black text-white">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Carregando...</div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Configurações do Restaurante</h1>
            <button
              onClick={() => router.push("/admin")}
              className="text-gray-400 hover:text-white transition"
            >
              Voltar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4">Informações Básicas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome do Restaurante *
                  </label>
                  <input
                    type="text"
                    value={formData.restaurant_name}
                    onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    placeholder="Ex: Tom & Jerry Pizzaria"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Este nome aparecerá no header do site
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.logo_url && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                        <Image
                          src={formData.logo_url}
                          alt="Logo atual"
                          fill
                          className="object-contain"
                          unoptimized={formData.logo_url.startsWith('http')}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow mb-2"
                        placeholder="URL da imagem do logo"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "logo");
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? "Enviando..." : "Enviar Logo"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cores */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4">Cores</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cor Primária
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                      placeholder="#ccff00"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Cor dos botões e elementos principais
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cor Secundária
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                      placeholder="#ff0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Home Page */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4">Personalização da Home Page</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Banner da Home (URL da imagem)
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    {formData.home_banner_url && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                        <Image
                          src={formData.home_banner_url}
                          alt="Banner atual"
                          fill
                          className="object-cover"
                          unoptimized={formData.home_banner_url.startsWith('http')}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.home_banner_url}
                        onChange={(e) => setFormData({ ...formData, home_banner_url: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                        placeholder="URL da imagem do banner"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "banner");
                        }}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition text-sm mt-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? "Enviando..." : "Enviar Banner"}
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título da Home
                  </label>
                  <input
                    type="text"
                    value={formData.home_title}
                    onChange={(e) => setFormData({ ...formData, home_title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    placeholder="Ex: Bem-vindo à Tom & Jerry!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subtítulo da Home
                  </label>
                  <input
                    type="text"
                    value={formData.home_subtitle}
                    onChange={(e) => setFormData({ ...formData, home_subtitle: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    placeholder="Ex: As melhores pizzas da cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição da Home
                  </label>
                  <textarea
                    value={formData.home_description}
                    onChange={(e) => setFormData({ ...formData, home_description: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    placeholder="Ex: Descubra nossos sabores incríveis..."
                  />
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-yellow text-black px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "Salvando..." : "Salvar Configurações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}

