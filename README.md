# रसुवा बाढी पीडित परिवार समन्वय — MOF Family Feedback System

A single-file web app for the Ministry of Finance committee coordinating with
families of Customs Office Rasuwa employees who went missing or died in the
Rasuwa flood.

| File | Purpose |
|---|---|
| `index.html` | The whole app: landing page, family intake form, Ministry dashboard |
| `backend/Code.gs` | Optional Google Sheets backend so submissions from many phones land in one place |
| `README.md` | This guide |

## 1. Quick start (single device, no setup)

Open `index.html` in Chrome, Edge, Safari or Firefox. It works from the file
itself; internet is needed only for fonts and the chart library.

* **Family form** → `index.html#form`
* **Ministry dashboard** → `index.html#admin`

Default login:

```
Username: mof_admin
Password: MoF-Rasuwa-VaunKYDwKs#2083
```

Change both in the `CONFIG` block at the top of the `<script>` in `index.html`
before sharing the file. The dashboard also has a "Change password" card that
applies to that browser only.

In this mode every submission is stored in that browser's local storage.
This works well when committee members fill the form with families in person or
over the phone on one laptop. Use **निर्यात तथा सेटिङ → JSON** to export, and the
import card on another device to merge records. CSV export opens in Excel.

## 2. Families submitting from their own phones (central storage)

Browser storage cannot be shared between devices, so for remote submissions you
need the Google Sheets backend. It takes about five minutes with any Google
account the Ministry controls.

1. Create a new Google Sheet. Rename the first tab to `Submissions`.
2. In the sheet: **Extensions → Apps Script**. Delete the sample code, paste the
   contents of `backend/Code.gs`, save.
3. **Deploy → New deployment**. Type: *Web app*. Execute as: *Me*. Who has
   access: *Anyone*. Click Deploy and authorise when asked.
4. Copy the Web app URL (ends in `/exec`).
5. In `index.html`, set `API_URL: "https://script.google.com/macros/s/.../exec"`.
6. Host `index.html` anywhere families can reach it (the Ministry web server,
   GitHub Pages, Netlify Drop, or even sent as a file). Share the link ending in
   `#form`.

Now every submission is appended to the sheet (one row per family with the full
record as JSON), and the dashboard on any device loads from the sheet when an
admin logs in. Submissions are also kept locally as a fallback if the phone was
offline.

Re-run **Deploy → Manage deployments → Edit → New version** whenever you edit
the script.

## 3. What the form collects

1. **Applicant**: name, relation to the employee, phone numbers, citizenship
   number (optional), date of birth, best time to contact, current address and
   permanent/origin address (province, district, municipality, ward, tole).
2. **Employee**: name, status (missing / confirmed deceased),
   designation, employment type (permanent, contract, daily wage, security,
   other), employee ID, gender, age, DOB, marital status, incident date, years
   of service, whether they were the sole earner, last known information.
3. **Household members**: one row per member with relation (husband, wife, son,
   daughter, father, mother), name, age, gender,
   occupation/status, dependency, health or disability note; students also get
   school/college, grade, school type, annual fee and impact on study.
4. **Economic situation**: income band before the incident, housing status,
   other income sources, loans (amount and lender).
5. **Problems and requests by category**, each with a priority (urgent / medium
   / normal) and free text: relief and compensation, livelihood, employment for a
   family member, children's education, health, housing, debt, entitlements
   (insurance, PF, gratuity, pension), legal and documentation, search and
   recovery, psychosocial support, other. Plus main request, urgent need,
   long-term expectation and anything else.
6. **Documents available** with the family.
7. **Consent** declaration.

Each submission gets a reference number like `MOF-RSW-2610-AB12` that the family
can quote later.

## 4. What the dashboard shows

* **ड्यासबोर्ड**: KPI tiles (families, missing/deceased, dependents, children,
  sole-earner households, loans, urgent asks, student fees) and charts for
  problem categories (urgent vs other), employee status, employment type,
  household age bands, relations, income bands, housing, origin districts,
  submissions per day and documents available.
* **परिवार सूची**: searchable, filterable table; click a row for the full record
  in a side panel with print.
* **माग / समस्या विश्लेषण**: every family's own words grouped by category, urgent
  first.
* **सदस्य तथा शिक्षा**: all household members and a dedicated students table.
* **निर्यात तथा सेटिङ**: CSV and JSON export, JSON import/merge, password change,
  sample data for testing (clearly marked and removable), clear local data.

## 5. Security notes

* The login is a convenience gate in the browser, not real authentication.
  Anyone with the HTML file can read the password. Do not publish the dashboard
  on a public URL with real data unless it sits behind the Ministry's own login
  or a protected network.
* The Google Sheet holds personal data of bereaved families. Restrict sheet
  sharing to the committee and keep the Apps Script URL off public pages
  (families only need the form link; the URL inside the file is still visible to
  anyone who views source, so prefer hosting the form on a Ministry domain).
* For long-term use, the same form and dashboard can be pointed at a proper
  Ministry database by replacing the `Store` object in `index.html`.
