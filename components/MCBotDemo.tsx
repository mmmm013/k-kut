"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StepKey =
  | "welcome"
  | "feeling"
  | "options"
  | "feedback"
  | "recipient"
  | "pronouns"
  | "timing"
  | "confirm";

type Moment = {
  id?: string | null;
  display_label?: string;
  delivery_unit_type?: "KUT" | "mK" | "LLF" | string;
  audio_available?: boolean;
};

type MomentResponse = {
  count?: number;
  moments?: Moment[];
  error?: string;
};

const FEELINGS = [
  "Support",
  "Love",
  "Thinking of you",
  "You’ve got this",
  "I’m here",
  "Proud of you",
  "Breathe",
  "Comfort",
];

const FEEDBACK = [
  "Softer",
  "Stronger",
  "Shorter",
  "Warmer",
  "Less romantic",
  "More heartfelt",
];

const PRONOUNS = [
  { label: "She/her", value: "she/her" },
  { label: "He/him", value: "he/him" },
  { label: "They/them", value: "they/them" },
  { label: "Use name only", value: "name-only" },
];

const STEPS: { key: StepKey; title: string }[] = [
  { key: "welcome", title: "Welcome" },
  { key: "feeling", title: "Feeling" },
  { key: "options", title: "Options" },
  { key: "feedback", title: "Feedback" },
  { key: "recipient", title: "Recipient" },
  { key: "pronouns", title: "Pronouns" },
  { key: "timing", title: "Timing" },
  { key: "confirm", title: "Confirm" },
];

function safeLabel(moment: Moment, index: number) {
  const type = moment.delivery_unit_type || "KUT";
  if (moment.display_label) return moment.display_label;
  if (type === "mK" || type === "LLF" || type === "LFL") return `shortKUT ${index + 1}`;
  
  return `KUT ${index + 1}`;
}

function groupMoments(moments: Moment[]) {
  return {
    recommended: moments.slice(0, 1),
    shortKuts: moments.filter((m) => m.delivery_unit_type === "mK" || m.delivery_unit_type === "LLF" || m.delivery_unit_type === "LFL").slice(0, 6),
    full: moments
      .filter((m) => !m.delivery_unit_type || m.delivery_unit_type === "KUT")
      .slice(0, 3),
    hiddenInternalShortKuts: [].slice(0, 0),
  };
}

function OptionCard({
  moment,
  index,
  prefix,
  onChoose,
}: {
  moment: Moment;
  index: number;
  prefix: string;
  onChoose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      className="rounded border border-[#D4A017]/30 bg-black/40 p-4 text-left transition hover:border-[#D4A017]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4A017]">
        {prefix}
      </p>
      <p className="mt-2 text-base font-black text-[#FFF2CF]">
        {safeLabel(moment, index)}
      </p>
      <p className="mt-2 text-sm text-[#E8CFA8]/80">
        {moment.audio_available
          ? "Approved KUT audio available"
          : "Awaiting approved KUT audio"}
      </p>
    </button>
  );
}

export default function MCBotDemo() {
  const [step, setStep] = useState<StepKey>("welcome");
  const [feeling, setFeeling] = useState("Support");
  const [moments, setMoments] = useState<Moment[]>([]);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [feedback, setFeedback] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [timing, setTiming] = useState("Send now");
  const [loading, setLoading] = useState(false);
  const [botLine, setBotLine] = useState(
    "MC is arriving. I’ll guide this one step at a time."
  );
  const [voiceStatus, setVoiceStatus] = useState("Voice preparing.");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const introPlayedRef = useRef(false);

  const groups = useMemo(() => groupMoments(moments), [moments]);

  function stopVoice() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  function wait(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function playOne(line: string, clip: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve();

      stopVoice();
      setBotLine(`MC: ${line}`);

      const audio = new Audio(clip);
      audioRef.current = audio;

      audio.onplay = () => setVoiceStatus("MC voice playing.");
      audio.onended = () => {
        setVoiceStatus("MC voice ready.");
        resolve();
      };
      audio.onerror = () => {
        setVoiceStatus("Voice clip could not play. Visual guidance is active.");
        resolve();
      };

      audio.play().catch(() => {
        setVoiceStatus("Browser blocked auto-voice. Visual guidance is active.");
        resolve();
      });
    });
  }

  async function playOpening() {
    if (introPlayedRef.current) return;
    introPlayedRef.current = true;

    setStep("welcome");

    await wait(400);
    await playOne("Welcome. I’m MC.", "/bot/bb/33-welcome.m4a");

    await wait(650);
    await playOne(
      "You do not need to figure this out. I’ll guide this one step at a time.",
      "/bot/bb/20-listen-first.m4a"
    );

    await wait(650);
    setStep("feeling");
    await playOne(
      "First, choose the feeling this HUG should carry.",
      "/bot/bb/07-choose-feel.m4a"
    );

    setVoiceStatus("MC is waiting for your selection.");
  }

  async function loadMoments(nextFeeling: string) {
    setLoading(true);

    try {
      const res = await fetch(`/api/bot/moments?q=${encodeURIComponent(nextFeeling)}`);
      const data: MomentResponse = await res.json();
      const next = data.moments || [];
      setMoments(next);

      setStep("options");

      if (next.length > 0) {
        await playOne(
          `Good. I found ${next.length} safe option${next.length === 1 ? "" : "s"}. Start with Recommended, then compare shortKUTs and KUTs.`,
          "/bot/bb/09-good-choice-selected.m4a"
        );
      } else {
        await playOne(
          "I’m not finding public-ready options yet. I’ll keep this safe.",
          "/bot/bb/18-i-m-not-sure.m4a"
        );
      }
    } catch {
      setMoments([]);
      await playOne(
        "I could not load options right now. I’ll keep delivery blocked until safe options are available.",
        "/bot/bb/18-i-m-not-sure.m4a"
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseFeeling(item: string) {
    setFeeling(item);
    setSelectedMoment(null);
    setFeedback("");
    loadMoments(item);
  }

  async function chooseMoment(moment: Moment) {
    setSelectedMoment(moment);
    setStep("feedback");
    await playOne(
      "Good choice. Tell me what to adjust, or keep this direction.",
      "/bot/bb/09-good-choice-selected.m4a"
    );
  }

  async function chooseFeedback(item: string) {
    setFeedback(item);
    setStep("recipient");

    const clip =
      item === "Softer"
        ? "/bot/bb/13-good-soft-gentle.m4a"
        : item === "Stronger"
          ? "/bot/bb/14-good-strongest.m4a"
          : "/bot/bb/15-good-let-s-find.m4a";

    await playOne(
      `Good. I’ll make it ${item.toLowerCase()}. Now, who is this for?`,
      clip
    );
  }

  async function continueRecipient() {
    if (!recipientName.trim()) {
      await playOne("Try one name first.", "/bot/bb/31-try-one-feeling.m4a");
      return;
    }

    setStep("pronouns");
    await playOne(
      `Good. What pronouns should I use for ${recipientName.trim()}?`,
      "/bot/bb/10-good-choice.m4a"
    );
  }

  async function choosePronouns(value: string) {
    setPronouns(value);
    setStep("timing");

    await playOne(
      value === "name-only"
        ? `Good. I’ll use ${recipientName.trim()}'s name and avoid pronouns. Timing matters.`
        : `Good. I’ll use ${value}. Timing matters.`,
      "/bot/bb/10-good-choice.m4a"
    );
  }

  async function chooseTiming(value: string) {
    setTiming(value);
    setStep("confirm");

    await playOne(
      value === "Send now"
        ? "Good. I’ll prepare this to send now."
        : "Good. You can schedule this if the moment needs care.",
      "/bot/bb/17-if-you-want-to-send-today.m4a"
    );
  }

  useEffect(() => {
    playOpening();

    return () => stopVoice();
  }, []);

  return (
    <div className="rounded border border-[#D4A017]/30 bg-[#0E0E0E] p-6">
      <h3 className="text-lg font-semibold text-[#D4A017]">
        MC Guided Flow
      </h3>

      <p className="mt-3 text-[#E8CFA8]">
        MC guides every step. You only choose what feels closest.
      </p>

      <div className="mt-5 grid gap-2 md:grid-cols-8">
        {STEPS.map((item, index) => (
          <div
            key={item.key}
            className={`rounded border p-2 text-center text-xs font-black ${
              step === item.key
                ? "border-[#D4A017] bg-[#D4A017] text-black"
                : "border-[#333] bg-black/30 text-[#777]"
            }`}
          >
            <div>Step {index + 1}</div>
            <div>{item.title}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded border border-[#333] bg-black/40 p-4 text-[#E8CFA8]">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4A017]">
          Current activity
        </p>
        <p className="mt-2">{botLine}</p>
        <p className="mt-2 text-xs text-[#777]">{voiceStatus}</p>
      </div>

      <div className="mt-6 rounded border border-[#D4A017]/20 bg-black/30 p-4">
        {step === "welcome" ? (
          <p className="text-[#E8CFA8]">MC is opening the flow.</p>
        ) : null}

        {step === "feeling" ? (
          <div>
            <p className="font-black text-[#D4A017]">
              Choose the feeling this HUG should carry.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FEELINGS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseFeeling(item)}
                  className={`rounded border px-3 py-2 text-sm font-bold ${
                    feeling === item
                      ? "border-[#D4A017] bg-[#D4A017] text-black"
                      : "border-[#D4A017]/50 text-[#D4A017]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "options" ? (
          <div>
            <p className="font-black text-[#D4A017]">
              Pick the option that feels closest.
            </p>
            {loading ? (
              <p className="mt-3 text-sm text-[#E8CFA8]/70">
                MC is loading safe options...
              </p>
            ) : null}

            <div className="mt-5 space-y-6">
              <div>
                <h4 className="font-black text-[#D4A017]">Recommended</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {groups.recommended.length ? (
                    groups.recommended.map((moment, index) => (
                      <OptionCard
                        key={`rec-${moment.id || index}`}
                        moment={moment}
                        index={index}
                        prefix="Best match"
                        onChoose={() => chooseMoment(moment)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-[#777]">No recommended option is public-ready yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-black text-[#D4A017]">shortKUTs</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {groups.shortKuts.length ? (
                    groups.shortKuts.map((moment, index) => (
                      <OptionCard
                        key={`mini-${moment.id || index}`}
                        moment={moment}
                        index={index}
                        prefix={`shortKUT ${index + 1}`}
                        onChoose={() => chooseMoment(moment)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-[#777]">shortKUTs are not public-ready yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-black text-[#D4A017]">KUTs</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {groups.full.length ? (
                    groups.full.map((moment, index) => (
                      <OptionCard
                        key={`full-${moment.id || index}`}
                        moment={moment}
                        index={index}
                        prefix={`KUT ${index + 1}`}
                        onChoose={() => chooseMoment(moment)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-[#777]">KUTs are not public-ready yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : null}

        {step === "feedback" ? (
          <div>
            <p className="font-black text-[#D4A017]">
              Tell MC what to adjust.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FEEDBACK.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseFeedback(item)}
                  className="rounded border border-[#D4A017]/50 px-3 py-2 text-sm font-bold text-[#D4A017]"
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() => chooseFeedback("Keep this direction")}
                className="rounded border border-[#D4A017] bg-[#D4A017] px-3 py-2 text-sm font-bold text-black"
              >
                Keep this direction
              </button>
            </div>
          </div>
        ) : null}

        {step === "recipient" ? (
          <div>
            <p className="font-black text-[#D4A017]">Who is this for?</p>
            <input
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Recipient name"
              className="mt-3 w-full rounded border border-[#333] bg-black p-3 text-[#FFF2CF]"
            />
            <button
              type="button"
              onClick={continueRecipient}
              className="mt-3 rounded border border-[#D4A017] bg-[#D4A017] px-4 py-2 font-black text-black"
            >
              Continue
            </button>
          </div>
        ) : null}

        {step === "pronouns" ? (
          <div>
            <p className="font-black text-[#D4A017]">
              What pronouns should MC use?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRONOUNS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => choosePronouns(item.value)}
                  className="rounded border border-[#D4A017]/50 px-3 py-2 text-sm font-bold text-[#D4A017]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "timing" ? (
          <div>
            <p className="font-black text-[#D4A017]">Send now or schedule?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Send now", "Schedule"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseTiming(item)}
                  className="rounded border border-[#D4A017]/50 px-3 py-2 text-sm font-bold text-[#D4A017]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "confirm" ? (
          <div>
            <p className="font-black text-[#D4A017]">Confirm the HUG</p>
            <div className="mt-3 space-y-2 text-sm text-[#E8CFA8]">
              <p>Feeling: {feeling}</p>
              <p>Adjustment: {feedback || "Keep this direction"}</p>
              <p>Recipient: {recipientName || "Not set"}</p>
              <p>Pronouns: {pronouns || "Not set"}</p>
              <p>Timing: {timing}</p>
            </div>
            <p className="mt-4 text-xs text-[#777]">
              This HUG stays controlled. No source titles, artist names, company names, or audio URLs are exposed.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
