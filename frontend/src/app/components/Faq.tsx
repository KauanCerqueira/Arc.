"use client"

import { useState } from "react"

type QA = { q: string; a: string }

const faqs: QA[] = [
  {
    q: "O arc. é grátis?",
    a: "Sim. O plano Free inclui 1 workspace, 3 projetos e 100MB. Você pode evoluir para Individual ou Team quando quiser.",
  },
  {
    q: "Como funciona o plano anual?",
    a: "Você paga uma vez, economiza ~17% em relação ao mensal e mantém todos os recursos do plano escolhido durante 12 meses.",
  },
  {
    q: "Posso usar com meu time?",
    a: "Sim. O plano Team inclui até 10 membros por workspace, permissões granulares e recursos de colaboração.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Seguimos boas práticas de segurança, criptografia em trânsito e backups regulares. Você mantém controle total do que compartilha.",
  },
  {
    q: "Consigo migrar de outras ferramentas?",
    a: "Você pode organizar seus conteúdos importando tabelas/CSV e reconstruindo páginas com nossos templates prontos.",
  },
  {
    q: "Preciso configurar algo?",
    a: "Quase nada. Escolha um template, crie um workspace e convide o time. O resto já vem pronto para uso.",
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

