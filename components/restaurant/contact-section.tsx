"use client";

import { MapPin, Phone, Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ContactSectionProps {
  address?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  phone3?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  primaryColor?: string;
}

export function ContactSection({
  address,
  phone1,
  phone2,
  phone3,
  instagram,
  facebook,
  primaryColor = "#dc2626",
}: ContactSectionProps) {
  // Se não tiver nenhuma informação, não renderizar
  if (!address && !phone1 && !instagram && !facebook) {
    return null;
  }

  const formatPhoneForLink = (phone: string) => {
    // Remover caracteres não numéricos
    const numbers = phone.replace(/\D/g, "");
    // Se começar com 0, remover
    const cleaned = numbers.startsWith("0") ? numbers.slice(1) : numbers;
    return `55${cleaned}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)`, transform: 'translate(-50%, -50%)' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)`, transform: 'translate(50%, 50%)' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Entre em Contato
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Endereço */}
          {address && (
            <motion.div
              variants={itemVariants}
              className="group relative rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
                border: `2px solid ${primaryColor}30`,
              }}
            >
              {/* Animated border on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}20, transparent)`,
                }}
              ></div>
              
              <div className="relative p-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg"
                  style={{ 
                    backgroundColor: primaryColor,
                  }}
                >
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>Endereço</h3>
                <p className="text-gray-700 leading-relaxed font-medium">{address}</p>
              </div>
            </motion.div>
          )}

          {/* Telefones */}
          {(phone1 || phone2 || phone3) && (
            <motion.div
              variants={itemVariants}
              className="group relative rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
                border: `2px solid ${primaryColor}30`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}20, transparent)`,
                }}
              ></div>
              
              <div className="relative p-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg"
                  style={{ 
                    backgroundColor: primaryColor,
                  }}
                >
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>Telefones</h3>
                <div className="space-y-3">
                  {phone1 && (
                    <a
                      href={`https://wa.me/${formatPhoneForLink(phone1)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md group/link"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${primaryColor}15`;
                        e.currentTarget.style.color = primaryColor;
                      }}
                    >
                      {phone1}
                    </a>
                  )}
                  {phone2 && (
                    <a
                      href={`https://wa.me/${formatPhoneForLink(phone2)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${primaryColor}15`;
                        e.currentTarget.style.color = primaryColor;
                      }}
                    >
                      {phone2}
                    </a>
                  )}
                  {phone3 && (
                    <a
                      href={`https://wa.me/${formatPhoneForLink(phone3)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${primaryColor}15`;
                        e.currentTarget.style.color = primaryColor;
                      }}
                    >
                      {phone3}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Instagram */}
          {instagram && (
            <motion.div
              variants={itemVariants}
              className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              
              <div className="relative p-6">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Instagram className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instagram</h3>
                <a
                  href={`https://instagram.com/${instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white font-medium transition-colors inline-block"
                >
                  {instagram} →
                </a>
              </div>
            </motion.div>
          )}

          {/* Facebook */}
          {facebook && (
            <motion.div
              variants={itemVariants}
              className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              
              <div className="relative p-6">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Facebook className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Facebook</h3>
                <p className="text-white/90">{facebook}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
