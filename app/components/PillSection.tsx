const pills = [
  "مجموعة رائدة",
  "توسع متنوع",
  "ابتكار مستمر",
  "شراكات استراتيجية",
];

export function PillSection() {
  return (
    <section className="bg-secondary dark:bg-card-dark py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {pills.map((label) => (
            <div
              key={label}
              className="bg-primary text-secondary px-8 py-4 rounded-full font-bold text-lg shadow-lg w-full md:w-auto text-center transform hover:scale-105 transition-transform cursor-default"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
