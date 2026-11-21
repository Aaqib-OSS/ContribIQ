import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOnboardingPlan, type OnboardingPlan } from '../api/onboarding'
import { useWorkflow } from '../hooks/useWorkflow'
import IssuePreviewCard from '../components/IssuePreviewCard'
import Timeline from '../components/Timeline'
import WorkflowHeader from '../components/WorkflowHeader'
import WorkflowIcon from '../components/WorkflowIcon'
import { getOpenIssues } from '../utils/issues'

function TimelineSkeleton() {
  return (
    <section className="onboarding-skeleton" role="status" aria-label="Loading onboarding plan">
      <style>{`
        .onboarding-skeleton .osr-status {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
        }
        .onboarding-skeleton .osr-block {
          display: block; border-radius: 6px;
          background: linear-gradient(90deg, #e8edf3 25%, #f5f7fa 38%, #e8edf3 62%);
          background-size: 400% 100%; animation: onboarding-shimmer 1.4s ease infinite;
        }
        .onboarding-skeleton .osr-heading { height: 13px; width: 38%; margin-bottom: 10px; }
        .onboarding-skeleton .osr-copy { height: 9px; width: 76%; margin-bottom: 7px; }
        .onboarding-skeleton .osr-copy.short { width: 54%; }
        .onboarding-skeleton .osr-timeline { position: relative; padding-left: 44px; }
        .onboarding-skeleton .osr-timeline::before {
          content: ''; position: absolute; left: 18px; top: 12px; bottom: 22px;
          width: 2px; background: var(--gl);
        }
        .onboarding-skeleton .osr-step { position: relative; margin-bottom: 16px; }
        .onboarding-skeleton .osr-dot {
          position: absolute; left: -35px; top: 13px; width: 22px; height: 22px;
          border-radius: 50%; border: 2px solid var(--gl); background: white;
        }
        .onboarding-skeleton .osr-card {
          padding: 14px 15px; background: white; border: 1px solid var(--gl);
          border-radius: 10px; min-height: 116px;
        }
        .onboarding-skeleton .osr-card-title { height: 12px; width: 48%; margin-bottom: 12px; }
        .onboarding-skeleton .osr-card-line { height: 8px; width: 92%; margin-bottom: 7px; }
        .onboarding-skeleton .osr-card-line.mid { width: 74%; }
        .onboarding-skeleton .osr-code {
          height: 27px; margin-top: 12px; border-radius: 6px; background: #e9f3fc;
        }
        .onboarding-skeleton .osr-preview {
          min-height: 150px; padding: 16px; border-radius: 10px;
          background: #eaf5ff; border: 1px solid #c5e2fb;
        }
        .onboarding-skeleton .osr-preview-title { height: 13px; width: 82%; margin: 14px 0 12px; }
        .onboarding-skeleton .osr-tag { display: inline-block; width: 54px; height: 18px; margin: 8px 6px 0 0; border-radius: 999px; }
        .onboarding-skeleton .osr-time { height: 11px; width: 62%; margin: 13px 0; }
        @keyframes onboarding-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
        @media (prefers-reduced-motion: reduce) {
          .onboarding-skeleton .osr-block { animation: none; background: #e8edf3; }
        }
      `}</style>
      <span className="osr-status">Your onboarding plan is loading.</span>
      <div className="grid2" aria-hidden="true">
        <section>
          <div className="section-intro">
            <span className="osr-block osr-heading" />
            <span className="osr-block osr-copy" />
            <span className="osr-block osr-copy short" />
          </div>
          <div className="osr-timeline">
            {[1, 2, 3].map(step => (
              <div className="osr-step" key={step}>
                <span className="osr-dot" />
                <div className="osr-card">
                  <span className="osr-block osr-card-title" />
                  <span className="osr-block osr-card-line" />
                  <span className="osr-block osr-card-line mid" />
                  <span className="osr-block osr-code" />
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside>
          <div className="section-intro">
            <span className="osr-block osr-heading" />
            <span className="osr-block osr-copy" />
          </div>
          <div className="osr-preview">
            <span className="osr-block osr-copy short" />
            <span className="osr-block osr-preview-title" />
            <span className="osr-block osr-copy" />
            <span className="osr-block osr-copy mid" />
            <span className="osr-block osr-tag" />
            <span className="osr-block osr-tag" />
          </div>
          <section className="card mt16">
            <span className="osr-block osr-heading" />
            <span className="osr-block osr-time" />
            <span className="osr-block osr-copy short" />
          </section>
        </aside>
      </div>
    </section>
  )
}

export default function OnboardingPage() {
  const { taskId, basePath, result } = useWorkflow()
  const [plan, setPlan] = useState<OnboardingPlan | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setPlan(null)
    setError('')
    getOnboardingPlan(taskId)
      .then(data => { if (active) setPlan(data) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load onboarding plan.') })
    return () => { active = false }
  }, [taskId, attempt])

  const issue = result ? getOpenIssues(result).find(item => item.number === plan?.issue_preview.number) : undefined
  return (
    <section className="screen active">
      <WorkflowHeader title="Your Onboarding Path" subtitle={`A guided walkthrough for ${result?.metadata.full_name}`} step={2} />
      <div className="page-body" aria-busy={!plan && !error}>
        {error ? <div className="notice error" role="alert">{error}<p>Plan generation requires the configured Ollama model to be available.</p><button className="btn btn-s btn-s mt12" onClick={() => setAttempt(attempt + 1)}>Try again</button></div>
          : !plan ? <TimelineSkeleton />
            : <div className="grid2">
              <section>
                <div className="section-intro"><p className="eyebrow">First {plan.estimated_minutes} Minutes</p><h2 className="pg-title">Your action plan</h2><p className="pg-desc">Complete these steps in order to understand the project before writing any code.</p></div>
                <Timeline steps={plan.steps} />
              </section>
              <aside>
                <div className="section-intro"><p className="eyebrow">Your First Contribution</p><h2 className="pg-title">Issue preview</h2><p className="pg-desc">A starting point to explore after your environment is ready.</p></div>
                <IssuePreviewCard verified={!!issue} issue={issue ? { number: issue.number, title: issue.title, description: issue.body ?? undefined, labels: issue.labels.map(label => label.name) } : plan.issue_preview} />
                <section className="card mt16">
                  <h3 className="ctitle"><span className="ctitle-icon"><WorkflowIcon name="clock" /></span>Time Investment</h3>
                  <div className="time-row"><span>Estimated onboarding time</span><strong>~{plan.estimated_minutes} min</strong></div>
                  <p className="muted mt12">AI-generated estimate. Actual setup time depends on the project and your environment.</p>
                </section>
                <section className="card tip-card mt16"><h3 className="ctitle">A good first contribution starts small</h3><p>Read CONTRIBUTING.md, check the project's setup instructions, and confirm the issue is still open before making changes.</p></section>
              </aside>
            </div>}
      </div>
      <footer className="action-row">
        <p className="ar-hint">Next: tell us about your skills and interests</p>
        <Link className="btn btn-s" to={basePath}>Back</Link>
        <Link className="btn btn-p" to={`${basePath}/profile`}>Tell Us About You<WorkflowIcon name="arrow" /></Link>
      </footer>
    </section>
  )
}
