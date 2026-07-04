const items = [
  {
    "title": "I Live Free \u00b7 KK01 \u00b7 Ch1",
    "line": "Chorus 1 \u00b7 TPR row TPR_KKR_BATCH_003_50_0001 \u00b7 source window 0.000\u201316.029s",
    "audio": "/i-live-free-july4/audio/ilf-kk01-ch1-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK02 \u00b7 Tag",
    "line": "Tag \u00b7 TPR row TPR_KKR_BATCH_003_50_0002 \u00b7 source window 16.029\u201323.105s",
    "audio": "/i-live-free-july4/audio/ilf-kk02-tag-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK03 \u00b7 V1",
    "line": "Verse 1 \u00b7 TPR row TPR_KKR_BATCH_003_50_0003 \u00b7 source window 23.105\u201352.465s",
    "audio": "/i-live-free-july4/audio/ilf-kk03-v1-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK04 \u00b7 Ch2",
    "line": "Chorus 2 \u00b7 TPR row TPR_KKR_BATCH_003_50_0004 \u00b7 source window 52.465\u201368.150s",
    "audio": "/i-live-free-july4/audio/ilf-kk04-ch2-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK05 \u00b7 Tag",
    "line": "Tag \u00b7 TPR row TPR_KKR_BATCH_003_50_0005 \u00b7 source window 68.150\u201381.370s",
    "audio": "/i-live-free-july4/audio/ilf-kk05-tag-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK06 \u00b7 Bridge",
    "line": "Bridge \u00b7 TPR row TPR_KKR_BATCH_003_50_0006 \u00b7 source window 96.479\u2013114.709s",
    "audio": "/i-live-free-july4/audio/ilf-kk06-bridge-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK07 \u00b7 Tag",
    "line": "Tag \u00b7 TPR row TPR_KKR_BATCH_003_50_0007 \u00b7 source window 119.770\u2013123.020s",
    "audio": "/i-live-free-july4/audio/ilf-kk07-tag-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK08 \u00b7 Tag",
    "line": "Tag \u00b7 TPR row TPR_KKR_BATCH_003_50_0008 \u00b7 source window 94.006\u201396.356s",
    "audio": "/i-live-free-july4/audio/ilf-kk08-tag-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK09 \u00b7 Bridge Tight",
    "line": "Bridge alternate \u00b7 TPR row TPR_KKR_BATCH_003_50_0009 \u00b7 source window 100.121\u2013114.604s",
    "audio": "/i-live-free-july4/audio/ilf-kk09-bridge-tight-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK10 \u00b7 Tag",
    "line": "Tag \u00b7 TPR row TPR_KKR_BATCH_003_50_0010 \u00b7 source window 116.391\u2013121.339s",
    "audio": "/i-live-free-july4/audio/ilf-kk10-tag-dp-sti.mp3"
  },
  {
    "title": "I Live Free \u00b7 KK11 \u00b7 Final Chorus",
    "line": "Final Chorus \u00b7 TPR row TPR_KKR_BATCH_003_50_0011 \u00b7 source window 121.339\u2013146.855s",
    "audio": "/i-live-free-july4/audio/ilf-kk11-final-chorus-dp-sti.mp3"
  }
];

export default function ILiveFreeJuly4Page() {
  return (
    <main className="min-h-screen bg-[#07070a] px-5 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            G Putnam Music · K-KUT · July 4
          </p>

          <h1 className="mt-5 text-5xl font-black tracking-tight">
            I Live Free
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/75">
            Eleven rebuilt K-KUT moments from the exact I Live Free parent WAV
            and exact TPR row windows. No filename search. No wrong-title audio.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {items.map((item, index) => (
            <section
              key={item.audio}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/45">
                I Live Free II {index + 1}
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#FFD54F]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">{item.line}</p>
              <audio className="mt-5 w-full" controls src={item.audio} />
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/60">
          © G Putnam Music. K-KUT promo audio prepared through GPM release gate.
        </p>
      </section>
    </main>
  );
}
