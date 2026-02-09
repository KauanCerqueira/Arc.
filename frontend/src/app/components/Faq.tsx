"use client"

import { useState } from "react"

type QA = { q: string; a: string }

const faqs: QA[] = [
  {
    q: "Por que tá de graça? Qual a pegadinha?",
    a: "Nenhuma. Estamos em beta e queremos crescer junto com você. Primeiros 1.000 nunca pagam. Nem hoje, nem daqui 5 anos. É assim mesmo. Early adopters ganham tudo de graça pra sempre. Deal?",
  },
  {
    q: "Vão pedir meu cartão escondido?",
    a: "Não. Só email. Zero cartão. Zero cobrança surpresa. Zero joguinho de trial fake que renova sozinho. 100% grátis significa 100% grátis.",
  },
  {
    q: "Demora quanto pra começar? 1 semana tipo Notion?",
    a: "2 minutos. Cronômetro na mão. Cadastro → escolhe template → já era, tá produzindo. Zero configuração. Enquanto você termina de ler isso, dá pra criar 3 workspaces.",
  },
  {
    q: "Meus dados tão seguros ou vão vazar?",
    a: "Criptografia E2E, código open source (audite você mesmo), LGPD/GDPR compliant. Não vendemos seus dados. Nunca. Simples assim.",
  },
  {
    q: "Sério que é mais rápido que Notion?",
    a: "Muito. Notion demora 1 semana pra configurar direito (ou você gasta R$ 97 num template). Aqui: 2 minutos. Tudo pronto. Menos blá-blá, mais resultado. 3x mais velocidade segundo nossa galera.",
  },
  {
    q: "E quando sair da beta? Vão me cobrar?",
    a: "Se você entrar agora: NUNCA. Early adopters mantêm tudo grátis. Pra sempre. E pros que entrarem depois? R$ 15-20/mês (vs R$ 70+ da concorrência). Preço justo, sem exploração. Nosso foco é comunidade, não sugar seu dinheiro.",
  },
  {
    q: "Por que não tem paywall escondendo features?",
    a: "Porque a gente não é filho da p*ta. Simples assim. Tudo liberado. Se um dia cobrarmos, será pelo workspace, não por feature. Quer colaboração? Tem. Quer API? Tem. Sem frescura de 'upgrade pra desbloquear'.",
  },
  {
    q: "Como eu participo da comunidade?",
    a: "Discord ativo (tire dúvidas, compartilhe workflows), GitHub aberto (vote em features, reporte bugs), updates semanais públicos. Sua opinião molda o produto. Não é marketing: bugs consertados em 12h, features votadas pela galera entram no roadmap.",
  },
]

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">perguntas frequentes.</h2>
        <p className="text-base sm:text-xl text-arc-muted mt-3">Tudo que você precisa saber para começar agora.</p>
      </div>

      <div className="divide-y divide-arc rounded-2xl border-2 border-arc bg-arc-primary overflow-hidden">
        {faqs.map((item, i) => (
          <div key={i} className="">
            <button
              className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-arc-secondary"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span className="font-semibold text-arc text-sm sm:text-base">{item.q}</span>
              <span className="text-arc-muted text-sm">{openIdx === i ? '−' : '+'}</span>
            </button>
            {openIdx === i && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-arc-muted leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

