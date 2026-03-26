import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Cygnet",
  description: "How Cygnet handles profile data, storage, and user controls.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-brand-line/60 bg-brand-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-brand-ink">
            Cygnet
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong transition-colors hover:text-brand-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to website
        </Link>

        <div className="rounded-2xl border border-brand-line bg-white p-8 shadow-sm sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Cygnet Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-brand-muted">Last updated: March 9, 2026</p>

          <p className="mt-6 leading-relaxed text-brand-muted">
            Cygnet (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides a Chrome
            extension that helps users autofill job application forms.
          </p>

          {/* 1 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            1) What data Cygnet handles
          </h2>
          <p className="mt-2 leading-relaxed text-brand-muted">
            Cygnet may handle profile data that users choose to enter, including:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
            <li>Name fields (kanji, furigana, English)</li>
            <li>Preferred name</li>
            <li>Email address and mobile email address</li>
            <li>Phone number</li>
            <li>Birth date</li>
            <li>Gender</li>
            <li>Password (if user stores one)</li>
            <li>Address information (postal code, prefecture, city, address line 1, address line 2)</li>
            <li>Education and career profile fields (for example university, faculty, graduation year, company, links, and notes)</li>
            <li>Extension preferences (for example autofill enabled/disabled and panel state)</li>
          </ul>
          <p className="mt-3 leading-relaxed text-brand-muted">
            Cygnet also reads form field labels/attributes on pages where autofill is used so it can
            map your saved profile data to the correct form fields.
          </p>

          {/* 2 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            2) How data is collected
          </h2>
          <p className="mt-2 leading-relaxed text-brand-muted">Data is collected:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
            <li>When you manually enter or edit your profile in the extension settings</li>
            <li>When you use extension features such as Autofill, Refresh, and copy-to-clipboard from the profile panel</li>
            <li>From form structure metadata on the active page (for example input names, labels, placeholders, autocomplete attributes) to detect where to fill data</li>
          </ul>
          <p className="mt-3 leading-relaxed text-brand-muted">
            Cygnet does not require account creation and does not collect analytics or telemetry in its
            current version.
          </p>

          {/* 3 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            3) How data is used
          </h2>
          <p className="mt-2 leading-relaxed text-brand-muted">
            Data is used only to provide extension features, including:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
            <li>Autofilling forms on websites you visit</li>
            <li>Displaying your saved profile in the in-page panel and popup</li>
            <li>Copying profile values to your clipboard when you click copy targets</li>
            <li>Saving your preferences and profile for reuse</li>
          </ul>

          {/* 4 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            4) Data sharing and third parties
          </h2>
          <p className="mt-2 leading-relaxed text-brand-muted">
            Cygnet does not sell your personal data and does not share your profile data with
            advertising networks or data brokers.
          </p>
          <p className="mt-3 leading-relaxed text-brand-muted">
            Data may be shared only in the following ways:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
            <li>
              With websites where you choose to autofill forms (the data is inserted into those forms by
              your action)
            </li>
            <li>
              With Google Chrome storage infrastructure when Chrome Sync is enabled in your browser
              account (because extension settings may be stored in{" "}
              <code className="rounded bg-brand-bg px-1.5 py-0.5 text-xs font-medium text-brand-ink">
                chrome.storage.sync
              </code>
              )
            </li>
          </ul>
          <p className="mt-3 leading-relaxed text-brand-muted">
            No other third-party sharing is performed in the current version.
          </p>

          {/* 5 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            5) Data storage and retention
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
            <li>
              Data is stored in your browser extension storage (
              <code className="rounded bg-brand-bg px-1.5 py-0.5 text-xs font-medium text-brand-ink">
                chrome.storage.sync
              </code>{" "}
              or{" "}
              <code className="rounded bg-brand-bg px-1.5 py-0.5 text-xs font-medium text-brand-ink">
                chrome.storage.local
              </code>
              , depending on browser availability/settings)
            </li>
            <li>
              We do not operate a remote Cygnet backend for profile storage in the current version
            </li>
            <li>
              Data remains stored until you edit or delete it, remove browser sync data, or uninstall the
              extension
            </li>
          </ul>

          {/* 6 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            6) Permissions and access scope
          </h2>
          <p className="mt-2 leading-relaxed text-brand-muted">
            Cygnet requests extension permissions such as{" "}
            <code className="rounded bg-brand-bg px-1.5 py-0.5 text-xs font-medium text-brand-ink">
              storage
            </code>
            ,{" "}
            <code className="rounded bg-brand-bg px-1.5 py-0.5 text-xs font-medium text-brand-ink">
              activeTab
            </code>
            ,{" "}
            <code className="rounded bg-brand-bg px-1.5 py-0.5 text-xs font-medium text-brand-ink">
              scripting
            </code>
            , and host access to support autofill across many job sites.
          </p>
          <p className="mt-3 leading-relaxed text-brand-muted">
            These permissions are used only for user-facing autofill and profile features.
          </p>

          {/* 7 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">7) Security</h2>
          <p className="mt-2 leading-relaxed text-brand-muted">
            We aim to minimize data handling and keep processing local in the extension. However, no
            software environment is completely risk-free. Users should avoid storing highly sensitive
            secrets unless necessary and should keep their browser and operating system updated.
          </p>

          {/* 8 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            8) Your choices and controls
          </h2>
          <p className="mt-2 leading-relaxed text-brand-muted">You can:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
            <li>View, edit, or delete profile fields in the extension settings</li>
            <li>Toggle autofill behavior in the extension UI</li>
            <li>Uninstall the extension to stop all data handling by Cygnet</li>
            <li>Disable Chrome Sync (if desired) to avoid sync-based storage</li>
          </ul>

          {/* 9 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">9) Children</h2>
          <p className="mt-2 leading-relaxed text-brand-muted">
            Cygnet is not directed to children under 13, and we do not knowingly collect data from
            children.
          </p>

          {/* 10 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">
            10) Changes to this policy
          </h2>
          <p className="mt-2 leading-relaxed text-brand-muted">
            We may update this policy from time to time. Updated versions will be posted at this URL with
            a new &ldquo;Last updated&rdquo; date.
          </p>

          {/* 11 */}
          <h2 className="mt-10 text-lg font-semibold text-brand-ink">11) Contact</h2>
          <p className="mt-2 leading-relaxed text-brand-muted">For privacy questions, contact:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
            <li>Name/Company: Cygnet</li>
            <li>
              Email:{" "}
              <a
                href="mailto:markoguro@gmail.com"
                className="text-brand-strong underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand-ink"
              >
                markoguro@gmail.com
              </a>
            </li>
            <li>
              Website:{" "}
              <a
                href="https://magutoro.github.io/Cygnet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-strong underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand-ink"
              >
                https://magutoro.github.io/Cygnet/
              </a>
            </li>
          </ul>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-brand-line/60 bg-white/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <div className="text-sm font-semibold text-brand-ink">Cygnet</div>
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} Cygnet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
