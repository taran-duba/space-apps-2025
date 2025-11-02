import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Privacy Policy • Clairify",
    description:
        "How Clairify collects, uses, and protects your information — GDPR/COPPA friendly with HIPAA‑style safeguards.",
    robots: {
        index: true,
        follow: true,
    },
};

const LAST_UPDATED = "November 2, 2025";

const sections = [
    { id: "intro", label: "Introduction" },
    { id: "info-we-collect", label: "Information We Collect" },
    { id: "services", label: "Technical Services We Use" },
    { id: "why", label: "Why We Collect This Info" },
    { id: "health", label: "Health‑Related Data" },
    { id: "location", label: "Location Data" },
    { id: "coppa", label: "Children’s Privacy (COPPA)" },
    { id: "gdpr", label: "GDPR Rights (EU/EEA)" },
    { id: "sharing", label: "Data Sharing" },
    { id: "retention", label: "Data Retention" },
    { id: "controls", label: "Your Controls" },
    { id: "security", label: "Data Security" },
    { id: "changes", label: "Changes to This Policy" },
    { id: "contact", label: "Contact Us" },
    { id: "tldr", label: "TL;DR" },
];

export default function Page() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0424] to-[#18314F] text-white flex flex-col items-center p-6">
            <Card className="w-full max-w-4xl border-white/20 bg-[#18314F] text-white shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Clairify Privacy Policy</CardTitle>
                    <p className="text-sm text-white/70">
                        Last updated: {LAST_UPDATED}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">

            {/* Callout Banner */}
            <div className="rounded-lg border border-white/20 bg-[#384E77]/50 p-4 text-sm text-white/90">
                <p>
                    Welcome to <span className="font-semibold">Clairify</span> (&#34;we,&#34; &#34;our,&#34; or
                    &#34;us&#34;). This Privacy Policy explains how we collect, use, and
                    protect your information when you use our app and website at
                    <span className="ml-1 font-mono">clairify.earth</span>.
                </p>
            </div>

            {/* Table of Contents */}
            <nav className="rounded-lg border border-white/20 bg-[#384E77]/30 p-4 text-sm">
                <p className="mb-2 font-semibold text-white">On this page</p>
                <ul className="grid gap-1 sm:grid-cols-2">
                    {sections.map((s) => (
                        <li key={s.id}>
                            <a 
                                className="text-white/80 hover:text-white hover:underline underline-offset-2" 
                                href={`#${s.id}`}
                            >
                                {s.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* 1. Intro */}
            <section id="intro" className="prose prose-invert max-w-none">
                <h2>Introduction</h2>
                <p>
                    By using Clairify, you agree to the practices described here. If you
                    have questions or concerns, reach out — we’re here to help.
                </p>
            </section>

            {/* 2. Information We Collect */}
            <section id="info-we-collect" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">1️⃣ Information We Collect</h2>
                <h3 className="text-lg font-medium text-white/90 mb-2">A. Information You Provide</h3>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg">
                    <li className="text-white/90">Email address (for login & account access)</li>
                    <li className="text-white/90">
                        Health info you choose to enter (optional): symptoms (e.g., cough,
                        shortness of breath, allergies), chronic conditions, sensitivity
                        levels (e.g., asthma, pollution triggers)
                    </li>
                    <li className="text-white/90">Messages you send us (support, bug reports, feedback)</li>
                </ul>
                <p>
                    We <strong>never</strong> ask for legal IDs, government numbers, or
                    medical records.
                </p>
                <h3 className="text-lg font-medium text-white/90 mt-6 mb-2">B. Information Collected Automatically</h3>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg">
                    <li className="text-white/90">Device & operating system information</li>
                    <li className="text-white/90">App interaction & diagnostics (e.g., crashes, feature usage)</li>
                    <li className="text-white/90">Approximate location (city/region) to determine nearby air quality</li>
                </ul>
                <p>We do <strong>not</strong> collect precise GPS coordinates or addresses.</p>
            </section>

            {/* 3. Technical Services */}
            <section id="services" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">2️⃣ Technical Services We Use</h2>
                <p className="mb-4">We use trusted partners to power the app:</p>
                <div className="overflow-x-auto rounded-lg border border-white/20">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#384E77]/50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-white/90 border-b border-white/20">Service</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-white/90 border-b border-white/20">Purpose</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-white/90 border-b border-white/20">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            <tr className="hover:bg-[#384E77]/20 transition-colors">
                                <td className="px-4 py-3 text-sm text-white/90"><strong>Supabase</strong></td>
                                <td className="px-4 py-3 text-sm text-white/80">Authentication & database</td>
                                <td className="px-4 py-3 text-sm text-white/70">Stores login & user‑submitted health inputs</td>
                            </tr>
                            <tr className="hover:bg-[#384E77]/20 transition-colors">
                                <td className="px-4 py-3 text-sm text-white/90"><strong>Crash/analytics tools</strong></td>
                                <td className="px-4 py-3 text-sm text-white/80">Diagnostics & performance</td>
                                <td className="px-4 py-3 text-sm text-white/70">Aggregated metrics; not used for ads</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p>
                    We only work with providers who follow strong security & privacy
                    standards.
                </p>
            </section>

            {/* 4. Why */}
            <section id="why" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">3️⃣ Why We Collect This Info</h2>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg">
                    <li className="text-white/90">Generate personalized respiratory insights from air quality</li>
                    <li className="text-white/90">Help you track symptom patterns over time</li>
                    <li className="text-white/90">Manage your profile & login securely</li>
                    <li className="text-white/90">Improve features and safety for all users</li>
                </ul>
                <p>
                    We <strong>do not sell</strong> your data and we do <strong>not</strong> use it for targeted advertising.
                </p>
            </section>

            {/* 5. Health Data */}
            <section id="health" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">4️⃣ Health‑Related Data</h2>
                <p className="text-white/90 mb-4">
                    Some information you enter may relate to your health. While Clairify is
                    not a medical provider and is not subject to the full scope of HIPAA
                    regulations, we treat health‑related data with HIPAA‑style safeguards:
                </p>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg">
                    <li className="text-white/90">Encryption in transit & at rest</li>
                    <li className="text-white/90">Strict access controls & auditability</li>
                    <li className="text-white/90">Limited personnel handling</li>
                </ul>
                <p>You control what you input and may delete it at any time.</p>
            </section>

            {/* 6. Location */}
            <section id="location" className="prose prose-invert mt-10 max-w-none">
                <h2>5️⃣ Location Data</h2>
                <p>
                    We use general, non‑precise location (city/region) to match you with
                    nearby air quality stations — not exact GPS. You can disable location
                    permissions, though some features may not function.
                </p>
            </section>

            {/* 7. COPPA */}
            <section id="coppa" className="prose prose-invert mt-10 max-w-none">
                <h2>6️⃣ Children’s Privacy (COPPA)</h2>
                <p>
                    Clairify is not intended for children under 13. If we learn that we’ve
                    collected data from a child under 13, we will delete the account and
                    associated data promptly. Parents or guardians may contact us to
                    request deletion.
                </p>
            </section>

            {/* 8. GDPR */}
            <section id="gdpr" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">7️⃣ GDPR Rights (EU/EEA)</h2>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg">
                    <li className="text-white/90">Right to access your data</li>
                    <li className="text-white/90">Right to correct or update it</li>
                    <li className="text-white/90">Right to request deletion (&quot;right to be forgotten&quot;)</li>
                    <li className="text-white/90">Right to withdraw consent</li>
                    <li>Right to data portability</li>
                </ul>
                <p>We honor these rights without unnecessary friction.</p>
            </section>

            {/* 9. Sharing */}
            <section id="sharing" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">8️⃣ Data Sharing</h2>
                <p className="text-white/90 mb-3">We only share your data when necessary:</p>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg mb-4">
                    <li className="text-white/90">With service providers who help us operate (under strict agreements)</li>
                    <li className="text-white/90">If required by law or to protect rights/safety</li>
                    <li className="text-white/90">In aggregated, non-identifiable form for research</li>
                </ul>
                <p>We <strong>never</strong> sell personal information.</p>
            </section>

            {/* 10. Retention */}
            <section id="retention" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">9️⃣ Data Retention</h2>
                <p className="text-white/90 mb-3">We keep your data only as long as needed:</p>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg mb-4">
                    <li className="text-white/90"><span className="font-medium">Account data:</span> Until you delete your account</li>
                    <li className="text-white/90"><span className="font-medium">Backups:</span> Securely deleted within 30 days</li>
                    <li className="text-white/90"><span className="font-medium">Aggregated data:</span> Indefinitely, as it cannot identify you</li>
                </ul>
            </section>

            {/* 11. Controls */}
            <section id="controls" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">🔟 Your Controls</h2>
                <p className="text-white/90 mb-3">You can:</p>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg mb-4">
                    <li className="text-white/90">Update your profile anytime</li>
                    <li className="text-white/90">Delete your account (which removes all personal data)</li>
                    <li className="text-white/90">Opt out of non-essential communications</li>
                    <li className="text-white/90">Disable location services at the device level</li>
                </ul>
            </section>

            {/* 12. Security */}
            <section id="security" className="mt-10">
                <h2 className="text-xl font-semibold mb-4">1️⃣1️⃣ Data Security</h2>
                <p className="text-white/90 mb-3">We take security seriously:</p>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-[#4A90E2] marker:text-lg mb-4">
                    <li className="text-white/90">Encryption in transit (TLS) and at rest (AES-256)</li>
                    <li className="text-white/90">Regular security audits</li>
                    <li className="text-white/90">Limited employee access on a need-to-know basis</li>
                </ul>
                <p>No system is 100% secure, but we implement industry best practices.</p>
            </section>

            {/* 13. Changes */}
            <section id="changes" className="prose prose-invert mt-10 max-w-none">
                <h2>1️⃣2️⃣ Changes to This Policy</h2>
                <p>We&apos;ll notify you of significant changes via email or in-app notice. Your continued use means you accept the updated policy.</p>
            </section>

            {/* 14. Contact */}
            <section id="contact" className="prose prose-invert mt-10 max-w-none">
                <h2>1️⃣3️⃣ Contact Us</h2>
                <p>Questions? Reach out at <a href="mailto:privacy@clairify.earth" className="text-white underline">privacy@clairify.earth</a>.</p>
            </section>

            {/* 15. TL;DR */}
            <section id="tldr" className="prose prose-invert mt-10 max-w-none">
                <h2>TL;DR</h2>
                <p>We respect your privacy. We only collect what&apos;s necessary, protect it seriously, and give you control. No ads, no selling data.</p>
            </section>

            <div className="mt-10 pt-6 border-t border-white/10 text-sm text-white/70">
                <p>© {new Date().getFullYear()} Clairify. All rights reserved.</p>
            </div>
                </CardContent>
            </Card>
        </div>
    );
}
