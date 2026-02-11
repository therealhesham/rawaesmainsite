import Link from "next/link";

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-20 bg-background-light dark:bg-background-dark relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 hidden md:block" />
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="w-48 h-48 md:w-64 md:h-64 relative flex items-center justify-center mb-4">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-secondary rounded-full opacity-10" />
              </div>
              <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-secondary rounded-tl-full" />
              <div className="absolute top-0 right-1/4 w-1/2 h-1/2 bg-secondary rounded-tr-full" />
              <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-secondary rounded-bl-full" />
              <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-primary rounded-br-full shadow-lg" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">مجموعة روائس</h2>
            <h3 className="text-xl font-semibold text-secondary dark:text-gray-300">
              Rawaes Group
            </h3>
          </div>
        </div>
        <div className="w-full md:w-2/3 text-center md:text-right">
          <h2 className="text-4xl font-bold text-primary mb-6 relative inline-block">
            من نحن
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/30 rounded-full" />
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-loose mb-8 max-w-3xl">
            نحن شركة استثمارية متخصصة في توفير حلول الاستثمار المبتكرة والمستدامة
            لمستثمرينا الكرام. يقع مقرنا في المملكة العربية السعودية، منطقة
            المدينة المنورة، ونتميز بفريق من الخبراء ذوي الخبرة في مجالات تجارية
            مختلفة.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
            <a
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors"
              href="#"
              aria-label="X"
            >
              <span className="font-bold">X</span>
            </a>
            <a
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors"
              href="#"
              aria-label="Instagram"
            >
              <span className="material-icons">camera_alt</span>
            </a>
          </div>
          <Link
            className="inline-block bg-gradient-to-r from-primary to-[#c49b60] text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            href="#"
          >
            تعرف علينا أكثر
          </Link>
        </div>
      </div>
    </section>
  );
}
