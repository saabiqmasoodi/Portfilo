import { GameCard } from '@/components/game-card'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { projects } from '@/lib/projects'

export function Projects() {
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <section id="projects" className="relative py-20 sm:py-28">
      {/* Section backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-neon-aurora opacity-40"
      />

      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="02 / Games"
            title={
              <>
                Things I have{' '}
                <span className="text-neon-gradient">built and shipped</span>
              </>
            }
            description="Every project here is something I made, designed and debugged myself. Click through to play the ones that are live."
          />
        </Reveal>

        {/* Featured grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((project, index) => (
            <Reveal key={project.id} delay={index * 80}>
              <GameCard project={project} index={index} />
            </Reveal>
          ))}
        </div>

        {/* Rest */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((project, index) => (
            <Reveal key={project.id} delay={index * 80}>
              <GameCard project={project} index={index} />
            </Reveal>
          ))}
        </div>

        {/* Footer note */}
        <Reveal delay={120}>
          <p className="mt-10 text-center font-mono text-xs uppercase tracking-widest text-ink-faint">
            More projects on the way — the Godot one is not finished yet
          </p>
        </Reveal>
      </div>
    </section>
  )
}