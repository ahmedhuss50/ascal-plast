import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import LoginForm from "./LoginForm";

export default function LoginPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-brand-soft to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand text-white font-bold text-xl mb-3">
            AP
          </div>
          <h1 className="text-2xl font-bold text-brand">{d.appName}</h1>
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
