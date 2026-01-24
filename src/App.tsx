import { Hero } from './components/Hero/Hero'
import { CloudSection } from './components/CloudSection/CloudSection'
import { DigitalAssetsSection } from './components/DigitalAssetsSection/DigitalAssetsSection'

function App() {
  return (
    <main className="w-full">
      <Hero />
      <CloudSection />
      <DigitalAssetsSection />
    </main>
  )
}

export default App

