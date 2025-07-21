// Home page, entry point of the application
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  SparklesIcon,
  CheckIcon,
  BrainIcon,
  CodeIcon,
  BarChartIcon,
  Github,
  Star,
} from "lucide-react";
import NavBar from "@/components/home/NavBar";
import ContactForm from "@/components/home/ContactForm";
import Footer from "@/components/home/Footer";
import FeatureCard from "@/components/home/FeatureCard";
import ProblemListPreview from "@/components/home/ProblemListPreview";
import StudyDashboardPreview from "@/components/home/StudyDashboardPreview";
import CodeEditorPreview from "@/components/home/CodeEditorPreview";
import UserCounter from "@/components/home/UserCounter";
import LogoScroller from "@/components/home/LogoScroller";
import PlatformComparison from "@/components/home/PlatformComparison";
import "../app/globals.css";

export default function Home() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/github-stars")
      .then((res) => res.json())
      .then((data) => setStars(data.stars));
  }, []);

  return (
    <div className="min-h-screen bg-[#2A303C]">
      <NavBar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A303C] via-[#2A303C] to-[#343B4A]"></div>

        {/* Floating Code Snippets */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 top-40 transform rotate-12 opacity-10">
            <pre className="text-[#60a5fa] text-sm whitespace-pre-wrap">
              {`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`}
            </pre>
          </div>
          <div className="absolute -left-20 bottom-40 transform -rotate-12 opacity-10">
            <pre className="text-[#22d3ee] text-sm whitespace-pre-wrap">
              {`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`}
            </pre>
          </div>
          <div className="absolute right-10 bottom-20 transform rotate-6 opacity-10">
            <pre className="text-[#4ade80] text-sm whitespace-pre-wrap">
              {`function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}`}
            </pre>
          </div>
          <div className="absolute left-10 top-20 transform -rotate-6 opacity-10">
            <pre className="text-[#a78bfa] text-sm whitespace-pre-wrap">
              {`function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
  
  return visited;
}`}
            </pre>
          </div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-6 pt-44 sm:pt-40 pb-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#343B4A]/80 backdrop-blur-sm rounded-full border border-[#3A4253] mb-8">
              <SparklesIcon className="w-4 h-4 text-easy mr-2" />
              <span className="text-[#B0B7C3]">Welcome to Version 2.0</span>
            </div>
            {/* Mobile heading */}
            <h1 className="block sm:hidden text-4xl font-bold mb-4 leading-tight">
              <span className="text-primary">Your Notebook</span>
              <br />
              <span
                className="inline-block bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent leading-tight pb-1"
                style={{ color: "transparent" }}
              >
                For Leetcode
              </span>
            </h1>

            {/* Desktop heading */}
            <h1 className="hidden sm:block sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-primary">Your personalized notebook</span>
              <br />
              <span
                className="inline-block bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent leading-tight pb-1"
                style={{ color: "transparent" }}
              >
                for everything LeetCode
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#B0B7C3] mb-8 max-w-3xl mx-auto">
              <span className="block md:hidden">
                Track, organize, and master coding problems the right way!
              </span>
              <span className="hidden md:block">
                Track, organize, and master coding problems with an intelligent
                platform that adapts to your learning style and helps you retain
                knowledge longer
              </span>
            </p>

            {/* User Counter */}
            <div className="mb-12">
              <UserCounter targetCount={2000} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0891b2] hover:to-[#2563eb] text-primary rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#3b82f6]/20 hover:shadow-[#3b82f6]/30 flex items-center justify-center group"
              >
                Get Started Free
                <ArrowRightIcon className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="https://github.com/hussiiii/repcode"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-[#2A303C] backdrop-blur-sm hover:bg-black/90 text-[#ffffff] font-semibold px-8 py-3 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 ease-out hover:scale-105 border border-[#ffffff]/10 w-full sm:w-auto flex items-center justify-center"
              >
                <div className="flex items-center gap-2">
                  {stars !== null && (
                    <span className="text-sm bg-white/10 px-2 py-0.5 rounded-lg">
                      <span className="flex items-center justify-center gap-2">
                        <Star className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 text-learning fill-learning" />{" "}
                        {stars}
                      </span>
                    </span>
                  )}
                  <Github className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="text-lg">GitHub</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffffff]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            className="relative block w-full h-[50px] md:h-[70px]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0z"
              fill="#343B4A"
            ></path>
          </svg>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="py-12 bg-[#343B4A] border-y border-[#3A4253]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
            Ace the Technical Interview at Top Companies
          </h2>
          <LogoScroller />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#343B4A]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Supercharge Your Leetcode Practice
            </h2>
            <p className="text-[#B0B7C3] max-w-2xl mx-auto">
              Repcode combines intelligent tracking, AI assistance, and proven
              learning techniques to help you master algorithms and data
              structures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CodeIcon className="w-6 h-6 text-[#22d3ee]" />}
              title="AI Code Review"
              description="Get instant feedback on your solutions with our AI-powered code review system."
            />
            <FeatureCard
              icon={<BrainIcon className="w-6 h-6 text-[#60a5fa]" />}
              title="Spaced Repetition"
              description="Fully customizable spaced repetition system to help you retain knowledge longer."
            />
            <FeatureCard
              icon={
                <div className="flex items-center justify-center">
                  <Image
                    src="/leetcode.png"
                    alt="LeetCode"
                    width={32}
                    height={32}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              }
              title="Direct LeetCode Sync"
              description="Sync problems directly from LeetCode without sharing your account information."
            />
            <FeatureCard
              icon={<BarChartIcon className="w-6 h-6 text-[#a78bfa]" />}
              title="Detailed Insights"
              description="Track your progress with comprehensive statistics and performance analytics."
            />
          </div>
        </div>
      </section>

      {/* Platform Comparison Section */}
      <PlatformComparison />

      {/* Problem List Preview Section */}
      <section className="py-20 bg-[#2A303C] relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#2A303C] text-[#B0B7C3] mb-4">
                ORGANIZE YOUR PROBLEMS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Organize and Customize Everything
              </h2>
              <p className="text-[#B0B7C3] mb-8">
                No more excel spreadsheets! Use our friendly and intuitive UI to
                store, organize, and customize Leetcode problems
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Group problems by algorithm type or data structure",
                  "Track performance metrics and view personalized statistics",
                  "Filter and sort to find exactly what you need",
                  "Import problem sets directly from Leetcode",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]">
                      <CheckIcon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[#B0B7C3]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-[#2A303C] rounded-xl border border-[#3A4253] shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-[0_4px_14px_0_rgba(59,130,246,0.1)] hover:-translate-y-1">
                <ProblemListPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Editor Preview Section */}
      <section className="py-20 bg-[#343B4A] relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-l from-[#22d3ee]/20 to-transparent rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#343B4A] text-[#B0B7C3] mb-4">
                INTEGRATED CODING ENVIRONMENT
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Solve problems with our custom all-in-one interface
              </h2>
              <p className="text-[#B0B7C3] mb-8">
                Our integrated coding environment makes it easy to understand,
                solve, and review Leetcode problems all in one place.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Split-panel interface with problem description and code editor",
                  "Built-in AI assistant to help when you get stuck",
                  "Save personal notes and solutions for future reference",
                  "Support for multiple programming languages",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]">
                      <CheckIcon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[#B0B7C3]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-[#343B4A] rounded-xl border border-[#3A4253] shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-[0_4px_14px_0_rgba(59,130,246,0.1)] hover:-translate-y-1 mx-auto max-w-full">
                <CodeEditorPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Dashboard Preview Section */}
      <section className="py-20 bg-[#2A303C] relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#343B4A] text-[#B0B7C3] mb-4">
                TRACK YOUR PROGRESS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Spatial Repetition Review
              </h2>
              <p className="text-[#B0B7C3] mb-8">
                Each day, solve only the problems you need to so your brain
                learns new strategies and reinforces key concepts in the most
                effective way possible.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Track your daily study streak and build consistency",
                  "See which problems are due for review today",
                  "Monitor your progress with beautiful visualizations",
                  "Get personalized recommendations based on your performance",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]">
                      <CheckIcon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[#B0B7C3]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-[#343B4A] rounded-xl border border-[#3A4253] shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-[0_4px_14px_0_rgba(59,130,246,0.1)] hover:-translate-y-1">
                <StudyDashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#343B4A] relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Loved by Developers
            </h2>
            <p className="text-[#B0B7C3] max-w-2xl mx-auto">
              See what our users have to say about how Repcode has transformed
              their coding interview preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Repcode's spaced repetition system has completely changed how I retain algorithm knowledge. I'm actually remembering solutions months later!",
                name: "Tariq A.",
                title: "Software Engineer @ Marqeta",
              },
              {
                quote:
                  "This is hands down the best tool I've ever used to practice Leetcode and prepare for technicals. I will be sharing this with my fellow CS classmates for sure.",
                name: "Mohnish G.",
                title: "SWE Intern @ Microsoft",
              },
              {
                quote:
                  "Hey, I've just started using this website and I feel its amazing. Thank you for this. This is going to help me immensely in my preparation to get into a good company.",
                name: "Abhishek C.",
                title: "CS Student",
              },
              {
                quote:
                  "I used to use Anki to study Leetcode, but Repcode is like 1000x better. Way more features, easier to use, and it feels like I can learn way faster.",
                name: "Noor H.",
                title: "Software Engineer @ Zoox",
              },
              {
                quote:
                  "Great site, really helped me grind technical interview prep for the very short duration that I was actually prepping. I found it useful for that time though.",
                name: "Tejes S.",
                title: "Founder/CEO @ Poppin",
              },
              {
                quote:
                  "Really cool concept and fantastic execution! For the first time ever in my life I actually enjoyed learning about and practicing Leetcode. Weird I know.",
                name: "Saba A.",
                title: "TPM @ Google",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#2A303C] rounded-xl p-6 border border-[#3A4253] shadow-lg"
              >
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#FACC15] mr-1">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[#B0B7C3] mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] flex items-center justify-center text-primary font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-primary font-medium">
                      {testimonial.name}
                    </h4>
                    <p className="text-[#B0B7C3] text-sm">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-20 bg-[#2A303C]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#B0B7C3] max-w-2xl mx-auto">
              Choose the plan that works best for your interview preparation needs.
            </p>
          </div>

          <PricingTable />
        </div>
      </section> */}

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#2A303C]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
