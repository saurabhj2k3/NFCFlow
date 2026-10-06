import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
          <CreditCard className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">404 - Page Not Found</h1>
          <p className="text-xs text-slate-500">
            The card link or page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to NFCFlow Home</span>
          </Link>
          <p className="text-[11px] text-slate-400">
            Need help? Contact <a href="mailto:support.nfcflow@gmail.com" className="text-blue-600 hover:underline">support.nfcflow@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
