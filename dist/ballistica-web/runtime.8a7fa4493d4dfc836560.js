(() => {
  "use strict";
  var e,
    v = {},
    _ = {};
  function n(e) {
    var f = _[e];
    if (void 0 !== f) return f.exports;
    var r = (_[e] = { exports: {} });
    return v[e](r, r.exports, n), r.exports;
  }
  (n.m = v),
    (e = []),
    (n.O = (f, r, u, l) => {
      if (!r) {
        var c = 1 / 0;
        for (a = 0; a < e.length; a++) {
          for (var [r, u, l] = e[a], o = !0, s = 0; s < r.length; s++)
            (!1 & l || c >= l) && Object.keys(n.O).every((d) => n.O[d](r[s]))
              ? r.splice(s--, 1)
              : ((o = !1), l < c && (c = l));
          if (o) {
            e.splice(a--, 1);
            var t = u();
            void 0 !== t && (f = t);
          }
        }
        return f;
      }
      l = l || 0;
      for (var a = e.length; a > 0 && e[a - 1][2] > l; a--) e[a] = e[a - 1];
      e[a] = [r, u, l];
    }),
    (n.o = (e, f) => Object.prototype.hasOwnProperty.call(e, f)),
    (() => {
      var e = { 666: 0 };
      n.O.j = (u) => 0 === e[u];
      var f = (u, l) => {
          var s,
            t,
            [a, c, o] = l,
            i = 0;
          for (s in c) n.o(c, s) && (n.m[s] = c[s]);
          if (o) var b = o(n);
          for (u && u(l); i < a.length; i++)
            n.o(e, (t = a[i])) && e[t] && e[t][0](), (e[a[i]] = 0);
          return n.O(b);
        },
        r = (self.webpackChunkballistica_web =
          self.webpackChunkballistica_web || []);
      r.forEach(f.bind(null, 0)), (r.push = f.bind(null, r.push.bind(r)));
    })();
})();
