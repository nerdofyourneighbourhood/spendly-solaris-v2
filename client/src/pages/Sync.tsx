interface SyncProps {
  isSyncing: boolean;
  onSync: (text: string) => void;
}

export default function Sync({ isSyncing, onSync }: SyncProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-white">Neural Command</h2>
      
      <div className="bg-[#1C1C1E] p-6 rounded-[32px] border border-white/10 mb-8">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Trigger Manual Sync</p>
        <div className="space-y-3">
          <button 
            onClick={() => onSync('Rapido ride 120')} 
            disabled={isSyncing}
            className="w-full bg-white/5 p-5 rounded-2xl flex items-center justify-between active:scale-95 transition-transform disabled:opacity-50 hover:bg-white/10"
          >
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-bold text-sm text-white">Force Rapido Sync</span>
            </div>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button 
            onClick={() => onSync('Zomato order 550')} 
            disabled={isSyncing}
            className="w-full bg-white/5 p-5 rounded-2xl flex items-center justify-between active:scale-95 transition-transform disabled:opacity-50 hover:bg-white/10"
          >
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6" />
              </svg>
              <span className="font-bold text-sm text-white">Force Zomato/Swiggy Sync</span>
            </div>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 border border-zinc-800 rounded-3xl text-center bg-[#1C1C1E]/50">
        <svg className="w-7 h-7 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-bold text-white">Encrypted Link Active</p>
        <p className="text-xs text-zinc-500 mt-1">Solaris is listening for Gmail and SMS metadata for Zomato, Swiggy, and Rapido.</p>
      </div>

      {/* Sync Status */}
      {isSyncing && (
        <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
            <p className="text-sm text-indigo-300 font-medium">Syncing new transaction...</p>
          </div>
        </div>
      )}
    </div>
  );
}
