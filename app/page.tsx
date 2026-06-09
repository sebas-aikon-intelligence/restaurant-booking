import Link from 'next/link'
import { ChefHat, CalendarCheck, LayoutDashboard, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">GourmetOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition">
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            La nueva era de la gestión gastronómica
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-tight">
            Gestión de reservas <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              sin fricción para restaurantes
            </span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Centraliza tus reservas, organiza tus mesas visualmente y ofrece a tus clientes una experiencia de reserva premium, todo en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 hover:scale-105 transition-all duration-200"
            >
              Crear mi cuenta <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black border border-gray-200 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Ver características
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Todo lo que necesitas para operar</h2>
            <p className="text-lg text-gray-600">Reemplaza múltiples herramientas con una solución integral diseñada específicamente para la industria restaurantera.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mapas de Mesas 2D</h3>
              <p className="text-gray-600 leading-relaxed">
                Diseña el plano de tu restaurante. Tus clientes podrán visualizar y elegir exactamente dónde se sentarán antes de llegar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <CalendarCheck className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Motor de Reservas</h3>
              <p className="text-gray-600 leading-relaxed">
                Obtén un enlace público personalizado. Recibe reservas 24/7 con confirmación automática e integración con tu inventario.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">CRM & Mensajería</h3>
              <p className="text-gray-600 leading-relaxed">
                Centraliza la comunicación con tus comensales y mantén un historial de sus preferencias y visitas anteriores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Benefit Section */}
      <section className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
                Menos fricción, <br/>más mesas llenas.
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                GourmetOS está diseñado para que tu staff pase menos tiempo contestando el teléfono y más tiempo brindando una experiencia excepcional a tus clientes.
              </p>
              <ul className="space-y-4">
                {[
                  'Configuración en menos de 5 minutos',
                  'Soporte multi-zonas (Terraza, Interior, VIP)',
                  'Gestión de eventos especiales',
                  'Sin comisiones por reserva'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-white rounded-3xl transform rotate-3 scale-105 -z-10"></div>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Mockup Placeholder */}
                <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-8 bg-gray-50 flex flex-col gap-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded-xl animate-pulse delay-75"></div>
                  </div>
                  <div className="h-48 bg-gray-200 rounded-xl animate-pulse mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-black text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <ChefHat className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para modernizar tu restaurante?</h2>
          <p className="text-gray-400 mb-10 text-lg">Únete hoy y transforma la forma en que recibes reservas.</p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 hover:scale-105 transition-all duration-200"
          >
            Empezar ahora gratis
          </Link>
        </div>
      </footer>
    </div>
  )
}
