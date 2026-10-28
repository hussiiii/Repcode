import React from 'react';
import Image from 'next/image';
import { CheckIcon, XIcon, StarIcon } from 'lucide-react';

const PlatformComparison = () => {
  const platforms = [
    {
      name: 'LeetCode',
      description: 'Problem Source',
      logo: '/leetcode.png',
      features: [
        { text: 'Real company interview problems', included: true },
        { text: 'Curated roadmaps', included: false },
        { text: 'Video explanations', included: false },
        { text: 'Advanced organization tools', included: false },
        { text: 'Spaced repetition system', included: false },
        { text: 'AI-powered feedback', included: false },
        { text: 'Personalized analytics', included: false },
        { text: '100% free and open source', included: false }
      ]
    },
    {
      name: 'Neetcode',
      description: 'Problem Roadmap, Video Explanations, Courses',
      logo: '/neetcode.avif',
      features: [
        { text: 'Real company interview problems', included: true },
        { text: 'Curated roadmaps', included: true },
        { text: 'Video explanations', included: true },
        { text: 'Advanced organization tools', included: false },
        { text: 'Spaced repetition system', included: false },
        { text: 'AI-powered feedback', included: false },
        { text: 'Personalized analytics', included: false },
        { text: '100% free and open source', included: false }
      ]
    },
    {
      name: 'Repcode',
      description: 'Personalized Learning System',
      logo: '/repcode.png',
      highlight: true,
      features: [
        { text: 'Real company interview problems', included: true },
        { text: 'Curated roadmaps', included: false },
        { text: 'Video explanations', included: false },
        { text: 'Advanced organization tools', included: true },
        { text: 'Spaced repetition system', included: true },
        { text: 'AI-powered feedback', included: true },
        { text: 'Personalized analytics', included: true },
        { text: '100% free and open source', included: true }
      ]
    }
  ];

  return (
    <section className="py-20 bg-surface relative overflow-hidden">

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Repcode Stacks Up
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how Repcode complements LeetCode and Neetcode to create the ultimate learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="relative bg-background rounded-2xl border border-border p-8 transition-all duration-300 hover:shadow-xl hover:shadow-marketing-comparison"
            >

              <div className="text-center mb-8">
                <div className="mb-4">
                  <Image
                    src={platform.logo}
                    alt={`${platform.name} logo`}
                    width={48}
                    height={48}
                    className="object-contain mx-auto"
                  />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{platform.name}</h3>
                <p className="text-muted-foreground text-sm">{platform.description}</p>
              </div>

              <div className="space-y-4">
                {platform.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                                         <div className="mr-3 mt-1 flex-shrink-0">
                       {feature.included ? (
                         <CheckIcon className="w-5 h-5 text-marketing-comparison-included" />
                       ) : (
                         <XIcon className="w-5 h-5 text-marketing-comparison-excluded" />
                       )}
                     </div>
                    <span className={`text-sm ${feature.included ? 'text-muted-foreground' : 'text-dimmed'}`}>
                      {feature.text}
                    </span>
                  </div>
                                  ))}
                </div>

                {platform.highlight && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="text-center">
                      <p className="text-marketing-highlight text-sm font-medium mb-2">
                        We&apos;re not biased! 
                      </p>
                      <p className="text-muted-foreground text-xs">
                        No platform does everything, even Repcode has its pros and cons. It&apos;s meant to supplement the other two platforms, not replace them.
                      </p>
                    </div>
                  </div>
                )}
              </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PlatformComparison;
