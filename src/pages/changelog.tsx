import React from 'react';
import NavBar from '@/components/home/NavBar';
import Footer from '@/components/home/Footer';
import "../app/globals.css";

export default function Changelog() {
    const changelogData = [
      {
        month: "January 2026",
        updates: [
          {
            date: "V 2.19 - January 17th, 2026",
            changes: [
              "➕Added new Stats section to Study Dashboard with interactive data visualizations",
              "➕Added 6 different chart types: Creation Date, Interval Size, Lapses, Collections, Total Reviews, and Due Date",
              "➕Added grouped/individual toggle views for detailed problem-level insights on each chart",
              "➕Added Total Reviews card to Study Dashboard header",
              "⚙️Optimized data fetching with react query caching for chart performance",
            ],
          },
          {
            date: "V 2.18 - January 15th, 2026",
            changes: [
              "⚙️Adjusted Solution textarea in problem modal to be larger by default and vertically resizable",
              "⚙️Made version indicator clickable - now opens changelog in a new tab",
              "⚙️Manual Entry section now auto-expands when editing an existing problem",
              "🛠️Fixed login issue on local development caused by firebase-admin bundling",
            ],
          },
          {
            date: "V 2.17 - January 9th, 2026",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/83" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #83</a> merged, credit @OmkarSathish </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/82" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #82</a> merged, credit @OmkarSathish </>,
            ],
          },
        ],
      },
      {
        month: "December 2025",
        updates: [
          {
            date: "V 2.16 - December 2nd, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/78" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #78</a> merged, credit @OmkarSathish </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/77" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #77</a> merged, credit @OmkarSathish </>,
            ],
          },
          {
            date: "V 2.15 - December 1st, 2025",
            changes: [
              "➕Algorithm update: added a warning month threshold for lapses in Study Mode. So if you take a long break, the algo will adjust much better!",
              "⚙️Adjusted styling of Study Mode problems queue",
            ],
          },
        ],
      },
      {
        month: "November 2025",
        updates: [
          {
            date: "V 2.14 - November 30th, 2025",
            changes: [
              "➕New feature: Solve Random Problem button with collection selection modal",
              "➕Algorithm update: added a cap to the interval so that it never exceeds the maximum interval set by user",
              "➕Algorithm update: updated how algorithm navigates through steps for learning and relearning problems by adding a stepIndex field in DB",
              "➕Added year dividers to changelog sidebar for better navigation",
              "⚙️Adjusted tab styling in Problem and Study Mode views",
              "🛠️Fixed badge spacing issue in problem views",
            ],
          },
          {
            date: "V 2.13 - November 5th, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/71" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #71</a> merged, credit @Ad4mlars </>,
              "⚙️Adjusted styling of floating code snippets in landing page",
            ],
          },
        ],
      },
      {
        month: "October 2025",
        updates: [
          {
            date: "V 2.12 - October 31st, 2025",
            changes: [
              "🎃Happy Halloween!!",
              "➕Added nothing, just wanted to wish yall a happy halloween :)",
            ],
          },
        ],
      },
      {
        month: "September 2025",
        updates: [
          {
            date: "V 2.11 - September 5th, 2025",
            changes: [
              "⚙️Added button text styling",
              "⚙️Adjusted study mode styling",
            ],
          },
          {
            date: "V 2.10 - September 1st, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/68" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #68</a> merged, credit @OmkarSathish </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/65" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #65</a> merged, credit @OmkarSathish </>,
            ],
          },
        ],
      },
      {
        month: "August 2025",
        updates: [
          {
            date: "V 2.9 - August 31st, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/62" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #62</a> merged, credit @OmkarSathish </>,
              "⚙️Adjusted landing page styling",
              "⚙️Adjusted guide page styling",
            ],
          },
          {
            date: "V 2.8 - August 6th, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/44" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #44</a> merged, credit @ZidanCorson </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/46" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #46</a> merged, credit @OmkarSathish </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/43" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #43</a> merged, credit @OmkarSathish </>,
            ],
          },
        ],
      },
      {
        month: "July 2025",
        updates: [
          {
            date: "V 2.7 - July 30th, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/39" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #39</a> merged, credit @ajinkya8010 </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/42" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #42</a> merged, credit @OmkarSathish </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/40" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #40</a> merged, credit @OmkarSathish </>,
            ],
          },
          {
            date: "V 2.6 - July 21st, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/33" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #33</a> merged, credit @OmkarSathish </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/27" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #27</a> merged, credit @OmkarSathish </>,
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/30" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #30</a> merged, credit @Pragyan14 </>,
            ],
          },
          {
            date: "V 2.5 - July 20th, 2025",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/23" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #23</a> merged, credit @ajinkya8010 </>,
              "➕Added first time user video to guide page (Issue #29, Credit: @poorvijn)", 
              "⚙️Adjusted README/Contributing document to be more detailed for first time contributors",
              "⚙️Adjusted first time user pop-up styling",
            ],
          },
          {
            date: "V 2.4 - July 15th, 2025",
            changes: [
              "➕Added platform comparison table on landing page", 
              "➕Added warning symbol and text next to collections that have not been added to in a while",
              "⚙️Adjusted styling of all Toast pop-ups",
              "➖Removed Example collection and problem on new user accounts", 
            ],
          },
          {
            date: "V 2.3 - July 10th, 2025",
            changes: [
              "➕Added GitHub link to Navbar and Footer", 
              "➕Added a new First Time User popup, this one is more helpful and comprehensive", 
              "⚙️Some more preparations for open source release",
            ],
          },
          {
            date: "V 2.2 - July 2nd, 2025",
            changes: [
              "⚙️More preparations for open source release", 
              "⚙️Small adjustments to UI/UX throughout", 
            ],
          },
        ],
      },
      {
        month: "April 2025",
        updates: [
          {
            date: "V 2.1 - April 15th, 2025",
            changes: [
              "🛠️Fixed several styling issues with the new UI/UX", 
              "🛠️Fixed another issue with account creation not working properly", 
            ],
          },
          {
            date: "V 2.0 - April 13th, 2025",
            changes: [
              "🎉🎉 Repcode.io official 2.0 release build!! 🎉🎉", 
              "⚙️MASSIVE UI/UX overhaul, including a new landing page, a new dashboard, a new problem view, new everything!", 
            ],
          },
        ],
      },
      {
        month: "March 2025",
        updates: [
          {
            date: "V 1.18 - March 30th, 2025",
            changes: [
              "⚙️Adjusted problem view UI",
              "🛠️Fixed issue with AI Feedback not working",
              "🛠️Fixed issue with contact form not sending emails properly",
            ],
          },
          {
            date: "V 1.17 - March 21st, 2025",
            changes: [
              "🛠️Fixed user account creation bug where you couldn&apos;t access the dashboard",
              "🛠️Fixed issues with time calculation for review on study page",
            ],
          },
          {
            date: "V 1.16 - March 20th, 2025",
            changes: [
              "⚙️Adjusted landing page UI (yet again)", 
              "⚙️Adjusted AI UI to be more user friendly", 
              "⚙️Adjusted AI Feedback to be more accurate"
            ],
          },
        ],
      },
      {
        month: "February 2025",
        updates: [
          {
            date: "V 1.15 - February 6th, 2025",
            changes: [
              "➕Added Name field to contact form", 
            ],
          },
          {
            date: "V 1.14 - February 1st, 2025",
            changes: [
              "⚙️Adjusted landing page UI", 
              "⚙️Adjusted changelog page UI", 
              "⚙️Adjusted update endpoints to make the code clearer"
            ],
          },
        ],
      },
      {
        month: "January 2025",
        updates: [
          {
            date: "V 1.13 - January 12th, 2025",
            changes: [
              "➕Added ability to actually see the problems due today by pressing the `Due Today:` text on the study dashboard",
            ],
          },
          {
            date: "V 1.12 - January 10th, 2025",
            changes: [
              "➕Added Edit and Stats button to problem view",
              "⚙️Adjusted functionality of Autofilling leetcode problems so that how the question is formatted here on Repcode exactly matches how it looks on Leetcode",
              "⚙️Adjusted problem modal UI/UX",
            ],
          },
        ],
      },
      {
        month: "December 2024",
        updates: [
          {
            date: "V 1.11 - December 25th, 2024",
            changes: [
              "🎄Merry Christmas!!",
              "⚙️Adjusted landing page UI",
              "⚙️Adjusted problem modal UI"
            ],
          },
          {
            date: "V 1.10 - December 22nd, 2024",
            changes: [
              "➕Added ability to import problems from any public list on leetcode",
            ],
          },
          {
            date: "V 1.9 - December 17th, 2024",
            changes: [
              <>⭐<a href="https://github.com/hussiiii/Repcode/pull/1" target="_blank" rel="noopener noreferrer" className="text-new underline">PR #1</a> merged, credit @knownotunknown</>,
              "➖Removed limit for only being able to delete collections with under 20 problems", 
            ],
          },
          {
            date: "V 1.8 - December 12th, 2024",
            changes: [
              "⚙️Adjusted version numbering in changelog", 
              "⚙️Adjusted problem lists UI", 
            ],
          },
        ],
      },
      {
        month: "November 2024",
        updates: [
          {
            date: "V 1.7 - November 29th, 2024",
            changes: [
              "➕Added ability to import lists directly from Leetcode",
              "⚙️Adjusted UI of creating/deleting stuff to show loading states", 
            ],
          },
          {
            date: "V 1.6 - November 20th, 2024",
            changes: [
              "➕Added README file to explain how to set up dev environment, with comprehensive instructions",
              "⚙️Adjusted some color schemes on the landing page", 
              "🛠️Codebase fixes in preperation for open source release",
            ],
          },
        ],
      },
      {
        month: "October 2024",
        updates: [
          {
            date: "V 1.5 - October 31st, 2024",
            changes: [
              "🎃Happy Halloween!!",
              "⚙️Adjusted AI Feedback error message to be more descriptive", 
              "⚙️Adjusted tab indenting in code editor to be 4 instead of 2 (Credit: Jay)"
            ],
          },
          {
            date: "V 1.4 - October 21st, 2024",
            changes: [
              "⚙️Adjusted spatial repetition algorithm so that newly created problems are due the day after they are created, instead of on the same day, to avoid confusion (Credit: Ramses G.)",
              "⚙️Adjusted styling of problem modal",
            ],
          },
          {
            date: "V 1.3 - October 16th, 2024",
            changes: [
              "➕Added Dhruv C. as CFO because he asked nicely",
            ],
          },
          {
            date: "V 1.2 - October 14th, 2024",
            changes: [
              "➕Added hover tooltips to sidebar icons (Credit: u/Chamrockk)",
              "➕Added ability to autofill problem details (Credit: u/Chamrockk, u/KayySean, u/Strict-Inspection-99)", 
            ],
          },
          {
            date: "V 1.0 - October 11th, 2024",
            changes: [
              "🎉🎉 Repcode.io official 1.0 release build!! 🎉🎉", 
              "➕Added placeholder text to problem creation modal",
              "⚙️Adjusted styling of the problem link icon", 
              "🛠️Fixed issue with Toast notifications appearing off screen", 
            ],
          },
          {
            date: "V 0.22 - October 7th, 2024",
            changes: [
              "➕Added total problems/collections count to Collections page",
              "➕Added Leetcode Cycle infographic to landing page",
              "➕Added donut charts to show problem difficulty/type breakdowns in problem lists",
              "⚙️Adjusted layout of problem list pages", 
              "⚙️Ajusted styling of problem/notes/solution tabs",
            ],
          },
          {
            date: "V 0.21 - October 2nd, 2024",
            changes: [
              "➕Added some more info to the Guide page",
              "🛠️Fixed issue with guide page being unresponsive on mobile", 
            ],
          },
        ],
      },
      {
        month: "September 2024",
        updates: [
          {
            date: "V 0.20 - September 30th, 2024",
            changes: [
              "➕Added link to Guide page on the Settings page",
              "⚙️Adjusted links to Guide page to open in a new tab", 
              "⚙️Adjusted logo to... well, not sure, but it looks cool!", 
            ],
          },
          {
            date: "V 0.19 - September 21st, 2024",
            changes: [
              "➕Added nprogress loading bar to visually depict loading a new route",
              "🛠️Fixed issue with edit/delete menu not closing upon interaction", 
            ],
          },
          {
            date: "V 0.18 - September 10th, 2024",
            changes: [
              "➕Added 30 day view bar graph to Study Mode dashboard",
              "➕Added Heat Map component to track review streaks",  
              "⚙️Adjusted styling of Study Mode dashboard to contain a scrollable carousel", 
              "⚙️Adjusted styling of landing page to include Supercharge hero section", 
            ],
          },
        ],
      },
      {
        month: "August 2024",
        updates: [
          {
            date: "V 0.17 - August 29th, 2024",
            changes: [
              "⚙️Adjusted styling of Problems List page", 
              "⚙️Adjusted styling of sidebar text/icons", 
              "⚙️Adjusted styling of navbar to center the buttons", 
              "➖Removed randomizer button in Problem List page", 
            ],
          },
          {
            date: "V 0.16 - August 10th, 2024",
            changes: [
              "➕Added detailed problem breakdown view on Collection Cards", 
              "➕Added Stats button to show detailed analytics for each problem", 
              "⚙️Adjusted styling of all modals to fade into view", 
              "🛠️Fixed issue with certain buttons not having any href/link", 
            ],
          },
          {
            date: "V 0.15 - August 9th, 2024",
            changes: [
              "⚙️Adjusted styling of edit/delete menu to be a dropdown", 
              "⚙️Adjusted styling of the contact section in landing page", 
            ],
          },
          {
            date: "V 0.14 - August 4th, 2024",
            changes: [
              "⚙️Adjusted styling of profile page to be more intuitive", 
              "🛠️Fixed issue with editing a collection having the wrong default name", 
            ],
          },
        ],
      },
      {
        month: "July 2024",
        updates: [
          {
            date: "V 0.13 - July 20th, 2024",
            changes: [
              "⚙️Adjusted styling of FAQ accordian, and added one to Profile page", 
              "⚙️Adjusted styling of landing/login page to be responsive", 
            ],
          },
          {
            date: "V 0.12 - July 14th, 2024",
            changes: [
              "➕Added FAQ accordian in the Pricing and Billing page to address common concerns", 
              "⚙️Adjusted styling of Pricing and Billing page", 
              "⚙️Adjusted styling of landing/login page to be responsive", 
            ],
          },
        ],
      },
      {
        month: "June 2024",
        updates: [
          {
            date: "V 0.11 - June 20th, 2024",
            changes: [
              "➕Added profile/billing page, navigatiable via the sidebar", 
              "⚙️Adjusted styling/functionality of AI feedback", 
            ],
          },
          {
            date: "V 0.10 - June 11th, 2024",
            changes: [
              "⚙️Adjusted styling of homepage", 
              "⚙️Adjusted Pricing models/flow", 
              "⚙️Adjusted terms/privacy pages"
            ],
          },
          {
            date: "V 0.9 - June 4, 2024",
            changes: [
              "⚙️Adjusted logo to an orange lightbulb (real original, I know)", 
              "⚙️Adjusted endpoint to contain basic auth checks", 
            ],
          },
        ],
      },
      {
        month: "May 2024",
        updates: [
          {
            date: "V 0.8 - May 29, 2024",
            changes: [
              "⚙️Adjusted styling of the Create/Update problem modal to be more user friendly",
              "🛠️Fixed issue with the sidebar state not being retained across pages", 
              "🛠️Fixed issue with problem details not being updated immediately", 
              "🛠️Fixed issue with authentication checks not working in create/update problem APIs", 
              "➖Removed light/dark mode toggle until a better method is found",
            ],
          },
          {
            date: "V 0.7 - May 19, 2024",
            changes: [
              "➕Added ability to solve random problem from current collection and from all collections in Collection view",
              "➕Added Back button to return to Collection view from Problem view",
              "🛠️Fixed styling of Study mode problems",
            ],
          },
          {
            date: "V 0.6 - May 9, 2024",
            changes: [
              "➕Added syntax highlighting for solutions (using highlight.js)",
              "⚙️Adjusted Logout icon", 
              "⚙️Adjusted styles for problem difficulty and type",
            ],
          },
          {
            date: "V 0.5 - May 7, 2024",
            changes: [
              "➕Added 4 new customization options to problems: programming language, link to leetcode/hackerrank, function signature boilerplate, and additional notes",
              "⚙️Adjusted problem view to incorporate the above changes in a user friendly way", 
              "⚙️Adjusted sidebard text Dashboard --> Collections, and changed the icon as well",
            ],
          },
        ],
      },
      {
        month: "April 2024",
        updates: [
          {
            date: "V 0.4 - April 17, 2024",
            changes: [
              "⚙️Adjusted various colors for light/dark mode",
              "🛠️Fixed issue with Google auth sign in not working for some accounts", 
              "🛠️Fixed issue where questions/solutions exceeding a certain length would get cut off"
            ],
          },
          {
            date: "V 0.3 - April 6, 2024",
            changes: [
              "⚙️Adjusted collections and problems so that users can click anywhere inside of them to navigate to its page", 
              "🛠️Fixed styling issues with homepage GIFs and contact form",
            ],
          },
        ],
      },
      {
        month: "March 2024",
        updates: [
          {
              date: " V 0.2 - March 26, 2024",
              changes: [
                "➕Added Guide page", 
                "🛠️Fixed issue with login feedback not being shown properly (incorrect user/password, user not found in database, etc)",
                "🛠️Fixed Good and Easy button text so that they display in days instead of minutes for Relearning problems", 
                "🛠️Fixed logical issue with Bar Graph not handling problems past their due date correctly", 
              ],
          },
          {
            date: "V 0.1 - March 25, 2024",
            changes: [
              "🎉🎉 Repcode.io beta release build!! 🎉🎉",
            ],
          },
        ],
      },
    ];

    const legendItems = [
        { emoji: "⭐", description: "PR from a contributor merged" },
        { emoji: "⚙️", description: "Small change/adjustment" },
        { emoji: "🎉", description: "Major release build" },
        { emoji: "➕", description: "New feature added" },
        { emoji: "➖", description: "Feature removed" },
        { emoji: "🛠️", description: "Bug fix" },
    ];

    return (
      <div className="flex flex-col min-h-screen bg-base_100">
          <NavBar />
          <div className="pt-40 sm:pt-24 flex-grow">
            {/* Top Banner Legend for md screens and smaller */}
            <div className="lg:hidden w-full max-w-7xl mx-auto px-4 sm:px-6 mb-6">
              <div className="w-full bg-base_100 border border-divide rounded-lg p-4 shadow-sm">
                <h3 className="text-primary font-medium mb-3 text-lg text-center">Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {legendItems.map((item) => (
                        <div key={item.emoji} className="flex items-center bg-base_100 rounded-md p-2 border border-divide">
                            <span className="text-xl mr-2">{item.emoji}</span>
                            <span className="text-secondary text-sm">{item.description}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
              <div className="flex flex-col lg:flex-row">
                {/* Main content area with left sidebar */}
                <div className="flex flex-1 relative">
                  {/* Left sidebar (month navigation) */}
                  <div className="hidden md:block w-1/4 p-4 border-r border-divide overflow-auto">
                      {changelogData.map((log, index) => {
                          const currentYear = log.month.split(' ')[1];
                          const prevYear = index > 0 ? changelogData[index - 1].month.split(' ')[1] : null;
                          const showYearDivider = currentYear !== prevYear;
                          
                          return (
                              <div key={log.month}>
                                  {showYearDivider && (
                                      <div className="flex items-center justify-center mb-6 mt-2">
                                          <div className="flex-grow border-t border-divide"></div>
                                          <span className="px-3 text-primary font-bold text-lg">{currentYear}</span>
                                          <div className="flex-grow border-t border-divide"></div>
                                      </div>
                                  )}
                                  <div className="mb-4">
                                      <div className="py-2 px-4 w-full text-left text-primary font-bold">
                                          {log.month}
                                      </div>
                                      <ul className="pl-4">
                                          {log.updates.map((update) => (
                                              <li key={update.date} className="list-disc text-secondary">{update.date}</li>
                                          ))}
                                      </ul>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
                  
                  {/* Main changelog content */}
                  <div className="w-full md:w-3/4 p-4 lg:pr-72">
                      {changelogData.map((log) => (
                          <div key={log.month} className="mb-12">
                              <h2 className="inline-block font-bold text-2xl text-primary border-b-2 border-divide mb-2">{log.month}</h2>
                              {log.updates.map((update) => (
                                  <div key={update.date} className="mb-4">
                                      <h3 className="font-bold text-xl text-secondary">{update.date}</h3>
                                      <ul className="pl-5 text-secondary list-none">
                                          {update.changes.map((change, index) => (
                                              <li key={index} className="mb-1">{change}</li>
                                          ))}
                                      </ul>
                                  </div>
                              ))}
                          </div>
                      ))}
                  </div>
                  
                  {/* Sticky Legend */}
                  <div className="hidden lg:block fixed top-32 right-8 w-72 p-4 bg-base_100 border border-divide rounded-lg shadow-sm">
                    <h3 className="text-primary font-medium mb-3 text-lg text-center">Legend</h3>
                    <div className="flex flex-col gap-3">
                        {legendItems.map((item) => (
                            <div key={item.emoji} className="flex items-center bg-base_100 rounded-md p-2 border border-divide">
                                <span className="text-xl mr-2">{item.emoji}</span>
                                <span className="text-secondary text-sm">{item.description}</span>
                            </div>
                        ))}
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
