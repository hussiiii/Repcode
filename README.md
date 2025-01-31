# Repcode 

Your personalized online notebook for everything Leetcode. 

This is the codebase, it's all hosted online for free though so if you just want to use it then visit repcode.io. If you would like to contribute, then continue reading. 


❤️❤️ SPECIAL THANKS TO ALL OUR CONTRIBUTORS: ❤️❤️
* No one yet :( submit a PR to see your name here!




## Table of Contents
* [Introduction](#introduction)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Contributing](#contributing)
* [License](#license)

## Introduction

This project is an open-source platform designed to streamline your Leetcode practice. It includes features such as problem organization, AI-powered feedback, and spatial repetition for efficient learning.

## Features

* Organize problems into collections.
* Review problems with a SuperMemo-based spatial repetition algorithm.
* Get AI-powered feedback on your solutions.
* View detailed stats about your problems, to target your weaknesses 

## Tech Stack

* **Frontend**: React, Next.js, TailwindCSS
* **Backend**: Prisma, MySQL (production), SQLite (development), Firebase (for auth)
* **Hosting**: Vercel

## Getting Started

Below are detailed instructions for how to set up your local development environment and make and submit changes/PRs. If you run into any issues, please email repcode.io@gmail.com.

### Prerequisites

Ensure you have the following installed:
* Node.js (v16 or higher recommended)
* npm or yarn
* SQLite (for local development)

### Installation

1. Clone the repository to some folder on your desktop 

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```plaintext
DATABASE_URL="file:./dev.db"

```

4. Update `schema.prisma`:
   * Replace the contents of `schema.prisma` with the contents of `devTemplates/devprisma.txt`


5. Delete the folder `prisma/migrations` entirely 


6. Initialize the SQLite database by running the following commands in the terminal of your code editor: 
```bash
npx prisma migrate dev --name init
npx prisma generate
```

7. Comment out the following line in `ProblemsQueue.tsx`, on line 284:
```typescript
// Comment this out to avoid runtime errors in development
// await updateContribution(user?.email || '');
```

8. Start the development server and navigate to the localhost on your browser:
```bash
npm run dev
```

Congratulations! You've now successfully set up the development environment! Feel free to explore and make some test changes to stuff to see how everything works.  

To view the database structure:
* Use any online SQLite database viewer and drag-and-drop the `prisma/dev.db` file.

Remember that you're using a local dev.db that emulates the structure of the production database, but not the content: it'll start off as empty. And changes you make to this DB won't affect the production DB (and vice versa). But any changes with data fetching/pushing that work on this dev db will work on the production db as well. 

## Contributing

We welcome contributions! Follow these steps to contribute:

### Workflow for Contributors

1. **Fork the repository**:
   * Go to the repository's GitHub page and click the "Fork" button.

2. **Clone your forked repository**

3. **Create a new branch for your changes**:
```bash
git checkout -b feature/your-feature-name
```

4. **Make your changes locally**:
   * Follow the setup instructions under Getting Started to set up the dev environment 

5. **Commit your changes**:
```bash
git add .
git commit -m "Description of your changes"
```

6. **Push your branch to your fork**:
```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request (PR)**:
   * Go to the original repository's GitHub page.
   * Click the "Pull Request" tab.
   * Select your branch and submit the PR.

8. **Wait for Review**:
   * A maintainer will review your PR.
   * Make any requested changes and update the PR.

### Guidelines

* Follow the existing code style.
* Test your changes thoroughly.
* Write descriptive commit messages.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
