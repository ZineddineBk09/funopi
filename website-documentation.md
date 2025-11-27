Project Documentation: "Bored Button" Clone

Goal: Build a functional clone of the Bored Button website (boredbutton.com) using Next.js and Tailwind CSS.
Core Functionality: A homepage with a "Bored Button" that, when clicked, loads a random interactive website inside an iframe wrapper, preserving a header for navigation.

1. Tech Stack & Setup

Framework: Next.js (App Router)

Styling: Tailwind CSS

Icons: Lucide React (or FontAwesome for specific button dots if needed)

Language: TypeScript

2. Design System & Global Styles

The design should mimic the "classic/retro web" feel of the original site.

Background Color: Off-white/Paper texture (bg-[#fdfdfd] or #faf9f6).

Typography: Serif fonts for the main text to match the original (e.g., font-serif, Times New Roman fallback).

Theme: Minimalist, centering on the red button.

3. Data Structure: The Website List

Create a file data/sites.ts to store the list of games/websites to display.

Requirement:

Since we are using an <iframe>, the URLs must allow embedding (no X-Frame-Options: DENY).

Format: Array of objects.

// data/sites.ts
export const sites = [
  {
    title: "The Useless Web",
    url: "[https://theuselessweb.com/](https://theuselessweb.com/)", // Example
  },
  {
    title: "Quick Draw",
    url: "[https://quickdraw.withgoogle.com/](https://quickdraw.withgoogle.com/)",
  },
  // ... add 10-20 placeholder iframe-friendly URLs
];


4. Component Architecture

A. The "Bored Button" Component (components/BoredButton.tsx)

This is the most critical UI element. It must look like a 3D plastic red button.

Visual Specs:

Circular shape.

Gradient Red background (darker at bottom, lighter at top for 3D effect).

Drop shadow (shadow-xl or custom CSS shadow) to simulate depth.

The Holes: The button has 4 white dots (holes) in the center, arranged in a square, simulating a clothing button.

Interaction: active:scale-95 and shadow reduction to simulate being pressed.

Props:

onClick: function (optional).

size: 'large' (homepage) | 'small' (header).

B. The Game Wrapper Layout (app/play/page.tsx)

This page handles the logic of displaying the random site while keeping the button visible.

Layout:

Header (Sticky/Fixed Top):

Height: ~60-80px.

Background: White or slightly off-white with a bottom border.

Left: Title of the current site (e.g., "Current Site: Quick Draw").

Right: Small version of the BoredButton with text "Still bored? Press the Bored Button again."

Links: "Home", "Remove Frame" (links to the raw URL of the current iframe).

Main Content:

Full width and remaining height (calc(100vh - headerHeight)).

<iframe> element.

src: dynamically set from state.

className="w-full h-full border-0".

5. Page Logic & Routing

A. Homepage (app/page.tsx)

Layout: Centered flex column.

Elements:

Large BoredButton.

Headline: "Bored?" (Large, Bold, Serif).

Subtext: "Go ahead, press the Bored Button™."

Paragraph: "I am bored. I'm so bored... Clicking the red button will instantly take you to one of hundreds of interactive websites..." (Copy the vibe of the text).

Action: Clicking the button routes to /play.

B. The Play Page (app/play/page.tsx)

State: currentSiteIndex (number).

Logic:

On mount (useEffect), select a random index from the sites array.

Set the currentSiteIndex.

Button Click (in Header): Select a new random index (ensure it's not the same as the current one). Update state.

Iframe: Renders the URL from sites[currentSiteIndex].url.

6. Step-by-Step Implementation Plan

Step 1: Setup
Initialize the Next.js project with Tailwind.

Step 2: Create the Button
Build components/BoredButton.tsx. Use Tailwind utilities for the red gradient (e.g., bg-gradient-to-b from-red-500 to-red-700) and CSS box-shadows for the 3D effect. create the 4 holes using a grid of 4 small white divs with rounded-full.

Step 3: Create the Homepage
Implement app/page.tsx. Center the content. Add the serif typography. Add the footer links (Terms, Privacy, etc.).

Step 4: Create the Data
Populate data/sites.ts with at least 5 working URLs that allow iframing (e.g., Wikipedia pages, simple game demos, Archive.org emulators).

Step 5: Create the Play Page
Implement app/play/page.tsx.

Create the Header layout.

Embed the BoredButton (small size) in the header.

Add the <iframe>.

Implement the randomization logic in a function shuffleSite().

Step 6: "Remove Frame" Feature
In the header, add a link that points directly to sites[currentSiteIndex].url with target="_blank".

7. Prompt for AI (Copy/Paste this to Cursor Composer)

"I want to build a clone of BoredButton.com using Next.js and Tailwind.

First, please create a data/sites.ts file with an array of 5-10 URLs of fun, safe websites that allow iframe embedding (like simple tools or Wikipedia random pages).

Next, create a BoredButton component. It should be circular, red with a gradient to look 3D, have a drop shadow, and feature 4 small white dots in the center arranged like a button fastener. It should have a 'size' prop to toggle between a large homepage version and a smaller header version.

Then, create the Homepage (app/page.tsx) which is centered, has a serif font, displays the large Bored Button, and includes the descriptive text found on the original site.

Finally, create a /play page. This page should have a sticky header containing a smaller Bored Button, a 'Home' link, and a 'Remove Frame' link. Below the header, fill the rest of the screen with an <iframe> that displays a random website from our data file. Clicking the button in the header should randomly select a new website for the iframe."