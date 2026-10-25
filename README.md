# Moodle Blog Patch

A Tampermonkey Userscript that adds the moodle blog back to the htlstp moodle website.

The script uses the user's profile description and interests (tags) to build the blog feed.  
One constraint is that, to view posts from all users, you must be enrolled in at least one course with every user.

---

To install dependencies:

```bash
bun install
```

To build (production):

```bash
bun run build
```
