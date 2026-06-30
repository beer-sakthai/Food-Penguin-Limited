# Workspace Rules

- **Stitch UI Generation**: When the user requests to design, build, or iterate on UI for a web or mobile application, ALWAYS prioritize using the `StitchMCP` server tools (e.g., `generate_screen_from_text`, `create_project`, `create_design_system`) which connects to stitch.withgoogle.com. Do not manually code complex designs from scratch if Stitch can generate them, unless the user explicitly requests manual coding.
- **Scratch File Isolation**: Do not include temporary or legacy scratch files (e.g., `scratch-*.tsx` or root-level throwaway scripts) in the active TypeScript build compilation scope. Ensure they are excluded in `tsconfig.json`.
- **Consolidated Typography**: This project strictly uses only three consolidated font sizes defined in the Tailwind `@theme` configuration in `src/index.css`: Detail (`1.05rem`), Headline (`1.5rem`), and Number (`2.5rem`). Avoid adding ad-hoc text sizes.
- **Communication Style**: Keep all responses to the user extremely concise, simple, and direct. Do not write lengthy paragraphs or detail minor steps unless specifically asked.
