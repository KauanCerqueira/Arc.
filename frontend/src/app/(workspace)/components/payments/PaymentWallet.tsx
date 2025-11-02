"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  Trash2,
  Pencil,
  Plus,
  Nfc,
} from "lucide-react";

export type WalletItem = {
  id: string;
  brand: string; // visa, mastercard, amex...
  last4: string;
  expMonth: number;
  expYear: number;
  issuer?: string; // nubank, itau, inter, etc
  color?: string; // hex principal opcional
  isDefault?: boolean;
};

type Props = {
  title?: string;
  items: WalletItem[];
  userName: string;
  isLoading?: boolean;
  onAddNew: () => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
};

const BRAND_STYLES: Record<string, { from: string; to: string }> = {
  visa: { from: "#0a58ff", to: "#003399" },
  mastercard: { from: "#ff512f", to: "#dd2476" },
  amex: { from: "#3A7BD5", to: "#00d2ff" },
  elo: { from: "#333333", to: "#111111" },
  hipercard: { from: "#b91c1c", to: "#7f1d1d" },
};

const ISSUER_STYLES: Record<string, { from: string; to: string }> = {
  nubank: { from: "#7F2BFF", to: "#4B0DBE" },
  itau: { from: "#004AAD", to: "#012E6B" },
  inter: { from: "#FF7A00", to: "#C95E00" },
};

function gradientFor(item: WalletItem): { from: string; to: string } {
  if (item.color) {
    return { from: item.color, to: `${item.color}` };
  }
  if (item.issuer && ISSUER_STYLES[item.issuer.toLowerCase()]) return ISSUER_STYLES[item.issuer.toLowerCase()];
  if (item.brand && BRAND_STYLES[item.brand.toLowerCase()]) return BRAND_STYLES[item.brand.toLowerCase()];
  return { from: "#171717", to: "#0f172a" };
}

const CardChip = () => (
  <svg width="40" height="28" viewBox="0 0 50 36" className="opacity-90" aria-hidden>
    <rect x="2" y="2" rx="6" ry="6" width="46" height="32" fill="#D4AF37"/>
    <rect x="10" y="8" width="30" height="4" fill="#c89b2d"/>
    <rect x="10" y="16" width="30" height="4" fill="#c89b2d"/>
    <rect x="10" y="24" width="30" height="4" fill="#c89b2d"/>
  </svg>
);

const PaymentWallet: React.FC<Props> = ({ title = "Pagamentos", items, userName, isLoading, onAddNew, onSetDefault, onDelete, onEdit }) => {
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => items, [items]);

  const scrollBy = (delta: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie seus cartões e métodos de pagamento</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCompact(!compact)} className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
            {compact ? "Modo carrossel" : "Lista compacta"}
          </button>
          <button onClick={onAddNew} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 dark:bg-slate-700 text-white hover:bg-gray-800 dark:hover:bg-slate-600">
            <Plus className="w-4 h-4"/> Novo cartão
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-gray-600 dark:text-gray-400">Carregando…</div>
      ) : data.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">Nenhum cartão. Clique em "Novo cartão" para adicionar.</div>
      ) : compact ? (
        <div className="space-y-3">
          <AnimatePresence>
            {data.map((card) => {
              const g = gradientFor(card);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-9 rounded-lg" style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})`, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }} />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">•••• •••• •••• {card.last4}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{(card.brand || '').toUpperCase()} · exp {String(card.expMonth).padStart(2,'0')}/{String(card.expYear).slice(-2)}</div>
                    </div>
                    {card.isDefault && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 animate-pulse">
                        <ShieldCheck className="w-3 h-3" /> Padrão
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!card.isDefault && (
                      <button onClick={() => onSetDefault(card.id)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300">Tornar padrão</button>
                    )}
                    <button onClick={() => onEdit?.(card.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" title="Editar"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => onDelete(card.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Excluir"><Trash2 className="w-4 h-4 text-red-500"/></button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="relative">
          {/* arrowse */}
          <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 z-10">
            <button onClick={() => scrollBy(-360)} className="p-2 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow hover:shadow-md">‹</button>
          </div>
          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
            <button onClick={() => scrollBy(360)} className="p-2 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow hover:shadow-md">›</button>
          </div>

          <div ref={scrollRef} className="snap-x snap-mandatory overflow-x-auto no-scrollbar flex gap-4 py-2">
            {data.map((card) => {
              const g = gradientFor(card);
              const mm = String(card.expMonth).padStart(2, "0");
              const yy = String(card.expYear).slice(-2);
              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="snap-start shrink-0 w-[300px] md:w-[340px]"
                >
                  <div
                    onClick={() => setMenuOpen(menuOpen === card.id ? null : card.id)}
                    className="relative rounded-[1.2rem] text-white p-5 h-[200px] cursor-pointer transition-all duration-300 ease-in-out"
                    style={{
                      background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    }}
                  >
                    {/* Brand */}
                    <div className="absolute right-5 top-5 text-xs tracking-widest opacity-90">
                      {(card.brand || "CARD").toUpperCase()}
                    </div>
                    {/* Chip & NFC */}
                    <div className="flex items-center gap-3">
                      <CardChip />
                      <Nfc className="w-5 h-5 opacity-90" />
                    </div>
                    {/* Number */}
                    <div className="mt-6 text-lg font-semibold tracking-wider">
                      •••• •••• •••• {card.last4}
                    </div>
                    {/* Footer */}
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] opacity-80">VALID THRU</div>
                        <div className="text-sm font-semibold">{mm}/{yy}</div>
                      </div>
                      <div className="text-sm font-semibold truncate max-w-[55%] text-right">
                        {userName.toUpperCase()}
                      </div>
                    </div>
                    {/* Default badge */}
                    {card.isDefault && (
                      <span className="absolute -left-2 -top-2 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 animate-pulse">
                        <ShieldCheck className="w-3 h-3"/> Padrão
                      </span>
                    )}

                    {/* Actions menu */}
                    <AnimatePresence>
                      {menuOpen === card.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute right-3 bottom-3 bg-white/95 dark:bg-slate-900/95 text-gray-800 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden"
                        >
                          <button onClick={() => { setMenuOpen(null); onEdit?.(card.id); }} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 w-full">
                            <Pencil className="w-4 h-4"/> Editar
                          </button>
                          {!card.isDefault && (
                            <button onClick={() => { setMenuOpen(null); onSetDefault(card.id); }} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 w-full">
                              <ShieldCheck className="w-4 h-4"/> Tornar padrão
                            </button>
                          )}
                          <button onClick={() => { setMenuOpen(null); onDelete(card.id); }} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 w-full">
                            <Trash2 className="w-4 h-4"/> Excluir
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentWallet;

