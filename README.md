# GradeVue — StudentVUE-style Grade Reader (for GitHub Pages)

This is a static, client‑side web app you can host on GitHub Pages. It mimics the StudentVUE mobile UI and includes the pages you showed:

- Student Info, Class Schedule, School Information, Report Card, Documents
- Course History, Course Request, Test History
- Synergy Mail, Flex Schedule, Calendar, Attendance
- Grade Book, Daily Assignments, Class Notes
- Settings, Dashboard, and Sign In

## How to use on GitHub Pages

1. Create a repo named `<username>.github.io` **or** any repo with Pages enabled.
2. Upload the files in this folder to the repo root.
3. Visit your GitHub Pages URL to use it. It will load demo data by default.

## District link on Sign‑in

On the **Sign In** page there is a field for your district's StudentVUE URL (e.g., `https://synergy.<district>.org/StudentVUE`).  
Saving this just stores it in `localStorage` so every request you make can point at the right server.

> ⚠️ Live StudentVUE login uses proprietary APIs and often blocks cross‑origin browser calls. For safety/compatibility, the app ships with **demo data** and an **Import JSON** button.

## (Optional) Connect to real data via a proxy

If you want to experiment, you can set a CORS‑enabled proxy in **Settings** and implement a function in `assets/app.js` called `fetchStudentVue()` that posts to your proxy. The proxy would:
- receive `{ district, endpoint, payload }`
- talk to the StudentVUE API server‑side (SOAP/XML)
- respond with normalized JSON that matches `assets/sample_data.json`

**Do not** share credentials with untrusted proxies, and check your district’s Terms of Use.

## Data model (normalized)

If you build a proxy, return JSON with these keys so the pages render automatically:

- `student` → `{ name, id, grade, school, counselor, email }`
- `schedule` → `[{ period, course, teacher, room, time }]`
- `schoolInfo` → `{ name, phone, address }`
- `reportCard` → `[{ term, course, grade, credits }]`
- `documents` → `[{ name, url, type }]`
- `courseHistory` → `[{ year, course, term, grade, credits }]`
- `courseRequests` → `[{ course, status }]`
- `tests` → `[{ name, date, score }]`
- `mail` → `[{ subject, from, date }]`
- `flexSchedule` → `[{ date, session, activity }]`
- `calendar` → `[{ date, title, type }]`
- `attendance` → `[{ date, status, notes }]`
- `gradebook` → `[{ course, teacher, percent, letter }]`
- `assignments` → `[{ date, course, title, pointsEarned, pointsPossible, status }]`
- `classNotes` → `[{ course, note, date }]`

## Privacy

All logic runs in the browser. If you connect a proxy, you control where the data goes. Storing settings is optional.

## Dev notes

- Vanilla HTML/CSS/JS, no build tools.
- Hash‑based router; simple components.
- Responsive and accessible-ish (keyboard + landmarks).
