import { About } from '@/components/About'
import { Book } from '@/components/Book'
import { Download } from '@/components/Download'
import { Features } from '@/components/Features'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Introduction } from '@/components/Introduction'
import { NavBar } from '@/components/NavBar'
import { Parts } from '@/components/Parts'

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <Parts />
      <Features />
      <Download />
      <Book />
      <About />
      <Footer />
    </>
  )
}
