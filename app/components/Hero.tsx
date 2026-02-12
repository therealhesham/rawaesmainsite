const HERO_IMAGE =
  "/hero.jpg";

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
      <div className="absolute inset-0  dark:from-black/90 dark:via-black/70" />

    </section>
  );
}
