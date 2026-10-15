# Developing Rum Island

Current source imported from the published game on October 14, 2026 (Site source commit `d80139dc7cb739753ff93f9e92fce3d2438fd214`). This is still a browser-based Canvas game; the repository makes code, assets, testing and future engine migration editable and versioned.

## Run locally

Install Node.js 24, clone this repository, then run:

```sh
npm install
npm run dev
```

Open **http://localhost:3000**. The development server reloads files on refresh. Game progress is saved separately by each browser/origin; the hosted game's save is not automatically transferred to localhost.

```sh
npm test
npm run test:render
```

The first command checks gameplay. The second renders Canvas scenes to `tests/renders/` for inspection. Neither replaces browser or device playtesting. GitHub Actions runs both on pushes and pull requests.

## Source layout

- `dist/index.html`, `style.css`: entry point and responsive interface.
- `dist/adventure.js`: input, physics, combat and story flow.
- `dist/mission.js`, `voyages.js`: authored missions, objectives and encounters.
- `dist/home.js`: playable tavern, mission computer, resident services and beach incidents.
- `dist/polish.js`, `refinement.js`: artwork integration, audio, companion navigation and ship theft.
- `dist/assets/`: editable PNG source artwork, runtime WebP art and original WAV audio.
- `tests/`: gameplay regressions and Canvas rendering checks.
- `scripts/prepare-polish.py`: optional art/audio preprocessing. Install `requirements-art.txt` with pip before using it; the game itself needs no Python dependencies.

The existing hosted build remains available at https://rum-island-adventure.palerain16.chatgpt.site. This import does not change its hosting or the repository's public visibility. Source asset prompts and the implementation history follow below. No license is assigned by this import; a public repository alone does not grant a reuse license, and character/IP choices will need consideration before commercial release.

---

# Rum Island — Bad Decisions, Good Company

A buildless Canvas side-scrolling adventure, replacing the original geometric platformer. Launch `dist/index.html` through a static server. The GitHub repository is the source for future development.

## Playable sequence

Choose redheaded Nova (facility stealth) or Sylvanas (haunted woodland combat). Traverse six authored rooms and connected ladder routes; recover an access card or seal, disable three controls, then meet the other lady at the portal at the end of the intro. Two ship-tour pictures lead to drinks; clear a melee-only bar brawl; drink, release the ship's two moorings, and take the helm; arrive on Rum Island; win two five-card-draw hands to acquire the tavern. Four repeatable island missions rescue residents and collect PDF scraps. Gold purchases visible tavern improvements. All scraps and improvements unlock the Clippy encounter.

Controls: A/D or arrows move, W/S climb ladders, S/C toggle crouch, Space jump, J attack, K ability, E interact, Esc pause. Landscape phone touch controls have matching actions. Nova cloaks and double-jumps; Sylvanas uses arrows, a spectral volley, and an eight-second summoned fighter. The other character accompanies and assists after the portal.

## Verification and limits

`node tests/story.cjs` checks both openings, portal gates, actual ladder ascent, melee damage without projectiles, ship objective gates, card-game deed acquisition, residents, scraps, repair accounting and unlocks. It also verifies poker hand strength and ace-low straight ordering.

`node tests/render.cjs` renders the actual Canvas drawing functions through @napi-rs/canvas. Results are in `tests/renders/`. This verifies Canvas art paths, not browser DOM layout or phone touch behavior. Actual browser and device playtesting is outstanding. Sprite animation is intentionally limited to a small set of poses; the opening uses a continuous panorama for each character, and island mission routes have individual authored layouts. Story travel between chapters uses dialogue scenes. This remains a playable prototype, not a complete commercial game.

## Art assets

Built-in image-generation tool used; assets are integrated into the project rather than used only as concept screenshots.

- `dist/assets/characters.png`: transparent 4×3 atlas, Nova with **red** ponytail, Sylvanas, guards and skeleton pirates. Prompt: Production sprite sheet for a detailed 16-bit side-scrolling action game. EXACT 4 columns x 3 rows aligned regular grid of twelve full-body characters. Transparent background. All sprites strict side view facing right, all contained inside equal cells with empty margins. Row one same adult NOVA REDHEAD long copper red ponytail charcoal tactical armor cyan trim rifle: idle, walking left leg forward, walking right leg forward, crouching. Row two same adult SYLVANAS pale bluegray elf long blonde hair purple cloak hood armor bow: idle, walking left leg forward, walking right leg forward, crouching. Row three: black sci-fi rifle guard idle, same guard walking, skeleton pirate cutlass idle, same skeleton walking. Elaborate actual pixel sprites with clear hair faces articulated bodies and natural anatomical proportions. Polished Sega Genesis cinematic action art. Exact evenly aligned 4x3 grid to programmatically crop each frame. Characters ONLY on genuine transparent background. No text.
- `dist/assets/environments.png`: 2×2 atlas. Prompt: Game environment atlas EXACT 2 columns x 2 rows, four equal full rectangular panels no gutters. Rich detailed 16-bit pixel art Sega Genesis cinematic side-scroller strict side-view layered backgrounds. TOP LEFT: sci-fi infiltration facility dark blue steel pipes cyan machinery terminals and distant catwalks. TOP RIGHT: haunted elven forest ruined stone arches moonlight violet magic. BOTTOM LEFT: pirate tavern interior warm lanterns rafters timber floor bottles shelves. BOTTOM RIGHT: tropical pirate harbor sunset timber tavern palm trees tall ships distant volcano water reflections. Character-free and UI-free environmental game art, no text. Floor area bottom 20% kept calm to overlay actual gameplay sprites and platforms. Crisp pixel clusters limited color ramps beautiful texture atmosphere. Exactly 2x2 evenly aligned backgrounds.
- `dist/assets/extras.png`: unarmed brawl and resident atlas. Prompt: Production 16-bit game sprite atlas EXACT 4 columns by 3 rows equal regular cells, full-body right-facing sprites aligned baselines. Transparent background. First row same redheaded adult female commando Nova long red ponytail charcoal tactical armor cyan trim, EMPTY hands for bar brawl: idle fists ready, walking, punching right arm extended, kicking right leg extended. Second row same blonde pale bluegray elf Sylvanas purple cloak dark armor pointed ears EMPTY hands: idle fists ready, walking, punching arm extended, kicking. Third row four individual rescued residents: friendly short green goblin Gary carrying tankard; adult female farmer market merchant in rustic green dress and boots carrying basket; another adult female market merchant in brown work clothes carrying basket; small skeletal undead dragon Mr Fluffy with ribs wings long neck glowing eyes, friendly dragon not cat. Detailed pixel art anatomical articulated human characters expert hand-pixelled Sega Genesis cinematic adventure quality. All entirely contained inside exact evenly spaced 4x3 cells with clear space around all edges for automatic cropping. No text. Character sprites only.
- `dist/assets/nova.png` and `sylvanas.png`: crops of first atlas frames for character selection.

Inactive code from the first geometric prototype is excluded from this repository.

## Expanded mission update

The introduction is 6,600 world units (previously 2,450), with distinct docking, maintenance, security, cooling, archive and hangar rooms. Sylvanas has a separate six-room forest/shrine layout. Objectives unlock successive gates; cooling hazards can be avoided on catwalks and deactivated at their control. Checkpoints restore cleared objectives on death. Island missions now span 4,600–5,300 units with distinct routes and upper-floor rescues.

The bar is a 2,200-unit arena with a balcony, three waves, flankers, bottle throwers and a slower bruiser. Body contact causes no damage. Each brawler winds up, strikes, recovers and retreats. At most two initiate melee attacks at once. The player can move or climb out of reach during the visible windup.

Dedicated 4×3 animation sheets provide four walking frames, firing frames and four back-view climbing poses for each lady. The companion animates according to its own velocity. The 4×2 brawler sheet includes windup, strike, recovery and stagger poses.

New assets generated using the built-in image-generation tool: `dist/assets/nova-motion.png`, `syl-motion.png`, `brawl-motion.png`, `rooms.png`, `forest-rooms.png` and `ship-tour.png`. Their lossless WebP versions are loaded by the game. Nova/Sylvanas motion prompts specified exactly three rows: four distinct right-facing walking phases, four firing/draw-release phases, and four alternating back-view ladder poses. Brawler prompt specified idle, two walk poses, windup, two punch poses, recovery and stagger. Room prompts specified six distinct sci-fi rooms and six distinct fantasy rooms in 3×2 atlases. Ship-tour prompt specified two stacked story pictures: Nova showing Sylvanas her starship bridge, then the two deciding to get a drink at the spaceport.

Additional verification checks contact safety, harmless windup, evasion, strike-only damage, animation row dispatch and checkpoint restoration. Canvas scene rendering remains separate from browser/device playtesting.

## Movement and presentation fixes

Crouch is a stance toggle: S/C on keyboard or the down control away from ladders. Down near a ladder remains descent, and beginning a climb or jump stands the player. Dialogue occupies a reserved strip outside the Canvas world rather than covering the character. Nova's ready, walk and crouch poses keep her rifle shouldered; firing adds only a small recoil/muzzle flash rather than swapping to a different upper-body stance. Both ladies now use airborne poses. Guards use a horizontal dead zone and a turn delay, and patrol rather than chasing horizontally when the target is on an inaccessible floor.

Intro backgrounds now use a single continuous panorama per character. Camera progress moves over that image without tile wraps or room-panel joins. Other scenes likewise sample one background image without wrapping. Art loads in parallel with a count indicator; unused room atlases are no longer downloaded during startup.

New built-in image-generation assets (PNG sources and lossless WebP runtime versions): `dist/assets/nova-ready`, `syl-jump`, `facility-panorama`, `forest-panorama`. Nova's prompt specified a 4×3 atlas of shouldered-rifle ready/walk, jump, and crouch poses with consistent upper-body alignment. Sylvanas's prompt specified four side-facing takeoff/rising/apex/falling poses. Panorama prompts specified single unbroken 3:1 sci-fi/fantasy scenes with connected architecture/foliage and no panel boundaries.

Regression tests additionally verify toggled crouch after release, ladder precedence, stable facing for an unreachable target, continuous scrolling across the old seam, and identical Nova ready/firing sprite selection. Browser and device verification is still outstanding.

## Vertical routes, tavern board and audio polish

The opening now has a multi-stage tower ascent above the main floor, a sunken reactor/shrine chamber 238 units below it, and an archive/library ascent. The camera tracks these upper and lower floors. Nova uses steel platforms and cover; Sylvanas uses mossy stone, rune barriers, a moon-seal pedestal, obelisks and a grimoire altar. Objective prompts are in the bottom HUD rather than floating over characters and scenery. Sylvanas summons a spectral fighter for eight seconds and releases a five-arrow volley; Nova retains her five-second cloak.

Sprite source bounds are measured from connected alpha silhouettes within each column, preserving complete poses that cross nominal row boundaries while excluding stray neighboring feet. Every pose draws from its feet at a common scale based on a standing pose. The new unarmed sheets have four walking phases and four punch phases per character. The tavern board has selectable voyage details and a Set Sail action, plus separate upgrade and resident tabs. Ship-tour pictures use preloaded image elements.

Three original synthesized music loops (facility stealth, haunted woodland, tavern) and eight short effects are bundled as WAV files. Playback unlocks on a pointer or keyboard gesture and respects the sound switch. No network audio service is required. `scripts/prepare-polish.py` reproduces bounds, lossless WebP conversion and audio from the committed PNG sources. Music and effects routing, mute/resume, distinct powers, summon expiry, vertical camera tracking, tavern selection and four-frame unarmed dispatch are covered by the regression checks. Actual speaker playback and mobile/browser DOM testing remain unverified in this environment.

New image-generation source assets: `nova-unarmed.png`, `syl-unarmed.png`, `fantasy.png`. Unarmed prompts specify a transparent exact 4-column × 2-row side-facing atlas: idle and three distinct walk phases on row one, windup/half-extension/full-extension/recovery punch on row two. Nova is a redheaded commando in charcoal/cyan armor; Sylvanas is a blonde pale blue-gray elf in purple armor and cloak. Hands are empty. The fantasy prompt specifies four separate transparent props in one row: a moon-seal pedestal, rune obelisk, book altar and spectral skeleton fighter, mossy stone and purple magic.

## Ladder and floor recovery fix

Ladder endpoints are ordered from top to bottom and each bottom has an actual landing. Reaching either end snaps feet to that landing before gravity resumes, preventing descent from starting below the collision plane. Floor textures clip to the solid's rectangle instead of spilling across the lower chamber; its edges have visible descent chevrons and shaft walls. Solid terrain sides prevent walking beneath the return floor. Falling beyond the deepest floor plus one screen triggers the death/retry panel regardless of cloak or invulnerability. Checkpoint retries place the character on the local floor, including the sunken chamber. The pause menu also offers Restart checkpoint.

Regression checks descend every opening ladder for both characters, walk off into the intended chamber and land, check the return-floor side, force an out-of-bounds fall, and exercise its actual Retry checkpoint handler. All pass. Canvas renders were checked; browser/device playtesting remains outstanding.

## Physical tavern, beach and expeditions

The home port now starts as a playable tavern. Walk left to the beach, press E near the cyan computer to select a destination, and walk through the right-hand door to start it. Selecting a mission never teleports the player directly into it. Mission completion and Continue return to the physical tavern. Saves retain the selected destination.

Gary runs the repair bench; the green merchant provides +1 maximum health for the next voyage, and the salvage merchant supplies a 20% weapon-damage boost for the next voyage. Those preparations cost five doubloons each and are consumed at departure. Every resident uses a four-frame working cycle. Mr. Fluffy occupies the upper roost, reached by ladder, and restores energy on interaction. Repairs add lanterns, bar furniture and a crew berth to the scene.

The left beach cycles through 24 curated two-choice incidents with Chat/EMI, a Space Marine, the HOA and the crowbar. Other text callbacks include Pickles, Admiral Bunny’s decorative warrants, the RAID coffee maker/Viking funeral, Ami’s forest hat and the Dollar Tree wrath incident. The previous eight encounters are excluded from the random selection pool. Each live incident awards two doubloons once, and re-entry or 35 seconds on the beach changes the visitor. This is an initial 24-encounter collection, not hundreds of implemented events.

Four island voyages now have distinct authored terrain and connected multi-stage routes. The docks have a crane/customs-roof route and a winch that lowers a gangway. Gary’s mission climbs a root tower, crosses a lower hollow and reaches his lookout cage. The dragon mission descends into a crypt and requires two braziers. The ruins mission raises a bridge shortcut and climbs the salvage watchtower. Route tasks and rescues are required before returning; PDF scraps remain optional collectibles for the final unlock. Existing floor clipping, landing snaps and fall recovery remain in use.

New source/runtime artwork made with the built-in image-generation tool:
- `dist/assets/residents.png` / `.webp`: transparent 4×3 atlas. Prompt: four consecutive Gary hammer-working poses; four green merchant basket/bread preparation poses; four brown merchant salvage-inspection poses; all full-body, side-facing, same characters, aligned feet, distinct limb movement, detailed 16-bit pixel art and transparent margins.
- `dist/assets/beach-guests.png` / `.webp`: transparent 4×1 atlas. Prompt: panicking cyan Chat robot with clipboard and antenna sparks; oversized blue Space Marine holding tankard; pink-shirt HOA lady with clipboard and ruler; upright rusty crowbar with skull and rum bottle. Four equal separate cells, detailed 16-bit pixel art.
- `dist/assets/home.png` / `.webp`: two equal wide panels stacked. Prompt: tropical pirate beach at sunset with tavern exterior to the right; pirate tavern interior with left beach doorway, repair bench, bar, provision stall, cyan mission computer, upper loft and right departure doorway. Detailed cinematic Sega Genesis art, character-free and HUD-free.

Validation exercises the actual mission-computer buttons, mission selection without departure, walk-through door departure, Gary repair accounting, one-use merchant preparations, beach re-entry and reward limits, four distinct frames for every working resident, every ladder descent in all four new expeditions, mechanical shortcut activation, rescue objectives, and mission-to-home return. All pass, along with the prior story/floor tests. Native Canvas scene renders were inspected. Browser/device interaction and audio playback remain unverified.

## Character, ship and foreground refinement

Nova and Sylvanas draw at 132% of their previous visual size, with their feet still anchored to the existing landing positions. Enemies draw at 115%; collision sizes remain unchanged. Companion movement now uses its own horizontal movement, gravity, recorded ladder routes and landing snaps rather than copying the player’s height or climb flag. Its ladder animation runs from its own movement state. A catch-up effect remains for extreme separation or falls.

Ship theft has an actual foreground schooner, dock drinks, a gangway ladder, bow/stern bollards and visible mooring lines, main deck and quarterdeck helm. The HUD gives the next stage and counts. The helm remains locked until the drinks and moorings are complete, then a three-second getting-underway sequence leads into the morning-after scene. The ship/body deck was positioned against its drawn surface, with collision top at the same elevation.

The beach and tavern use one continuous panorama with a porch/doorway and shared floor, replacing the abrupt two-panel join. Foreground surfaces now sample a themed terrain atlas (timber pier, mossy stone bridge, steel catwalk). The harbor winch is drawn on a stand, and the old oversized crane frames were removed. Nearby task prompts name the action. Sylvanas’s fighter uses four walking poses and four sword-attack poses with its own movement and attack timers.

Built-in image-generation source assets and prompt briefs:
- `dist/assets/home-continuous.png` and lossless WebP: one uninterrupted 3:1 beach-to-cutaway-tavern panorama, natural porch threshold, common walking elevation, repair bench, provisions, cyan computer, upper loft and right doorway, detailed cinematic pixel art.
- `dist/assets/terrain.png` and lossless WebP: transparent 3×2 atlas; timber platform, mossy stone bridge, steel catwalk; mounted harbor winch, rope bollard and pedestal helm. Strict side elevation, clear flat tops, matching detailed 16-bit art.
- `dist/assets/ship.png` and lossless WebP: transparent side-profile two-masted schooner, furled rigging, long horizontal main deck, right stern cabin, cannons and ornate wooden hull. Used in the playable foreground.
- `dist/assets/summon-motion.png` and lossless WebP: transparent 4×2 spectral skeleton sheet, four alternating walk phases and windup/swing/slash/recovery frames, purple aura, shield, curved sword and tarnished armor.

Added regressions check independent ladder movement and landing for either companion, full ship prerequisites/escape/island flow, and all eight summon animation poses. Prior story, hub, ladder, floor and expedition checks also pass. Native Canvas scenes were inspected; actual browser/device interaction remains unverified.
