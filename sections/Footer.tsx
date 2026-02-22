const Footer = () => {
  return (
    <footer id="contacto" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Logos / Respaldos */}
        <div className="border-b border-gray-700 pb-12 mb-12 text-center">
            <p className="text-gray-400 uppercase tracking-widest text-xs mb-8">Con el respaldo técnico e institucional de</p>
            <div className="flex flex-wrap justify-center items-center">
                {/* Logo COVIAR */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/assets/footer/FooterBlanco.svg" 
                  alt="COVIAR" 
                  className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity"
                />
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* FAQ */}
          <div>
            <h3 className="text-xl font-bold mb-6">Preguntas Frecuentes</h3>
            <div className="space-y-4">
                <details className="bg-gray-800 rounded p-4 cursor-pointer">
                    <summary className="font-medium hover:text-coviar-red transition">¿La autoevaluación tiene costo?</summary>
                    <p className="text-gray-400 mt-2 text-sm">No, es una herramienta gratuita provista por COVIAR para el desarrollo del sector.</p>
                </details>
                <details className="bg-gray-800 rounded p-4 cursor-pointer">
                    <summary className="font-medium hover:text-coviar-red transition">¿Quién ve mis datos?</summary>
                    <p className="text-gray-400 mt-2 text-sm">La información es confidencial y estratégica, accesible solo por la bodega y el equipo técnico para la generación del informe.</p>
                </details>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xl font-bold mb-6">¿Necesitás ayuda?</h3>
            <p className="text-gray-400 mb-6">
                Si tenés dudas sobre cómo determinar tu categoría o llenar el formulario, nuestro equipo de soporte está disponible.
            </p>
            <a href="mailto:soporte@coviar.com.ar" className="inline-block bg-white text-gray-900 px-6 py-3 rounded font-bold hover:bg-coviar-red hover:text-white transition duration-300">
                Contactar Soporte Técnico
            </a>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Corporación Vitivinícola Argentina. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
