import { Hero } from './components/Hero/Hero'
import { CloudSection } from './components/CloudSection/CloudSection'
import { DigitalAssetsSection } from './components/DigitalAssetsSection/DigitalAssetsSection'
import { ContactBanner } from './components/ContactBanner/ContactBanner'
import { AppFooter } from './components/AppFooter/AppFooter'

function App() {
  return (
    <main className="w-full">
      <Hero />
      <CloudSection />
      <DigitalAssetsSection />
      <ContactBanner />
      <AppFooter />
    </main>
  )
}

export default App

