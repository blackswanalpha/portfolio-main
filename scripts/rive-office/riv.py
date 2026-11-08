"""Minimal Rive (.riv v7) binary writer driven by runtime-generated defs.

Scene is built as a tree in painter's order (later children draw on top).
Serialization emits children in reverse, because the Rive runtime draws the
first emitted drawable on top.
"""
import json, os, struct

DEFS = json.load(open(os.path.join(os.path.dirname(__file__), 'defs.json')))
_CACHE = {}


def _resolve(type_name):
    if type_name in _CACHE:
        return _CACHE[type_name]
    t = DEFS[type_name]
    props = {}
    name = type_name
    while name in DEFS:
        d = DEFS[name]
        for p, k in d['props'].items():
            props.setdefault(p, (k, d['ptypes'][p]))
        name = d['super']
    _CACHE[type_name] = (t['typeKey'], props)
    return _CACHE[type_name]


def varuint(n):
    out = bytearray()
    n = int(n)
    while True:
        b = n & 0x7F
        n >>= 7
        if n:
            out.append(b | 0x80)
        else:
            out.append(b)
            return bytes(out)


def enc(ftype, v):
    if ftype in ('Uint', 'Id'):
        return varuint(v)
    if ftype == 'Double':
        return struct.pack('<f', float(v))
    if ftype == 'Color':
        return struct.pack('<I', int(v) & 0xFFFFFFFF)
    if ftype == 'Bool':
        return bytes([1 if v else 0])
    if ftype == 'String':
        b = v.encode('utf-8')
        return varuint(len(b)) + b
    raise ValueError(ftype)


def obj_bytes(type_name, props):
    key, table = _resolve(type_name)
    out = bytearray(varuint(key))
    for p, v in props.items():
        if v is None:
            continue
        pk, ft = table[p]
        out += varuint(pk) + enc(ft, v)
    out += varuint(0)
    return bytes(out)


def prop_key(type_name, prop):
    return _resolve(type_name)[1][prop][0]


class N:
    """A node in the artboard tree."""

    def __init__(self, type_name, props, keep_order=False):
        self.type, self.props, self.children, self.idx = type_name, props, [], None
        self.keep_order = keep_order

    def add(self, type_name, **props):
        n = N(type_name, props)
        self.children.append(n)
        return n


class Artboard(N):
    def __init__(self, name, w, h):
        super().__init__('Artboard', {'name': name, 'width': w, 'height': h, 'clip': True})
        self.free = []   # slot-claiming objects without parent (interpolators)
        self.anims = []

    def interpolator(self, x1, y1, x2, y2):
        n = N('CubicEaseInterpolator', {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2})
        self.free.append(n)
        return n

    def anim(self, name, fps, duration, loop=1):
        a = {'name': name, 'fps': fps, 'duration': duration, 'loop': loop, 'tracks': []}
        self.anims.append(a)
        return a

    def state_machine(self, name, anim_index=0):
        """One layer: Entry -> AnimationState(anim) so the runtime autoplays it."""
        self.sms = getattr(self, 'sms', []) + [(name, anim_index)]

    @staticmethod
    def track(anim, node, prop, kfs, kind='d'):
        """kfs: list of (frame, value) or (frame, value, interp) where interp is
        0 hold, 1 linear, or an interpolator node (cubic)."""
        anim['tracks'].append((node, prop, kfs, kind))

    def _flatten(self):
        order = [self]
        self.idx = 0

        def walk(n):
            kids = list(reversed(n.children)) if (n.type in ('Artboard', 'Node') and not n.keep_order) else n.children
            for c in kids:
                c.idx = len(order)
                c.props = {'parentId': n.idx, **c.props}
                order.append(c)
                walk(c)
        walk(self)
        for f in self.free:
            f.idx = len(order)
            order.append(f)
        return order

    def to_bytes(self):
        order = self._flatten()
        out = bytearray()
        for n in order:
            props = {k: (v.idx if isinstance(v, N) else v) for k, v in n.props.items()}
            out += obj_bytes(n.type, props)
        for a in self.anims:
            out += obj_bytes('LinearAnimation', {
                'name': a['name'], 'fps': a['fps'], 'duration': a['duration'],
                'loopValue': a['loop']})
            by_obj = {}
            for node, prop, kfs, kind in a['tracks']:
                by_obj.setdefault(id(node), (node, []))[1].append((prop, kfs, kind))
            for node, plist in by_obj.values():
                out += obj_bytes('KeyedObject', {'objectId': node.idx})
                for prop, kfs, kind in plist:
                    out += obj_bytes('KeyedProperty', {'propertyKey': prop_key(node.type, prop)})
                    for kf in kfs:
                        frame, value = kf[0], kf[1]
                        interp = kf[2] if len(kf) > 2 else 1
                        if isinstance(interp, N):
                            extra = {'interpolationType': 2, 'interpolatorId': interp.idx}
                        else:
                            extra = {'interpolationType': interp}
                        out += obj_bytes('KeyFrameColor' if kind == 'color' else 'KeyFrameDouble',
                                         {'frame': int(round(frame)), **extra, 'value': value})
        for name, ai in getattr(self, 'sms', []):
            out += obj_bytes('StateMachine', {'name': name})
            out += obj_bytes('StateMachineLayer', {'name': 'Layer 1'})
            out += obj_bytes('AnyState', {})
            out += obj_bytes('EntryState', {})
            out += obj_bytes('StateTransition', {'stateToId': 3})
            out += obj_bytes('ExitState', {})
            out += obj_bytes('AnimationState', {'animationId': ai})
        return bytes(out)


def write_file(path, artboards, minor=0):
    out = bytearray(b'RIVE' + varuint(7) + varuint(minor) + varuint(0) + varuint(0))
    out += obj_bytes('Backboard', {})
    for ab in artboards:
        out += ab.to_bytes()
    with open(path, 'wb') as f:
        f.write(out)
    return len(out)
