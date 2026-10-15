# Rum Island development

This repository is the source of truth for future Rum Island work. Import baseline: Site source commit d80139dc7cb739753ff93f9e92fce3d2438fd214.

- Address the user as Captain. Nova is the user's original redheaded character. Mr. Fluffy is an undead dragon.
- Preserve the story: individual opening, partner joins at its end, ship tour, melee bar fight, drunken ship theft, island arrival and card-game tavern acquisition.
- The tavern is a playable hub: beach left, missions selected at its computer, departure through the right door. Residents animate and provide services.
- Keep foreground surfaces visually aligned with collision geometry. Ladder endpoints must have real landings; out-of-bounds falls must recover through a death/retry screen.
- This is currently a Canvas browser game. Moving it to GitHub does not authorize changing engines or discarding it.
- Keep source PNG artwork and runtime WebP assets, original audio, and frame bounds together. Record generated asset prompts in README.md.
- Run npm test for gameplay changes and npm run test:render for visual changes. Inspect resulting scenes. Canvas renders do not establish browser/mobile QA; report unverified behavior accurately.
- Make source changes in this repository. The existing hosted preview is https://rum-island-adventure.palerain16.chatgpt.site; preserve its identity if updating it. Keep hosting credentials, local outputs and node_modules out of the repo.
