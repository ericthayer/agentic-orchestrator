import { Hero } from './components/Hero/Hero'
import { CloudSection } from './components/CloudSection/CloudSection'
import { DigitalAssetsSection } from './components/DigitalAssetsSection/DigitalAssetsSection'
import { ContactBanner } from './components/ContactBanner/ContactBanner'

function App() {
  return (
    <main className="w-full">
      <Hero />
      <CloudSection />
      <DigitalAssetsSection />
      <ContactBanner />
    </main>
  )
}

export default App

