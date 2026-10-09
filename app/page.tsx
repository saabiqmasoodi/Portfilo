import { About } from '@/components/about'
import { Contact } from '@/components/contact'
import { Hero } from '@/components/hero'
import { Projects } from '@/components/projects'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Skills } from '@/components/skills'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}