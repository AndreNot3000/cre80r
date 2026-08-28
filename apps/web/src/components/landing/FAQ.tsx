"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do Paystack payments and bank payouts work?",
      a: "Crea8or integrates directly with Paystack. When a client pays a deposit or invoice using a Debit Card, Bank Transfer, or USSD, the funds are deposited directly into your verified bank account with automated instant receipt generation.",
    },
    {
      q: "Can international clients in the US or UK pay me in USD or GBP?",
      a: "Yes! Crea8or supports multi-currency invoicing. Your diaspora and global clients can pay with international Visa, Mastercard, or Apple Pay through our Paystack and Stripe payment gateways.",
    },
    {
      q: "Is Video Review really included without an extra subscription?",
      a: "Yes. Unlike standalone tools like Frame.io that charge $45+/month per user, frame-accurate video timestamp feedback and client version approvals are built directly into your Crea8or project workspaces.",
    },
    {
      q: "How does the WhatsApp client workflow work?",
      a: "African creative businesses run on WhatsApp. Crea8or allows you to trigger automated WhatsApp messages for booking confirmations, pre-shoot call sheets, and gallery download links directly to your client's phone.",
    },
    {
      q: "Can I migrate my existing clients and contracts from Notion or HoneyBook?",
      a: "Absolutely. You can import your existing client directory via CSV in under 60 seconds, and use our AI Assistant to convert your existing paper contracts into dynamic reusable digital templates.",
    },
  ];

  return (
    <section id="faq" className="py-24 border-t border-white/[0.06] relative bg-[#0a0b12]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Frequently Asked Questions
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to know about Crea8or OS.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-[#0e101b] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-white text-sm sm:text-base hover:text-violet-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-violet-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
