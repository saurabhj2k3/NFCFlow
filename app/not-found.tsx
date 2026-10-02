import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
          <CreditCard className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">404 - Page Not Found</h1>
          <p className="text-xs text-slate-400">
            The card link or page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to NFCFlow Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
