import React, { useEffect } from 'react';
import NavBar from '@/components/home/NavBar';
import Footer from '@/components/home/Footer';
import "../app/globals.css";
import Link from 'next/link';
import { 
    FolderIcon, 
    BookOpenIcon, 
    Settings as SettingsIcon, 
    User as UserIcon, 
    Home as HomeIcon, 
    HelpCircle as HelpCircleIcon, 
    LogOut as LogOutIcon,
  } from 'lucide-react';


export default function Guide() {
    return (
        <div className="relative flex flex-col min-h-screen bg-background">
            <NavBar />
            
            <div className="relative max-w-screen-xl mx-auto px-2 sm:px-4">
                {/* Fixed Table of Contents - Desktop */}
                <div className="hidden lg:block fixed right-2 xl:right-8 top-28 w-80 xl:w-96 z-10 max-h-[80vh] overflow-y-auto">
                    <div className="bg-gradient-to-r from-foreground/10 to-action/10 rounded-xl px-4 xl:px-6 py-4 border border-foreground/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center rounded-full bg-foreground/20 w-12 h-12 mr-3 p-2">
                                <span className="text-xl">📌</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Guide Contents</h2>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="bg-background p-3 rounded-lg shadow-sm border border-border/20">
                                <a href="#what-is-repcode" className="block text-foreground hover:text-action transition-colors font-medium">
                                    What is Repcode?
                                </a>
                            </div>
                            
                            <div className="bg-background p-3 rounded-lg shadow-sm border border-border/20">
                                <a href="#what-repcode-is-not" className="block text-foreground hover:text-action transition-colors font-medium">
                                    What Repcode is not
                                </a>
                            </div>
                            
                            <div className="bg-background p-3 rounded-lg shadow-sm border border-border/20">
                                <a href="#exploring-platform" className="block text-foreground hover:text-action transition-colors font-medium">
                                    Part 0: Exploring the Platform
                                </a>
                            </div>
                            
                            <div className="bg-background p-3 rounded-lg shadow-sm border border-border/20">
                                <a href="#organization-customization" className="block text-foreground hover:text-action transition-colors font-medium">
                                    Part 1: Organization and Customization
                                </a>
                            </div>
                            
                            <div className="bg-background p-3 rounded-lg shadow-sm border border-border/20">
                                <a href="#spatial-repetition-algorithm" className="block text-foreground hover:text-action transition-colors font-medium">
                                    Part 2: The Spatial Repetition Algorithm
                                </a>
                                <div className="mt-2 ml-2 space-y-2">
                                    <div className="bg-background/50 p-2 rounded border border-border/10">
                                        <a href="#how-to-use-study-mode" className="block text-foreground hover:text-action transition-colors text-sm">
                                            Part 2.1: How to Use Study Mode
                                        </a>
                                    </div>
                                    <div className="bg-background/50 p-2 rounded border border-border/10">
                                        <a href="#how-algorithm-works" className="block text-foreground hover:text-action transition-colors text-sm">
                                            Part 2.2: How the Algorithm Works
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-background p-3 rounded-lg shadow-sm border border-border/20">
                                <a href="#ai-feedback" className="block text-foreground hover:text-action transition-colors font-medium">
                                    Part 3: AI Feedback
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main Content */}
                <div className="bg-background p-2 sm:p-4 pt-24 sm:pt-8 max-w-3xl mx-auto lg:mr-72 xl:mr-80">
                    {/* Mobile Table of Contents */}
                    <div className="lg:hidden mt-16 mb-8">
                        <div className="bg-gradient-to-r from-foreground/10 to-action/10 rounded-xl p-4 border border-foreground/20 shadow-md">
                            <details>
                                <summary className="flex items-center cursor-pointer">
                                    <div className="bg-foreground/20 rounded-full p-1 mr-2">
                                        <span className="text-lg">📑</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Guide Contents</h2>
                                </summary>
                                
                                <div className="mt-4 space-y-3">
                                    <div className="bg-background p-2 rounded-lg shadow-sm border border-border/20">
                                        <a href="#what-is-repcode" className="block text-foreground hover:text-action font-medium">
                                            What is Repcode?
                                        </a>
                                    </div>
                                    
                                    <div className="bg-background p-2 rounded-lg shadow-sm border border-border/20">
                                        <a href="#what-repcode-is-not" className="block text-foreground hover:text-action font-medium">
                                            What Repcode is not
                                        </a>
                                    </div>
                                    
                                    <div className="bg-background p-2 rounded-lg shadow-sm border border-border/20">
                                        <a href="#exploring-platform" className="block text-foreground hover:text-action font-medium">
                                            Part 0: Exploring the Platform
                                        </a>
                                    </div>
                                    
                                    <div className="bg-background p-2 rounded-lg shadow-sm border border-border/20">
                                        <a href="#organization-customization" className="block text-foreground hover:text-action font-medium">
                                            Part 1: Organization and Customization
                                        </a>
                                    </div>
                                    
                                    <div className="bg-background p-2 rounded-lg shadow-sm border border-border/20">
                                        <a href="#spatial-repetition-algorithm" className="block text-foreground hover:text-action font-medium">
                                            Part 2: The Spatial Repetition Algorithm
                                        </a>
                                        <div className="mt-2 ml-2 space-y-2">
                                            <div className="bg-background/50 p-2 rounded border border-border/10">
                                                <a href="#how-to-use-study-mode" className="block text-foreground hover:text-action text-sm">
                                                    Part 2.1: How to Use Study Mode
                                                </a>
                                            </div>
                                            <div className="bg-background/50 p-2 rounded border border-border/10">
                                                <a href="#how-algorithm-works" className="block text-foreground hover:text-action text-sm">
                                                    Part 2.2: How the Algorithm Works
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-background p-2 rounded-lg shadow-sm border border-border/20">
                                        <a href="#ai-feedback" className="block text-foreground hover:text-action font-medium">
                                            Part 3: AI Feedback
                                        </a>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>

                {/* Banner */}
                <div className="mt-16 bg-gradient-to-r from-reminder-end/20 to-chart-series-yellow/20 border-l-4 border-reminder-end mb-8 p-4 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-6 h-6 bg-reminder-end rounded-full flex items-center justify-center">
                                <span className="text-foreground text-sm font-bold">!</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Quick Note</h3>
                            <p className="text-muted-foreground text-base">
                                This guide is kinda scuffed, but I hope it is comprehensive enough to explain how to best use this application. The first-time user video is probably better, so go watch that too!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Platform Overview Video */}
                <div className="mb-16">
                    <div className="bg-gradient-to-br from-background to-surface-dialog-end rounded-xl p-6 border border-border-subtle/50 shadow-lg">
                        <h3 className="text-2xl font-semibold text-foreground mb-4 text-center">Video Guide for First Time Users</h3>

                        <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden"> {/* 16:9 aspect ratio */}
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src="https://www.youtube.com/embed/Hn4znv8I2a4"
                                title="Repcode Platform Overview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-24" id="what-is-repcode">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">What is Repcode?</h2>
                    </div>
                    
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">Repcode is a platform built to empower software engineers to excel in Leetcode-style technical interviews. It helps you achieve this in three main ways: </p>
                    
                    <div className="space-y-6">
                        <div className="p-5 border border-border/30 rounded-lg bg-background/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-foreground mb-3">1. Organize, Categorize, and Analyze</h3>
                            <p className="text-muted-foreground">The intuitive UI/UX makes it simple to organize and categorize problems. In addition, a detailed statistic breakdown of every problem you add to Repcode is available, helping you target your weaknesses and identify your strengths. You can also store notes and commented solutions with each problem, allowing you to refer back to them at any time for further review.</p>
                        </div>
                        
                        <div className="p-5 border border-border/30 rounded-lg bg-background/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-foreground mb-3">2. Spatial Repetition Review</h3>
                            <p className="text-muted-foreground">A built-in spatial repetition algorithm ensures you don&apos;t forget what you&apos;ve learned, intelligently scheduling reviews of past problems to reinforce your understanding.</p>
                        </div>
                        
                        <div className="p-5 border border-border/30 rounded-lg bg-background/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-foreground mb-3">3. AI-Powered Feedback</h3>
                            <p className="text-muted-foreground">Integrated AI (trained on the problem and its optimal solution) provides instant feedback on your solutions, helping you identify mistakes and areas for improvement in real-time.</p>
                        </div>
                    </div>
                    
                    <p className="text-muted-foreground my-8 text-lg">We will expand on each of these features in more detail below. But first, let&apos;s clarify how Repcode is meant to be used and what it is not designed for.</p>
                </div>

                <div className="mb-24" id="what-repcode-is-not">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">What Repcode is not</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-action/10 to-foreground/10 p-5 border-l-4 border-action rounded-r-lg my-6">
                        <p className="text-muted-foreground text-lg">Repcode is not intended to replace Leetcode but rather to complement it. Think of Leetcode as your textbook and Repcode as your personalized notebook for problem-solving. Repcode helps you organize, review, and receive feedback on your work, making the learning process more structured and effective.</p>
                    </div>

                    <p className="text-muted-foreground mb-6 text-lg">To master Leetcode, it&apos;s important to understand that simply tackling random problems without focus or strategy isn&apos;t the best approach. Technical interviews often test your grasp of key data structures and algorithms, so building a strong foundation is critical. For example, trying to solve complex backtracking or binary search problems before you fully understand arrays and two-pointer techniques isn&apos;t productive.</p>
                    
                    <p className="text-muted-foreground mb-6 text-lg">Mastering Leetcode requires solving problems in patterns, progressing from fundamental concepts to more complex ones. Roadmaps like the <Link className="text-action underline hover:text-action/80 transition-colors" href="https://neetcode.io/" target="_blank" rel="noopener noreferrer">Neetcode 150</Link> guide you through this process by organizing problems into patterns. Once you grasp the patterns, you&apos;re better equipped to solve a wide variety of new, unseen problems.</p>
                    
                    <div className="flex flex-col items-center gap-3 my-8 bg-background/50 p-4 rounded-lg shadow-sm overflow-hidden">
                        <img src="/guide/neetcode.png" alt="Neetcode 150 roadmap" className="w-full max-w-2xl rounded-lg shadow-md object-contain" />
                        <p className="text-muted-foreground text-sm italic">The top part of the Neetcode 150 roadmap</p>
                    </div>

                    <p className="text-muted-foreground mb-8 text-lg">So then, where does Repcode factor in? Repcode provides a way to create <span className="text-foreground">custom collections</span> to group problems by pattern or concept. For instance, if you&apos;re studying linked lists, you can create a collection called &quot;Linked Lists&quot; and store all your Leetcode problems, notes, and solutions for that pattern in one place. This allows you to easily revisit problems and review your thought processes.  </p>

                    <p className="text-muted-foreground mb-8 text-lg">Additionally, every problem you add to a collection is automatically included in <span className="text-foreground">Study Mode</span>,  which leverages the spatial repetition algorithm. This ensures you review problems at the optimal time for retention, so you won&apos;t lose track of what you&apos;ve learned and reinforce your learning over time.</p>

                    <p className="text-muted-foreground mb-8 text-lg">To further enhance your study process, Repcode integrates with an <span className="text-foreground">AI-Powered Assistant</span> that provides instant feedback when you&apos;re stuck on a solution, giving you helpful hints and corrections in real-time. </p>

                    <p className="text-muted-foreground mb-8 text-lg">In short, Repcode addresses three major challenges when it comes to mastering Leetcode: <span className="text-foreground">Organization</span>, <span className="text-foreground">Review</span>, and <span className="text-foreground">Feedback</span> — all with the help of collections, Study Mode, and AI integration. </p>
                </div>

                {/* Key Takeaways Section */}
                <div className="mb-24">
                    <div className="bg-gradient-to-r from-foreground/10 to-action/10 rounded-xl p-6 border border-foreground/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center bg-foreground/20 rounded-full w-12 h-12 p-2 mr-3">
                                <span className="text-2xl">🔑</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Key Takeaways</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">1.</div>
                                <div>
                                    <strong className="text-foreground">Leetcode</strong>
                                    <p className="text-muted-foreground">Problem source (textbook)</p>
                                </div>
                            </div>
                            
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">2.</div>
                                <div>
                                    <strong className="text-foreground">Repcode</strong>
                                    <p className="text-muted-foreground">Learning tool (notebook)</p>
                                </div>
                            </div>
                            
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">3.</div>
                                <div>
                                    <strong className="text-foreground">Together</strong>
                                    <p className="text-muted-foreground">Maximum benefit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24" id="exploring-platform">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Part 0: Exploring the Platform</h2>
                    </div>
                    
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                        Before we dive into the specifics of how Repcode works, let&apos;s first explore the platform itself. When you login, you will see an expandable sidebar on the left. Use this to navigate to the different parts of the platform. Each symbol in the sidebar will take you to a separate page:
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center p-4 border-l-4 border-muted-foreground rounded-r-lg bg-background/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-muted-foreground/10 rounded-full">
                                <FolderIcon size={24} className="text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Collections</h3>
                                <p className="text-muted-foreground">View and manage your collections. Here, you can see a grid layout showing all the collections you have made so far, and you can click into any one of them to access the problems stored within. You can also edit, delete, and create new collections from this page.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-muted-foreground rounded-r-lg bg-background/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-muted-foreground/10 rounded-full">
                                <BookOpenIcon size={24} className="text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Study</h3>
                                <p className="text-muted-foreground">Review problems using spatial repetition. A more detailed breakdown of how this works can be found in the following sections.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-muted-foreground rounded-r-lg bg-background/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-muted-foreground/10 rounded-full">
                                <SettingsIcon size={24} className="text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Settings</h3>
                                <p className="text-muted-foreground">Customize various aspects of the spatial repetition algorithm. Again, a detailed breakdown of these settings can be found in the following sections.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-muted-foreground rounded-r-lg bg-background/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-muted-foreground/10 rounded-full">
                                <HomeIcon size={24} className="text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Homepage</h3>
                                <p className="text-muted-foreground">Exit the application and return to the main landing page.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-muted-foreground rounded-r-lg bg-background/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-muted-foreground/10 rounded-full">
                                <HelpCircleIcon size={24} className="text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Help</h3>
                                <p className="text-muted-foreground">Opens a new window to the guide page (where you are right now!)</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-status-error rounded-r-lg bg-background/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-status-error/10 rounded-full">
                                <LogOutIcon size={24} className="text-status-error" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Logout</h3>
                                <p className="text-muted-foreground">Sign out of your account.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24" id="organization-customization">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Part 1: Organization and Customization</h2>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        The first part of this guide will cover how to use Repcode to effectively organize your Leetcode problems, and attach notes and solutions to them. As mentioned earlier, the best way to improve at Leetcode is to break down problems into patterns and focus on practicing within those specific patterns. Repcode makes this easy by allowing you to create collections.
                    </p>
                    
                    <div className="bg-action/5 border-l-4 border-action p-4 rounded-r-lg mb-6">
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Each collection can hold multiple problems, and you can customize these collections as needed. For example, you can rename a collection at any time by clicking the pen and paper icon on the bottom left of the collection card. You can also delete a collection by clicking the trash icon next to it, but keep in mind that doing so will permanently delete all the problems within it, and this action cannot be undone.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center my-10 bg-background/50 p-4 rounded-lg shadow-sm overflow-hidden">
                        <img src="/guide/collections.png" alt="Collections dashboard" className="w-full max-w-2xl rounded-lg shadow-md object-contain" />
                        <p className="text-muted-foreground text-sm mt-3 italic">An example dashboard showing some collections</p>
                    </div>
                    <p className="text-muted-foreground mb-8 text-lg">
                    From the <span className="text-foreground">dashboard view</span>, which shows all your collections, you can quickly access key information at a glance. This includes when the last problem was added to a collection, as well as a breakdown of the problems by type — categorized into <span className="text-foreground">New</span>, <span className="text-foreground">Learning</span>, and <span className="text-foreground">Review</span> stages. The color bar at the bottom gives you an instant snapshot of your progress within each collection. The more green the bar, the better your understanding of that pattern, as it means more problems are in the Review stage, indicating strong familiarity. Note that if there is a red warning symbol next to the Last Updated date, it means it has been longer than a month since you last solved a new problem from that collection, so it&apos;s recommended you should try and solve a new one soon to keep your understanding fresh! Remember that it is important to tackle novel problems from time to time, in addition to reviewing old ones!
                    </p>
                    <p className="text-muted-foreground mb-8 text-lg">
                        When creating a new problem in a collection, you will be prompted to fill out a form with all sorts of information about the problem. You can enter the Leetcode problem number and click Autofill to automatically scrape these details from Leetcode directly, or you can manually fill out the details yourself. These include: 
                    </p>
                    <div className="overflow-x-auto overflow-hidden rounded-lg border border-border shadow-sm mb-8">
                        <table className="min-w-full bg-background divide-y divide-divide">
                            <thead className="bg-background/70">
                                <tr>
                                    <th className="px-6 py-3 text-left text-lg font-bold text-foreground">Field</th>
                                    <th className="px-6 py-3 text-left text-lg font-bold text-foreground">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-divide/30">
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Name</td>
                                    <td className="px-6 py-4 text-muted-foreground">The problem&apos;s name as listed on Leetcode.</td>
                                </tr>
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Question</td>
                                    <td className="px-6 py-4 text-muted-foreground">The actual problem statement itself.</td>
                                </tr>
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Solution</td>
                                    <td className="px-6 py-4 text-muted-foreground">The code solution to the problem. It is recommended you put your own solution here, one that makes sense to you.</td>
                                </tr>
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Function Signature <span className="text-sm font-normal">(optional)</span></td>
                                    <td className="px-6 py-4 text-muted-foreground">The boilerplate code associated with the solution. On Leetcode, if you select any random problem you will notice there is already some boilerplate code in the code editor: this is the function signature. We ask for it so that we can mimic this in our own code editor.</td>
                                </tr>
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Programming Language</td>
                                    <td className="px-6 py-4 text-muted-foreground">The programming language you will use to solve the problem. Used for syntax highlighting/AI integration purposes.</td>
                                </tr>
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Link to Problem <span className="text-sm font-normal">(optional)</span></td>
                                    <td className="px-6 py-4 text-muted-foreground">The URL that will direct to the problem&apos;s page on Leetcode.</td>
                                </tr>
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Additional Notes <span className="text-sm font-normal">(optional)</span></td>
                                    <td className="px-6 py-4 text-muted-foreground">Any notes you wish to make for yourself about the problem.</td>
                                </tr>
                                <tr className="hover:bg-background/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-muted-foreground">Problem Difficulty</td>
                                    <td className="px-6 py-4 text-muted-foreground">The problem&apos;s difficulty as shown on Leetcode (easy, medium, or hard).</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-muted-foreground mb-8 text-lg">
                    And that&apos;s it — <span className="text-foreground">organizing your problems is that simple</span>! Once a problem is logged into a collection, you can easily return to it at any time to re-solve it, view your solution, and receive feedback all within the platform. No need to maintain Excel spreadsheets or juggle multiple browser tabs—Repcode keeps everything organized in one place for you.
                    </p>
                    <div className="flex flex-col items-center mb-8 overflow-hidden">
                        <img src="/guide/problemview.png" alt="collections image" className="w-full max-w-2xl rounded-lg shadow-md object-contain" />
                        <p className="text-muted-foreground text-sm">What the problem view looks like</p>
                    </div>

                    <p className="text-muted-foreground mb-8 text-lg">
                    When you add a problem to a collection, it will also automatically be integrated into <span className="text-foreground">Study Mode</span>, which leverages the spatial repetition algorithm mentioned earlier. This ensures that you review problems at the optimal time to reinforce your learning. If you delete a problem from a collection, it will also be removed from Study Mode. For more information about this, refer to the next section.
                    </p>
                </div>

                {/* Key Takeaways Section */}
                <div className="mb-24">
                    <div className="bg-gradient-to-r from-foreground/10 to-action/10 rounded-xl p-6 border border-foreground/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center bg-foreground/20 rounded-full w-12 h-12 p-2 mr-3">
                                <span className="text-2xl">🔑</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Key Takeaways</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">1.</div>
                                <div>
                                    <strong className="text-foreground">Collections</strong>
                                    <p className="text-muted-foreground">Organize your problems by patterns</p>
                                </div>
                            </div>
                            
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">2.</div>
                                <div>
                                    <strong className="text-foreground">Customization</strong>
                                    <p className="text-muted-foreground">Personalize every detail</p>
                                </div>
                            </div>
                            
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">3.</div>
                                <div>
                                    <strong className="text-foreground">All-in-one</strong>
                                    <p className="text-muted-foreground">Repcode tracks everything</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-24" id="spatial-repetition-algorithm">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Part 2: The Spatial Repetition Algorithm</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-action/5 to-foreground/5 p-6 rounded-lg mb-8 border-l-4 border-action">
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            One of the unique aspects of Repcode is its ability to not only help you store and organize problems, but also review them efficiently through <span className="text-foreground">Study Mode</span>, powered by a fully customizable spatial repetition algorithm. This algorithm, similar to the one used by Anki, ensures that you never forget what you&apos;ve learned by spacing out your review sessions. As of this writing, Repcode is the only actively maintained platform that offers this feature out of the box.
                        </p>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        <span className="text-foreground">What is spatial repetition?</span> In short, it&apos;s a learning technique that schedules review sessions at increasing intervals to improve long-term retention. It&apos;s based on the idea that the brain retains information best when it&apos;s reviewed at strategic points, rather than in one sitting. Also, the algorithm is very smart, and will quickly determine what data structures and specific problems you struggle with, and which ones you find easier, and adjust itself accordingly so that you spend more time on problems that you have trouble with.
                    </p>
                    
                    <p className="text-muted-foreground mb-4 text-lg leading-relaxed">This section will be split into two sub-parts:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        <div className="bg-background/50 p-5 rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center mb-2">
                                <div className="bg-foreground/10 text-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">1</div>
                                <h3 className="text-lg font-bold text-foreground">How to use Study Mode</h3>
                            </div>
                            <p className="text-muted-foreground">Learn the basics of navigating and using the study mode feature.</p>
                        </div>
                        
                        <div className="bg-background/50 p-5 rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center mb-2">
                                <div className="bg-foreground/10 text-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">2</div>
                                <h3 className="text-lg font-bold text-foreground">How the algorithm works</h3>
                            </div>
                            <p className="text-muted-foreground">Understand the technical details of how the spatial repetition algorithm functions.</p>
                        </div>
                    </div>

                    <div className="relative mb-6" id="how-to-use-study-mode">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Part 2.1: How to use Study Mode</h2>
                    </div>
                    
                    <div className="bg-foreground/5 rounded-lg p-5 border-l-4 border-foreground mb-6">
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            <span className="text-foreground">First, the easy part:</span> how to use it. The great thing about Study Mode is that it&apos;s largely <span className="text-foreground">automatic</span> — the spatial repetition algorithm updates and manages itself. Whenever you add a problem to a collection, it&apos;s automatically included in Study Mode and factored into the algorithm.
                        </p>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">Your role is minimal: just navigate to the Study Mode section and, when you have problems due for review, a &quot;Study Now&quot; button will appear. Clicking this button will prompt you to solve the problems assigned for that day.</p>
                    
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">After solving each problem, head to the Solutions tab and choose the button that best reflects how difficult you found the problem:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="border border-status-error-border rounded-md p-4 text-center bg-status-error-border/5 hover:bg-status-error-border/10 transition-colors">
                            <h4 className="text-status-error text-xl font-bold mb-2">Again</h4>
                            <p className="text-muted-foreground text-sm">For problems you couldn&apos;t solve</p>
                        </div>
                        
                        <div className="border border-feedback-hard-border rounded-md p-4 text-center bg-feedback-hard-border/5 hover:bg-feedback-hard-border/10 transition-colors">
                            <h4 className="text-feedback-hard text-xl font-bold mb-2">Hard</h4>
                            <p className="text-muted-foreground text-sm">For problems that were difficult</p>
                        </div>
                        
                        <div className="border border-feedback-good-border rounded-md p-4 text-center bg-feedback-good-border/5 hover:bg-feedback-good-border/10 transition-colors">
                            <h4 className="text-feedback-good text-xl font-bold mb-2">Good</h4>
                            <p className="text-muted-foreground text-sm">For problems you solved well</p>
                        </div>
                        
                        <div className="border border-feedback-easy-border rounded-md p-4 text-center bg-feedback-easy-border/5 hover:bg-feedback-easy-border/10 transition-colors">
                            <h4 className="text-feedback-easy text-xl font-bold mb-2">Easy</h4>
                            <p className="text-muted-foreground text-sm">For problems that were very easy</p>
                        </div>
                    </div>

                    <p className="text-muted-foreground mb-8 text-lg">If certain buttons aren&apos;t available for a problem, don&apos;t worry — this is intentional. Based on factors such as the problem&apos;s difficulty and current type, the algorithm may restrict some options to ensure more accurate feedback. Here&apos;s a quick guide on when to choose each option: </p>
                    <div className="mb-8 flex justify-center items-center overflow-x-auto">
                        <table className="min-w-full bg-background border border-border">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Button</th>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-status-error">Again</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">Press this one if you had no idea how to even approach the problem.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-difficulty-medium">Hard</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">Press this one if you were able to at least come up with a solution that passed some test cases, but was not optimal.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-difficulty-easy">Good</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">Press this one if you could come up with and thoroughly explain the optimal approach to solving this problem.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-action">Easy</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">Press this one if you could optimally solve the problem very quickly with little thought.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-muted-foreground mb-8 text-lg">Each day, the algorithm will assess the feedback you&apos;ve given on the problem and other factors to decide when you should review it again. </p>
                    <div className="flex flex-col items-center mb-8 overflow-hidden">
                        <img src="/guide/studydashboard.png" alt="collections image" className="w-full max-w-2xl rounded-lg shadow-md mb-2 object-contain" />
                        <p className="text-muted-foreground text-sm">A bar graph showing future review session workloads</p>
                    </div>
                    <p className="text-muted-foreground mb-8 text-lg">It is important to use Study Mode consistently — <span className="font-bold">daily practice </span> is ideal to keep your workload manageable. But don&apos;t worry if you miss a few days; the algorithm won&apos;t break. Problems you miss will simply be pushed to future days. However, keep in mind that delaying too many days will increase your workload in the future, so try to stay on top of your reviews to avoid falling behind. </p>
                    <p className="text-muted-foreground mb-8 text-lg">You might also notice that each problem in Repcode has an associated <span className="font-bold">Type</span>. These types help the spatial repetition algorithm determine how often you should review each problem based on how well you know it. The types are: </p>
                    <div className="mb-16 flex justify-center items-center overflow-x-auto">
                        <table className="min-w-full bg-background border border-border">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Type</th>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-study-new">New</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">A problem is classified as New when it&apos;s first added. You haven&apos;t given any feedback yet, so the algorithm doesn&apos;t know how well you understand it. A problem cannot revert to the New state once it leaves it.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-study-learning">Learning</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">A problem that&apos;s in the process of becoming a Review problem. You can solve it, but the algorithm has determined that your grasp is not yet strong enough.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-study-learning">Relearning</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">A problem that was previously categorized as Review, but due to poor recent feedback, it has returned to a state where more practice is needed.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-study-review">Review</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">A problem you are confident in and can solve without much effort. These problems will appear less frequently in Study Mode, as the algorithm considers them well-understood.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Key Takeaways Section */}
                    <div className="mb-24">
                        <div className="bg-gradient-to-r from-foreground/10 to-action/10 rounded-xl p-6 border border-foreground/20 shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center bg-foreground/20 rounded-full w-12 h-12 p-2 mr-3">
                                    <span className="text-2xl">🔑</span>
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Key Takeaways</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                    <div className="mr-3 text-foreground text-3xl font-light">1.</div>
                                    <div>
                                        <strong className="text-foreground">Automatic</strong>
                                        <p className="text-muted-foreground">Just create problems and give feedback</p>
                                    </div>
                                </div>
                                
                                <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                    <div className="mr-3 text-foreground text-3xl font-light">2.</div>
                                    <div>
                                        <strong className="text-foreground">Feedback</strong>
                                        <p className="text-muted-foreground">Rate problems based on your performance</p>
                                    </div>
                                </div>
                                
                                <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                    <div className="mr-3 text-foreground text-3xl font-light">3.</div>
                                    <div>
                                        <strong className="text-foreground">Daily practice</strong>
                                        <p className="text-muted-foreground">Stay consistent for best results</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <h2 className="text-3xl font-bold mb-2 inline-block border-border text-foreground" id="how-algorithm-works">Part 2.2: How the Spatial Repetition Algorithm Works</h2>
                    <p className="text-muted-foreground mb-8 text-lg"><span className="text-foreground">Second, let&apos;s now delve into how the spatial repetition algorithm works</span>, how the different settings are related to it, and how you can tweak them to make the algorithm more tailored to your learning style. Keep in mind that the default settings are not arbitrary; they were carefully chosen because they represent what works best for most users. However, if you&apos;d like to tailor the algorithm to better suit your needs, this section will explain the settings in detail and how to adjust them. </p>
                    <p className="text-muted-foreground mb-8 text-lg">While entire books have been written about the spatial repetition algorithm, we&apos;ll keep it concise here. To get a deeper understanding of the technical aspects, I highly recommend watching the two videos below. Both were extensively referenced when we implemented the algorithm in Repcode. Although these videos discuss Anki, the algorithm used in Repcode is identical. </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/Eo1HbXEiJxo?si=OOwMOtblzL92izBT&amp;start=161"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/lz60qTP2Gx0?si=7Yvd3Bq5sVvY-kvj&amp;start=64"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <p className="text-muted-foreground mb-8 text-xl"><span className="font-bold">If you plan on using Repcode long term, and truly want to understand how the algorithm works and how to make it work best for you, I highly recommend watching the above two videos.</span> For now, let&apos;s discuss the settings, how they relate to the algorithm, and how you can customize the settings to match your needs. But first, some key terms: </p>

                    <div className="mb-8 flex justify-center items-center">
                        <table className="min-w-full bg-background border border-border">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Term</th>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Definition</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Interval</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">The interval represents how long the algorithm waits before showing a problem for review again, in days. Based on your feedback (via the buttons: Again, Hard, Good, Easy), the current interval, problem type, and other factors, the algorithm will calculate the next review interval.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Ease Factor</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">This percentage indicates how easy the algorithm believes a problem is for you to solve. The easier a problem has been in the past, the greater the Ease will be, and the longer the intervals between reviews will be. Initially, all problems start with the same ease factor, but it adjusts based on your performance.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-muted-foreground mb-8 text-lg">Alright, so with that vocabulary out of the way, let us now talk about each of the settings in detail, what they do, along with examples so you can fully understand how they all work in relation to the spatial repetition algorithm. Again, to truly understand how everything works, please watch the above two videos in full. </p>

                    <div className="mb-8 flex justify-center items-center">
                        <table className="min-w-full bg-background border border-border">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Setting</th>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Default Value</th>
                                    <th className="px-4 py-2 border-b-2 border-border text-left text-lg font-bold text-foreground">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Learning steps</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">10m, 1d</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">These apply to <span className="font-bold">New/Learning</span> problems. The first number (10m) represents how soon you&apos;ll see the problem again if you press <span className="font-bold">Again</span>. Every time you press <span className="font-bold">Good</span>, the problem advances to the next step (e.g., if the next step is 1d, you&apos;ll see it in 1 day).</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Graduating interval</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">3d</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">After a problem has gone through all its learning steps and you press <span className="font-bold">Good</span>, it &quot;graduates&quot; from a Learning problem to a <span className="font-bold">Review</span> problem. The graduating interval determines when it will be shown to you again right after it becomes a Review problem.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Easy interval</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">4d</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">If you press <span className="font-bold">Easy</span> during the learning steps, the problem skips all remaining steps and immediately graduates to a Review problem. The easy interval determines when it will next appear.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Relearning steps</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">10m</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">When you press <span className="font-bold">Again</span> on a Review problem, it changes to a <span className="font-bold">Relearning</span> problem. It must then go through the Relearning steps before it can become a Review problem again. These steps function similarly to Learning steps.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">New interval</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">0.75</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">A percentage (less than 100%) that will be applied to the ease factor of Relearning problems once they graduate and become Review problems again. It ensures that even though a problem is back in Review, it&apos;s reviewed more frequently to reinforce your knowledge.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Maximum interval</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">180 (in days)</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">This is the maximum number of days a Review problem can go without being shown again. It prevents overly long gaps between reviews.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Starting ease</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">2.5</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">This is the starting ease factor for newly created problems. A higher number results in longer intervals, while a lower number shortens the intervals.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Easy bonus</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">1.3</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">When you press <span className="font-bold">Easy</span> on a problem, this multiplier is applied to the interval, increasing it significantly more than it would have if you pressed <span className="font-bold">Good</span>.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">Interval modifier</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">1.00</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">An extra multiplier that is applied to all review problems. At its default of 1.00 it does nothing. If you set it to 0.80, for example, intervals will be generated at 80% of their normal size (so a 10 day interval would become 8 days). You can thus use the multiplier to make your reviews less or more frequent. In other words, make the algorithm more or less aggressive.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-border text-lg font-bold text-muted-foreground">OpenAI key</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">null</td>
                                    <td className="px-4 py-2 border-b border-border text-lg text-muted-foreground">Enter your OpenAI API key here to be able to use the AI Feedback feature. This setting is unrelated to the spatial repetition algorithm but is required for enabling AI-generated feedback.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Key Takeaways Section */}
                    <div className="mb-24">
                        <div className="bg-gradient-to-r from-foreground/10 to-action/10 rounded-xl p-6 border border-foreground/20 shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center bg-foreground/20 rounded-full w-12 h-12 p-2 mr-3">
                                    <span className="text-2xl">🔑</span>
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Key Takeaways</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                    <div className="mr-3 text-foreground text-3xl font-light">1.</div>
                                    <div>
                                        <strong className="text-foreground">Algorithm</strong>
                                        <p className="text-muted-foreground">Watch the above videos to fully understand how it works</p>
                                    </div>
                                </div>
                                
                                <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                    <div className="mr-3 text-foreground text-3xl font-light">2.</div>
                                    <div>
                                        <strong className="text-foreground">Customizable</strong>
                                        <p className="text-muted-foreground">You can customize the algorithm by changing various settings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24" id="ai-feedback">
                    <h2 className="text-4xl font-bold mb-6 inline-block border-border text-foreground">Part 3: AI Feedback</h2>
                    <p className="text-muted-foreground mb-8 text-lg">The final key feature of Repcode is its <span className="text-foreground">AI-powered feedback system.</span> For every problem, you&apos;ll find an &quot;AI Feedback&quot; button that opens a chat window where the AI analyzes your solution. In a few sentences, the AI will determine if your solution is correct, and if not, it will highlight specific areas of your code that are flawed and explain why. </p>
                    <div className="flex flex-col items-center mb-8 overflow-hidden">
                        <img src="/guide/Aifeedback.png" alt="collections image" className="w-full max-w-2xl rounded-lg shadow-md object-contain" />
                        <p className="text-muted-foreground mt-4 text-sm">An example of the AI giving feedback on a classic Leetcode problem</p>
                    </div>
                    <p className="text-muted-foreground mb-8 text-lg">Before generating feedback, the AI is provided with the problem statement and the optimal solution for context. It compares your solution to the optimal one and offers detailed feedback, including a comparison of runtimes between the two solutions. Additionally, the AI provides a brief explanation of the optimal approach to solving the problem. </p>
                    <p className="text-muted-foreground mb-8 text-lg">To use the AI feedback feature, ensure that you have entered a valid <span className="text-foreground">OpenAI API key</span> on the Settings page. For security reasons, once you input your API key, it will be hidden from view in the input field but will remain active. </p>
                </div>

                {/* Key Takeaways Section */}
                <div className="mb-24">
                    <div className="bg-gradient-to-r from-foreground/10 to-action/10 rounded-xl p-6 border border-foreground/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center bg-foreground/20 rounded-full w-12 h-12 p-2 mr-3">
                                <span className="text-2xl">🔑</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Key Takeaways</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">1.</div>
                                <div>
                                    <strong className="text-foreground">Smart Analysis</strong>
                                    <p className="text-muted-foreground">Validates your code solutions</p>
                                </div>
                            </div>
                            
                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">2.</div>
                                <div>
                                    <strong className="text-foreground">Quick Feedback</strong>
                                    <p className="text-muted-foreground">Instantly identifies issues</p>
                                </div>
                            </div>

                            <div className="bg-background p-4 rounded-lg shadow-sm border border-border/20 flex items-center">
                                <div className="mr-3 text-foreground text-3xl font-light">3.</div>
                                <div>
                                    <strong className="text-foreground">API Key</strong>
                                    <p className="text-muted-foreground">Required for AI functionality</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
