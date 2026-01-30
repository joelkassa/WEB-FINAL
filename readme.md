 ## NOTE: THE REAL API HAS NOT BEEN UPLOADED TO GITHUB. 
 
 
 # Topic and Description
 
**Interest News**

A personalized news aggregator that allows users to follow specific topics of interest without algorithms or noise. Users can browse news by category, search for specific topics, save articles to a personal "Interested" list, and upgrade to premium for unlimited saves. Built as a final project for Introduction to Web Development.

# Features

- **Multi-Category News**: Browse news by Technology, Sports, Business, Science, Health, or Entertainment
- **Search Functionality**: Search for any specific topic (AI, Bitcoin, Space, etc.)
- **Interest Saving**: Save articles to a personal "Interested" tab with LocalStorage persistence (limited to 3 items for free users)
- **Premium Upgrade**: Registration form with validation that unlocks unlimited article saves
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels, semantic HTML structure, and keyboard navigation support
- **Form Validation**: Real-time validation with error messages on Contact and Premium forms
- **Toast Notifications**: Non-intrusive feedback messages instead of browser alerts
- **Load More**: Pagination support to fetch additional news articles

# Technologies Used

- **Html**: basic structure
- **CSS**: styling
- **JavaScript**: main logic 

# How to Run the Project

- Step 1: Get the Files
    First, download the project folder to your computer. If it is in a zip file, extract it so you can see all the files like index.html, style.css, and app.js in one folder.

- Step 2: Get Your API Key
    You need a key to access the news data. Go to the NewsData.io website and sign up for a free account. Once you are logged in, you will see a long string of letters and numbers labeled as your API key. Copy that key.

- Step 3: Set Up Your Config File
    Inside your project folder, find the file named config.example.js. Make a copy of this file and rename the copy to config.js. Open this new file in any text editor like VScode. You will see a placeholder where it says to put your API key. Paste the key you copied from Step 2 in that spot and save the file.

- Step 4: Open the Website
    Now double-click on the index.html file in your folder. It should open in your default web browser like Chrome or Firefox. You should see the Interest News homepage with a search bar and category buttons.
