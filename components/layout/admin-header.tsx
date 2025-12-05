"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { LogOut, Menu, X, Home } from "lucide-react";
import { logout, getCurrentUser, AuthUser } from "@/lib/auth";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (!currentUser) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso");
      router.push('/admin/login');
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
        </div>
      </header>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        <Link href="/admin" className="flex items-center space-x-2 flex-shrink-0">
          <Image
            src="/images/produtos/logo.jpg"
            alt="Logo"
            width={32}
            height={32}
            className="object-contain rounded"
          />
          <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
            Admin - Versiory
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/admin"
            className={`px-3 py-2 rounded-lg transition ${
              pathname === '/admin'
                ? 'bg-primary-yellow text-black font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin?tab=products"
            className={`px-3 py-2 rounded-lg transition ${
              pathname?.includes('/admin/products')
                ? 'bg-primary-yellow text-black font-medium'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Produtos
          </Link>
          <Link
            href="/admin?tab=orders"
            className={`px-3 py-2 rounded-lg transition ${
              pathname === '/admin' && pathname.includes('orders')
                ? 'bg-primary-yellow text-black font-medium'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Pedidos
          </Link>
          <Link
            href="/admin?tab=categories"
            className={`px-3 py-2 rounded-lg transition ${
              pathname?.includes('/admin/categories')
                ? 'bg-primary-yellow text-black font-medium'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Categorias
          </Link>
          <Link
            href="/cozinha"
            className={`px-3 py-2 rounded-lg transition ${
              pathname === '/cozinha'
                ? 'bg-primary-yellow text-black font-medium'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Cozinha
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
            <span className="text-gray-600 dark:text-gray-400">Olá,</span> {user.name || user.email}
          </div>
          <Link
            href="/"
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            title="Ver site"
          >
            <Home className="w-5 h-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white flex-shrink-0"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin?tab=products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Produtos
            </Link>
            <Link
              href="/admin?tab=orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Pedidos
            </Link>
            <Link
              href="/admin?tab=categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Categorias
            </Link>
            <Link
              href="/cozinha"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cozinha
            </Link>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {user.name || user.email}
              </div>
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

