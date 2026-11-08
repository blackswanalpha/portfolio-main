"""Isometric drawing helpers on top of riv.py."""
import math
from riv import N

C = math.cos(math.pi / 6)


def col(h, a=1.0):
    h = h.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (int(round(a * 255)) << 24) | (r << 16) | (g << 8) | b


def rgb(h):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def hexs(c):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(v)))) for v in c)


def mix(h1, h2, t):
    a, b = rgb(h1), rgb(h2)
    return hexs([a[i] + (b[i] - a[i]) * t for i in range(3)])


def lighten(h, t):
    return mix(h, '#ffffff', t)


def darken(h, t):
    return mix(h, '#000000', t)


def decompose(a, b, c, d):
    """M=[[a,b],[c,d]] (x'=ax+by, y'=cx+dy) -> rot(phi)*scale(sx,sy)*rot(theta)."""
    E, F, G, H = (a + d) / 2, (a - d) / 2, (c + b) / 2, (c - b) / 2
    Q, R = math.hypot(E, H), math.hypot(F, G)
    sx, sy = Q + R, Q - R
    a1, a2 = math.atan2(G, F), math.atan2(H, E)
    theta, phi = (a2 - a1) / 2, (a2 + a1) / 2
    # verify
    def rot(t):
        return [[math.cos(t), -math.sin(t)], [math.sin(t), math.cos(t)]]
    def mul(A, B):
        return [[sum(A[i][k] * B[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    M = mul(mul(rot(phi), [[sx, 0], [0, sy]]), rot(theta))
    assert all(abs(M[i][j] - [[a, b], [c, d]][i][j]) < 1e-6 for i in range(2) for j in range(2)), M
    return phi, sx, sy, theta


class Iso:
    def __init__(self, ox, oy, s):
        self.ox, self.oy, self.s = ox, oy, s
        S = s
        bases = {
            'xz': ((C * S, 0.5 * S), (0, S)),      # u=+x, v=-z
            'yz': ((C * S, -0.5 * S), (0, S)),     # u=-y, v=-z
            'xy': ((C * S, 0.5 * S), (-C * S, 0.5 * S)),  # u=+x, v=+y
        }
        self.dec = {k: decompose(U[0], V[0], U[1], V[1]) for k, (U, V) in bases.items()}

    def P(self, x, y, z=0.0):
        return (self.ox + (x - y) * C * self.s, self.oy + (x + y) * 0.5 * self.s - z * self.s)

    def Ps(self, pts):
        return [self.P(*p) for p in pts]

    def plane(self, parent, kind, o3, name=None):
        phi, sx, sy, th = self.dec[kind]
        x, y = self.P(*o3)
        outer = parent.add('Node', name=name, x=x, y=y, rotation=phi, scaleX=sx, scaleY=sy)
        return outer.add('Node', rotation=th)


# ---------------------------------------------------------------- paints

def fill(shape, spec, rule=None):
    f = shape.add('Fill', fillRule=rule)
    _paint(f, spec)
    return f


def stroke(shape, spec, w, cap=1, join=1):
    st = shape.add('Stroke', thickness=w, cap=cap, join=join)
    _paint(st, spec)
    return st


def _paint(p, spec):
    if isinstance(spec, int):
        p.add('SolidColor', colorValue=spec)
    elif spec[0] == 'lin':
        _, x1, y1, x2, y2, stops = spec
        g = p.add('LinearGradient', startX=x1, startY=y1, endX=x2, endY=y2)
        for pos, c in stops:
            g.add('GradientStop', colorValue=c, position=pos)
    elif spec[0] == 'rad':
        _, cx, cy, r, stops = spec
        g = p.add('RadialGradient', startX=cx, startY=cy, endX=cx + r, endY=cy)
        for pos, c in stops:
            g.add('GradientStop', colorValue=c, position=pos)


def lin(p1, p2, stops):
    return ('lin', p1[0], p1[1], p2[0], p2[1], stops)


def rad(c, r, stops):
    return ('rad', c[0], c[1], r, stops)


# ---------------------------------------------------------------- shapes

def poly(parent, pts, f=None, st=None, closed=True, radii=None, name=None, blend=None,
         opacity=None, rule=None):
    sh = parent.add('Shape', name=name, blendModeValue=blend, opacity=opacity)
    pp = sh.add('PointsPath', isClosed=closed)
    verts = []
    for i, (x, y) in enumerate(pts):
        r = None
        if radii is not None:
            r = radii[i] if isinstance(radii, (list, tuple)) else radii
        verts.append(pp.add('StraightVertex', x=x, y=y, radius=r))
    if f is not None:
        fill(sh, f, rule)
    if st is not None:
        stroke(sh, *st)
    sh.verts = verts
    return sh


def polys(parent, list_pts, f, rule=1, name=None, blend=None, opacity=None):
    sh = parent.add('Shape', name=name, blendModeValue=blend, opacity=opacity)
    for pts in list_pts:
        pp = sh.add('PointsPath', isClosed=True)
        for (x, y) in pts:
            pp.add('StraightVertex', x=x, y=y)
    fill(sh, f, rule)
    return sh


def rect(parent, u0, v0, u1, v1, f=None, r=None, st=None, name=None, blend=None, opacity=None):
    sh = parent.add('Shape', name=name, x=(u0 + u1) / 2, y=(v0 + v1) / 2,
                    blendModeValue=blend, opacity=opacity)
    sh.add('Rectangle', width=abs(u1 - u0), height=abs(v1 - v0), cornerRadiusTL=r)
    if f is not None:
        fill(sh, f)
    if st is not None:
        stroke(sh, *st)
    return sh


def rects(parent, list_r, f, name=None, r=None):
    """Many rectangles (u0,v0,u1,v1) under one Shape/paint."""
    sh = parent.add('Shape', name=name)
    for (u0, v0, u1, v1) in list_r:
        # Rectangle paths are centred on their own origin, so wrap each in a Node-less path
        # by using PointsPath corners instead (one shape, one paint).
        pp = sh.add('PointsPath', isClosed=True)
        for (x, y) in ((u0, v0), (u1, v0), (u1, v1), (u0, v1)):
            pp.add('StraightVertex', x=x, y=y)
    fill(sh, f)
    return sh


def ell(parent, cx, cy, w, h, f=None, st=None, name=None, blend=None, opacity=None):
    sh = parent.add('Shape', name=name, x=cx, y=cy, blendModeValue=blend, opacity=opacity)
    sh.add('Ellipse', width=w, height=h)
    if f is not None:
        fill(sh, f)
    if st is not None:
        stroke(sh, *st)
    return sh


def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        return pts
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]
