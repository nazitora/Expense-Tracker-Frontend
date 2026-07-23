# ExpenseFlow — Frontend

A vanilla JavaScript SPA frontend for the ExpenseFlow expense tracker, connecting to the ExpenseFlow backend API.

## Features
- User authentication (register/login) with JWT
- Dashboard with spending stats and charts (Chart.js)
- Add, edit, delete expenses
- Custom categories
- Group expense splitting with automatic balance calculation

## Tech
- Vanilla JavaScript (no framework/build step)
- Chart.js for data visualization
- Connects to backend API at [your Render backend URL]

## Running locally
Open `index.html` with a local server (e.g. VS Code Live Server or `npx http-server`) — opening the file directly won't work due to browser CORS restrictions on `fetch()`.
