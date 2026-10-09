import { Marquee } from '@/components/ui/marquee'
import { NeonCard } from '@/components/ui/neon-card'
import { PixelBadge } from '@/components/ui/pixel-badge'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { siteConfig } from '@/lib/site-config'

const groups = [
  {
    tone: 'cyan' as const,
    title: 'Game Engines',
    icon: '🎮',
    items: ['Scratch (blocks & Scratch C)', 'Godot 4 (GDScript, C#)', 'Game design', 'Level design'],
  },
  {
    tone: 'magenta' as const,
    title: 'Art & 3D',
    icon: '🧊',
    items: ['Blender', 'Low-poly modelling', 'Materials & texturing', 'Pixel art'],
  },
  {
    tone: 'lime' as const,
    title: 'Code',
    icon: '⌨️',
    items: ['JavaScript / TypeScript', 'GDScript', 'C# basics', 'C++ (Arduino)'],
  },
  {
    tone: 'violet' as const,
    title: 'Robotics & Hardware',
    icon: '🤖',
    items: ['Arduino UNO', 'Breadboarding & circuits', 'Sensors', 'Troubleshooting'],
  },
]

export function Skills() {
  return (
    <section id="skills" className="relative py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="03 / Skills"
            align="center"
            title={
              <>
                The <span className="text-neon-gradient">toolbox</span>
              </>
            }
            description="Tools I reach for, and things I am actively learning."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map((group, index) => (
            <Reveal key={group.title} delay={index * 70}>
              <NeonCard
                tone={group.tone}
                corners
                className="flex h-full flex-col gap-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg"
                  >
                    {group.icon}
                  </span>
                  <h3 className="font-display text-base font-bold tracking-tight text-ink">
                    {group.title}
                  </h3>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 shrink-0 rotate-45 bg-white/30 transition-colors duration-300 group-hover:bg-neon-cyan"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </NeonCard>
            </Reveal>
          ))}
        </div>

        {/* Ticker */}
        <Reveal delay={140}>
          <div className="mt-14">
            <div className="mb-4 flex items-center justify-center">
              <PixelBadge tone="amber">Daily Rotation</PixelBadge>
            </div>
            <Marquee items={[...siteConfig.ticker]} tone="cyan" speed={34} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}