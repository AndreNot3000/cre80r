export function TrustSection() {
  const stats = [
    { label: "Bookings Processed", value: "₦2.4B+" },
    { label: "High-Res Files Delivered", value: "1.2M+" },
    { label: "Production Hours Saved", value: "48,000 hrs" },
    { label: "Creator Satisfaction Rate", value: "99.4%" },
  ];

  const studios = [
    "Lagos Visuals Lab",
    "Apex Film Africa",
    "Noir Wedding Cinema",
    "Kolawole Luxury Studios",
    "Vanguard Creative Agency",
    "Accra Motion Collective",
  ];

  return (
    <section className="relative py-16 border-y border-white/[0.06] bg-[#08090f]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Metric Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Studio Names Ticker / Badges */}
        <div className="pt-6 border-t border-white/[0.04]">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">
            Trusted by modern creative directors, commercial studios & wedding filmmakers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-70">
            {studios.map((studio, i) => (
              <div
                key={i}
                className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase hover:text-white transition-colors cursor-default"
              >
                {studio}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
