import React from 'react'
import { useReconState } from './hooks/useReconState'
import FileUpload from './components/FileUpload'
import KeySelector from './components/KeySelector'
import ResultsView from './components/ResultsView'
import RuleEditor from './components/RuleEditor'

const STEPS = [
  { num: 1, label: 'Upload Files' },
  { num: 2, label: 'Configure Keys' },
  { num: 3, label: 'Review Breaks' },
  { num: 4, label: 'Manage Rules' },
]

function StepIndicator({ currentStep, onStepClick, canNavigate }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const isActive = step.num === currentStep
        const isDone = step.num < currentStep
        const clickable = canNavigate(step.num)
        return (
          <React.Fragment key={step.num}>
            <button
              onClick={() => clickable && onStepClick(step.num)}
              disabled={!clickable}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive ? 'bg-blue-600 text-white shadow-md' : ''}
                ${isDone && !isActive ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                ${!isDone && !isActive ? 'bg-gray-100 text-gray-400' : ''}
                ${clickable ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold
                ${isActive ? 'bg-white text-blue-600' : ''}
                ${isDone && !isActive ? 'bg-blue-600 text-white' : ''}
                ${!isDone && !isActive ? 'bg-gray-300 text-gray-500' : ''}
              `}>
                {isDone && !isActive ? '✓' : step.num}
              </span>
              {step.label}
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`h-px w-6 ${step.num < currentStep ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default function App() {
  const recon = useReconState()
  const { state, loadFileA, loadFileB, setKeyColumns, runReconciliation,
    categorizeBreak, addRule, updateRule, deleteRule, toggleRule, goToStep, reset } = recon

  function canNavigate(step) {
    if (step === 1) return true
    if (step === 2) return !!(state.fileA && state.fileB)
    if (step === 3) return !!state.stats
    if (step === 4) return !!state.stats
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recon Tool</h1>
            <p className="text-xs text-gray-500 mt-0.5">File Reconciliation & Break Analysis</p>
          </div>
          {state.stats && (
            <button
              onClick={reset}
              className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StepIndicator
          currentStep={state.step}
          onStepClick={goToStep}
          canNavigate={canNavigate}
        />

        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <strong>Error:</strong> {state.error}
          </div>
        )}

        {state.step === 1 && (
          <FileUpload
            fileA={state.fileA}
            fileB={state.fileB}
            loading={state.loading}
            onFileA={loadFileA}
            onFileB={loadFileB}
            onNext={() => goToStep(2)}
          />
        )}

        {state.step === 2 && (
          <KeySelector
            fileA={state.fileA}
            fileB={state.fileB}
            keyColumns={state.keyColumns}
            onKeyColumnsChange={setKeyColumns}
            onBack={() => goToStep(1)}
            onReconcile={runReconciliation}
            loading={state.loading}
          />
        )}

        {state.step === 3 && (
          <ResultsView
            breaks={state.breaks}
            stats={state.stats}
            rules={state.rules}
            fileAName={state.fileA?.name}
            fileBName={state.fileB?.name}
            keyColumns={state.keyColumns}
            onCategorize={categorizeBreak}
            onGoToRules={() => goToStep(4)}
          />
        )}

        {state.step === 4 && (
          <RuleEditor
            rules={state.rules}
            breaks={state.breaks}
            columns={[
              ...new Set([
                ...(state.fileA?.headers ?? []),
                ...(state.fileB?.headers ?? []),
              ].filter((h) => !state.keyColumns.includes(h))),
            ]}
            onAdd={addRule}
            onUpdate={updateRule}
            onDelete={deleteRule}
            onToggle={toggleRule}
            onBack={() => goToStep(3)}
          />
        )}
      </main>
    </div>
  )
}
