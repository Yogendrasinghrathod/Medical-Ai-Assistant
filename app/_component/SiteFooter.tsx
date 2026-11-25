import { Stethoscope } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="size-4" />
            </span>
            <span className="font-semibold">AI Medical</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Voice consultations with AI specialists and saved session reports.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Developer</h2>
          <p className="mt-3 text-sm text-foreground">Yogendra Singh Rathod</p>
          <a
            href="mailto:yogendra.engineervit@gmail.com"
            className="mt-1 block text-sm text-primary hover:underline"
          >
            yogendra.engineervit@gmail.com
          </a>
          <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="/#how-it-works" className="hover:text-foreground">
              How it works
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Disclaimer</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This app is an educational demo. It is not a licensed clinic and does
            not provide diagnosis, prescriptions, or emergency care. AI answers
            can be incomplete or incorrect. For urgent symptoms, call your local
            emergency number. Always consult a qualified healthcare professional
            for medical decisions.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground md:px-6">
          © {new Date().getFullYear()} Yogendra Singh Rathod. For learning and
          demonstration only.
        </p>
      </div>
    </footer>
  );
}
