import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import SetupScreen from './screens/SetupScreen'
import InterviewScreen from './screens/InterviewScreen'
import ResultsScreen from './screens/ResultsScreen'
import { getPreviewState } from './preview'

export default function App() {
  const [preview] = useState(() => getPreviewState())
  const [step, setStep] = useState(preview?.step ?? 1) // 1 configuracion, 2 entrevista, 3 resultados
  const [config, setConfig] = useState(preview?.config ?? null)
  const [session, setSession] = useState(preview?.session ?? null)
  const [results, setResults] = useState(preview?.results ?? null) // { summary, answers }

  function handleStarted(cfg, sess) {
    setConfig(cfg)
    setSession(sess)
    setStep(2)
    window.scrollTo({ top: 0 })
  }

  function handleFinished(summary, answers) {
    setResults({ summary, answers })
    setStep(3)
    window.scrollTo({ top: 0 })
  }

  function handleRestart() {
    setConfig(null)
    setSession(null)
    setResults(null)
    setStep(1)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <Header step={step} />
      <main className="w-full pt-16 min-h-screen flex flex-col justify-between">
        <div key={step} className="animate-fade-in flex flex-col w-full">
          {step === 1 && <SetupScreen onStarted={handleStarted} />}
          {step === 2 && (
            <InterviewScreen session={session} config={config} onFinished={handleFinished} initial={preview?.interview} />
          )}
          {step === 3 && <ResultsScreen results={results} session={session} onRestart={handleRestart} />}
        </div>
        <Footer />
      </main>
    </>
  )
}
