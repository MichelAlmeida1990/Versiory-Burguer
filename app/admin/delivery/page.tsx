"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-header";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Save, Trash2, Edit2, X, MapPin } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { DeliveryZone, DeliverySettings } from "@/lib/delivery-fee";

export default function DeliveryManagementPage() {
  const router = useRouter();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [zoneForm, setZoneForm] = useState({
    name: "",
    description: "",
    base_fee: "5.00",
    free_delivery_threshold: "",
    cep_prefixes: [] as string[],
    active: true,
    display_order: 0,
  });

  const [newCepPrefix, setNewCepPrefix] = useState("");

  const [settingsForm, setSettingsForm] = useState({
    default_fee: "5.00",
    free_delivery_min_amount: "50.00",
    manual_fee_allowed: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadZones(), loadSettings()]);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar configurações de frete");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadZones = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("display_order");

      if (error) {
        if (error.code === '42P01') {
          toast.error("Tabela delivery_zones não existe. Execute o SQL primeiro.");
          return;
        }
        throw error;
      }

      setZones(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar zonas:", error);
      toast.error("Erro ao carregar zonas de entrega");
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Erro ao carregar configurações:", error);
        return;
      }

      if (data && data.length > 0) {
        const settingsData = data[0] as DeliverySettings;
        setSettings(settingsData);
        setSettingsForm({
          default_fee: settingsData.default_fee.toString(),
          free_delivery_min_amount: settingsData.free_delivery_min_amount.toString(),
          manual_fee_allowed: settingsData.manual_fee_allowed,
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const handleAddCepPrefix = () => {
    const cleaned = newCepPrefix.replace(/\D/g, "");
    if (cleaned.length < 5) {
      toast.error("CEP deve ter pelo menos 5 dígitos");
      return;
    }
    if (zoneForm.cep_prefixes.includes(cleaned)) {
      toast.error("Este prefixo já foi adicionado");
      return;
    }
    setZoneForm({
      ...zoneForm,
      cep_prefixes: [...zoneForm.cep_prefixes, cleaned],
    });
    setNewCepPrefix("");
  };

  const handleRemoveCepPrefix = (prefix: string) => {
    setZoneForm({
      ...zoneForm,
      cep_prefixes: zoneForm.cep_prefixes.filter((p) => p !== prefix),
    });
  };

  const handleSaveZone = async () => {
    if (!zoneForm.name.trim()) {
      toast.error("Nome da zona é obrigatório");
      return;
    }

    if (zoneForm.cep_prefixes.length === 0) {
      toast.error("Adicione pelo menos um prefixo de CEP");
      return;
    }

    if (!zoneForm.base_fee || parseFloat(zoneForm.base_fee) < 0) {
      toast.error("Valor do frete deve ser maior ou igual a zero");
      return;
    }

    setSaving(true);
    try {
      const zoneData = {
        name: zoneForm.name.trim(),
        description: zoneForm.description.trim() || null,
        base_fee: parseFloat(zoneForm.base_fee),
        free_delivery_threshold: zoneForm.free_delivery_threshold
          ? parseFloat(zoneForm.free_delivery_threshold)
          : null,
        cep_prefixes: zoneForm.cep_prefixes,
        active: zoneForm.active,
        display_order: zoneForm.display_order || zones.length,
      };

      if (editingZone) {
        const { error } = await supabase
          .from("delivery_zones")
          .update(zoneData)
          .eq("id", editingZone.id);

        if (error) throw error;
        toast.success("Zona atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("delivery_zones")
          .insert(zoneData);

        if (error) throw error;
        toast.success("Zona criada com sucesso!");
      }

      resetZoneForm();
      await loadZones();
    } catch (error: any) {
      console.error("Erro ao salvar zona:", error);
      toast.error(error.message || "Erro ao salvar zona");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta zona?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("delivery_zones")
        .delete()
        .eq("id", zoneId);

      if (error) throw error;
      toast.success("Zona excluída com sucesso!");
      await loadZones();
    } catch (error: any) {
      console.error("Erro ao excluir zona:", error);
      toast.error(error.message || "Erro ao excluir zona");
    }
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      description: zone.description || "",
      base_fee: zone.base_fee.toString(),
      free_delivery_threshold: zone.free_delivery_threshold?.toString() || "",
      cep_prefixes: zone.cep_prefixes || [],
      active: zone.active,
      display_order: zone.display_order,
    });
    setShowZoneForm(true);
  };

  const resetZoneForm = () => {
    setZoneForm({
      name: "",
      description: "",
      base_fee: "5.00",
      free_delivery_threshold: "",
      cep_prefixes: [],
      active: true,
      display_order: 0,
    });
    setNewCepPrefix("");
    setEditingZone(null);
    setShowZoneForm(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        default_fee: parseFloat(settingsForm.default_fee),
        free_delivery_min_amount: parseFloat(settingsForm.free_delivery_min_amount),
        manual_fee_allowed: settingsForm.manual_fee_allowed,
      };

      if (settings) {
        const { error } = await supabase
          .from("delivery_settings")
          .update(settingsData)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("delivery_settings")
          .insert(settingsData);

        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso!");
      await loadSettings();
      setShowSettings(false);
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Admin
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold">Configuração de Frete</h1>
          <p className="text-gray-400 mt-2">
            Gerencie zonas de entrega e valores de frete
          </p>
        </div>

        {/* Configurações Gerais */}
        <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1">Configurações Gerais</h2>
              <p className="text-sm text-gray-400">
                Valores padrão e regras gerais de frete
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-primary-yellow text-black rounded-lg font-bold hover:bg-opacity-90 transition"
            >
              {showSettings ? "Cancelar" : "Editar Configurações"}
            </button>
          </div>

          {!showSettings ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Frete Padrão</p>
                <p className="text-2xl font-bold text-primary-yellow">
                  R$ {settings?.default_fee.toFixed(2) || "5,00"}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Frete Grátis a partir de</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {settings?.free_delivery_min_amount.toFixed(2) || "50,00"}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Frete Manual</p>
                <p className="text-2xl font-bold text-blue-400">
                  {settings?.manual_fee_allowed ? "Permitido" : "Bloqueado"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Frete Padrão (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settingsForm.default_fee}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, default_fee: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor Mínimo para Frete Grátis (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settingsForm.free_delivery_min_amount}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        free_delivery_min_amount: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="manual_fee_allowed"
                  checked={settingsForm.manual_fee_allowed}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      manual_fee_allowed: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-yellow"
                />
                <label htmlFor="manual_fee_allowed" className="text-sm font-medium">
                  Permitir frete manual (para casos especiais)
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-primary-yellow text-black rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false);
                    loadSettings();
                  }}
                  className="px-6 py-2 border border-gray-700 rounded-lg font-bold hover:bg-gray-800 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zonas de Entrega */}
        <div className="bg-gray-900 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1">Zonas de Entrega</h2>
              <p className="text-sm text-gray-400">
                Configure valores de frete por região/CEP
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetZoneForm();
                setShowZoneForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-yellow text-black rounded-lg font-bold hover:bg-opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Nova Zona
            </button>
          </div>

          {showZoneForm && (
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {editingZone ? "Editar Zona" : "Nova Zona"}
                </h3>
                <button
                  type="button"
                  onClick={resetZoneForm}
                  className="p-2 hover:bg-gray-700 rounded transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome da Zona *
                    </label>
                    <input
                      type="text"
                      value={zoneForm.name}
                      onChange={(e) =>
                        setZoneForm({ ...zoneForm, name: e.target.value })
                      }
                      placeholder="Ex: Centro, Zona Norte, etc"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ordem de Exibição
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={zoneForm.display_order}
                      onChange={(e) =>
                        setZoneForm({
                          ...zoneForm,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={zoneForm.description}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, description: e.target.value })
                    }
                    placeholder="Descrição da zona (opcional)"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor do Frete (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={zoneForm.base_fee}
                      onChange={(e) =>
                        setZoneForm({ ...zoneForm, base_fee: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor Mínimo para Frete Grátis (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={zoneForm.free_delivery_threshold}
                      onChange={(e) =>
                        setZoneForm({
                          ...zoneForm,
                          free_delivery_threshold: e.target.value,
                        })
                      }
                      placeholder="Deixe vazio para usar o padrão"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prefixos de CEP *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCepPrefix}
                      onChange={(e) => setNewCepPrefix(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCepPrefix();
                        }
                      }}
                      placeholder="Ex: 01310 (primeiros 5 dígitos do CEP)"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    />
                    <button
                      type="button"
                      onClick={handleAddCepPrefix}
                      className="px-4 py-2 bg-primary-yellow text-black rounded-lg font-bold hover:bg-opacity-90 transition"
                    >
                      Adicionar
                    </button>
                  </div>
                  {zoneForm.cep_prefixes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {zoneForm.cep_prefixes.map((prefix) => (
                        <span
                          key={prefix}
                          className="inline-flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg text-sm"
                        >
                          {prefix}
                          <button
                            type="button"
                            onClick={() => handleRemoveCepPrefix(prefix)}
                            className="hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Adicione os primeiros 5 dígitos dos CEPs que pertencem a esta zona
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="zone_active"
                    checked={zoneForm.active}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, active: e.target.checked })
                    }
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-primary-yellow"
                  />
                  <label htmlFor="zone_active" className="text-sm font-medium">
                    Zona ativa
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSaveZone}
                    disabled={saving}
                    className="px-6 py-2 bg-primary-yellow text-black rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : editingZone ? "Atualizar" : "Criar Zona"}
                  </button>
                  <button
                    type="button"
                    onClick={resetZoneForm}
                    className="px-6 py-2 border border-gray-700 rounded-lg font-bold hover:bg-gray-800 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {zones.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma zona cadastrada</p>
              <p className="text-sm mt-2">
                Clique em &quot;Nova Zona&quot; para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`bg-gray-800 rounded-lg p-4 border-2 ${
                    zone.active ? "border-gray-700" : "border-gray-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{zone.name}</h3>
                        {!zone.active && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                            Inativa
                          </span>
                        )}
                      </div>
                      {zone.description && (
                        <p className="text-sm text-gray-400 mb-3">{zone.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Frete</p>
                          <p className="text-lg font-bold text-primary-yellow">
                            R$ {zone.base_fee.toFixed(2)}
                          </p>
                        </div>
                        {zone.free_delivery_threshold && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Frete Grátis a partir de</p>
                            <p className="text-lg font-bold text-green-400">
                              R$ {zone.free_delivery_threshold.toFixed(2)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400 mb-1">CEPs</p>
                          <p className="text-sm font-medium">
                            {zone.cep_prefixes?.length || 0} prefixo(s)
                          </p>
                        </div>
                      </div>
                      {zone.cep_prefixes && zone.cep_prefixes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {zone.cep_prefixes.map((prefix, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-700 text-xs rounded"
                            >
                              {prefix}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleEditZone(zone)}
                        className="p-2 hover:bg-gray-700 rounded transition text-blue-400"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-2 hover:bg-red-900 rounded transition text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

