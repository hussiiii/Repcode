import type React from "react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-background rounded-xl p-6 border border-border shadow-lg transition-all duration-300 hover:shadow-marketing-card hover:-translate-y-1">
      <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

export default FeatureCard

