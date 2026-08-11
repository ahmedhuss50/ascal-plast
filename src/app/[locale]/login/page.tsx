import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import LoginForm from "./LoginForm";

export default function LoginPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-brand-soft to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto mb-2 w-full max-w-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Ascal Houseware" className="w-full h-auto block" />
          </div>
          <p className="text-sm text-slate-500">{d.appTagline}</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800">{d.auth.welcome}</h2>
          <p className="text-sm text-slate-500 mb-4">{d.auth.loginSubtitle}</p>
          <LoginForm locale={params.locale} dict={d} />
        </div>
      </div>
    </main>
  );
}
