# Rustenburg-TV-centre-Website-and-PWA

This repository contains a small static website for Rustenburg TV Centre — a home electronics repair shop. The site is written in HTML, CSS and TypeScript and includes pages for Home, About, Gallery and Contact.

How to view locally

1. Serve the folder using a static file server. If you have Node.js installed you can run:

```
npx serve -s . -l 5000
```

Then open http://localhost:5000 in your browser.

2. Optional: build TypeScript sources to JavaScript

```
npm install
npm run build:ts
```

Notes
- Sample images referenced in the gallery are placeholders under `assets/images/` — add your own images there.

Google Sheets integration (Apps Script)
-------------------------------------
If you'd like bookings to be recorded in Google Sheets and checked via the website, you can deploy a Google Apps Script Web App that reads/writes a sheet. Basic steps:

1. Create a Google Sheet with columns: timestamp, bookingRef, firstName, lastName, phone, appliance, address, pickupTime, status, technicianEstimate
2. In the Google Apps Script editor (Extensions → Apps Script) create a new script and paste the sample code below.
3. Deploy as Web App (execute as: Me, who has access: Anyone) and copy the Web App URL.
4. Create `assets/js/config.js` in this repo and add:

```js
window.SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec'
```

Sample Apps Script (paste into the Apps Script editor):

```javascript
const SHEET_NAME = 'Bookings';

function doGet(e) {
	const action = e.parameter.action;
	const key = e.parameter.key;
	const ss = SpreadsheetApp.getActive();
	const sheet = ss.getSheetByName(SHEET_NAME);
	if (action === 'lookup' && key) {
		const data = sheet.getDataRange().getValues();
		// find by bookingRef or phone
		for (let i = 1; i < data.length; i++) {
			const row = data[i];
			const bookingRef = String(row[1] || '');
			const phone = String(row[4] || '');
			if (bookingRef === key || phone === key) {
				return ContentService.createTextOutput(JSON.stringify({
					status: row[8] || 'still in repairs',
					technicianEstimate: row[9] || ''
				})).setMimeType(ContentService.MimeType.JSON);
			}
		}
		return ContentService.createTextOutput(JSON.stringify({ error: 'not found' })).setMimeType(ContentService.MimeType.JSON);
	}
	return ContentService.createTextOutput(JSON.stringify({ error: 'missing action' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
	// expects JSON payload with booking data
	const ss = SpreadsheetApp.getActive();
	const sheet = ss.getSheetByName(SHEET_NAME);
	const body = JSON.parse(e.postData.contents || '{}');
	const bookingRef = 'BK' + new Date().getTime();
	sheet.appendRow([new Date(), bookingRef, body.firstName, body.lastName, body.phone || '', body.appliance || '', body.address || '', body.pickupTime || '', 'still in repairs', '']);
	return ContentService.createTextOutput(JSON.stringify({ bookingRef })).setMimeType(ContentService.MimeType.JSON);
}
```

Notes on status flows
- Technicians can edit the sheet's `status` column to one of: "still in repairs", "expected: <text>", or "ready for pick-up". The `technicianEstimate` column can hold expected completion info.

Deploying as a secure HTTPS demo (GitHub Pages)
---------------------------------------------
If you want a public HTTPS demo where all pages work cohesively, you can deploy this repository to GitHub Pages. I added a GitHub Actions workflow that publishes the repository root to the `gh-pages` branch on every push to `main`.

Steps:

1. Commit and push your changes to the `main` branch.
2. The workflow `.github/workflows/deploy.yml` will run and publish to `gh-pages` branch.
3. Enable GitHub Pages for the repository (if it doesn't enable automatically):
	- Go to the repo Settings → Pages and set the source to `gh-pages` branch.
4. Your site will be available at https://<your-github-username>.github.io/<repo-name>/

Config for Apps Script (bookings)
---------------------------------
After you deploy the Apps Script Web App (see previous section), edit `assets/js/config.js` and set:

```js
window.SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec'
```

When the site is published on GitHub Pages, bookings will POST to that URL from the HTTPS origin.


# Rustenburg-TV-centre-Website-and-PWA