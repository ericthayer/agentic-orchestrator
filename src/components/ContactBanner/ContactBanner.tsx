import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const REPO_URL = 'https://github.com/ericthayer/agentic-orchestrator';
const EXAMPLE_URL = 'https://design-great-prompts.netlify.app/';

interface ContactBannerProps {
  title?: string;
}

interface Step {
  text: React.ReactNode;
}

const steps: Step[] = [
  {
    text: (
      <>
        Clone the repo and run <code>sh scripts/init-orchestration.sh</code> to pull the
        shared rules into your project.
      </>
    ),
  },
  {
    text: (
      <>
        Ask your agent to run <code>/setup-orchestration</code> so it loads the rules and
        workflows.
      </>
    ),
  },
  {
    text: (
      <>
        Write a spec, then build your scene: a Three.js learning app, an interactive demo or
        a case study.
      </>
    ),
  },
];

/**
 * "Use the template" section. Closes the landing page with the three real
 * steps for starting a new project from this repo, plus the primary CTA.
 * Kept as `ContactBanner` (name and file) so existing imports keep working.
 */
export const ContactBanner: React.FC<ContactBannerProps> = ({
  title = 'Start your next learning app from here',
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="template"
      aria-labelledby="template-heading"
      className="relative w-full overflow-hidden border-t border-staff bg-ink px-6 py-24 md:py-32"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20"
      >
        <div>
          <h2
            id="template-heading"
            className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-paper [font-stretch:80%] md:text-6xl"
          >
            {title}
          </h2>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-mute">
            Agentic Orchestrator is a React and Three.js starting point for learning apps,
            interactive demos and case studies for education, with the rules, specs and
            skills your agents need already in place.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-cue px-6 py-3 font-semibold text-ink transition-colors hover:bg-cue-deep"
            >
              Clone the template
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={EXAMPLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:decoration-signal"
            >
              See an example: Design Great Prompts
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>

        <ol role="list" className="border-t border-staff">
          {steps.map((step, i) => (
            <li
              key={i}
              className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-staff py-6 text-paper"
            >
              <span aria-hidden="true" className="font-display text-2xl leading-none text-mute">
                {i + 1}
              </span>
              <p className="max-w-[60ch] leading-relaxed [&_code]:rounded-sm [&_code]:bg-ink-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-paper [&_code]:break-words">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </motion.div>
    </section>
  );
};
