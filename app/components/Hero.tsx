const HERO_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

const sectors = [
  { icon: "apartment", title: "روائس للاستثمار", sub: "Investment" },
  { icon: "directions_car", title: "روائس للسيارات", sub: "Rent Cars" },
  { icon: "restaurant", title: "روائس للضيافة", sub: "Hospitality" },
  { icon: "person_search", title: "روائس للاستقدام", sub: "Recruitment" },
];

export function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-transparent dark:from-black/90 dark:via-black/70" />
      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between h-full">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start md:items-start text-white mb-10 md:mb-0 order-2 md:order-1 px-4">
          <h2 className="text-5xl md:text-7xl font-bold text-primary mb-4 drop-shadow-lg">
            كيان استثماري
          </h2>
          <p className="text-2xl md:text-4xl font-light mb-8 max-w-lg leading-relaxed drop-shadow-md text-gray-100">
            مكون من عدة شركات في مجالات وقطاعات مختلفة.
          </p>
        </div>
        <div className="w-full md:w-auto order-1 md:order-2 self-end md:self-center mb-8 md:mb-0 md:ml-12">
          <div className="bg-primary/90 dark:bg-primary/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-white/20">
            <div className="flex gap-6 md:gap-8 justify-center">
              {sectors.map((s) => (
                <div
                  key={s.sub}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-icons text-primary text-3xl">
                      {s.icon}
                    </span>
                  </div>
                  <span className="text-xs text-white font-bold text-center">
                    {s.title}
                  </span>
                  <span className="text-[10px] text-white/80 text-center uppercase">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
