#!/usr/bin/env python3
"""Generate lucidlux.fyi/info/<slug>/index.html for every Lucid Lux game.

Itch-style info pages: cover banner, Play button, screenshot gallery,
description, how to play, controls, details table, credits, more games.
Native system fonts only. Output goes to OUT (default ./out/info).
"""
import html, json, pathlib, sys

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'out/info')
SITE = 'https://lucidlux.fyi'
AUTHOR = 'Briar Greenway, ThinkWell Labs'

GAMES = [
 dict(slug='tapboom', name='TapBoom', tint='#FF5A4E', icon='../../tapboom-icon.png',
  icon_alt='TapBoom icon: a red piece inside a rainbow ring',
  tagline='Tap what the panel says. Pop everything.',
  play='../../tapboom/', play_label='Play TapBoom', shots=4, wide=False,
  summary='Pop the shapes and colours the panel allows. When the screen goes dark, the rule flips. Easy to start, hard to master, for every age.',
  details=[('Status','Released · version 1.4.1'),('Platforms','Browser on phone, tablet or computer · installs to your home screen · plays offline'),
   ('Genre','Reflex, attention, colour and shape'),('Players','1 · plus a shared Daily Challenge leaderboard'),
   ('Session','Rounds of under a minute; a two-minute lesson'),('Price','Free · no ads'),('Accounts','Optional sign-in keeps your level and badges'),
   ('Made with','HTML canvas and JavaScript'),('Author',AUTHOR)],
  body='''
<h2>About</h2>
<p class="lead">Large shapes in many colours fill the board. Tap one and it bursts into smaller copies of itself; keep tapping the fragments until they pop. The trick is that you may not tap just anything.</p>
<p>The hub in the middle of the board holds the whole rule: the shapes above the line, the colours below it, and the word for what to do with them.</p>
<ul>
<li><b>Light background:</b> you may tap <i>only</i> the shapes and colours in the hub.</li>
<li><b>Dark background:</b> you may tap <i>anything except</i> those.</li>
</ul>
<p>An object counts if <i>either</i> its shape <i>or</i> its colour is shown. Wrong taps cost points; glowing tokens are always safe. Rings inside a piece show how many more times it will break; the gaps in each ring show how many pieces it breaks into.</p>

<h2>Warning, and grace</h2>
<p>The set that is about to arrive appears outside the hub a few seconds early, the rim drains as the change approaches, and a large faint globe empties in the middle of the board for the last two seconds. For a moment after any change, a tap that would have been right just before it is forgiven: it reads <i>just missed</i> and costs nothing. The rules start calm and tighten as you climb.</p>
<p>The background colour is the play mode: zoom out, warm or cool only, greyscale, twinkle, glitch. Modes change how the board looks and moves. They never change what is legal to tap.</p>

<h2>Levels and gates</h2>
<p>Every level has a gate. The strip under the clock shows each shape and colour the level has unlocked and how many of each you still owe; only correct pops count. Open the gate and the next level brings exactly one new thing. Your place is saved, so Play picks up where you stopped.</p>
<ul>
<li><b>Chains:</b> every ten right taps in a row is celebrated, and the chain multiplies your points.</li>
<li><b>Rush pieces</b> (from level 6): a piece arrives inside a spinning rainbow ring. Tap it in time and, if it is allowed, it pops with every piece it would have broken into.</li>
<li><b>SLASH</b> (from level 16): tap a legal piece and, without lifting, drag a line to another legal piece. Everything the line crosses is cleared.</li>
<li><b>Ranks:</b> every level carries a mineral, from feldspar, the most common on Earth, to kyawthuite, of which one specimen exists. Each new rank comes with one true fact about its stone.</li>
</ul>

<h2>Daily Challenge</h2>
<p>One 60-second round on a board seeded from today's date, so everyone plays exactly the same thing. Your first Daily Challenge each day is always free; the leaderboard is never pay-to-enter.</p>

<h2>Controls</h2>
<p><b>Phone or tablet:</b> tap. For SLASH, press and drag. <b>Computer:</b> click with the mouse.</p>

<h2>Made for every age</h2>
<p>The first run is designed for people who are new to touchscreens. The two-minute lesson has no clock and no score, and it stays on the front page for whenever you want it again. Settings include sound, haptics, colourblind assist, a left-handed layout, reduced motion, flat shapes (no 3D) and the countdown globe.</p>
'''),

 dict(slug='resonant', name='Resonant', tint='#2BB8C9', icon='../../resonant-icon.png',
  icon_alt='Resonant icon: a lit tetrahedron with a bright core on one face',
  tagline='The geometry of survival.',
  play='../../resonant/', play_label='Play Resonant', shots=2, wide=False,
  summary='Route sparks away from a living core with reflectors, dampers, gates and prisms, then play the same rules across folded solids.',
  details=[('Status','Released'),('Platforms','Browser on phone, tablet or computer · installs to your home screen'),
   ('Genre','Physics puzzle, geometry'),('Players','1'),('Length','Nine rounds'),('Price','Free · no ads'),
   ('Accounts','Optional sign-in'),('Orientation','Best in portrait'),('Made with','HTML canvas and JavaScript'),('Author',AUTHOR)],
  body='''
<h2>About</h2>
<p class="lead">Sparks carry energy. The core loses what hits it. Turn them away.</p>
<p>Resonant is a geometry game. You place polygon pieces on the board with a fixed budget, give each one a role, and start the wave. Then you watch what you built do its work, or fail to. In round IV the board folds into a tetrahedron, and the same rules run across its faces; later rounds fold it into a cube, an octahedron and a dodecahedron.</p>

<h2>Nine rounds, one idea each</h2>
<ol>
<li>Redirection</li><li>Energy</li><li>Selective routing</li><li>The fold</li><li>Field</li><li>Dispersion</li><li>The cube</li><li>The dual</li><li>Twelve</li>
</ol>
<p>Each round's objectives are live checks shown at the top of the screen, such as keeping the core above a set integrity and resolving every spark.</p>

<h2>How to play</h2>
<h3>Pieces</h3>
<p>Triangle (20), square (30) and pentagon (40): the number is what each costs from your budget. Five sides is the limit, and the game tells you why.</p>
<h3>Roles</h3>
<ul>
<li><b>Reflect</b> turns a spark away, keeping most of its energy.</li>
<li><b>Damp</b> absorbs most of a spark's energy and pays part of it back into your budget.</li>
<li><b>Gate</b> sorts what passes by a property of the spark.</li>
<li><b>Prism</b> bends a spark by an amount that depends on its energy.</li>
</ul>
<h3>Tools</h3>
<p><b>Rotate</b> and <b>Remove</b> adjust what you placed. <b>Paths</b> previews where sparks will go. <b>Wave</b> starts the round; <b>Pause</b> and <b>Reset</b> do what they say. When something you built causes an effect worth naming, a card appears under <b>What happened</b>; each fires once.</p>

<h2>The model, stated</h2>
<p class="fine">Deterministic simulation, fixed step. Reflection keeps 92% of a spark's energy, a wall 60%, the medium takes 12% a second, a damper keeps 45% and pays 12% of the rest into your budget; below 18 a spark dissipates. Speed is √energy; a prism deviates by 0.6·√(60/energy) radians per face; a field adds a constant acceleration to sparks only. Model, not nature: the numbers are tuned for play and stated so you can reason with them.</p>
'''),

 dict(slug='batduko', name='Batduko', tint='#8B5CF6', icon='../../batduko-icon.svg',
  icon_alt='Batduko icon: a bat over a six-by-six puzzle grid',
  tagline='Sudoku is asleep. The cave is awake.',
  play='../../batduko/', play_label='Play Batduko', shots=2, wide=False,
  summary='Fill a 6×6 grid with bat species and colony sizes. Three caves, from warm-up to champion.',
  details=[('Status','Released'),('Platforms','Browser on phone, tablet or computer'),('Genre','Logic puzzle'),
   ('Players','1'),('Difficulty','Three caves: Roost, Twilight, Midnight'),('Price','Free · no ads'),
   ('Accounts','Optional sign-in'),('Input','Touch and mouse'),('Author',AUTHOR)],
  body='''
<h2>About</h2>
<p class="lead">A sudoku cousin with two layers in every cell. Fill the 6×6 grid so every cell holds a bat species and a colony size from 1 to 6.</p>

<h2>How the cave works</h2>
<ul>
<li>Each row, column and cave uses all six species and all six sizes once.</li>
<li><b>Sonar clash:</b> the same colony size can't touch edge to edge.</li>
<li><b>Wing clip:</b> the same species can't touch diagonally.</li>
</ul>

<h2>Three caves</h2>
<ul>
<li><b>Roost</b> · warm-up · 22 clues shown</li>
<li><b>Twilight</b> · standard · 16 clues shown</li>
<li><b>Midnight</b> · champion · 11 clues shown</li>
</ul>
<p>The clock, score and combo run at the top; your best flight is kept on the cave screen.</p>

<h2>Controls</h2>
<p>Tap a cell, pick a bat, pick a size; scroll the dials to spin through them. <b>Undo</b>, <b>Redo</b> and <b>Clear space</b> sit under the grid; <b>Reveal a bat</b> gives a hint when you are stuck, and <b>New cave</b> deals a fresh puzzle.</p>
'''),

 dict(slug='vortex-wisdom', name='Vortex Wisdom', tint='#E0479E', icon='../../vortex-wisdom/icon-512.png',
  icon_alt='Vortex Wisdom icon: a magenta and teal vortex tunnel with warm lights leading into it',
  tagline='An endless rhythm drift through a living, breathing tunnel of light.',
  play='../../vortex-wisdom/', play_label='Play Vortex Wisdom', shots=5, wide=False, cover='../../vortex-wisdom/cover.jpg',
  og_image=SITE + '/vortex-wisdom/share.jpg',
  summary='Tap with the pulse to keep moving and tilt gently to drift through a living vortex.',
  details=[('Status','Released'),('Platforms','Browser on phone, tablet or computer · installs to your home screen'),
   ('Genre','Rhythm, endless runner'),('Players','1'),('Input','Touch and tilt · keyboard · controller'),
   ('Orientation','Portrait, sound on'),('Price','Free · no ads'),('Accounts','Optional sign-in'),('Made with','Three.js'),('Author',AUTHOR)],
  body='''
<h2>About</h2>
<p class="lead">Vortex Wisdom is an endless rhythm drift through a living, breathing tunnel of light.</p>
<p><b>Keep the pulse.</b> Tap with each beat of the music to keep moving. On-beat taps carry you forward; a missed beat slows you, never pushes you back.</p>
<p><b>Drift.</b> Tilt your phone gently, or press E and I (or the arrow keys), to slide around the tunnel.</p>
<p><b>Free the people held in rings.</b> Some people are trapped inside rings of blocks, each with one gap. Keep the beat as they come: every third tap drops the block in your lane. Line it up with the gap and the ring dissolves. Clear every ring and they are free, and their light travels with you.</p>
<p><b>Boost of insight.</b> Keep the beat 24 times in a row and the vortex surges forward. Shapes pass through you while it lasts.</p>
<p><b>Gather wisdom.</b> Warm gems grow while you stay in their lane and keep the beat. They charge Phase, which lets you pass through any shape for three seconds.</p>
<p><b>Dream gates.</b> Stay with the beat, untouched, for sixteen bars and a gate opens to an open sky, where you place lights into a constellation.</p>
<p>The shapes stand for everyday pressures: a Debt Prism that pulls you in, an Isolation Grid with only a few open cells, Anxiety Shards that lurch on the beat, a Burnout Cube that burns and then rests. This is a game, not a treatment; it only asks you to keep moving with the music.</p>

<h2>Controls</h2>
<p><b>Phone:</b> tap anywhere with the pulse; tilt to drift (or drag, in Settings); touch the ring at the bottom right for Phase.</p>
<p><b>Keyboard:</b> <kbd>Space</kbd>, or <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> <kbd>;</kbd>, with the pulse; <kbd>E</kbd> drifts left and <kbd>I</kbd> drifts right (the arrows work too); <kbd>Q</kbd> or <kbd>Shift</kbd> for Phase; <kbd>Esc</kbd> or <kbd>P</kbd> to pause.</p>
<p><b>Controller:</b> A or B with the pulse; left stick to drift; X or right bumper for Phase; Start to pause.</p>
<p>Best with sound on, held upright in portrait. Reduced motion (half speed, no camera roll, steady glows) and reduced flashing are in Settings. “Tune” in Settings measures your timing offset, which helps with Bluetooth headphones.</p>

<h2>Credits</h2>
<p>Made by Briar Greenway, ThinkWell Labs. Music: the opening theme by Briar Greenway; the score that follows is generated live on the beat. Built with Three.js.</p>
'''),

 dict(slug='sches', name='Sches', tint='#6D5BFF', icon='../../sches-icon.png',
  icon_alt='Sches icon: a wireframe torus with two pieces on it',
  tagline='Plot in secret. Reveal at once.',
  play='https://toroid.fyi/play/', play_label='Play Sches', external=True, shots=2, wide=True,
  summary='Abstract strategy on a torus: the board has no edges, so every line wraps round and meets itself.',
  extra_links=[('Sches on itch.io','https://axisoffun.itch.io/sches')],
  details=[('Status','Released'),('Plays at','toroid.fyi/play'),('Platforms','Browser on a computer'),
   ('Genre','Abstract strategy'),('Players','Up to six on one computer · solo against the computer · online play coming'),
   ('Price','Free'),('Age','13 and older; terms shown before play'),('Made with','Three.js and WebGL'),
   ('Author','Briar M. Greenway, ThinkWell Labs · coded by Claude')],
  body='''
<h2>About</h2>
<p class="lead">Sches starts where chess does: two armies, a grid of squares, pieces that capture by reaching each other. Then it takes that apart and rebuilds it into something with no edges and no turns.</p>
<p>The board is a torus, a 32 by 12 grid that wraps around both ways, so there are no edges and no corners and flanking is constant. Each seat owns a coloured wedge of territory. Every player plots a move in secret; then all moves are revealed and resolved at once: collisions, captures, paths that overrun each other. Set the enemy Sun to win.</p>

<h2>How it plays</h2>
<ul>
<li><b>The piece is its own rulebook.</b> Each piece's shape describes how it moves. Your own pieces are transparent to you, so sliders pass through friendlies; enemies still block.</li>
<li><b>Sealed plots.</b> Everyone commits in private, then the round resolves in one reveal.</li>
<li><b>Same-type clashes</b> are settled by a quick duel of Connect-Four: the winner keeps the cell, the loser falls.</li>
<li><b>The Veil.</b> A small hidden torus sits inside the board. Only the Sun and the Moon can rise to it.</li>
<li><b>Events escalate.</b> Barriers solidify and dissolve, Sun flares and Moon beams fire on a schedule, and the endgame brings setting Suns and novas.</li>
</ul>

<h2>The pieces</h2>
<ul>
<li><b>Sun</b> · omnidirectional, one, two or three cells</li>
<li><b>Moon</b> · slides eight directions, one lap at most</li>
<li><b>Possibility</b> · stealth; teleports to any empty cell</li>
<li><b>Day</b> · one orthogonal cell</li>
<li><b>Night</b> · one diagonal cell</li>
<li><b>Duality</b> · a knight's move</li>
<li><b>Wizard</b> · slides the four diagonals, one lap at most</li>
<li><b>Logic</b> · slides four cells orthogonally, multi-capture</li>
<li><b>Ursa Minor</b> · slides two cells diagonally, multi-capture</li>
<li><b>Religion</b> · a five-cell L, multi-capture</li>
<li><b>Arc</b> · a curving hook, multi-capture</li>
<li><b>Tree</b> · three diagonal then a turn, multi-capture</li>
</ul>

<h2>Ways to play</h2>
<p>Up to six players share one computer, each plotting in private. Play <b>Solo</b> against the computer, or open the <b>Sandbox</b> to study the board with nothing hidden. Online play is coming but is not working yet. New to it? Open the <b>Story</b> in the game: it teaches Sches starting from chess.</p>
<p class="fine">Sches is hosted at toroid.fyi. You agree to its terms on first play there.</p>
'''),

 dict(slug='huemain', name='HueMain', tint='#C9A227', icon='../../huemain-icon.png',
  icon_alt='HueMain icon: a ring of every hue around a white centre',
  tagline='A colour game from the same house.',
  play=None, shots=0, wide=False, soon=True,
  summary='A colour game from Lucid Lux. Coming soon.',
  details=[('Status','In development'),('Genre','Colour'),('Price','Free'),('Author',AUTHOR)],
  body='''
<h2>About</h2>
<p class="lead">HueMain is a colour game from Lucid Lux. It is not playable yet.</p>
<p>Sign in on any Lucid Lux page and your account will carry over to HueMain when it opens. Until then, the other games are below.</p>
'''),
]

ORDER = [g['slug'] for g in GAMES]
E = html.escape

def more_games(cur):
    out = []
    for g in GAMES:
        if g['slug'] == cur['slug']:
            continue
        label = 'Coming soon' if g.get('soon') else 'About'
        out.append(f'<a href="../{g["slug"]}/"><img src="{g["icon"]}" alt="" loading="lazy"><span>{E(g["name"])}</span><small>{label}</small></a>')
    return '\n'.join(out)

def page(g):
    slug, name = g['slug'], g['name']
    shots = [f'../img/{slug}-{i}.jpg' for i in range(1, g['shots'] + 1)]
    og_img = g.get('og_image') or (SITE + f'/info/img/{slug}-1.jpg' if shots else SITE + '/' + g['icon'].replace('../../', ''))
    hero_bg = g.get('cover') or (shots[0] if shots else g['icon'])
    hero_cls = 'hero cover' if g.get('cover') else 'hero'
    ext = ' rel="noopener"' if g.get('external') else ''
    if g.get('soon'):
        actions = '<span class="pill">Coming soon</span>'
        side_play = ''
    else:
        actions = f'<a class="play" href="{g["play"]}"{ext}>{E(g["play_label"])}</a>'
        for lab, url in g.get('extra_links', []):
            actions += f' <a class="ghost" href="{url}" rel="noopener">{E(lab)}</a>'
        side_play = f'<a class="play" href="{g["play"]}"{ext}>{E(g["play_label"])}</a>'
    gallery = ''
    if shots:
        btns = '\n'.join(
            f'<button type="button" data-full="{s}" aria-label="Enlarge screenshot {i} of {len(shots)}"><img src="{s}" alt="{E(name)} screenshot {i}" loading="lazy"></button>'
            for i, s in enumerate(shots, 1))
        gallery = f'<div class="wrap"><div class="gallery{" wide" if g["wide"] else ""}" aria-label="Screenshots">\n{btns}\n</div></div>'
    rows = '\n'.join(f'<tr><th scope="row">{E(k)}</th><td>{E(v)}</td></tr>' for k, v in g['details'])
    install = '' if g.get('soon') or g.get('external') else '<p class="note">On iPhone: Share → Add to Home Screen. On Android: menu → Install app.</p>'
    ld = {"@context": "https://schema.org", "@type": "VideoGame", "name": name, "url": f"{SITE}/info/{slug}/",
          "description": g['summary'], "author": {"@type": "Person", "name": "Briar Greenway"},
          "publisher": {"@type": "Organization", "name": "Lucid Lux"}, "gamePlatform": "Web browser",
          "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}}
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(name)} · Lucid Lux</title>
<meta name="description" content="{E(g['summary'])}">
<meta name="theme-color" content="#0E0D12">
<link rel="canonical" href="{SITE}/info/{slug}/">
<link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lucid Lux">
<meta property="og:title" content="{E(name)}">
<meta property="og:description" content="{E(g['summary'])}">
<meta property="og:url" content="{SITE}/info/{slug}/">
<meta property="og:image" content="{og_img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../info.css">
<style>:root {{ --tint: {g['tint']}; }}</style>
<script type="application/ld+json">{json.dumps(ld)}</script>
</head>
<body>
<header class="bar"><div class="wrap"><a class="home" href="../../">Lucid Lux</a><span class="crumb">/ {E(name)}</span></div></header>

<section class="{hero_cls}">
  <div class="hero-bg" style="background-image:url('{hero_bg}')"></div>
  <div class="wrap hero-in">
    <img class="icon" src="{g['icon']}" alt="{E(g['icon_alt'])}">
    <div>
      <h1>{E(name)}</h1>
      <p class="tagline">{E(g['tagline'])}</p>
      <div class="actions">{actions}</div>
    </div>
  </div>
</section>

{gallery}

<main class="wrap cols">
  <article class="desc">
{g['body'].strip()}
  </article>
  <aside class="side">
    <div class="card">
      {side_play}
      {install}
    </div>
    <div class="card">
      <h2>Details</h2>
      <table class="info">
{rows}
      </table>
    </div>
  </aside>
</main>

<section class="wrap more">
  <h2>More from Lucid Lux</h2>
  <div class="more-grid">
{more_games(g)}
  </div>
</section>

<footer><div class="wrap"><a href="../../">All games</a> · <a href="../../key/">Key</a> · <a href="../../privacy.html">Privacy</a></div></footer>

<dialog class="lb" id="lb"><button type="button" aria-label="Close">✕</button><img alt=""></dialog>
<script>
(function () {{
  var lb = document.getElementById('lb'); if (!lb || !lb.showModal) return;
  var im = lb.querySelector('img');
  document.querySelectorAll('.gallery button').forEach(function (b) {{
    b.addEventListener('click', function () {{ im.src = b.dataset.full; im.alt = b.querySelector('img').alt; lb.showModal(); }});
  }});
  lb.addEventListener('click', function () {{ lb.close(); }});
}})();
</script>
<script src="../../account/lucidlux-account.js"></script>
<script>LucidLuxAccount.attach({{ game: null, button: {{ dark: true, position: 'top-right' }} }});</script>
</body>
</html>
'''

def index_page():
    cards = '\n'.join(f'<a href="{g["slug"]}/"><img src="{g["icon"].replace("../../", "../")}" alt=""><span>{E(g["name"])}</span><small>{"Coming soon" if g.get("soon") else "About"}</small></a>' for g in GAMES)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>About the games · Lucid Lux</title>
<meta name="description" content="About every Lucid Lux game: how to play, controls, screenshots and details.">
<meta name="theme-color" content="#0E0D12">
<link rel="icon" type="image/png" sizes="32x32" href="../favicon-32.png">
<link rel="stylesheet" href="info.css">
</head>
<body>
<header class="bar"><div class="wrap"><a class="home" href="../">Lucid Lux</a><span class="crumb">/ About the games</span></div></header>
<main class="wrap more" style="padding-top:24px"><h2>About the games</h2><div class="more-grid">
{cards}
</div></main>
<footer><div class="wrap"><a href="../">All games</a> · <a href="../key/">Key</a> · <a href="../privacy.html">Privacy</a></div></footer>
<script src="../account/lucidlux-account.js"></script>
<script>LucidLuxAccount.attach({{ game: null, button: {{ dark: true, position: 'top-right' }} }});</script>
</body>
</html>
'''

OUT.mkdir(parents=True, exist_ok=True)
for g in GAMES:
    d = OUT / g['slug']; d.mkdir(parents=True, exist_ok=True)
    (d / 'index.html').write_text(page(g))
(OUT / 'index.html').write_text(index_page())
print('built', len(GAMES), 'info pages into', OUT)
