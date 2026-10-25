# Moodle Blog Patch

A Tampermonkey Userscript that adds the moodle blog back to the htlstp moodle website.

The script uses the user's profile description and interests (tags) to build the blog feed.  
One constraint is that, to view posts from all users, you must be enrolled in at least one course with every user.

## Installation

Get the Tampermonkey browser extension: https://www.tampermonkey.net/.  
Add the script from the latest release to your scripts and enable it.  
Go to moodle.htlstp.ac.at and start blogging!

## Building yourself

To install dependencies:

```bash
bun install
```

To build:

```bash
bun run build
```

The build should then appear at `dist/moodleblog.user.js`.
To install, follow the steps from [Installation](#installation)