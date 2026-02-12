import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { InvestSection } from "../components/InvestSection";
import { ChairmanQuote } from "../components/ChairmanQuote";
import { ValuesCards } from "../components/ValuesSection";

export default function InvestPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300">
            <Header />
            <main>
                {/* Hero Banner */}
                <section className="relative overflow-hidden">
                    {/* Background image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/wallpaper.png')" }}
                    />
                    <div className="absolute inset-0 bg-secondary/85 dark:bg-black/80" />

                    <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 text-center">
                        {/* Decorative line */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="h-[2px] w-16 bg-primary/60" />
                            <span className="material-icons text-primary text-3xl">trending_up</span>
                            <div className="h-[2px] w-16 bg-primary/60" />
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            استثمر مع
                            <span className="text-primary"> مجموعة روائس</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                            نوفر لك فرص استثمارية مبتكرة ومستدامة لتحقيق أعلى العوائد مع أعلى
                            معايير الشفافية والأمان
                        </p>

                        {/* Stats row */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">+15</div>
                                <div className="text-sm text-gray-400">سنة خبرة</div>
                            </div>
                            <div className="w-px h-16 bg-primary/30 hidden md:block" />
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">+500</div>
                                <div className="text-sm text-gray-400">مستثمر</div>
                            </div>
                            <div className="w-px h-16 bg-primary/30 hidden md:block" />
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">4</div>
                                <div className="text-sm text-gray-400">قطاعات استثمارية</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom wave */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            <path d="M0 60V30C360 0 720 0 1080 30C1260 45 1440 60 1440 60H0Z" className="fill-background-light dark:fill-background-dark" />
                        </svg>
                    </div>
                </section>

                {/* Invest Section — card + plant */}
                <InvestSection />

                {/* Chairman Quote */}
                <ChairmanQuote />

                {/* Values Cards */}
                <section className="py-20 relative overflow-hidden bg-gray-50 dark:bg-[#0B1120]">
                    <div className="container mx-auto px-4 text-center mb-12">
                        <h2 className="text-4xl font-bold text-primary mb-4">قيمنا</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            القيم التي نؤمن بها وتوجه مسيرتنا الاستثمارية
                        </p>
                    </div>
                    <ValuesCards />
                </section>
            </main>
            <Footer />
        </div>
    );
}
