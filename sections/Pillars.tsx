import { TrendingUp, Leaf, Users, Scale } from 'lucide-react';

const Pillars = () => {
  const dimensions = [
    {
      icon: TrendingUp,
      title: "Dimensión Económica",
      description: "Evaluamos la viabilidad financiera a largo plazo, la generación de empleo local y la integración en la economía regional. No solo se trata de rentabilidad, sino de prosperidad compartida.",
      color: "text-coviar-borravino"
    },
    {
      icon: Leaf,
      title: "Dimensión Ambiental",
      description: "Análisis del uso de recursos, gestión de residuos y protección de la biodiversidad. Fomentamos prácticas regenerativas que preserven el terroir para las futuras generaciones.",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Social y Cultural",
      description: "Valoración del impacto en la comunidad, equidad laboral y preservación del patrimonio vitivinícola. El vino es cultura y su producción debe respetar y enriquecer su entorno humano.",
      color: "text-blue-600"
    },
    {
      icon: Scale,
      title: "Gobernanza y Ética",
      description: "Transparencia en la toma de decisiones, políticas anticorrupción y gestión de calidad. La estructura ética sólida es la base sobre la que se construye la verdadera sostenibilidad.",
      color: "text-coviar-red"
    }
  ];

  return (
    <section id="dimensiones" className="scroll-mt-32 py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-coviar-borravino-dark mb-6 leading-tight">
            <span className="italic">Dimensiones</span> del Turismo Sostenible
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Tradicionalmente, la sostenibilidad se ha entendido a través de tres pilares: económico, social y ambiental. Sin embargo, alineándonos con la Agenda 2030, hemos expandido esta visión para integrar la gobernanza y la cultura como ejes fundamentales para el desarrollo integral de las bodegas argentinas.
          </p>
        </div>

        {/* Grid de Dimensiones */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {dimensions.map((dimension, index) => {
            const IconComponent = dimension.icon;
            return (
              <div 
                key={index} 
                className="bg-orange-50/50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 ${dimension.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{dimension.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{dimension.description}</p>
              </div>
            );
          })}
        </div>

        {/* Sección Visión 2030 */}
        <div className="relative rounded-2xl overflow-hidden min-h-[300px]">
          {/* Imagen de fondo */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/assets/wine-bottles-background.jpg" 
              alt="Flores de vid" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-coviar-borravino/90 to-coviar-borravino/60"></div>
          </div>
          
          {/* Contenido */}
          <div className="relative z-10 p-10 md:p-16 max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-4">
              Visión 2030
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
              Comprometidos con el futuro del vino argentino.
            </h3>
            <p className="text-white/90 text-lg">
              Una herramienta de evolución continua para bodegas que miran hacia adelante.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pillars;
