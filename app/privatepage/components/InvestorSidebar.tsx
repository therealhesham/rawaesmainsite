type Contract = { id: string; name: string; number: string };

type Investor = {
  investorId: string;
  nationalId: string;
  name: string;
  contracts: Contract[];
};

export function InvestorSidebar({ investor }: { investor: Investor }) {
  return (
    <div className="space-y-6">
      {/* User/Investor card */}
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="Rawaes Group"
            className="w-20 h-20 object-contain"
          />
        </div>
        <p className="text-center text-text-dark dark:text-text-light font-medium text-lg">
          {investor.investorId}
        </p>
        <p className="text-center text-text-dark dark:text-text-light font-bold text-xl mt-1">
          {investor.name}
        </p>
        <p className="text-center text-text-dark/70 dark:text-text-light/70 text-sm mt-1">
          {investor.nationalId}
        </p>
      </div>

      {/* My Contracts */}
      <div className="bg-[#003749] rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold text-center mb-6">عقودي</h2>
        <ul className="space-y-4">
          {investor.contracts.map((contract) => (
            <li
              key={contract.id}
              className="flex flex-col gap-2 p-3 rounded-xl bg-white/5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {contract.name} {contract.number}
                </span>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#ecc383] text-[#003749] font-medium hover:bg-[#d4af79] transition-colors text-sm shrink-0"
                >
                  معاينة
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
