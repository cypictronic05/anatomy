"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Compass,
  ExternalLink,
  FileText,
  Heart,
  LibraryBig,
  Microscope,
  NotebookPen,
  Play,
  Search,
  Share2,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import type { Messages } from "../../i18n/messages";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { OrganViewer } from "./OrganViewer";
import { useI18n } from "./I18nProvider";
import { organBases, type Organ, type OrganId } from "../lib/anatomy-data";

type Modal = "lesson" | "quiz" | "animation" | "system" | null;
type TranslatedHotspot = { label: string; detail: string };
type TranslatedOrgan = Omit<
  Organ,
  "id" | "scientificName" | "model" | "icon" | "accent" | "illustrated" | "hotspots"
> & {
  hotspots: Record<string, TranslatedHotspot>;
};
const CREDIT_LANGUAGES = [
  { locale: "en", flag: "🇺🇸" },
  { locale: "es", flag: "🇪🇸" },
  { locale: "fr", flag: "🇫🇷" },
  { locale: "de", flag: "🇩🇪" },
  { locale: "zh-CN", flag: "🇨🇳" },
] as const satisfies readonly { locale: keyof Messages["language"]["names"]; flag: string }[];

function OrganArt({
  organ,
  asset,
  alt,
  size,
}: {
  organ: Organ;
  asset: "thumb" | "organ" | "microscopic" | "compare" | "location";
  alt: string;
  size?: number;
}) {
  if (!organ.illustrated) {
    const labelling = alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };
    return (
      <span className="art-fallback" style={{ "--art-accent": organ.accent } as React.CSSProperties} {...labelling}>
        {organ.icon}
      </span>
    );
  }

  return (
    <img
      key={`${organ.id}-${asset}`}
      src={`/anatomy/${organ.id}/${asset}.webp`}
      alt={alt}
      width={size}
      height={size}
      loading={asset === "thumb" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

export function AnatomyApp() {
  const { messages, t } = useI18n();
  const [organId, setOrganId] = useState<OrganId>("heart");
  const [autoRotate, setAutoRotate] = useState(true);
  const [compare, setCompare] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [query, setQuery] = useState("");
  const [mobileLibrary, setMobileLibrary] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefetched = useRef(new Set<OrganId>());
  const organs = useMemo(() => localizeOrgans(messages), [messages]);
  const organById = useMemo(() => Object.fromEntries(organs.map((item) => [item.id, item])) as Record<OrganId, Organ>, [organs]);
  const organ = organById[organId];
  const reference = organById[organId === "heart" ? "brain" : "heart"];
  const filteredOrgans = useMemo(
    () =>
      organs.filter((item) =>
        `${item.name} ${item.system} ${item.scientificName}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [organs, query],
  );

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.48, stagger: 0.035, ease: "power2.out", overwrite: true },
    );
  }, [organId]);

  const selectOrgan = (id: OrganId) => {
    if (organById[id].illustrated) {
      ["organ", "microscopic", "compare", "location"].forEach((asset) => {
        const image = new Image();
        image.src = `/anatomy/${id}/${asset}.webp`;
      });
    }
    setOrganId(id);
    setMobileLibrary(false);
    setCompare(false);
  };

  const prefetchOrgan = (id: OrganId) => {
    if (id === organId || prefetched.current.has(id)) return;
    prefetched.current.add(id);
    void fetch(organById[id].model, { priority: "low" } as RequestInit).catch(() => {});
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => selectOrgan("heart")} aria-label={t("brand.homeLabel")}>
          <strong>{t("brand.name")}<sup>✦</sup></strong>
          <em>{t("brand.tagline")}</em>
        </button>
        <nav className="main-nav" aria-label={t("navigation.primaryLabel")}>
          <button type="button" className="active"><Compass size={17} /> <span>{t("navigation.explore")}</span></button>
          <button type="button"><BrainCircuit size={17} /> <span>{t("navigation.systems")}</span></button>
          <button type="button" onClick={() => setModal("lesson")}><BookOpen size={17} /> <span>{t("navigation.lessons")}</span></button>
          <button type="button"><LibraryBig size={17} /> <span>{t("navigation.library")}</span></button>
          <button type="button"><NotebookPen size={17} /> <span>{t("navigation.notes")}</span></button>
        </nav>
        <label className="search-box">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("common.searchPlaceholder")} />
        </label>
        <LanguageSwitcher />
        <button className="profile" type="button" aria-label={t("common.openLearnerProfile")}><span>MA</span><ChevronDown size={15} /></button>
        <button className="mobile-library-trigger" type="button" onClick={() => setMobileLibrary(true)} aria-label={t("common.openOrganLibrary")}><LibraryBig size={20} /></button>
      </header>

      <div className="workspace">
        <aside className={`organ-library ${mobileLibrary ? "open" : ""}`}>
          <div className="panel-heading">
            <span>{t("common.organLibrary")}</span>
            <button type="button" aria-label={t("common.closeLibrary")} className="mobile-close" onClick={() => setMobileLibrary(false)}><X size={17} /></button>
            <button type="button" aria-label={t("common.savedOrgans")}><Bookmark size={17} /></button>
          </div>
          <div className="organ-list">
            {filteredOrgans.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`organ-item ${organId === item.id ? "active" : ""}`}
                onClick={() => selectOrgan(item.id)}
                onPointerEnter={() => prefetchOrgan(item.id)}
                onFocus={() => prefetchOrgan(item.id)}
                style={{ "--item-accent": item.accent } as React.CSSProperties}
              >
                <span className="organ-glyph">
                  <OrganArt organ={item} asset="thumb" alt={t("alt.thumbnail", { organName: item.name })} size={47} />
                </span>
                <span><b>{item.name}</b><small>{item.system}</small></span>
                {organId === item.id && <Heart className="favorite" size={14} fill="currentColor" />}
              </button>
            ))}
          </div>
          <button type="button" className="view-all" onClick={() => setQuery("")}>{t("common.viewAllOrgans")} <ArrowRight size={14} /></button>
          <blockquote>
            <Sparkles size={18} />
            <p>{t("common.learningQuote")}</p>
            <em>{t("common.keepExploring")}</em>
          </blockquote>
        </aside>

        <OrganViewer
          organ={organ}
          autoRotate={autoRotate}
          onAutoRotate={setAutoRotate}
          compare={compare}
          onCompare={() => setCompare(!compare)}
        />

        <aside className="info-panel" ref={contentRef}>
          <div className="info-kicker" data-reveal><Heart size={13} fill="currentColor" /> {organ.name}</div>
          <div className="info-title-row" data-reveal>
            <div><h1>{organ.name}</h1><em>{organ.poetic}</em></div>
            <span className="specimen-stamp">
              <OrganArt organ={organ} asset="organ" alt={t("alt.anatomicalIllustration", { organName: organ.name })} size={92} />
            </span>
          </div>
          <p className="description" data-reveal>{organ.description}</p>
          <div className="rule" />
          <h2 data-reveal>{t("common.keyFacts")}</h2>
          <dl className="key-facts">
            <div data-reveal><dt><span>◇</span> {t("common.size")}</dt><dd>{organ.size}</dd></div>
            <div data-reveal><dt><span>♙</span> {t("common.weight")}</dt><dd>{organ.weight}</dd></div>
            <div data-reveal><dt><span>⌁</span> {t("common.daily")}</dt><dd>{organ.dailyFact}</dd></div>
            <div data-reveal><dt><span>⌖</span> {t("common.location")}</dt><dd>{organ.location}</dd></div>
            <div data-reveal><dt><span>❋</span> {t("common.bloodSupply")}</dt><dd>{organ.bloodSupply}</dd></div>
            <div data-reveal><dt><span>◆</span> {t("common.function")}</dt><dd>{organ.function}</dd></div>
          </dl>
          <div className="medical-note" data-reveal><Stethoscope size={16} /><p><b>{t("common.medicalImportance")}</b>{organ.medical}</p></div>
          <div className="fun-note" data-reveal><Sparkles size={15} /><p><b>{t("common.didYouKnow")}</b>{organ.funFact}</p></div>
          <button type="button" className="lesson-button" data-reveal onClick={() => setModal("lesson")}>{t("common.viewLesson")} <ArrowRight size={16} /></button>
          <div className="action-grid" data-reveal>
            <button type="button" onClick={() => setModal("animation")}><Play size={15} /> {t("common.animate")}</button>
            <button type="button" onClick={() => setModal("quiz")}><CircleHelp size={15} /> {t("common.quiz")}</button>
            <button type="button" onClick={() => setCompare(!compare)} className={compare ? "active" : ""}><Share2 size={15} /> {t("common.compare")}</button>
          </div>
        </aside>
      </div>

      {compare && (
        <section className="compare-strip" aria-label={t("cards.openComparison")}>
          <div className="compare-organ"><OrganArt organ={organ} asset="thumb" alt="" /><span>{t("common.comparing")}</span><strong>{organ.name}</strong><small>{organ.system}</small></div>
          <b>{t("common.versus")}</b>
          <div className="compare-organ"><OrganArt organ={reference} asset="thumb" alt="" /><span>{t("common.reference")}</span><strong>{reference.name}</strong><small>{reference.system}</small></div>
          <dl><div><dt>{t("common.primaryRole")}</dt><dd>{organ.function}</dd></div><div><dt>{t("common.scale")}</dt><dd>{organ.size}</dd></div></dl>
          <button type="button" onClick={() => setCompare(false)} aria-label={t("common.close")}><X size={16} /></button>
        </section>
      )}

      <section className="learning-cards" aria-label={t("cards.resourcesLabel", { organName: organ.name })}>
        <article className="curiosity-card">
          <span>✿</span><p>{t("common.learningQuote")}</p><em>{t("common.keepExploring")}</em>
        </article>
        <article>
          <header><div><em>{t("cards.microscopicView")}</em><h3>{organ.tissue}</h3></div><Microscope size={17} /></header>
          <div className="microscope-visual organ-card-image"><OrganArt organ={organ} asset="microscopic" alt={t("alt.microscopicView", { organName: organ.name })} /></div>
          <button type="button" onClick={() => setModal("lesson")}>{t("cards.exploreTissue")} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t("cards.compareOrgans")}</em><h3>{organ.comparison}</h3></div><Share2 size={17} /></header>
          <div className="comparison-visual organ-card-image"><OrganArt organ={organ} asset="compare" alt={t("alt.comparison", { comparison: organ.comparison })} /></div>
          <button type="button" onClick={() => setCompare(true)}>{t("cards.openComparison")} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t("cards.functionAnimation")}</em><h3>{organ.function}</h3></div><Play size={17} /></header>
          <button
            type="button"
            className="function-visual organ-card-image"
            onClick={() => setModal("animation")}
            aria-label={t("cards.playFunctionAnimation", { organName: organ.name })}
          >
            <OrganArt organ={organ} asset="organ" alt="" />
            <i className="function-pulse" />
            <span className="play-badge"><Play size={18} fill="currentColor" /></span>
          </button>
          <button type="button" onClick={() => setModal("animation")}>{t("cards.playAnimation")} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t("cards.clinicalNotes")}</em><h3>{t("cards.commonConditions")}</h3></div><FileText size={17} /></header>
          <ul>{organ.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
          <button type="button" onClick={() => setModal("lesson")}>{t("cards.seeAll")} <ArrowRight size={14} /></button>
        </article>
        <article className="system-card">
          <header><div><em>{t("cards.whereItWorks")}</em><h3>{organ.system}</h3></div><BrainCircuit size={17} /></header>
          <button
            type="button"
            className="system-visual organ-card-image"
            onClick={() => setModal("system")}
            aria-label={t("cards.seeBodyLocation", { organName: organ.name })}
          >
            <OrganArt organ={organ} asset="location" alt="" />
          </button>
          <button type="button" onClick={() => setModal("system")}>{t("cards.seeSystem")} <ArrowRight size={14} /></button>
        </article>
      </section>

      <footer className="credits-footer" aria-label={t("credits.ariaLabel")}>
        <div className="credits-copy">
          <span>{t("credits.kicker")}</span>
          <strong>{t("credits.title")}</strong>
        </div>
        <div className="credits-links">
          <a href="https://github.com/thebuggeddev" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} />
            <span>{t("credits.createdBy")}</span>
            <strong>thebuggeddev</strong>
          </a>
          <a href="https://github.com/cypictronic05" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} />
            <span>{t("credits.translatedBy")}</span>
            <strong>cypictronic05</strong>
          </a>
        </div>
        <div className="credits-languages" aria-label={t("credits.languagesLabel")}>
          {CREDIT_LANGUAGES.map(({ locale, flag }) => (
            <span key={locale}>
              <b>{flag}</b>
              {messages.language.names[locale]}
            </span>
          ))}
        </div>
      </footer>

      {modal && <LearningModal type={modal} organ={organ} onClose={() => setModal(null)} />}
      {mobileLibrary && <button type="button" className="drawer-backdrop" aria-label={t("common.closeLibrary")} onClick={() => setMobileLibrary(false)} />}
    </main>
  );
}

const MODAL_ICON: Record<Exclude<Modal, null>, string> = {
  quiz: "?",
  animation: "▶",
  system: "⌖",
  lesson: "✦",
};

function LearningModal({ type, organ, onClose }: { type: Exclude<Modal, null>; organ: Organ; onClose: () => void }) {
  const { t } = useI18n();
  const title = t(`modal.titles.${type}`, { organName: organ.name });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`learning-modal ${type === "system" ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label={t("common.close")}><X size={18} /></button>
        <span className="modal-icon">{MODAL_ICON[type]}</span>
        <em>{t("modal.guidedDiscovery")}</em>
        <h2 id="modal-title">{title}</h2>
        {type === "quiz" ? (
          <div className="quiz-options">
            <p>{t("modal.quizQuestion", { organName: organ.name })}</p>
            <button type="button" onClick={onClose}>{t("modal.quizAnswers.correct")}</button>
            <button type="button" onClick={onClose}>{t("modal.quizAnswers.independent")}</button>
            <button type="button" onClick={onClose}>{t("modal.quizAnswers.sleep")}</button>
          </div>
        ) : type === "system" ? (
          <>
            <p>{t("modal.systemBody", { location: organ.location, organName: organ.name })}</p>
            <figure className="modal-figure">
              <OrganArt organ={organ} asset="location" alt={t("alt.locationFigure", { organName: organ.name, system: organ.system })} />
            </figure>
            <dl className="modal-facts">
              <div><dt>{t("common.system")}</dt><dd>{organ.system}</dd></div>
              <div><dt>{t("common.primaryRole")}</dt><dd>{organ.function}</dd></div>
              <div><dt>{t("common.bloodSupply")}</dt><dd>{organ.bloodSupply}</dd></div>
            </dl>
            <button type="button" className="lesson-button" onClick={onClose}>{t("common.continueExploring")} <ArrowRight size={16} /></button>
          </>
        ) : (
          <>
            <p>{t("modal.studyBody")}</p>
            <div className={`modal-demo ${type === "animation" ? "moving" : ""}`}><OrganArt organ={organ} asset="organ" alt={t("alt.illustration", { organName: organ.name })} /></div>
            <button type="button" className="lesson-button" onClick={onClose}>{t("common.continueExploring")} <ArrowRight size={16} /></button>
          </>
        )}
      </section>
    </div>
  );
}

function localizeOrgans(messages: Messages): Organ[] {
  const organMessages = messages.organs as Record<OrganId, TranslatedOrgan>;

  return organBases.map((base) => {
    const content = organMessages[base.id];
    return {
      ...base,
      ...content,
      hotspots: base.hotspots.map((hotspot) => {
        const translated = content.hotspots[hotspot.id];
        return { ...hotspot, label: translated.label, detail: translated.detail };
      }),
    };
  });
}
