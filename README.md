# Rustenburg-TV-centre-Website-and-PWA

This repository contains a small static website for Rustenburg TV Centre — a home electronics repair shop. The site is written in HTML, CSS and TypeScript and includes pages for Home, About, Gallery and Contact.

The Company reserves the copyright of the images used in the website.

Google Sheets integration (Apps Script)
-------------------------------------

1. Deploy as Web App (execute as: Me, who has access: Anyone) and copy the Web App URL.
2. Create `assets/js/config.js` in this repo and add:

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

Config for Apps Script (bookings)
---------------------------------
After you deploy the Apps Script Web App (see previous section), edit `assets/js/config.js` and set:

```js
window.SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec'
```
# Rustenburg-TV-centre-Website-and-PWA
