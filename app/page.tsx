import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" />

      <div className="glass relative z-10 flex w-full max-w-md flex-col items-center gap-6 rounded-2xl p-8 text-center shadow-2xl border border-gray-200">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            GourmetOS
          </h1>
          <p className="text-sm text-gray-600">
            The ultimate operating system for modern restaurants
          </p>
          <div className="mt-2 inline-block">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-xl bg-white/80 p-4 text-left border border-gray-100">
          <div className="flex justify-between border-b border-gray-200 pb-2 text-sm">
            <span className="text-gray-500 font-medium">Framework</span>
            <span className="font-mono text-gray-900">Next.js 14</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2 text-sm">
            <span className="text-gray-500 font-medium">Styling</span>
            <span className="font-mono text-gray-900">Tailwind CSS</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Mode</span>
            <span className="text-blue-600 font-semibold">Demo</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-black font-semibold text-white transition-all hover:bg-gray-800 active:scale-95 shadow-lg"
        >
          Enter Dashboard →
        </Link>

        <p className="text-xs text-gray-400 mt-2">
          No login required in demo mode
        </p>
      </div>
    </div>
  );
}
