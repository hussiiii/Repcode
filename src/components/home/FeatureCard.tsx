import { Heading } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import type React from "react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card surface="page" padding="xl" elevation="feature">
      <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-4">{icon}</div>
      <Heading as="h3" size="xl" weight="semibold" tone="foreground" className="mb-3">{title}</Heading>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )
}

export default FeatureCard

