"use client";

import { motion } from "framer-motion";
import { Clock, Award, Truck, Shield } from "lucide-react";

interface FeaturesSectionProps {
  primaryColor?: string;
}

export function FeaturesSection({ primaryColor = "#dc2626" }: FeaturesSectionProps) {
  const features = [
    {
      icon: Clock,
      title: "Entrega Rápida",
      description: "Seus pedidos entregues com agilidade e qualidade",
    },
    {
      icon: Award,
      title: "Qualidade Garantida",
      description: "Produtos frescos e selecionados para você",
    },
    {
      icon: Truck,
      title: "Delivery",
      description: "Entregamos na sua casa com todo cuidado",
    },
    {
      icon: Shield,
      title: "Pagamento Seguro",
      description: "Aceitamos múltiplas formas de pagamento",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const, // easeOut curve
      },
    },
  };

  return (
    <section className="py-20 px-4 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full" style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Por que nos escolher?
          </h2>
          <div className="w-32 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group text-center"
              >
                <div className="relative inline-block mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

