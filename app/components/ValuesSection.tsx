import Link from "next/link";

const CITY_IMAGE =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop";

const values = [
  {
    icon: "star",
    title: "رضى العميل",
    desc: "نحن ملتزمون بتقديم أعلى مستويات الجودة والخدمة لعملائنا لضمان رضاهم التام.",
    rotate: "rotate-3",
  },
  {
    icon: "verified",
    title: "الجودة",
    desc: "نحن نضمن لك أعلى مستويات الجودة في كل منتج نقدمه، لأن رضاك يأتي في المقام الأول.",
    rotate: "-rotate-2",
  },
  {
    icon: "lightbulb",
    title: "الابتكار",
    desc: "نحن نسعى لتطوير منتجات وخدمات جديدة تلبي التحديات الحالية والمستقبلية.",
    rotate: "rotate-2",
  },
  {
    icon: "speed",
    title: "سرعة الإنجاز",
    desc: "سرعة التنفيذ هي علامة تميز شركتنا، حيث نسعى دائماً لإيصال حلولنا بفاعلية وسرعة لتلبية احتياجاتك.",
    rotate: "-rotate-3",
  },
];

export function ValuesSection() {
  return (
    <section className="py-20 bg-background-light dark:bg-background-dark relative">
      <div className="container mx-auto px-4 text-center mb-16">
        <h3 className="text-primary font-bold text-lg mb-2">
          روائس القمم لتقسيط
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          مؤسسة تجارية رائدة في مجال الاستثمار والتمويل الشرعي والتقسيط
        </p>
        <Link
          className="bg-primary hover:bg-[#c49b60] text-white px-8 py-2 rounded-lg text-sm transition-colors shadow-md inline-block"
          href="#"
        >
          قدم طلب تقسيط
        </Link>
      </div>
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-4xl font-bold text-primary">قيمنا</h2>
            <div className="h-1 flex-grow bg-primary/20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`w-16 h-16 bg-secondary dark:bg-card-dark rounded-xl flex items-center justify-center mb-3 shadow-lg transform ${v.rotate} hover:rotate-0 transition-all`}
                >
                  <span className="material-icons text-white text-3xl">
                    {v.icon}
                  </span>
                </div>
                <h4 className="font-bold text-primary mb-2">{v.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2 bg-gradient-to-b from-white to-gray-50 dark:from-card-dark dark:to-background-dark p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 h-32 bg-cover bg-bottom opacity-10 pointer-events-none"
            style={{ backgroundImage: `url('${CITY_IMAGE}')` }}
          />
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <span className="material-icons text-green-600 dark:text-green-400 text-5xl">
                eco
              </span>
            </div>
            <h2 className="text-3xl font-bold text-secondary dark:text-white mb-4">
              استثمر مع مجموعة روائس
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-loose mb-8">
              نحن نشجع العملاء على الاستثمار بطريقة مستدامة وذكية. ونوفر لهم
              الأدوات والمعرفة لاتخاذ القرارات الصائبة. سواء كان العميل يبحث عن
              استثمار مبلغ صغير أو كبير، فإننا نقوم بتخصيص الوقت والجهود لتطوير
              أفضل استراتيجية استثمارية وتحقيق أعلى عوائد.
            </p>
            <Link
              className="bg-primary hover:bg-[#c49b60] text-white px-10 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 inline-block"
              href="#"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
