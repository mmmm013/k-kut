"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupePage() {
  // SB (SUPE-BOT) state
  const [sbOpen, setSbOpen] = useState(false);
  const [sbStep, setSbStep] = useState<"intro"|"q1"|"q2"|"q3"|"q4"|"done">("intro");
  const [answers, setAnswers] = useState({
    notWorking: "",
    wouldHelp: "",
    returnIfSolved: "",
    outcome: ""
  });

  // Request form
  const [project, setProject] = useState("");
  const [email, setEmail] = useState("");
  const [need, setNeed] = useState("");
  const [deadline, setDeadline] = useState("");

  // Build mailto links
  const reqSubject = encodeURIComponent("SUPE Specialties Placement Request");
  const reqBody = encodeURIComponent(
`SUPE Specialties Request

Project / Company:
${project}

Contact Email:
${email}

Placement Need:
${need}

Deadline:
${deadline}

Access Interest:
Monthly trial / placement review

Sent from k-kut.com/supe`
  );
  const reqMailto = `mailto:reachus@gputnammusic.com?subject=${reqSubject}&body=${reqBody}`;

  const exitSubject = encodeURIComponent("SUPE Specialties Cancellation / Uninstall");
  const exitBody = encodeURIComponent(
`Cancellation / Uninstall Request

Answers:
1) What did not work:
${answers.notWorking}

2) What would have made it useful:
${answers.wouldHelp}

3) If solved, would you return:
${answers.returnIfSolved}

4) Outcome (earn/save time/find better moments):
${answers.outcome}

Policy:
Cancel anytime. No penalty.
Prorated refund may apply for unused time.

Contact:
reachus@gputnammusic.com

Sent from k-kut.com/supe`
  );
  const exitMailto = `mailto:reachus@gputnammusic.com?subject=${exitSubject}&body=${exitBody}`;

  return (
    <main className="min-h-screen bg-[#1A120B] text-[#F5E6C8]">
      {/* Header */}
      <header className="border-b border-[#D4A017]/20 px-6 py-4 flex justify-between">
        <div className="font-bold text-[#D4A017]">SUPE Specialties</div>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-[#D4A017]">Home</Link>
          <Link href="/find" className="hover:text-[#D4A017]">Browse Moments</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-[#C8A882]">
          Powered by 4PE PROMOTER
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Placement-ready music moments for supervisors.
        </h1>

        <p className="mt-4 text-[#E8CFA8] max-w-2xl">
          Find real-audio moments for film, television, advertising, trailers,
          digital content, and branded stories. Start monthly. Cancel anytime.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="#request"
            className="px-6 py-3 bg-[#D4A017] text-black font-semibold rounded text-center"
          >
            Start Monthly Access
          </a>
          <a
            href="#request"
            className="px-6 py-3 border border-[#D4A017]/40 rounded text-center"
          >
            Request Placement Review
          </a>
        </div>
      </section>

      {/* What supervisors can do */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6">What supervisors can do</h2>
        <div className="grid gap-4">
          {[
            "Describe a scene, cue, campaign, or emotional need",
            "Search real-audio placement moments",
            "Preview and shortlist options",
            "Request a placement review or custom moment",
          ].map((step, i) => (
            <div key={i} className="p-4 border border-[#D4A017]/20 rounded bg-[#24180F]">
              <span className="text-[#D4A017] font-bold mr-2">{i + 1}.</span>
              {step}
            </div>
          ))}
        </div>
      </section>

      {/* Access */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6">Access</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-5 border border-[#D4A017]/20 rounded bg-[#24180F]">
            <h3 className="font-bold mb-2">Monthly</h3>
            <p className="text-sm text-[#C8A882]">
              Full access. Cancel anytime, effective end of month.
            </p>
          </div>
          <div className="p-5 border border-[#D4A017]/20 rounded bg-[#24180F]">
            <h3 className="font-bold mb-2">Trial</h3>
            <p className="text-sm text-[#C8A882]">
              30-day trial. Use fully for 14 days before billing begins.
            </p>
          </div>
          <div className="p-5 border border-[#D4A017]/20 rounded bg-[#24180F]">
            <h3 className="font-bold mb-2">Enterprise</h3>
            <p className="text-sm text-[#C8A882]">
              Licensing or full acquisition available under premium terms.
            </p>
          </div>
        </div>
      </section>

      {/* Request */}
      <section id="request" className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-2xl font-bold mb-4">Start a supervisor request</h2>
        <p className="text-[#C8A882] mb-6">
          Tell us what you need. This opens a ready-to-send email request.
        </p>

        <div className="grid gap-4 bg-[#24180F] border border-[#D4A017]/20 rounded p-5">
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Project / company name"
            className="p-3 rounded bg-[#1A120B] border border-[#D4A017]/20 text-[#F5E6C8]"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="p-3 rounded bg-[#1A120B] border border-[#D4A017]/20 text-[#F5E6C8]"
          />
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder='Example: "warm romantic lead-in for 30-second branded spot"'
            className="p-3 rounded bg-[#1A120B] border border-[#D4A017]/20 text-[#F5E6C8] min-h-28"
          />
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="Deadline / timing"
            className="p-3 rounded bg-[#1A120B] border border-[#D4A017]/20 text-[#F5E6C8]"
          />
          <a
            href={reqMailto}
            className="px-6 py-3 bg-[#D4A017] text-black font-semibold rounded text-center"
          >
            Send Supervisor Request
          </a>
        </div>
      </section>

      {/* Cancel / Uninstall */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-2xl font-bold mb-4">Cancel or uninstall</h2>
        <p className="text-[#C8A882] mb-4">
          Cancel anytime. No penalty. Prorated refund may apply for unused time.
          Before closing access, SUPE-BOT will ask 4 brief questions to help us improve.
        </p>

        <button
          onClick={() => { setSbOpen(true); setSbStep("intro"); }}
          className="px-6 py-3 border border-[#D4A017]/40 rounded"
        >
          Open SUPE-BOT (SB)
        </button>
      </section>

      {/* SB Panel */}
      {sbOpen && (
        <div className="fixed bottom-4 right-4 w-[340px] bg-[#24180F] border border-[#D4A017]/30 rounded-xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <div className="font-bold text-[#D4A017]">SUPE-BOT (SB)</div>
            <button onClick={() => setSbOpen(false)} className="text-sm text-[#C8A882]">Close</button>
          </div>

          {/* Steps */}
          {sbStep === "intro" && (
            <div className="space-y-3">
              <p className="text-sm text-[#E8CFA8]">
                I’ll ask 4 brief questions before closing access. Ready?
              </p>
              <button onClick={() => setSbStep("q1")} className="px-4 py-2 bg-[#D4A017] text-black rounded w-full">
                Start
              </button>
            </div>
          )}

          {sbStep === "q1" && (
            <div className="space-y-3">
              <p className="text-sm">1) What did not work?</p>
              <textarea
                value={answers.notWorking}
                onChange={(e)=>setAnswers({...answers, notWorking:e.target.value})}
                className="w-full p-2 rounded bg-[#1A120B] border border-[#D4A017]/20"
              />
              <button onClick={() => setSbStep("q2")} className="px-4 py-2 bg-[#D4A017] text-black rounded w-full">
                Next
              </button>
            </div>
          )}

          {sbStep === "q2" && (
            <div className="space-y-3">
              <p className="text-sm">2) What would have made it useful?</p>
              <textarea
                value={answers.wouldHelp}
                onChange={(e)=>setAnswers({...answers, wouldHelp:e.target.value})}
                className="w-full p-2 rounded bg-[#1A120B] border border-[#D4A017]/20"
              />
              <button onClick={() => setSbStep("q3")} className="px-4 py-2 bg-[#D4A017] text-black rounded w-full">
                Next
              </button>
            </div>
          )}

          {sbStep === "q3" && (
            <div className="space-y-3">
              <p className="text-sm">3) If we solved that, would you return?</p>
              <input
                value={answers.returnIfSolved}
                onChange={(e)=>setAnswers({...answers, returnIfSolved:e.target.value})}
                className="w-full p-2 rounded bg-[#1A120B] border border-[#D4A017]/20"
              />
              <button onClick={() => setSbStep("q4")} className="px-4 py-2 bg-[#D4A017] text-black rounded w-full">
                Next
              </button>
            </div>
          )}

          {sbStep === "q4" && (
            <div className="space-y-3">
              <p className="text-sm">4) Did it help you earn, save time, or find better moments?</p>
              <input
                value={answers.outcome}
                onChange={(e)=>setAnswers({...answers, outcome:e.target.value})}
                className="w-full p-2 rounded bg-[#1A120B] border border-[#D4A017]/20"
              />
              <a
                href={exitMailto}
                onClick={()=>setSbStep("done")}
                className="px-4 py-2 bg-[#D4A017] text-black rounded w-full text-center block"
              >
                Submit & Email
              </a>
            </div>
          )}

          {sbStep === "done" && (
            <p className="text-sm text-[#E8CFA8]">
              Thank you. We’ll process cancellation and review for improvements.
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#D4A017]/20 px-6 py-6 text-sm text-[#C8A882] text-center">
        SUPE Specialties — Powered by 4PE PROMOTER
      </footer>
    </main>
  );
}
