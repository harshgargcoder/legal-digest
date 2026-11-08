"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  BookOpen,
  Landmark,
  Shield,
  Gavel,
  History,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Flame,
  CheckCircle2,
  Users,
  Feather,
  Globe2,
  ScrollText,
  Layers,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";

interface Props {
  onExploreFeed?: () => void;
}

export default function LegalHomepage({ onExploreFeed }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "history" | "judges" | "lawyers" | "about">("all");

  return (
    <div className="space-y-24 mb-16">
      {/* ── 1. HERO SECTION & PLATFORM INTRO (HIGH-VISIBILITY PERMANENT ANIMATIONS) ───────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/90 dark:border-indigo-900/80 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-6 sm:p-12 lg:p-16 shadow-lg shadow-indigo-500/5">
        
        {/* Animated 3D Neon Laser Border Running at Top of Hero */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-indigo-500 via-purple-500 to-transparent animate-laser pointer-events-none" />

        {/* Vibrant Animated Aurora Blobs (Visible in both Light and Dark mode) */}
        <motion.div
          animate={{
            x: [0, 50, -40, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-16 -left-16 w-[450px] h-[450px] bg-gradient-to-tr from-indigo-500/40 via-purple-500/35 to-pink-500/25 rounded-full blur-2xl pointer-events-none"
        />

        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 40, -35, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-16 -right-16 w-[450px] h-[450px] bg-gradient-to-bl from-purple-500/40 via-pink-500/35 to-indigo-500/30 rounded-full blur-2xl pointer-events-none"
        />

        <motion.div
          animate={{
            scale: [0.9, 1.15, 0.9],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-indigo-500/20 dark:bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"
        />

        {/* FLOATING 3D GLASS BADGE 1 (LEFT SIDE - VISIBLE FLOATING ANIMATION) */}
        <div className="hidden xl:block absolute left-6 top-1/3 -translate-y-1/2 pointer-events-none z-20">
          <div className="animate-float-slow flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-200/90 dark:border-indigo-800/90 shadow-[0_15px_35px_-5px_rgba(99,102,241,0.3)] text-slate-800 dark:text-slate-100">
            <span className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm shadow-xs">⚖️</span>
            <div>
              <div className="text-xs font-bold leading-tight">Apex Jurisprudence</div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Active Bench Intelligence</div>
            </div>
          </div>
        </div>

        {/* FLOATING 3D GLASS BADGE 2 (RIGHT SIDE - VISIBLE FLOATING ANIMATION) */}
        <div className="hidden xl:block absolute right-6 top-1/3 -translate-y-1/2 pointer-events-none z-20">
          <div className="animate-float-reverse flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-purple-200/90 dark:border-purple-800/90 shadow-[0_15px_35px_-5px_rgba(168,85,247,0.3)] text-slate-800 dark:text-slate-100">
            <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-sm shadow-xs">⚡</span>
            <div>
              <div className="text-xs font-bold leading-tight">185,000+ Case Digests</div>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Real-Time AI Distillation</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Badge with Pulsing Live Radar & Rocking Scale */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-indigo-200/90 dark:border-indigo-800/90 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide uppercase shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>

            <motion.div
              animate={{ rotate: [-10, 10, -10] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Scale size={14} className="text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <span>Legal Digest • The Premier Legal Intelligence Platform</span>
          </motion.div>

          {/* Headline with Visible Metallic Shimmer Wave */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-950 dark:text-white tracking-tight leading-[1.15]">
            Where The Rule of Law <br className="hidden sm:inline" />
            <span className="animate-shimmer-text inline-block">
              Meets Analytical Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Legal Digest transforms hundreds of sprawling court judgments, legislative bills, and constitutional benches into structured, actionable intelligence. Engineered specifically for law students, advocates, scholars, and conscious citizens.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const el = document.getElementById("live-feed-section");
                el?.scrollIntoView({ behavior: "smooth" });
                onExploreFeed?.();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <span>Explore Live Case Feed</span>
              <ArrowRight size={14} />
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href="#law-definition"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 font-semibold text-xs tracking-wider uppercase hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition"
            >
              <ScrollText size={14} className="text-indigo-500" />
              <span>Law & History</span>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href="#hall-of-fame"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 font-semibold text-xs tracking-wider uppercase hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition"
            >
              <Award size={14} className="text-amber-500" />
              <span>Best Judges & Lawyers</span>
            </motion.a>
          </div>

          {/* Key Stat Highlights with Permanent Subtle Levitation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
            {[
              { val: "100%", label: "Curated Jurisprudence", color: "text-slate-900 dark:text-white", dot: "bg-indigo-500" },
              { val: "Apex & High", label: "Court Bench Tracking", color: "text-indigo-600 dark:text-indigo-400", dot: "bg-purple-500" },
              { val: "AI-Powered", label: "Case Brief Analysis", color: "text-slate-900 dark:text-white", dot: "bg-pink-500" },
              { val: "Zero Fluff", label: "Strictly Legal Integrity", color: "text-purple-600 dark:text-purple-400", dot: "bg-emerald-500" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, i % 2 === 0 ? -4 : 4, 0] }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.06, y: -6 }}
                className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/70 dark:border-slate-700/60 shadow-xs transition-all cursor-default"
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} animate-pulse`} />
                  <div className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.val}</div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. WHAT IS LAW? (DEFINITION & PILLARS) ──────────────────────────── */}
      <section id="law-definition" className="space-y-8 scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Feather size={13} />
            The Soul of Jurisprudence
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            What is Law? Definitions by Renowned Jurists
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Law is neither mere static text nor arbitrary state power. It is an evolving instrument that guarantees ordered liberty, human dignity, and justice against tyranny.
          </p>
        </motion.div>

        {/* Famous Jurists Cards with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              jurist: "Sir John Salmond",
              era: "Analytical School",
              quote: "The body of principles recognized and applied by the state in the administration of justice.",
              insight: "Law is inextricably tied to the machinery of justice, not just formal orders.",
              tag: "Administration of Justice",
            },
            {
              jurist: "John Austin",
              era: "Positivist Jurisprudence",
              quote: "Law is the command of the sovereign, backed by the sanction of coercive force.",
              insight: "Identifies the sovereign source, obligation, and consequence of civil disobedience.",
              tag: "Command Theory",
            },
            {
              jurist: "Roscoe Pound",
              era: "Sociological School",
              quote: "Law is social engineering—an instrument to balance competing human desires with the least friction.",
              insight: "Views the legal system as a living social tool that adapts to human needs.",
              tag: "Social Engineering",
            },
            {
              jurist: "Thomas Erskine Holland",
              era: "Formal Jurisprudence",
              quote: "A general rule of external human action enforced by a sovereign political authority.",
              insight: "Differentiates external conduct from internal moral conscience.",
              tag: "External Conduct",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {item.era}
                  </span>
                  <BookOpen size={14} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                  {item.jurist}
                </h3>
                <blockquote className="text-xs italic text-slate-700 dark:text-slate-300 border-l-2 border-indigo-500 pl-3 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.insight}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400">Pillar: {item.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The 3 Pillars of Justice */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
        >
          <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
              <Shield size={16} />
              1. The Rule of Law
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No person is above the law. Governance is exercised by established laws, not by arbitrary decrees or executive discretion.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-2">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
              <Scale size={16} />
              2. Principles of Natural Justice
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              *Audi Alteram Partem* (Listen to both sides) and *Nemo Judex In Causa Sua* (No one should be a judge in their own cause).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              <Landmark size={16} />
              3. Constitutional Supremacy
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fundamental human rights are inalienable. Courts possess judicial review to strike down unconstitutional legislation.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── 3. HISTORY OF LAW (SCROLL-REVEAL ANIMATED TIMELINE - 2ND IMAGE) ─────── */}
      <section className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <History size={13} />
            Millennia of Legal Evolution
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            The Historical Evolution of Law
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            From clay tablets of Mesopotamia to digital constitutionalism, trace the monumental milestones that transformed raw power into the rule of justice.
          </p>
        </motion.div>

        {/* Animated Timeline Container with Drawing Stroke */}
        <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800/80 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-10">
          
          {/* Animated vertical laser line drawing down */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-600 origin-top"
          />

          {[
            {
              era: "c. 1750 BCE",
              title: "The Code of Hammurabi (Babylon)",
              desc: "One of the earliest comprehensive written legal codes. Established public proclamation of laws, judicial presumption of innocence, and proportional punishment (*Lex Talionis*).",
              highlight: "Carved into eight-foot diorite stele so no king could secretly change the law.",
            },
            {
              era: "c. 250 BCE",
              title: "Indian Dharmashastras & Ashokan Rock Edicts",
              desc: "Ancient Indian jurisprudence centered on 'Dharma'—moral, ethical duty and cosmic balance. Emperor Ashoka's edicts across India mandated humane governance, fair treatment of prisoners, and religious harmony.",
              highlight: "Pioneered restorative justice and state-sponsored welfare.",
            },
            {
              era: "1215 CE",
              title: "The Magna Carta (Great Charter of Runnymede)",
              desc: "English barons forced King John to declare that the Crown is bound by the law. Introduced Clause 39: No free man shall be imprisoned except by lawful judgment of his peers.",
              highlight: "The foundation of Due Process of Law and modern Constitutionalism.",
            },
            {
              era: "1948 - 1950",
              title: "Universal Declaration of Human Rights & The Indian Constitution",
              desc: "Following WWII, the UDHR recognized universal dignity. In 1950, India enacted the world's most detailed democratic constitution, drafted under Dr. B.R. Ambedkar, cementing fundamental rights and judicial independence.",
              highlight: "Article 32 established the right to constitutional remedies—the 'Heart and Soul' of the Constitution.",
            },
            {
              era: "Modern Era (Present)",
              title: "Public Interest Litigation (PIL) & Digital Jurisprudence",
              desc: "Indian Supreme Court democratized locus standi, allowing any citizen to seek justice for the poor. Today, law expands into cyber law, AI ethics, and right to digital privacy (*Puttaswamy* judgment).",
              highlight: "Courts operate as protectors of human rights across physical and digital frontiers.",
            },
          ].map((milestone, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -35, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: i * 0.14,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="relative group"
            >
              {/* Animated Pop-in Dot on timeline */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: [0, 1.4, 1], opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.14 + 0.1 }}
                className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-indigo-600 dark:border-indigo-400 group-hover:scale-130 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              />

              <motion.div
                whileHover={{ x: 6, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 shadow-xs">
                    {milestone.era}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Historical Landmark
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-2">
                  {milestone.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {milestone.desc}
                </p>
                <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  ⚡ <strong className="font-semibold">Significance:</strong> {milestone.highlight}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. BEST JUDGES & LAWYERS (STAGGERED 3D FADE-IN CARDS - 3RD IMAGE) ───── */}
      <section id="hall-of-fame" className="space-y-12 scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Award size={13} />
            Hall of Integrity & Valor
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Pioneers of the Bench & The Bar
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            The lawyers who fought relentlessly for the victim, and the courageous judges who spoke truth to power to deliver justice.
          </p>
        </motion.div>

        {/* SECTION A: BEST JUDGES (STAGGERED 3D FADE-IN CARDS) */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800"
          >
            <Gavel className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Guardians of the Bench: Fair & Fearless Judges
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Justice H. R. Khanna",
                role: "Judge, Supreme Court of India",
                legacy: "The Immortal Dissent in ADM Jabalpur (1976)",
                description:
                  "During the dark days of Emergency, when 4 senior judges surrendered to executive pressure, Justice Khanna stood alone. In his fearless dissent, he held that Article 21 (Right to Life & Liberty) cannot be snuffed out. He sacrificed his Chief Justiceship for this stance, becoming the world's symbol of judicial integrity.",
                famousLine: "A dissent is an appeal to the brooding spirit of the law, to the intelligence of a future day.",
                victimProtection: "Defended citizens from arbitrary preventive detention and torture.",
              },
              {
                name: "Justice V. R. Krishna Iyer",
                role: "Judge, Supreme Court of India",
                legacy: "Humanized Indian Criminal Jurisprudence",
                description:
                  "Transformed Indian courtrooms from elitist sanctuaries into halls of the common people. Championed legal aid for the indigent, reformed harsh prison conditions, and firmly laid down: 'Bail is the rule, jail is the exception' in State of Rajasthan v. Balchand.",
                famousLine: "Bail is the rule, jail is the exception.",
                victimProtection: "Protected undertrials from rotting in prison and abolished hand-cuffing indignities.",
              },
              {
                name: "Justice P. N. Bhagwati",
                role: "17th Chief Justice of India",
                legacy: "Architect of Public Interest Litigation (PIL)",
                description:
                  "Revolutionized access to justice by lowering locus standi. In Bandhua Mukti Morcha and Hussainara Khatoon, he treated simple letters written by activists as constitutional writ petitions, liberating hundreds of thousands of bonded laborers and forgotten prisoners.",
                famousLine: "The law must not remain a plaything for the wealthy.",
                victimProtection: "Directly rescued child laborers, undertrials, and bonded laborers.",
              },
              {
                name: "Justice Leila Seth",
                role: "First Woman Chief Justice of a State High Court",
                legacy: "Architect of Gender Justice Reforms",
                description:
                  "First woman to top the London Bar exam and first woman Chief Justice of a High Court (Himachal Pradesh). As a core member of the Justice Verma Committee (2013), she overhauled India's criminal rape laws, guaranteeing victim protection, consent standards, and swift justice.",
                famousLine: "Justice must be compassionate and resolute.",
                victimProtection: "Revolutionized sexual violence laws and succession rights for daughters.",
              },
              {
                name: "Lord Denning",
                role: "Master of the Rolls (English Court of Appeal)",
                legacy: "The People's Judge",
                description:
                  "Known as the most celebrated common law judge of the 20th century. Whenever established legal technicalities produced an unjust result for an innocent victim, Lord Denning creatively interpreted legal doctrine to ensure substantial justice prevailed.",
                famousLine: "Be you never so high, the law is above you.",
                victimProtection: "Prevented corporations from exploiting unequal bargaining power against consumers.",
              },
            ].map((judge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.25 },
                }}
                className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.2)] hover:border-indigo-400 dark:hover:border-indigo-600 transition group cursor-default"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {judge.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {judge.role}
                      </p>
                    </div>
                    <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 group-hover:scale-110 transition-transform">
                      ⚖️
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    🏛️ {judge.legacy}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {judge.description}
                  </p>

                  <div className="text-[11px] italic text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-400 pl-2">
                    &ldquo;{judge.famousLine}&rdquo;
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="flex-shrink-0" />
                  <span>Victim Impact: {judge.victimProtection}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION B: BEST LAWYERS (STAGGERED 3D FADE-IN CARDS) */}
        <div className="space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800"
          >
            <Shield className="text-purple-600 dark:text-purple-400" size={20} />
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Champions of the Bar: Lawyers Who Fought for Justice
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. B. R. Ambedkar",
                title: "Barrister-at-Law (Gray's Inn), Jurist & Reformer",
                fights: "Social Justice, Caste Annihilation & Constitutional Rights",
                description:
                  "Armed with law degrees from Columbia and London, Babasaheb defended the untouchables in courtrooms when no upper-caste lawyer would represent them. He argued the Mahad Satyagraha case and later forged the Constitution to institutionalize liberty, equality, and fraternity.",
                hallmark: "Proved that law is the most potent weapon for social emancipation.",
              },
              {
                name: "Nani Palkhivala",
                title: "Senior Advocate, Supreme Court of India",
                fights: "Basic Structure Doctrine in Kesavananda Bharati (1973)",
                description:
                  "Arguing for 66 straight days before a historic 13-judge bench, Palkhivala convinced the court that Parliament does not have unlimited power to alter the core principles of India's democracy. His eloquence single-handedly preserved the democratic fabric of India.",
                hallmark: "Saved the Constitution from parliamentary tyranny.",
              },
              {
                name: "Ram Jethmalani",
                title: "Senior Advocate, Titan of Criminal Jurisprudence",
                fights: "Civil Liberties, Defense of the Underdog & Fair Trial",
                description:
                  "Master of cross-examination and Indian Penal Code. He fearlessly defended civil liberties during the Emergency, fought arbitrary state overreach, and fiercely asserted that every accused person has the constitutional right to defense without prejudice.",
                hallmark: "Taught generations that fearlessness is the lawyer's greatest virtue.",
              },
              {
                name: "Fali S. Nariman",
                title: "Senior Advocate & Doyen of the Supreme Court",
                fights: "Judicial Independence & Secularism",
                description:
                  "Resigned as Additional Solicitor General in protest against the 1975 Emergency. Argued landmark cases defending judicial independence (Second and Third Judges cases, NJAC) and religious minority educational rights (*T.M.A. Pai*).",
                hallmark: "The conscience-keeper of the Indian Legal Fraternity.",
              },
              {
                name: "Ruth Bader Ginsburg (RBG)",
                title: "Litigator (ACLU) & US Supreme Court Justice",
                fights: "Gender Equality & Equal Protection",
                description:
                  "Before joining the bench, RBG was a fearless litigator who systematically argued landmark cases before the all-male US Supreme Court, striking down laws that treated women as second-class citizens and establishing equal protection under law.",
                hallmark: "Dismantled institutional sexism one landmark verdict at a time.",
              },
              {
                name: "Clarence Darrow",
                title: "Legendary American Trial Advocate",
                fights: "Anti-Death Penalty, Labor Rights & Freedom of Thought",
                description:
                  "Known as the 'Attorney for the Damned'. Defended union leaders, opposed capital punishment in the landmark Leopold & Loeb trial, and defended the teaching of evolution in the Scopes Monkey Trial against religious bigotry.",
                hallmark: "Never refused a case because the client was despised or broke.",
              },
            ].map((lawyer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.25 },
                }}
                className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-[0_15px_30px_-5px_rgba(168,85,247,0.2)] hover:border-purple-400 dark:hover:border-purple-600 transition group cursor-default"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {lawyer.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        {lawyer.title}
                      </p>
                    </div>
                    <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 group-hover:scale-110 transition-transform">
                      🛡️
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    🔥 {lawyer.fights}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lawyer.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="flex-shrink-0 text-amber-500" />
                  <span>Legacy: {lawyer.hallmark}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. ABOUT LEGALDIGEST WEBSITE (IN THE END) ───────────────────────── */}
      <motion.section
        id="about-website"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7 }}
        className="relative p-8 sm:p-12 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 shadow-sm space-y-8"
      >
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
            <Lightbulb size={13} />
            About LegalDigest Platform
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-950 dark:text-white">
            Democratizing Legal Intelligence For The Modern Era
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            LegalDigest was forged with a single conviction: legal knowledge is too vital to be locked behind prohibitive paywalls or buried in 400-page unstructured PDFs. We combine rigorous legal scholarship with high-speed AI distillation.
          </p>
        </div>

        {/* Feature Grid with Animated Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {[
            {
              icon: ScrollText,
              title: "Curated Case Digests",
              desc: "Real-time rulings from Supreme Court, High Courts, and international tribunals, summarized with primary ratio decidendi and bench details.",
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-950",
            },
            {
              icon: Sparkles,
              title: "AI Briefing & Notes Assistant",
              desc: "Upload your case notes or ask questions to our dual AI engine—combining specific personal notes synthesis with web legal analysis.",
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-950",
            },
            {
              icon: Landmark,
              title: "Virtual Moot Court",
              desc: "Real-time trial simulations where law students argue cases against AI judges, test courtroom demeanor, and review procedural objections.",
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950",
            },
            {
              icon: Globe2,
              title: "Unified National & Global",
              desc: "Seamlessly switch between Indian domestic rulings and international jurisprudence with one-click category filtering and zero delay.",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950",
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2.5 transition"
              >
                <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center ${feat.color}`}>
                  <Icon size={20} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Banner CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800">
          <div>
            <h5 className="font-bold text-sm">Ready to explore active rulings and case analyses?</h5>
            <p className="text-xs text-slate-400">Filter by Supreme Court, High Court, Criminal, Constitutional, and more.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const el = document.getElementById("live-feed-section");
              el?.scrollIntoView({ behavior: "smooth" });
              onExploreFeed?.();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shadow-sm"
          >
            <span>Jump to Live Case Feed</span>
            <ChevronRight size={14} />
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
