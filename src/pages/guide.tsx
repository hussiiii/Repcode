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
        <div className="relative flex flex-col min-h-screen bg-base_100">
            <NavBar />
            
            <div className="relative max-w-screen-xl mx-auto">
                {/* Fixed Table of Contents - Desktop */}
                <div className="hidden lg:block fixed right-4 xl:right-8 top-28 w-96 z-10 max-h-[80vh] overflow-y-auto">
                    <div className="bg-gradient-to-r from-primary/10 to-blue/10 rounded-xl px-6 py-4 border border-primary/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center rounded-full bg-primary/20 w-12 h-12 mr-3 p-2">
                                <span className="text-xl">📌</span>
                            </div>
                            <h2 className="text-xl font-bold text-primary">Guide Contents</h2>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="bg-base_100 p-3 rounded-lg shadow-sm border border-divide/20">
                                <a href="#what-is-repcode" className="block text-primary hover:text-blue transition-colors font-medium">
                                    What is Repcode?
                                </a>
                            </div>
                            
                            <div className="bg-base_100 p-3 rounded-lg shadow-sm border border-divide/20">
                                <a href="#what-repcode-is-not" className="block text-primary hover:text-blue transition-colors font-medium">
                                    What Repcode is not
                                </a>
                            </div>
                            
                            <div className="bg-base_100 p-3 rounded-lg shadow-sm border border-divide/20">
                                <a href="#exploring-platform" className="block text-primary hover:text-blue transition-colors font-medium">
                                    Part 0: Exploring the Platform
                                </a>
                            </div>
                            
                            <div className="bg-base_100 p-3 rounded-lg shadow-sm border border-divide/20">
                                <a href="#organization-customization" className="block text-primary hover:text-blue transition-colors font-medium">
                                    Part 1: Organization and Customization
                                </a>
                            </div>
                            
                            <div className="bg-base_100 p-3 rounded-lg shadow-sm border border-divide/20">
                                <a href="#spatial-repetition-algorithm" className="block text-primary hover:text-blue transition-colors font-medium">
                                    Part 2: The Spatial Repetition Algorithm
                                </a>
                                <div className="mt-2 ml-2 space-y-2">
                                    <div className="bg-base_100/50 p-2 rounded border border-divide/10">
                                        <a href="#how-to-use-study-mode" className="block text-primary hover:text-blue transition-colors text-sm">
                                            Part 2.1: How to Use Study Mode
                                        </a>
                                    </div>
                                    <div className="bg-base_100/50 p-2 rounded border border-divide/10">
                                        <a href="#how-algorithm-works" className="block text-primary hover:text-blue transition-colors text-sm">
                                            Part 2.2: How the Algorithm Works
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-base_100 p-3 rounded-lg shadow-sm border border-divide/20">
                                <a href="#ai-feedback" className="block text-primary hover:text-blue transition-colors font-medium">
                                    Part 3: AI Feedback
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main Content */}
                <div className="p-4 pt-24 sm:pt-8 max-w-3xl mx-auto lg:mr-72">
                    {/* Mobile Table of Contents */}
                    <div className="lg:hidden mt-16 mb-8">
                        <div className="bg-gradient-to-r from-primary/10 to-blue/10 rounded-xl p-4 border border-primary/20 shadow-md">
                            <details>
                                <summary className="flex items-center cursor-pointer">
                                    <div className="bg-primary/20 rounded-full p-1 mr-2">
                                        <span className="text-lg">📑</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-primary">Guide Contents</h2>
                                </summary>
                                
                                <div className="mt-4 space-y-3">
                                    <div className="bg-base_100 p-2 rounded-lg shadow-sm border border-divide/20">
                                        <a href="#what-is-repcode" className="block text-primary hover:text-blue font-medium">
                                            What is Repcode?
                                        </a>
                                    </div>
                                    
                                    <div className="bg-base_100 p-2 rounded-lg shadow-sm border border-divide/20">
                                        <a href="#what-repcode-is-not" className="block text-primary hover:text-blue font-medium">
                                            What Repcode is not
                                        </a>
                                    </div>
                                    
                                    <div className="bg-base_100 p-2 rounded-lg shadow-sm border border-divide/20">
                                        <a href="#exploring-platform" className="block text-primary hover:text-blue font-medium">
                                            Part 0: Exploring the Platform
                                        </a>
                                    </div>
                                    
                                    <div className="bg-base_100 p-2 rounded-lg shadow-sm border border-divide/20">
                                        <a href="#organization-customization" className="block text-primary hover:text-blue font-medium">
                                            Part 1: Organization and Customization
                                        </a>
                                    </div>
                                    
                                    <div className="bg-base_100 p-2 rounded-lg shadow-sm border border-divide/20">
                                        <a href="#spatial-repetition-algorithm" className="block text-primary hover:text-blue font-medium">
                                            Part 2: The Spatial Repetition Algorithm
                                        </a>
                                        <div className="mt-2 ml-2 space-y-2">
                                            <div className="bg-base_100/50 p-2 rounded border border-divide/10">
                                                <a href="#how-to-use-study-mode" className="block text-primary hover:text-blue text-sm">
                                                    Part 2.1: How to Use Study Mode
                                                </a>
                                            </div>
                                            <div className="bg-base_100/50 p-2 rounded border border-divide/10">
                                                <a href="#how-algorithm-works" className="block text-primary hover:text-blue text-sm">
                                                    Part 2.2: How the Algorithm Works
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-base_100 p-2 rounded-lg shadow-sm border border-divide/20">
                                        <a href="#ai-feedback" className="block text-primary hover:text-blue font-medium">
                                            Part 3: AI Feedback
                                        </a>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>

                {/* Banner */}
                <div className="mt-16 bg-gradient-to-r from-[#f97316]/20 to-[#eab308]/20 border-l-4 border-[#f97316] mb-8 p-4 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-6 h-6 bg-[#f97316] rounded-full flex items-center justify-center">
                                <span className="text-[#FFFFFF] text-sm font-bold">!</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-1">Quick Note</h3>
                            <p className="text-secondary text-base">
                                This guide is kinda scuffed, but I hope it is comprehensive enough to explain how to best use this application. The first-time user video is probably better, so go watch that too!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Platform Overview Video */}
                <div className="mb-16">
                    <div className="bg-gradient-to-br from-[#2A303C] to-[#252B38] rounded-xl p-6 border border-[#3A4150]/50 shadow-lg">
                        <h3 className="text-2xl font-semibold text-primary mb-4 text-center">Video Guide for First Time Users</h3>

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
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">What is Repcode?</h2>
                    </div>
                    
                    <p className="text-secondary mb-8 text-lg leading-relaxed">Repcode is a platform built to empower software engineers to excel in Leetcode-style technical interviews. It helps you achieve this in three main ways: </p>
                    
                    <div className="space-y-6">
                        <div className="p-5 border border-divide/30 rounded-lg bg-base_100/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-primary mb-3">1. Organize, Categorize, and Analyze</h3>
                            <p className="text-secondary">The intuitive UI/UX makes it simple to organize and categorize problems. In addition, a detailed statistic breakdown of every problem you add to Repcode is available, helping you target your weaknesses and identify your strengths. You can also store notes and commented solutions with each problem, allowing you to refer back to them at any time for further review.</p>
                        </div>
                        
                        <div className="p-5 border border-divide/30 rounded-lg bg-base_100/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-primary mb-3">2. Spatial Repetition Review</h3>
                            <p className="text-secondary">A built-in spatial repetition algorithm ensures you don&apos;t forget what you&apos;ve learned, intelligently scheduling reviews of past problems to reinforce your understanding.</p>
                        </div>
                        
                        <div className="p-5 border border-divide/30 rounded-lg bg-base_100/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-primary mb-3">3. AI-Powered Feedback</h3>
                            <p className="text-secondary">Integrated AI (trained on the problem and its optimal solution) provides instant feedback on your solutions, helping you identify mistakes and areas for improvement in real-time.</p>
                        </div>
                    </div>
                    
                    <p className="text-secondary my-8 text-lg">We will expand on each of these features in more detail below. But first, let&apos;s clarify how Repcode is meant to be used and what it is not designed for.</p>
                </div>

                <div className="mb-24" id="what-repcode-is-not">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">What Repcode is not</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue/10 to-primary/10 p-5 border-l-4 border-blue rounded-r-lg my-6">
                        <p className="text-secondary text-lg">Repcode is not intended to replace Leetcode but rather to complement it. Think of Leetcode as your textbook and Repcode as your personalized notebook for problem-solving. Repcode helps you organize, review, and receive feedback on your work, making the learning process more structured and effective.</p>
                    </div>

                    <p className="text-secondary mb-6 text-lg">To master Leetcode, it&apos;s important to understand that simply tackling random problems without focus or strategy isn&apos;t the best approach. Technical interviews often test your grasp of key data structures and algorithms, so building a strong foundation is critical. For example, trying to solve complex backtracking or binary search problems before you fully understand arrays and two-pointer techniques isn&apos;t productive.</p>
                    
                    <p className="text-secondary mb-6 text-lg">Mastering Leetcode requires solving problems in patterns, progressing from fundamental concepts to more complex ones. Roadmaps like the <Link className="text-blue underline hover:text-blue/80 transition-colors" href="https://neetcode.io/" target="_blank" rel="noopener noreferrer">Neetcode 150</Link> guide you through this process by organizing problems into patterns. Once you grasp the patterns, you&apos;re better equipped to solve a wide variety of new, unseen problems.</p>
                    
                    <div className="flex flex-col items-center gap-3 my-8 bg-base_100/50 p-4 rounded-lg shadow-sm">
                        <img src="/guide/neetcode.png" alt="Neetcode 150 roadmap" className="w-full max-w-2xl rounded-lg shadow-md" />
                        <p className="text-secondary text-sm italic">The top part of the Neetcode 150 roadmap</p>
                    </div>

                    <p className="text-secondary mb-8 text-lg">So then, where does Repcode factor in? Repcode provides a way to create <span className="text-primary">custom collections</span> to group problems by pattern or concept. For instance, if you&apos;re studying linked lists, you can create a collection called &quot;Linked Lists&quot; and store all your Leetcode problems, notes, and solutions for that pattern in one place. This allows you to easily revisit problems and review your thought processes.  </p>

                    <p className="text-secondary mb-8 text-lg">Additionally, every problem you add to a collection is automatically included in <span className="text-primary">Study Mode</span>,  which leverages the spatial repetition algorithm. This ensures you review problems at the optimal time for retention, so you won&apos;t lose track of what you&apos;ve learned and reinforce your learning over time.</p>

                    <p className="text-secondary mb-8 text-lg">To further enhance your study process, Repcode integrates with an <span className="text-primary">AI-Powered Assistant</span> that provides instant feedback when you&apos;re stuck on a solution, giving you helpful hints and corrections in real-time. </p>

                    <p className="text-secondary mb-8 text-lg">In short, Repcode addresses three major challenges when it comes to mastering Leetcode: <span className="text-primary">Organization</span>, <span className="text-primary">Review</span>, and <span className="text-primary">Feedback</span> — all with the help of collections, Study Mode, and AI integration. </p>
                </div>

                {/* Key Takeaways Section */}
                <div className="mb-24">
                    <div className="bg-gradient-to-r from-primary/10 to-blue/10 rounded-xl p-6 border border-primary/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center bg-primary/20 rounded-full w-12 h-12 p-2 mr-3">
                                <span className="text-2xl">🔑</span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary">Key Takeaways</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">1.</div>
                                <div>
                                    <strong className="text-primary">Leetcode</strong>
                                    <p className="text-secondary">Problem source (textbook)</p>
                                </div>
                            </div>
                            
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">2.</div>
                                <div>
                                    <strong className="text-primary">Repcode</strong>
                                    <p className="text-secondary">Learning tool (notebook)</p>
                                </div>
                            </div>
                            
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">3.</div>
                                <div>
                                    <strong className="text-primary">Together</strong>
                                    <p className="text-secondary">Maximum benefit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24" id="exploring-platform">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">Part 0: Exploring the Platform</h2>
                    </div>
                    
                    <p className="text-secondary mb-8 text-lg leading-relaxed">
                        Before we dive into the specifics of how Repcode works, let&apos;s first explore the platform itself. When you login, you will see an expandable sidebar on the left. Use this to navigate to the different parts of the platform. Each symbol in the sidebar will take you to a separate page:
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center p-4 border-l-4 border-secondary rounded-r-lg bg-base_100/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-secondary/10 rounded-full">
                                <FolderIcon size={24} className="text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Collections</h3>
                                <p className="text-secondary">View and manage your collections. Here, you can see a grid layout showing all the collections you have made so far, and you can click into any one of them to access the problems stored within. You can also edit, delete, and create new collections from this page.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-secondary rounded-r-lg bg-base_100/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-secondary/10 rounded-full">
                                <BookOpenIcon size={24} className="text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Study</h3>
                                <p className="text-secondary">Review problems using spatial repetition. A more detailed breakdown of how this works can be found in the following sections.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-secondary rounded-r-lg bg-base_100/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-secondary/10 rounded-full">
                                <SettingsIcon size={24} className="text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Settings</h3>
                                <p className="text-secondary">Customize various aspects of the spatial repetition algorithm. Again, a detailed breakdown of these settings can be found in the following sections.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-secondary rounded-r-lg bg-base_100/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-secondary/10 rounded-full">
                                <HomeIcon size={24} className="text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Homepage</h3>
                                <p className="text-secondary">Exit the application and return to the main landing page.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-secondary rounded-r-lg bg-base_100/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-secondary/10 rounded-full">
                                <HelpCircleIcon size={24} className="text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Help</h3>
                                <p className="text-secondary">Opens a new window to the guide page (where you are right now!)</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-4 border-l-4 border-error rounded-r-lg bg-base_100/50">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-error/10 rounded-full">
                                <LogOutIcon size={24} className="text-error" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Logout</h3>
                                <p className="text-secondary">Sign out of your account.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24" id="organization-customization">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">Part 1: Organization and Customization</h2>
                    </div>
                    
                    <p className="text-secondary mb-6 text-lg leading-relaxed">
                        The first part of this guide will cover how to use Repcode to effectively organize your Leetcode problems, and attach notes and solutions to them. As mentioned earlier, the best way to improve at Leetcode is to break down problems into patterns and focus on practicing within those specific patterns. Repcode makes this easy by allowing you to create collections.
                    </p>
                    
                    <div className="bg-blue/5 border-l-4 border-blue p-4 rounded-r-lg mb-6">
                        <p className="text-secondary text-lg leading-relaxed">
                            Each collection can hold multiple problems, and you can customize these collections as needed. For example, you can rename a collection at any time by clicking the pen and paper icon on the bottom left of the collection card. You can also delete a collection by clicking the trash icon next to it, but keep in mind that doing so will permanently delete all the problems within it, and this action cannot be undone.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center my-10 bg-base_100/50 p-4 rounded-lg shadow-sm">
                        <img src="/guide/collections.png" alt="Collections dashboard" className="w-full max-w-2xl rounded-lg shadow-md" />
                        <p className="text-secondary text-sm mt-3 italic">An example dashboard showing some collections</p>
                    </div>
                    <p className="text-secondary mb-8 text-lg">
                    From the <span className="text-primary">dashboard view</span>, which shows all your collections, you can quickly access key information at a glance. This includes when the last problem was added to a collection, as well as a breakdown of the problems by type — categorized into <span className="text-primary">New</span>, <span className="text-primary">Learning</span>, and <span className="text-primary">Review</span> stages. The color bar at the bottom gives you an instant snapshot of your progress within each collection. The more green the bar, the better your understanding of that pattern, as it means more problems are in the Review stage, indicating strong familiarity. Note that if there is a red warning symbol next to the Last Updated date, it means it has been longer than a month since you last solved a new problem from that collection, so it&apos;s recommended you should try and solve a new one soon to keep your understanding fresh! Remember that it is important to tackle novel problems from time to time, in addition to reviewing old ones! 
                    </p>
                    <p className="text-secondary mb-8 text-lg">
                        When creating a new problem in a collection, you will be prompted to fill out a form with all sorts of information about the problem. You can enter the Leetcode problem number and click Autofill to automatically scrape these details from Leetcode directly, or you can manually fill out the details yourself. These include: 
                    </p>
                    <div className="overflow-hidden rounded-lg border border-divide shadow-sm mb-8">
                        <table className="min-w-full bg-base_100 divide-y divide-divide">
                            <thead className="bg-base_100/70">
                                <tr>
                                    <th className="px-6 py-3 text-left text-lg font-bold text-primary">Field</th>
                                    <th className="px-6 py-3 text-left text-lg font-bold text-primary">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-divide/30">
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Name</td>
                                    <td className="px-6 py-4 text-secondary">The problem&apos;s name as listed on Leetcode.</td>
                                </tr>
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Question</td>
                                    <td className="px-6 py-4 text-secondary">The actual problem statement itself.</td>
                                </tr>
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Solution</td>
                                    <td className="px-6 py-4 text-secondary">The code solution to the problem. It is recommended you put your own solution here, one that makes sense to you.</td>
                                </tr>
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Function Signature <span className="text-sm font-normal">(optional)</span></td>
                                    <td className="px-6 py-4 text-secondary">The boilerplate code associated with the solution. On Leetcode, if you select any random problem you will notice there is already some boilerplate code in the code editor: this is the function signature. We ask for it so that we can mimic this in our own code editor.</td>
                                </tr>
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Programming Language</td>
                                    <td className="px-6 py-4 text-secondary">The programming language you will use to solve the problem. Used for syntax highlighting/AI integration purposes.</td>
                                </tr>
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Link to Problem <span className="text-sm font-normal">(optional)</span></td>
                                    <td className="px-6 py-4 text-secondary">The URL that will direct to the problem&apos;s page on Leetcode.</td>
                                </tr>
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Additional Notes <span className="text-sm font-normal">(optional)</span></td>
                                    <td className="px-6 py-4 text-secondary">Any notes you wish to make for yourself about the problem.</td>
                                </tr>
                                <tr className="hover:bg-base_100/60 transition-colors">
                                    <td className="px-6 py-4 text-lg font-semibold text-secondary">Problem Difficulty</td>
                                    <td className="px-6 py-4 text-secondary">The problem&apos;s difficulty as shown on Leetcode (easy, medium, or hard).</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-secondary mb-8 text-lg">
                    And that&apos;s it — <span className="text-primary">organizing your problems is that simple</span>! Once a problem is logged into a collection, you can easily return to it at any time to re-solve it, view your solution, and receive feedback all within the platform. No need to maintain Excel spreadsheets or juggle multiple browser tabs—Repcode keeps everything organized in one place for you.
                    </p>
                    <div className="flex flex-col items-center mb-8">
                        <img src="/guide/problemview.png" alt="collections image" />
                        <p className="text-secondary text-sm">What the problem view looks like</p>
                    </div>

                    <p className="text-secondary mb-8 text-lg">
                    When you add a problem to a collection, it will also automatically be integrated into <span className="text-primary">Study Mode</span>, which leverages the spatial repetition algorithm mentioned earlier. This ensures that you review problems at the optimal time to reinforce your learning. If you delete a problem from a collection, it will also be removed from Study Mode. For more information about this, refer to the next section. 
                    </p>
                </div>

                {/* Key Takeaways Section */}
                <div className="mb-24">
                    <div className="bg-gradient-to-r from-primary/10 to-blue/10 rounded-xl p-6 border border-primary/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center bg-primary/20 rounded-full w-12 h-12 p-2 mr-3">
                                <span className="text-2xl">🔑</span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary">Key Takeaways</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">1.</div>
                                <div>
                                    <strong className="text-primary">Collections</strong>
                                    <p className="text-secondary">Organize your problems by patterns</p>
                                </div>
                            </div>
                            
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">2.</div>
                                <div>
                                    <strong className="text-primary">Customization</strong>
                                    <p className="text-secondary">Personalize every detail</p>
                                </div>
                            </div>
                            
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">3.</div>
                                <div>
                                    <strong className="text-primary">All-in-one</strong>
                                    <p className="text-secondary">Repcode tracks everything</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-24" id="spatial-repetition-algorithm">
                    <div className="relative mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">Part 2: The Spatial Repetition Algorithm</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue/5 to-primary/5 p-6 rounded-lg mb-8 border-l-4 border-blue">
                        <p className="text-secondary text-lg leading-relaxed">
                            One of the unique aspects of Repcode is its ability to not only help you store and organize problems, but also review them efficiently through <span className="text-primary">Study Mode</span>, powered by a fully customizable spatial repetition algorithm. This algorithm, similar to the one used by Anki, ensures that you never forget what you&apos;ve learned by spacing out your review sessions. As of this writing, Repcode is the only actively maintained platform that offers this feature out of the box.
                        </p>
                    </div>
                    
                    <p className="text-secondary mb-6 text-lg leading-relaxed">
                        <span className="text-primary">What is spatial repetition?</span> In short, it&apos;s a learning technique that schedules review sessions at increasing intervals to improve long-term retention. It&apos;s based on the idea that the brain retains information best when it&apos;s reviewed at strategic points, rather than in one sitting. Also, the algorithm is very smart, and will quickly determine what data structures and specific problems you struggle with, and which ones you find easier, and adjust itself accordingly so that you spend more time on problems that you have trouble with.
                    </p>
                    
                    <p className="text-secondary mb-4 text-lg leading-relaxed">This section will be split into two sub-parts:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        <div className="bg-base_100/50 p-5 rounded-lg border border-divide/30 shadow-sm">
                            <div className="flex items-center mb-2">
                                <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">1</div>
                                <h3 className="text-lg font-bold text-primary">How to use Study Mode</h3>
                            </div>
                            <p className="text-secondary">Learn the basics of navigating and using the study mode feature.</p>
                        </div>
                        
                        <div className="bg-base_100/50 p-5 rounded-lg border border-divide/30 shadow-sm">
                            <div className="flex items-center mb-2">
                                <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">2</div>
                                <h3 className="text-lg font-bold text-primary">How the algorithm works</h3>
                            </div>
                            <p className="text-secondary">Understand the technical details of how the spatial repetition algorithm functions.</p>
                        </div>
                    </div>

                    <div className="relative mb-6" id="how-to-use-study-mode">
                        <h2 className="text-2xl md:text-3xl font-bold text-primary">Part 2.1: How to use Study Mode</h2>
                    </div>
                    
                    <div className="bg-primary/5 rounded-lg p-5 border-l-4 border-primary mb-6">
                        <p className="text-secondary text-lg leading-relaxed">
                            <span className="text-primary">First, the easy part:</span> how to use it. The great thing about Study Mode is that it&apos;s largely <span className="text-primary">automatic</span> — the spatial repetition algorithm updates and manages itself. Whenever you add a problem to a collection, it&apos;s automatically included in Study Mode and factored into the algorithm.
                        </p>
                    </div>
                    
                    <p className="text-secondary mb-6 text-lg leading-relaxed">Your role is minimal: just navigate to the Study Mode section and, when you have problems due for review, a &quot;Study Now&quot; button will appear. Clicking this button will prompt you to solve the problems assigned for that day.</p>
                    
                    <p className="text-secondary mb-6 text-lg leading-relaxed">After solving each problem, head to the Solutions tab and choose the button that best reflects how difficult you found the problem:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="border border-[#8B3A3A] rounded-md p-4 text-center bg-[#8B3A3A]/5 hover:bg-[#8B3A3A]/10 transition-colors">
                            <h4 className="text-[#FF6B6B] text-xl font-bold mb-2">Again</h4>
                            <p className="text-secondary text-sm">For problems you couldn&apos;t solve</p>
                        </div>
                        
                        <div className="border border-[#8C5E2A] rounded-md p-4 text-center bg-[#8C5E2A]/5 hover:bg-[#8C5E2A]/10 transition-colors">
                            <h4 className="text-[#FFA94D] text-xl font-bold mb-2">Hard</h4>
                            <p className="text-secondary text-sm">For problems that were difficult</p>
                        </div>
                        
                        <div className="border border-[#2D6A39] rounded-md p-4 text-center bg-[#2D6A39]/5 hover:bg-[#2D6A39]/10 transition-colors">
                            <h4 className="text-[#69DB7C] text-xl font-bold mb-2">Good</h4>
                            <p className="text-secondary text-sm">For problems you solved well</p>
                        </div>
                        
                        <div className="border border-[#2A5A8C] rounded-md p-4 text-center bg-[#2A5A8C]/5 hover:bg-[#2A5A8C]/10 transition-colors">
                            <h4 className="text-[#74C0FC] text-xl font-bold mb-2">Easy</h4>
                            <p className="text-secondary text-sm">For problems that were very easy</p>
                        </div>
                    </div>

                    <p className="text-secondary mb-8 text-lg">If certain buttons aren&apos;t available for a problem, don&apos;t worry — this is intentional. Based on factors such as the problem&apos;s difficulty and current type, the algorithm may restrict some options to ensure more accurate feedback. Here&apos;s a quick guide on when to choose each option: </p>
                    <div className="mb-8 flex justify-center items-center">
                        <table className="min-w-full bg-base_100 border border-divide">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Button</th>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-error">Again</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">Press this one if you had no idea how to even approach the problem.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-medium">Hard</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">Press this one if you were able to at least come up with a solution that passed some test cases, but was not optimal.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-easy">Good</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">Press this one if you could come up with and thoroughly explain the optimal approach to solving this problem.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-blue">Easy</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">Press this one if you could optimally solve the problem very quickly with little thought.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-secondary mb-8 text-lg">Each day, the algorithm will assess the feedback you&apos;ve given on the problem and other factors to decide when you should review it again. </p>
                    <div className="flex flex-col items-center mb-8">
                        <img src="/guide/studydashboard.png" alt="collections image" className=" mb-2" />
                        <p className="text-secondary text-sm">A bar graph showing future review session workloads</p>
                    </div>
                    <p className="text-secondary mb-8 text-lg">It is important to use Study Mode consistently — <span className="font-bold">daily practice </span> is ideal to keep your workload manageable. But don&apos;t worry if you miss a few days; the algorithm won&apos;t break. Problems you miss will simply be pushed to future days. However, keep in mind that delaying too many days will increase your workload in the future, so try to stay on top of your reviews to avoid falling behind. </p>
                    <p className="text-secondary mb-8 text-lg">You might also notice that each problem in Repcode has an associated <span className="font-bold">Type</span>. These types help the spatial repetition algorithm determine how often you should review each problem based on how well you know it. The types are: </p>
                    <div className="mb-16 flex justify-center items-center">
                        <table className="min-w-full bg-base_100 border border-divide">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Type</th>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-new">New</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">A problem is classified as New when it&apos;s first added. You haven&apos;t given any feedback yet, so the algorithm doesn&apos;t know how well you understand it. A problem cannot revert to the New state once it leaves it.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-learning">Learning</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">A problem that&apos;s in the process of becoming a Review problem. You can solve it, but the algorithm has determined that your grasp is not yet strong enough.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-learning">Relearning</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">A problem that was previously categorized as Review, but due to poor recent feedback, it has returned to a state where more practice is needed.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-review">Review</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">A problem you are confident in and can solve without much effort. These problems will appear less frequently in Study Mode, as the algorithm considers them well-understood.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Key Takeaways Section */}
                    <div className="mb-24">
                        <div className="bg-gradient-to-r from-primary/10 to-blue/10 rounded-xl p-6 border border-primary/20 shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center bg-primary/20 rounded-full w-12 h-12 p-2 mr-3">
                                    <span className="text-2xl">🔑</span>
                                </div>
                                <h2 className="text-2xl font-bold text-primary">Key Takeaways</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                    <div className="mr-3 text-primary text-3xl font-light">1.</div>
                                    <div>
                                        <strong className="text-primary">Automatic</strong>
                                        <p className="text-secondary">Just create problems and give feedback</p>
                                    </div>
                                </div>
                                
                                <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                    <div className="mr-3 text-primary text-3xl font-light">2.</div>
                                    <div>
                                        <strong className="text-primary">Feedback</strong>
                                        <p className="text-secondary">Rate problems based on your performance</p>
                                    </div>
                                </div>
                                
                                <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                    <div className="mr-3 text-primary text-3xl font-light">3.</div>
                                    <div>
                                        <strong className="text-primary">Daily practice</strong>
                                        <p className="text-secondary">Stay consistent for best results</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <h2 className="text-3xl font-bold mb-2 inline-block border-divide text-primary" id="how-algorithm-works">Part 2.2: How the Spatial Repetition Algorithm Works</h2>
                    <p className="text-secondary mb-8 text-lg"><span className="text-primary">Second, let&apos;s now delve into how the spatial repetition algorithm works</span>, how the different settings are related to it, and how you can tweak them to make the algorithm more tailored to your learning style. Keep in mind that the default settings are not arbitrary; they were carefully chosen because they represent what works best for most users. However, if you&apos;d like to tailor the algorithm to better suit your needs, this section will explain the settings in detail and how to adjust them. </p>
                    <p className="text-secondary mb-8 text-lg">While entire books have been written about the spatial repetition algorithm, we&apos;ll keep it concise here. To get a deeper understanding of the technical aspects, I highly recommend watching the two videos below. Both were extensively referenced when we implemented the algorithm in Repcode. Although these videos discuss Anki, the algorithm used in Repcode is identical. </p>
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
                    <p className="text-secondary mb-8 text-xl"><span className="font-bold">If you plan on using Repcode long term, and truly want to understand how the algorithm works and how to make it work best for you, I highly recommend watching the above two videos.</span> For now, let&apos;s discuss the settings, how they relate to the algorithm, and how you can customize the settings to match your needs. But first, some key terms: </p>

                    <div className="mb-8 flex justify-center items-center">
                        <table className="min-w-full bg-base_100 border border-divide">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Term</th>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Definition</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Interval</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">The interval represents how long the algorithm waits before showing a problem for review again, in days. Based on your feedback (via the buttons: Again, Hard, Good, Easy), the current interval, problem type, and other factors, the algorithm will calculate the next review interval.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Ease Factor</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">This percentage indicates how easy the algorithm believes a problem is for you to solve. The easier a problem has been in the past, the greater the Ease will be, and the longer the intervals between reviews will be. Initially, all problems start with the same ease factor, but it adjusts based on your performance.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-secondary mb-8 text-lg">Alright, so with that vocabulary out of the way, let us now talk about each of the settings in detail, what they do, along with examples so you can fully understand how they all work in relation to the spatial repetition algorithm. Again, to truly understand how everything works, please watch the above two videos in full. </p>

                    <div className="mb-8 flex justify-center items-center">
                        <table className="min-w-full bg-base_100 border border-divide">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Setting</th>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Default Value</th>
                                    <th className="px-4 py-2 border-b-2 border-divide text-left text-lg font-bold text-primary">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Learning steps</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">10m, 1d</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">These apply to <span className="font-bold">New/Learning</span> problems. The first number (10m) represents how soon you&apos;ll see the problem again if you press <span className="font-bold">Again</span>. Every time you press <span className="font-bold">Good</span>, the problem advances to the next step (e.g., if the next step is 1d, you&apos;ll see it in 1 day).</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Graduating interval</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">3d</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">After a problem has gone through all its learning steps and you press <span className="font-bold">Good</span>, it &quot;graduates&quot; from a Learning problem to a <span className="font-bold">Review</span> problem. The graduating interval determines when it will be shown to you again right after it becomes a Review problem.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Easy interval</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">4d</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">If you press <span className="font-bold">Easy</span> during the learning steps, the problem skips all remaining steps and immediately graduates to a Review problem. The easy interval determines when it will next appear.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Relearning steps</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">10m</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">When you press <span className="font-bold">Again</span> on a Review problem, it changes to a <span className="font-bold">Relearning</span> problem. It must then go through the Relearning steps before it can become a Review problem again. These steps function similarly to Learning steps.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">New interval</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">0.75</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">A percentage (less than 100%) that will be applied to the ease factor of Relearning problems once they graduate and become Review problems again. It ensures that even though a problem is back in Review, it&apos;s reviewed more frequently to reinforce your knowledge.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Maximum interval</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">180 (in days)</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">This is the maximum number of days a Review problem can go without being shown again. It prevents overly long gaps between reviews.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Starting ease</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">2.5</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">This is the starting ease factor for newly created problems. A higher number results in longer intervals, while a lower number shortens the intervals.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Easy bonus</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">1.3</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">When you press <span className="font-bold">Easy</span> on a problem, this multiplier is applied to the interval, increasing it significantly more than it would have if you pressed <span className="font-bold">Good</span>.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">Interval modifier</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">1.00</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">An extra multiplier that is applied to all review problems. At its default of 1.00 it does nothing. If you set it to 0.80, for example, intervals will be generated at 80% of their normal size (so a 10 day interval would become 8 days). You can thus use the multiplier to make your reviews less or more frequent. In other words, make the algorithm more or less aggressive.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b border-divide text-lg font-bold text-secondary">OpenAI key</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">null</td>
                                    <td className="px-4 py-2 border-b border-divide text-lg text-secondary">Enter your OpenAI API key here to be able to use the AI Feedback feature. This setting is unrelated to the spatial repetition algorithm but is required for enabling AI-generated feedback.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Key Takeaways Section */}
                    <div className="mb-24">
                        <div className="bg-gradient-to-r from-primary/10 to-blue/10 rounded-xl p-6 border border-primary/20 shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center bg-primary/20 rounded-full w-12 h-12 p-2 mr-3">
                                    <span className="text-2xl">🔑</span>
                                </div>
                                <h2 className="text-2xl font-bold text-primary">Key Takeaways</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                    <div className="mr-3 text-primary text-3xl font-light">1.</div>
                                    <div>
                                        <strong className="text-primary">Algorithm</strong>
                                        <p className="text-secondary">Watch the above videos to fully understand how it works</p>
                                    </div>
                                </div>
                                
                                <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                    <div className="mr-3 text-primary text-3xl font-light">2.</div>
                                    <div>
                                        <strong className="text-primary">Customizable</strong>
                                        <p className="text-secondary">You can customize the algorithm by changing various settings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24" id="ai-feedback">
                    <h2 className="text-4xl font-bold mb-6 inline-block border-divide text-primary">Part 3: AI Feedback</h2>
                    <p className="text-secondary mb-8 text-lg">The final key feature of Repcode is its <span className="text-primary">AI-powered feedback system.</span> For every problem, you&apos;ll find an &quot;AI Feedback&quot; button that opens a chat window where the AI analyzes your solution. In a few sentences, the AI will determine if your solution is correct, and if not, it will highlight specific areas of your code that are flawed and explain why. </p>
                    <div className="flex flex-col items-center mb-8">
                        <img src="/guide/Aifeedback.png" alt="collections image" />
                        <p className="text-secondary mt-4 text-sm">An example of the AI giving feedback on a classic Leetcode problem</p>
                    </div>
                    <p className="text-secondary mb-8 text-lg">Before generating feedback, the AI is provided with the problem statement and the optimal solution for context. It compares your solution to the optimal one and offers detailed feedback, including a comparison of runtimes between the two solutions. Additionally, the AI provides a brief explanation of the optimal approach to solving the problem. </p>
                    <p className="text-secondary mb-8 text-lg">To use the AI feedback feature, ensure that you have entered a valid <span className="text-primary">OpenAI API key</span> on the Settings page. For security reasons, once you input your API key, it will be hidden from view in the input field but will remain active. </p>
                </div>

                {/* Key Takeaways Section */}
                <div className="mb-24">
                    <div className="bg-gradient-to-r from-primary/10 to-blue/10 rounded-xl p-6 border border-primary/20 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center bg-primary/20 rounded-full w-12 h-12 p-2 mr-3">
                                <span className="text-2xl">🔑</span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary">Key Takeaways</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">1.</div>
                                <div>
                                    <strong className="text-primary">Smart Analysis</strong>
                                    <p className="text-secondary">Validates your code solutions</p>
                                </div>
                            </div>
                            
                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">2.</div>
                                <div>
                                    <strong className="text-primary">Quick Feedback</strong>
                                    <p className="text-secondary">Instantly identifies issues</p>
                                </div>
                            </div>

                            <div className="bg-base_100 p-4 rounded-lg shadow-sm border border-divide/20 flex items-center">
                                <div className="mr-3 text-primary text-3xl font-light">3.</div>
                                <div>
                                    <strong className="text-primary">API Key</strong>
                                    <p className="text-secondary">Required for AI functionality</p>
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
