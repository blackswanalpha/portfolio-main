"""Isometric dev-office diorama -> public/rive/office.riv (one 12 s loop, state machine "office").

Regenerate from portfolio-main: python3 scripts/rive-office/scene.py public/rive/office.riv
The hero poster (public/images/home/office-hero.webp) is a 1200x1500 transparent render of frame 0.
After changing the scene, replace it with a fresh frame-0 screenshot of the Rive canvas so the
poster-to-animation handoff stays seamless. The .riv is generated, so it cannot be opened in the
Rive editor; edit this script instead.
"""
import math, random, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from riv import Artboard, write_file
from iso import (Iso, C, col, mix, lighten, darken, fill, stroke, lin, rad, poly, polys, rect,
                 rects, ell, hull)

random.seed(7)
W, H = 1200, 1500
S = 58.0
ISO = Iso(575, 706, S)
P = ISO.P
T = 720          # master loop, frames @60fps
RW, RD, RH, WT, ST = 10.0, 9.0, 7.0, 0.35, 0.75

ab = Artboard('Office', W, H)
EASE = ab.interpolator(0.45, 0.0, 0.55, 1.0)
OUT = ab.interpolator(0.2, 0.0, 0.2, 1.0)
anim = ab.anim('loop', 60, T, loop=1)
ab.state_machine('office')


def track(node, prop, kfs, kind='d'):
    ab.track(anim, node, prop, kfs, kind)


def sampled(fn, step=10, total=T):
    fr = list(range(0, total, step)) + [total]
    return [(f, fn(f)) for f in fr]


def osc(node, prop, center, amp, period, phase=0.0, step=None):
    step = step or max(4, period // 16)
    track(node, prop, sampled(lambda f: center + amp * math.sin(2 * math.pi * (f / period + phase)), step))


# ------------------------------------------------------------------ helpers

def box(parent, x0, x1, y0, y1, z0, z1, base, top=None, left=None, right=None, edge=0.28,
        name=None, radius=None):
    """Iso box. left = +y face, right = +x face."""
    top = top or lighten(base, 0.14)
    left = left or base
    right = right or darken(base, 0.2)
    g = parent.add('Node', name=name)
    sil = ISO.Ps([(x0, y1, z0), (x1, y1, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1), (x0, y1, z1)])
    poly(g, sil, col(right), radii=radius)
    poly(g, ISO.Ps([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)]), _c(left))
    poly(g, ISO.Ps([(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)]), _c(right))
    poly(g, ISO.Ps([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]), _c(top))
    if edge:
        poly(g, ISO.Ps([(x0, y1, z1), (x1, y1, z1), (x1, y0, z1)]), None,
             (col('#ffffff', edge), 1.3), closed=False)
    return g


def _c(v):
    return col(v) if isinstance(v, str) else v


def cyl(parent, cx, cy, z0, z1, r, base, top=None, n=36, name=None, edge=0.3):
    g = parent.add('Node', name=name)
    a0, a1 = -math.pi / 4, 3 * math.pi / 4
    front = [a0 + (a1 - a0) * i / n for i in range(n + 1)]
    back = [a1 + math.pi * i / n for i in range(n + 1)]
    body = [P(cx + r * math.cos(a), cy + r * math.sin(a), z0) for a in front]
    body += [P(cx + r * math.cos(a), cy + r * math.sin(a), z1) for a in back]
    lx, rx = P(cx - r * C / C * math.cos(math.pi / 4) * 1.0, cy, z0)[0], None
    xl = P(cx + r * math.cos(a1), cy + r * math.sin(a1), z0)
    xr = P(cx + r * math.cos(a0), cy + r * math.sin(a0), z0)
    poly(g, body, lin(xl, xr, [(0, col(lighten(base, 0.12))), (0.45, col(base)),
                               (1, col(darken(base, 0.28)))]))
    ring = [P(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n), z1)
            for i in range(n)]
    poly(g, ring, col(top or lighten(base, 0.18)))
    if edge:
        fr = [P(cx + r * math.cos(a), cy + r * math.sin(a), z1) for a in front]
        poly(g, fr, None, (col('#ffffff', edge), 1.2), closed=False)
    return g


def circle_pts(cx, cy, z, r, n=36, kind='xy'):
    out = []
    for i in range(n):
        a = 2 * math.pi * i / n
        if kind == 'xy':
            out.append(P(cx + r * math.cos(a), cy + r * math.sin(a), z))
    return out


def floor_shadow(parent, cx, cy, rx, ry, a=0.32, z=0.0):
    pl = ISO.plane(parent, 'xy', (cx, cy, z))
    n = pl.add('Node', scaleY=ry / rx)
    ell(n, 0, 0, rx * 2, rx * 2, rad((0, 0), rx, [(0, col('#0b1424', a)), (0.55, col('#0b1424', a * 0.55)),
                                                    (1, col('#0b1424', 0))]))
    return pl


# ------------------------------------------------------------------ palette
OAK = ['#d6a676', '#cf9e6c', '#dcae7f', '#c99764', '#d3a271']
WALNUT = '#9c6842'
PLASTER = '#e7e1d8'
CAP = '#f1ede6'
BRICKS = ['#b65f40', '#a9563a', '#c06c4a', '#9e4f36']
MORTAR = '#d7c6b3'
NAVY = '#0c2140'

# ================================================================== backdrop (transparent; the page shows through)
bokeh = []
ZOOM = ab.add('Node', name='Zoom', x=600, y=780, scaleX=1.1, scaleY=1.1)
ZI = ZOOM.add('Node', x=-600, y=-780)
gs = ZI.add('Node', name='GroundShadow', x=P(5.0, 4.5, -ST)[0], y=P(5.0, 4.5, -ST)[1] + 62)
ell(gs, 0, 0, 980, 200, rad((0, 0), 490, [(0, col('#1e293b', 0.30)), (0.55, col('#1e293b', 0.13)),
                                          (1, col('#1e293b', 0))]))

D = ZI.add('Node', name='Diorama')

# ================================================================== floor slab
box(D, -WT, RW, -WT, RD, -ST, -0.2, '#3b3631', top='#3b3631', left='#4a443d', right='#332e29', edge=0)
box(D, -WT, RW, -WT, RD, -0.2, 0, OAK[0], top=OAK[0], left='#b98552', right='#9c6c41', edge=0.35)
# planks (floor plane), run along y
fl = ISO.plane(D, 'xy', (0, 0, 0.001))
rects(fl, [(0, 0, RW, RD)], col('#8f6239'))
pw = RW / 11
for i in range(11):
    u0 = i * pw + 0.025
    u1 = (i + 1) * pw - 0.025
    cut = random.uniform(2.0, 7.0)
    for (v0, v1) in ((0.0, cut - 0.02), (cut + 0.02, RD)):
        rect(fl, u0, v0, u1, v1, col(random.choice(OAK)))
# floor ambient occlusion along walls
rect(fl, 0, 0, RW, 1.4, lin((0, -0.7), (0, 0.7), [(0, col('#2a1606', 0.32)), (1, col('#2a1606', 0))]))
rect(fl, 0, 0, 1.3, RD, lin((-0.65, 0), (0.65, 0), [(0, col('#2a1606', 0.30)), (1, col('#2a1606', 0))]))

# rug
rug = ISO.plane(D, 'xy', (5.55, 5.15, 0.012))
rect(rug, -2.35, -2.1, 2.35, 2.1, col('#2e6eb8'), r=0.22)
rect(rug, -2.15, -1.9, 2.15, 1.9, col('#efe5d3'), r=0.14)
rect(rug, -1.75, -1.5, 1.75, 1.5, None, r=0.1, st=(col('#d98b5f'), 0.07))
for k in (-0.9, 0, 0.9):
    rect(rug, -1.35, k - 0.05, 1.35, k + 0.05, col('#2e6eb8', 0.85))
for k in range(-6, 7):
    rect(rug, k * 0.32 - 0.06, -1.25, k * 0.32 + 0.06, -1.13, col('#d98b5f'))
    rect(rug, k * 0.32 - 0.06, 1.13, k * 0.32 + 0.06, 1.25, col('#d98b5f'))

# window light on floor: d = (-0.25, 1, -0.75)
WX0, WX1, WZ0, WZ1 = 4.3, 9.5, 2.85, 6.5
BLIND_Z = 4.95


def floor_hit(x, z, dx=-0.25, k=0.75):
    t = z / k
    return (x + dx * t, t)


light_floor = D.add('Node', name='FloorLight')
mull = (WX0 + WX1) / 2
for (xa, xb) in ((WX0 + 0.12, mull - 0.05), (mull + 0.05, WX1 - 0.12)):
    pts = [floor_hit(xa, WZ0 + 0.1), floor_hit(xb, WZ0 + 0.1), floor_hit(xb, BLIND_Z), floor_hit(xa, BLIND_Z)]
    poly(light_floor, [P(x, y, 0.02) for x, y in pts],
         lin(P(*pts[0], 0), P(*pts[3], 0), [(0, col('#ffd9a0', 0.32)), (1, col('#ffe3b8', 0.2))]),
         blend=14)
    z = BLIND_Z
    while z < WZ1 - 0.15:
        pts = [floor_hit(xa, z + 0.04), floor_hit(xb, z + 0.04), floor_hit(xb, z + 0.13), floor_hit(xa, z + 0.13)]
        poly(light_floor, [P(x, y, 0.02) for x, y in pts], col('#ffe3b8', 0.12), blend=14)
        z += 0.2

# ================================================================== window wall (y=0)
WW = D.add('Node', name='WindowWall')
# outside view, set back at y=-0.22
ov = ISO.plane(WW, 'xz', (WX0, -0.22, WZ1))
ww, wh = WX1 - WX0, WZ1 - WZ0
rect(ov, -0.3, -0.3, ww + 0.3, wh + 0.3, lin((0, 0), (0, wh), [(0, col('#fff7e6')), (0.55, col('#ffe7c4')),
                                                              (1, col('#ffd3a1'))]))
ell(ov, ww * 0.62, wh * 0.55, 3.2, 3.2, rad((0, 0), 1.6, [(0, col('#ffffff', 0.9)), (1, col('#ffffff', 0))]))
# distant skyline
sky_x = -0.2
random.seed(3)
blds = []
while sky_x < ww + 0.3:
    bw = random.uniform(0.25, 0.6)
    bh = random.uniform(0.35, 1.25)
    blds.append((sky_x, wh - bh, sky_x + bw, wh + 0.3))
    sky_x += bw + random.uniform(0.02, 0.12)
rects(ov, blds, col('#e9b88a', 0.55))
rects(ov, [(b[0] + 0.1, b[1] - 0.25, b[0] + 0.14, b[1]) for b in blds[::3]], col('#e9b88a', 0.55))
random.seed(7)
# window frame + mullion
rect(ov, -0.3, -0.3, ww + 0.3, 0.09, col('#f7f4ef'))
rect(ov, -0.3, wh - 0.09, ww + 0.3, wh + 0.3, col('#f7f4ef'))
rect(ov, ww / 2 - 0.05, 0, ww / 2 + 0.05, wh, col('#f7f4ef'))
rect(ov, -0.3, wh * 0.52 - 0.03, ww + 0.3, wh * 0.52 + 0.03, col('#f7f4ef'))
# blinds (top part)
bl = ISO.plane(WW, 'xz', (WX0, -0.12, WZ1))
z = 0.0
while z < (WZ1 - BLIND_Z):
    rect(bl, -0.1, z, ww + 0.1, z + 0.12, col('#fbf8f2'))
    rect(bl, -0.1, z + 0.12, ww + 0.1, z + 0.15, col('#d9cfc0'))
    z += 0.2
rect(bl, -0.12, z - 0.02, ww + 0.12, z + 0.08, col('#e8e0d3'))
rect(bl, ww * 0.18, z + 0.08, ww * 0.18 + 0.025, z + 0.75, col('#cfc4b4'))

# reveal (jamb, sill, head) between y=-0.22 and 0
poly(WW, ISO.Ps([(WX0, 0, WZ0), (WX0, 0, WZ1), (WX0, -0.22, WZ1), (WX0, -0.22, WZ0)]), col('#d8d0c5'))
poly(WW, ISO.Ps([(WX0, -0.22, WZ0), (WX1, -0.22, WZ0), (WX1, 0, WZ0), (WX0, 0, WZ0)]), col('#f6f2ec'))

# wall body: inner face with hole, cap, end
outer = ISO.Ps([(-WT, 0, 0), (RW, 0, 0), (RW, 0, RH), (-WT, 0, RH)])
hole = ISO.Ps([(WX0, 0, WZ0), (WX1, 0, WZ0), (WX1, 0, WZ1), (WX0, 0, WZ1)])
tl = P(0, 0, RH)
polys(WW, [outer, hole], lin(P(5, 0, RH), P(5, 0, 0), [(0, col('#ece6dd')), (0.7, col('#ddd5ca')),
                                                       (1, col('#c9c0b3'))]), rule=1)
poly(WW, ISO.Ps([(RW, -WT, 0), (RW, 0, 0), (RW, 0, RH), (RW, -WT, RH)]), col('#bdb5aa'))
poly(WW, ISO.Ps([(-WT, -WT, RH), (RW, -WT, RH), (RW, 0, RH), (-WT, 0, RH)]), col(CAP))
poly(WW, ISO.Ps([(-WT, 0, RH), (RW, 0, RH), (RW, -WT, RH)]), None, (col('#ffffff', 0.6), 1.4), closed=False)
# light spill around window on wall
wl = ISO.plane(WW, 'xz', ((WX0 + WX1) / 2, 0.005, (WZ0 + WZ1) / 2))
ell(wl, 0, 0, 8.5, 6.0, rad((0, 0), 4.2, [(0, col('#fff1d8', 0.35)), (1, col('#fff1d8', 0))]), blend=14)
# sill ledge
box(WW, WX0 - 0.12, WX1 + 0.12, 0, 0.2, WZ0 - 0.1, WZ0, '#f3efe9', edge=0.5)

# wall clock
ck = ISO.plane(WW, 'xz', (2.05, 0.02, 5.45))
ell(ck, 0.05, 0.08, 1.12, 1.12, col('#1a2433', 0.18))
ell(ck, 0, 0, 1.1, 1.1, col('#fbf7ef'), st=(col('#283041'), 0.08))
for i in range(12):
    n = ck.add('Node', rotation=i * math.pi / 6)
    rect(n, -0.018, -0.47, 0.018, -0.38 if i % 3 else -0.34, col('#283041'))
hr = ck.add('Node', rotation=-1.0)
rect(hr, -0.03, -0.27, 0.03, 0.05, col('#283041'), r=0.03)
mn = ck.add('Node', rotation=0.5, name='minuteHand')
rect(mn, -0.02, -0.4, 0.02, 0.06, col('#283041'), r=0.02)
sc = ck.add('Node', name='secondHand')
rect(sc, -0.008, -0.42, 0.008, 0.1, col('#e4573d'))
ell(ck, 0, 0, 0.09, 0.09, col('#e4573d'))

# sticky notes
sn = ISO.plane(WW, 'xz', (2.55, 0.02, 4.35))
for (u, v, c_, rot) in ((0.0, 0.0, '#ffd166', -0.08), (0.42, 0.12, '#ff8fab', 0.06), (0.12, 0.48, '#7bdff2', 0.04)):
    n = sn.add('Node', x=u + 0.17, y=v + 0.17, rotation=rot)
    rect(n, -0.17 + 0.02, -0.17 + 0.03, 0.17 + 0.02, 0.17 + 0.03, col('#1a2433', 0.15))
    rect(n, -0.17, -0.17, 0.17, 0.17, col(c_))
    rect(n, -0.11, -0.07, 0.09, -0.05, col('#1a2433', 0.35))
    rect(n, -0.11, 0.0, 0.05, 0.02, col('#1a2433', 0.35))

# ================================================================== brick wall (x=0)
BW = D.add('Node', name='BrickWall')
poly(BW, ISO.Ps([(0, 0, 0), (0, RD, 0), (0, RD, RH), (0, 0, RH)]), col(MORTAR))
bw = ISO.plane(BW, 'yz', (0.003, RD, RH))     # u: 0..9 toward the corner, v: 0..7 down
bh_, bwid, gap = 0.235, 0.56, 0.05
rows = int(RH / (bh_ + gap)) + 1
buckets = {c_: [] for c_ in BRICKS}
for r_ in range(rows):
    v0 = r_ * (bh_ + gap) + gap / 2
    v1 = min(v0 + bh_, RH)
    if v0 >= RH:
        break
    off = (bwid + gap) / 2 if r_ % 2 else 0
    u = -off
    while u < RD:
        u0, u1 = max(u, 0.0), min(u + bwid, RD)
        if u1 - u0 > 0.05:
            buckets[random.choice(BRICKS)].append((u0, v0, u1, v1))
        u += bwid + gap
for c_, lst in buckets.items():
    rects(bw, lst, col(c_))
# brick shading: dark toward floor & corner, cool top
rect(bw, 0, 0, RD, RH, lin((0, 0), (0, RH), [(0, col('#1a1020', 0.0)), (0.6, col('#1a1020', 0.12)),
                                            (1, col('#1a1020', 0.42))]))
rect(bw, 0, 0, RD, RH, lin((RD, 0), (RD - 1.6, 0), [(0, col('#140c18', 0.38)), (1, col('#140c18', 0))]))
# wall cap + end
poly(BW, ISO.Ps([(-WT, 0, RH), (0, 0, RH), (0, RD, RH), (-WT, RD, RH)]), col(CAP))
poly(BW, ISO.Ps([(-WT, RD, 0), (0, RD, 0), (0, RD, RH), (-WT, RD, RH)]), col('#d4ccc1'))
poly(BW, ISO.Ps([(0, 0, RH), (0, RD, RH), (-WT, RD, RH)]), None, (col('#ffffff', 0.6), 1.4), closed=False)

# shelf LED glow on wall
led = ISO.plane(BW, 'yz', (0.006, 4.5, 4.48))
rect(led, 0, 0, 3.7, 1.9, lin((0, 0), (0, 1.9), [(0, col('#ffb35c', 0.62)), (0.4, col('#ff9d4a', 0.22)),
                                                 (1, col('#ff9d4a', 0))]), blend=14, name='ledGlow')

# neon sign  </>
NEON_C, NEON_P = '#58f0ff', '#ff5fb8'
ng = ISO.plane(BW, 'yz', (0.01, 7.75, 5.75))
neon_glow = ell(ng, 0.95, 0.5, 3.6, 2.4, rad((0, 0), 1.8, [(0, col('#58e6ff', 0.42)), (1, col('#58e6ff', 0))]),
                blend=14, name='neonGlow')
rect(ng, -0.25, -0.2, 2.15, 1.2, col('#ffffff', 0.08), r=0.12, st=(col('#ffffff', 0.18), 0.02))
neon = ng.add('Node', name='neon')
glyphs = [([(0.45, 0.0), (0.0, 0.5), (0.45, 1.0)], NEON_C), ([(1.1, -0.02), (0.78, 1.02)], NEON_P),
          ([(1.45, 0.0), (1.9, 0.5), (1.45, 1.0)], NEON_C)]
for pts, c_ in glyphs:
    for w_, a_ in ((0.26, 0.18), (0.13, 0.45), (0.06, 1.0)):
        cc = col(lighten(c_, 0.55) if w_ < 0.1 else c_, a_)
        sh = neon.add('Shape')
        pp = sh.add('PointsPath', isClosed=False)
        for (u, v) in pts:
            pp.add('StraightVertex', x=u, y=v)
        stroke(sh, cc, w_)

# fairy lights along the brick wall top
fl_pl = ISO.plane(BW, 'yz', (0.03, RD, RH))
hooks = [0.35, 3.2, 6.0, 8.75]
wire = []
bulbs = []
for a_, b_ in zip(hooks, hooks[1:]):
    for i in range(12):
        t = i / 12
        u = a_ + (b_ - a_) * t
        v = 0.45 + 0.42 * math.sin(math.pi * t)
        wire.append((u, v))
    for i in range(1, 5):
        t = i / 5
        bulbs.append((a_ + (b_ - a_) * t, 0.45 + 0.42 * math.sin(math.pi * t) + 0.06))
wire.append((hooks[-1], 0.45))
sh = fl_pl.add('Shape')
pp = sh.add('PointsPath', isClosed=False)
for (u, v) in wire:
    pp.add('StraightVertex', x=u, y=v)
stroke(sh, col('#3a2f2a', 0.8), 0.025)
bulb_glows = []
for (u, v) in bulbs:
    g = ell(fl_pl, u, v + 0.05, 0.95, 0.95, rad((0, 0), 0.47, [(0, col('#ffcf7a', 0.85)), (1, col('#ffcf7a', 0))]),
            blend=14)
    bulb_glows.append(g)
    ell(fl_pl, u, v + 0.05, 0.13, 0.17, col('#fff3cf'))

# shelf
SH_Z = 4.5
box(BW, 0, 1.0, 0.9, 4.4, SH_Z, SH_Z + 0.12, WALNUT, edge=0.35)
# books
yb = 1.0
for (th, hh, c_) in ((0.16, 0.66, '#e4573d'), (0.12, 0.58, '#f2b84b'), (0.19, 0.74, '#2e6eb8'),
                     (0.14, 0.52, '#2b2f3a'), (0.15, 0.62, '#58b07e'), (0.11, 0.56, '#efe6d4')):
    box(BW, 0.1, 0.78, yb, yb + th, SH_Z + 0.12, SH_Z + 0.12 + hh, c_, edge=0.25)
    yb += th + 0.015
box(BW, 0.12, 0.8, 2.15, 2.85, SH_Z + 0.12, SH_Z + 0.22, '#c94f7c', edge=0.25)
box(BW, 0.16, 0.76, 2.2, 2.8, SH_Z + 0.22, SH_Z + 0.31, '#f4efe6', edge=0.25)
# little console-cartridge trophy
box(BW, 0.3, 0.6, 2.35, 2.62, SH_Z + 0.31, SH_Z + 0.62, '#ffcc4d', edge=0.4)
# pothos pot
cyl(BW, 0.5, 3.6, SH_Z + 0.12, SH_Z + 0.5, 0.27, '#c8714a')
ell(BW, *P(0.5, 3.6, SH_Z + 0.5), 0.27 * 2 * C * S * 1.15, 0.27 * S * 0.95, col('#4a2f22'))
pothos = BW.add('Node', name='pothos', x=P(0.75, 3.75, SH_Z + 0.45)[0], y=P(0.75, 3.75, SH_Z + 0.45)[1])
LEAF = ['#2f8a57', '#3fa36a', '#246b45', '#56b97f']


def leaf(parent, x, y, length, ang, c_, width=0.55):
    n = parent.add('Node', x=x, y=y, rotation=ang)
    L, Wd = length, length * width
    pts = []
    for i in range(13):
        t = i / 12
        pts.append((t * L, -math.sin(math.pi * t) ** 0.8 * Wd / 2))
    for i in range(11, 0, -1):
        t = i / 12
        pts.append((t * L, math.sin(math.pi * t) ** 0.8 * Wd / 2))
    poly(n, pts, col(c_))
    poly(n, [(0.08 * L, 0), (0.85 * L, 0)], None, (col('#ffffff', 0.22), max(0.8, L * 0.035)), closed=False)
    return n


vines = []
for k, (dx, ln) in enumerate(((-18, 7), (6, 9), (26, 6))):
    v = pothos.add('Node', x=dx, y=0)
    vines.append(v)
    pts = [(0, 0)]
    for i in range(ln):
        pts.append((math.sin(i * 0.9 + k) * 6, 10 + i * 13))
    poly(v, pts, None, (col('#2c6e45'), 2.2), closed=False)
    for i, (px, py) in enumerate(pts[1:]):
        side = 1 if i % 2 else -1
        leaf(v, px, py, 16 + random.uniform(-3, 4), math.pi / 2 + side * 0.9, random.choice(LEAF), 0.75)
for i in range(7):
    a = -math.pi / 2 + random.uniform(-1.3, 1.3)
    leaf(pothos, random.uniform(-25, 25), random.uniform(-14, 2), 19, a, random.choice(LEAF), 0.75)

# ================================================================== corner plant
plant = D.add('Node', name='CornerPlant')
floor_shadow(plant, 1.15, 1.25, 0.8, 0.6, 0.35)
cyl(plant, 1.15, 1.25, 0, 0.95, 0.46, '#efe9e0')
ell(plant, *P(1.15, 1.25, 0.95), 0.46 * 2 * C * S * 1.15, 0.46 * S * 0.95, col('#3b2a20'))
base = P(1.15, 1.25, 0.95)
leaves_big = []
for i, (ang, ln, h) in enumerate(((-2.2, 95, 0.7), (-1.75, 120, 1.6), (-1.35, 110, 2.2), (-1.0, 100, 1.4),
                                   (-0.6, 85, 0.6), (-2.6, 80, 0.3), (-1.55, 90, 2.9), (-0.85, 70, 2.5))):
    stem_top = (base[0] + math.cos(ang) * 20, base[1] - h * 38)
    poly(plant, [base, stem_top], None, (col('#2b6b44'), 3), closed=False)
    n = leaf(plant, stem_top[0], stem_top[1], ln * 0.55, ang + random.uniform(-0.3, 0.3),
             LEAF[i % 4], 0.62)
    leaves_big.append(n)

# ================================================================== furniture shadows
floor_shadow(D, 6.0, 1.4, 4.2, 1.7, 0.3)
floor_shadow(D, 5.3, 3.6, 1.3, 1.0, 0.4)
floor_shadow(D, 1.0, 6.2, 0.9, 2.0, 0.3)

# ================================================================== desk underside: legs, cabinet, pc
DZ0, DZ1 = 2.25, 2.42
for (yy) in (0.18, 2.22):
    box(D, 2.42, 2.54, yy, yy + 0.12, 0, DZ0, '#2a2f3d', edge=0.15)
box(D, 2.42, 2.54, 0.3, 2.22, 0.25, 0.37, '#2a2f3d', edge=0.15)
# pc tower
PC = D.add('Node', name='PC')
box(PC, 2.75, 3.4, 0.35, 1.75, 0.05, 1.6, '#1d212c', top='#2b303e', left='#232836', right='#151821', edge=0.25)
box(PC, 2.8, 3.35, 0.35, 1.75, 0.0, 0.05, '#0f1117', edge=0)
# glass side (+x face) with fans
pcp = ISO.plane(PC, 'yz', (3.405, 1.7, 1.52))
rect(pcp, 0.05, 0.05, 1.25, 1.42, col('#0b0d14', 0.85), r=0.05, st=(col('#7c8aa8', 0.35), 0.02))
fans = []
for k, (fu, fv, c_) in enumerate(((0.65, 0.42, '#58f0ff'), (0.65, 1.05, '#c06bff'))):
    ell(pcp, fu, fv, 0.62, 0.62, rad((0, 0), 0.31, [(0, col(c_, 0.0)), (0.7, col(c_, 0.35)), (1, col(c_, 0))]))
    ell(pcp, fu, fv, 0.5, 0.5, None, st=(col(c_, 0.95), 0.035))
    fan = pcp.add('Node', x=fu, y=fv, name='fan%d' % k)
    for b_ in range(5):
        bn = fan.add('Node', rotation=b_ * 2 * math.pi / 5)
        poly(bn, [(0.03, -0.02), (0.21, -0.07), (0.22, 0.02), (0.05, 0.04)], col('#d9e4ff', 0.55))
    ell(pcp, fu, fv, 0.1, 0.1, col('#1a1e2a'))
    fans.append(fan)
# front LED strip
poly(PC, ISO.Ps([(2.9, 1.751, 1.45), (3.25, 1.751, 1.45), (3.25, 1.751, 0.2), (2.9, 1.751, 0.2)]), None,
     (col('#58f0ff', 0.9), 1.4))
# cabinet
CAB = D.add('Node', name='Cabinet')
box(CAB, 8.05, 9.55, 0.15, 2.35, 0, DZ0, '#e6e0d7', top='#f3efe8', right='#cbc3b7', edge=0.3)
cbp = ISO.plane(CAB, 'xz', (8.05, 2.352, DZ0))
for k, (v0, v1) in enumerate(((0.12, 0.62), (0.72, 1.32), (1.42, 2.15))):
    rect(cbp, 0.1, v0, 1.4, v1, None, r=0.03, st=(col('#b8ae9f'), 0.025))
    rect(cbp, 0.55, v0 + 0.12, 0.95, v0 + 0.17, col('#7d7568'), r=0.02)

# ================================================================== desk top
box(D, 2.3, 9.7, 0.05, 2.5, DZ0, DZ1, WALNUT, top='#a87249', left='#8a5735', right='#6f4428', edge=0.4)
dsk = ISO.plane(D, 'xy', (0, 0, DZ1 + 0.002))
# wood grain
for k in range(9):
    yy = 0.25 + k * 0.26
    rect(dsk, 2.4, yy, 9.6, yy + 0.012, col('#7d4d2d', 0.25))
# monitor glows on desk
ell(dsk, 4.15, 1.0, 2.6, 1.8, rad((0, 0), 1.3, [(0, col('#7fd4ff', 0.30)), (1, col('#7fd4ff', 0))]), blend=14)
ell(dsk, 6.9, 1.0, 3.6, 1.9, rad((0, 0), 1.8, [(0, col('#9fdcff', 0.30)), (1, col('#9fdcff', 0))]), blend=14)
lamp_pool = ell(dsk, 8.55, 1.45, 2.4, 2.0, rad((0, 0), 1.2, [(0, col('#ffcf8a', 0.55)), (1, col('#ffcf8a', 0))]),
                blend=14, name='lampPool')

# ================================================================== desk items
DI = D.add('Node', name='DeskItems')
# succulent
cyl(DI, 2.75, 0.5, DZ1, DZ1 + 0.24, 0.18, '#e8e2d8')
sp = P(2.75, 0.5, DZ1 + 0.24)
for i in range(9):
    a = -math.pi / 2 + (i - 4) * 0.32
    leaf(DI, sp[0], sp[1], 17 - abs(i - 4) * 1.5, a, ['#6fbf8e', '#8fd1a5', '#5aa77a'][i % 3], 0.6)

# monitor stands
def stand(xc):
    box(DI, xc - 0.38, xc + 0.38, 0.22, 0.95, DZ1, DZ1 + 0.05, '#2a2f3d', edge=0.3)
    box(DI, xc - 0.07, xc + 0.07, 0.36, 0.52, DZ1 + 0.05, 3.3, '#3a4050', edge=0.2)


stand(4.15)
stand(6.9)
# monitor bezels
box(DI, 3.4, 4.9, 0.52, 0.7, 2.95, 5.55, '#1b1f2b', top='#3a4052', left='#1b1f2b', right='#10131b', edge=0.3)
box(DI, 5.45, 8.35, 0.52, 0.7, 3.0, 4.75, '#1b1f2b', top='#3a4052', left='#1b1f2b', right='#10131b', edge=0.3)

# --- code screen
CODE_U, CODE_V = 1.38, 2.47
cs = ISO.plane(DI, 'xz', (3.46, 0.705, 5.49))
rect(cs, 0, 0, CODE_U, CODE_V, lin((0, 0), (0, CODE_V), [(0, col('#1b2640')), (1, col('#111a2e'))]))
clipsrc = cs.add('Shape', name='codeClip', x=CODE_U / 2, y=CODE_V / 2)
clipsrc.add('Rectangle', width=CODE_U, height=CODE_V)
codeg = cs.add('Node', name='code')
codeg.add('ClippingShape', sourceId=clipsrc, fillRule=0, isVisible=True)
rect(codeg, 0, 0, CODE_U, 0.13, col('#1f2a42'))
for k, c_ in enumerate(('#ff6b6b', '#ffd166', '#5ee38f')):
    ell(codeg, 0.08 + k * 0.08, 0.065, 0.045, 0.045, col(c_))
rect(codeg, 0, 0.13, 0.11, CODE_V, col('#18213a'))
SYN = ['#ff7a90', '#7ee0ff', '#ffd479', '#a5e887', '#c3a6ff', '#e6edf3', '#e6edf3', '#7ee0ff']
LH = 0.158
V0 = 0.3
code_lines = []
indent = 0
random.seed(11)
for i in range(14):
    v = V0 + i * LH
    ell(codeg, 0.06, v, 0.035, 0.035, col('#3a4766'))
    if i in (4, 9):
        code_lines.append(None)
        continue
    if i in (2, 6, 11):
        indent = min(indent + 1, 2)
    elif i in (5, 10, 13):
        indent = max(indent - 1, 0)
    u0 = 0.17 + indent * 0.13
    ln = codeg.add('Node', x=u0, y=v, scaleX=0.0)
    u = 0
    segs = []
    for s_ in range(random.randint(2, 4)):
        w_ = random.uniform(0.12, 0.36)
        if u + w_ > CODE_U - 0.12 - u0:
            break
        segs.append((u, w_, random.choice(SYN)))
        u += w_ + 0.045
    u -= 0.045
    if i in (0, 7):
        segs = [(0, 0.78, '#5c6b85')]
        u = 0.78
    for (uu, w_, c_) in segs:
        rect(ln, uu, -0.034, uu + w_, 0.034, col(c_), r=0.017)
    code_lines.append((ln, u, v, u0))
cursor = codeg.add('Node', name='cursor', x=0.17, y=V0)
cursor_blink = rect(cursor, 0.0, -0.05, 0.045, 0.05, col('#e6edf3'))
# glass sheen
poly(cs, [(0, 0), (CODE_U * 0.55, 0), (CODE_U * 0.15, CODE_V * 0.45), (0, CODE_V * 0.45)],
     lin((0, 0), (CODE_U * 0.4, CODE_V * 0.3), [(0, col('#ffffff', 0.08)), (1, col('#ffffff', 0))]))

# --- second screen: live preview of the site being built + dev-server terminal
GU, GV = 2.76, 1.62
gsn = ISO.plane(DI, 'xz', (5.52, 0.705, 4.68))
rect(gsn, 0, 0, GU, GV, col('#f4f6fa'))
rect(gsn, 0, 0, GU, 0.17, col('#e2e7ef'))
for k, c_ in enumerate(('#ff6b6b', '#ffd166', '#5ee38f')):
    ell(gsn, 0.08 + k * 0.075, 0.085, 0.045, 0.045, col(c_))
rect(gsn, 0.34, 0.04, 1.62, 0.13, col('#ffffff'), r=0.045)
ell(gsn, 0.41, 0.085, 0.035, 0.035, col('#58b07e'))
rect(gsn, 0.47, 0.072, 0.98, 0.098, col('#9aa5b8'), r=0.013)
pv = gsn.add('Node', name='preview')
rect(pv, 0.1, 0.25, 0.18, 0.33, col('#2e6eb8'), r=0.02)
rect(pv, 0.22, 0.27, 0.44, 0.31, col('#1a202c'), r=0.02)
for k in range(3):
    rect(pv, 1.0 + k * 0.22, 0.275, 1.16 + k * 0.22, 0.305, col('#8a94a6'), r=0.015)
rect(pv, 0.1, 0.43, 0.92, 0.53, col('#1a202c'), r=0.02)
rect(pv, 0.1, 0.57, 0.74, 0.67, col('#2e6eb8'), r=0.02)
rect(pv, 0.1, 0.73, 0.95, 0.765, col('#9aa5b8'), r=0.015)
rect(pv, 0.1, 0.79, 0.8, 0.825, col('#9aa5b8'), r=0.015)
btns = pv.add('Node', name='ctaButtons', x=0.1, y=0.95)
rect(btns, 0, -0.065, 0.36, 0.065, col('#2e6eb8'), r=0.065)
rect(btns, 0.07, -0.012, 0.29, 0.012, col('#ffffff'), r=0.012)
cta_press = rect(btns, 0, -0.065, 0.36, 0.065, col('#0b1424'), r=0.065, name='ctaPress')
rect(btns, 0.42, -0.065, 0.78, 0.065, col('#ffffff'), r=0.065, st=(col('#2e6eb8'), 0.016))
rect(btns, 0.49, -0.012, 0.71, 0.012, col('#2e6eb8'), r=0.012)
img = pv.add('Node', name='heroImage')
rect(img, 1.02, 0.4, 1.68, 1.0, lin((1.02, 0.4), (1.68, 1.0), [(0, col('#ffd59e')), (1, col('#ff8a65'))]), r=0.06)
img2 = rect(img, 1.02, 0.4, 1.68, 1.0, lin((1.02, 0.4), (1.68, 1.0), [(0, col('#7ee0ff')), (1, col('#2e6eb8'))]),
            r=0.06, name='heroImage2')
ell(img, 1.35, 0.7, 0.3, 0.3, col('#ffffff', 0.85))
rect(img, 1.28, 0.66, 1.42, 0.74, col('#2e6eb8', 0.5), r=0.02)
cards = pv.add('Node', name='cards')
for k, c_ in enumerate(('#2e6eb8', '#e9805a', '#58b07e')):
    u0 = 0.1 + k * 0.54
    rect(cards, u0, 1.1, u0 + 0.48, 1.52, col('#ffffff'), r=0.04, st=(col('#dfe4ec'), 0.012))
    rect(cards, u0 + 0.05, 1.15, u0 + 0.17, 1.22, col(c_), r=0.02)
    rect(cards, u0 + 0.05, 1.29, u0 + 0.4, 1.32, col('#8a94a6'), r=0.015)
    rect(cards, u0 + 0.05, 1.37, u0 + 0.32, 1.4, col('#c3cad6'), r=0.015)
toast = pv.add('Node', name='toast', x=1.4, y=1.46)
rect(toast, -0.3, -0.07, 0.3, 0.07, col('#1a202c'), r=0.07)
ell(toast, -0.2, 0, 0.07, 0.07, col('#5ee38f'))
rect(toast, -0.11, -0.016, 0.2, 0.016, col('#ffffff'), r=0.016)
TX = 1.86
rect(gsn, TX, 0.17, GU, GV, col('#0f1626'))
rect(gsn, TX, 0.17, GU, 0.27, col('#18213a'))
rect(gsn, TX + 0.06, 0.205, TX + 0.36, 0.235, col('#8a94a6'), r=0.015)
term = gsn.add('Node', name='terminal')
TLINES = [
    [('#5ee38f', 0.05), ('#e6edf3', 0.42)],
    [('#e6edf3', 0.07), ('#e6edf3', 0.36)],
    [('#5ee38f', 0.05), ('#9aa5b8', 0.5)],
    [('#9aa5b8', 0.05), ('#9aa5b8', 0.4)],
    [('#5ee38f', 0.05), ('#e6edf3', 0.34), ('#7ee0ff', 0.13)],
    [('#9aa5b8', 0.05), ('#9aa5b8', 0.46)],
    [('#5ee38f', 0.05), ('#e6edf3', 0.34), ('#7ee0ff', 0.11)],
    [('#9aa5b8', 0.05), ('#9aa5b8', 0.38)],
    [('#5ee38f', 0.05), ('#e6edf3', 0.34), ('#7ee0ff', 0.13)],
]
term_lines = []
for i, segs in enumerate(TLINES):
    n = term.add('Node', x=TX + 0.07, y=0.36 + i * 0.13)
    u = 0
    for c_, w_ in segs:
        rect(n, u, -0.022, u + w_, 0.022, col(c_), r=0.011)
        u += w_ + 0.035
    term_lines.append(n)
ptr = gsn.add('Node', name='pointer', x=1.25, y=1.25)
poly(ptr, [(0, 0), (0, 0.17), (0.048, 0.128), (0.08, 0.2), (0.106, 0.19), (0.075, 0.118), (0.13, 0.118)],
     col('#111827'), st=(col('#ffffff'), 0.014))
poly(gsn, [(0, 0), (GU * 0.4, 0), (GU * 0.1, GV * 0.5), (0, GV * 0.5)],
     lin((0, 0), (GU * 0.3, GV * 0.3), [(0, col('#ffffff', 0.10)), (1, col('#ffffff', 0))]))

# mousepad + mouse
mp = ISO.plane(DI, 'xy', (0, 0, DZ1 + 0.004))
rect(mp, 3.2, 1.5, 4.2, 2.44, col('#23283a'), r=0.08)
mouse = mp.add('Node', name='mouse', x=3.75, y=1.98)
ell(mouse, 0.03, 0.04, 0.24, 0.36, col('#0b1424', 0.35))
ell(mouse, 0, 0, 0.22, 0.34, col('#f2f1ee'))
rect(mouse, -0.006, -0.16, 0.006, -0.04, col('#b9b7b0'))
# keyboard
KY = 1.72
box(DI, 4.3, 6.3, KY, KY + 0.54, DZ1, DZ1 + 0.08, '#2a2f3d', top='#353b4c', edge=0.3)
kb = ISO.plane(DI, 'xy', (0, 0, DZ1 + 0.082))
keys = []
for r_ in range(4):
    for k in range(14):
        u0 = 4.38 + k * 0.137
        v0 = KY + 0.06 + r_ * 0.118
        keys.append((u0, v0, u0 + 0.11, v0 + 0.09))
rects(kb, keys, col('#e9ecf2'))
rect(kb, 4.95, KY + 0.06 + 3 * 0.118, 5.75, KY + 0.06 + 3 * 0.118 + 0.09, col('#cfd5e0'))
ell(dsk, 5.3, KY + 0.27, 2.6, 0.9, rad((0, 0), 1.3, [(0, col('#58f0ff', 0.16)), (1, col('#58f0ff', 0))]),
    blend=14)
# desk speaker, right of the keyboard
SPX0, SPX1, SPY0, SPY1, SPH = 6.45, 6.97, 1.42, 1.94, 0.95
box(DI, SPX0, SPX1, SPY0, SPY1, DZ1, DZ1 + SPH, WALNUT, top='#b07a52', left='#8a5735', right='#6f4428', edge=0.35)
spf = ISO.plane(DI, 'xz', ((SPX0 + SPX1) / 2, SPY1 + 0.004, DZ1 + SPH))
rect(spf, -0.22, 0.05, 0.22, SPH - 0.05, col('#262a35'), r=0.04)
ell(spf, 0, 0.24, 0.16, 0.16, col('#9aa3b5'))
ell(spf, 0, 0.24, 0.1, 0.1, col('#1a1d26'))
woofer = spf.add('Node', name='woofer', x=0, y=0.62)
ell(woofer, 0, 0, 0.38, 0.38, col('#9aa3b5'))
ell(woofer, 0, 0, 0.32, 0.32, rad((0, 0), 0.16, [(0, col('#4a5060')), (1, col('#2a2e3a'))]))
ell(woofer, 0, 0, 0.11, 0.11, col('#1a1d26'))
ell(spf, 0.15, SPH - 0.12, 0.03, 0.03, col('#58f0ff'))
# notebook + pen
box(DI, 7.55, 8.4, 1.15, 2.2, DZ1, DZ1 + 0.035, '#f4efe4', edge=0)
box(DI, 7.53, 8.42, 1.13, 2.22, DZ1 + 0.035, DZ1 + 0.075, '#2e6eb8', top='#3b7cc8', edge=0.3)
nb = ISO.plane(DI, 'xy', (0, 0, DZ1 + 0.077))
rect(nb, 8.2, 1.13, 8.24, 2.22, col('#1d4f8f'))
pen = ISO.plane(DI, 'xy', (0, 0, DZ1 + 0.1))
pn = pen.add('Node', x=7.95, y=1.7, rotation=0.5)
rect(pn, -0.45, -0.025, 0.4, 0.025, col('#ffcc4d'), r=0.02)
rect(pn, 0.4, -0.02, 0.48, 0.02, col('#2b2f3a'), r=0.01)
# mug (its own pivot so it can be lifted for a sip)
MUG = (7.22, 2.16)
MR = 0.16
mug_c = P(MUG[0], MUG[1], DZ1 + 0.19)
mugN = DI.add('Node', name='mug', x=mug_c[0], y=mug_c[1])
mg = mugN.add('Node', x=-mug_c[0], y=-mug_c[1])
floor_shadow(mg, MUG[0] + 0.05, MUG[1] + 0.05, 0.26, 0.26, 0.35, z=DZ1 + 0.002)
cyl(mg, MUG[0], MUG[1], DZ1, DZ1 + 0.38, MR, '#f2efe9')
band = [P(MUG[0] + (MR + 0.001) * math.cos(a), MUG[1] + (MR + 0.001) * math.sin(a), z)
        for z, rng in ((DZ1 + 0.2, range(0, 25)), (DZ1 + 0.26, range(24, -1, -1)))
        for a in [(-math.pi / 4 + math.pi * i / 24) for i in rng]]
poly(mg, band, col('#2e6eb8'))
ell(mg, *P(MUG[0], MUG[1], DZ1 + 0.36), (MR - 0.03) * 2 * C * S * 1.15, (MR - 0.03) * S * 0.95, col('#5a3420'))
ha = 3 * math.pi / 4
hp = [P(MUG[0] + (MR + 0.09 * math.sin(math.pi * i / 10)) * math.cos(ha),
        MUG[1] + (MR + 0.09 * math.sin(math.pi * i / 10)) * math.sin(ha), DZ1 + 0.08 + 0.22 * i / 10)
      for i in range(11)]
poly(mg, hp, None, (col('#e6e1d8'), 5), closed=False)
MUG_GRIP = (MUG[0] - 0.24, MUG[1] + 0.2, DZ1 + 0.2)
# desk lamp
LB = (9.25, 0.5)
cyl(DI, LB[0], LB[1], DZ1, DZ1 + 0.06, 0.22, '#2b2f3a')
LH3 = (8.7, 1.3)
arm_pts = [P(LB[0], LB[1], DZ1 + 0.06), P(9.32, 0.62, 3.55), P(LH3[0] + 0.05, LH3[1] - 0.05, 3.86)]
poly(DI, arm_pts, None, (col('#2b2f3a'), 5), closed=False)
ell(DI, *arm_pts[1], 9, 9, col('#3d4352'))
ring_b = [(LH3[0] + 0.24 * math.cos(a), LH3[1] + 0.24 * math.sin(a), 3.5) for a in
          [2 * math.pi * i / 24 for i in range(24)]]
ring_t = [(LH3[0] + 0.08 * math.cos(a), LH3[1] + 0.08 * math.sin(a), 3.86) for a in
          [2 * math.pi * i / 24 for i in range(24)]]
desk_ring = [(LH3[0] - 0.1 + 0.85 * math.cos(a), LH3[1] + 0.15 + 0.85 * math.sin(a), DZ1 + 0.01) for a in
             [2 * math.pi * i / 24 for i in range(24)]]
lamp_cone = poly(DI, hull(ISO.Ps(ring_b + desk_ring)),
                 lin(P(LH3[0], LH3[1], 3.5), P(LH3[0], LH3[1] + 0.2, DZ1),
                     [(0, col('#ffe2ad', 0.28)), (1, col('#ffe2ad', 0.0))]), blend=14, name='lampCone')
ell(DI, *P(LH3[0], LH3[1], 3.42), 70, 52, rad((0, 0), 35, [(0, col('#ffd89a', 0.7)), (1, col('#ffd89a', 0))]),
    blend=14)
shade_pts = hull(ISO.Ps(ring_b + ring_t))
poly(DI, shade_pts, lin(P(LH3[0] - 0.24, LH3[1] + 0.24, 3.6), P(LH3[0] + 0.24, LH3[1] - 0.24, 3.6),
                        [(0, col('#4a5162')), (1, col('#1e222c'))]))
poly(DI, ISO.Ps([ring_b[i] for i in range(-3, 10)]), None, (col('#fff3d6', 0.9), 2.2), closed=False)
ell(DI, *P(LH3[0], LH3[1], 3.86), 10, 6, col('#3d4352'))

# ================================================================== synth on stand (left)
SY = D.add('Node', name='Synth')
for yy in (5.0, 7.4):
    poly(SY, ISO.Ps([(0.65, yy, 0.0), (1.4, yy, 1.98)]), None, (col('#2a2f3d'), 4), closed=False)
    poly(SY, ISO.Ps([(1.4, yy, 0.0), (0.65, yy, 1.98)]), None, (col('#3a4050'), 4), closed=False)
box(SY, 0.55, 1.5, 4.6, 7.8, 2.0, 2.22, '#d6503f', top='#2a2d38', left='#c4463a', right='#a83a31', edge=0.3)
sk = ISO.plane(SY, 'xy', (0, 0, 2.222))
rect(sk, 0.95, 4.72, 1.44, 7.68, col('#f6f4ef'))
nk = int((7.68 - 4.72) / 0.123)
rects(sk, [(0.95, 4.72 + i * 0.123 - 0.006, 1.44, 4.72 + i * 0.123 + 0.006) for i in range(1, nk + 1)],
      col('#c9c4ba'))
blacks = []
for i in range(nk):
    if i % 7 in (0, 1, 3, 4, 5):
        y0 = 4.72 + i * 0.123 + 0.085
        blacks.append((0.95, y0, 1.22, y0 + 0.07))
rects(sk, blacks, col('#1d1f26'))
synth_screen = rect(sk, 0.62, 4.8, 0.88, 5.55, col('#0d2a33'), r=0.03)
vu = []
for i in range(6):
    b = sk.add('Node', x=0.84, y=4.88 + i * 0.11)
    rect(b, -0.18, -0.03, 0.0, 0.03, col('#58f0ff'))
    vu.append(b)
for i in range(4):
    for j in range(2):
        ell(sk, 0.68 + j * 0.13, 5.8 + i * 0.4, 0.09, 0.09, col('#e6e1d8'), st=(col('#1d1f26'), 0.015))
for i in range(4):
    rect(sk, 0.66, 7.35 + i * 0.06 - 0.02, 0.86, 7.35 + i * 0.06 + 0.02, col('#3a3f4d'))

# ================================================================== person + chair
PR = D.add('Node', name='Person')
SKIN, SKIN_D = '#7a4a32', '#5e3825'
HOOD = '#e9805a'
PANTS = '#2f3d5c'
cx = 5.3


def limb(parent, pts3, w, c_, name=None):
    sh = parent.add('Shape', name=name)
    pp = sh.add('PointsPath', isClosed=False)
    vs = [pp.add('StraightVertex', x=P(*p)[0], y=P(*p)[1]) for p in pts3]
    stroke(sh, col(c_), w * S)
    sh.verts = vs
    return sh


CY = 3.62
for lx in (cx - 0.28, cx + 0.28):
    limb(PR, [(lx, 2.52, 1.62), (lx - 0.02, 2.4, 0.2)], 0.27, darken(PANTS, 0.1))
    box(PR, lx - 0.13, lx + 0.13, 2.08, 2.55, 0.0, 0.14, '#f2f1ee', edge=0.4)
    box(PR, lx - 0.13, lx + 0.13, 2.08, 2.55, 0.0, 0.03, '#c7c3bb', edge=0)
hub = (cx, CY, 0.22)
for i in range(5):
    a = math.pi / 2 + i * 2 * math.pi / 5
    tip = (cx + 0.78 * math.cos(a), CY + 0.78 * math.sin(a), 0.1)
    limb(PR, [hub, tip], 0.11, '#23273a')
    ell(PR, *P(*tip[:2], 0.05), 13, 10, col('#14161f'))
box(PR, cx - 0.06, cx + 0.06, CY - 0.06, CY + 0.06, 0.22, 1.28, '#a7adba', edge=0.4)
box(PR, cx - 0.74, cx + 0.74, 2.92, 4.3, 1.26, 1.52, '#2c3756', top='#3a4870', left='#2c3756',
    right='#1f2740', edge=0.3, radius=6)
for lx in (cx - 0.28, cx + 0.28):
    limb(PR, [(lx, 3.6, 1.7), (lx, 2.52, 1.7)], 0.36, PANTS)

# upper body pivots at the hips (lean, breathing)
hip = P(cx, 3.62, 1.62)
UP = PR.add('Node', name='upperBody', x=hip[0], y=hip[1])
UPI = UP.add('Node', x=-hip[0], y=-hip[1])
SHL, SHR = (cx + 0.5, 3.3, 2.98), (cx - 0.5, 3.3, 2.98)
ELB_L0, ELB_R0 = (cx + 0.66, 2.82, 2.5), (cx - 0.62, 2.82, 2.5)
HAND_L0, HAND_R0 = (cx + 0.36, 2.0, 2.6), (cx - 0.3, 2.0, 2.6)
arm_r = limb(UPI, [SHR, ELB_R0, HAND_R0], 0.3, darken(HOOD, 0.2), 'armR')
hand_r = UPI.add('Node', name='handR', x=P(*HAND_R0)[0], y=P(*HAND_R0)[1])
ell(hand_r, 0, 0, 15, 11, col(SKIN_D))
ell(hand_r, 4, -2, 6, 5, col(SKIN, 0.6))
arm_l = limb(UPI, [SHL, ELB_L0, HAND_L0], 0.31, HOOD, 'armL')
hand_l = UPI.add('Node', name='handL', x=P(*HAND_L0)[0], y=P(*HAND_L0)[1])
ell(hand_l, 0, 0, 15, 11, col(SKIN))
ell(hand_l, 4, -2, 6, 5, col('#8d5a3e'))
cyl(UPI, cx, 3.2, 2.95, 3.4, 0.15, SKIN_D, edge=0)
HEAD = (cx, 3.14, 3.74)
hc = P(*HEAD)
headN = UPI.add('Node', name='head', x=hc[0], y=hc[1])
look = headN.add('Node', name='headLook')
hr_ = 0.44 * S
ell(look, -hr_ * 0.95, hr_ * 0.18, 15, 24, col('#d9d4ca'))
ell(look, 0, 0, hr_ * 2, hr_ * 2.06, col(SKIN))
ell(look, 3, 5, hr_ * 1.7, hr_ * 1.85, col(SKIN_D, 0.3))
hair = [(hr_ * 1.03 * math.cos(a), hr_ * 1.06 * math.sin(a) - 1)
        for a in [math.pi * (0.9 + 1.2 * i / 32) for i in range(33)]]
hair += [(hr_ * 0.8, hr_ * 0.42), (hr_ * 0.2, hr_ * 0.72), (-hr_ * 0.5, hr_ * 0.6), (-hr_ * 0.92, hr_ * 0.32)]
poly(look, hair, lin((0, -hr_), (0, hr_), [(0, col('#2a201c')), (1, col('#161010'))]), radii=8)
for k in range(9):
    a = math.pi * (1.05 + 0.9 * k / 8)
    ell(look, hr_ * 0.8 * math.cos(a), hr_ * 0.75 * math.sin(a), 3, 3, col('#3a2c26', 0.8))
poly(look, [(-hr_ * 0.55, -hr_ * 0.62), (hr_ * 0.05, -hr_ * 0.92), (hr_ * 0.55, -hr_ * 0.72)], None,
     (col('#ffffff', 0.13), 3.5), closed=False)
ell(look, hr_ * 0.86, hr_ * 0.16, 10, 15, col(SKIN_D))
band_pts = [(math.cos(a) * hr_ * 1.07, -math.sin(a) * hr_ * 1.1 + 3) for a in [math.pi * i / 20 for i in range(21)]]
poly(look, band_pts, None, (col('#262b38'), 7), closed=False)
poly(look, band_pts[4:17], None, (col('#ffffff', 0.16), 2), closed=False)
cup = look.add('Node', x=hr_ * 0.97, y=hr_ * 0.14)
ell(cup, 3, 1, 22, 31, col('#2e6eb8'))
ell(cup, 0, 0, 19, 28, col('#f3efe7'))
ell(cup, 0, 0, 10, 15, col('#d9d4ca'))
TOR = UPI.add('Node', name='torso')
wy, sy_, ZT, ZW = 3.62, 3.3, 3.12, 1.6
back = [(cx - 0.5, wy + 0.26, ZW), (cx + 0.5, wy + 0.26, ZW), (cx + 0.6, sy_ + 0.26, ZT),
        (cx - 0.6, sy_ + 0.26, ZT)]
side = [(cx + 0.5, wy + 0.26, ZW), (cx + 0.5, wy - 0.26, ZW), (cx + 0.6, sy_ - 0.26, ZT),
        (cx + 0.6, sy_ + 0.26, ZT)]
top = [(cx - 0.6, sy_ + 0.26, ZT), (cx + 0.6, sy_ + 0.26, ZT), (cx + 0.6, sy_ - 0.26, ZT),
       (cx - 0.6, sy_ - 0.26, ZT)]
sil = [back[0], back[1], side[1], side[2], top[2], top[3]]
poly(TOR, ISO.Ps(sil), col(darken(HOOD, 0.25)), radii=[4, 4, 4, 16, 16, 16])
poly(TOR, ISO.Ps(side), col(darken(HOOD, 0.16)), radii=[3, 3, 14, 3])
poly(TOR, ISO.Ps(back), lin(P(*back[3]), P(*back[0]), [(0, col(lighten(HOOD, 0.04))), (1, col(darken(HOOD, 0.14)))]),
     radii=[3, 3, 16, 16])
poly(TOR, ISO.Ps(top), col(lighten(HOOD, 0.12)), radii=[16, 16, 16, 16])
# fabric folds on the back
for k, zz in enumerate((2.2, 2.55)):
    poly(TOR, ISO.Ps([(cx - 0.3 + 0.1 * k, wy + 0.27 - (zz - ZW) * 0.19, zz),
                      (cx + 0.15 + 0.1 * k, wy + 0.27 - (zz + 0.1 - ZW) * 0.19, zz + 0.1)]), None,
         (col(darken(HOOD, 0.22), 0.6), 2.2), closed=False)
hd = ISO.plane(TOR, 'xz', (cx, sy_ + 0.27, ZT + 0.04))
rect(hd, -0.33, 0.0, 0.33, 0.46, col(darken(HOOD, 0.08)), r=0.22)
rect(hd, -0.24, 0.04, 0.24, 0.36, col(darken(HOOD, 0.24)), r=0.17)
box(PR, cx - 0.06, cx + 0.06, 4.08, 4.2, 1.5, 1.9, '#1f2740', edge=0.2)
box(PR, cx - 0.62, cx + 0.62, 4.04, 4.24, 1.86, 2.78, '#2c3756', top='#3d4b74', left='#2f3b5e',
    right='#1f2740', edge=0.35, radius=8)
cb = ISO.plane(PR, 'xz', (cx, 4.245, 2.32))
rect(cb, -0.47, -0.34, 0.47, 0.34, None, r=0.12, st=(col('#ffffff', 0.08), 0.03))

# ================================================================== cat (curled on the rug)
CAT = D.add('Node', name='Cat')
floor_shadow(CAT, 7.15, 6.85, 0.95, 0.6, 0.42, z=0.013)
cc_ = P(7.1, 6.8, 0.0)
cat = CAT.add('Node', x=cc_[0], y=cc_[1])
FUR, FUR_L, FUR_D, WHITE = '#3b3f4c', '#525868', '#2a2d38', '#f2efe9'
# body breathes from its base
catb = cat.add('Node', name='catBody', x=4, y=0)
body = [(-50, -6), (-46, -26), (-28, -42), (0, -48), (28, -44), (48, -30), (56, -12), (50, 0), (20, 4),
        (-20, 4), (-44, 2)]
poly(catb, body, rad((-6, -40), 70, [(0, col(FUR_L)), (0.6, col(FUR)), (1, col(FUR_D))]), radii=14)
ell(catb, 24, -18, 54, 40, rad((16, -30), 30, [(0, col(FUR_L)), (1, col(FUR))]))
poly(catb, [(-10, -44), (14, -46), (34, -40)], None, (col('#ffffff', 0.12), 3), closed=False)
# tail wraps round the front; vertices animate
tailS = cat.add('Shape', name='catTail')
tp = tailS.add('PointsPath', isClosed=False)
TAIL0 = [(50, -6), (46, 4), (30, 10), (6, 12), (-18, 10), (-36, 6)]
tail_v = [tp.add('StraightVertex', x=x, y=y, radius=10) for x, y in TAIL0]
stroke(tailS, col(FUR), 10)
tipS = cat.add('Shape', name='catTailTip')
tpp = tipS.add('PointsPath', isClosed=False)
tip_v = [tpp.add('StraightVertex', x=x, y=y) for x, y in TAIL0[-2:]]
stroke(tipS, col(WHITE), 10)
# tucked front paws
ell(cat, -40, 0, 16, 9, col(WHITE))
ell(cat, -27, 3, 16, 9, col(WHITE))
# head
catHead = cat.add('Node', name='catHead', x=-40, y=-16)
ch = catHead.add('Node', name='catHeadTurn')
earL = ch.add('Node', name='catEarL', x=-11, y=-13)
poly(earL, [(-8, 2), (-4, -16), (7, -1)], col(FUR), radii=[1, 2, 1])
poly(earL, [(-4, 0), (-3, -10), (3, -1)], col('#e79aa6'))
earR = ch.add('Node', name='catEarR', x=9, y=-15)
poly(earR, [(-7, 1), (5, -16), (8, 3)], col(FUR), radii=[1, 2, 1])
poly(earR, [(-3, 0), (4, -10), (5, 1)], col('#e79aa6'))
ell(ch, 0, 0, 38, 32, rad((-4, -8), 22, [(0, col(FUR_L)), (1, col(FUR))]))
ell(ch, -12, 6, 14, 12, col(FUR))
ell(ch, 12, 6, 14, 12, col(FUR))
ell(ch, 1, 8, 20, 14, col(WHITE))
poly(ch, [(-2, 3), (3, 3), (0.5, 6)], col('#e57d8c'))
mouth = ch.add('Node', name='catMouth', x=0.5, y=10, scaleY=0.0)
ell(mouth, 0, 0, 7, 8, col('#b8475c'))
eyes = []
for ex in (-8, 9):
    poly(ch, [(ex - 4, -2), (ex, 0), (ex + 4, -2)], None, (col('#14161f'), 1.6), closed=False)
    e = ch.add('Node', x=ex, y=-2, scaleY=0.08)
    ell(e, 0, 0, 9, 8, col('#e8c25a'))
    ell(e, 0, 0, 2.4, 7, col('#14161f'))
    ell(e, 1.6, -1.6, 2, 2, col('#ffffff', 0.9))
    eyes.append(e)
for side_ in (-1, 1):
    for k in range(3):
        poly(ch, [(side_ * 7, 6 + k * 2), (side_ * (19 + k), 4 + k * 4)], None, (col('#ffffff', 0.55), 0.8),
             closed=False)

# ================================================================== steam
STEAM = DI.add('Node', name='Steam')
mug_top = P(MUG[0], MUG[1], DZ1 + 0.42)
puffs = []
for i in range(3):
    n = STEAM.add('Node', x=mug_top[0] + (i - 1) * 5, y=mug_top[1])
    pts = [(math.sin(k * 0.9 + i * 1.7) * 4, -k * 5) for k in range(7)]
    poly(n, pts, None, (col('#ffffff', 0.75), 3.2), closed=False)
    puffs.append(n)

# ================================================================== light beam + dust
BEAM = D.add('Node', name='Beam')
wpts = ISO.Ps([(WX0, 0, WZ1), (WX1, 0, WZ1), (WX1, 0, WZ0), (WX0, 0, WZ0)])
fpts = [P(*floor_hit(x, z), 0) for x, z in ((WX0, WZ0), (WX1, WZ0), (WX1, WZ1), (WX0, WZ1))]
hpts = hull(wpts + fpts)
beam = poly(BEAM, hpts, lin(P(7, 0, 5), P(5, 6, 0), [(0, col('#fff0d0', 0.2)), (1, col('#fff0d0', 0.0))]),
            blend=14, name='beam')
motes = []
for i in range(16):
    wx = random.uniform(WX0, WX1)
    z_ = random.uniform(1.0, 6.0)
    t = random.uniform(0.15, 0.85) * (z_ / 0.75)
    x3, y3 = wx - 0.25 * t, t
    z3 = z_ - 0.75 * t + random.uniform(0.0, 1.2)
    px, py = P(x3, y3, max(z3, 0.6))
    r_ = random.uniform(1.4, 3.2)
    m = BEAM.add('Node', x=px, y=py)
    ell(m, 0, 0, r_ * 2, r_ * 2, col('#fff6e0', 0.85))
    motes.append((m, px, py))

# ================================================================== animation
# Timeline (frames @60fps, 720 = 12 s). Frame 0 is the poster: code written, page built.
#   36-58 code + preview reset       80-230 typing        236/246 compile #1, buttons pop
#  250-344 sip of coffee             345-470 typing       476/486 compile #2, cards slide in
#  490-556 mouse: clicks the CTA     570-655 typing       662/672 compile #3, new image + toast
#  664-712 lean back and stretch     712-720 hands back on the keys
track(D, 'y', [(0, 0, EASE), (T // 2, -10, EASE), (T, 0)])
track(gs, 'scaleX', [(0, 1, EASE), (T // 2, 0.94, EASE), (T, 1)])
track(gs, 'scaleY', [(0, 1, EASE), (T // 2, 0.94, EASE), (T, 1)])

track(sc, 'rotation', [(0, 0), (T, 4 * math.pi)])
for g in bulb_glows:
    osc(g, 'opacity', 0.78, 0.22, 240, random.random(), step=15)
neon_kf = [(0, 1, 0), (302, 0.35, 0), (306, 1, 0), (311, 0.5, 0), (314, 1, 0), (612, 0.4, 0), (616, 1, 0), (T, 1)]
track(neon, 'opacity', neon_kf)
track(neon_glow, 'opacity', neon_kf)
for i, n in enumerate(leaves_big):
    osc(n, 'rotation', n.props['rotation'], 0.035, 240, i * 0.13, step=15)
for i, v in enumerate(vines):
    osc(v, 'rotation', 0, 0.05, 240, 0.3 + i * 0.2, step=15)
for k, f_ in enumerate(fans):
    track(f_, 'rotation', [(0, 0), (T, (10 + 2 * k) * 2 * math.pi)])
osc(lamp_pool, 'opacity', 0.9, 0.1, 360, 0.0, step=30)
osc(beam, 'opacity', 0.85, 0.15, 360, 0.25, step=30)
osc(light_floor, 'opacity', 0.9, 0.1, 360, 0.25, step=30)
for (m, px, py) in motes:
    ph, ph2 = random.random(), random.random()
    osc(m, 'x', px, random.uniform(6, 16), T, ph, step=24)
    osc(m, 'y', py, random.uniform(8, 20), T // 2, ph2, step=24)
    osc(m, 'opacity', 0.55, 0.45, T // 3, random.random(), step=20)

# music: 90 bpm = 40 frames
BEAT = 40
kf = []
for b_ in range(0, T, BEAT):
    kf += [(b_, 1.0, OUT), (b_ + 4, 1.08, EASE)]
kf.append((T, 1.0))
track(woofer, 'scaleX', kf)
track(woofer, 'scaleY', kf)
for i, b in enumerate(vu):
    kfv = [(b_, random.uniform(0.25, 1.0)) for b_ in range(0, T, BEAT // 2)]
    kfv.append((T, kfv[0][1]))
    track(b, 'scaleX', kfv)

# ------------------------------------------------------------------ code + preview
BURSTS = [(80, 230), (345, 470), (570, 655)]
lines = [l for l in code_lines if l is not None]
groups = [lines[0:4], lines[4:8], lines[8:]]
cursor_kx, cursor_ky = [], []
for (b0, b1), grp in zip(BURSTS, groups):
    total_len = sum(l[1] for l in grp)
    t = b0
    for (ln, length, v, u0) in grp:
        dur = (b1 - b0) * length / total_len
        s0, s1 = int(t), int(t + dur) - 3
        track(ln, 'scaleX', [(0, 1.0, 0), (61, 0.0, 0), (s0, 0.0), (s1, 1.0, 0), (T, 1.0)])
        cursor_kx += [(s0, u0, 1), (s1, u0 + length + 0.02, 0)]
        cursor_ky += [(s0, v, 0)]
        t += dur
last_x, last_y = cursor_kx[-1][1], cursor_ky[-1][1]
cursor_kx = [(0, last_x, 0), (61, 0.17, 0)] + cursor_kx + [(T, last_x)]
cursor_ky = [(0, last_y, 0), (61, V0, 0)] + cursor_ky + [(T, last_y)]
track(cursor, 'x', cursor_kx)
track(cursor, 'y', cursor_ky)
track(codeg, 'opacity', [(0, 1.0), (36, 1.0), (58, 0.0, 0), (62, 1.0, 0), (T, 1.0)])
track(cursor_blink, 'opacity', [(f, 1.0 if (f // 30) % 2 == 0 else 0.0, 0) for f in range(0, T, 30)] + [(T, 1.0)])

RESET = [(0, 1.0), (40, 1.0), (56, 0.0, 0)]
track(btns, 'opacity', RESET + [(248, 0.0), (254, 1.0), (T, 1.0)])
track(btns, 'scaleX', [(0, 1.0, 0), (60, 0.6, 0), (248, 0.6, OUT), (258, 1.08, EASE), (266, 1.0), (T, 1.0)])
track(btns, 'scaleY', [(0, 1.0, 0), (60, 0.6, 0), (248, 0.6, OUT), (258, 1.08, EASE), (266, 1.0), (T, 1.0)])
track(cards, 'opacity', RESET + [(488, 0.0), (504, 1.0), (T, 1.0)])
track(cards, 'y', [(0, 0.0, 0), (60, 0.1, 0), (488, 0.1, OUT), (506, 0.0), (T, 0.0)])
track(img2, 'opacity', RESET + [(674, 0.0), (688, 1.0), (T, 1.0)])
track(toast, 'opacity', [(0, 0.0, 0), (674, 0.0), (680, 1.0), (704, 1.0), (714, 0.0), (T, 0.0)])
track(toast, 'y', [(0, 1.46, 0), (674, 1.56, OUT), (682, 1.46), (T, 1.46)])
for i, n in enumerate(term_lines):
    if i < 3:
        continue
    on = {3: 236, 4: 246, 5: 476, 6: 486, 7: 662, 8: 672}[i]
    track(n, 'opacity', RESET + [(on, 0.0, 0), (on + 1, 1.0), (T, 1.0)])
track(ptr, 'opacity', [(0, 0.0, 0), (494, 0.0), (500, 1.0), (552, 1.0), (560, 0.0, 0), (T, 0.0)])
track(ptr, 'x', [(0, 1.25, 0), (494, 1.25, EASE), (518, 0.3, EASE), (534, 0.3, EASE), (550, 0.95), (T, 1.25)])
track(ptr, 'y', [(0, 1.25, 0), (494, 1.25, EASE), (518, 0.97, EASE), (534, 0.97, EASE), (550, 0.72), (T, 1.25)])
track(ptr, 'scaleX', [(0, 1.0, 0), (524, 1.0), (527, 0.8), (531, 1.0), (T, 1.0)])
track(ptr, 'scaleY', [(0, 1.0, 0), (524, 1.0), (527, 0.8), (531, 1.0), (T, 1.0)])
track(cta_press, 'opacity', [(0, 0.0, 0), (525, 0.0), (528, 0.3), (540, 0.0, 0), (T, 0.0)])

# ------------------------------------------------------------------ person
def hand_events(hand0, side):
    ev = []
    lo, hi = (4.45, 5.3) if side == 'R' else (5.3, 6.15)
    for (b0, b1) in BURSTS:
        f = b0 + (0 if side == 'R' else 5)
        ev.append((f - 8, hand0, None))
        while f < b1 - 10:
            x = random.uniform(lo, hi)
            yk = random.uniform(1.86, 2.12)
            up, dn = (x, yk, 2.63), (x, yk, 2.535)
            ev += [(f, up, None), (f + 4, dn, None), (f + 8, up, None)]
            f += random.choice((9, 10, 11, 12, 12, 14, 16, 22))
        ev.append((b1 + 4, hand0, None))
    return ev


ev_l = hand_events(HAND_L0, 'L')
ev_r = hand_events(HAND_R0, 'R')
# sip of coffee (left hand)
MOUTH = (cx + 0.32, 2.72, 3.4)
ELB_SIP = (cx + 0.78, 2.98, 2.72)
ev_l += [(250, HAND_L0, None), (268, MUG_GRIP, (6.62, 2.78, 2.56)), (276, MUG_GRIP, (6.62, 2.78, 2.56)),
         (300, MOUTH, ELB_SIP), (314, (MOUTH[0] - 0.02, MOUTH[1] + 0.02, MOUTH[2] + 0.06), ELB_SIP),
         (326, MUG_GRIP, (6.62, 2.78, 2.56)), (332, MUG_GRIP, (6.62, 2.78, 2.56)), (344, HAND_L0, None)]
# mouse (right hand)
ELB_M = (cx - 0.95, 2.95, 2.42)
ev_r += [(490, HAND_R0, None), (506, (3.75, 2.08, 2.56), ELB_M), (518, (3.65, 2.16, 2.56), ELB_M),
         (524, (3.65, 2.16, 2.56), ELB_M), (527, (3.65, 2.16, 2.52), ELB_M), (531, (3.65, 2.16, 2.56), ELB_M),
         (546, (3.85, 2.02, 2.56), ELB_M), (556, HAND_R0, None)]
# stretch (both hands up)
for ev, hand0, up, elb in ((ev_l, HAND_L0, (cx + 0.2, 3.42, 4.72), (cx + 0.78, 3.36, 4.0)),
                           (ev_r, HAND_R0, (cx - 0.16, 3.42, 4.72), (cx - 0.74, 3.36, 4.0))):
    ev += [(664, hand0, None), (684, up, elb), (696, (up[0], up[1], up[2] + 0.1), elb),
           (710, hand0, None)]


def finish(ev, hand0):
    ev = sorted(ev, key=lambda e: e[0])
    out = [(0, hand0, None)]
    for e in ev:
        if e[0] <= out[-1][0]:
            continue
        out.append(e)
    out.append((T, hand0, None))
    return out


ev_l, ev_r = finish(ev_l, HAND_L0), finish(ev_r, HAND_R0)


def arm_tracks(arm, handN, ev, elb0, hand0):
    hx, hy, ex, ey = [], [], [], []
    for f, p, e in ev:
        if e is None:
            d = tuple(p[i] - hand0[i] for i in range(3))
            e = (elb0[0] + d[0] * 0.45, elb0[1] + d[1] * 0.35, elb0[2] + d[2] * 0.5)
        sp, se = P(*p), P(*e)
        it = 1 if any(b0 <= f <= b1 for b0, b1 in BURSTS) else EASE
        hx.append((f, sp[0], it)); hy.append((f, sp[1], it))
        ex.append((f, se[0], it)); ey.append((f, se[1], it))
    track(arm.verts[2], 'x', hx); track(arm.verts[2], 'y', hy)
    track(handN, 'x', hx); track(handN, 'y', hy)
    track(arm.verts[1], 'x', ex); track(arm.verts[1], 'y', ey)


arm_tracks(arm_l, hand_l, ev_l, ELB_L0, HAND_L0)
arm_tracks(arm_r, hand_r, ev_r, ELB_R0, HAND_R0)

# mug follows the hand during the sip
g0 = P(*MUG_GRIP)
def mug_at(p):
    s_ = P(*p)
    return (mug_c[0] + s_[0] - g0[0], mug_c[1] + s_[1] - g0[1])
m1 = mug_at(MOUTH)
m2 = mug_at((MOUTH[0] - 0.02, MOUTH[1] + 0.02, MOUTH[2] + 0.06))
track(mugN, 'x', [(0, mug_c[0], 0), (276, mug_c[0], EASE), (300, m1[0], EASE), (314, m2[0], EASE),
                  (326, mug_c[0], 0), (T, mug_c[0])])
track(mugN, 'y', [(0, mug_c[1], 0), (276, mug_c[1], EASE), (300, m1[1], EASE), (314, m2[1], EASE),
                  (326, mug_c[1], 0), (T, mug_c[1])])
track(mugN, 'rotation', [(0, 0.0, 0), (280, 0.0, EASE), (300, -0.45, EASE), (314, -0.7, EASE), (326, 0.0, 0),
                         (T, 0.0)])
track(STEAM, 'opacity', [(0, 1.0), (262, 1.0), (272, 0.0, 0), (330, 0.0), (360, 1.0), (T, 1.0)])
track(mouse, 'x', [(0, 3.75, 0), (506, 3.75, EASE), (518, 3.65, EASE), (531, 3.65, EASE), (546, 3.85, EASE),
                   (556, 3.75, 0), (T, 3.75)])
track(mouse, 'y', [(0, 1.98, 0), (506, 1.98, EASE), (518, 2.06, EASE), (531, 2.06, EASE), (546, 1.92, EASE),
                   (556, 1.98, 0), (T, 1.98)])

# head: nod to the beat; looks, sips and stretches
kf = []
for b_ in range(0, T, BEAT):
    kf += [(b_, hc[1], EASE), (b_ + 12, hc[1] + 2.4, EASE)]
kf.append((T, hc[1]))
track(headN, 'y', kf)
track(look, 'x', [(0, 0, EASE), (150, 0, EASE), (162, 3, EASE), (186, 3, EASE), (196, 0, EASE),
                  (410, 0, EASE), (420, 2.5, EASE), (440, 2.5, EASE), (450, 0, EASE),
                  (494, 0, EASE), (510, 4, EASE), (552, 4, EASE), (566, 0, EASE), (T, 0)])
track(look, 'rotation', [(0, 0, EASE), (150, 0, EASE), (162, 0.05, EASE), (186, 0.05, EASE), (196, 0, EASE),
                         (284, 0, EASE), (300, -0.1, EASE), (316, -0.12, EASE), (330, 0, EASE),
                         (494, 0, EASE), (510, 0.07, EASE), (552, 0.07, EASE), (566, 0, EASE),
                         (668, 0, EASE), (688, -0.14, EASE), (700, -0.16, EASE), (712, 0, EASE), (T, 0)])
track(look, 'y', [(0, 0, EASE), (668, 0, EASE), (688, -2, EASE), (712, 0, EASE), (T, 0)])
# lean in while typing, back for the sip and the stretch
lean = [(0, 0.0, EASE)]
for (b0, b1) in BURSTS:
    lean += [(b0 - 6, 0.0, EASE), (b0 + 14, 0.018, EASE), (b1 - 4, 0.018, EASE), (b1 + 10, 0.0, EASE)]
lean += [(284, 0.0, EASE), (300, -0.025, EASE), (318, -0.025, EASE), (334, 0.0, EASE)]
lean += [(666, 0.0, EASE), (688, -0.075, EASE), (702, -0.08, EASE), (716, 0.0, EASE), (T, 0.0)]
lean.sort(key=lambda k: k[0])
track(UP, 'rotation', lean)
track(UP, 'scaleY', sampled(lambda f: 1 + 0.012 * (0.5 - 0.5 * math.cos(2 * math.pi * f / 240)), 12))
track(UP, 'scaleX', sampled(lambda f: 1 + 0.006 * (0.5 - 0.5 * math.cos(2 * math.pi * f / 240)), 12))

# steam
for i, n in enumerate(puffs):
    def fy(f, i=i):
        t = ((f / 240) + i / 3) % 1
        return mug_top[1] - 4 - t * 34
    def fx(f, i=i):
        t = ((f / 240) + i / 3) % 1
        return mug_top[0] + (i - 1) * 5 + math.sin(t * 4 + i) * 3
    def fo(f, i=i):
        t = ((f / 240) + i / 3) % 1
        return math.sin(math.pi * t) ** 1.2 * 0.85
    def fs(f, i=i):
        t = ((f / 240) + i / 3) % 1
        return 0.7 + t * 0.6
    track(n, 'y', sampled(fy, 8))
    track(n, 'x', sampled(fx, 8))
    track(n, 'opacity', sampled(fo, 8))
    track(n, 'scaleY', sampled(fs, 8))

# ------------------------------------------------------------------ cat
# sleeps, twitches an ear, wakes and watches the coder, blinks, yawns, settles back down
track(catb, 'scaleY', sampled(lambda f: 1 + 0.05 * (0.5 - 0.5 * math.cos(2 * math.pi * f / 180)), 10))
track(catb, 'scaleX', sampled(lambda f: 1 + 0.015 * (0.5 - 0.5 * math.cos(2 * math.pi * f / 180)), 10))
track(catHead, 'y', [(0, -16, EASE), (190, -16, EASE), (222, -30, EASE), (430, -30, EASE), (468, -16, EASE), (T, -16)])
track(catHead, 'x', [(0, -40, EASE), (190, -40, EASE), (222, -36, EASE), (430, -36, EASE), (468, -40, EASE),
                     (T, -40)])
track(ch, 'rotation', [(0, 0, EASE), (190, 0, EASE), (226, 0.22, EASE), (300, 0.24, EASE), (328, 0.1, EASE),
                       (346, -0.12, EASE), (372, 0.18, EASE), (392, 0.3, EASE), (420, 0.22, EASE),
                       (466, 0, EASE), (T, 0)])
eye_kf = [(0, 0.08, 0), (226, 0.08, EASE), (240, 1.0, EASE), (296, 1.0, EASE), (304, 0.08, EASE),
          (314, 1.0, EASE), (330, 1.0, EASE), (336, 0.3, EASE), (366, 0.3, EASE), (374, 1.0, EASE),
          (420, 1.0, EASE), (432, 0.5, EASE), (446, 0.5, EASE), (456, 0.08, 0), (T, 0.08)]
for e in eyes:
    track(e, 'scaleY', eye_kf)
track(mouth, 'scaleY', [(0, 0.0, 0), (334, 0.0, EASE), (346, 1.0, EASE), (360, 1.0, EASE), (372, 0.0, 0),
                        (T, 0.0)])
track(earL, 'rotation', [(0, 0, 0), (118, 0, OUT), (122, -0.45, EASE), (132, 0, EASE), (138, -0.3, EASE),
                         (146, 0, 0), (588, 0, OUT), (592, -0.4, EASE), (604, 0, 0), (T, 0)])
track(earR, 'rotation', [(0, 0, 0), (232, 0, EASE), (240, 0.25, EASE), (380, 0.25, EASE), (388, -0.1, EASE),
                         (400, 0.15, EASE), (466, 0, 0), (T, 0)])


def tail_xy(f, k):
    """Slow sway of the tail end, plus a flick when the cat is awake."""
    w = k / (len(TAIL0) - 1)
    amp = 3.5 * w * w
    flick = 0.0
    if 280 <= f <= 340:
        flick = 9 * w * w * math.sin(math.pi * (f - 280) / 60) * math.sin(2 * math.pi * (f - 280) / 20)
    if 620 <= f <= 650:
        flick = 6 * w * w * math.sin(math.pi * (f - 620) / 30) * math.sin(2 * math.pi * (f - 620) / 15)
    dx = (amp * math.sin(2 * math.pi * f / 240 + k * 0.6)) + flick
    dy = -abs(flick) * 0.6 - w * 2.5 * (0.5 - 0.5 * math.cos(2 * math.pi * f / 240))
    return TAIL0[k][0] + dx, TAIL0[k][1] + dy


for k in range(2, len(TAIL0)):
    track(tail_v[k], 'x', sampled(lambda f, k=k: tail_xy(f, k)[0], 5))
    track(tail_v[k], 'y', sampled(lambda f, k=k: tail_xy(f, k)[1], 5))
for j, k in enumerate((len(TAIL0) - 2, len(TAIL0) - 1)):
    track(tip_v[j], 'x', sampled(lambda f, k=k: tail_xy(f, k)[0], 5))
    track(tip_v[j], 'y', sampled(lambda f, k=k: tail_xy(f, k)[1], 5))

out = sys.argv[1] if len(sys.argv) > 1 else 'office.riv'
print(write_file(out, [ab]), 'bytes')
