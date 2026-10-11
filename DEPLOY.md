# How to publish (landing page + download)

## A. One-time: put the project on GitHub
1. github.com -> New repository -> name it `next-big-idea` -> Public -> Create.
2. "uploading an existing file": unzip `next-big-idea-source.zip` and drag ALL its files and folders (including the hidden `.github` folder) into the page -> Commit.

## B. The Windows download (GitHub Releases, free)
1. Repository -> Releases -> Create a new release -> Tag: `v0.2.1`.
2. Drag `NextBigIdea-Windows.zip` (about 300 MB, includes the offline voice-to-text engine) into the release box -> Publish release.
3. Copy the link of the zip file (right-click -> Copy link address). It looks like
   https://github.com/YOURNAME/next-big-idea/releases/download/v0.2.1/NextBigIdea-Windows.zip

## C. The landing page (Vercel, free)
1. Open `web/index.html` in the repository -> pencil icon -> find `const DOWNLOAD_URL="";` -> paste the link between the quotes -> Commit.
2. vercel.com -> Add New -> Project -> Import `next-big-idea` -> Root Directory: `web` -> Deploy.
3. Your public page: https://next-big-idea.vercel.app (or similar). Share this link. The web app is at /app.

## D. Better installer later (optional)
Create a tag like v0.3.0 on GitHub: it runs the tests and builds `Setup.exe` automatically (Actions tab).
