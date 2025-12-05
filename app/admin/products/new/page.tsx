"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { supabase, Category } from "@/lib/supabase";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category_id: "",
    available: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order");

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return null;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `product_images/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Se o bucket não existir, mostrar instruções
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
          toast.error(
            "Bucket 'images' não encontrado. Vá em Supabase > Storage > New bucket > Nome: 'images' > Public > Create",
            { duration: 6000 }
          );
          return null;
        }
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setImagePreview(publicUrl);
      setFormData({ ...formData, image: publicUrl });
      toast.success("Imagem enviada com sucesso!");
      return publicUrl;
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error(error.message || "Erro ao fazer upload da imagem");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.name.trim()) {
        toast.error("Nome do produto é obrigatório");
        setLoading(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error("Preço deve ser maior que zero");
        setLoading(false);
        return;
      }

      if (!formData.category_id) {
        toast.error("Selecione uma categoria");
        setLoading(false);
        return;
      }

      const { data: newProduct, error } = await supabase.from("products").insert({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        image: formData.image.trim() || null,
        category_id: formData.category_id,
        available: formData.available,
      }).select().single();

      if (error) {
        console.error("Erro ao criar produto:", error);
        throw error;
      }

      toast.success("Produto cadastrado com sucesso! Agora você pode adicionar opcionais.");
      // Redirecionar para a página de edição onde pode adicionar opções
      if (newProduct?.id) {
        router.push(`/admin/products/${newProduct.id}/edit`);
      } else {
        router.push("/admin?tab=products");
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error(error.message || "Erro ao cadastrar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/admin?tab=products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Produtos
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold">Novo Produto</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-4 md:p-6 space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome do Produto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
              placeholder="Ex: Hambúrguer Artesanal"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow min-h-[100px]"
              placeholder="Descreva o produto..."
            />
          </div>

          {/* Preço e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Preço (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Imagem */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Imagem do Produto
            </label>
            
            {/* Preview da Imagem */}
            {(imagePreview || formData.image) && (
              <div className="relative mb-4 w-full max-w-xs">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                  <Image
                    src={imagePreview || formData.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                    unoptimized={(imagePreview || formData.image)?.includes('supabase.co')}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload de Arquivo */}
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg px-4 py-6 cursor-pointer hover:border-primary-yellow transition"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {uploading ? "Enviando..." : "Clique para fazer upload ou arraste uma imagem"}
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <p className="text-xs text-gray-400 mt-2">
                Formatos aceitos: JPG, PNG, WEBP (máx. 5MB)
              </p>
            </div>

            {/* Ou URL */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">ou</span>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="image" className="block text-sm font-medium mb-2">
                URL da Imagem
              </label>
              <input
                type="text"
                id="image"
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value || null);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                placeholder="https://exemplo.com/imagem.jpg ou /images/produtos/imagem.jpg"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use uma URL externa ou caminho local (ex: /images/produtos/nome.jpg). Campo opcional.
              </p>
            </div>
          </div>

          {/* Disponibilidade */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-yellow focus:ring-primary-yellow"
            />
            <label htmlFor="available" className="text-sm font-medium">
              Produto disponível
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-yellow text-black px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Produto
                </>
              )}
            </button>
            <Link
              href="/admin?tab=products"
              className="px-6 py-3 rounded-lg font-bold border border-gray-700 hover:bg-gray-800 transition"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

