import { FinancialOnboarding } from "@/src/components/financial-onboarding"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
        <FinancialOnboarding />
      </div>
    </div>
  )
}

