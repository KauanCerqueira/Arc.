import Link from 'next/link';
import Image from "next/image";
import { 
  CheckCircle, Calendar, Timer, 
  TrendingUp, Zap, ArrowRight, 
  BarChart3, Target, Users
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Calendar,
      title: "Múltiplas metodologias em um só lugar",
      description: "Alterne entre Kanban, Pomodoro, GTD e modo Estudo sem perder o contexto. Cada projeto pode ter sua própria metodologia."
    },
    {
      icon: BarChart3,
      title: "Análise que realmente ajuda",
      description: "Descubra seus padrões de produtividade. Saiba quando você trabalha melhor e onde está perdendo tempo."
    },
    {
      icon: Timer,
      title: "Estimativas inteligentes",
      description: "O sistema aprende com seus projetos anteriores e sugere prazos realistas baseados no seu histórico."
    },
  ];

  const methods = [
    { name: "Kanban", desc: "Visual e flexível", color: "bg-blue-500" },
    { name: "Pomodoro", desc: "Foco em blocos", color: "bg-red-500" },
    { name: "GTD", desc: "Organização total", color: "bg-green-500" },
    { name: "Estudo", desc: "Revisão espaçada", color: "bg-purple-500" },
  ];

  const testimonials = [
    {
      quote: "Finalmente consigo ver todos os meus projetos em um lugar só. O Arc. mudou como eu trabalho.",
      author: "Marina Souza",
      role: "Designer de Produto",
      initial: "M"
    },
    {
      quote: "Uso Kanban para desenvolvimento e Pomodoro para estudos. Tudo sincronizado. É exatamente o que eu precisava.",
      author: "Carlos Lima",
      role: "Desenvolvedor",
      initial: "C"
    },
    {
      quote: "A análise de tempo me mostrou que eu trabalho melhor de manhã. Agora organizo minhas tarefas com base nisso.",
      author: "Ana Paula",
      role: "Arquiteta",
      initial: "A"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar clean e funcional */}
       <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo e título */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon/arclogo.svg"
              alt="Arc Logo"
              width={32}
              height={32}
              priority
            />
            <span className="text-xl font-semibold text-gray-900">Arc.</span>
          </Link>
        </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Recursos</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">Como Funciona</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Depoimentos</a>
            <Link href="/build-in-public" className="text-gray-600 hover:text-gray-900 transition">
              Build in Public
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Entrar
            </Link>
            <Link 
              href="/register" 
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2"
            >
              Começar grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section - estilo Todoist/Things */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Gerencie seus projetos do seu jeito
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Escolha entre Kanban, Pomodoro, GTD ou modo Estudo. 
              Combine metodologias. Analise seu desempenho. 
              Tudo em uma interface que não atrapalha seu fluxo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                href="/register" 
                className="bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-800 transition text-center"
              >
                Criar conta grátis
              </Link>
              <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 transition">
                Ver como funciona
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Grátis para sempre</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Setup em 2 min</span>
              </div>
            </div>
          </div>

          {/* Screenshot mockup - estilo clean */}
          <div className="relative">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-xl">
              {/* Header do app */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-sm"></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Projeto Design</div>
                    <div className="text-xs text-gray-500">Kanban</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* Kanban columns preview */}
              <div className="grid grid-cols-3 gap-4">
                {["A Fazer", "Em Progresso", "Concluído"].map((col, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-3">{col}</div>
                    <div className="space-y-2">
                      {[...Array(i === 1 ? 2 : 3)].map((_, j) => (
                        <div key={j} className="bg-gray-50 rounded p-2 border border-gray-100">
                          <div className="h-2 bg-gray-200 rounded mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats bar */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-xs text-blue-600 font-medium mb-1">Tarefas</div>
                  <div className="text-lg font-bold text-blue-900">24</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="text-xs text-green-600 font-medium mb-1">Concluídas</div>
                  <div className="text-lg font-bold text-green-900">18</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="text-xs text-purple-600 font-medium mb-1">Tempo</div>
                  <div className="text-lg font-bold text-purple-900">12h</div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">847 online agora</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="bg-gray-50 border-y border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">12.547</div>
              <div className="text-sm text-gray-600">Usuários ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">89.234</div>
              <div className="text-sm text-gray-600">Projetos criados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">4.8/5</div>
              <div className="text-sm text-gray-600">Avaliação média</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Construído para como você realmente trabalha
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Não é sobre ter mais recursos. É sobre ter os recursos certos, 
            na hora certa, sem complicar.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="group">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition h-full">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Methodologies section */}
      <section id="how-it-works" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha a metodologia certa para cada projeto
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Não force todos os projetos em um único formato. 
              Use Kanban para design, Pomodoro para estudos, GTD para tarefas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {methods.map((method, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition">
                <div className={`w-12 h-12 ${method.color} rounded-xl mb-4`}></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{method.name}</h3>
                <p className="text-gray-600 text-sm">{method.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Combine metodologias no mesmo projeto
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Use Kanban para organizar o fluxo geral, ative o Pomodoro 
                  quando precisar de foco profundo, e aplique GTD para processar 
                  suas tarefas. Tudo isso sem trocar de ferramenta.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    Flexível
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    Sem atrito
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    Do seu jeito
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="space-y-3">
                  {["Kanban: Visualizar fluxo", "Pomodoro: Sessões de foco", "GTD: Processar inbox"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                      <div className={`w-8 h-8 ${methods[i].color} rounded-lg`}></div>
                      <span className="text-sm font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            O que nossos usuários dizem
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t.author}</div>
                  <div className="text-sm text-gray-600">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gray-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comece a organizar seus projetos hoje
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Junte-se a mais de 12 mil pessoas que já estão gerenciando 
            seus projetos de forma mais inteligente.
          </p>
          
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
          >
            Criar conta gratuita
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-gray-400 mt-6">
            Grátis para sempre • Sem cartão de crédito • Setup em 2 minutos
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12 bg-[#f6f4f0]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo + nome */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon/arclogo.svg"
              alt="Arc Logo"
              width={32}
              height={32}
              priority
            />
            <span className="text-lg font-semibold text-gray-900">Arc.</span>
          </Link>

          {/* Links de navegação */}
          <div className="flex gap-8 text-sm text-gray-600 text-center md:text-left">
            <a href="#" className="hover:text-gray-900 transition">
              Sobre
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Blog
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Ajuda
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Privacidade
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Termos
            </a>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2025 Arc. Feito para pessoas que fazem acontecer.</p>
        </div>
      </div>
    </footer>
    </div>
  );
}