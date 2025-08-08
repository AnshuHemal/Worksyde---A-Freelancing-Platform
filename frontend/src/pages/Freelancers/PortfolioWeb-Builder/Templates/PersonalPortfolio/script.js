// Personal Portfolio Template JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu toggle
    const menuButton = document.querySelector('.menu-button');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function() {
            navMenu.classList.toggle('w--open');
            menuButton.classList.toggle('w--open');
        });
    }

    // Form submission handling
    const contactForm = document.getElementById('email-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message
            const successMessage = document.querySelector('.success-message');
            const errorMessage = document.querySelector('.error-message');
            
            if (successMessage) {
                successMessage.style.display = 'block';
            }
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            
            // Reset form
            contactForm.reset();
        });
    }

    // Scroll to top functionality
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'flex';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });

        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Add scroll to top button if it doesn't exist
    if (!scrollToTopBtn) {
        const scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollToTopBtn';
        scrollBtn.innerHTML = '↑';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 100;
            border: 2px solid #007476;
            background-color: #007476;
            color: #fff;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 24px;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            transition: background-color 0.3s, color 0.3s;
        `;
        
        scrollBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#fff';
            this.style.color = '#007476';
        });
        
        scrollBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#007476';
            this.style.color = '#fff';
        });
        
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        document.body.appendChild(scrollBtn);
        
        // Show/hide on scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollBtn.style.display = 'flex';
            } else {
                scrollBtn.style.display = 'none';
            }
        });
    }
}); 

/*!
 * Webflow: Front-end site library
 * @license MIT
 * Inline scripts may access the api using an async handler:
 *   var Webflow = Webflow || [];
 *   Webflow.push(readyFunction);
 */

(() => {
    var jv = Object.create;
    var Dn = Object.defineProperty;
    var Yv = Object.getOwnPropertyDescriptor;
    var Qv = Object.getOwnPropertyNames;
    var $v = Object.getPrototypeOf,
      Zv = Object.prototype.hasOwnProperty;
    var Ee = (e, t) => () => (e && (t = e((e = 0))), t);
    var d = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
      Ne = (e, t) => {
        for (var n in t) Dn(e, n, { get: t[n], enumerable: !0 });
      },
      pa = (e, t, n, r) => {
        if ((t && typeof t == "object") || typeof t == "function")
          for (let i of Qv(t))
            !Zv.call(e, i) &&
              i !== n &&
              Dn(e, i, {
                get: () => t[i],
                enumerable: !(r = Yv(t, i)) || r.enumerable,
              });
        return e;
      };
    var fe = (e, t, n) => (
        (n = e != null ? jv($v(e)) : {}),
        pa(
          t || !e || !e.__esModule
            ? Dn(n, "default", { value: e, enumerable: !0 })
            : n,
          e
        )
      ),
      Qe = (e) => pa(Dn({}, "__esModule", { value: !0 }), e);
    var Yr = d(() => {
      "use strict";
      window.tram = (function (e) {
        function t(l, I) {
          var O = new y.Bare();
          return O.init(l, I);
        }
        function n(l) {
          return l.replace(/[A-Z]/g, function (I) {
            return "-" + I.toLowerCase();
          });
        }
        function r(l) {
          var I = parseInt(l.slice(1), 16),
            O = (I >> 16) & 255,
            P = (I >> 8) & 255,
            A = 255 & I;
          return [O, P, A];
        }
        function i(l, I, O) {
          return (
            "#" + ((1 << 24) | (l << 16) | (I << 8) | O).toString(16).slice(1)
          );
        }
        function o() {}
        function a(l, I) {
          f("Type warning: Expected: [" + l + "] Got: [" + typeof I + "] " + I);
        }
        function u(l, I, O) {
          f("Units do not match [" + l + "]: " + I + ", " + O);
        }
        function s(l, I, O) {
          if ((I !== void 0 && (O = I), l === void 0)) return O;
          var P = O;
          return (
            Pe.test(l) || !Ge.test(l)
              ? (P = parseInt(l, 10))
              : Ge.test(l) && (P = 1e3 * parseFloat(l)),
            0 > P && (P = 0),
            P === P ? P : O
          );
        }
        function f(l) {
          re.debug && window && window.console.warn(l);
        }
        function m(l) {
          for (var I = -1, O = l ? l.length : 0, P = []; ++I < O; ) {
            var A = l[I];
            A && P.push(A);
          }
          return P;
        }
        var v = (function (l, I, O) {
            function P(ae) {
              return typeof ae == "object";
            }
            function A(ae) {
              return typeof ae == "function";
            }
            function D() {}
            function ee(ae, he) {
              function j() {
                var Oe = new ue();
                return A(Oe.init) && Oe.init.apply(Oe, arguments), Oe;
              }
              function ue() {}
              he === O && ((he = ae), (ae = Object)), (j.Bare = ue);
              var ce,
                _e = (D[l] = ae[l]),
                Ye = (ue[l] = j[l] = new D());
              return (
                (Ye.constructor = j),
                (j.mixin = function (Oe) {
                  return (ue[l] = j[l] = ee(j, Oe)[l]), j;
                }),
                (j.open = function (Oe) {
                  if (
                    ((ce = {}),
                    A(Oe) ? (ce = Oe.call(j, Ye, _e, j, ae)) : P(Oe) && (ce = Oe),
                    P(ce))
                  )
                    for (var nn in ce) I.call(ce, nn) && (Ye[nn] = ce[nn]);
                  return A(Ye.init) || (Ye.init = ae), j;
                }),
                j.open(he)
              );
            }
            return ee;
          })("prototype", {}.hasOwnProperty),
          g = {
            ease: [
              "ease",
              function (l, I, O, P) {
                var A = (l /= P) * l,
                  D = A * l;
                return (
                  I +
                  O * (-2.75 * D * A + 11 * A * A + -15.5 * D + 8 * A + 0.25 * l)
                );
              },
            ],
            "ease-in": [
              "ease-in",
              function (l, I, O, P) {
                var A = (l /= P) * l,
                  D = A * l;
                return I + O * (-1 * D * A + 3 * A * A + -3 * D + 2 * A);
              },
            ],
            "ease-out": [
              "ease-out",
              function (l, I, O, P) {
                var A = (l /= P) * l,
                  D = A * l;
                return (
                  I +
                  O * (0.3 * D * A + -1.6 * A * A + 2.2 * D + -1.8 * A + 1.9 * l)
                );
              },
            ],
            "ease-in-out": [
              "ease-in-out",
              function (l, I, O, P) {
                var A = (l /= P) * l,
                  D = A * l;
                return I + O * (2 * D * A + -5 * A * A + 2 * D + 2 * A);
              },
            ],
            linear: [
              "linear",
              function (l, I, O, P) {
                return (O * l) / P + I;
              },
            ],
            "ease-in-quad": [
              "cubic-bezier(0.550, 0.085, 0.680, 0.530)",
              function (l, I, O, P) {
                return O * (l /= P) * l + I;
              },
            ],
            "ease-out-quad": [
              "cubic-bezier(0.250, 0.460, 0.450, 0.940)",
              function (l, I, O, P) {
                return -O * (l /= P) * (l - 2) + I;
              },
            ],
            "ease-in-out-quad": [
              "cubic-bezier(0.455, 0.030, 0.515, 0.955)",
              function (l, I, O, P) {
                return (l /= P / 2) < 1
                  ? (O / 2) * l * l + I
                  : (-O / 2) * (--l * (l - 2) - 1) + I;
              },
            ],
            "ease-in-cubic": [
              "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
              function (l, I, O, P) {
                return O * (l /= P) * l * l + I;
              },
            ],
            "ease-out-cubic": [
              "cubic-bezier(0.215, 0.610, 0.355, 1)",
              function (l, I, O, P) {
                return O * ((l = l / P - 1) * l * l + 1) + I;
              },
            ],
            "ease-in-out-cubic": [
              "cubic-bezier(0.645, 0.045, 0.355, 1)",
              function (l, I, O, P) {
                return (l /= P / 2) < 1
                  ? (O / 2) * l * l * l + I
                  : (O / 2) * ((l -= 2) * l * l + 2) + I;
              },
            ],
            "ease-in-quart": [
              "cubic-bezier(0.895, 0.030, 0.685, 0.220)",
              function (l, I, O, P) {
                return O * (l /= P) * l * l * l + I;
              },
            ],
            "ease-out-quart": [
              "cubic-bezier(0.165, 0.840, 0.440, 1)",
              function (l, I, O, P) {
                return -O * ((l = l / P - 1) * l * l * l - 1) + I;
              },
            ],
            "ease-in-out-quart": [
              "cubic-bezier(0.770, 0, 0.175, 1)",
              function (l, I, O, P) {
                return (l /= P / 2) < 1
                  ? (O / 2) * l * l * l * l + I
                  : (-O / 2) * ((l -= 2) * l * l * l - 2) + I;
              },
            ],
            "ease-in-quint": [
              "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
              function (l, I, O, P) {
                return O * (l /= P) * l * l * l * l + I;
              },
            ],
            "ease-out-quint": [
              "cubic-bezier(0.230, 1, 0.320, 1)",
              function (l, I, O, P) {
                return O * ((l = l / P - 1) * l * l * l * l + 1) + I;
              },
            ],
            "ease-in-out-quint": [
              "cubic-bezier(0.860, 0, 0.070, 1)",
              function (l, I, O, P) {
                return (l /= P / 2) < 1
                  ? (O / 2) * l * l * l * l * l + I
                  : (O / 2) * ((l -= 2) * l * l * l * l + 2) + I;
              },
            ],
            "ease-in-sine": [
              "cubic-bezier(0.470, 0, 0.745, 0.715)",
              function (l, I, O, P) {
                return -O * Math.cos((l / P) * (Math.PI / 2)) + O + I;
              },
            ],
            "ease-out-sine": [
              "cubic-bezier(0.390, 0.575, 0.565, 1)",
              function (l, I, O, P) {
                return O * Math.sin((l / P) * (Math.PI / 2)) + I;
              },
            ],
            "ease-in-out-sine": [
              "cubic-bezier(0.445, 0.050, 0.550, 0.950)",
              function (l, I, O, P) {
                return (-O / 2) * (Math.cos((Math.PI * l) / P) - 1) + I;
              },
            ],
            "ease-in-expo": [
              "cubic-bezier(0.950, 0.050, 0.795, 0.035)",
              function (l, I, O, P) {
                return l === 0 ? I : O * Math.pow(2, 10 * (l / P - 1)) + I;
              },
            ],
            "ease-out-expo": [
              "cubic-bezier(0.190, 1, 0.220, 1)",
              function (l, I, O, P) {
                return l === P
                  ? I + O
                  : O * (-Math.pow(2, (-10 * l) / P) + 1) + I;
              },
            ],
            "ease-in-out-expo": [
              "cubic-bezier(1, 0, 0, 1)",
              function (l, I, O, P) {
                return l === 0
                  ? I
                  : l === P
                  ? I + O
                  : (l /= P / 2) < 1
                  ? (O / 2) * Math.pow(2, 10 * (l - 1)) + I
                  : (O / 2) * (-Math.pow(2, -10 * --l) + 2) + I;
              },
            ],
            "ease-in-circ": [
              "cubic-bezier(0.600, 0.040, 0.980, 0.335)",
              function (l, I, O, P) {
                return -O * (Math.sqrt(1 - (l /= P) * l) - 1) + I;
              },
            ],
            "ease-out-circ": [
              "cubic-bezier(0.075, 0.820, 0.165, 1)",
              function (l, I, O, P) {
                return O * Math.sqrt(1 - (l = l / P - 1) * l) + I;
              },
            ],
            "ease-in-out-circ": [
              "cubic-bezier(0.785, 0.135, 0.150, 0.860)",
              function (l, I, O, P) {
                return (l /= P / 2) < 1
                  ? (-O / 2) * (Math.sqrt(1 - l * l) - 1) + I
                  : (O / 2) * (Math.sqrt(1 - (l -= 2) * l) + 1) + I;
              },
            ],
            "ease-in-back": [
              "cubic-bezier(0.600, -0.280, 0.735, 0.045)",
              function (l, I, O, P, A) {
                return (
                  A === void 0 && (A = 1.70158),
                  O * (l /= P) * l * ((A + 1) * l - A) + I
                );
              },
            ],
            "ease-out-back": [
              "cubic-bezier(0.175, 0.885, 0.320, 1.275)",
              function (l, I, O, P, A) {
                return (
                  A === void 0 && (A = 1.70158),
                  O * ((l = l / P - 1) * l * ((A + 1) * l + A) + 1) + I
                );
              },
            ],
            "ease-in-out-back": [
              "cubic-bezier(0.680, -0.550, 0.265, 1.550)",
              function (l, I, O, P, A) {
                return (
                  A === void 0 && (A = 1.70158),
                  (l /= P / 2) < 1
                    ? (O / 2) * l * l * (((A *= 1.525) + 1) * l - A) + I
                    : (O / 2) *
                        ((l -= 2) * l * (((A *= 1.525) + 1) * l + A) + 2) +
                      I
                );
              },
            ],
          },
          E = {
            "ease-in-back": "cubic-bezier(0.600, 0, 0.735, 0.045)",
            "ease-out-back": "cubic-bezier(0.175, 0.885, 0.320, 1)",
            "ease-in-out-back": "cubic-bezier(0.680, 0, 0.265, 1)",
          },
          T = document,
          w = window,
          R = "bkwld-tram",
          b = /[\-\.0-9]/g,
          L = /[A-Z]/,
          C = "number",
          M = /^(rgb|#)/,
          F = /(em|cm|mm|in|pt|pc|px)$/,
          N = /(em|cm|mm|in|pt|pc|px|%)$/,
          V = /(deg|rad|turn)$/,
          B = "unitless",
          Q = /(all|none) 0s ease 0s/,
          Z = /^(width|height)$/,
          te = " ",
          G = T.createElement("a"),
          S = ["Webkit", "Moz", "O", "ms"],
          q = ["-webkit-", "-moz-", "-o-", "-ms-"],
          z = function (l) {
            if (l in G.style) return { dom: l, css: l };
            var I,
              O,
              P = "",
              A = l.split("-");
            for (I = 0; I < A.length; I++)
              P += A[I].charAt(0).toUpperCase() + A[I].slice(1);
            for (I = 0; I < S.length; I++)
              if (((O = S[I] + P), O in G.style))
                return { dom: O, css: q[I] + l };
          },
          H = (t.support = {
            bind: Function.prototype.bind,
            transform: z("transform"),
            transition: z("transition"),
            backface: z("backface-visibility"),
            timing: z("transition-timing-function"),
          });
        if (H.transition) {
          var ne = H.timing.dom;
          if (((G.style[ne] = g["ease-in-back"][0]), !G.style[ne]))
            for (var ie in E) g[ie][0] = E[ie];
        }
        var X = (t.frame = (function () {
            var l =
              w.requestAnimationFrame ||
              w.webkitRequestAnimationFrame ||
              w.mozRequestAnimationFrame ||
              w.oRequestAnimationFrame ||
              w.msRequestAnimationFrame;
            return l && H.bind
              ? l.bind(w)
              : function (I) {
                  w.setTimeout(I, 16);
                };
          })()),
          Y = (t.now = (function () {
            var l = w.performance,
              I = l && (l.now || l.webkitNow || l.msNow || l.mozNow);
            return I && H.bind
              ? I.bind(l)
              : Date.now ||
                  function () {
                    return +new Date();
                  };
          })()),
          p = v(function (l) {
            function I(oe, le) {
              var me = m(("" + oe).split(te)),
                pe = me[0];
              le = le || {};
              var Se = K[pe];
              if (!Se) return f("Unsupported property: " + pe);
              if (!le.weak || !this.props[pe]) {
                var Ue = Se[0],
                  Le = this.props[pe];
                return (
                  Le || (Le = this.props[pe] = new Ue.Bare()),
                  Le.init(this.$el, me, Se, le),
                  Le
                );
              }
            }
            function O(oe, le, me) {
              if (oe) {
                var pe = typeof oe;
                if (
                  (le ||
                    (this.timer && this.timer.destroy(),
                    (this.queue = []),
                    (this.active = !1)),
                  pe == "number" && le)
                )
                  return (
                    (this.timer = new J({
                      duration: oe,
                      context: this,
                      complete: D,
                    })),
                    void (this.active = !0)
                  );
                if (pe == "string" && le) {
                  switch (oe) {
                    case "hide":
                      j.call(this);
                      break;
                    case "stop":
                      ee.call(this);
                      break;
                    case "redraw":
                      ue.call(this);
                      break;
                    default:
                      I.call(this, oe, me && me[1]);
                  }
                  return D.call(this);
                }
                if (pe == "function") return void oe.call(this, this);
                if (pe == "object") {
                  var Se = 0;
                  Ye.call(
                    this,
                    oe,
                    function (Ie, Kv) {
                      Ie.span > Se && (Se = Ie.span), Ie.stop(), Ie.animate(Kv);
                    },
                    function (Ie) {
                      "wait" in Ie && (Se = s(Ie.wait, 0));
                    }
                  ),
                    _e.call(this),
                    Se > 0 &&
                      ((this.timer = new J({ duration: Se, context: this })),
                      (this.active = !0),
                      le && (this.timer.complete = D));
                  var Ue = this,
                    Le = !1,
                    Nn = {};
                  X(function () {
                    Ye.call(Ue, oe, function (Ie) {
                      Ie.active && ((Le = !0), (Nn[Ie.name] = Ie.nextStyle));
                    }),
                      Le && Ue.$el.css(Nn);
                  });
                }
              }
            }
            function P(oe) {
              (oe = s(oe, 0)),
                this.active
                  ? this.queue.push({ options: oe })
                  : ((this.timer = new J({
                      duration: oe,
                      context: this,
                      complete: D,
                    })),
                    (this.active = !0));
            }
            function A(oe) {
              return this.active
                ? (this.queue.push({ options: oe, args: arguments }),
                  void (this.timer.complete = D))
                : f(
                    "No active transition timer. Use start() or wait() before then()."
                  );
            }
            function D() {
              if (
                (this.timer && this.timer.destroy(),
                (this.active = !1),
                this.queue.length)
              ) {
                var oe = this.queue.shift();
                O.call(this, oe.options, !0, oe.args);
              }
            }
            function ee(oe) {
              this.timer && this.timer.destroy(),
                (this.queue = []),
                (this.active = !1);
              var le;
              typeof oe == "string"
                ? ((le = {}), (le[oe] = 1))
                : (le = typeof oe == "object" && oe != null ? oe : this.props),
                Ye.call(this, le, Oe),
                _e.call(this);
            }
            function ae(oe) {
              ee.call(this, oe), Ye.call(this, oe, nn, Bv);
            }
            function he(oe) {
              typeof oe != "string" && (oe = "block"),
                (this.el.style.display = oe);
            }
            function j() {
              ee.call(this), (this.el.style.display = "none");
            }
            function ue() {
              this.el.offsetHeight;
            }
            function ce() {
              ee.call(this),
                e.removeData(this.el, R),
                (this.$el = this.el = null);
            }
            function _e() {
              var oe,
                le,
                me = [];
              this.upstream && me.push(this.upstream);
              for (oe in this.props)
                (le = this.props[oe]), le.active && me.push(le.string);
              (me = me.join(",")),
                this.style !== me &&
                  ((this.style = me), (this.el.style[H.transition.dom] = me));
            }
            function Ye(oe, le, me) {
              var pe,
                Se,
                Ue,
                Le,
                Nn = le !== Oe,
                Ie = {};
              for (pe in oe)
                (Ue = oe[pe]),
                  pe in de
                    ? (Ie.transform || (Ie.transform = {}),
                      (Ie.transform[pe] = Ue))
                    : (L.test(pe) && (pe = n(pe)),
                      pe in K ? (Ie[pe] = Ue) : (Le || (Le = {}), (Le[pe] = Ue)));
              for (pe in Ie) {
                if (((Ue = Ie[pe]), (Se = this.props[pe]), !Se)) {
                  if (!Nn) continue;
                  Se = I.call(this, pe);
                }
                le.call(this, Se, Ue);
              }
              me && Le && me.call(this, Le);
            }
            function Oe(oe) {
              oe.stop();
            }
            function nn(oe, le) {
              oe.set(le);
            }
            function Bv(oe) {
              this.$el.css(oe);
            }
            function Xe(oe, le) {
              l[oe] = function () {
                return this.children
                  ? zv.call(this, le, arguments)
                  : (this.el && le.apply(this, arguments), this);
              };
            }
            function zv(oe, le) {
              var me,
                pe = this.children.length;
              for (me = 0; pe > me; me++) oe.apply(this.children[me], le);
              return this;
            }
            (l.init = function (oe) {
              if (
                ((this.$el = e(oe)),
                (this.el = this.$el[0]),
                (this.props = {}),
                (this.queue = []),
                (this.style = ""),
                (this.active = !1),
                re.keepInherited && !re.fallback)
              ) {
                var le = U(this.el, "transition");
                le && !Q.test(le) && (this.upstream = le);
              }
              H.backface &&
                re.hideBackface &&
                h(this.el, H.backface.css, "hidden");
            }),
              Xe("add", I),
              Xe("start", O),
              Xe("wait", P),
              Xe("then", A),
              Xe("next", D),
              Xe("stop", ee),
              Xe("set", ae),
              Xe("show", he),
              Xe("hide", j),
              Xe("redraw", ue),
              Xe("destroy", ce);
          }),
          y = v(p, function (l) {
            function I(O, P) {
              var A = e.data(O, R) || e.data(O, R, new p.Bare());
              return A.el || A.init(O), P ? A.start(P) : A;
            }
            l.init = function (O, P) {
              var A = e(O);
              if (!A.length) return this;
              if (A.length === 1) return I(A[0], P);
              var D = [];
              return (
                A.each(function (ee, ae) {
                  D.push(I(ae, P));
                }),
                (this.children = D),
                this
              );
            };
          }),
          _ = v(function (l) {
            function I() {
              var D = this.get();
              this.update("auto");
              var ee = this.get();
              return this.update(D), ee;
            }
            function O(D, ee, ae) {
              return ee !== void 0 && (ae = ee), D in g ? D : ae;
            }
            function P(D) {
              var ee = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(D);
              return (ee ? i(ee[1], ee[2], ee[3]) : D).replace(
                /#(\w)(\w)(\w)$/,
                "#$1$1$2$2$3$3"
              );
            }
            var A = { duration: 500, ease: "ease", delay: 0 };
            (l.init = function (D, ee, ae, he) {
              (this.$el = D), (this.el = D[0]);
              var j = ee[0];
              ae[2] && (j = ae[2]),
                $[j] && (j = $[j]),
                (this.name = j),
                (this.type = ae[1]),
                (this.duration = s(ee[1], this.duration, A.duration)),
                (this.ease = O(ee[2], this.ease, A.ease)),
                (this.delay = s(ee[3], this.delay, A.delay)),
                (this.span = this.duration + this.delay),
                (this.active = !1),
                (this.nextStyle = null),
                (this.auto = Z.test(this.name)),
                (this.unit = he.unit || this.unit || re.defaultUnit),
                (this.angle = he.angle || this.angle || re.defaultAngle),
                re.fallback || he.fallback
                  ? (this.animate = this.fallback)
                  : ((this.animate = this.transition),
                    (this.string =
                      this.name +
                      te +
                      this.duration +
                      "ms" +
                      (this.ease != "ease" ? te + g[this.ease][0] : "") +
                      (this.delay ? te + this.delay + "ms" : "")));
            }),
              (l.set = function (D) {
                (D = this.convert(D, this.type)), this.update(D), this.redraw();
              }),
              (l.transition = function (D) {
                (this.active = !0),
                  (D = this.convert(D, this.type)),
                  this.auto &&
                    (this.el.style[this.name] == "auto" &&
                      (this.update(this.get()), this.redraw()),
                    D == "auto" && (D = I.call(this))),
                  (this.nextStyle = D);
              }),
              (l.fallback = function (D) {
                var ee =
                  this.el.style[this.name] || this.convert(this.get(), this.type);
                (D = this.convert(D, this.type)),
                  this.auto &&
                    (ee == "auto" && (ee = this.convert(this.get(), this.type)),
                    D == "auto" && (D = I.call(this))),
                  (this.tween = new x({
                    from: ee,
                    to: D,
                    duration: this.duration,
                    delay: this.delay,
                    ease: this.ease,
                    update: this.update,
                    context: this,
                  }));
              }),
              (l.get = function () {
                return U(this.el, this.name);
              }),
              (l.update = function (D) {
                h(this.el, this.name, D);
              }),
              (l.stop = function () {
                (this.active || this.nextStyle) &&
                  ((this.active = !1),
                  (this.nextStyle = null),
                  h(this.el, this.name, this.get()));
                var D = this.tween;
                D && D.context && D.destroy();
              }),
              (l.convert = function (D, ee) {
                if (D == "auto" && this.auto) return D;
                var ae,
                  he = typeof D == "number",
                  j = typeof D == "string";
                switch (ee) {
                  case C:
                    if (he) return D;
                    if (j && D.replace(b, "") === "") return +D;
                    ae = "number(unitless)";
                    break;
                  case M:
                    if (j) {
                      if (D === "" && this.original) return this.original;
                      if (ee.test(D))
                        return D.charAt(0) == "#" && D.length == 7 ? D : P(D);
                    }
                    ae = "hex or rgb string";
                    break;
                  case F:
                    if (he) return D + this.unit;
                    if (j && ee.test(D)) return D;
                    ae = "number(px) or string(unit)";
                    break;
                  case N:
                    if (he) return D + this.unit;
                    if (j && ee.test(D)) return D;
                    ae = "number(px) or string(unit or %)";
                    break;
                  case V:
                    if (he) return D + this.angle;
                    if (j && ee.test(D)) return D;
                    ae = "number(deg) or string(angle)";
                    break;
                  case B:
                    if (he || (j && N.test(D))) return D;
                    ae = "number(unitless) or string(unit or %)";
                }
                return a(ae, D), D;
              }),
              (l.redraw = function () {
                this.el.offsetHeight;
              });
          }),
          c = v(_, function (l, I) {
            l.init = function () {
              I.init.apply(this, arguments),
                this.original || (this.original = this.convert(this.get(), M));
            };
          }),
          k = v(_, function (l, I) {
            (l.init = function () {
              I.init.apply(this, arguments), (this.animate = this.fallback);
            }),
              (l.get = function () {
                return this.$el[this.name]();
              }),
              (l.update = function (O) {
                this.$el[this.name](O);
              });
          }),
          W = v(_, function (l, I) {
            function O(P, A) {
              var D, ee, ae, he, j;
              for (D in P)
                (he = de[D]),
                  (ae = he[0]),
                  (ee = he[1] || D),
                  (j = this.convert(P[D], ae)),
                  A.call(this, ee, j, ae);
            }
            (l.init = function () {
              I.init.apply(this, arguments),
                this.current ||
                  ((this.current = {}),
                  de.perspective &&
                    re.perspective &&
                    ((this.current.perspective = re.perspective),
                    h(this.el, this.name, this.style(this.current)),
                    this.redraw()));
            }),
              (l.set = function (P) {
                O.call(this, P, function (A, D) {
                  this.current[A] = D;
                }),
                  h(this.el, this.name, this.style(this.current)),
                  this.redraw();
              }),
              (l.transition = function (P) {
                var A = this.values(P);
                this.tween = new se({
                  current: this.current,
                  values: A,
                  duration: this.duration,
                  delay: this.delay,
                  ease: this.ease,
                });
                var D,
                  ee = {};
                for (D in this.current) ee[D] = D in A ? A[D] : this.current[D];
                (this.active = !0), (this.nextStyle = this.style(ee));
              }),
              (l.fallback = function (P) {
                var A = this.values(P);
                this.tween = new se({
                  current: this.current,
                  values: A,
                  duration: this.duration,
                  delay: this.delay,
                  ease: this.ease,
                  update: this.update,
                  context: this,
                });
              }),
              (l.update = function () {
                h(this.el, this.name, this.style(this.current));
              }),
              (l.style = function (P) {
                var A,
                  D = "";
                for (A in P) D += A + "(" + P[A] + ") ";
                return D;
              }),
              (l.values = function (P) {
                var A,
                  D = {};
                return (
                  O.call(this, P, function (ee, ae, he) {
                    (D[ee] = ae),
                      this.current[ee] === void 0 &&
                        ((A = 0),
                        ~ee.indexOf("scale") && (A = 1),
                        (this.current[ee] = this.convert(A, he)));
                  }),
                  D
                );
              });
          }),
          x = v(function (l) {
            function I(j) {
              ae.push(j) === 1 && X(O);
            }
            function O() {
              var j,
                ue,
                ce,
                _e = ae.length;
              if (_e)
                for (X(O), ue = Y(), j = _e; j--; )
                  (ce = ae[j]), ce && ce.render(ue);
            }
            function P(j) {
              var ue,
                ce = e.inArray(j, ae);
              ce >= 0 &&
                ((ue = ae.slice(ce + 1)),
                (ae.length = ce),
                ue.length && (ae = ae.concat(ue)));
            }
            function A(j) {
              return Math.round(j * he) / he;
            }
            function D(j, ue, ce) {
              return i(
                j[0] + ce * (ue[0] - j[0]),
                j[1] + ce * (ue[1] - j[1]),
                j[2] + ce * (ue[2] - j[2])
              );
            }
            var ee = { ease: g.ease[1], from: 0, to: 1 };
            (l.init = function (j) {
              (this.duration = j.duration || 0), (this.delay = j.delay || 0);
              var ue = j.ease || ee.ease;
              g[ue] && (ue = g[ue][1]),
                typeof ue != "function" && (ue = ee.ease),
                (this.ease = ue),
                (this.update = j.update || o),
                (this.complete = j.complete || o),
                (this.context = j.context || this),
                (this.name = j.name);
              var ce = j.from,
                _e = j.to;
              ce === void 0 && (ce = ee.from),
                _e === void 0 && (_e = ee.to),
                (this.unit = j.unit || ""),
                typeof ce == "number" && typeof _e == "number"
                  ? ((this.begin = ce), (this.change = _e - ce))
                  : this.format(_e, ce),
                (this.value = this.begin + this.unit),
                (this.start = Y()),
                j.autoplay !== !1 && this.play();
            }),
              (l.play = function () {
                this.active ||
                  (this.start || (this.start = Y()), (this.active = !0), I(this));
              }),
              (l.stop = function () {
                this.active && ((this.active = !1), P(this));
              }),
              (l.render = function (j) {
                var ue,
                  ce = j - this.start;
                if (this.delay) {
                  if (ce <= this.delay) return;
                  ce -= this.delay;
                }
                if (ce < this.duration) {
                  var _e = this.ease(ce, 0, 1, this.duration);
                  return (
                    (ue = this.startRGB
                      ? D(this.startRGB, this.endRGB, _e)
                      : A(this.begin + _e * this.change)),
                    (this.value = ue + this.unit),
                    void this.update.call(this.context, this.value)
                  );
                }
                (ue = this.endHex || this.begin + this.change),
                  (this.value = ue + this.unit),
                  this.update.call(this.context, this.value),
                  this.complete.call(this.context),
                  this.destroy();
              }),
              (l.format = function (j, ue) {
                if (((ue += ""), (j += ""), j.charAt(0) == "#"))
                  return (
                    (this.startRGB = r(ue)),
                    (this.endRGB = r(j)),
                    (this.endHex = j),
                    (this.begin = 0),
                    void (this.change = 1)
                  );
                if (!this.unit) {
                  var ce = ue.replace(b, ""),
                    _e = j.replace(b, "");
                  ce !== _e && u("tween", ue, j), (this.unit = ce);
                }
                (ue = parseFloat(ue)),
                  (j = parseFloat(j)),
                  (this.begin = this.value = ue),
                  (this.change = j - ue);
              }),
              (l.destroy = function () {
                this.stop(),
                  (this.context = null),
                  (this.ease = this.update = this.complete = o);
              });
            var ae = [],
              he = 1e3;
          }),
          J = v(x, function (l) {
            (l.init = function (I) {
              (this.duration = I.duration || 0),
                (this.complete = I.complete || o),
                (this.context = I.context),
                this.play();
            }),
              (l.render = function (I) {
                var O = I - this.start;
                O < this.duration ||
                  (this.complete.call(this.context), this.destroy());
              });
          }),
          se = v(x, function (l, I) {
            (l.init = function (O) {
              (this.context = O.context),
                (this.update = O.update),
                (this.tweens = []),
                (this.current = O.current);
              var P, A;
              for (P in O.values)
                (A = O.values[P]),
                  this.current[P] !== A &&
                    this.tweens.push(
                      new x({
                        name: P,
                        from: this.current[P],
                        to: A,
                        duration: O.duration,
                        delay: O.delay,
                        ease: O.ease,
                        autoplay: !1,
                      })
                    );
              this.play();
            }),
              (l.render = function (O) {
                var P,
                  A,
                  D = this.tweens.length,
                  ee = !1;
                for (P = D; P--; )
                  (A = this.tweens[P]),
                    A.context &&
                      (A.render(O), (this.current[A.name] = A.value), (ee = !0));
                return ee
                  ? void (this.update && this.update.call(this.context))
                  : this.destroy();
              }),
              (l.destroy = function () {
                if ((I.destroy.call(this), this.tweens)) {
                  var O,
                    P = this.tweens.length;
                  for (O = P; O--; ) this.tweens[O].destroy();
                  (this.tweens = null), (this.current = null);
                }
              });
          }),
          re = (t.config = {
            debug: !1,
            defaultUnit: "px",
            defaultAngle: "deg",
            keepInherited: !1,
            hideBackface: !1,
            perspective: "",
            fallback: !H.transition,
            agentTests: [],
          });
        (t.fallback = function (l) {
          if (!H.transition) return (re.fallback = !0);
          re.agentTests.push("(" + l + ")");
          var I = new RegExp(re.agentTests.join("|"), "i");
          re.fallback = I.test(navigator.userAgent);
        }),
          t.fallback("6.0.[2-5] Safari"),
          (t.tween = function (l) {
            return new x(l);
          }),
          (t.delay = function (l, I, O) {
            return new J({ complete: I, duration: l, context: O });
          }),
          (e.fn.tram = function (l) {
            return t.call(null, this, l);
          });
        var h = e.style,
          U = e.css,
          $ = { transform: H.transform && H.transform.css },
          K = {
            color: [c, M],
            background: [c, M, "background-color"],
            "outline-color": [c, M],
            "border-color": [c, M],
            "border-top-color": [c, M],
            "border-right-color": [c, M],
            "border-bottom-color": [c, M],
            "border-left-color": [c, M],
            "border-width": [_, F],
            "border-top-width": [_, F],
            "border-right-width": [_, F],
            "border-bottom-width": [_, F],
            "border-left-width": [_, F],
            "border-spacing": [_, F],
            "letter-spacing": [_, F],
            margin: [_, F],
            "margin-top": [_, F],
            "margin-right": [_, F],
            "margin-bottom": [_, F],
            "margin-left": [_, F],
            padding: [_, F],
            "padding-top": [_, F],
            "padding-right": [_, F],
            "padding-bottom": [_, F],
            "padding-left": [_, F],
            "outline-width": [_, F],
            opacity: [_, C],
            top: [_, N],
            right: [_, N],
            bottom: [_, N],
            left: [_, N],
            "font-size": [_, N],
            "text-indent": [_, N],
            "word-spacing": [_, N],
            width: [_, N],
            "min-width": [_, N],
            "max-width": [_, N],
            height: [_, N],
            "min-height": [_, N],
            "max-height": [_, N],
            "line-height": [_, B],
            "scroll-top": [k, C, "scrollTop"],
            "scroll-left": [k, C, "scrollLeft"],
          },
          de = {};
        H.transform &&
          ((K.transform = [W]),
          (de = {
            x: [N, "translateX"],
            y: [N, "translateY"],
            rotate: [V],
            rotateX: [V],
            rotateY: [V],
            scale: [C],
            scaleX: [C],
            scaleY: [C],
            skew: [V],
            skewX: [V],
            skewY: [V],
          })),
          H.transform &&
            H.backface &&
            ((de.z = [N, "translateZ"]),
            (de.rotateZ = [V]),
            (de.scaleZ = [C]),
            (de.perspective = [F]));
        var Pe = /ms/,
          Ge = /s|\./;
        return (e.tram = t);
      })(window.jQuery);
    });
    var ha = d((MF, ga) => {
      "use strict";
      var Jv = window.$,
        eE = Yr() && Jv.tram;
      ga.exports = (function () {
        var e = {};
        e.VERSION = "1.6.0-Webflow";
        var t = {},
          n = Array.prototype,
          r = Object.prototype,
          i = Function.prototype,
          o = n.push,
          a = n.slice,
          u = n.concat,
          s = r.toString,
          f = r.hasOwnProperty,
          m = n.forEach,
          v = n.map,
          g = n.reduce,
          E = n.reduceRight,
          T = n.filter,
          w = n.every,
          R = n.some,
          b = n.indexOf,
          L = n.lastIndexOf,
          C = Array.isArray,
          M = Object.keys,
          F = i.bind,
          N =
            (e.each =
            e.forEach =
              function (S, q, z) {
                if (S == null) return S;
                if (m && S.forEach === m) S.forEach(q, z);
                else if (S.length === +S.length) {
                  for (var H = 0, ne = S.length; H < ne; H++)
                    if (q.call(z, S[H], H, S) === t) return;
                } else
                  for (var ie = e.keys(S), H = 0, ne = ie.length; H < ne; H++)
                    if (q.call(z, S[ie[H]], ie[H], S) === t) return;
                return S;
              });
        (e.map = e.collect =
          function (S, q, z) {
            var H = [];
            return S == null
              ? H
              : v && S.map === v
              ? S.map(q, z)
              : (N(S, function (ne, ie, X) {
                  H.push(q.call(z, ne, ie, X));
                }),
                H);
          }),
          (e.find = e.detect =
            function (S, q, z) {
              var H;
              return (
                V(S, function (ne, ie, X) {
                  if (q.call(z, ne, ie, X)) return (H = ne), !0;
                }),
                H
              );
            }),
          (e.filter = e.select =
            function (S, q, z) {
              var H = [];
              return S == null
                ? H
                : T && S.filter === T
                ? S.filter(q, z)
                : (N(S, function (ne, ie, X) {
                    q.call(z, ne, ie, X) && H.push(ne);
                  }),
                  H);
            });
        var V =
          (e.some =
          e.any =
            function (S, q, z) {
              q || (q = e.identity);
              var H = !1;
              return S == null
                ? H
                : R && S.some === R
                ? S.some(q, z)
                : (N(S, function (ne, ie, X) {
                    if (H || (H = q.call(z, ne, ie, X))) return t;
                  }),
                  !!H);
            });
        (e.contains = e.include =
          function (S, q) {
            return S == null
              ? !1
              : b && S.indexOf === b
              ? S.indexOf(q) != -1
              : V(S, function (z) {
                  return z === q;
                });
          }),
          (e.delay = function (S, q) {
            var z = a.call(arguments, 2);
            return setTimeout(function () {
              return S.apply(null, z);
            }, q);
          }),
          (e.defer = function (S) {
            return e.delay.apply(e, [S, 1].concat(a.call(arguments, 1)));
          }),
          (e.throttle = function (S) {
            var q, z, H;
            return function () {
              q ||
                ((q = !0),
                (z = arguments),
                (H = this),
                eE.frame(function () {
                  (q = !1), S.apply(H, z);
                }));
            };
          }),
          (e.debounce = function (S, q, z) {
            var H,
              ne,
              ie,
              X,
              Y,
              p = function () {
                var y = e.now() - X;
                y < q
                  ? (H = setTimeout(p, q - y))
                  : ((H = null), z || ((Y = S.apply(ie, ne)), (ie = ne = null)));
              };
            return function () {
              (ie = this), (ne = arguments), (X = e.now());
              var y = z && !H;
              return (
                H || (H = setTimeout(p, q)),
                y && ((Y = S.apply(ie, ne)), (ie = ne = null)),
                Y
              );
            };
          }),
          (e.defaults = function (S) {
            if (!e.isObject(S)) return S;
            for (var q = 1, z = arguments.length; q < z; q++) {
              var H = arguments[q];
              for (var ne in H) S[ne] === void 0 && (S[ne] = H[ne]);
            }
            return S;
          }),
          (e.keys = function (S) {
            if (!e.isObject(S)) return [];
            if (M) return M(S);
            var q = [];
            for (var z in S) e.has(S, z) && q.push(z);
            return q;
          }),
          (e.has = function (S, q) {
            return f.call(S, q);
          }),
          (e.isObject = function (S) {
            return S === Object(S);
          }),
          (e.now =
            Date.now ||
            function () {
              return new Date().getTime();
            }),
          (e.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g,
          });
        var B = /(.)^/,
          Q = {
            "'": "'",
            "\\": "\\",
            "\r": "r",
            "\n": "n",
            "\u2028": "u2028",
            "\u2029": "u2029",
          },
          Z = /\\|'|\r|\n|\u2028|\u2029/g,
          te = function (S) {
            return "\\" + Q[S];
          },
          G = /^\s*(\w|\$)+\s*$/;
        return (
          (e.template = function (S, q, z) {
            !q && z && (q = z), (q = e.defaults({}, q, e.templateSettings));
            var H = RegExp(
                [
                  (q.escape || B).source,
                  (q.interpolate || B).source,
                  (q.evaluate || B).source,
                ].join("|") + "|$",
                "g"
              ),
              ne = 0,
              ie = "__p+='";
            S.replace(H, function (y, _, c, k, W) {
              return (
                (ie += S.slice(ne, W).replace(Z, te)),
                (ne = W + y.length),
                _
                  ? (ie +=
                      `'+
  ((__t=(` +
                      _ +
                      `))==null?'':_.escape(__t))+
  '`)
                  : c
                  ? (ie +=
                      `'+
  ((__t=(` +
                      c +
                      `))==null?'':__t)+
  '`)
                  : k &&
                    (ie +=
                      `';
  ` +
                      k +
                      `
  __p+='`),
                y
              );
            }),
              (ie += `';
  `);
            var X = q.variable;
            if (X) {
              if (!G.test(X))
                throw new Error("variable is not a bare identifier: " + X);
            } else
              (ie =
                `with(obj||{}){
  ` +
                ie +
                `}
  `),
                (X = "obj");
            ie =
              `var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
  ` +
              ie +
              `return __p;
  `;
            var Y;
            try {
              Y = new Function(q.variable || "obj", "_", ie);
            } catch (y) {
              throw ((y.source = ie), y);
            }
            var p = function (y) {
              return Y.call(this, y, e);
            };
            return (
              (p.source =
                "function(" +
                X +
                `){
  ` +
                ie +
                "}"),
              p
            );
          }),
          e
        );
      })();
    });
    var De = d((FF, ba) => {
      "use strict";
      var ge = {},
        St = {},
        xt = [],
        $r = window.Webflow || [],
        lt = window.jQuery,
        Ve = lt(window),
        tE = lt(document),
        $e = lt.isFunction,
        We = (ge._ = ha()),
        Ea = (ge.tram = Yr() && lt.tram),
        Fn = !1,
        Zr = !1;
      Ea.config.hideBackface = !1;
      Ea.config.keepInherited = !0;
      ge.define = function (e, t, n) {
        St[e] && ya(St[e]);
        var r = (St[e] = t(lt, We, n) || {});
        return ma(r), r;
      };
      ge.require = function (e) {
        return St[e];
      };
      function ma(e) {
        ge.env() &&
          ($e(e.design) && Ve.on("__wf_design", e.design),
          $e(e.preview) && Ve.on("__wf_preview", e.preview)),
          $e(e.destroy) && Ve.on("__wf_destroy", e.destroy),
          e.ready && $e(e.ready) && nE(e);
      }
      function nE(e) {
        if (Fn) {
          e.ready();
          return;
        }
        We.contains(xt, e.ready) || xt.push(e.ready);
      }
      function ya(e) {
        $e(e.design) && Ve.off("__wf_design", e.design),
          $e(e.preview) && Ve.off("__wf_preview", e.preview),
          $e(e.destroy) && Ve.off("__wf_destroy", e.destroy),
          e.ready && $e(e.ready) && rE(e);
      }
      function rE(e) {
        xt = We.filter(xt, function (t) {
          return t !== e.ready;
        });
      }
      ge.push = function (e) {
        if (Fn) {
          $e(e) && e();
          return;
        }
        $r.push(e);
      };
      ge.env = function (e) {
        var t = window.__wf_design,
          n = typeof t < "u";
        if (!e) return n;
        if (e === "design") return n && t;
        if (e === "preview") return n && !t;
        if (e === "slug") return n && window.__wf_slug;
        if (e === "editor") return window.WebflowEditor;
        if (e === "test") return window.__wf_test;
        if (e === "frame") return window !== window.top;
      };
      var Mn = navigator.userAgent.toLowerCase(),
        _a = (ge.env.touch =
          "ontouchstart" in window ||
          (window.DocumentTouch && document instanceof window.DocumentTouch)),
        iE = (ge.env.chrome =
          /chrome/.test(Mn) &&
          /Google/.test(navigator.vendor) &&
          parseInt(Mn.match(/chrome\/(\d+)\./)[1], 10)),
        oE = (ge.env.ios = /(ipod|iphone|ipad)/.test(Mn));
      ge.env.safari = /safari/.test(Mn) && !iE && !oE;
      var Qr;
      _a &&
        tE.on("touchstart mousedown", function (e) {
          Qr = e.target;
        });
      ge.validClick = _a
        ? function (e) {
            return e === Qr || lt.contains(e, Qr);
          }
        : function () {
            return !0;
          };
      var Ia = "resize.webflow orientationchange.webflow load.webflow",
        aE = "scroll.webflow " + Ia;
      ge.resize = Jr(Ve, Ia);
      ge.scroll = Jr(Ve, aE);
      ge.redraw = Jr();
      function Jr(e, t) {
        var n = [],
          r = {};
        return (
          (r.up = We.throttle(function (i) {
            We.each(n, function (o) {
              o(i);
            });
          })),
          e && t && e.on(t, r.up),
          (r.on = function (i) {
            typeof i == "function" && (We.contains(n, i) || n.push(i));
          }),
          (r.off = function (i) {
            if (!arguments.length) {
              n = [];
              return;
            }
            n = We.filter(n, function (o) {
              return o !== i;
            });
          }),
          r
        );
      }
      ge.location = function (e) {
        window.location = e;
      };
      ge.env() && (ge.location = function () {});
      ge.ready = function () {
        (Fn = !0), Zr ? sE() : We.each(xt, va), We.each($r, va), ge.resize.up();
      };
      function va(e) {
        $e(e) && e();
      }
      function sE() {
        (Zr = !1), We.each(St, ma);
      }
      var mt;
      ge.load = function (e) {
        mt.then(e);
      };
      function Ta() {
        mt && (mt.reject(), Ve.off("load", mt.resolve)),
          (mt = new lt.Deferred()),
          Ve.on("load", mt.resolve);
      }
      ge.destroy = function (e) {
        (e = e || {}),
          (Zr = !0),
          Ve.triggerHandler("__wf_destroy"),
          e.domready != null && (Fn = e.domready),
          We.each(St, ya),
          ge.resize.off(),
          ge.scroll.off(),
          ge.redraw.off(),
          (xt = []),
          ($r = []),
          mt.state() === "pending" && Ta();
      };
      lt(ge.ready);
      Ta();
      ba.exports = window.Webflow = ge;
    });
    var Oa = d((qF, Aa) => {
      "use strict";
      var wa = De();
      wa.define(
        "brand",
        (Aa.exports = function (e) {
          var t = {},
            n = document,
            r = e("html"),
            i = e("body"),
            o = ".w-webflow-badge",
            a = window.location,
            u = /PhantomJS/i.test(navigator.userAgent),
            s =
              "fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange",
            f;
          t.ready = function () {
            var E = r.attr("data-wf-status"),
              T = r.attr("data-wf-domain") || "";
            /\.webflow\.io$/i.test(T) && a.hostname !== T && (E = !0),
              E &&
                !u &&
                ((f = f || v()),
                g(),
                setTimeout(g, 500),
                e(n).off(s, m).on(s, m));
          };
          function m() {
            var E =
              n.fullScreen ||
              n.mozFullScreen ||
              n.webkitIsFullScreen ||
              n.msFullscreenElement ||
              !!n.webkitFullscreenElement;
            e(f).attr("style", E ? "display: none !important;" : "");
          }
          function v() {
            var E = e('<a class=""></a>').attr(
                "href",
                ""
              ),
              T = e("<img>")
                .css({ marginRight: "0px", width: "0px", height: "0px"}),
              w = e("<img>")
                .attr(
                  "src",
                  ""
                )
                .attr("alt", "");
            return E.append(T, w), E[0];
          }
          function g() {
            var E = i.children(o),
              T = E.length && E.get(0) === f,
              w = wa.env("editor");
            if (T) {
              w && E.remove();
              return;
            }
            E.length && E.remove(), w || i.append(f);
          }
          return t;
        })
      );
    });
    var xa = d((kF, Sa) => {
      "use strict";
      var ei = De();
      ei.define(
        "edit",
        (Sa.exports = function (e, t, n) {
          if (
            ((n = n || {}),
            (ei.env("test") || ei.env("frame")) && !n.fixture && !uE())
          )
            return { exit: 1 };
          var r = {},
            i = e(window),
            o = e(document.documentElement),
            a = document.location,
            u = "hashchange",
            s,
            f = n.load || g,
            m = !1;
          try {
            m =
              localStorage &&
              localStorage.getItem &&
              localStorage.getItem("WebflowEditor");
          } catch {}
          m
            ? f()
            : a.search
            ? (/[?&](edit)(?:[=&?]|$)/.test(a.search) ||
                /\?edit$/.test(a.href)) &&
              f()
            : i.on(u, v).triggerHandler(u);
          function v() {
            s || (/\?edit/.test(a.hash) && f());
          }
          function g() {
            (s = !0),
              (window.WebflowEditor = !0),
              i.off(u, v),
              L(function (M) {
                e.ajax({
                  url: b("https://editor-api.webflow.com/api/editor/view"),
                  data: { siteId: o.attr("data-wf-site") },
                  xhrFields: { withCredentials: !0 },
                  dataType: "json",
                  crossDomain: !0,
                  success: E(M),
                });
              });
          }
          function E(M) {
            return function (F) {
              if (!F) {
                console.error("Could not load editor data");
                return;
              }
              (F.thirdPartyCookiesSupported = M),
                T(R(F.scriptPath), function () {
                  window.WebflowEditor(F);
                });
            };
          }
          function T(M, F) {
            e.ajax({ type: "GET", url: M, dataType: "script", cache: !0 }).then(
              F,
              w
            );
          }
          function w(M, F, N) {
            throw (console.error("Could not load editor script: " + F), N);
          }
          function R(M) {
            return M.indexOf("//") >= 0
              ? M
              : b("https://editor-api.webflow.com" + M);
          }
          function b(M) {
            return M.replace(/([^:])\/\//g, "$1/");
          }
          function L(M) {
            var F = window.document.createElement("iframe");
            (F.src = "https://webflow.com/site/third-party-cookie-check.html"),
              (F.style.display = "none"),
              (F.sandbox = "allow-scripts allow-same-origin");
            var N = function (V) {
              V.data === "WF_third_party_cookies_unsupported"
                ? (C(F, N), M(!1))
                : V.data === "WF_third_party_cookies_supported" &&
                  (C(F, N), M(!0));
            };
            (F.onerror = function () {
              C(F, N), M(!1);
            }),
              window.addEventListener("message", N, !1),
              window.document.body.appendChild(F);
          }
          function C(M, F) {
            window.removeEventListener("message", F, !1), M.remove();
          }
          return r;
        })
      );
      function uE() {
        try {
          return window.top.__Cypress__;
        } catch {
          return !1;
        }
      }
    });
    const scrollBtn = document.getElementById("scrollToTopBtn");
  
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  
    window.addEventListener("scroll", () => {
    if (window.scrollY > 1000) {
      scrollBtn.style.display = "flex";
    } else {
      scrollBtn.style.display = "none";
    }
  });
  
    scrollBtn.style.display = "none";
  
    const form = document.getElementById('contactForm');
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const formData = new FormData(form);
  
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          form.style.display = 'none';
          successMessage.style.display = 'block';
        } else {
          form.style.display = 'none';
          errorMessage.style.display = 'block';
        }
      })
      .catch(error => {
        form.style.display = 'none';
        errorMessage.style.display = 'block';
      });
    });
  
    form.reset();
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const correctAnswer = num1 + num2;
  
    document.getElementById('num1').textContent = num1;
    document.getElementById('num2').textContent = num2;
  
    // const form = document.getElementById('contactForm');
    // const successMessage = document.querySelector('.success-message');
    // const errorMessage = document.querySelector('.error-message');
    const captchaInput = document.getElementById('captchaInput');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default submission
  
      // Validate CAPTCHA
      if (parseInt(captchaInput.value) !== correctAnswer) {
        alert('Incorrect CAPTCHA answer. Please try again.');
        return;
      }
  
      // Proceed with FormSubmit submission
      const formData = new FormData(form);
  
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          form.style.display = 'none';
          successMessage.style.display = 'block';
          form.reset();
        } else {
          form.style.display = 'none';
          errorMessage.style.display = 'block';
          form.reset();
        }
      })
      .catch(error => {
        form.style.display = 'none';
        errorMessage.style.display = 'block';
      });
    });
  
    var Ca = d((GF, Ra) => {
      "use strict";
      var cE = De();
      cE.define(
        "focus-visible",
        (Ra.exports = function () {
          function e(n) {
            var r = !0,
              i = !1,
              o = null,
              a = {
                text: !0,
                search: !0,
                url: !0,
                tel: !0,
                email: !0,
                password: !0,
                number: !0,
                date: !0,
                month: !0,
                week: !0,
                time: !0,
                datetime: !0,
                "datetime-local": !0,
              };
            function u(C) {
              return !!(
                C &&
                C !== document &&
                C.nodeName !== "HTML" &&
                C.nodeName !== "BODY" &&
                "classList" in C &&
                "contains" in C.classList
              );
            }
            function s(C) {
              var M = C.type,
                F = C.tagName;
              return !!(
                (F === "INPUT" && a[M] && !C.readOnly) ||
                (F === "TEXTAREA" && !C.readOnly) ||
                C.isContentEditable
              );
            }
            function f(C) {
              C.getAttribute("data-wf-focus-visible") ||
                C.setAttribute("data-wf-focus-visible", "true");
            }
            function m(C) {
              C.getAttribute("data-wf-focus-visible") &&
                C.removeAttribute("data-wf-focus-visible");
            }
            function v(C) {
              C.metaKey ||
                C.altKey ||
                C.ctrlKey ||
                (u(n.activeElement) && f(n.activeElement), (r = !0));
            }
            function g() {
              r = !1;
            }
            function E(C) {
              u(C.target) && (r || s(C.target)) && f(C.target);
            }
            function T(C) {
              u(C.target) &&
                C.target.hasAttribute("data-wf-focus-visible") &&
                ((i = !0),
                window.clearTimeout(o),
                (o = window.setTimeout(function () {
                  i = !1;
                }, 100)),
                m(C.target));
            }
            function w() {
              document.visibilityState === "hidden" && (i && (r = !0), R());
            }
            function R() {
              document.addEventListener("mousemove", L),
                document.addEventListener("mousedown", L),
                document.addEventListener("mouseup", L),
                document.addEventListener("pointermove", L),
                document.addEventListener("pointerdown", L),
                document.addEventListener("pointerup", L),
                document.addEventListener("touchmove", L),
                document.addEventListener("touchstart", L),
                document.addEventListener("touchend", L);
            }
            function b() {
              document.removeEventListener("mousemove", L),
                document.removeEventListener("mousedown", L),
                document.removeEventListener("mouseup", L),
                document.removeEventListener("pointermove", L),
                document.removeEventListener("pointerdown", L),
                document.removeEventListener("pointerup", L),
                document.removeEventListener("touchmove", L),
                document.removeEventListener("touchstart", L),
                document.removeEventListener("touchend", L);
            }
            function L(C) {
              (C.target.nodeName && C.target.nodeName.toLowerCase() === "html") ||
                ((r = !1), b());
            }
            document.addEventListener("keydown", v, !0),
              document.addEventListener("mousedown", g, !0),
              document.addEventListener("pointerdown", g, !0),
              document.addEventListener("touchstart", g, !0),
              document.addEventListener("visibilitychange", w, !0),
              R(),
              n.addEventListener("focus", E, !0),
              n.addEventListener("blur", T, !0);
          }
          function t() {
            if (typeof document < "u")
              try {
                document.querySelector(":focus-visible");
              } catch {
                e(document);
              }
          }
          return { ready: t };
        })
      );
    });
    var Na = d((XF, La) => {
      "use strict";
      var Pa = De();
      Pa.define(
        "focus",
        (La.exports = function () {
          var e = [],
            t = !1;
          function n(a) {
            t &&
              (a.preventDefault(),
              a.stopPropagation(),
              a.stopImmediatePropagation(),
              e.unshift(a));
          }
          function r(a) {
            var u = a.target,
              s = u.tagName;
            return (
              (/^a$/i.test(s) && u.href != null) ||
              (/^(button|textarea)$/i.test(s) && u.disabled !== !0) ||
              (/^input$/i.test(s) &&
                /^(button|reset|submit|radio|checkbox)$/i.test(u.type) &&
                !u.disabled) ||
              (!/^(button|input|textarea|select|a)$/i.test(s) &&
                !Number.isNaN(Number.parseFloat(u.tabIndex))) ||
              /^audio$/i.test(s) ||
              (/^video$/i.test(s) && u.controls === !0)
            );
          }
          function i(a) {
            r(a) &&
              ((t = !0),
              setTimeout(() => {
                for (t = !1, a.target.focus(); e.length > 0; ) {
                  var u = e.pop();
                  u.target.dispatchEvent(new MouseEvent(u.type, u));
                }
              }, 0));
          }
          function o() {
            typeof document < "u" &&
              document.body.hasAttribute("data-wf-focus-within") &&
              Pa.env.safari &&
              (document.addEventListener("mousedown", i, !0),
              document.addEventListener("mouseup", n, !0),
              document.addEventListener("click", n, !0));
          }
          return { ready: o };
        })
      );
    });
    var Fa = d((UF, Ma) => {
      "use strict";
      var ti = window.jQuery,
        Ze = {},
        qn = [],
        Da = ".w-ix",
        kn = {
          reset: function (e, t) {
            t.__wf_intro = null;
          },
          intro: function (e, t) {
            t.__wf_intro ||
              ((t.__wf_intro = !0), ti(t).triggerHandler(Ze.types.INTRO));
          },
          outro: function (e, t) {
            t.__wf_intro &&
              ((t.__wf_intro = null), ti(t).triggerHandler(Ze.types.OUTRO));
          },
        };
      Ze.triggers = {};
      Ze.types = { INTRO: "w-ix-intro" + Da, OUTRO: "w-ix-outro" + Da };
      Ze.init = function () {
        for (var e = qn.length, t = 0; t < e; t++) {
          var n = qn[t];
          n[0](0, n[1]);
        }
        (qn = []), ti.extend(Ze.triggers, kn);
      };
      Ze.async = function () {
        for (var e in kn) {
          var t = kn[e];
          kn.hasOwnProperty(e) &&
            (Ze.triggers[e] = function (n, r) {
              qn.push([t, r]);
            });
        }
      };
      Ze.async();
      Ma.exports = Ze;
    });
    var rn = d((WF, Ga) => {
      "use strict";
      var ni = Fa();
      function qa(e, t) {
        var n = document.createEvent("CustomEvent");
        n.initCustomEvent(t, !0, !0, null), e.dispatchEvent(n);
      }
      var lE = window.jQuery,
        Gn = {},
        ka = ".w-ix",
        fE = {
          reset: function (e, t) {
            ni.triggers.reset(e, t);
          },
          intro: function (e, t) {
            ni.triggers.intro(e, t), qa(t, "COMPONENT_ACTIVE");
          },
          outro: function (e, t) {
            ni.triggers.outro(e, t), qa(t, "COMPONENT_INACTIVE");
          },
        };
      Gn.triggers = {};
      Gn.types = { INTRO: "w-ix-intro" + ka, OUTRO: "w-ix-outro" + ka };
      lE.extend(Gn.triggers, fE);
      Ga.exports = Gn;
    });
    var ri = d((VF, Xa) => {
      var dE =
        typeof global == "object" && global && global.Object === Object && global;
      Xa.exports = dE;
    });
    var He = d((HF, Ua) => {
      var pE = ri(),
        gE = typeof self == "object" && self && self.Object === Object && self,
        hE = pE || gE || Function("return this")();
      Ua.exports = hE;
    });
    var Rt = d((BF, Wa) => {
      var vE = He(),
        EE = vE.Symbol;
      Wa.exports = EE;
    });
    var za = d((zF, Ba) => {
      var Va = Rt(),
        Ha = Object.prototype,
        mE = Ha.hasOwnProperty,
        yE = Ha.toString,
        on = Va ? Va.toStringTag : void 0;
      function _E(e) {
        var t = mE.call(e, on),
          n = e[on];
        try {
          e[on] = void 0;
          var r = !0;
        } catch {}
        var i = yE.call(e);
        return r && (t ? (e[on] = n) : delete e[on]), i;
      }
      Ba.exports = _E;
    });
    var ja = d((KF, Ka) => {
      var IE = Object.prototype,
        TE = IE.toString;
      function bE(e) {
        return TE.call(e);
      }
      Ka.exports = bE;
    });
    var ft = d((jF, $a) => {
      var Ya = Rt(),
        wE = za(),
        AE = ja(),
        OE = "[object Null]",
        SE = "[object Undefined]",
        Qa = Ya ? Ya.toStringTag : void 0;
      function xE(e) {
        return e == null
          ? e === void 0
            ? SE
            : OE
          : Qa && Qa in Object(e)
          ? wE(e)
          : AE(e);
      }
      $a.exports = xE;
    });
    var ii = d((YF, Za) => {
      function RE(e, t) {
        return function (n) {
          return e(t(n));
        };
      }
      Za.exports = RE;
    });
    var oi = d((QF, Ja) => {
      var CE = ii(),
        PE = CE(Object.getPrototypeOf, Object);
      Ja.exports = PE;
    });
    var ot = d(($F, es) => {
      function LE(e) {
        return e != null && typeof e == "object";
      }
      es.exports = LE;
    });
    var ai = d((ZF, ns) => {
      var NE = ft(),
        DE = oi(),
        ME = ot(),
        FE = "[object Object]",
        qE = Function.prototype,
        kE = Object.prototype,
        ts = qE.toString,
        GE = kE.hasOwnProperty,
        XE = ts.call(Object);
      function UE(e) {
        if (!ME(e) || NE(e) != FE) return !1;
        var t = DE(e);
        if (t === null) return !0;
        var n = GE.call(t, "constructor") && t.constructor;
        return typeof n == "function" && n instanceof n && ts.call(n) == XE;
      }
      ns.exports = UE;
    });
    var rs = d((si) => {
      "use strict";
      Object.defineProperty(si, "__esModule", { value: !0 });
      si.default = WE;
      function WE(e) {
        var t,
          n = e.Symbol;
        return (
          typeof n == "function"
            ? n.observable
              ? (t = n.observable)
              : ((t = n("observable")), (n.observable = t))
            : (t = "@@observable"),
          t
        );
      }
    });
    var is = d((ci, ui) => {
      "use strict";
      Object.defineProperty(ci, "__esModule", { value: !0 });
      var VE = rs(),
        HE = BE(VE);
      function BE(e) {
        return e && e.__esModule ? e : { default: e };
      }
      var Ct;
      typeof self < "u"
        ? (Ct = self)
        : typeof window < "u"
        ? (Ct = window)
        : typeof global < "u"
        ? (Ct = global)
        : typeof ui < "u"
        ? (Ct = ui)
        : (Ct = Function("return this")());
      var zE = (0, HE.default)(Ct);
      ci.default = zE;
    });
    var li = d((an) => {
      "use strict";
      an.__esModule = !0;
      an.ActionTypes = void 0;
      an.default = us;
      var KE = ai(),
        jE = ss(KE),
        YE = is(),
        os = ss(YE);
      function ss(e) {
        return e && e.__esModule ? e : { default: e };
      }
      var as = (an.ActionTypes = { INIT: "@@redux/INIT" });
      function us(e, t, n) {
        var r;
        if (
          (typeof t == "function" && typeof n > "u" && ((n = t), (t = void 0)),
          typeof n < "u")
        ) {
          if (typeof n != "function")
            throw new Error("Expected the enhancer to be a function.");
          return n(us)(e, t);
        }
        if (typeof e != "function")
          throw new Error("Expected the reducer to be a function.");
        var i = e,
          o = t,
          a = [],
          u = a,
          s = !1;
        function f() {
          u === a && (u = a.slice());
        }
        function m() {
          return o;
        }
        function v(w) {
          if (typeof w != "function")
            throw new Error("Expected listener to be a function.");
          var R = !0;
          return (
            f(),
            u.push(w),
            function () {
              if (R) {
                (R = !1), f();
                var L = u.indexOf(w);
                u.splice(L, 1);
              }
            }
          );
        }
        function g(w) {
          if (!(0, jE.default)(w))
            throw new Error(
              "Actions must be plain objects. Use custom middleware for async actions."
            );
          if (typeof w.type > "u")
            throw new Error(
              'Actions may not have an undefined "type" property. Have you misspelled a constant?'
            );
          if (s) throw new Error("Reducers may not dispatch actions.");
          try {
            (s = !0), (o = i(o, w));
          } finally {
            s = !1;
          }
          for (var R = (a = u), b = 0; b < R.length; b++) R[b]();
          return w;
        }
        function E(w) {
          if (typeof w != "function")
            throw new Error("Expected the nextReducer to be a function.");
          (i = w), g({ type: as.INIT });
        }
        function T() {
          var w,
            R = v;
          return (
            (w = {
              subscribe: function (L) {
                if (typeof L != "object")
                  throw new TypeError("Expected the observer to be an object.");
                function C() {
                  L.next && L.next(m());
                }
                C();
                var M = R(C);
                return { unsubscribe: M };
              },
            }),
            (w[os.default] = function () {
              return this;
            }),
            w
          );
        }
        return (
          g({ type: as.INIT }),
          (r = { dispatch: g, subscribe: v, getState: m, replaceReducer: E }),
          (r[os.default] = T),
          r
        );
      }
    });
    var di = d((fi) => {
      "use strict";
      fi.__esModule = !0;
      fi.default = QE;
      function QE(e) {
        typeof console < "u" &&
          typeof console.error == "function" &&
          console.error(e);
        try {
          throw new Error(e);
        } catch {}
      }
    });
    var fs = d((pi) => {
      "use strict";
      pi.__esModule = !0;
      pi.default = tm;
      var cs = li(),
        $E = ai(),
        n1 = ls($E),
        ZE = di(),
        r1 = ls(ZE);
      function ls(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function JE(e, t) {
        var n = t && t.type,
          r = (n && '"' + n.toString() + '"') || "an action";
        return (
          "Given action " +
          r +
          ', reducer "' +
          e +
          '" returned undefined. To ignore an action, you must explicitly return the previous state.'
        );
      }
      function em(e) {
        Object.keys(e).forEach(function (t) {
          var n = e[t],
            r = n(void 0, { type: cs.ActionTypes.INIT });
          if (typeof r > "u")
            throw new Error(
              'Reducer "' +
                t +
                '" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined.'
            );
          var i =
            "@@redux/PROBE_UNKNOWN_ACTION_" +
            Math.random().toString(36).substring(7).split("").join(".");
          if (typeof n(void 0, { type: i }) > "u")
            throw new Error(
              'Reducer "' +
                t +
                '" returned undefined when probed with a random type. ' +
                ("Don't try to handle " +
                  cs.ActionTypes.INIT +
                  ' or other actions in "redux/*" ') +
                "namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined."
            );
        });
      }
      function tm(e) {
        for (var t = Object.keys(e), n = {}, r = 0; r < t.length; r++) {
          var i = t[r];
          typeof e[i] == "function" && (n[i] = e[i]);
        }
        var o = Object.keys(n);
        if (!1) var a;
        var u;
        try {
          em(n);
        } catch (s) {
          u = s;
        }
        return function () {
          var f =
              arguments.length <= 0 || arguments[0] === void 0
                ? {}
                : arguments[0],
            m = arguments[1];
          if (u) throw u;
          if (!1) var v;
          for (var g = !1, E = {}, T = 0; T < o.length; T++) {
            var w = o[T],
              R = n[w],
              b = f[w],
              L = R(b, m);
            if (typeof L > "u") {
              var C = JE(w, m);
              throw new Error(C);
            }
            (E[w] = L), (g = g || L !== b);
          }
          return g ? E : f;
        };
      }
    });
    var ps = d((gi) => {
      "use strict";
      gi.__esModule = !0;
      gi.default = nm;
      function ds(e, t) {
        return function () {
          return t(e.apply(void 0, arguments));
        };
      }
      function nm(e, t) {
        if (typeof e == "function") return ds(e, t);
        if (typeof e != "object" || e === null)
          throw new Error(
            "bindActionCreators expected an object or a function, instead received " +
              (e === null ? "null" : typeof e) +
              '. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?'
          );
        for (var n = Object.keys(e), r = {}, i = 0; i < n.length; i++) {
          var o = n[i],
            a = e[o];
          typeof a == "function" && (r[o] = ds(a, t));
        }
        return r;
      }
    });
    var vi = d((hi) => {
      "use strict";
      hi.__esModule = !0;
      hi.default = rm;
      function rm() {
        for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
          t[n] = arguments[n];
        if (t.length === 0)
          return function (o) {
            return o;
          };
        if (t.length === 1) return t[0];
        var r = t[t.length - 1],
          i = t.slice(0, -1);
        return function () {
          return i.reduceRight(function (o, a) {
            return a(o);
          }, r.apply(void 0, arguments));
        };
      }
    });
    var gs = d((Ei) => {
      "use strict";
      Ei.__esModule = !0;
      var im =
        Object.assign ||
        function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        };
      Ei.default = um;
      var om = vi(),
        am = sm(om);
      function sm(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function um() {
        for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
          t[n] = arguments[n];
        return function (r) {
          return function (i, o, a) {
            var u = r(i, o, a),
              s = u.dispatch,
              f = [],
              m = {
                getState: u.getState,
                dispatch: function (g) {
                  return s(g);
                },
              };
            return (
              (f = t.map(function (v) {
                return v(m);
              })),
              (s = am.default.apply(void 0, f)(u.dispatch)),
              im({}, u, { dispatch: s })
            );
          };
        };
      }
    });
    var mi = d((ke) => {
      "use strict";
      ke.__esModule = !0;
      ke.compose =
        ke.applyMiddleware =
        ke.bindActionCreators =
        ke.combineReducers =
        ke.createStore =
          void 0;
      var cm = li(),
        lm = Pt(cm),
        fm = fs(),
        dm = Pt(fm),
        pm = ps(),
        gm = Pt(pm),
        hm = gs(),
        vm = Pt(hm),
        Em = vi(),
        mm = Pt(Em),
        ym = di(),
        u1 = Pt(ym);
      function Pt(e) {
        return e && e.__esModule ? e : { default: e };
      }
      ke.createStore = lm.default;
      ke.combineReducers = dm.default;
      ke.bindActionCreators = gm.default;
      ke.applyMiddleware = vm.default;
      ke.compose = mm.default;
    });
    var Be,
      yi,
      Je,
      _m,
      Im,
      Xn,
      Tm,
      _i = Ee(() => {
        "use strict";
        (Be = {
          NAVBAR_OPEN: "NAVBAR_OPEN",
          NAVBAR_CLOSE: "NAVBAR_CLOSE",
          TAB_ACTIVE: "TAB_ACTIVE",
          TAB_INACTIVE: "TAB_INACTIVE",
          SLIDER_ACTIVE: "SLIDER_ACTIVE",
          SLIDER_INACTIVE: "SLIDER_INACTIVE",
          DROPDOWN_OPEN: "DROPDOWN_OPEN",
          DROPDOWN_CLOSE: "DROPDOWN_CLOSE",
          MOUSE_CLICK: "MOUSE_CLICK",
          MOUSE_SECOND_CLICK: "MOUSE_SECOND_CLICK",
          MOUSE_DOWN: "MOUSE_DOWN",
          MOUSE_UP: "MOUSE_UP",
          MOUSE_OVER: "MOUSE_OVER",
          MOUSE_OUT: "MOUSE_OUT",
          MOUSE_MOVE: "MOUSE_MOVE",
          MOUSE_MOVE_IN_VIEWPORT: "MOUSE_MOVE_IN_VIEWPORT",
          SCROLL_INTO_VIEW: "SCROLL_INTO_VIEW",
          SCROLL_OUT_OF_VIEW: "SCROLL_OUT_OF_VIEW",
          SCROLLING_IN_VIEW: "SCROLLING_IN_VIEW",
          ECOMMERCE_CART_OPEN: "ECOMMERCE_CART_OPEN",
          ECOMMERCE_CART_CLOSE: "ECOMMERCE_CART_CLOSE",
          PAGE_START: "PAGE_START",
          PAGE_FINISH: "PAGE_FINISH",
          PAGE_SCROLL_UP: "PAGE_SCROLL_UP",
          PAGE_SCROLL_DOWN: "PAGE_SCROLL_DOWN",
          PAGE_SCROLL: "PAGE_SCROLL",
        }),
          (yi = { ELEMENT: "ELEMENT", CLASS: "CLASS", PAGE: "PAGE" }),
          (Je = { ELEMENT: "ELEMENT", VIEWPORT: "VIEWPORT" }),
          (_m = { X_AXIS: "X_AXIS", Y_AXIS: "Y_AXIS" }),
          (Im = {
            CHILDREN: "CHILDREN",
            SIBLINGS: "SIBLINGS",
            IMMEDIATE_CHILDREN: "IMMEDIATE_CHILDREN",
          }),
          (Xn = {
            FADE_EFFECT: "FADE_EFFECT",
            SLIDE_EFFECT: "SLIDE_EFFECT",
            GROW_EFFECT: "GROW_EFFECT",
            SHRINK_EFFECT: "SHRINK_EFFECT",
            SPIN_EFFECT: "SPIN_EFFECT",
            FLY_EFFECT: "FLY_EFFECT",
            POP_EFFECT: "POP_EFFECT",
            FLIP_EFFECT: "FLIP_EFFECT",
            JIGGLE_EFFECT: "JIGGLE_EFFECT",
            PULSE_EFFECT: "PULSE_EFFECT",
            DROP_EFFECT: "DROP_EFFECT",
            BLINK_EFFECT: "BLINK_EFFECT",
            BOUNCE_EFFECT: "BOUNCE_EFFECT",
            FLIP_LEFT_TO_RIGHT_EFFECT: "FLIP_LEFT_TO_RIGHT_EFFECT",
            FLIP_RIGHT_TO_LEFT_EFFECT: "FLIP_RIGHT_TO_LEFT_EFFECT",
            RUBBER_BAND_EFFECT: "RUBBER_BAND_EFFECT",
            JELLO_EFFECT: "JELLO_EFFECT",
            GROW_BIG_EFFECT: "GROW_BIG_EFFECT",
            SHRINK_BIG_EFFECT: "SHRINK_BIG_EFFECT",
            PLUGIN_LOTTIE_EFFECT: "PLUGIN_LOTTIE_EFFECT",
          }),
          (Tm = {
            LEFT: "LEFT",
            RIGHT: "RIGHT",
            BOTTOM: "BOTTOM",
            TOP: "TOP",
            BOTTOM_LEFT: "BOTTOM_LEFT",
            BOTTOM_RIGHT: "BOTTOM_RIGHT",
            TOP_RIGHT: "TOP_RIGHT",
            TOP_LEFT: "TOP_LEFT",
            CLOCKWISE: "CLOCKWISE",
            COUNTER_CLOCKWISE: "COUNTER_CLOCKWISE",
          });
      });
    var xe,
      bm,
      Un = Ee(() => {
        "use strict";
        (xe = {
          TRANSFORM_MOVE: "TRANSFORM_MOVE",
          TRANSFORM_SCALE: "TRANSFORM_SCALE",
          TRANSFORM_ROTATE: "TRANSFORM_ROTATE",
          TRANSFORM_SKEW: "TRANSFORM_SKEW",
          STYLE_OPACITY: "STYLE_OPACITY",
          STYLE_SIZE: "STYLE_SIZE",
          STYLE_FILTER: "STYLE_FILTER",
          STYLE_FONT_VARIATION: "STYLE_FONT_VARIATION",
          STYLE_BACKGROUND_COLOR: "STYLE_BACKGROUND_COLOR",
          STYLE_BORDER: "STYLE_BORDER",
          STYLE_TEXT_COLOR: "STYLE_TEXT_COLOR",
          OBJECT_VALUE: "OBJECT_VALUE",
          PLUGIN_LOTTIE: "PLUGIN_LOTTIE",
          PLUGIN_SPLINE: "PLUGIN_SPLINE",
          PLUGIN_RIVE: "PLUGIN_RIVE",
          PLUGIN_VARIABLE: "PLUGIN_VARIABLE",
          GENERAL_DISPLAY: "GENERAL_DISPLAY",
          GENERAL_START_ACTION: "GENERAL_START_ACTION",
          GENERAL_CONTINUOUS_ACTION: "GENERAL_CONTINUOUS_ACTION",
          GENERAL_COMBO_CLASS: "GENERAL_COMBO_CLASS",
          GENERAL_STOP_ACTION: "GENERAL_STOP_ACTION",
          GENERAL_LOOP: "GENERAL_LOOP",
          STYLE_BOX_SHADOW: "STYLE_BOX_SHADOW",
        }),
          (bm = {
            ELEMENT: "ELEMENT",
            ELEMENT_CLASS: "ELEMENT_CLASS",
            TRIGGER_ELEMENT: "TRIGGER_ELEMENT",
          });
      });
    var wm,
      hs = Ee(() => {
        "use strict";
        wm = {
          MOUSE_CLICK_INTERACTION: "MOUSE_CLICK_INTERACTION",
          MOUSE_HOVER_INTERACTION: "MOUSE_HOVER_INTERACTION",
          MOUSE_MOVE_INTERACTION: "MOUSE_MOVE_INTERACTION",
          SCROLL_INTO_VIEW_INTERACTION: "SCROLL_INTO_VIEW_INTERACTION",
          SCROLLING_IN_VIEW_INTERACTION: "SCROLLING_IN_VIEW_INTERACTION",
          MOUSE_MOVE_IN_VIEWPORT_INTERACTION:
            "MOUSE_MOVE_IN_VIEWPORT_INTERACTION",
          PAGE_IS_SCROLLING_INTERACTION: "PAGE_IS_SCROLLING_INTERACTION",
          PAGE_LOAD_INTERACTION: "PAGE_LOAD_INTERACTION",
          PAGE_SCROLLED_INTERACTION: "PAGE_SCROLLED_INTERACTION",
          NAVBAR_INTERACTION: "NAVBAR_INTERACTION",
          DROPDOWN_INTERACTION: "DROPDOWN_INTERACTION",
          ECOMMERCE_CART_INTERACTION: "ECOMMERCE_CART_INTERACTION",
          TAB_INTERACTION: "TAB_INTERACTION",
          SLIDER_INTERACTION: "SLIDER_INTERACTION",
        };
      });
    var Am,
      Om,
      Sm,
      xm,
      Rm,
      Cm,
      Pm,
      Ii,
      vs = Ee(() => {
        "use strict";
        Un();
        ({
          TRANSFORM_MOVE: Am,
          TRANSFORM_SCALE: Om,
          TRANSFORM_ROTATE: Sm,
          TRANSFORM_SKEW: xm,
          STYLE_SIZE: Rm,
          STYLE_FILTER: Cm,
          STYLE_FONT_VARIATION: Pm,
        } = xe),
          (Ii = {
            [Am]: !0,
            [Om]: !0,
            [Sm]: !0,
            [xm]: !0,
            [Rm]: !0,
            [Cm]: !0,
            [Pm]: !0,
          });
      });
    var Te = {};
    Ne(Te, {
      IX2_ACTION_LIST_PLAYBACK_CHANGED: () => jm,
      IX2_ANIMATION_FRAME_CHANGED: () => Wm,
      IX2_CLEAR_REQUESTED: () => Gm,
      IX2_ELEMENT_STATE_CHANGED: () => Km,
      IX2_EVENT_LISTENER_ADDED: () => Xm,
      IX2_EVENT_STATE_CHANGED: () => Um,
      IX2_INSTANCE_ADDED: () => Hm,
      IX2_INSTANCE_REMOVED: () => zm,
      IX2_INSTANCE_STARTED: () => Bm,
      IX2_MEDIA_QUERIES_DEFINED: () => Qm,
      IX2_PARAMETER_CHANGED: () => Vm,
      IX2_PLAYBACK_REQUESTED: () => qm,
      IX2_PREVIEW_REQUESTED: () => Fm,
      IX2_RAW_DATA_IMPORTED: () => Lm,
      IX2_SESSION_INITIALIZED: () => Nm,
      IX2_SESSION_STARTED: () => Dm,
      IX2_SESSION_STOPPED: () => Mm,
      IX2_STOP_REQUESTED: () => km,
      IX2_TEST_FRAME_RENDERED: () => $m,
      IX2_VIEWPORT_WIDTH_CHANGED: () => Ym,
    });
    var Lm,
      Nm,
      Dm,
      Mm,
      Fm,
      qm,
      km,
      Gm,
      Xm,
      Um,
      Wm,
      Vm,
      Hm,
      Bm,
      zm,
      Km,
      jm,
      Ym,
      Qm,
      $m,
      Es = Ee(() => {
        "use strict";
        (Lm = "IX2_RAW_DATA_IMPORTED"),
          (Nm = "IX2_SESSION_INITIALIZED"),
          (Dm = "IX2_SESSION_STARTED"),
          (Mm = "IX2_SESSION_STOPPED"),
          (Fm = "IX2_PREVIEW_REQUESTED"),
          (qm = "IX2_PLAYBACK_REQUESTED"),
          (km = "IX2_STOP_REQUESTED"),
          (Gm = "IX2_CLEAR_REQUESTED"),
          (Xm = "IX2_EVENT_LISTENER_ADDED"),
          (Um = "IX2_EVENT_STATE_CHANGED"),
          (Wm = "IX2_ANIMATION_FRAME_CHANGED"),
          (Vm = "IX2_PARAMETER_CHANGED"),
          (Hm = "IX2_INSTANCE_ADDED"),
          (Bm = "IX2_INSTANCE_STARTED"),
          (zm = "IX2_INSTANCE_REMOVED"),
          (Km = "IX2_ELEMENT_STATE_CHANGED"),
          (jm = "IX2_ACTION_LIST_PLAYBACK_CHANGED"),
          (Ym = "IX2_VIEWPORT_WIDTH_CHANGED"),
          (Qm = "IX2_MEDIA_QUERIES_DEFINED"),
          ($m = "IX2_TEST_FRAME_RENDERED");
      });
    var Ae = {};
    Ne(Ae, {
      ABSTRACT_NODE: () => Yy,
      AUTO: () => ky,
      BACKGROUND: () => Ly,
      BACKGROUND_COLOR: () => Py,
      BAR_DELIMITER: () => Uy,
      BORDER_COLOR: () => Ny,
      BOUNDARY_SELECTOR: () => ny,
      CHILDREN: () => Wy,
      COLON_DELIMITER: () => Xy,
      COLOR: () => Dy,
      COMMA_DELIMITER: () => Gy,
      CONFIG_UNIT: () => ly,
      CONFIG_VALUE: () => ay,
      CONFIG_X_UNIT: () => sy,
      CONFIG_X_VALUE: () => ry,
      CONFIG_Y_UNIT: () => uy,
      CONFIG_Y_VALUE: () => iy,
      CONFIG_Z_UNIT: () => cy,
      CONFIG_Z_VALUE: () => oy,
      DISPLAY: () => My,
      FILTER: () => Sy,
      FLEX: () => Fy,
      FONT_VARIATION_SETTINGS: () => xy,
      HEIGHT: () => Cy,
      HTML_ELEMENT: () => Ky,
      IMMEDIATE_CHILDREN: () => Vy,
      IX2_ID_DELIMITER: () => Zm,
      OPACITY: () => Oy,
      PARENT: () => By,
      PLAIN_OBJECT: () => jy,
      PRESERVE_3D: () => zy,
      RENDER_GENERAL: () => $y,
      RENDER_PLUGIN: () => Jy,
      RENDER_STYLE: () => Zy,
      RENDER_TRANSFORM: () => Qy,
      ROTATE_X: () => _y,
      ROTATE_Y: () => Iy,
      ROTATE_Z: () => Ty,
      SCALE_3D: () => yy,
      SCALE_X: () => vy,
      SCALE_Y: () => Ey,
      SCALE_Z: () => my,
      SIBLINGS: () => Hy,
      SKEW: () => by,
      SKEW_X: () => wy,
      SKEW_Y: () => Ay,
      TRANSFORM: () => fy,
      TRANSLATE_3D: () => hy,
      TRANSLATE_X: () => dy,
      TRANSLATE_Y: () => py,
      TRANSLATE_Z: () => gy,
      WF_PAGE: () => Jm,
      WIDTH: () => Ry,
      WILL_CHANGE: () => qy,
      W_MOD_IX: () => ty,
      W_MOD_JS: () => ey,
    });
    var Zm,
      Jm,
      ey,
      ty,
      ny,
      ry,
      iy,
      oy,
      ay,
      sy,
      uy,
      cy,
      ly,
      fy,
      dy,
      py,
      gy,
      hy,
      vy,
      Ey,
      my,
      yy,
      _y,
      Iy,
      Ty,
      by,
      wy,
      Ay,
      Oy,
      Sy,
      xy,
      Ry,
      Cy,
      Py,
      Ly,
      Ny,
      Dy,
      My,
      Fy,
      qy,
      ky,
      Gy,
      Xy,
      Uy,
      Wy,
      Vy,
      Hy,
      By,
      zy,
      Ky,
      jy,
      Yy,
      Qy,
      $y,
      Zy,
      Jy,
      ms = Ee(() => {
        "use strict";
        (Zm = "|"),
          (Jm = "data-wf-page"),
          (ey = "w-mod-js"),
          (ty = "w-mod-ix"),
          (ny = ".w-dyn-item"),
          (ry = "xValue"),
          (iy = "yValue"),
          (oy = "zValue"),
          (ay = "value"),
          (sy = "xUnit"),
          (uy = "yUnit"),
          (cy = "zUnit"),
          (ly = "unit"),
          (fy = "transform"),
          (dy = "translateX"),
          (py = "translateY"),
          (gy = "translateZ"),
          (hy = "translate3d"),
          (vy = "scaleX"),
          (Ey = "scaleY"),
          (my = "scaleZ"),
          (yy = "scale3d"),
          (_y = "rotateX"),
          (Iy = "rotateY"),
          (Ty = "rotateZ"),
          (by = "skew"),
          (wy = "skewX"),
          (Ay = "skewY"),
          (Oy = "opacity"),
          (Sy = "filter"),
          (xy = "font-variation-settings"),
          (Ry = "width"),
          (Cy = "height"),
          (Py = "backgroundColor"),
          (Ly = "background"),
          (Ny = "borderColor"),
          (Dy = "color"),
          (My = "display"),
          (Fy = "flex"),
          (qy = "willChange"),
          (ky = "AUTO"),
          (Gy = ","),
          (Xy = ":"),
          (Uy = "|"),
          (Wy = "CHILDREN"),
          (Vy = "IMMEDIATE_CHILDREN"),
          (Hy = "SIBLINGS"),
          (By = "PARENT"),
          (zy = "preserve-3d"),
          (Ky = "HTML_ELEMENT"),
          (jy = "PLAIN_OBJECT"),
          (Yy = "ABSTRACT_NODE"),
          (Qy = "RENDER_TRANSFORM"),
          ($y = "RENDER_GENERAL"),
          (Zy = "RENDER_STYLE"),
          (Jy = "RENDER_PLUGIN");
      });
    var ys = {};
    Ne(ys, {
      ActionAppliesTo: () => bm,
      ActionTypeConsts: () => xe,
      EventAppliesTo: () => yi,
      EventBasedOn: () => Je,
      EventContinuousMouseAxes: () => _m,
      EventLimitAffectedElements: () => Im,
      EventTypeConsts: () => Be,
      IX2EngineActionTypes: () => Te,
      IX2EngineConstants: () => Ae,
      InteractionTypeConsts: () => wm,
      QuickEffectDirectionConsts: () => Tm,
      QuickEffectIds: () => Xn,
      ReducedMotionTypes: () => Ii,
    });
    var Me = Ee(() => {
      "use strict";
      _i();
      Un();
      hs();
      vs();
      Es();
      ms();
      Un();
      _i();
    });
    var e_,
      _s,
      Is = Ee(() => {
        "use strict";
        Me();
        ({ IX2_RAW_DATA_IMPORTED: e_ } = Te),
          (_s = (e = Object.freeze({}), t) => {
            switch (t.type) {
              case e_:
                return t.payload.ixData || Object.freeze({});
              default:
                return e;
            }
          });
      });
    var Lt = d((ye) => {
      "use strict";
      Object.defineProperty(ye, "__esModule", { value: !0 });
      var t_ =
        typeof Symbol == "function" && typeof Symbol.iterator == "symbol"
          ? function (e) {
              return typeof e;
            }
          : function (e) {
              return e &&
                typeof Symbol == "function" &&
                e.constructor === Symbol &&
                e !== Symbol.prototype
                ? "symbol"
                : typeof e;
            };
      ye.clone = Vn;
      ye.addLast = ws;
      ye.addFirst = As;
      ye.removeLast = Os;
      ye.removeFirst = Ss;
      ye.insert = xs;
      ye.removeAt = Rs;
      ye.replaceAt = Cs;
      ye.getIn = Hn;
      ye.set = Bn;
      ye.setIn = zn;
      ye.update = Ls;
      ye.updateIn = Ns;
      ye.merge = Ds;
      ye.mergeDeep = Ms;
      ye.mergeIn = Fs;
      ye.omit = qs;
      ye.addDefaults = ks;
      var Ts = "INVALID_ARGS";
      function bs(e) {
        throw new Error(e);
      }
      function Ti(e) {
        var t = Object.keys(e);
        return Object.getOwnPropertySymbols
          ? t.concat(Object.getOwnPropertySymbols(e))
          : t;
      }
      var n_ = {}.hasOwnProperty;
      function Vn(e) {
        if (Array.isArray(e)) return e.slice();
        for (var t = Ti(e), n = {}, r = 0; r < t.length; r++) {
          var i = t[r];
          n[i] = e[i];
        }
        return n;
      }
      function Fe(e, t, n) {
        var r = n;
        r == null && bs(Ts);
        for (
          var i = !1, o = arguments.length, a = Array(o > 3 ? o - 3 : 0), u = 3;
          u < o;
          u++
        )
          a[u - 3] = arguments[u];
        for (var s = 0; s < a.length; s++) {
          var f = a[s];
          if (f != null) {
            var m = Ti(f);
            if (m.length)
              for (var v = 0; v <= m.length; v++) {
                var g = m[v];
                if (!(e && r[g] !== void 0)) {
                  var E = f[g];
                  t && Wn(r[g]) && Wn(E) && (E = Fe(e, t, r[g], E)),
                    !(E === void 0 || E === r[g]) &&
                      (i || ((i = !0), (r = Vn(r))), (r[g] = E));
                }
              }
          }
        }
        return r;
      }
      function Wn(e) {
        var t = typeof e > "u" ? "undefined" : t_(e);
        return e != null && (t === "object" || t === "function");
      }
      function ws(e, t) {
        return Array.isArray(t) ? e.concat(t) : e.concat([t]);
      }
      function As(e, t) {
        return Array.isArray(t) ? t.concat(e) : [t].concat(e);
      }
      function Os(e) {
        return e.length ? e.slice(0, e.length - 1) : e;
      }
      function Ss(e) {
        return e.length ? e.slice(1) : e;
      }
      function xs(e, t, n) {
        return e
          .slice(0, t)
          .concat(Array.isArray(n) ? n : [n])
          .concat(e.slice(t));
      }
      function Rs(e, t) {
        return t >= e.length || t < 0 ? e : e.slice(0, t).concat(e.slice(t + 1));
      }
      function Cs(e, t, n) {
        if (e[t] === n) return e;
        for (var r = e.length, i = Array(r), o = 0; o < r; o++) i[o] = e[o];
        return (i[t] = n), i;
      }
      function Hn(e, t) {
        if ((!Array.isArray(t) && bs(Ts), e != null)) {
          for (var n = e, r = 0; r < t.length; r++) {
            var i = t[r];
            if (((n = n?.[i]), n === void 0)) return n;
          }
          return n;
        }
      }
      function Bn(e, t, n) {
        var r = typeof t == "number" ? [] : {},
          i = e ?? r;
        if (i[t] === n) return i;
        var o = Vn(i);
        return (o[t] = n), o;
      }
      function Ps(e, t, n, r) {
        var i = void 0,
          o = t[r];
        if (r === t.length - 1) i = n;
        else {
          var a =
            Wn(e) && Wn(e[o]) ? e[o] : typeof t[r + 1] == "number" ? [] : {};
          i = Ps(a, t, n, r + 1);
        }
        return Bn(e, o, i);
      }
      function zn(e, t, n) {
        return t.length ? Ps(e, t, n, 0) : n;
      }
      function Ls(e, t, n) {
        var r = e?.[t],
          i = n(r);
        return Bn(e, t, i);
      }
      function Ns(e, t, n) {
        var r = Hn(e, t),
          i = n(r);
        return zn(e, t, i);
      }
      function Ds(e, t, n, r, i, o) {
        for (
          var a = arguments.length, u = Array(a > 6 ? a - 6 : 0), s = 6;
          s < a;
          s++
        )
          u[s - 6] = arguments[s];
        return u.length
          ? Fe.call.apply(Fe, [null, !1, !1, e, t, n, r, i, o].concat(u))
          : Fe(!1, !1, e, t, n, r, i, o);
      }
      function Ms(e, t, n, r, i, o) {
        for (
          var a = arguments.length, u = Array(a > 6 ? a - 6 : 0), s = 6;
          s < a;
          s++
        )
          u[s - 6] = arguments[s];
        return u.length
          ? Fe.call.apply(Fe, [null, !1, !0, e, t, n, r, i, o].concat(u))
          : Fe(!1, !0, e, t, n, r, i, o);
      }
      function Fs(e, t, n, r, i, o, a) {
        var u = Hn(e, t);
        u == null && (u = {});
        for (
          var s = void 0,
            f = arguments.length,
            m = Array(f > 7 ? f - 7 : 0),
            v = 7;
          v < f;
          v++
        )
          m[v - 7] = arguments[v];
        return (
          m.length
            ? (s = Fe.call.apply(Fe, [null, !1, !1, u, n, r, i, o, a].concat(m)))
            : (s = Fe(!1, !1, u, n, r, i, o, a)),
          zn(e, t, s)
        );
      }
      function qs(e, t) {
        for (var n = Array.isArray(t) ? t : [t], r = !1, i = 0; i < n.length; i++)
          if (n_.call(e, n[i])) {
            r = !0;
            break;
          }
        if (!r) return e;
        for (var o = {}, a = Ti(e), u = 0; u < a.length; u++) {
          var s = a[u];
          n.indexOf(s) >= 0 || (o[s] = e[s]);
        }
        return o;
      }
      function ks(e, t, n, r, i, o) {
        for (
          var a = arguments.length, u = Array(a > 6 ? a - 6 : 0), s = 6;
          s < a;
          s++
        )
          u[s - 6] = arguments[s];
        return u.length
          ? Fe.call.apply(Fe, [null, !0, !1, e, t, n, r, i, o].concat(u))
          : Fe(!0, !1, e, t, n, r, i, o);
      }
      var r_ = {
        clone: Vn,
        addLast: ws,
        addFirst: As,
        removeLast: Os,
        removeFirst: Ss,
        insert: xs,
        removeAt: Rs,
        replaceAt: Cs,
        getIn: Hn,
        set: Bn,
        setIn: zn,
        update: Ls,
        updateIn: Ns,
        merge: Ds,
        mergeDeep: Ms,
        mergeIn: Fs,
        omit: qs,
        addDefaults: ks,
      };
      ye.default = r_;
    });
    var Xs,
      i_,
      o_,
      a_,
      s_,
      u_,
      Gs,
      Us,
      Ws = Ee(() => {
        "use strict";
        Me();
        (Xs = fe(Lt())),
          ({
            IX2_PREVIEW_REQUESTED: i_,
            IX2_PLAYBACK_REQUESTED: o_,
            IX2_STOP_REQUESTED: a_,
            IX2_CLEAR_REQUESTED: s_,
          } = Te),
          (u_ = { preview: {}, playback: {}, stop: {}, clear: {} }),
          (Gs = Object.create(null, {
            [i_]: { value: "preview" },
            [o_]: { value: "playback" },
            [a_]: { value: "stop" },
            [s_]: { value: "clear" },
          })),
          (Us = (e = u_, t) => {
            if (t.type in Gs) {
              let n = [Gs[t.type]];
              return (0, Xs.setIn)(e, [n], { ...t.payload });
            }
            return e;
          });
      });
    var Re,
      c_,
      l_,
      f_,
      d_,
      p_,
      g_,
      h_,
      v_,
      E_,
      m_,
      Vs,
      y_,
      Hs,
      Bs = Ee(() => {
        "use strict";
        Me();
        (Re = fe(Lt())),
          ({
            IX2_SESSION_INITIALIZED: c_,
            IX2_SESSION_STARTED: l_,
            IX2_TEST_FRAME_RENDERED: f_,
            IX2_SESSION_STOPPED: d_,
            IX2_EVENT_LISTENER_ADDED: p_,
            IX2_EVENT_STATE_CHANGED: g_,
            IX2_ANIMATION_FRAME_CHANGED: h_,
            IX2_ACTION_LIST_PLAYBACK_CHANGED: v_,
            IX2_VIEWPORT_WIDTH_CHANGED: E_,
            IX2_MEDIA_QUERIES_DEFINED: m_,
          } = Te),
          (Vs = {
            active: !1,
            tick: 0,
            eventListeners: [],
            eventState: {},
            playbackState: {},
            viewportWidth: 0,
            mediaQueryKey: null,
            hasBoundaryNodes: !1,
            hasDefinedMediaQueries: !1,
            reducedMotion: !1,
          }),
          (y_ = 20),
          (Hs = (e = Vs, t) => {
            switch (t.type) {
              case c_: {
                let { hasBoundaryNodes: n, reducedMotion: r } = t.payload;
                return (0, Re.merge)(e, {
                  hasBoundaryNodes: n,
                  reducedMotion: r,
                });
              }
              case l_:
                return (0, Re.set)(e, "active", !0);
              case f_: {
                let {
                  payload: { step: n = y_ },
                } = t;
                return (0, Re.set)(e, "tick", e.tick + n);
              }
              case d_:
                return Vs;
              case h_: {
                let {
                  payload: { now: n },
                } = t;
                return (0, Re.set)(e, "tick", n);
              }
              case p_: {
                let n = (0, Re.addLast)(e.eventListeners, t.payload);
                return (0, Re.set)(e, "eventListeners", n);
              }
              case g_: {
                let { stateKey: n, newState: r } = t.payload;
                return (0, Re.setIn)(e, ["eventState", n], r);
              }
              case v_: {
                let { actionListId: n, isPlaying: r } = t.payload;
                return (0, Re.setIn)(e, ["playbackState", n], r);
              }
              case E_: {
                let { width: n, mediaQueries: r } = t.payload,
                  i = r.length,
                  o = null;
                for (let a = 0; a < i; a++) {
                  let { key: u, min: s, max: f } = r[a];
                  if (n >= s && n <= f) {
                    o = u;
                    break;
                  }
                }
                return (0, Re.merge)(e, { viewportWidth: n, mediaQueryKey: o });
              }
              case m_:
                return (0, Re.set)(e, "hasDefinedMediaQueries", !0);
              default:
                return e;
            }
          });
      });
    var Ks = d((x1, zs) => {
      function __() {
        (this.__data__ = []), (this.size = 0);
      }
      zs.exports = __;
    });
    var Kn = d((R1, js) => {
      function I_(e, t) {
        return e === t || (e !== e && t !== t);
      }
      js.exports = I_;
    });
    var sn = d((C1, Ys) => {
      var T_ = Kn();
      function b_(e, t) {
        for (var n = e.length; n--; ) if (T_(e[n][0], t)) return n;
        return -1;
      }
      Ys.exports = b_;
    });
    var $s = d((P1, Qs) => {
      var w_ = sn(),
        A_ = Array.prototype,
        O_ = A_.splice;
      function S_(e) {
        var t = this.__data__,
          n = w_(t, e);
        if (n < 0) return !1;
        var r = t.length - 1;
        return n == r ? t.pop() : O_.call(t, n, 1), --this.size, !0;
      }
      Qs.exports = S_;
    });
    var Js = d((L1, Zs) => {
      var x_ = sn();
      function R_(e) {
        var t = this.__data__,
          n = x_(t, e);
        return n < 0 ? void 0 : t[n][1];
      }
      Zs.exports = R_;
    });
    var tu = d((N1, eu) => {
      var C_ = sn();
      function P_(e) {
        return C_(this.__data__, e) > -1;
      }
      eu.exports = P_;
    });
    var ru = d((D1, nu) => {
      var L_ = sn();
      function N_(e, t) {
        var n = this.__data__,
          r = L_(n, e);
        return r < 0 ? (++this.size, n.push([e, t])) : (n[r][1] = t), this;
      }
      nu.exports = N_;
    });
    var un = d((M1, iu) => {
      var D_ = Ks(),
        M_ = $s(),
        F_ = Js(),
        q_ = tu(),
        k_ = ru();
      function Nt(e) {
        var t = -1,
          n = e == null ? 0 : e.length;
        for (this.clear(); ++t < n; ) {
          var r = e[t];
          this.set(r[0], r[1]);
        }
      }
      Nt.prototype.clear = D_;
      Nt.prototype.delete = M_;
      Nt.prototype.get = F_;
      Nt.prototype.has = q_;
      Nt.prototype.set = k_;
      iu.exports = Nt;
    });
    var au = d((F1, ou) => {
      var G_ = un();
      function X_() {
        (this.__data__ = new G_()), (this.size = 0);
      }
      ou.exports = X_;
    });
    var uu = d((q1, su) => {
      function U_(e) {
        var t = this.__data__,
          n = t.delete(e);
        return (this.size = t.size), n;
      }
      su.exports = U_;
    });
    var lu = d((k1, cu) => {
      function W_(e) {
        return this.__data__.get(e);
      }
      cu.exports = W_;
    });
    var du = d((G1, fu) => {
      function V_(e) {
        return this.__data__.has(e);
      }
      fu.exports = V_;
    });
    var et = d((X1, pu) => {
      function H_(e) {
        var t = typeof e;
        return e != null && (t == "object" || t == "function");
      }
      pu.exports = H_;
    });
    var bi = d((U1, gu) => {
      var B_ = ft(),
        z_ = et(),
        K_ = "[object AsyncFunction]",
        j_ = "[object Function]",
        Y_ = "[object GeneratorFunction]",
        Q_ = "[object Proxy]";
      function $_(e) {
        if (!z_(e)) return !1;
        var t = B_(e);
        return t == j_ || t == Y_ || t == K_ || t == Q_;
      }
      gu.exports = $_;
    });
    var vu = d((W1, hu) => {
      var Z_ = He(),
        J_ = Z_["__core-js_shared__"];
      hu.exports = J_;
    });
    var yu = d((V1, mu) => {
      var wi = vu(),
        Eu = (function () {
          var e = /[^.]+$/.exec((wi && wi.keys && wi.keys.IE_PROTO) || "");
          return e ? "Symbol(src)_1." + e : "";
        })();
      function eI(e) {
        return !!Eu && Eu in e;
      }
      mu.exports = eI;
    });
    var Ai = d((H1, _u) => {
      var tI = Function.prototype,
        nI = tI.toString;
      function rI(e) {
        if (e != null) {
          try {
            return nI.call(e);
          } catch {}
          try {
            return e + "";
          } catch {}
        }
        return "";
      }
      _u.exports = rI;
    });
    var Tu = d((B1, Iu) => {
      var iI = bi(),
        oI = yu(),
        aI = et(),
        sI = Ai(),
        uI = /[\\^$.*+?()[\]{}|]/g,
        cI = /^\[object .+?Constructor\]$/,
        lI = Function.prototype,
        fI = Object.prototype,
        dI = lI.toString,
        pI = fI.hasOwnProperty,
        gI = RegExp(
          "^" +
            dI
              .call(pI)
              .replace(uI, "\\$&")
              .replace(
                /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
                "$1.*?"
              ) +
            "$"
        );
      function hI(e) {
        if (!aI(e) || oI(e)) return !1;
        var t = iI(e) ? gI : cI;
        return t.test(sI(e));
      }
      Iu.exports = hI;
    });
    var wu = d((z1, bu) => {
      function vI(e, t) {
        return e?.[t];
      }
      bu.exports = vI;
    });
    var dt = d((K1, Au) => {
      var EI = Tu(),
        mI = wu();
      function yI(e, t) {
        var n = mI(e, t);
        return EI(n) ? n : void 0;
      }
      Au.exports = yI;
    });
    var jn = d((j1, Ou) => {
      var _I = dt(),
        II = He(),
        TI = _I(II, "Map");
      Ou.exports = TI;
    });
    var cn = d((Y1, Su) => {
      var bI = dt(),
        wI = bI(Object, "create");
      Su.exports = wI;
    });
    var Cu = d((Q1, Ru) => {
      var xu = cn();
      function AI() {
        (this.__data__ = xu ? xu(null) : {}), (this.size = 0);
      }
      Ru.exports = AI;
    });
    var Lu = d(($1, Pu) => {
      function OI(e) {
        var t = this.has(e) && delete this.__data__[e];
        return (this.size -= t ? 1 : 0), t;
      }
      Pu.exports = OI;
    });
    var Du = d((Z1, Nu) => {
      var SI = cn(),
        xI = "__lodash_hash_undefined__",
        RI = Object.prototype,
        CI = RI.hasOwnProperty;
      function PI(e) {
        var t = this.__data__;
        if (SI) {
          var n = t[e];
          return n === xI ? void 0 : n;
        }
        return CI.call(t, e) ? t[e] : void 0;
      }
      Nu.exports = PI;
    });
    var Fu = d((J1, Mu) => {
      var LI = cn(),
        NI = Object.prototype,
        DI = NI.hasOwnProperty;
      function MI(e) {
        var t = this.__data__;
        return LI ? t[e] !== void 0 : DI.call(t, e);
      }
      Mu.exports = MI;
    });
    var ku = d((e2, qu) => {
      var FI = cn(),
        qI = "__lodash_hash_undefined__";
      function kI(e, t) {
        var n = this.__data__;
        return (
          (this.size += this.has(e) ? 0 : 1),
          (n[e] = FI && t === void 0 ? qI : t),
          this
        );
      }
      qu.exports = kI;
    });
    var Xu = d((t2, Gu) => {
      var GI = Cu(),
        XI = Lu(),
        UI = Du(),
        WI = Fu(),
        VI = ku();
      function Dt(e) {
        var t = -1,
          n = e == null ? 0 : e.length;
        for (this.clear(); ++t < n; ) {
          var r = e[t];
          this.set(r[0], r[1]);
        }
      }
      Dt.prototype.clear = GI;
      Dt.prototype.delete = XI;
      Dt.prototype.get = UI;
      Dt.prototype.has = WI;
      Dt.prototype.set = VI;
      Gu.exports = Dt;
    });
    var Vu = d((n2, Wu) => {
      var Uu = Xu(),
        HI = un(),
        BI = jn();
      function zI() {
        (this.size = 0),
          (this.__data__ = {
            hash: new Uu(),
            map: new (BI || HI)(),
            string: new Uu(),
          });
      }
      Wu.exports = zI;
    });
    var Bu = d((r2, Hu) => {
      function KI(e) {
        var t = typeof e;
        return t == "string" || t == "number" || t == "symbol" || t == "boolean"
          ? e !== "__proto__"
          : e === null;
      }
      Hu.exports = KI;
    });
    var ln = d((i2, zu) => {
      var jI = Bu();
      function YI(e, t) {
        var n = e.__data__;
        return jI(t) ? n[typeof t == "string" ? "string" : "hash"] : n.map;
      }
      zu.exports = YI;
    });
    var ju = d((o2, Ku) => {
      var QI = ln();
      function $I(e) {
        var t = QI(this, e).delete(e);
        return (this.size -= t ? 1 : 0), t;
      }
      Ku.exports = $I;
    });
    var Qu = d((a2, Yu) => {
      var ZI = ln();
      function JI(e) {
        return ZI(this, e).get(e);
      }
      Yu.exports = JI;
    });
    var Zu = d((s2, $u) => {
      var eT = ln();
      function tT(e) {
        return eT(this, e).has(e);
      }
      $u.exports = tT;
    });
    var ec = d((u2, Ju) => {
      var nT = ln();
      function rT(e, t) {
        var n = nT(this, e),
          r = n.size;
        return n.set(e, t), (this.size += n.size == r ? 0 : 1), this;
      }
      Ju.exports = rT;
    });
    var Yn = d((c2, tc) => {
      var iT = Vu(),
        oT = ju(),
        aT = Qu(),
        sT = Zu(),
        uT = ec();
      function Mt(e) {
        var t = -1,
          n = e == null ? 0 : e.length;
        for (this.clear(); ++t < n; ) {
          var r = e[t];
          this.set(r[0], r[1]);
        }
      }
      Mt.prototype.clear = iT;
      Mt.prototype.delete = oT;
      Mt.prototype.get = aT;
      Mt.prototype.has = sT;
      Mt.prototype.set = uT;
      tc.exports = Mt;
    });
    var rc = d((l2, nc) => {
      var cT = un(),
        lT = jn(),
        fT = Yn(),
        dT = 200;
      function pT(e, t) {
        var n = this.__data__;
        if (n instanceof cT) {
          var r = n.__data__;
          if (!lT || r.length < dT - 1)
            return r.push([e, t]), (this.size = ++n.size), this;
          n = this.__data__ = new fT(r);
        }
        return n.set(e, t), (this.size = n.size), this;
      }
      nc.exports = pT;
    });
    var Oi = d((f2, ic) => {
      var gT = un(),
        hT = au(),
        vT = uu(),
        ET = lu(),
        mT = du(),
        yT = rc();
      function Ft(e) {
        var t = (this.__data__ = new gT(e));
        this.size = t.size;
      }
      Ft.prototype.clear = hT;
      Ft.prototype.delete = vT;
      Ft.prototype.get = ET;
      Ft.prototype.has = mT;
      Ft.prototype.set = yT;
      ic.exports = Ft;
    });
    var ac = d((d2, oc) => {
      var _T = "__lodash_hash_undefined__";
      function IT(e) {
        return this.__data__.set(e, _T), this;
      }
      oc.exports = IT;
    });
    var uc = d((p2, sc) => {
      function TT(e) {
        return this.__data__.has(e);
      }
      sc.exports = TT;
    });
    var lc = d((g2, cc) => {
      var bT = Yn(),
        wT = ac(),
        AT = uc();
      function Qn(e) {
        var t = -1,
          n = e == null ? 0 : e.length;
        for (this.__data__ = new bT(); ++t < n; ) this.add(e[t]);
      }
      Qn.prototype.add = Qn.prototype.push = wT;
      Qn.prototype.has = AT;
      cc.exports = Qn;
    });
    var dc = d((h2, fc) => {
      function OT(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length; ++n < r; )
          if (t(e[n], n, e)) return !0;
        return !1;
      }
      fc.exports = OT;
    });
    var gc = d((v2, pc) => {
      function ST(e, t) {
        return e.has(t);
      }
      pc.exports = ST;
    });
    var Si = d((E2, hc) => {
      var xT = lc(),
        RT = dc(),
        CT = gc(),
        PT = 1,
        LT = 2;
      function NT(e, t, n, r, i, o) {
        var a = n & PT,
          u = e.length,
          s = t.length;
        if (u != s && !(a && s > u)) return !1;
        var f = o.get(e),
          m = o.get(t);
        if (f && m) return f == t && m == e;
        var v = -1,
          g = !0,
          E = n & LT ? new xT() : void 0;
        for (o.set(e, t), o.set(t, e); ++v < u; ) {
          var T = e[v],
            w = t[v];
          if (r) var R = a ? r(w, T, v, t, e, o) : r(T, w, v, e, t, o);
          if (R !== void 0) {
            if (R) continue;
            g = !1;
            break;
          }
          if (E) {
            if (
              !RT(t, function (b, L) {
                if (!CT(E, L) && (T === b || i(T, b, n, r, o))) return E.push(L);
              })
            ) {
              g = !1;
              break;
            }
          } else if (!(T === w || i(T, w, n, r, o))) {
            g = !1;
            break;
          }
        }
        return o.delete(e), o.delete(t), g;
      }
      hc.exports = NT;
    });
    var Ec = d((m2, vc) => {
      var DT = He(),
        MT = DT.Uint8Array;
      vc.exports = MT;
    });
    var yc = d((y2, mc) => {
      function FT(e) {
        var t = -1,
          n = Array(e.size);
        return (
          e.forEach(function (r, i) {
            n[++t] = [i, r];
          }),
          n
        );
      }
      mc.exports = FT;
    });
    var Ic = d((_2, _c) => {
      function qT(e) {
        var t = -1,
          n = Array(e.size);
        return (
          e.forEach(function (r) {
            n[++t] = r;
          }),
          n
        );
      }
      _c.exports = qT;
    });
    var Oc = d((I2, Ac) => {
      var Tc = Rt(),
        bc = Ec(),
        kT = Kn(),
        GT = Si(),
        XT = yc(),
        UT = Ic(),
        WT = 1,
        VT = 2,
        HT = "[object Boolean]",
        BT = "[object Date]",
        zT = "[object Error]",
        KT = "[object Map]",
        jT = "[object Number]",
        YT = "[object RegExp]",
        QT = "[object Set]",
        $T = "[object String]",
        ZT = "[object Symbol]",
        JT = "[object ArrayBuffer]",
        eb = "[object DataView]",
        wc = Tc ? Tc.prototype : void 0,
        xi = wc ? wc.valueOf : void 0;
      function tb(e, t, n, r, i, o, a) {
        switch (n) {
          case eb:
            if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
              return !1;
            (e = e.buffer), (t = t.buffer);
          case JT:
            return !(e.byteLength != t.byteLength || !o(new bc(e), new bc(t)));
          case HT:
          case BT:
          case jT:
            return kT(+e, +t);
          case zT:
            return e.name == t.name && e.message == t.message;
          case YT:
          case $T:
            return e == t + "";
          case KT:
            var u = XT;
          case QT:
            var s = r & WT;
            if ((u || (u = UT), e.size != t.size && !s)) return !1;
            var f = a.get(e);
            if (f) return f == t;
            (r |= VT), a.set(e, t);
            var m = GT(u(e), u(t), r, i, o, a);
            return a.delete(e), m;
          case ZT:
            if (xi) return xi.call(e) == xi.call(t);
        }
        return !1;
      }
      Ac.exports = tb;
    });
    var $n = d((T2, Sc) => {
      function nb(e, t) {
        for (var n = -1, r = t.length, i = e.length; ++n < r; ) e[i + n] = t[n];
        return e;
      }
      Sc.exports = nb;
    });
    var be = d((b2, xc) => {
      var rb = Array.isArray;
      xc.exports = rb;
    });
    var Ri = d((w2, Rc) => {
      var ib = $n(),
        ob = be();
      function ab(e, t, n) {
        var r = t(e);
        return ob(e) ? r : ib(r, n(e));
      }
      Rc.exports = ab;
    });
    var Pc = d((A2, Cc) => {
      function sb(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length, i = 0, o = []; ++n < r; ) {
          var a = e[n];
          t(a, n, e) && (o[i++] = a);
        }
        return o;
      }
      Cc.exports = sb;
    });
    var Ci = d((O2, Lc) => {
      function ub() {
        return [];
      }
      Lc.exports = ub;
    });
    var Pi = d((S2, Dc) => {
      var cb = Pc(),
        lb = Ci(),
        fb = Object.prototype,
        db = fb.propertyIsEnumerable,
        Nc = Object.getOwnPropertySymbols,
        pb = Nc
          ? function (e) {
              return e == null
                ? []
                : ((e = Object(e)),
                  cb(Nc(e), function (t) {
                    return db.call(e, t);
                  }));
            }
          : lb;
      Dc.exports = pb;
    });
    var Fc = d((x2, Mc) => {
      function gb(e, t) {
        for (var n = -1, r = Array(e); ++n < e; ) r[n] = t(n);
        return r;
      }
      Mc.exports = gb;
    });
    var kc = d((R2, qc) => {
      var hb = ft(),
        vb = ot(),
        Eb = "[object Arguments]";
      function mb(e) {
        return vb(e) && hb(e) == Eb;
      }
      qc.exports = mb;
    });
    var fn = d((C2, Uc) => {
      var Gc = kc(),
        yb = ot(),
        Xc = Object.prototype,
        _b = Xc.hasOwnProperty,
        Ib = Xc.propertyIsEnumerable,
        Tb = Gc(
          (function () {
            return arguments;
          })()
        )
          ? Gc
          : function (e) {
              return yb(e) && _b.call(e, "callee") && !Ib.call(e, "callee");
            };
      Uc.exports = Tb;
    });
    var Vc = d((P2, Wc) => {
      function bb() {
        return !1;
      }
      Wc.exports = bb;
    });
    var Zn = d((dn, qt) => {
      var wb = He(),
        Ab = Vc(),
        zc = typeof dn == "object" && dn && !dn.nodeType && dn,
        Hc = zc && typeof qt == "object" && qt && !qt.nodeType && qt,
        Ob = Hc && Hc.exports === zc,
        Bc = Ob ? wb.Buffer : void 0,
        Sb = Bc ? Bc.isBuffer : void 0,
        xb = Sb || Ab;
      qt.exports = xb;
    });
    var Jn = d((L2, Kc) => {
      var Rb = 9007199254740991,
        Cb = /^(?:0|[1-9]\d*)$/;
      function Pb(e, t) {
        var n = typeof e;
        return (
          (t = t ?? Rb),
          !!t &&
            (n == "number" || (n != "symbol" && Cb.test(e))) &&
            e > -1 &&
            e % 1 == 0 &&
            e < t
        );
      }
      Kc.exports = Pb;
    });
    var er = d((N2, jc) => {
      var Lb = 9007199254740991;
      function Nb(e) {
        return typeof e == "number" && e > -1 && e % 1 == 0 && e <= Lb;
      }
      jc.exports = Nb;
    });
    var Qc = d((D2, Yc) => {
      var Db = ft(),
        Mb = er(),
        Fb = ot(),
        qb = "[object Arguments]",
        kb = "[object Array]",
        Gb = "[object Boolean]",
        Xb = "[object Date]",
        Ub = "[object Error]",
        Wb = "[object Function]",
        Vb = "[object Map]",
        Hb = "[object Number]",
        Bb = "[object Object]",
        zb = "[object RegExp]",
        Kb = "[object Set]",
        jb = "[object String]",
        Yb = "[object WeakMap]",
        Qb = "[object ArrayBuffer]",
        $b = "[object DataView]",
        Zb = "[object Float32Array]",
        Jb = "[object Float64Array]",
        ew = "[object Int8Array]",
        tw = "[object Int16Array]",
        nw = "[object Int32Array]",
        rw = "[object Uint8Array]",
        iw = "[object Uint8ClampedArray]",
        ow = "[object Uint16Array]",
        aw = "[object Uint32Array]",
        ve = {};
      ve[Zb] =
        ve[Jb] =
        ve[ew] =
        ve[tw] =
        ve[nw] =
        ve[rw] =
        ve[iw] =
        ve[ow] =
        ve[aw] =
          !0;
      ve[qb] =
        ve[kb] =
        ve[Qb] =
        ve[Gb] =
        ve[$b] =
        ve[Xb] =
        ve[Ub] =
        ve[Wb] =
        ve[Vb] =
        ve[Hb] =
        ve[Bb] =
        ve[zb] =
        ve[Kb] =
        ve[jb] =
        ve[Yb] =
          !1;
      function sw(e) {
        return Fb(e) && Mb(e.length) && !!ve[Db(e)];
      }
      Yc.exports = sw;
    });
    var Zc = d((M2, $c) => {
      function uw(e) {
        return function (t) {
          return e(t);
        };
      }
      $c.exports = uw;
    });
    var el = d((pn, kt) => {
      var cw = ri(),
        Jc = typeof pn == "object" && pn && !pn.nodeType && pn,
        gn = Jc && typeof kt == "object" && kt && !kt.nodeType && kt,
        lw = gn && gn.exports === Jc,
        Li = lw && cw.process,
        fw = (function () {
          try {
            var e = gn && gn.require && gn.require("util").types;
            return e || (Li && Li.binding && Li.binding("util"));
          } catch {}
        })();
      kt.exports = fw;
    });
    var tr = d((F2, rl) => {
      var dw = Qc(),
        pw = Zc(),
        tl = el(),
        nl = tl && tl.isTypedArray,
        gw = nl ? pw(nl) : dw;
      rl.exports = gw;
    });
    var Ni = d((q2, il) => {
      var hw = Fc(),
        vw = fn(),
        Ew = be(),
        mw = Zn(),
        yw = Jn(),
        _w = tr(),
        Iw = Object.prototype,
        Tw = Iw.hasOwnProperty;
      function bw(e, t) {
        var n = Ew(e),
          r = !n && vw(e),
          i = !n && !r && mw(e),
          o = !n && !r && !i && _w(e),
          a = n || r || i || o,
          u = a ? hw(e.length, String) : [],
          s = u.length;
        for (var f in e)
          (t || Tw.call(e, f)) &&
            !(
              a &&
              (f == "length" ||
                (i && (f == "offset" || f == "parent")) ||
                (o &&
                  (f == "buffer" || f == "byteLength" || f == "byteOffset")) ||
                yw(f, s))
            ) &&
            u.push(f);
        return u;
      }
      il.exports = bw;
    });
    var nr = d((k2, ol) => {
      var ww = Object.prototype;
      function Aw(e) {
        var t = e && e.constructor,
          n = (typeof t == "function" && t.prototype) || ww;
        return e === n;
      }
      ol.exports = Aw;
    });
    var sl = d((G2, al) => {
      var Ow = ii(),
        Sw = Ow(Object.keys, Object);
      al.exports = Sw;
    });
    var rr = d((X2, ul) => {
      var xw = nr(),
        Rw = sl(),
        Cw = Object.prototype,
        Pw = Cw.hasOwnProperty;
      function Lw(e) {
        if (!xw(e)) return Rw(e);
        var t = [];
        for (var n in Object(e)) Pw.call(e, n) && n != "constructor" && t.push(n);
        return t;
      }
      ul.exports = Lw;
    });
    var yt = d((U2, cl) => {
      var Nw = bi(),
        Dw = er();
      function Mw(e) {
        return e != null && Dw(e.length) && !Nw(e);
      }
      cl.exports = Mw;
    });
    var hn = d((W2, ll) => {
      var Fw = Ni(),
        qw = rr(),
        kw = yt();
      function Gw(e) {
        return kw(e) ? Fw(e) : qw(e);
      }
      ll.exports = Gw;
    });
    var dl = d((V2, fl) => {
      var Xw = Ri(),
        Uw = Pi(),
        Ww = hn();
      function Vw(e) {
        return Xw(e, Ww, Uw);
      }
      fl.exports = Vw;
    });
    var hl = d((H2, gl) => {
      var pl = dl(),
        Hw = 1,
        Bw = Object.prototype,
        zw = Bw.hasOwnProperty;
      function Kw(e, t, n, r, i, o) {
        var a = n & Hw,
          u = pl(e),
          s = u.length,
          f = pl(t),
          m = f.length;
        if (s != m && !a) return !1;
        for (var v = s; v--; ) {
          var g = u[v];
          if (!(a ? g in t : zw.call(t, g))) return !1;
        }
        var E = o.get(e),
          T = o.get(t);
        if (E && T) return E == t && T == e;
        var w = !0;
        o.set(e, t), o.set(t, e);
        for (var R = a; ++v < s; ) {
          g = u[v];
          var b = e[g],
            L = t[g];
          if (r) var C = a ? r(L, b, g, t, e, o) : r(b, L, g, e, t, o);
          if (!(C === void 0 ? b === L || i(b, L, n, r, o) : C)) {
            w = !1;
            break;
          }
          R || (R = g == "constructor");
        }
        if (w && !R) {
          var M = e.constructor,
            F = t.constructor;
          M != F &&
            "constructor" in e &&
            "constructor" in t &&
            !(
              typeof M == "function" &&
              M instanceof M &&
              typeof F == "function" &&
              F instanceof F
            ) &&
            (w = !1);
        }
        return o.delete(e), o.delete(t), w;
      }
      gl.exports = Kw;
    });
    var El = d((B2, vl) => {
      var jw = dt(),
        Yw = He(),
        Qw = jw(Yw, "DataView");
      vl.exports = Qw;
    });
    var yl = d((z2, ml) => {
      var $w = dt(),
        Zw = He(),
        Jw = $w(Zw, "Promise");
      ml.exports = Jw;
    });
    var Il = d((K2, _l) => {
      var eA = dt(),
        tA = He(),
        nA = eA(tA, "Set");
      _l.exports = nA;
    });
    var Di = d((j2, Tl) => {
      var rA = dt(),
        iA = He(),
        oA = rA(iA, "WeakMap");
      Tl.exports = oA;
    });
    var ir = d((Y2, Rl) => {
      var Mi = El(),
        Fi = jn(),
        qi = yl(),
        ki = Il(),
        Gi = Di(),
        xl = ft(),
        Gt = Ai(),
        bl = "[object Map]",
        aA = "[object Object]",
        wl = "[object Promise]",
        Al = "[object Set]",
        Ol = "[object WeakMap]",
        Sl = "[object DataView]",
        sA = Gt(Mi),
        uA = Gt(Fi),
        cA = Gt(qi),
        lA = Gt(ki),
        fA = Gt(Gi),
        _t = xl;
      ((Mi && _t(new Mi(new ArrayBuffer(1))) != Sl) ||
        (Fi && _t(new Fi()) != bl) ||
        (qi && _t(qi.resolve()) != wl) ||
        (ki && _t(new ki()) != Al) ||
        (Gi && _t(new Gi()) != Ol)) &&
        (_t = function (e) {
          var t = xl(e),
            n = t == aA ? e.constructor : void 0,
            r = n ? Gt(n) : "";
          if (r)
            switch (r) {
              case sA:
                return Sl;
              case uA:
                return bl;
              case cA:
                return wl;
              case lA:
                return Al;
              case fA:
                return Ol;
            }
          return t;
        });
      Rl.exports = _t;
    });
    var ql = d((Q2, Fl) => {
      var Xi = Oi(),
        dA = Si(),
        pA = Oc(),
        gA = hl(),
        Cl = ir(),
        Pl = be(),
        Ll = Zn(),
        hA = tr(),
        vA = 1,
        Nl = "[object Arguments]",
        Dl = "[object Array]",
        or = "[object Object]",
        EA = Object.prototype,
        Ml = EA.hasOwnProperty;
      function mA(e, t, n, r, i, o) {
        var a = Pl(e),
          u = Pl(t),
          s = a ? Dl : Cl(e),
          f = u ? Dl : Cl(t);
        (s = s == Nl ? or : s), (f = f == Nl ? or : f);
        var m = s == or,
          v = f == or,
          g = s == f;
        if (g && Ll(e)) {
          if (!Ll(t)) return !1;
          (a = !0), (m = !1);
        }
        if (g && !m)
          return (
            o || (o = new Xi()),
            a || hA(e) ? dA(e, t, n, r, i, o) : pA(e, t, s, n, r, i, o)
          );
        if (!(n & vA)) {
          var E = m && Ml.call(e, "__wrapped__"),
            T = v && Ml.call(t, "__wrapped__");
          if (E || T) {
            var w = E ? e.value() : e,
              R = T ? t.value() : t;
            return o || (o = new Xi()), i(w, R, n, r, o);
          }
        }
        return g ? (o || (o = new Xi()), gA(e, t, n, r, i, o)) : !1;
      }
      Fl.exports = mA;
    });
    var Ui = d(($2, Xl) => {
      var yA = ql(),
        kl = ot();
      function Gl(e, t, n, r, i) {
        return e === t
          ? !0
          : e == null || t == null || (!kl(e) && !kl(t))
          ? e !== e && t !== t
          : yA(e, t, n, r, Gl, i);
      }
      Xl.exports = Gl;
    });
    var Wl = d((Z2, Ul) => {
      var _A = Oi(),
        IA = Ui(),
        TA = 1,
        bA = 2;
      function wA(e, t, n, r) {
        var i = n.length,
          o = i,
          a = !r;
        if (e == null) return !o;
        for (e = Object(e); i--; ) {
          var u = n[i];
          if (a && u[2] ? u[1] !== e[u[0]] : !(u[0] in e)) return !1;
        }
        for (; ++i < o; ) {
          u = n[i];
          var s = u[0],
            f = e[s],
            m = u[1];
          if (a && u[2]) {
            if (f === void 0 && !(s in e)) return !1;
          } else {
            var v = new _A();
            if (r) var g = r(f, m, s, e, t, v);
            if (!(g === void 0 ? IA(m, f, TA | bA, r, v) : g)) return !1;
          }
        }
        return !0;
      }
      Ul.exports = wA;
    });
    var Wi = d((J2, Vl) => {
      var AA = et();
      function OA(e) {
        return e === e && !AA(e);
      }
      Vl.exports = OA;
    });
    var Bl = d((eq, Hl) => {
      var SA = Wi(),
        xA = hn();
      function RA(e) {
        for (var t = xA(e), n = t.length; n--; ) {
          var r = t[n],
            i = e[r];
          t[n] = [r, i, SA(i)];
        }
        return t;
      }
      Hl.exports = RA;
    });
    var Vi = d((tq, zl) => {
      function CA(e, t) {
        return function (n) {
          return n == null ? !1 : n[e] === t && (t !== void 0 || e in Object(n));
        };
      }
      zl.exports = CA;
    });
    var jl = d((nq, Kl) => {
      var PA = Wl(),
        LA = Bl(),
        NA = Vi();
      function DA(e) {
        var t = LA(e);
        return t.length == 1 && t[0][2]
          ? NA(t[0][0], t[0][1])
          : function (n) {
              return n === e || PA(n, e, t);
            };
      }
      Kl.exports = DA;
    });
    var vn = d((rq, Yl) => {
      var MA = ft(),
        FA = ot(),
        qA = "[object Symbol]";
      function kA(e) {
        return typeof e == "symbol" || (FA(e) && MA(e) == qA);
      }
      Yl.exports = kA;
    });
    var ar = d((iq, Ql) => {
      var GA = be(),
        XA = vn(),
        UA = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        WA = /^\w*$/;
      function VA(e, t) {
        if (GA(e)) return !1;
        var n = typeof e;
        return n == "number" ||
          n == "symbol" ||
          n == "boolean" ||
          e == null ||
          XA(e)
          ? !0
          : WA.test(e) || !UA.test(e) || (t != null && e in Object(t));
      }
      Ql.exports = VA;
    });
    var Jl = d((oq, Zl) => {
      var $l = Yn(),
        HA = "Expected a function";
      function Hi(e, t) {
        if (typeof e != "function" || (t != null && typeof t != "function"))
          throw new TypeError(HA);
        var n = function () {
          var r = arguments,
            i = t ? t.apply(this, r) : r[0],
            o = n.cache;
          if (o.has(i)) return o.get(i);
          var a = e.apply(this, r);
          return (n.cache = o.set(i, a) || o), a;
        };
        return (n.cache = new (Hi.Cache || $l)()), n;
      }
      Hi.Cache = $l;
      Zl.exports = Hi;
    });
    var tf = d((aq, ef) => {
      var BA = Jl(),
        zA = 500;
      function KA(e) {
        var t = BA(e, function (r) {
            return n.size === zA && n.clear(), r;
          }),
          n = t.cache;
        return t;
      }
      ef.exports = KA;
    });
    var rf = d((sq, nf) => {
      var jA = tf(),
        YA =
          /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
        QA = /\\(\\)?/g,
        $A = jA(function (e) {
          var t = [];
          return (
            e.charCodeAt(0) === 46 && t.push(""),
            e.replace(YA, function (n, r, i, o) {
              t.push(i ? o.replace(QA, "$1") : r || n);
            }),
            t
          );
        });
      nf.exports = $A;
    });
    var Bi = d((uq, of) => {
      function ZA(e, t) {
        for (var n = -1, r = e == null ? 0 : e.length, i = Array(r); ++n < r; )
          i[n] = t(e[n], n, e);
        return i;
      }
      of.exports = ZA;
    });
    var ff = d((cq, lf) => {
      var af = Rt(),
        JA = Bi(),
        e0 = be(),
        t0 = vn(),
        n0 = 1 / 0,
        sf = af ? af.prototype : void 0,
        uf = sf ? sf.toString : void 0;
      function cf(e) {
        if (typeof e == "string") return e;
        if (e0(e)) return JA(e, cf) + "";
        if (t0(e)) return uf ? uf.call(e) : "";
        var t = e + "";
        return t == "0" && 1 / e == -n0 ? "-0" : t;
      }
      lf.exports = cf;
    });
    var pf = d((lq, df) => {
      var r0 = ff();
      function i0(e) {
        return e == null ? "" : r0(e);
      }
      df.exports = i0;
    });
    var En = d((fq, gf) => {
      var o0 = be(),
        a0 = ar(),
        s0 = rf(),
        u0 = pf();
      function c0(e, t) {
        return o0(e) ? e : a0(e, t) ? [e] : s0(u0(e));
      }
      gf.exports = c0;
    });
    var Xt = d((dq, hf) => {
      var l0 = vn(),
        f0 = 1 / 0;
      function d0(e) {
        if (typeof e == "string" || l0(e)) return e;
        var t = e + "";
        return t == "0" && 1 / e == -f0 ? "-0" : t;
      }
      hf.exports = d0;
    });
    var sr = d((pq, vf) => {
      var p0 = En(),
        g0 = Xt();
      function h0(e, t) {
        t = p0(t, e);
        for (var n = 0, r = t.length; e != null && n < r; ) e = e[g0(t[n++])];
        return n && n == r ? e : void 0;
      }
      vf.exports = h0;
    });
    var ur = d((gq, Ef) => {
      var v0 = sr();
      function E0(e, t, n) {
        var r = e == null ? void 0 : v0(e, t);
        return r === void 0 ? n : r;
      }
      Ef.exports = E0;
    });
    var yf = d((hq, mf) => {
      function m0(e, t) {
        return e != null && t in Object(e);
      }
      mf.exports = m0;
    });
    var If = d((vq, _f) => {
      var y0 = En(),
        _0 = fn(),
        I0 = be(),
        T0 = Jn(),
        b0 = er(),
        w0 = Xt();
      function A0(e, t, n) {
        t = y0(t, e);
        for (var r = -1, i = t.length, o = !1; ++r < i; ) {
          var a = w0(t[r]);
          if (!(o = e != null && n(e, a))) break;
          e = e[a];
        }
        return o || ++r != i
          ? o
          : ((i = e == null ? 0 : e.length),
            !!i && b0(i) && T0(a, i) && (I0(e) || _0(e)));
      }
      _f.exports = A0;
    });
    var bf = d((Eq, Tf) => {
      var O0 = yf(),
        S0 = If();
      function x0(e, t) {
        return e != null && S0(e, t, O0);
      }
      Tf.exports = x0;
    });
    var Af = d((mq, wf) => {
      var R0 = Ui(),
        C0 = ur(),
        P0 = bf(),
        L0 = ar(),
        N0 = Wi(),
        D0 = Vi(),
        M0 = Xt(),
        F0 = 1,
        q0 = 2;
      function k0(e, t) {
        return L0(e) && N0(t)
          ? D0(M0(e), t)
          : function (n) {
              var r = C0(n, e);
              return r === void 0 && r === t ? P0(n, e) : R0(t, r, F0 | q0);
            };
      }
      wf.exports = k0;
    });
    var cr = d((yq, Of) => {
      function G0(e) {
        return e;
      }
      Of.exports = G0;
    });
    var zi = d((_q, Sf) => {
      function X0(e) {
        return function (t) {
          return t?.[e];
        };
      }
      Sf.exports = X0;
    });
    var Rf = d((Iq, xf) => {
      var U0 = sr();
      function W0(e) {
        return function (t) {
          return U0(t, e);
        };
      }
      xf.exports = W0;
    });
    var Pf = d((Tq, Cf) => {
      var V0 = zi(),
        H0 = Rf(),
        B0 = ar(),
        z0 = Xt();
      function K0(e) {
        return B0(e) ? V0(z0(e)) : H0(e);
      }
      Cf.exports = K0;
    });
    var pt = d((bq, Lf) => {
      var j0 = jl(),
        Y0 = Af(),
        Q0 = cr(),
        $0 = be(),
        Z0 = Pf();
      function J0(e) {
        return typeof e == "function"
          ? e
          : e == null
          ? Q0
          : typeof e == "object"
          ? $0(e)
            ? Y0(e[0], e[1])
            : j0(e)
          : Z0(e);
      }
      Lf.exports = J0;
    });
    var Ki = d((wq, Nf) => {
      var eO = pt(),
        tO = yt(),
        nO = hn();
      function rO(e) {
        return function (t, n, r) {
          var i = Object(t);
          if (!tO(t)) {
            var o = eO(n, 3);
            (t = nO(t)),
              (n = function (u) {
                return o(i[u], u, i);
              });
          }
          var a = e(t, n, r);
          return a > -1 ? i[o ? t[a] : a] : void 0;
        };
      }
      Nf.exports = rO;
    });
    var ji = d((Aq, Df) => {
      function iO(e, t, n, r) {
        for (var i = e.length, o = n + (r ? 1 : -1); r ? o-- : ++o < i; )
          if (t(e[o], o, e)) return o;
        return -1;
      }
      Df.exports = iO;
    });
    var Ff = d((Oq, Mf) => {
      var oO = /\s/;
      function aO(e) {
        for (var t = e.length; t-- && oO.test(e.charAt(t)); );
        return t;
      }
      Mf.exports = aO;
    });
    var kf = d((Sq, qf) => {
      var sO = Ff(),
        uO = /^\s+/;
      function cO(e) {
        return e && e.slice(0, sO(e) + 1).replace(uO, "");
      }
      qf.exports = cO;
    });
    var lr = d((xq, Uf) => {
      var lO = kf(),
        Gf = et(),
        fO = vn(),
        Xf = 0 / 0,
        dO = /^[-+]0x[0-9a-f]+$/i,
        pO = /^0b[01]+$/i,
        gO = /^0o[0-7]+$/i,
        hO = parseInt;
      function vO(e) {
        if (typeof e == "number") return e;
        if (fO(e)) return Xf;
        if (Gf(e)) {
          var t = typeof e.valueOf == "function" ? e.valueOf() : e;
          e = Gf(t) ? t + "" : t;
        }
        if (typeof e != "string") return e === 0 ? e : +e;
        e = lO(e);
        var n = pO.test(e);
        return n || gO.test(e) ? hO(e.slice(2), n ? 2 : 8) : dO.test(e) ? Xf : +e;
      }
      Uf.exports = vO;
    });
    var Hf = d((Rq, Vf) => {
      var EO = lr(),
        Wf = 1 / 0,
        mO = 17976931348623157e292;
      function yO(e) {
        if (!e) return e === 0 ? e : 0;
        if (((e = EO(e)), e === Wf || e === -Wf)) {
          var t = e < 0 ? -1 : 1;
          return t * mO;
        }
        return e === e ? e : 0;
      }
      Vf.exports = yO;
    });
    var Yi = d((Cq, Bf) => {
      var _O = Hf();
      function IO(e) {
        var t = _O(e),
          n = t % 1;
        return t === t ? (n ? t - n : t) : 0;
      }
      Bf.exports = IO;
    });
    var Kf = d((Pq, zf) => {
      var TO = ji(),
        bO = pt(),
        wO = Yi(),
        AO = Math.max;
      function OO(e, t, n) {
        var r = e == null ? 0 : e.length;
        if (!r) return -1;
        var i = n == null ? 0 : wO(n);
        return i < 0 && (i = AO(r + i, 0)), TO(e, bO(t, 3), i);
      }
      zf.exports = OO;
    });
    var Qi = d((Lq, jf) => {
      var SO = Ki(),
        xO = Kf(),
        RO = SO(xO);
      jf.exports = RO;
    });
    var $f = {};
    Ne($f, {
      ELEMENT_MATCHES: () => CO,
      FLEX_PREFIXED: () => $i,
      IS_BROWSER_ENV: () => ze,
      TRANSFORM_PREFIXED: () => gt,
      TRANSFORM_STYLE_PREFIXED: () => dr,
      withBrowser: () => fr,
    });
    var Qf,
      ze,
      fr,
      CO,
      $i,
      gt,
      Yf,
      dr,
      pr = Ee(() => {
        "use strict";
        (Qf = fe(Qi())),
          (ze = typeof window < "u"),
          (fr = (e, t) => (ze ? e() : t)),
          (CO = fr(() =>
            (0, Qf.default)(
              [
                "matches",
                "matchesSelector",
                "mozMatchesSelector",
                "msMatchesSelector",
                "oMatchesSelector",
                "webkitMatchesSelector",
              ],
              (e) => e in Element.prototype
            )
          )),
          ($i = fr(() => {
            let e = document.createElement("i"),
              t = [
                "flex",
                "-webkit-flex",
                "-ms-flexbox",
                "-moz-box",
                "-webkit-box",
              ],
              n = "";
            try {
              let { length: r } = t;
              for (let i = 0; i < r; i++) {
                let o = t[i];
                if (((e.style.display = o), e.style.display === o)) return o;
              }
              return n;
            } catch {
              return n;
            }
          }, "flex")),
          (gt = fr(() => {
            let e = document.createElement("i");
            if (e.style.transform == null) {
              let t = ["Webkit", "Moz", "ms"],
                n = "Transform",
                { length: r } = t;
              for (let i = 0; i < r; i++) {
                let o = t[i] + n;
                if (e.style[o] !== void 0) return o;
              }
            }
            return "transform";
          }, "transform")),
          (Yf = gt.split("transform")[0]),
          (dr = Yf ? Yf + "TransformStyle" : "transformStyle");
      });
    var Zi = d((Nq, nd) => {
      var PO = 4,
        LO = 0.001,
        NO = 1e-7,
        DO = 10,
        mn = 11,
        gr = 1 / (mn - 1),
        MO = typeof Float32Array == "function";
      function Zf(e, t) {
        return 1 - 3 * t + 3 * e;
      }
      function Jf(e, t) {
        return 3 * t - 6 * e;
      }
      function ed(e) {
        return 3 * e;
      }
      function hr(e, t, n) {
        return ((Zf(t, n) * e + Jf(t, n)) * e + ed(t)) * e;
      }
      function td(e, t, n) {
        return 3 * Zf(t, n) * e * e + 2 * Jf(t, n) * e + ed(t);
      }
      function FO(e, t, n, r, i) {
        var o,
          a,
          u = 0;
        do
          (a = t + (n - t) / 2), (o = hr(a, r, i) - e), o > 0 ? (n = a) : (t = a);
        while (Math.abs(o) > NO && ++u < DO);
        return a;
      }
      function qO(e, t, n, r) {
        for (var i = 0; i < PO; ++i) {
          var o = td(t, n, r);
          if (o === 0) return t;
          var a = hr(t, n, r) - e;
          t -= a / o;
        }
        return t;
      }
      nd.exports = function (t, n, r, i) {
        if (!(0 <= t && t <= 1 && 0 <= r && r <= 1))
          throw new Error("bezier x values must be in [0, 1] range");
        var o = MO ? new Float32Array(mn) : new Array(mn);
        if (t !== n || r !== i)
          for (var a = 0; a < mn; ++a) o[a] = hr(a * gr, t, r);
        function u(s) {
          for (var f = 0, m = 1, v = mn - 1; m !== v && o[m] <= s; ++m) f += gr;
          --m;
          var g = (s - o[m]) / (o[m + 1] - o[m]),
            E = f + g * gr,
            T = td(E, t, r);
          return T >= LO ? qO(s, E, t, r) : T === 0 ? E : FO(s, f, f + gr, t, r);
        }
        return function (f) {
          return t === n && r === i
            ? f
            : f === 0
            ? 0
            : f === 1
            ? 1
            : hr(u(f), n, i);
        };
      };
    });
    var _n = {};
    Ne(_n, {
      bounce: () => yS,
      bouncePast: () => _S,
      ease: () => kO,
      easeIn: () => GO,
      easeInOut: () => UO,
      easeOut: () => XO,
      inBack: () => lS,
      inCirc: () => aS,
      inCubic: () => BO,
      inElastic: () => pS,
      inExpo: () => rS,
      inOutBack: () => dS,
      inOutCirc: () => uS,
      inOutCubic: () => KO,
      inOutElastic: () => hS,
      inOutExpo: () => oS,
      inOutQuad: () => HO,
      inOutQuart: () => QO,
      inOutQuint: () => JO,
      inOutSine: () => nS,
      inQuad: () => WO,
      inQuart: () => jO,
      inQuint: () => $O,
      inSine: () => eS,
      outBack: () => fS,
      outBounce: () => cS,
      outCirc: () => sS,
      outCubic: () => zO,
      outElastic: () => gS,
      outExpo: () => iS,
      outQuad: () => VO,
      outQuart: () => YO,
      outQuint: () => ZO,
      outSine: () => tS,
      swingFrom: () => ES,
      swingFromTo: () => vS,
      swingTo: () => mS,
    });
    function WO(e) {
      return Math.pow(e, 2);
    }
    function VO(e) {
      return -(Math.pow(e - 1, 2) - 1);
    }
    function HO(e) {
      return (e /= 0.5) < 1 ? 0.5 * Math.pow(e, 2) : -0.5 * ((e -= 2) * e - 2);
    }
    function BO(e) {
      return Math.pow(e, 3);
    }
    function zO(e) {
      return Math.pow(e - 1, 3) + 1;
    }
    function KO(e) {
      return (e /= 0.5) < 1
        ? 0.5 * Math.pow(e, 3)
        : 0.5 * (Math.pow(e - 2, 3) + 2);
    }
    function jO(e) {
      return Math.pow(e, 4);
    }
    function YO(e) {
      return -(Math.pow(e - 1, 4) - 1);
    }
    function QO(e) {
      return (e /= 0.5) < 1
        ? 0.5 * Math.pow(e, 4)
        : -0.5 * ((e -= 2) * Math.pow(e, 3) - 2);
    }
    function $O(e) {
      return Math.pow(e, 5);
    }
    function ZO(e) {
      return Math.pow(e - 1, 5) + 1;
    }
    function JO(e) {
      return (e /= 0.5) < 1
        ? 0.5 * Math.pow(e, 5)
        : 0.5 * (Math.pow(e - 2, 5) + 2);
    }
    function eS(e) {
      return -Math.cos(e * (Math.PI / 2)) + 1;
    }
    function tS(e) {
      return Math.sin(e * (Math.PI / 2));
    }
    function nS(e) {
      return -0.5 * (Math.cos(Math.PI * e) - 1);
    }
    function rS(e) {
      return e === 0 ? 0 : Math.pow(2, 10 * (e - 1));
    }
    function iS(e) {
      return e === 1 ? 1 : -Math.pow(2, -10 * e) + 1;
    }
    function oS(e) {
      return e === 0
        ? 0
        : e === 1
        ? 1
        : (e /= 0.5) < 1
        ? 0.5 * Math.pow(2, 10 * (e - 1))
        : 0.5 * (-Math.pow(2, -10 * --e) + 2);
    }
    function aS(e) {
      return -(Math.sqrt(1 - e * e) - 1);
    }
    function sS(e) {
      return Math.sqrt(1 - Math.pow(e - 1, 2));
    }
    function uS(e) {
      return (e /= 0.5) < 1
        ? -0.5 * (Math.sqrt(1 - e * e) - 1)
        : 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
    }
    function cS(e) {
      return e < 1 / 2.75
        ? 7.5625 * e * e
        : e < 2 / 2.75
        ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75
        : e < 2.5 / 2.75
        ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375
        : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
    }
    function lS(e) {
      let t = at;
      return e * e * ((t + 1) * e - t);
    }
    function fS(e) {
      let t = at;
      return (e -= 1) * e * ((t + 1) * e + t) + 1;
    }
    function dS(e) {
      let t = at;
      return (e /= 0.5) < 1
        ? 0.5 * (e * e * (((t *= 1.525) + 1) * e - t))
        : 0.5 * ((e -= 2) * e * (((t *= 1.525) + 1) * e + t) + 2);
    }
    function pS(e) {
      let t = at,
        n = 0,
        r = 1;
      return e === 0
        ? 0
        : e === 1
        ? 1
        : (n || (n = 0.3),
          r < 1
            ? ((r = 1), (t = n / 4))
            : (t = (n / (2 * Math.PI)) * Math.asin(1 / r)),
          -(
            r *
            Math.pow(2, 10 * (e -= 1)) *
            Math.sin(((e - t) * (2 * Math.PI)) / n)
          ));
    }
    function gS(e) {
      let t = at,
        n = 0,
        r = 1;
      return e === 0
        ? 0
        : e === 1
        ? 1
        : (n || (n = 0.3),
          r < 1
            ? ((r = 1), (t = n / 4))
            : (t = (n / (2 * Math.PI)) * Math.asin(1 / r)),
          r * Math.pow(2, -10 * e) * Math.sin(((e - t) * (2 * Math.PI)) / n) + 1);
    }
    function hS(e) {
      let t = at,
        n = 0,
        r = 1;
      return e === 0
        ? 0
        : (e /= 1 / 2) === 2
        ? 1
        : (n || (n = 0.3 * 1.5),
          r < 1
            ? ((r = 1), (t = n / 4))
            : (t = (n / (2 * Math.PI)) * Math.asin(1 / r)),
          e < 1
            ? -0.5 *
              (r *
                Math.pow(2, 10 * (e -= 1)) *
                Math.sin(((e - t) * (2 * Math.PI)) / n))
            : r *
                Math.pow(2, -10 * (e -= 1)) *
                Math.sin(((e - t) * (2 * Math.PI)) / n) *
                0.5 +
              1);
    }
    function vS(e) {
      let t = at;
      return (e /= 0.5) < 1
        ? 0.5 * (e * e * (((t *= 1.525) + 1) * e - t))
        : 0.5 * ((e -= 2) * e * (((t *= 1.525) + 1) * e + t) + 2);
    }
    function ES(e) {
      let t = at;
      return e * e * ((t + 1) * e - t);
    }
    function mS(e) {
      let t = at;
      return (e -= 1) * e * ((t + 1) * e + t) + 1;
    }
    function yS(e) {
      return e < 1 / 2.75
        ? 7.5625 * e * e
        : e < 2 / 2.75
        ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75
        : e < 2.5 / 2.75
        ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375
        : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
    }
    function _S(e) {
      return e < 1 / 2.75
        ? 7.5625 * e * e
        : e < 2 / 2.75
        ? 2 - (7.5625 * (e -= 1.5 / 2.75) * e + 0.75)
        : e < 2.5 / 2.75
        ? 2 - (7.5625 * (e -= 2.25 / 2.75) * e + 0.9375)
        : 2 - (7.5625 * (e -= 2.625 / 2.75) * e + 0.984375);
    }
    var yn,
      at,
      kO,
      GO,
      XO,
      UO,
      Ji = Ee(() => {
        "use strict";
        (yn = fe(Zi())),
          (at = 1.70158),
          (kO = (0, yn.default)(0.25, 0.1, 0.25, 1)),
          (GO = (0, yn.default)(0.42, 0, 1, 1)),
          (XO = (0, yn.default)(0, 0, 0.58, 1)),
          (UO = (0, yn.default)(0.42, 0, 0.58, 1));
      });
    var id = {};
    Ne(id, {
      applyEasing: () => TS,
      createBezierEasing: () => IS,
      optimizeFloat: () => In,
    });
    function In(e, t = 5, n = 10) {
      let r = Math.pow(n, t),
        i = Number(Math.round(e * r) / r);
      return Math.abs(i) > 1e-4 ? i : 0;
    }
    function IS(e) {
      return (0, rd.default)(...e);
    }
    function TS(e, t, n) {
      return t === 0
        ? 0
        : t === 1
        ? 1
        : In(n ? (t > 0 ? n(t) : t) : t > 0 && e && _n[e] ? _n[e](t) : t);
    }
    var rd,
      eo = Ee(() => {
        "use strict";
        Ji();
        rd = fe(Zi());
      });
    var sd = {};
    Ne(sd, {
      createElementState: () => ad,
      ixElements: () => FS,
      mergeActionState: () => to,
    });
    function ad(e, t, n, r, i) {
      let o =
        n === bS ? (0, Ut.getIn)(i, ["config", "target", "objectId"]) : null;
      return (0, Ut.mergeIn)(e, [r], { id: r, ref: t, refId: o, refType: n });
    }
    function to(e, t, n, r, i) {
      let o = kS(i);
      return (0, Ut.mergeIn)(e, [t, MS, n], r, o);
    }
    function kS(e) {
      let { config: t } = e;
      return qS.reduce((n, r) => {
        let i = r[0],
          o = r[1],
          a = t[i],
          u = t[o];
        return a != null && u != null && (n[o] = u), n;
      }, {});
    }
    var Ut,
      Mq,
      bS,
      Fq,
      wS,
      AS,
      OS,
      SS,
      xS,
      RS,
      CS,
      PS,
      LS,
      NS,
      DS,
      od,
      MS,
      FS,
      qS,
      ud = Ee(() => {
        "use strict";
        Ut = fe(Lt());
        Me();
        ({
          HTML_ELEMENT: Mq,
          PLAIN_OBJECT: bS,
          ABSTRACT_NODE: Fq,
          CONFIG_X_VALUE: wS,
          CONFIG_Y_VALUE: AS,
          CONFIG_Z_VALUE: OS,
          CONFIG_VALUE: SS,
          CONFIG_X_UNIT: xS,
          CONFIG_Y_UNIT: RS,
          CONFIG_Z_UNIT: CS,
          CONFIG_UNIT: PS,
        } = Ae),
          ({
            IX2_SESSION_STOPPED: LS,
            IX2_INSTANCE_ADDED: NS,
            IX2_ELEMENT_STATE_CHANGED: DS,
          } = Te),
          (od = {}),
          (MS = "refState"),
          (FS = (e = od, t = {}) => {
            switch (t.type) {
              case LS:
                return od;
              case NS: {
                let {
                    elementId: n,
                    element: r,
                    origin: i,
                    actionItem: o,
                    refType: a,
                  } = t.payload,
                  { actionTypeId: u } = o,
                  s = e;
                return (
                  (0, Ut.getIn)(s, [n, r]) !== r && (s = ad(s, r, a, n, o)),
                  to(s, n, u, i, o)
                );
              }
              case DS: {
                let {
                  elementId: n,
                  actionTypeId: r,
                  current: i,
                  actionItem: o,
                } = t.payload;
                return to(e, n, r, i, o);
              }
              default:
                return e;
            }
          });
        qS = [
          [wS, xS],
          [AS, RS],
          [OS, CS],
          [SS, PS],
        ];
      });
    var cd = d((no) => {
      "use strict";
      Object.defineProperty(no, "__esModule", { value: !0 });
      function GS(e, t) {
        for (var n in t)
          Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
      }
      GS(no, {
        clearPlugin: function () {
          return zS;
        },
        createPluginInstance: function () {
          return HS;
        },
        getPluginConfig: function () {
          return XS;
        },
        getPluginDestination: function () {
          return VS;
        },
        getPluginDuration: function () {
          return US;
        },
        getPluginOrigin: function () {
          return WS;
        },
        renderPlugin: function () {
          return BS;
        },
      });
      var XS = (e) => e.value,
        US = (e, t) => {
          if (t.config.duration !== "auto") return null;
          let n = parseFloat(e.getAttribute("data-duration"));
          return n > 0
            ? n * 1e3
            : parseFloat(e.getAttribute("data-default-duration")) * 1e3;
        },
        WS = (e) => e || { value: 0 },
        VS = (e) => ({ value: e.value }),
        HS = (e) => {
          let t = window.Webflow.require("lottie").createInstance(e);
          return t.stop(), t.setSubframe(!0), t;
        },
        BS = (e, t, n) => {
          if (!e) return;
          let r = t[n.actionTypeId].value / 100;
          e.goToFrame(e.frames * r);
        },
        zS = (e) => {
          window.Webflow.require("lottie").createInstance(e).stop();
        };
    });
    var fd = d((ro) => {
      "use strict";
      Object.defineProperty(ro, "__esModule", { value: !0 });
      function KS(e, t) {
        for (var n in t)
          Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
      }
      KS(ro, {
        clearPlugin: function () {
          return rx;
        },
        createPluginInstance: function () {
          return tx;
        },
        getPluginConfig: function () {
          return $S;
        },
        getPluginDestination: function () {
          return ex;
        },
        getPluginDuration: function () {
          return ZS;
        },
        getPluginOrigin: function () {
          return JS;
        },
        renderPlugin: function () {
          return nx;
        },
      });
      var jS = (e) => document.querySelector(`[data-w-id="${e}"]`),
        YS = () => window.Webflow.require("spline"),
        QS = (e, t) => e.filter((n) => !t.includes(n)),
        $S = (e, t) => e.value[t],
        ZS = () => null,
        ld = Object.freeze({
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1,
        }),
        JS = (e, t) => {
          let n = t.config.value,
            r = Object.keys(n);
          if (e) {
            let o = Object.keys(e),
              a = QS(r, o);
            return a.length ? a.reduce((s, f) => ((s[f] = ld[f]), s), e) : e;
          }
          return r.reduce((o, a) => ((o[a] = ld[a]), o), {});
        },
        ex = (e) => e.value,
        tx = (e, t) => {
          let n = t?.config?.target?.pluginElement;
          return n ? jS(n) : null;
        },
        nx = (e, t, n) => {
          let r = YS(),
            i = r.getInstance(e),
            o = n.config.target.objectId,
            a = (u) => {
              if (!u)
                throw new Error("Invalid spline app passed to renderSpline");
              let s = o && u.findObjectById(o);
              if (!s) return;
              let { PLUGIN_SPLINE: f } = t;
              f.positionX != null && (s.position.x = f.positionX),
                f.positionY != null && (s.position.y = f.positionY),
                f.positionZ != null && (s.position.z = f.positionZ),
                f.rotationX != null && (s.rotation.x = f.rotationX),
                f.rotationY != null && (s.rotation.y = f.rotationY),
                f.rotationZ != null && (s.rotation.z = f.rotationZ),
                f.scaleX != null && (s.scale.x = f.scaleX),
                f.scaleY != null && (s.scale.y = f.scaleY),
                f.scaleZ != null && (s.scale.z = f.scaleZ);
            };
          i ? a(i.spline) : r.setLoadHandler(e, a);
        },
        rx = () => null;
    });
    var dd = d((ao) => {
      "use strict";
      Object.defineProperty(ao, "__esModule", { value: !0 });
      function ix(e, t) {
        for (var n in t)
          Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
      }
      ix(ao, {
        clearPlugin: function () {
          return px;
        },
        createPluginInstance: function () {
          return fx;
        },
        getPluginConfig: function () {
          return sx;
        },
        getPluginDestination: function () {
          return lx;
        },
        getPluginDuration: function () {
          return ux;
        },
        getPluginOrigin: function () {
          return cx;
        },
        renderPlugin: function () {
          return dx;
        },
      });
      var io = "--wf-rive-fit",
        oo = "--wf-rive-alignment",
        ox = (e) => document.querySelector(`[data-w-id="${e}"]`),
        ax = () => window.Webflow.require("rive"),
        sx = (e, t) => e.value.inputs[t],
        ux = () => null,
        cx = (e, t) => {
          if (e) return e;
          let n = {},
            { inputs: r = {} } = t.config.value;
          for (let i in r) r[i] == null && (n[i] = 0);
          return n;
        },
        lx = (e) => e.value.inputs ?? {},
        fx = (e, t) => {
          if ((t.config?.target?.selectorGuids || []).length > 0) return e;
          let r = t?.config?.target?.pluginElement;
          return r ? ox(r) : null;
        },
        dx = (e, { PLUGIN_RIVE: t }, n) => {
          let r = ax(),
            i = r.getInstance(e),
            o = r.rive.StateMachineInputType,
            { name: a, inputs: u = {} } = n.config.value || {};
          function s(f) {
            if (f.loaded) m();
            else {
              let v = () => {
                m(), f?.off("load", v);
              };
              f?.on("load", v);
            }
            function m() {
              let v = f.stateMachineInputs(a);
              if (v != null) {
                if ((f.isPlaying || f.play(a, !1), io in u || oo in u)) {
                  let g = f.layout,
                    E = u[io] ?? g.fit,
                    T = u[oo] ?? g.alignment;
                  (E !== g.fit || T !== g.alignment) &&
                    (f.layout = g.copyWith({ fit: E, alignment: T }));
                }
                for (let g in u) {
                  if (g === io || g === oo) continue;
                  let E = v.find((T) => T.name === g);
                  if (E != null)
                    switch (E.type) {
                      case o.Boolean: {
                        if (u[g] != null) {
                          let T = !!u[g];
                          E.value = T;
                        }
                        break;
                      }
                      case o.Number: {
                        let T = t[g];
                        T != null && (E.value = T);
                        break;
                      }
                      case o.Trigger: {
                        u[g] && E.fire();
                        break;
                      }
                    }
                }
              }
            }
          }
          i?.rive ? s(i.rive) : r.setLoadHandler(e, s);
        },
        px = (e, t) => null;
    });
    var uo = d((so) => {
      "use strict";
      Object.defineProperty(so, "__esModule", { value: !0 });
      Object.defineProperty(so, "normalizeColor", {
        enumerable: !0,
        get: function () {
          return gx;
        },
      });
      var pd = {
        aliceblue: "#F0F8FF",
        antiquewhite: "#FAEBD7",
        aqua: "#00FFFF",
        aquamarine: "#7FFFD4",
        azure: "#F0FFFF",
        beige: "#F5F5DC",
        bisque: "#FFE4C4",
        black: "#000000",
        blanchedalmond: "#FFEBCD",
        blue: "#0000FF",
        blueviolet: "#8A2BE2",
        brown: "#A52A2A",
        burlywood: "#DEB887",
        cadetblue: "#5F9EA0",
        chartreuse: "#7FFF00",
        chocolate: "#D2691E",
        coral: "#FF7F50",
        cornflowerblue: "#6495ED",
        cornsilk: "#FFF8DC",
        crimson: "#DC143C",
        cyan: "#00FFFF",
        darkblue: "#00008B",
        darkcyan: "#008B8B",
        darkgoldenrod: "#B8860B",
        darkgray: "#A9A9A9",
        darkgreen: "#006400",
        darkgrey: "#A9A9A9",
        darkkhaki: "#BDB76B",
        darkmagenta: "#8B008B",
        darkolivegreen: "#556B2F",
        darkorange: "#FF8C00",
        darkorchid: "#9932CC",
        darkred: "#8B0000",
        darksalmon: "#E9967A",
        darkseagreen: "#8FBC8F",
        darkslateblue: "#483D8B",
        darkslategray: "#2F4F4F",
        darkslategrey: "#2F4F4F",
        darkturquoise: "#00CED1",
        darkviolet: "#9400D3",
        deeppink: "#FF1493",
        deepskyblue: "#00BFFF",
        dimgray: "#696969",
        dimgrey: "#696969",
        dodgerblue: "#1E90FF",
        firebrick: "#B22222",
        floralwhite: "#FFFAF0",
        forestgreen: "#228B22",
        fuchsia: "#FF00FF",
        gainsboro: "#DCDCDC",
        ghostwhite: "#F8F8FF",
        gold: "#FFD700",
        goldenrod: "#DAA520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#ADFF2F",
        grey: "#808080",
        honeydew: "#F0FFF0",
        hotpink: "#FF69B4",
        indianred: "#CD5C5C",
        indigo: "#4B0082",
        ivory: "#FFFFF0",
        khaki: "#F0E68C",
        lavender: "#E6E6FA",
        lavenderblush: "#FFF0F5",
        lawngreen: "#7CFC00",
        lemonchiffon: "#FFFACD",
        lightblue: "#ADD8E6",
        lightcoral: "#F08080",
        lightcyan: "#E0FFFF",
        lightgoldenrodyellow: "#FAFAD2",
        lightgray: "#D3D3D3",
        lightgreen: "#90EE90",
        lightgrey: "#D3D3D3",
        lightpink: "#FFB6C1",
        lightsalmon: "#FFA07A",
        lightseagreen: "#20B2AA",
        lightskyblue: "#87CEFA",
        lightslategray: "#778899",
        lightslategrey: "#778899",
        lightsteelblue: "#B0C4DE",
        lightyellow: "#FFFFE0",
        lime: "#00FF00",
        limegreen: "#32CD32",
        linen: "#FAF0E6",
        magenta: "#FF00FF",
        maroon: "#800000",
        mediumaquamarine: "#66CDAA",
        mediumblue: "#0000CD",
        mediumorchid: "#BA55D3",
        mediumpurple: "#9370DB",
        mediumseagreen: "#3CB371",
        mediumslateblue: "#7B68EE",
        mediumspringgreen: "#00FA9A",
        mediumturquoise: "#48D1CC",
        mediumvioletred: "#C71585",
        midnightblue: "#191970",
        mintcream: "#F5FFFA",
        mistyrose: "#FFE4E1",
        moccasin: "#FFE4B5",
        navajowhite: "#FFDEAD",
        navy: "#000080",
        oldlace: "#FDF5E6",
        olive: "#808000",
        olivedrab: "#6B8E23",
        orange: "#FFA500",
        orangered: "#FF4500",
        orchid: "#DA70D6",
        palegoldenrod: "#EEE8AA",
        palegreen: "#98FB98",
        paleturquoise: "#AFEEEE",
        palevioletred: "#DB7093",
        papayawhip: "#FFEFD5",
        peachpuff: "#FFDAB9",
        peru: "#CD853F",
        pink: "#FFC0CB",
        plum: "#DDA0DD",
        powderblue: "#B0E0E6",
        purple: "#800080",
        rebeccapurple: "#663399",
        red: "#FF0000",
        rosybrown: "#BC8F8F",
        royalblue: "#4169E1",
        saddlebrown: "#8B4513",
        salmon: "#FA8072",
        sandybrown: "#F4A460",
        seagreen: "#2E8B57",
        seashell: "#FFF5EE",
        sienna: "#A0522D",
        silver: "#C0C0C0",
        skyblue: "#87CEEB",
        slateblue: "#6A5ACD",
        slategray: "#708090",
        slategrey: "#708090",
        snow: "#FFFAFA",
        springgreen: "#00FF7F",
        steelblue: "#4682B4",
        tan: "#D2B48C",
        teal: "#008080",
        thistle: "#D8BFD8",
        tomato: "#FF6347",
        turquoise: "#40E0D0",
        violet: "#EE82EE",
        wheat: "#F5DEB3",
        white: "#FFFFFF",
        whitesmoke: "#F5F5F5",
        yellow: "#FFFF00",
        yellowgreen: "#9ACD32",
      };
      function gx(e) {
        let t,
          n,
          r,
          i = 1,
          o = e.replace(/\s/g, "").toLowerCase(),
          u = (typeof pd[o] == "string" ? pd[o].toLowerCase() : null) || o;
        if (u.startsWith("#")) {
          let s = u.substring(1);
          s.length === 3 || s.length === 4
            ? ((t = parseInt(s[0] + s[0], 16)),
              (n = parseInt(s[1] + s[1], 16)),
              (r = parseInt(s[2] + s[2], 16)),
              s.length === 4 && (i = parseInt(s[3] + s[3], 16) / 255))
            : (s.length === 6 || s.length === 8) &&
              ((t = parseInt(s.substring(0, 2), 16)),
              (n = parseInt(s.substring(2, 4), 16)),
              (r = parseInt(s.substring(4, 6), 16)),
              s.length === 8 && (i = parseInt(s.substring(6, 8), 16) / 255));
        } else if (u.startsWith("rgba")) {
          let s = u.match(/rgba\(([^)]+)\)/)[1].split(",");
          (t = parseInt(s[0], 10)),
            (n = parseInt(s[1], 10)),
            (r = parseInt(s[2], 10)),
            (i = parseFloat(s[3]));
        } else if (u.startsWith("rgb")) {
          let s = u.match(/rgb\(([^)]+)\)/)[1].split(",");
          (t = parseInt(s[0], 10)),
            (n = parseInt(s[1], 10)),
            (r = parseInt(s[2], 10));
        } else if (u.startsWith("hsla")) {
          let s = u.match(/hsla\(([^)]+)\)/)[1].split(","),
            f = parseFloat(s[0]),
            m = parseFloat(s[1].replace("%", "")) / 100,
            v = parseFloat(s[2].replace("%", "")) / 100;
          i = parseFloat(s[3]);
          let g = (1 - Math.abs(2 * v - 1)) * m,
            E = g * (1 - Math.abs(((f / 60) % 2) - 1)),
            T = v - g / 2,
            w,
            R,
            b;
          f >= 0 && f < 60
            ? ((w = g), (R = E), (b = 0))
            : f >= 60 && f < 120
            ? ((w = E), (R = g), (b = 0))
            : f >= 120 && f < 180
            ? ((w = 0), (R = g), (b = E))
            : f >= 180 && f < 240
            ? ((w = 0), (R = E), (b = g))
            : f >= 240 && f < 300
            ? ((w = E), (R = 0), (b = g))
            : ((w = g), (R = 0), (b = E)),
            (t = Math.round((w + T) * 255)),
            (n = Math.round((R + T) * 255)),
            (r = Math.round((b + T) * 255));
        } else if (u.startsWith("hsl")) {
          let s = u.match(/hsl\(([^)]+)\)/)[1].split(","),
            f = parseFloat(s[0]),
            m = parseFloat(s[1].replace("%", "")) / 100,
            v = parseFloat(s[2].replace("%", "")) / 100,
            g = (1 - Math.abs(2 * v - 1)) * m,
            E = g * (1 - Math.abs(((f / 60) % 2) - 1)),
            T = v - g / 2,
            w,
            R,
            b;
          f >= 0 && f < 60
            ? ((w = g), (R = E), (b = 0))
            : f >= 60 && f < 120
            ? ((w = E), (R = g), (b = 0))
            : f >= 120 && f < 180
            ? ((w = 0), (R = g), (b = E))
            : f >= 180 && f < 240
            ? ((w = 0), (R = E), (b = g))
            : f >= 240 && f < 300
            ? ((w = E), (R = 0), (b = g))
            : ((w = g), (R = 0), (b = E)),
            (t = Math.round((w + T) * 255)),
            (n = Math.round((R + T) * 255)),
            (r = Math.round((b + T) * 255));
        }
        if (Number.isNaN(t) || Number.isNaN(n) || Number.isNaN(r))
          throw new Error(
            `Invalid color in [ix2/shared/utils/normalizeColor.js] '${e}'`
          );
        return { red: t, green: n, blue: r, alpha: i };
      }
    });
    var gd = d((co) => {
      "use strict";
      Object.defineProperty(co, "__esModule", { value: !0 });
      function hx(e, t) {
        for (var n in t)
          Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
      }
      hx(co, {
        clearPlugin: function () {
          return bx;
        },
        createPluginInstance: function () {
          return Ix;
        },
        getPluginConfig: function () {
          return Ex;
        },
        getPluginDestination: function () {
          return _x;
        },
        getPluginDuration: function () {
          return mx;
        },
        getPluginOrigin: function () {
          return yx;
        },
        renderPlugin: function () {
          return Tx;
        },
      });
      var vx = uo(),
        Ex = (e, t) => e.value[t],
        mx = () => null,
        yx = (e, t) => {
          if (e) return e;
          let n = t.config.value,
            r = t.config.target.objectId,
            i = getComputedStyle(document.documentElement).getPropertyValue(r);
          if (n.size != null) return { size: parseInt(i, 10) };
          if (n.red != null && n.green != null && n.blue != null)
            return (0, vx.normalizeColor)(i);
        },
        _x = (e) => e.value,
        Ix = () => null,
        Tx = (e, t, n) => {
          let r = n.config.target.objectId,
            i = n.config.value.unit,
            { PLUGIN_VARIABLE: o } = t,
            { size: a, red: u, green: s, blue: f, alpha: m } = o,
            v;
          a != null && (v = a + i),
            u != null &&
              f != null &&
              s != null &&
              m != null &&
              (v = `rgba(${u}, ${s}, ${f}, ${m})`),
            v != null && document.documentElement.style.setProperty(r, v);
        },
        bx = (e, t) => {
          let n = t.config.target.objectId;
          document.documentElement.style.removeProperty(n);
        };
    });
    var vd = d((lo) => {
      "use strict";
      Object.defineProperty(lo, "__esModule", { value: !0 });
      Object.defineProperty(lo, "pluginMethodMap", {
        enumerable: !0,
        get: function () {
          return xx;
        },
      });
      var vr = (Me(), Qe(ys)),
        wx = Er(cd()),
        Ax = Er(fd()),
        Ox = Er(dd()),
        Sx = Er(gd());
      function hd(e) {
        if (typeof WeakMap != "function") return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (hd = function (r) {
          return r ? n : t;
        })(e);
      }
      function Er(e, t) {
        if (!t && e && e.__esModule) return e;
        if (e === null || (typeof e != "object" && typeof e != "function"))
          return { default: e };
        var n = hd(t);
        if (n && n.has(e)) return n.get(e);
        var r = { __proto__: null },
          i = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var o in e)
          if (o !== "default" && Object.prototype.hasOwnProperty.call(e, o)) {
            var a = i ? Object.getOwnPropertyDescriptor(e, o) : null;
            a && (a.get || a.set)
              ? Object.defineProperty(r, o, a)
              : (r[o] = e[o]);
          }
        return (r.default = e), n && n.set(e, r), r;
      }
      var xx = new Map([
        [vr.ActionTypeConsts.PLUGIN_LOTTIE, { ...wx }],
        [vr.ActionTypeConsts.PLUGIN_SPLINE, { ...Ax }],
        [vr.ActionTypeConsts.PLUGIN_RIVE, { ...Ox }],
        [vr.ActionTypeConsts.PLUGIN_VARIABLE, { ...Sx }],
      ]);
    });
    var Ed = {};
    Ne(Ed, {
      clearPlugin: () => Eo,
      createPluginInstance: () => Cx,
      getPluginConfig: () => po,
      getPluginDestination: () => ho,
      getPluginDuration: () => Rx,
      getPluginOrigin: () => go,
      isPluginType: () => It,
      renderPlugin: () => vo,
    });
    function It(e) {
      return fo.pluginMethodMap.has(e);
    }
    var fo,
      Tt,
      po,
      go,
      Rx,
      ho,
      Cx,
      vo,
      Eo,
      mo = Ee(() => {
        "use strict";
        pr();
        fo = fe(vd());
        (Tt = (e) => (t) => {
          if (!ze) return () => null;
          let n = fo.pluginMethodMap.get(t);
          if (!n) throw new Error(`IX2 no plugin configured for: ${t}`);
          let r = n[e];
          if (!r) throw new Error(`IX2 invalid plugin method: ${e}`);
          return r;
        }),
          (po = Tt("getPluginConfig")),
          (go = Tt("getPluginOrigin")),
          (Rx = Tt("getPluginDuration")),
          (ho = Tt("getPluginDestination")),
          (Cx = Tt("createPluginInstance")),
          (vo = Tt("renderPlugin")),
          (Eo = Tt("clearPlugin"));
      });
    var yd = d((Hq, md) => {
      function Px(e, t) {
        return e == null || e !== e ? t : e;
      }
      md.exports = Px;
    });
    var Id = d((Bq, _d) => {
      function Lx(e, t, n, r) {
        var i = -1,
          o = e == null ? 0 : e.length;
        for (r && o && (n = e[++i]); ++i < o; ) n = t(n, e[i], i, e);
        return n;
      }
      _d.exports = Lx;
    });
    var bd = d((zq, Td) => {
      function Nx(e) {
        return function (t, n, r) {
          for (var i = -1, o = Object(t), a = r(t), u = a.length; u--; ) {
            var s = a[e ? u : ++i];
            if (n(o[s], s, o) === !1) break;
          }
          return t;
        };
      }
      Td.exports = Nx;
    });
    var Ad = d((Kq, wd) => {
      var Dx = bd(),
        Mx = Dx();
      wd.exports = Mx;
    });
    var yo = d((jq, Od) => {
      var Fx = Ad(),
        qx = hn();
      function kx(e, t) {
        return e && Fx(e, t, qx);
      }
      Od.exports = kx;
    });
    var xd = d((Yq, Sd) => {
      var Gx = yt();
      function Xx(e, t) {
        return function (n, r) {
          if (n == null) return n;
          if (!Gx(n)) return e(n, r);
          for (
            var i = n.length, o = t ? i : -1, a = Object(n);
            (t ? o-- : ++o < i) && r(a[o], o, a) !== !1;
  
          );
          return n;
        };
      }
      Sd.exports = Xx;
    });
    var _o = d((Qq, Rd) => {
      var Ux = yo(),
        Wx = xd(),
        Vx = Wx(Ux);
      Rd.exports = Vx;
    });
    var Pd = d(($q, Cd) => {
      function Hx(e, t, n, r, i) {
        return (
          i(e, function (o, a, u) {
            n = r ? ((r = !1), o) : t(n, o, a, u);
          }),
          n
        );
      }
      Cd.exports = Hx;
    });
    var Nd = d((Zq, Ld) => {
      var Bx = Id(),
        zx = _o(),
        Kx = pt(),
        jx = Pd(),
        Yx = be();
      function Qx(e, t, n) {
        var r = Yx(e) ? Bx : jx,
          i = arguments.length < 3;
        return r(e, Kx(t, 4), n, i, zx);
      }
      Ld.exports = Qx;
    });
    var Md = d((Jq, Dd) => {
      var $x = ji(),
        Zx = pt(),
        Jx = Yi(),
        eR = Math.max,
        tR = Math.min;
      function nR(e, t, n) {
        var r = e == null ? 0 : e.length;
        if (!r) return -1;
        var i = r - 1;
        return (
          n !== void 0 &&
            ((i = Jx(n)), (i = n < 0 ? eR(r + i, 0) : tR(i, r - 1))),
          $x(e, Zx(t, 3), i, !0)
        );
      }
      Dd.exports = nR;
    });
    var qd = d((ek, Fd) => {
      var rR = Ki(),
        iR = Md(),
        oR = rR(iR);
      Fd.exports = oR;
    });
    function kd(e, t) {
      return e === t ? e !== 0 || t !== 0 || 1 / e === 1 / t : e !== e && t !== t;
    }
    function aR(e, t) {
      if (kd(e, t)) return !0;
      if (
        typeof e != "object" ||
        e === null ||
        typeof t != "object" ||
        t === null
      )
        return !1;
      let n = Object.keys(e),
        r = Object.keys(t);
      if (n.length !== r.length) return !1;
      for (let i = 0; i < n.length; i++)
        if (!Object.hasOwn(t, n[i]) || !kd(e[n[i]], t[n[i]])) return !1;
      return !0;
    }
    var Io,
      Gd = Ee(() => {
        "use strict";
        Io = aR;
      });
    var rp = {};
    Ne(rp, {
      cleanupHTMLElement: () => rC,
      clearAllStyles: () => nC,
      clearObjectCache: () => bR,
      getActionListProgress: () => oC,
      getAffectedElements: () => Oo,
      getComputedStyle: () => PR,
      getDestinationValues: () => kR,
      getElementId: () => SR,
      getInstanceId: () => AR,
      getInstanceOrigin: () => DR,
      getItemConfigByKey: () => qR,
      getMaxDurationItemIndex: () => np,
      getNamespacedParameterId: () => uC,
      getRenderType: () => Jd,
      getStyleProp: () => GR,
      mediaQueriesEqual: () => lC,
      observeStore: () => CR,
      reduceListToGroup: () => aC,
      reifyState: () => xR,
      renderHTMLElement: () => XR,
      shallowEqual: () => Io,
      shouldAllowMediaQuery: () => cC,
      shouldNamespaceEventParameter: () => sC,
      stringifyTarget: () => fC,
    });
    function bR() {
      mr.clear();
    }
    function AR() {
      return "i" + wR++;
    }
    function SR(e, t) {
      for (let n in e) {
        let r = e[n];
        if (r && r.ref === t) return r.id;
      }
      return "e" + OR++;
    }
    function xR({ events: e, actionLists: t, site: n } = {}) {
      let r = (0, Tr.default)(
          e,
          (a, u) => {
            let { eventTypeId: s } = u;
            return a[s] || (a[s] = {}), (a[s][u.id] = u), a;
          },
          {}
        ),
        i = n && n.mediaQueries,
        o = [];
      return (
        i
          ? (o = i.map((a) => a.key))
          : ((i = []), console.warn("IX2 missing mediaQueries in site data")),
        {
          ixData: {
            events: e,
            actionLists: t,
            eventTypeMap: r,
            mediaQueries: i,
            mediaQueryKeys: o,
          },
        }
      );
    }
    function CR({ store: e, select: t, onChange: n, comparator: r = RR }) {
      let { getState: i, subscribe: o } = e,
        a = o(s),
        u = t(i());
      function s() {
        let f = t(i());
        if (f == null) {
          a();
          return;
        }
        r(f, u) || ((u = f), n(u, e));
      }
      return a;
    }
    function Wd(e) {
      let t = typeof e;
      if (t === "string") return { id: e };
      if (e != null && t === "object") {
        let {
          id: n,
          objectId: r,
          selector: i,
          selectorGuids: o,
          appliesTo: a,
          useEventTarget: u,
        } = e;
        return {
          id: n,
          objectId: r,
          selector: i,
          selectorGuids: o,
          appliesTo: a,
          useEventTarget: u,
        };
      }
      return {};
    }
    function Oo({
      config: e,
      event: t,
      eventTarget: n,
      elementRoot: r,
      elementApi: i,
    }) {
      if (!i) throw new Error("IX2 missing elementApi");
      let { targets: o } = e;
      if (Array.isArray(o) && o.length > 0)
        return o.reduce(
          (G, S) =>
            G.concat(
              Oo({
                config: { target: S },
                event: t,
                eventTarget: n,
                elementRoot: r,
                elementApi: i,
              })
            ),
          []
        );
      let {
          getValidDocument: a,
          getQuerySelector: u,
          queryDocument: s,
          getChildElements: f,
          getSiblingElements: m,
          matchSelector: v,
          elementContains: g,
          isSiblingNode: E,
        } = i,
        { target: T } = e;
      if (!T) return [];
      let {
        id: w,
        objectId: R,
        selector: b,
        selectorGuids: L,
        appliesTo: C,
        useEventTarget: M,
      } = Wd(T);
      if (R) return [mr.has(R) ? mr.get(R) : mr.set(R, {}).get(R)];
      if (C === yi.PAGE) {
        let G = a(w);
        return G ? [G] : [];
      }
      let N = (t?.action?.config?.affectedElements ?? {})[w || b] || {},
        V = !!(N.id || N.selector),
        B,
        Q,
        Z,
        te = t && u(Wd(t.target));
      if (
        (V
          ? ((B = N.limitAffectedElements), (Q = te), (Z = u(N)))
          : (Q = Z = u({ id: w, selector: b, selectorGuids: L })),
        t && M)
      ) {
        let G = n && (Z || M === !0) ? [n] : s(te);
        if (Z) {
          if (M === _R) return s(Z).filter((S) => G.some((q) => g(S, q)));
          if (M === Xd) return s(Z).filter((S) => G.some((q) => g(q, S)));
          if (M === Ud) return s(Z).filter((S) => G.some((q) => E(q, S)));
        }
        return G;
      }
      return Q == null || Z == null
        ? []
        : ze && r
        ? s(Z).filter((G) => r.contains(G))
        : B === Xd
        ? s(Q, Z)
        : B === yR
        ? f(s(Q)).filter(v(Z))
        : B === Ud
        ? m(s(Q)).filter(v(Z))
        : s(Z);
    }
    function PR({ element: e, actionItem: t }) {
      if (!ze) return {};
      let { actionTypeId: n } = t;
      switch (n) {
        case zt:
        case Kt:
        case jt:
        case Yt:
        case wr:
          return window.getComputedStyle(e);
        default:
          return {};
      }
    }
    function DR(e, t = {}, n = {}, r, i) {
      let { getStyle: o } = i,
        { actionTypeId: a } = r;
      if (It(a)) return go(a)(t[a], r);
      switch (r.actionTypeId) {
        case Vt:
        case Ht:
        case Bt:
        case An:
          return t[r.actionTypeId] || So[r.actionTypeId];
        case On:
          return LR(t[r.actionTypeId], r.config.filters);
        case Sn:
          return NR(t[r.actionTypeId], r.config.fontVariations);
        case Qd:
          return { value: (0, st.default)(parseFloat(o(e, _r)), 1) };
        case zt: {
          let u = o(e, tt),
            s = o(e, nt),
            f,
            m;
          return (
            r.config.widthUnit === ht
              ? (f = Vd.test(u) ? parseFloat(u) : parseFloat(n.width))
              : (f = (0, st.default)(parseFloat(u), parseFloat(n.width))),
            r.config.heightUnit === ht
              ? (m = Vd.test(s) ? parseFloat(s) : parseFloat(n.height))
              : (m = (0, st.default)(parseFloat(s), parseFloat(n.height))),
            { widthValue: f, heightValue: m }
          );
        }
        case Kt:
        case jt:
        case Yt:
          return JR({
            element: e,
            actionTypeId: r.actionTypeId,
            computedStyle: n,
            getStyle: o,
          });
        case wr:
          return { value: (0, st.default)(o(e, Ir), n.display) };
        case TR:
          return t[r.actionTypeId] || { value: 0 };
        default:
          return;
      }
    }
    function kR({ element: e, actionItem: t, elementApi: n }) {
      if (It(t.actionTypeId)) return ho(t.actionTypeId)(t.config);
      switch (t.actionTypeId) {
        case Vt:
        case Ht:
        case Bt:
        case An: {
          let { xValue: r, yValue: i, zValue: o } = t.config;
          return { xValue: r, yValue: i, zValue: o };
        }
        case zt: {
          let { getStyle: r, setStyle: i, getProperty: o } = n,
            { widthUnit: a, heightUnit: u } = t.config,
            { widthValue: s, heightValue: f } = t.config;
          if (!ze) return { widthValue: s, heightValue: f };
          if (a === ht) {
            let m = r(e, tt);
            i(e, tt, ""), (s = o(e, "offsetWidth")), i(e, tt, m);
          }
          if (u === ht) {
            let m = r(e, nt);
            i(e, nt, ""), (f = o(e, "offsetHeight")), i(e, nt, m);
          }
          return { widthValue: s, heightValue: f };
        }
        case Kt:
        case jt:
        case Yt: {
          let {
            rValue: r,
            gValue: i,
            bValue: o,
            aValue: a,
            globalSwatchId: u,
          } = t.config;
          if (u && u.startsWith("--")) {
            let { getStyle: s } = n,
              f = s(e, u),
              m = (0, zd.normalizeColor)(f);
            return {
              rValue: m.red,
              gValue: m.green,
              bValue: m.blue,
              aValue: m.alpha,
            };
          }
          return { rValue: r, gValue: i, bValue: o, aValue: a };
        }
        case On:
          return t.config.filters.reduce(MR, {});
        case Sn:
          return t.config.fontVariations.reduce(FR, {});
        default: {
          let { value: r } = t.config;
          return { value: r };
        }
      }
    }
    function Jd(e) {
      if (/^TRANSFORM_/.test(e)) return jd;
      if (/^STYLE_/.test(e)) return wo;
      if (/^GENERAL_/.test(e)) return bo;
      if (/^PLUGIN_/.test(e)) return Yd;
    }
    function GR(e, t) {
      return e === wo ? t.replace("STYLE_", "").toLowerCase() : null;
    }
    function XR(e, t, n, r, i, o, a, u, s) {
      switch (u) {
        case jd:
          return BR(e, t, n, i, a);
        case wo:
          return eC(e, t, n, i, o, a);
        case bo:
          return tC(e, i, a);
        case Yd: {
          let { actionTypeId: f } = i;
          if (It(f)) return vo(f)(s, t, i);
        }
      }
    }
    function BR(e, t, n, r, i) {
      let o = HR.map((u) => {
          let s = So[u],
            {
              xValue: f = s.xValue,
              yValue: m = s.yValue,
              zValue: v = s.zValue,
              xUnit: g = "",
              yUnit: E = "",
              zUnit: T = "",
            } = t[u] || {};
          switch (u) {
            case Vt:
              return `${cR}(${f}${g}, ${m}${E}, ${v}${T})`;
            case Ht:
              return `${lR}(${f}${g}, ${m}${E}, ${v}${T})`;
            case Bt:
              return `${fR}(${f}${g}) ${dR}(${m}${E}) ${pR}(${v}${T})`;
            case An:
              return `${gR}(${f}${g}, ${m}${E})`;
            default:
              return "";
          }
        }).join(" "),
        { setStyle: a } = i;
      bt(e, gt, i), a(e, gt, o), jR(r, n) && a(e, dr, hR);
    }
    function zR(e, t, n, r) {
      let i = (0, Tr.default)(t, (a, u, s) => `${a} ${s}(${u}${VR(s, n)})`, ""),
        { setStyle: o } = r;
      bt(e, Tn, r), o(e, Tn, i);
    }
    function KR(e, t, n, r) {
      let i = (0, Tr.default)(
          t,
          (a, u, s) => (a.push(`"${s}" ${u}`), a),
          []
        ).join(", "),
        { setStyle: o } = r;
      bt(e, bn, r), o(e, bn, i);
    }
    function jR({ actionTypeId: e }, { xValue: t, yValue: n, zValue: r }) {
      return (
        (e === Vt && r !== void 0) ||
        (e === Ht && r !== void 0) ||
        (e === Bt && (t !== void 0 || n !== void 0))
      );
    }
    function ZR(e, t) {
      let n = e.exec(t);
      return n ? n[1] : "";
    }
    function JR({ element: e, actionTypeId: t, computedStyle: n, getStyle: r }) {
      let i = Ao[t],
        o = r(e, i),
        a = QR.test(o) ? o : n[i],
        u = ZR($R, a).split(wn);
      return {
        rValue: (0, st.default)(parseInt(u[0], 10), 255),
        gValue: (0, st.default)(parseInt(u[1], 10), 255),
        bValue: (0, st.default)(parseInt(u[2], 10), 255),
        aValue: (0, st.default)(parseFloat(u[3]), 1),
      };
    }
    function eC(e, t, n, r, i, o) {
      let { setStyle: a } = o;
      switch (r.actionTypeId) {
        case zt: {
          let { widthUnit: u = "", heightUnit: s = "" } = r.config,
            { widthValue: f, heightValue: m } = n;
          f !== void 0 && (u === ht && (u = "px"), bt(e, tt, o), a(e, tt, f + u)),
            m !== void 0 &&
              (s === ht && (s = "px"), bt(e, nt, o), a(e, nt, m + s));
          break;
        }
        case On: {
          zR(e, n, r.config, o);
          break;
        }
        case Sn: {
          KR(e, n, r.config, o);
          break;
        }
        case Kt:
        case jt:
        case Yt: {
          let u = Ao[r.actionTypeId],
            s = Math.round(n.rValue),
            f = Math.round(n.gValue),
            m = Math.round(n.bValue),
            v = n.aValue;
          bt(e, u, o),
            a(e, u, v >= 1 ? `rgb(${s},${f},${m})` : `rgba(${s},${f},${m},${v})`);
          break;
        }
        default: {
          let { unit: u = "" } = r.config;
          bt(e, i, o), a(e, i, n.value + u);
          break;
        }
      }
    }
    function tC(e, t, n) {
      let { setStyle: r } = n;
      switch (t.actionTypeId) {
        case wr: {
          let { value: i } = t.config;
          i === vR && ze ? r(e, Ir, $i) : r(e, Ir, i);
          return;
        }
      }
    }
    function bt(e, t, n) {
      if (!ze) return;
      let r = Zd[t];
      if (!r) return;
      let { getStyle: i, setStyle: o } = n,
        a = i(e, Wt);
      if (!a) {
        o(e, Wt, r);
        return;
      }
      let u = a.split(wn).map($d);
      u.indexOf(r) === -1 && o(e, Wt, u.concat(r).join(wn));
    }
    function ep(e, t, n) {
      if (!ze) return;
      let r = Zd[t];
      if (!r) return;
      let { getStyle: i, setStyle: o } = n,
        a = i(e, Wt);
      !a ||
        a.indexOf(r) === -1 ||
        o(
          e,
          Wt,
          a
            .split(wn)
            .map($d)
            .filter((u) => u !== r)
            .join(wn)
        );
    }
    function nC({ store: e, elementApi: t }) {
      let { ixData: n } = e.getState(),
        { events: r = {}, actionLists: i = {} } = n;
      Object.keys(r).forEach((o) => {
        let a = r[o],
          { config: u } = a.action,
          { actionListId: s } = u,
          f = i[s];
        f && Hd({ actionList: f, event: a, elementApi: t });
      }),
        Object.keys(i).forEach((o) => {
          Hd({ actionList: i[o], elementApi: t });
        });
    }
    function Hd({ actionList: e = {}, event: t, elementApi: n }) {
      let { actionItemGroups: r, continuousParameterGroups: i } = e;
      r &&
        r.forEach((o) => {
          Bd({ actionGroup: o, event: t, elementApi: n });
        }),
        i &&
          i.forEach((o) => {
            let { continuousActionGroups: a } = o;
            a.forEach((u) => {
              Bd({ actionGroup: u, event: t, elementApi: n });
            });
          });
    }
    function Bd({ actionGroup: e, event: t, elementApi: n }) {
      let { actionItems: r } = e;
      r.forEach((i) => {
        let { actionTypeId: o, config: a } = i,
          u;
        It(o)
          ? (u = (s) => Eo(o)(s, i))
          : (u = tp({ effect: iC, actionTypeId: o, elementApi: n })),
          Oo({ config: a, event: t, elementApi: n }).forEach(u);
      });
    }
    function rC(e, t, n) {
      let { setStyle: r, getStyle: i } = n,
        { actionTypeId: o } = t;
      if (o === zt) {
        let { config: a } = t;
        a.widthUnit === ht && r(e, tt, ""), a.heightUnit === ht && r(e, nt, "");
      }
      i(e, Wt) && tp({ effect: ep, actionTypeId: o, elementApi: n })(e);
    }
    function iC(e, t, n) {
      let { setStyle: r } = n;
      ep(e, t, n), r(e, t, ""), t === gt && r(e, dr, "");
    }
    function np(e) {
      let t = 0,
        n = 0;
      return (
        e.forEach((r, i) => {
          let { config: o } = r,
            a = o.delay + o.duration;
          a >= t && ((t = a), (n = i));
        }),
        n
      );
    }
    function oC(e, t) {
      let { actionItemGroups: n, useFirstGroupAsInitialState: r } = e,
        { actionItem: i, verboseTimeElapsed: o = 0 } = t,
        a = 0,
        u = 0;
      return (
        n.forEach((s, f) => {
          if (r && f === 0) return;
          let { actionItems: m } = s,
            v = m[np(m)],
            { config: g, actionTypeId: E } = v;
          i.id === v.id && (u = a + o);
          let T = Jd(E) === bo ? 0 : g.duration;
          a += g.delay + T;
        }),
        a > 0 ? In(u / a) : 0
      );
    }
    function aC({ actionList: e, actionItemId: t, rawData: n }) {
      let { actionItemGroups: r, continuousParameterGroups: i } = e,
        o = [],
        a = (u) => (
          o.push((0, br.mergeIn)(u, ["config"], { delay: 0, duration: 0 })),
          u.id === t
        );
      return (
        r && r.some(({ actionItems: u }) => u.some(a)),
        i &&
          i.some((u) => {
            let { continuousActionGroups: s } = u;
            return s.some(({ actionItems: f }) => f.some(a));
          }),
        (0, br.setIn)(n, ["actionLists"], {
          [e.id]: { id: e.id, actionItemGroups: [{ actionItems: o }] },
        })
      );
    }
    function sC(e, { basedOn: t }) {
      return (
        (e === Be.SCROLLING_IN_VIEW && (t === Je.ELEMENT || t == null)) ||
        (e === Be.MOUSE_MOVE && t === Je.ELEMENT)
      );
    }
    function uC(e, t) {
      return e + IR + t;
    }
    function cC(e, t) {
      return t == null ? !0 : e.indexOf(t) !== -1;
    }
    function lC(e, t) {
      return Io(e && e.sort(), t && t.sort());
    }
    function fC(e) {
      if (typeof e == "string") return e;
      if (e.pluginElement && e.objectId) return e.pluginElement + To + e.objectId;
      if (e.objectId) return e.objectId;
      let { id: t = "", selector: n = "", useEventTarget: r = "" } = e;
      return t + To + n + To + r;
    }
    var st,
      Tr,
      yr,
      br,
      zd,
      sR,
      uR,
      cR,
      lR,
      fR,
      dR,
      pR,
      gR,
      hR,
      vR,
      _r,
      Tn,
      bn,
      tt,
      nt,
      Kd,
      ER,
      mR,
      Xd,
      yR,
      Ud,
      _R,
      Ir,
      Wt,
      ht,
      wn,
      IR,
      To,
      jd,
      bo,
      wo,
      Yd,
      Vt,
      Ht,
      Bt,
      An,
      Qd,
      On,
      Sn,
      zt,
      Kt,
      jt,
      Yt,
      wr,
      TR,
      $d,
      Ao,
      Zd,
      mr,
      wR,
      OR,
      RR,
      Vd,
      LR,
      NR,
      MR,
      FR,
      qR,
      So,
      UR,
      WR,
      VR,
      HR,
      YR,
      QR,
      $R,
      tp,
      ip = Ee(() => {
        "use strict";
        (st = fe(yd())), (Tr = fe(Nd())), (yr = fe(qd())), (br = fe(Lt()));
        Me();
        Gd();
        eo();
        zd = fe(uo());
        mo();
        pr();
        ({
          BACKGROUND: sR,
          TRANSFORM: uR,
          TRANSLATE_3D: cR,
          SCALE_3D: lR,
          ROTATE_X: fR,
          ROTATE_Y: dR,
          ROTATE_Z: pR,
          SKEW: gR,
          PRESERVE_3D: hR,
          FLEX: vR,
          OPACITY: _r,
          FILTER: Tn,
          FONT_VARIATION_SETTINGS: bn,
          WIDTH: tt,
          HEIGHT: nt,
          BACKGROUND_COLOR: Kd,
          BORDER_COLOR: ER,
          COLOR: mR,
          CHILDREN: Xd,
          IMMEDIATE_CHILDREN: yR,
          SIBLINGS: Ud,
          PARENT: _R,
          DISPLAY: Ir,
          WILL_CHANGE: Wt,
          AUTO: ht,
          COMMA_DELIMITER: wn,
          COLON_DELIMITER: IR,
          BAR_DELIMITER: To,
          RENDER_TRANSFORM: jd,
          RENDER_GENERAL: bo,
          RENDER_STYLE: wo,
          RENDER_PLUGIN: Yd,
        } = Ae),
          ({
            TRANSFORM_MOVE: Vt,
            TRANSFORM_SCALE: Ht,
            TRANSFORM_ROTATE: Bt,
            TRANSFORM_SKEW: An,
            STYLE_OPACITY: Qd,
            STYLE_FILTER: On,
            STYLE_FONT_VARIATION: Sn,
            STYLE_SIZE: zt,
            STYLE_BACKGROUND_COLOR: Kt,
            STYLE_BORDER: jt,
            STYLE_TEXT_COLOR: Yt,
            GENERAL_DISPLAY: wr,
            OBJECT_VALUE: TR,
          } = xe),
          ($d = (e) => e.trim()),
          (Ao = Object.freeze({ [Kt]: Kd, [jt]: ER, [Yt]: mR })),
          (Zd = Object.freeze({
            [gt]: uR,
            [Kd]: sR,
            [_r]: _r,
            [Tn]: Tn,
            [tt]: tt,
            [nt]: nt,
            [bn]: bn,
          })),
          (mr = new Map());
        wR = 1;
        OR = 1;
        RR = (e, t) => e === t;
        (Vd = /px/),
          (LR = (e, t) =>
            t.reduce(
              (n, r) => (n[r.type] == null && (n[r.type] = UR[r.type]), n),
              e || {}
            )),
          (NR = (e, t) =>
            t.reduce(
              (n, r) => (
                n[r.type] == null &&
                  (n[r.type] = WR[r.type] || r.defaultValue || 0),
                n
              ),
              e || {}
            ));
        (MR = (e, t) => (t && (e[t.type] = t.value || 0), e)),
          (FR = (e, t) => (t && (e[t.type] = t.value || 0), e)),
          (qR = (e, t, n) => {
            if (It(e)) return po(e)(n, t);
            switch (e) {
              case On: {
                let r = (0, yr.default)(n.filters, ({ type: i }) => i === t);
                return r ? r.value : 0;
              }
              case Sn: {
                let r = (0, yr.default)(
                  n.fontVariations,
                  ({ type: i }) => i === t
                );
                return r ? r.value : 0;
              }
              default:
                return n[t];
            }
          });
        (So = {
          [Vt]: Object.freeze({ xValue: 0, yValue: 0, zValue: 0 }),
          [Ht]: Object.freeze({ xValue: 1, yValue: 1, zValue: 1 }),
          [Bt]: Object.freeze({ xValue: 0, yValue: 0, zValue: 0 }),
          [An]: Object.freeze({ xValue: 0, yValue: 0 }),
        }),
          (UR = Object.freeze({
            blur: 0,
            "hue-rotate": 0,
            invert: 0,
            grayscale: 0,
            saturate: 100,
            sepia: 0,
            contrast: 100,
            brightness: 100,
          })),
          (WR = Object.freeze({ wght: 0, opsz: 0, wdth: 0, slnt: 0 })),
          (VR = (e, t) => {
            let n = (0, yr.default)(t.filters, ({ type: r }) => r === e);
            if (n && n.unit) return n.unit;
            switch (e) {
              case "blur":
                return "px";
              case "hue-rotate":
                return "deg";
              default:
                return "%";
            }
          }),
          (HR = Object.keys(So));
        (YR = "\\(([^)]+)\\)"), (QR = /^rgb/), ($R = RegExp(`rgba?${YR}`));
        tp =
          ({ effect: e, actionTypeId: t, elementApi: n }) =>
          (r) => {
            switch (t) {
              case Vt:
              case Ht:
              case Bt:
              case An:
                e(r, gt, n);
                break;
              case On:
                e(r, Tn, n);
                break;
              case Sn:
                e(r, bn, n);
                break;
              case Qd:
                e(r, _r, n);
                break;
              case zt:
                e(r, tt, n), e(r, nt, n);
                break;
              case Kt:
              case jt:
              case Yt:
                e(r, Ao[t], n);
                break;
              case wr:
                e(r, Ir, n);
                break;
            }
          };
      });
    var wt = d((xo) => {
      "use strict";
      Object.defineProperty(xo, "__esModule", { value: !0 });
      function dC(e, t) {
        for (var n in t)
          Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
      }
      dC(xo, {
        IX2BrowserSupport: function () {
          return pC;
        },
        IX2EasingUtils: function () {
          return hC;
        },
        IX2Easings: function () {
          return gC;
        },
        IX2ElementsReducer: function () {
          return vC;
        },
        IX2VanillaPlugins: function () {
          return EC;
        },
        IX2VanillaUtils: function () {
          return mC;
        },
      });
      var pC = Qt((pr(), Qe($f))),
        gC = Qt((Ji(), Qe(_n))),
        hC = Qt((eo(), Qe(id))),
        vC = Qt((ud(), Qe(sd))),
        EC = Qt((mo(), Qe(Ed))),
        mC = Qt((ip(), Qe(rp)));
      function op(e) {
        if (typeof WeakMap != "function") return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (op = function (r) {
          return r ? n : t;
        })(e);
      }
      function Qt(e, t) {
        if (!t && e && e.__esModule) return e;
        if (e === null || (typeof e != "object" && typeof e != "function"))
          return { default: e };
        var n = op(t);
        if (n && n.has(e)) return n.get(e);
        var r = { __proto__: null },
          i = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var o in e)
          if (o !== "default" && Object.prototype.hasOwnProperty.call(e, o)) {
            var a = i ? Object.getOwnPropertyDescriptor(e, o) : null;
            a && (a.get || a.set)
              ? Object.defineProperty(r, o, a)
              : (r[o] = e[o]);
          }
        return (r.default = e), n && n.set(e, r), r;
      }
    });
    var Or,
      ut,
      yC,
      _C,
      IC,
      TC,
      bC,
      wC,
      Ar,
      ap,
      AC,
      OC,
      Ro,
      SC,
      xC,
      RC,
      CC,
      sp,
      up = Ee(() => {
        "use strict";
        Me();
        (Or = fe(wt())),
          (ut = fe(Lt())),
          ({
            IX2_RAW_DATA_IMPORTED: yC,
            IX2_SESSION_STOPPED: _C,
            IX2_INSTANCE_ADDED: IC,
            IX2_INSTANCE_STARTED: TC,
            IX2_INSTANCE_REMOVED: bC,
            IX2_ANIMATION_FRAME_CHANGED: wC,
          } = Te),
          ({
            optimizeFloat: Ar,
            applyEasing: ap,
            createBezierEasing: AC,
          } = Or.IX2EasingUtils),
          ({ RENDER_GENERAL: OC } = Ae),
          ({
            getItemConfigByKey: Ro,
            getRenderType: SC,
            getStyleProp: xC,
          } = Or.IX2VanillaUtils),
          (RC = (e, t) => {
            let {
                position: n,
                parameterId: r,
                actionGroups: i,
                destinationKeys: o,
                smoothing: a,
                restingValue: u,
                actionTypeId: s,
                customEasingFn: f,
                skipMotion: m,
                skipToValue: v,
              } = e,
              { parameters: g } = t.payload,
              E = Math.max(1 - a, 0.01),
              T = g[r];
            T == null && ((E = 1), (T = u));
            let w = Math.max(T, 0) || 0,
              R = Ar(w - n),
              b = m ? v : Ar(n + R * E),
              L = b * 100;
            if (b === n && e.current) return e;
            let C, M, F, N;
            for (let B = 0, { length: Q } = i; B < Q; B++) {
              let { keyframe: Z, actionItems: te } = i[B];
              if ((B === 0 && (C = te[0]), L >= Z)) {
                C = te[0];
                let G = i[B + 1],
                  S = G && L !== Z;
                (M = S ? G.actionItems[0] : null),
                  S && ((F = Z / 100), (N = (G.keyframe - Z) / 100));
              }
            }
            let V = {};
            if (C && !M)
              for (let B = 0, { length: Q } = o; B < Q; B++) {
                let Z = o[B];
                V[Z] = Ro(s, Z, C.config);
              }
            else if (C && M && F !== void 0 && N !== void 0) {
              let B = (b - F) / N,
                Q = C.config.easing,
                Z = ap(Q, B, f);
              for (let te = 0, { length: G } = o; te < G; te++) {
                let S = o[te],
                  q = Ro(s, S, C.config),
                  ne = (Ro(s, S, M.config) - q) * Z + q;
                V[S] = ne;
              }
            }
            return (0, ut.merge)(e, { position: b, current: V });
          }),
          (CC = (e, t) => {
            let {
                active: n,
                origin: r,
                start: i,
                immediate: o,
                renderType: a,
                verbose: u,
                actionItem: s,
                destination: f,
                destinationKeys: m,
                pluginDuration: v,
                instanceDelay: g,
                customEasingFn: E,
                skipMotion: T,
              } = e,
              w = s.config.easing,
              { duration: R, delay: b } = s.config;
            v != null && (R = v),
              (b = g ?? b),
              a === OC ? (R = 0) : (o || T) && (R = b = 0);
            let { now: L } = t.payload;
            if (n && r) {
              let C = L - (i + b);
              if (u) {
                let B = L - i,
                  Q = R + b,
                  Z = Ar(Math.min(Math.max(0, B / Q), 1));
                e = (0, ut.set)(e, "verboseTimeElapsed", Q * Z);
              }
              if (C < 0) return e;
              let M = Ar(Math.min(Math.max(0, C / R), 1)),
                F = ap(w, M, E),
                N = {},
                V = null;
              return (
                m.length &&
                  (V = m.reduce((B, Q) => {
                    let Z = f[Q],
                      te = parseFloat(r[Q]) || 0,
                      S = (parseFloat(Z) - te) * F + te;
                    return (B[Q] = S), B;
                  }, {})),
                (N.current = V),
                (N.position = M),
                M === 1 && ((N.active = !1), (N.complete = !0)),
                (0, ut.merge)(e, N)
              );
            }
            return e;
          }),
          (sp = (e = Object.freeze({}), t) => {
            switch (t.type) {
              case yC:
                return t.payload.ixInstances || Object.freeze({});
              case _C:
                return Object.freeze({});
              case IC: {
                let {
                    instanceId: n,
                    elementId: r,
                    actionItem: i,
                    eventId: o,
                    eventTarget: a,
                    eventStateKey: u,
                    actionListId: s,
                    groupIndex: f,
                    isCarrier: m,
                    origin: v,
                    destination: g,
                    immediate: E,
                    verbose: T,
                    continuous: w,
                    parameterId: R,
                    actionGroups: b,
                    smoothing: L,
                    restingValue: C,
                    pluginInstance: M,
                    pluginDuration: F,
                    instanceDelay: N,
                    skipMotion: V,
                    skipToValue: B,
                  } = t.payload,
                  { actionTypeId: Q } = i,
                  Z = SC(Q),
                  te = xC(Z, Q),
                  G = Object.keys(g).filter(
                    (q) => g[q] != null && typeof g[q] != "string"
                  ),
                  { easing: S } = i.config;
                return (0, ut.set)(e, n, {
                  id: n,
                  elementId: r,
                  active: !1,
                  position: 0,
                  start: 0,
                  origin: v,
                  destination: g,
                  destinationKeys: G,
                  immediate: E,
                  verbose: T,
                  current: null,
                  actionItem: i,
                  actionTypeId: Q,
                  eventId: o,
                  eventTarget: a,
                  eventStateKey: u,
                  actionListId: s,
                  groupIndex: f,
                  renderType: Z,
                  isCarrier: m,
                  styleProp: te,
                  continuous: w,
                  parameterId: R,
                  actionGroups: b,
                  smoothing: L,
                  restingValue: C,
                  pluginInstance: M,
                  pluginDuration: F,
                  instanceDelay: N,
                  skipMotion: V,
                  skipToValue: B,
                  customEasingFn:
                    Array.isArray(S) && S.length === 4 ? AC(S) : void 0,
                });
              }
              case TC: {
                let { instanceId: n, time: r } = t.payload;
                return (0, ut.mergeIn)(e, [n], {
                  active: !0,
                  complete: !1,
                  start: r,
                });
              }
              case bC: {
                let { instanceId: n } = t.payload;
                if (!e[n]) return e;
                let r = {},
                  i = Object.keys(e),
                  { length: o } = i;
                for (let a = 0; a < o; a++) {
                  let u = i[a];
                  u !== n && (r[u] = e[u]);
                }
                return r;
              }
              case wC: {
                let n = e,
                  r = Object.keys(e),
                  { length: i } = r;
                for (let o = 0; o < i; o++) {
                  let a = r[o],
                    u = e[a],
                    s = u.continuous ? RC : CC;
                  n = (0, ut.set)(n, a, s(u, t));
                }
                return n;
              }
              default:
                return e;
            }
          });
      });
    var PC,
      LC,
      NC,
      cp,
      lp = Ee(() => {
        "use strict";
        Me();
        ({
          IX2_RAW_DATA_IMPORTED: PC,
          IX2_SESSION_STOPPED: LC,
          IX2_PARAMETER_CHANGED: NC,
        } = Te),
          (cp = (e = {}, t) => {
            switch (t.type) {
              case PC:
                return t.payload.ixParameters || {};
              case LC:
                return {};
              case NC: {
                let { key: n, value: r } = t.payload;
                return (e[n] = r), e;
              }
              default:
                return e;
            }
          });
      });
    var pp = {};
    Ne(pp, { default: () => MC });
    var fp,
      dp,
      DC,
      MC,
      gp = Ee(() => {
        "use strict";
        fp = fe(mi());
        Is();
        Ws();
        Bs();
        dp = fe(wt());
        up();
        lp();
        ({ ixElements: DC } = dp.IX2ElementsReducer),
          (MC = (0, fp.combineReducers)({
            ixData: _s,
            ixRequest: Us,
            ixSession: Hs,
            ixElements: DC,
            ixInstances: sp,
            ixParameters: cp,
          }));
      });
    var vp = d((mk, hp) => {
      var FC = ft(),
        qC = be(),
        kC = ot(),
        GC = "[object String]";
      function XC(e) {
        return typeof e == "string" || (!qC(e) && kC(e) && FC(e) == GC);
      }
      hp.exports = XC;
    });
    var mp = d((yk, Ep) => {
      var UC = zi(),
        WC = UC("length");
      Ep.exports = WC;
    });
    var _p = d((_k, yp) => {
      var VC = "\\ud800-\\udfff",
        HC = "\\u0300-\\u036f",
        BC = "\\ufe20-\\ufe2f",
        zC = "\\u20d0-\\u20ff",
        KC = HC + BC + zC,
        jC = "\\ufe0e\\ufe0f",
        YC = "\\u200d",
        QC = RegExp("[" + YC + VC + KC + jC + "]");
      function $C(e) {
        return QC.test(e);
      }
      yp.exports = $C;
    });
    var Rp = d((Ik, xp) => {
      var Tp = "\\ud800-\\udfff",
        ZC = "\\u0300-\\u036f",
        JC = "\\ufe20-\\ufe2f",
        eP = "\\u20d0-\\u20ff",
        tP = ZC + JC + eP,
        nP = "\\ufe0e\\ufe0f",
        rP = "[" + Tp + "]",
        Co = "[" + tP + "]",
        Po = "\\ud83c[\\udffb-\\udfff]",
        iP = "(?:" + Co + "|" + Po + ")",
        bp = "[^" + Tp + "]",
        wp = "(?:\\ud83c[\\udde6-\\uddff]){2}",
        Ap = "[\\ud800-\\udbff][\\udc00-\\udfff]",
        oP = "\\u200d",
        Op = iP + "?",
        Sp = "[" + nP + "]?",
        aP = "(?:" + oP + "(?:" + [bp, wp, Ap].join("|") + ")" + Sp + Op + ")*",
        sP = Sp + Op + aP,
        uP = "(?:" + [bp + Co + "?", Co, wp, Ap, rP].join("|") + ")",
        Ip = RegExp(Po + "(?=" + Po + ")|" + uP + sP, "g");
      function cP(e) {
        for (var t = (Ip.lastIndex = 0); Ip.test(e); ) ++t;
        return t;
      }
      xp.exports = cP;
    });
    var Pp = d((Tk, Cp) => {
      var lP = mp(),
        fP = _p(),
        dP = Rp();
      function pP(e) {
        return fP(e) ? dP(e) : lP(e);
      }
      Cp.exports = pP;
    });
    var Np = d((bk, Lp) => {
      var gP = rr(),
        hP = ir(),
        vP = yt(),
        EP = vp(),
        mP = Pp(),
        yP = "[object Map]",
        _P = "[object Set]";
      function IP(e) {
        if (e == null) return 0;
        if (vP(e)) return EP(e) ? mP(e) : e.length;
        var t = hP(e);
        return t == yP || t == _P ? e.size : gP(e).length;
      }
      Lp.exports = IP;
    });
    var Mp = d((wk, Dp) => {
      var TP = "Expected a function";
      function bP(e) {
        if (typeof e != "function") throw new TypeError(TP);
        return function () {
          var t = arguments;
          switch (t.length) {
            case 0:
              return !e.call(this);
            case 1:
              return !e.call(this, t[0]);
            case 2:
              return !e.call(this, t[0], t[1]);
            case 3:
              return !e.call(this, t[0], t[1], t[2]);
          }
          return !e.apply(this, t);
        };
      }
      Dp.exports = bP;
    });
    var Lo = d((Ak, Fp) => {
      var wP = dt(),
        AP = (function () {
          try {
            var e = wP(Object, "defineProperty");
            return e({}, "", {}), e;
          } catch {}
        })();
      Fp.exports = AP;
    });
    var No = d((Ok, kp) => {
      var qp = Lo();
      function OP(e, t, n) {
        t == "__proto__" && qp
          ? qp(e, t, { configurable: !0, enumerable: !0, value: n, writable: !0 })
          : (e[t] = n);
      }
      kp.exports = OP;
    });
    var Xp = d((Sk, Gp) => {
      var SP = No(),
        xP = Kn(),
        RP = Object.prototype,
        CP = RP.hasOwnProperty;
      function PP(e, t, n) {
        var r = e[t];
        (!(CP.call(e, t) && xP(r, n)) || (n === void 0 && !(t in e))) &&
          SP(e, t, n);
      }
      Gp.exports = PP;
    });
    var Vp = d((xk, Wp) => {
      var LP = Xp(),
        NP = En(),
        DP = Jn(),
        Up = et(),
        MP = Xt();
      function FP(e, t, n, r) {
        if (!Up(e)) return e;
        t = NP(t, e);
        for (var i = -1, o = t.length, a = o - 1, u = e; u != null && ++i < o; ) {
          var s = MP(t[i]),
            f = n;
          if (s === "__proto__" || s === "constructor" || s === "prototype")
            return e;
          if (i != a) {
            var m = u[s];
            (f = r ? r(m, s, u) : void 0),
              f === void 0 && (f = Up(m) ? m : DP(t[i + 1]) ? [] : {});
          }
          LP(u, s, f), (u = u[s]);
        }
        return e;
      }
      Wp.exports = FP;
    });
    var Bp = d((Rk, Hp) => {
      var qP = sr(),
        kP = Vp(),
        GP = En();
      function XP(e, t, n) {
        for (var r = -1, i = t.length, o = {}; ++r < i; ) {
          var a = t[r],
            u = qP(e, a);
          n(u, a) && kP(o, GP(a, e), u);
        }
        return o;
      }
      Hp.exports = XP;
    });
    var Kp = d((Ck, zp) => {
      var UP = $n(),
        WP = oi(),
        VP = Pi(),
        HP = Ci(),
        BP = Object.getOwnPropertySymbols,
        zP = BP
          ? function (e) {
              for (var t = []; e; ) UP(t, VP(e)), (e = WP(e));
              return t;
            }
          : HP;
      zp.exports = zP;
    });
    var Yp = d((Pk, jp) => {
      function KP(e) {
        var t = [];
        if (e != null) for (var n in Object(e)) t.push(n);
        return t;
      }
      jp.exports = KP;
    });
    var $p = d((Lk, Qp) => {
      var jP = et(),
        YP = nr(),
        QP = Yp(),
        $P = Object.prototype,
        ZP = $P.hasOwnProperty;
      function JP(e) {
        if (!jP(e)) return QP(e);
        var t = YP(e),
          n = [];
        for (var r in e)
          (r == "constructor" && (t || !ZP.call(e, r))) || n.push(r);
        return n;
      }
      Qp.exports = JP;
    });
    var Jp = d((Nk, Zp) => {
      var eL = Ni(),
        tL = $p(),
        nL = yt();
      function rL(e) {
        return nL(e) ? eL(e, !0) : tL(e);
      }
      Zp.exports = rL;
    });
    var tg = d((Dk, eg) => {
      var iL = Ri(),
        oL = Kp(),
        aL = Jp();
      function sL(e) {
        return iL(e, aL, oL);
      }
      eg.exports = sL;
    });
    var rg = d((Mk, ng) => {
      var uL = Bi(),
        cL = pt(),
        lL = Bp(),
        fL = tg();
      function dL(e, t) {
        if (e == null) return {};
        var n = uL(fL(e), function (r) {
          return [r];
        });
        return (
          (t = cL(t)),
          lL(e, n, function (r, i) {
            return t(r, i[0]);
          })
        );
      }
      ng.exports = dL;
    });
    var og = d((Fk, ig) => {
      var pL = pt(),
        gL = Mp(),
        hL = rg();
      function vL(e, t) {
        return hL(e, gL(pL(t)));
      }
      ig.exports = vL;
    });
    var sg = d((qk, ag) => {
      var EL = rr(),
        mL = ir(),
        yL = fn(),
        _L = be(),
        IL = yt(),
        TL = Zn(),
        bL = nr(),
        wL = tr(),
        AL = "[object Map]",
        OL = "[object Set]",
        SL = Object.prototype,
        xL = SL.hasOwnProperty;
      function RL(e) {
        if (e == null) return !0;
        if (
          IL(e) &&
          (_L(e) ||
            typeof e == "string" ||
            typeof e.splice == "function" ||
            TL(e) ||
            wL(e) ||
            yL(e))
        )
          return !e.length;
        var t = mL(e);
        if (t == AL || t == OL) return !e.size;
        if (bL(e)) return !EL(e).length;
        for (var n in e) if (xL.call(e, n)) return !1;
        return !0;
      }
      ag.exports = RL;
    });
    var cg = d((kk, ug) => {
      var CL = No(),
        PL = yo(),
        LL = pt();
      function NL(e, t) {
        var n = {};
        return (
          (t = LL(t, 3)),
          PL(e, function (r, i, o) {
            CL(n, i, t(r, i, o));
          }),
          n
        );
      }
      ug.exports = NL;
    });
    var fg = d((Gk, lg) => {
      function DL(e, t) {
        for (
          var n = -1, r = e == null ? 0 : e.length;
          ++n < r && t(e[n], n, e) !== !1;
  
        );
        return e;
      }
      lg.exports = DL;
    });
    var pg = d((Xk, dg) => {
      var ML = cr();
      function FL(e) {
        return typeof e == "function" ? e : ML;
      }
      dg.exports = FL;
    });
    var hg = d((Uk, gg) => {
      var qL = fg(),
        kL = _o(),
        GL = pg(),
        XL = be();
      function UL(e, t) {
        var n = XL(e) ? qL : kL;
        return n(e, GL(t));
      }
      gg.exports = UL;
    });
    var Eg = d((Wk, vg) => {
      var WL = He(),
        VL = function () {
          return WL.Date.now();
        };
      vg.exports = VL;
    });
    var _g = d((Vk, yg) => {
      var HL = et(),
        Do = Eg(),
        mg = lr(),
        BL = "Expected a function",
        zL = Math.max,
        KL = Math.min;
      function jL(e, t, n) {
        var r,
          i,
          o,
          a,
          u,
          s,
          f = 0,
          m = !1,
          v = !1,
          g = !0;
        if (typeof e != "function") throw new TypeError(BL);
        (t = mg(t) || 0),
          HL(n) &&
            ((m = !!n.leading),
            (v = "maxWait" in n),
            (o = v ? zL(mg(n.maxWait) || 0, t) : o),
            (g = "trailing" in n ? !!n.trailing : g));
        function E(N) {
          var V = r,
            B = i;
          return (r = i = void 0), (f = N), (a = e.apply(B, V)), a;
        }
        function T(N) {
          return (f = N), (u = setTimeout(b, t)), m ? E(N) : a;
        }
        function w(N) {
          var V = N - s,
            B = N - f,
            Q = t - V;
          return v ? KL(Q, o - B) : Q;
        }
        function R(N) {
          var V = N - s,
            B = N - f;
          return s === void 0 || V >= t || V < 0 || (v && B >= o);
        }
        function b() {
          var N = Do();
          if (R(N)) return L(N);
          u = setTimeout(b, w(N));
        }
        function L(N) {
          return (u = void 0), g && r ? E(N) : ((r = i = void 0), a);
        }
        function C() {
          u !== void 0 && clearTimeout(u), (f = 0), (r = s = i = u = void 0);
        }
        function M() {
          return u === void 0 ? a : L(Do());
        }
        function F() {
          var N = Do(),
            V = R(N);
          if (((r = arguments), (i = this), (s = N), V)) {
            if (u === void 0) return T(s);
            if (v) return clearTimeout(u), (u = setTimeout(b, t)), E(s);
          }
          return u === void 0 && (u = setTimeout(b, t)), a;
        }
        return (F.cancel = C), (F.flush = M), F;
      }
      yg.exports = jL;
    });
    var Tg = d((Hk, Ig) => {
      var YL = _g(),
        QL = et(),
        $L = "Expected a function";
      function ZL(e, t, n) {
        var r = !0,
          i = !0;
        if (typeof e != "function") throw new TypeError($L);
        return (
          QL(n) &&
            ((r = "leading" in n ? !!n.leading : r),
            (i = "trailing" in n ? !!n.trailing : i)),
          YL(e, t, { leading: r, maxWait: t, trailing: i })
        );
      }
      Ig.exports = ZL;
    });
    var wg = {};
    Ne(wg, {
      actionListPlaybackChanged: () => Zt,
      animationFrameChanged: () => xr,
      clearRequested: () => bN,
      elementStateChanged: () => Wo,
      eventListenerAdded: () => Sr,
      eventStateChanged: () => Go,
      instanceAdded: () => Xo,
      instanceRemoved: () => Uo,
      instanceStarted: () => Rr,
      mediaQueriesDefined: () => Ho,
      parameterChanged: () => $t,
      playbackRequested: () => IN,
      previewRequested: () => _N,
      rawDataImported: () => Mo,
      sessionInitialized: () => Fo,
      sessionStarted: () => qo,
      sessionStopped: () => ko,
      stopRequested: () => TN,
      testFrameRendered: () => wN,
      viewportWidthChanged: () => Vo,
    });
    var bg,
      JL,
      eN,
      tN,
      nN,
      rN,
      iN,
      oN,
      aN,
      sN,
      uN,
      cN,
      lN,
      fN,
      dN,
      pN,
      gN,
      hN,
      vN,
      EN,
      mN,
      yN,
      Mo,
      Fo,
      qo,
      ko,
      _N,
      IN,
      TN,
      bN,
      Sr,
      wN,
      Go,
      xr,
      $t,
      Xo,
      Rr,
      Uo,
      Wo,
      Zt,
      Vo,
      Ho,
      Cr = Ee(() => {
        "use strict";
        Me();
        (bg = fe(wt())),
          ({
            IX2_RAW_DATA_IMPORTED: JL,
            IX2_SESSION_INITIALIZED: eN,
            IX2_SESSION_STARTED: tN,
            IX2_SESSION_STOPPED: nN,
            IX2_PREVIEW_REQUESTED: rN,
            IX2_PLAYBACK_REQUESTED: iN,
            IX2_STOP_REQUESTED: oN,
            IX2_CLEAR_REQUESTED: aN,
            IX2_EVENT_LISTENER_ADDED: sN,
            IX2_TEST_FRAME_RENDERED: uN,
            IX2_EVENT_STATE_CHANGED: cN,
            IX2_ANIMATION_FRAME_CHANGED: lN,
            IX2_PARAMETER_CHANGED: fN,
            IX2_INSTANCE_ADDED: dN,
            IX2_INSTANCE_STARTED: pN,
            IX2_INSTANCE_REMOVED: gN,
            IX2_ELEMENT_STATE_CHANGED: hN,
            IX2_ACTION_LIST_PLAYBACK_CHANGED: vN,
            IX2_VIEWPORT_WIDTH_CHANGED: EN,
            IX2_MEDIA_QUERIES_DEFINED: mN,
          } = Te),
          ({ reifyState: yN } = bg.IX2VanillaUtils),
          (Mo = (e) => ({ type: JL, payload: { ...yN(e) } })),
          (Fo = ({ hasBoundaryNodes: e, reducedMotion: t }) => ({
            type: eN,
            payload: { hasBoundaryNodes: e, reducedMotion: t },
          })),
          (qo = () => ({ type: tN })),
          (ko = () => ({ type: nN })),
          (_N = ({ rawData: e, defer: t }) => ({
            type: rN,
            payload: { defer: t, rawData: e },
          })),
          (IN = ({
            actionTypeId: e = xe.GENERAL_START_ACTION,
            actionListId: t,
            actionItemId: n,
            eventId: r,
            allowEvents: i,
            immediate: o,
            testManual: a,
            verbose: u,
            rawData: s,
          }) => ({
            type: iN,
            payload: {
              actionTypeId: e,
              actionListId: t,
              actionItemId: n,
              testManual: a,
              eventId: r,
              allowEvents: i,
              immediate: o,
              verbose: u,
              rawData: s,
            },
          })),
          (TN = (e) => ({ type: oN, payload: { actionListId: e } })),
          (bN = () => ({ type: aN })),
          (Sr = (e, t) => ({
            type: sN,
            payload: { target: e, listenerParams: t },
          })),
          (wN = (e = 1) => ({ type: uN, payload: { step: e } })),
          (Go = (e, t) => ({ type: cN, payload: { stateKey: e, newState: t } })),
          (xr = (e, t) => ({ type: lN, payload: { now: e, parameters: t } })),
          ($t = (e, t) => ({ type: fN, payload: { key: e, value: t } })),
          (Xo = (e) => ({ type: dN, payload: { ...e } })),
          (Rr = (e, t) => ({ type: pN, payload: { instanceId: e, time: t } })),
          (Uo = (e) => ({ type: gN, payload: { instanceId: e } })),
          (Wo = (e, t, n, r) => ({
            type: hN,
            payload: { elementId: e, actionTypeId: t, current: n, actionItem: r },
          })),
          (Zt = ({ actionListId: e, isPlaying: t }) => ({
            type: vN,
            payload: { actionListId: e, isPlaying: t },
          })),
          (Vo = ({ width: e, mediaQueries: t }) => ({
            type: EN,
            payload: { width: e, mediaQueries: t },
          })),
          (Ho = () => ({ type: mN }));
      });
    var Ce = {};
    Ne(Ce, {
      elementContains: () => Ko,
      getChildElements: () => DN,
      getClosestElement: () => xn,
      getProperty: () => RN,
      getQuerySelector: () => zo,
      getRefType: () => jo,
      getSiblingElements: () => MN,
      getStyle: () => xN,
      getValidDocument: () => PN,
      isSiblingNode: () => NN,
      matchSelector: () => CN,
      queryDocument: () => LN,
      setStyle: () => SN,
    });
    function SN(e, t, n) {
      e.style[t] = n;
    }
    function xN(e, t) {
      return t.startsWith("--")
        ? window.getComputedStyle(document.documentElement).getPropertyValue(t)
        : e.style[t];
    }
    function RN(e, t) {
      return e[t];
    }
    function CN(e) {
      return (t) => t[Bo](e);
    }
    function zo({ id: e, selector: t }) {
      if (e) {
        let n = e;
        if (e.indexOf(Ag) !== -1) {
          let r = e.split(Ag),
            i = r[0];
          if (((n = r[1]), i !== document.documentElement.getAttribute(Sg)))
            return null;
        }
        return `[data-w-id="${n}"], [data-w-id^="${n}_instance"]`;
      }
      return t;
    }
    function PN(e) {
      return e == null || e === document.documentElement.getAttribute(Sg)
        ? document
        : null;
    }
    function LN(e, t) {
      return Array.prototype.slice.call(
        document.querySelectorAll(t ? e + " " + t : e)
      );
    }
    function Ko(e, t) {
      return e.contains(t);
    }
    function NN(e, t) {
      return e !== t && e.parentNode === t.parentNode;
    }
    function DN(e) {
      let t = [];
      for (let n = 0, { length: r } = e || []; n < r; n++) {
        let { children: i } = e[n],
          { length: o } = i;
        if (o) for (let a = 0; a < o; a++) t.push(i[a]);
      }
      return t;
    }
    function MN(e = []) {
      let t = [],
        n = [];
      for (let r = 0, { length: i } = e; r < i; r++) {
        let { parentNode: o } = e[r];
        if (!o || !o.children || !o.children.length || n.indexOf(o) !== -1)
          continue;
        n.push(o);
        let a = o.firstElementChild;
        for (; a != null; )
          e.indexOf(a) === -1 && t.push(a), (a = a.nextElementSibling);
      }
      return t;
    }
    function jo(e) {
      return e != null && typeof e == "object"
        ? e instanceof Element
          ? AN
          : ON
        : null;
    }
    var Og,
      Bo,
      Ag,
      AN,
      ON,
      Sg,
      xn,
      xg = Ee(() => {
        "use strict";
        Og = fe(wt());
        Me();
        ({ ELEMENT_MATCHES: Bo } = Og.IX2BrowserSupport),
          ({
            IX2_ID_DELIMITER: Ag,
            HTML_ELEMENT: AN,
            PLAIN_OBJECT: ON,
            WF_PAGE: Sg,
          } = Ae);
        xn = Element.prototype.closest
          ? (e, t) => (document.documentElement.contains(e) ? e.closest(t) : null)
          : (e, t) => {
              if (!document.documentElement.contains(e)) return null;
              let n = e;
              do {
                if (n[Bo] && n[Bo](t)) return n;
                n = n.parentNode;
              } while (n != null);
              return null;
            };
      });
    var Yo = d((Kk, Cg) => {
      var FN = et(),
        Rg = Object.create,
        qN = (function () {
          function e() {}
          return function (t) {
            if (!FN(t)) return {};
            if (Rg) return Rg(t);
            e.prototype = t;
            var n = new e();
            return (e.prototype = void 0), n;
          };
        })();
      Cg.exports = qN;
    });
    var Pr = d((jk, Pg) => {
      function kN() {}
      Pg.exports = kN;
    });
    var Nr = d((Yk, Lg) => {
      var GN = Yo(),
        XN = Pr();
      function Lr(e, t) {
        (this.__wrapped__ = e),
          (this.__actions__ = []),
          (this.__chain__ = !!t),
          (this.__index__ = 0),
          (this.__values__ = void 0);
      }
      Lr.prototype = GN(XN.prototype);
      Lr.prototype.constructor = Lr;
      Lg.exports = Lr;
    });
    var Fg = d((Qk, Mg) => {
      var Ng = Rt(),
        UN = fn(),
        WN = be(),
        Dg = Ng ? Ng.isConcatSpreadable : void 0;
      function VN(e) {
        return WN(e) || UN(e) || !!(Dg && e && e[Dg]);
      }
      Mg.exports = VN;
    });
    var Gg = d(($k, kg) => {
      var HN = $n(),
        BN = Fg();
      function qg(e, t, n, r, i) {
        var o = -1,
          a = e.length;
        for (n || (n = BN), i || (i = []); ++o < a; ) {
          var u = e[o];
          t > 0 && n(u)
            ? t > 1
              ? qg(u, t - 1, n, r, i)
              : HN(i, u)
            : r || (i[i.length] = u);
        }
        return i;
      }
      kg.exports = qg;
    });
    var Ug = d((Zk, Xg) => {
      var zN = Gg();
      function KN(e) {
        var t = e == null ? 0 : e.length;
        return t ? zN(e, 1) : [];
      }
      Xg.exports = KN;
    });
    var Vg = d((Jk, Wg) => {
      function jN(e, t, n) {
        switch (n.length) {
          case 0:
            return e.call(t);
          case 1:
            return e.call(t, n[0]);
          case 2:
            return e.call(t, n[0], n[1]);
          case 3:
            return e.call(t, n[0], n[1], n[2]);
        }
        return e.apply(t, n);
      }
      Wg.exports = jN;
    });
    var zg = d((eG, Bg) => {
      var YN = Vg(),
        Hg = Math.max;
      function QN(e, t, n) {
        return (
          (t = Hg(t === void 0 ? e.length - 1 : t, 0)),
          function () {
            for (
              var r = arguments, i = -1, o = Hg(r.length - t, 0), a = Array(o);
              ++i < o;
  
            )
              a[i] = r[t + i];
            i = -1;
            for (var u = Array(t + 1); ++i < t; ) u[i] = r[i];
            return (u[t] = n(a)), YN(e, this, u);
          }
        );
      }
      Bg.exports = QN;
    });
    var jg = d((tG, Kg) => {
      function $N(e) {
        return function () {
          return e;
        };
      }
      Kg.exports = $N;
    });
    var $g = d((nG, Qg) => {
      var ZN = jg(),
        Yg = Lo(),
        JN = cr(),
        eD = Yg
          ? function (e, t) {
              return Yg(e, "toString", {
                configurable: !0,
                enumerable: !1,
                value: ZN(t),
                writable: !0,
              });
            }
          : JN;
      Qg.exports = eD;
    });
    var Jg = d((rG, Zg) => {
      var tD = 800,
        nD = 16,
        rD = Date.now;
      function iD(e) {
        var t = 0,
          n = 0;
        return function () {
          var r = rD(),
            i = nD - (r - n);
          if (((n = r), i > 0)) {
            if (++t >= tD) return arguments[0];
          } else t = 0;
          return e.apply(void 0, arguments);
        };
      }
      Zg.exports = iD;
    });
    var th = d((iG, eh) => {
      var oD = $g(),
        aD = Jg(),
        sD = aD(oD);
      eh.exports = sD;
    });
    var rh = d((oG, nh) => {
      var uD = Ug(),
        cD = zg(),
        lD = th();
      function fD(e) {
        return lD(cD(e, void 0, uD), e + "");
      }
      nh.exports = fD;
    });
    var ah = d((aG, oh) => {
      var ih = Di(),
        dD = ih && new ih();
      oh.exports = dD;
    });
    var uh = d((sG, sh) => {
      function pD() {}
      sh.exports = pD;
    });
    var Qo = d((uG, lh) => {
      var ch = ah(),
        gD = uh(),
        hD = ch
          ? function (e) {
              return ch.get(e);
            }
          : gD;
      lh.exports = hD;
    });
    var dh = d((cG, fh) => {
      var vD = {};
      fh.exports = vD;
    });
    var $o = d((lG, gh) => {
      var ph = dh(),
        ED = Object.prototype,
        mD = ED.hasOwnProperty;
      function yD(e) {
        for (
          var t = e.name + "", n = ph[t], r = mD.call(ph, t) ? n.length : 0;
          r--;
  
        ) {
          var i = n[r],
            o = i.func;
          if (o == null || o == e) return i.name;
        }
        return t;
      }
      gh.exports = yD;
    });
    var Mr = d((fG, hh) => {
      var _D = Yo(),
        ID = Pr(),
        TD = 4294967295;
      function Dr(e) {
        (this.__wrapped__ = e),
          (this.__actions__ = []),
          (this.__dir__ = 1),
          (this.__filtered__ = !1),
          (this.__iteratees__ = []),
          (this.__takeCount__ = TD),
          (this.__views__ = []);
      }
      Dr.prototype = _D(ID.prototype);
      Dr.prototype.constructor = Dr;
      hh.exports = Dr;
    });
    var Eh = d((dG, vh) => {
      function bD(e, t) {
        var n = -1,
          r = e.length;
        for (t || (t = Array(r)); ++n < r; ) t[n] = e[n];
        return t;
      }
      vh.exports = bD;
    });
    var yh = d((pG, mh) => {
      var wD = Mr(),
        AD = Nr(),
        OD = Eh();
      function SD(e) {
        if (e instanceof wD) return e.clone();
        var t = new AD(e.__wrapped__, e.__chain__);
        return (
          (t.__actions__ = OD(e.__actions__)),
          (t.__index__ = e.__index__),
          (t.__values__ = e.__values__),
          t
        );
      }
      mh.exports = SD;
    });
    var Th = d((gG, Ih) => {
      var xD = Mr(),
        _h = Nr(),
        RD = Pr(),
        CD = be(),
        PD = ot(),
        LD = yh(),
        ND = Object.prototype,
        DD = ND.hasOwnProperty;
      function Fr(e) {
        if (PD(e) && !CD(e) && !(e instanceof xD)) {
          if (e instanceof _h) return e;
          if (DD.call(e, "__wrapped__")) return LD(e);
        }
        return new _h(e);
      }
      Fr.prototype = RD.prototype;
      Fr.prototype.constructor = Fr;
      Ih.exports = Fr;
    });
    var wh = d((hG, bh) => {
      var MD = Mr(),
        FD = Qo(),
        qD = $o(),
        kD = Th();
      function GD(e) {
        var t = qD(e),
          n = kD[t];
        if (typeof n != "function" || !(t in MD.prototype)) return !1;
        if (e === n) return !0;
        var r = FD(n);
        return !!r && e === r[0];
      }
      bh.exports = GD;
    });
    var xh = d((vG, Sh) => {
      var Ah = Nr(),
        XD = rh(),
        UD = Qo(),
        Zo = $o(),
        WD = be(),
        Oh = wh(),
        VD = "Expected a function",
        HD = 8,
        BD = 32,
        zD = 128,
        KD = 256;
      function jD(e) {
        return XD(function (t) {
          var n = t.length,
            r = n,
            i = Ah.prototype.thru;
          for (e && t.reverse(); r--; ) {
            var o = t[r];
            if (typeof o != "function") throw new TypeError(VD);
            if (i && !a && Zo(o) == "wrapper") var a = new Ah([], !0);
          }
          for (r = a ? r : n; ++r < n; ) {
            o = t[r];
            var u = Zo(o),
              s = u == "wrapper" ? UD(o) : void 0;
            s &&
            Oh(s[0]) &&
            s[1] == (zD | HD | BD | KD) &&
            !s[4].length &&
            s[9] == 1
              ? (a = a[Zo(s[0])].apply(a, s[3]))
              : (a = o.length == 1 && Oh(o) ? a[u]() : a.thru(o));
          }
          return function () {
            var f = arguments,
              m = f[0];
            if (a && f.length == 1 && WD(m)) return a.plant(m).value();
            for (var v = 0, g = n ? t[v].apply(this, f) : m; ++v < n; )
              g = t[v].call(this, g);
            return g;
          };
        });
      }
      Sh.exports = jD;
    });
    var Ch = d((EG, Rh) => {
      var YD = xh(),
        QD = YD();
      Rh.exports = QD;
    });
    var Lh = d((mG, Ph) => {
      function $D(e, t, n) {
        return (
          e === e &&
            (n !== void 0 && (e = e <= n ? e : n),
            t !== void 0 && (e = e >= t ? e : t)),
          e
        );
      }
      Ph.exports = $D;
    });
    var Dh = d((yG, Nh) => {
      var ZD = Lh(),
        Jo = lr();
      function JD(e, t, n) {
        return (
          n === void 0 && ((n = t), (t = void 0)),
          n !== void 0 && ((n = Jo(n)), (n = n === n ? n : 0)),
          t !== void 0 && ((t = Jo(t)), (t = t === t ? t : 0)),
          ZD(Jo(e), t, n)
        );
      }
      Nh.exports = JD;
    });
    var Vh,
      Hh,
      Bh,
      zh,
      eM,
      tM,
      nM,
      rM,
      iM,
      oM,
      aM,
      sM,
      uM,
      cM,
      lM,
      fM,
      dM,
      pM,
      gM,
      Kh,
      jh,
      hM,
      vM,
      EM,
      Yh,
      mM,
      yM,
      Qh,
      _M,
      ea,
      $h,
      Mh,
      Fh,
      Zh,
      Cn,
      IM,
      rt,
      Jh,
      TM,
      qe,
      Ke,
      Pn,
      ev,
      ta,
      qh,
      na,
      bM,
      Rn,
      wM,
      AM,
      OM,
      tv,
      kh,
      SM,
      Gh,
      xM,
      RM,
      CM,
      Xh,
      qr,
      kr,
      Uh,
      Wh,
      nv,
      rv = Ee(() => {
        "use strict";
        (Vh = fe(Ch())), (Hh = fe(ur())), (Bh = fe(Dh()));
        Me();
        ra();
        Cr();
        (zh = fe(wt())),
          ({
            MOUSE_CLICK: eM,
            MOUSE_SECOND_CLICK: tM,
            MOUSE_DOWN: nM,
            MOUSE_UP: rM,
            MOUSE_OVER: iM,
            MOUSE_OUT: oM,
            DROPDOWN_CLOSE: aM,
            DROPDOWN_OPEN: sM,
            SLIDER_ACTIVE: uM,
            SLIDER_INACTIVE: cM,
            TAB_ACTIVE: lM,
            TAB_INACTIVE: fM,
            NAVBAR_CLOSE: dM,
            NAVBAR_OPEN: pM,
            MOUSE_MOVE: gM,
            PAGE_SCROLL_DOWN: Kh,
            SCROLL_INTO_VIEW: jh,
            SCROLL_OUT_OF_VIEW: hM,
            PAGE_SCROLL_UP: vM,
            SCROLLING_IN_VIEW: EM,
            PAGE_FINISH: Yh,
            ECOMMERCE_CART_CLOSE: mM,
            ECOMMERCE_CART_OPEN: yM,
            PAGE_START: Qh,
            PAGE_SCROLL: _M,
          } = Be),
          (ea = "COMPONENT_ACTIVE"),
          ($h = "COMPONENT_INACTIVE"),
          ({ COLON_DELIMITER: Mh } = Ae),
          ({ getNamespacedParameterId: Fh } = zh.IX2VanillaUtils),
          (Zh = (e) => (t) => typeof t == "object" && e(t) ? !0 : t),
          (Cn = Zh(({ element: e, nativeEvent: t }) => e === t.target)),
          (IM = Zh(({ element: e, nativeEvent: t }) => e.contains(t.target))),
          (rt = (0, Vh.default)([Cn, IM])),
          (Jh = (e, t) => {
            if (t) {
              let { ixData: n } = e.getState(),
                { events: r } = n,
                i = r[t];
              if (i && !bM[i.eventTypeId]) return i;
            }
            return null;
          }),
          (TM = ({ store: e, event: t }) => {
            let { action: n } = t,
              { autoStopEventId: r } = n.config;
            return !!Jh(e, r);
          }),
          (qe = ({ store: e, event: t, element: n, eventStateKey: r }, i) => {
            let { action: o, id: a } = t,
              { actionListId: u, autoStopEventId: s } = o.config,
              f = Jh(e, s);
            return (
              f &&
                Jt({
                  store: e,
                  eventId: s,
                  eventTarget: n,
                  eventStateKey: s + Mh + r.split(Mh)[1],
                  actionListId: (0, Hh.default)(f, "action.config.actionListId"),
                }),
              Jt({
                store: e,
                eventId: a,
                eventTarget: n,
                eventStateKey: r,
                actionListId: u,
              }),
              Ln({
                store: e,
                eventId: a,
                eventTarget: n,
                eventStateKey: r,
                actionListId: u,
              }),
              i
            );
          }),
          (Ke = (e, t) => (n, r) => e(n, r) === !0 ? t(n, r) : r),
          (Pn = { handler: Ke(rt, qe) }),
          (ev = { ...Pn, types: [ea, $h].join(" ") }),
          (ta = [
            { target: window, types: "resize orientationchange", throttle: !0 },
            {
              target: document,
              types: "scroll wheel readystatechange IX2_PAGE_UPDATE",
              throttle: !0,
            },
          ]),
          (qh = "mouseover mouseout"),
          (na = { types: ta }),
          (bM = { PAGE_START: Qh, PAGE_FINISH: Yh }),
          (Rn = (() => {
            let e = window.pageXOffset !== void 0,
              n =
                document.compatMode === "CSS1Compat"
                  ? document.documentElement
                  : document.body;
            return () => ({
              scrollLeft: e ? window.pageXOffset : n.scrollLeft,
              scrollTop: e ? window.pageYOffset : n.scrollTop,
              stiffScrollTop: (0, Bh.default)(
                e ? window.pageYOffset : n.scrollTop,
                0,
                n.scrollHeight - window.innerHeight
              ),
              scrollWidth: n.scrollWidth,
              scrollHeight: n.scrollHeight,
              clientWidth: n.clientWidth,
              clientHeight: n.clientHeight,
              innerWidth: window.innerWidth,
              innerHeight: window.innerHeight,
            });
          })()),
          (wM = (e, t) =>
            !(
              e.left > t.right ||
              e.right < t.left ||
              e.top > t.bottom ||
              e.bottom < t.top
            )),
          (AM = ({ element: e, nativeEvent: t }) => {
            let { type: n, target: r, relatedTarget: i } = t,
              o = e.contains(r);
            if (n === "mouseover" && o) return !0;
            let a = e.contains(i);
            return !!(n === "mouseout" && o && a);
          }),
          (OM = (e) => {
            let {
                element: t,
                event: { config: n },
              } = e,
              { clientWidth: r, clientHeight: i } = Rn(),
              o = n.scrollOffsetValue,
              s = n.scrollOffsetUnit === "PX" ? o : (i * (o || 0)) / 100;
            return wM(t.getBoundingClientRect(), {
              left: 0,
              top: s,
              right: r,
              bottom: i - s,
            });
          }),
          (tv = (e) => (t, n) => {
            let { type: r } = t.nativeEvent,
              i = [ea, $h].indexOf(r) !== -1 ? r === ea : n.isActive,
              o = { ...n, isActive: i };
            return ((!n || o.isActive !== n.isActive) && e(t, o)) || o;
          }),
          (kh = (e) => (t, n) => {
            let r = { elementHovered: AM(t) };
            return (
              ((n ? r.elementHovered !== n.elementHovered : r.elementHovered) &&
                e(t, r)) ||
              r
            );
          }),
          (SM = (e) => (t, n) => {
            let r = { ...n, elementVisible: OM(t) };
            return (
              ((n ? r.elementVisible !== n.elementVisible : r.elementVisible) &&
                e(t, r)) ||
              r
            );
          }),
          (Gh =
            (e) =>
            (t, n = {}) => {
              let { stiffScrollTop: r, scrollHeight: i, innerHeight: o } = Rn(),
                {
                  event: { config: a, eventTypeId: u },
                } = t,
                { scrollOffsetValue: s, scrollOffsetUnit: f } = a,
                m = f === "PX",
                v = i - o,
                g = Number((r / v).toFixed(2));
              if (n && n.percentTop === g) return n;
              let E = (m ? s : (o * (s || 0)) / 100) / v,
                T,
                w,
                R = 0;
              n &&
                ((T = g > n.percentTop),
                (w = n.scrollingDown !== T),
                (R = w ? g : n.anchorTop));
              let b = u === Kh ? g >= R + E : g <= R - E,
                L = {
                  ...n,
                  percentTop: g,
                  inBounds: b,
                  anchorTop: R,
                  scrollingDown: T,
                };
              return (n && b && (w || L.inBounds !== n.inBounds) && e(t, L)) || L;
            }),
          (xM = (e, t) =>
            e.left > t.left &&
            e.left < t.right &&
            e.top > t.top &&
            e.top < t.bottom),
          (RM = (e) => (t, n) => {
            let r = { finished: document.readyState === "complete" };
            return r.finished && !(n && n.finshed) && e(t), r;
          }),
          (CM = (e) => (t, n) => {
            let r = { started: !0 };
            return n || e(t), r;
          }),
          (Xh =
            (e) =>
            (t, n = { clickCount: 0 }) => {
              let r = { clickCount: (n.clickCount % 2) + 1 };
              return (r.clickCount !== n.clickCount && e(t, r)) || r;
            }),
          (qr = (e = !0) => ({
            ...ev,
            handler: Ke(
              e ? rt : Cn,
              tv((t, n) => (n.isActive ? Pn.handler(t, n) : n))
            ),
          })),
          (kr = (e = !0) => ({
            ...ev,
            handler: Ke(
              e ? rt : Cn,
              tv((t, n) => (n.isActive ? n : Pn.handler(t, n)))
            ),
          })),
          (Uh = {
            ...na,
            handler: SM((e, t) => {
              let { elementVisible: n } = t,
                { event: r, store: i } = e,
                { ixData: o } = i.getState(),
                { events: a } = o;
              return !a[r.action.config.autoStopEventId] && t.triggered
                ? t
                : (r.eventTypeId === jh) === n
                ? (qe(e), { ...t, triggered: !0 })
                : t;
            }),
          }),
          (Wh = 0.05),
          (nv = {
            [uM]: qr(),
            [cM]: kr(),
            [sM]: qr(),
            [aM]: kr(),
            [pM]: qr(!1),
            [dM]: kr(!1),
            [lM]: qr(),
            [fM]: kr(),
            [yM]: { types: "ecommerce-cart-open", handler: Ke(rt, qe) },
            [mM]: { types: "ecommerce-cart-close", handler: Ke(rt, qe) },
            [eM]: {
              types: "click",
              handler: Ke(
                rt,
                Xh((e, { clickCount: t }) => {
                  TM(e) ? t === 1 && qe(e) : qe(e);
                })
              ),
            },
            [tM]: {
              types: "click",
              handler: Ke(
                rt,
                Xh((e, { clickCount: t }) => {
                  t === 2 && qe(e);
                })
              ),
            },
            [nM]: { ...Pn, types: "mousedown" },
            [rM]: { ...Pn, types: "mouseup" },
            [iM]: {
              types: qh,
              handler: Ke(
                rt,
                kh((e, t) => {
                  t.elementHovered && qe(e);
                })
              ),
            },
            [oM]: {
              types: qh,
              handler: Ke(
                rt,
                kh((e, t) => {
                  t.elementHovered || qe(e);
                })
              ),
            },
            [gM]: {
              types: "mousemove mouseout scroll",
              handler: (
                {
                  store: e,
                  element: t,
                  eventConfig: n,
                  nativeEvent: r,
                  eventStateKey: i,
                },
                o = { clientX: 0, clientY: 0, pageX: 0, pageY: 0 }
              ) => {
                let {
                    basedOn: a,
                    selectedAxis: u,
                    continuousParameterGroupId: s,
                    reverse: f,
                    restingState: m = 0,
                  } = n,
                  {
                    clientX: v = o.clientX,
                    clientY: g = o.clientY,
                    pageX: E = o.pageX,
                    pageY: T = o.pageY,
                  } = r,
                  w = u === "X_AXIS",
                  R = r.type === "mouseout",
                  b = m / 100,
                  L = s,
                  C = !1;
                switch (a) {
                  case Je.VIEWPORT: {
                    b = w
                      ? Math.min(v, window.innerWidth) / window.innerWidth
                      : Math.min(g, window.innerHeight) / window.innerHeight;
                    break;
                  }
                  case Je.PAGE: {
                    let {
                      scrollLeft: M,
                      scrollTop: F,
                      scrollWidth: N,
                      scrollHeight: V,
                    } = Rn();
                    b = w ? Math.min(M + E, N) / N : Math.min(F + T, V) / V;
                    break;
                  }
                  case Je.ELEMENT:
                  default: {
                    L = Fh(i, s);
                    let M = r.type.indexOf("mouse") === 0;
                    if (M && rt({ element: t, nativeEvent: r }) !== !0) break;
                    let F = t.getBoundingClientRect(),
                      { left: N, top: V, width: B, height: Q } = F;
                    if (!M && !xM({ left: v, top: g }, F)) break;
                    (C = !0), (b = w ? (v - N) / B : (g - V) / Q);
                    break;
                  }
                }
                return (
                  R && (b > 1 - Wh || b < Wh) && (b = Math.round(b)),
                  (a !== Je.ELEMENT || C || C !== o.elementHovered) &&
                    ((b = f ? 1 - b : b), e.dispatch($t(L, b))),
                  {
                    elementHovered: C,
                    clientX: v,
                    clientY: g,
                    pageX: E,
                    pageY: T,
                  }
                );
              },
            },
            [_M]: {
              types: ta,
              handler: ({ store: e, eventConfig: t }) => {
                let { continuousParameterGroupId: n, reverse: r } = t,
                  { scrollTop: i, scrollHeight: o, clientHeight: a } = Rn(),
                  u = i / (o - a);
                (u = r ? 1 - u : u), e.dispatch($t(n, u));
              },
            },
            [EM]: {
              types: ta,
              handler: (
                { element: e, store: t, eventConfig: n, eventStateKey: r },
                i = { scrollPercent: 0 }
              ) => {
                let {
                    scrollLeft: o,
                    scrollTop: a,
                    scrollWidth: u,
                    scrollHeight: s,
                    clientHeight: f,
                  } = Rn(),
                  {
                    basedOn: m,
                    selectedAxis: v,
                    continuousParameterGroupId: g,
                    startsEntering: E,
                    startsExiting: T,
                    addEndOffset: w,
                    addStartOffset: R,
                    addOffsetValue: b = 0,
                    endOffsetValue: L = 0,
                  } = n,
                  C = v === "X_AXIS";
                if (m === Je.VIEWPORT) {
                  let M = C ? o / u : a / s;
                  return (
                    M !== i.scrollPercent && t.dispatch($t(g, M)),
                    { scrollPercent: M }
                  );
                } else {
                  let M = Fh(r, g),
                    F = e.getBoundingClientRect(),
                    N = (R ? b : 0) / 100,
                    V = (w ? L : 0) / 100;
                  (N = E ? N : 1 - N), (V = T ? V : 1 - V);
                  let B = F.top + Math.min(F.height * N, f),
                    Z = F.top + F.height * V - B,
                    te = Math.min(f + Z, s),
                    S = Math.min(Math.max(0, f - B), te) / te;
                  return (
                    S !== i.scrollPercent && t.dispatch($t(M, S)),
                    { scrollPercent: S }
                  );
                }
              },
            },
            [jh]: Uh,
            [hM]: Uh,
            [Kh]: {
              ...na,
              handler: Gh((e, t) => {
                t.scrollingDown && qe(e);
              }),
            },
            [vM]: {
              ...na,
              handler: Gh((e, t) => {
                t.scrollingDown || qe(e);
              }),
            },
            [Yh]: {
              types: "readystatechange IX2_PAGE_UPDATE",
              handler: Ke(Cn, RM(qe)),
            },
            [Qh]: {
              types: "readystatechange IX2_PAGE_UPDATE",
              handler: Ke(Cn, CM(qe)),
            },
          });
      });
    var _v = {};
    Ne(_v, {
      observeRequests: () => QM,
      startActionGroup: () => Ln,
      startEngine: () => Hr,
      stopActionGroup: () => Jt,
      stopAllActionGroups: () => Ev,
      stopEngine: () => Br,
    });
    function QM(e) {
      At({ store: e, select: ({ ixRequest: t }) => t.preview, onChange: JM }),
        At({ store: e, select: ({ ixRequest: t }) => t.playback, onChange: eF }),
        At({ store: e, select: ({ ixRequest: t }) => t.stop, onChange: tF }),
        At({ store: e, select: ({ ixRequest: t }) => t.clear, onChange: nF });
    }
    function $M(e) {
      At({
        store: e,
        select: ({ ixSession: t }) => t.mediaQueryKey,
        onChange: () => {
          Br(e),
            pv({ store: e, elementApi: Ce }),
            Hr({ store: e, allowEvents: !0 }),
            gv();
        },
      });
    }
    function ZM(e, t) {
      let n = At({
        store: e,
        select: ({ ixSession: r }) => r.tick,
        onChange: (r) => {
          t(r), n();
        },
      });
    }
    function JM({ rawData: e, defer: t }, n) {
      let r = () => {
        Hr({ store: n, rawData: e, allowEvents: !0 }), gv();
      };
      t ? setTimeout(r, 0) : r();
    }
    function gv() {
      document.dispatchEvent(new CustomEvent("IX2_PAGE_UPDATE"));
    }
    function eF(e, t) {
      let {
          actionTypeId: n,
          actionListId: r,
          actionItemId: i,
          eventId: o,
          allowEvents: a,
          immediate: u,
          testManual: s,
          verbose: f = !0,
        } = e,
        { rawData: m } = e;
      if (r && i && m && u) {
        let v = m.actionLists[r];
        v && (m = GM({ actionList: v, actionItemId: i, rawData: m }));
      }
      if (
        (Hr({ store: t, rawData: m, allowEvents: a, testManual: s }),
        (r && n === xe.GENERAL_START_ACTION) || ia(n))
      ) {
        Jt({ store: t, actionListId: r }),
          vv({ store: t, actionListId: r, eventId: o });
        let v = Ln({
          store: t,
          eventId: o,
          actionListId: r,
          immediate: u,
          verbose: f,
        });
        f && v && t.dispatch(Zt({ actionListId: r, isPlaying: !u }));
      }
    }
    function tF({ actionListId: e }, t) {
      e ? Jt({ store: t, actionListId: e }) : Ev({ store: t }), Br(t);
    }
    function nF(e, t) {
      Br(t), pv({ store: t, elementApi: Ce });
    }
    function Hr({ store: e, rawData: t, allowEvents: n, testManual: r }) {
      let { ixSession: i } = e.getState();
      t && e.dispatch(Mo(t)),
        i.active ||
          (e.dispatch(
            Fo({
              hasBoundaryNodes: !!document.querySelector(Xr),
              reducedMotion:
                document.body.hasAttribute("data-wf-ix-vacation") &&
                window.matchMedia("(prefers-reduced-motion)").matches,
            })
          ),
          n &&
            (uF(e), rF(), e.getState().ixSession.hasDefinedMediaQueries && $M(e)),
          e.dispatch(qo()),
          iF(e, r));
    }
    function rF() {
      let { documentElement: e } = document;
      e.className.indexOf(iv) === -1 && (e.className += ` ${iv}`);
    }
    function iF(e, t) {
      let n = (r) => {
        let { ixSession: i, ixParameters: o } = e.getState();
        i.active &&
          (e.dispatch(xr(r, o)), t ? ZM(e, n) : requestAnimationFrame(n));
      };
      n(window.performance.now());
    }
    function Br(e) {
      let { ixSession: t } = e.getState();
      if (t.active) {
        let { eventListeners: n } = t;
        n.forEach(oF), VM(), e.dispatch(ko());
      }
    }
    function oF({ target: e, listenerParams: t }) {
      e.removeEventListener.apply(e, t);
    }
    function aF({
      store: e,
      eventStateKey: t,
      eventTarget: n,
      eventId: r,
      eventConfig: i,
      actionListId: o,
      parameterGroup: a,
      smoothing: u,
      restingValue: s,
    }) {
      let { ixData: f, ixSession: m } = e.getState(),
        { events: v } = f,
        g = v[r],
        { eventTypeId: E } = g,
        T = {},
        w = {},
        R = [],
        { continuousActionGroups: b } = a,
        { id: L } = a;
      XM(E, i) && (L = UM(t, L));
      let C = m.hasBoundaryNodes && n ? xn(n, Xr) : null;
      b.forEach((M) => {
        let { keyframe: F, actionItems: N } = M;
        N.forEach((V) => {
          let { actionTypeId: B } = V,
            { target: Q } = V.config;
          if (!Q) return;
          let Z = Q.boundaryMode ? C : null,
            te = HM(Q) + oa + B;
          if (((w[te] = sF(w[te], F, V)), !T[te])) {
            T[te] = !0;
            let { config: G } = V;
            Ur({
              config: G,
              event: g,
              eventTarget: n,
              elementRoot: Z,
              elementApi: Ce,
            }).forEach((S) => {
              R.push({ element: S, key: te });
            });
          }
        });
      }),
        R.forEach(({ element: M, key: F }) => {
          let N = w[F],
            V = (0, ct.default)(N, "[0].actionItems[0]", {}),
            { actionTypeId: B } = V,
            Z = (
              B === xe.PLUGIN_RIVE
                ? (V.config?.target?.selectorGuids || []).length === 0
                : Vr(B)
            )
              ? sa(B)(M, V)
              : null,
            te = aa({ element: M, actionItem: V, elementApi: Ce }, Z);
          ua({
            store: e,
            element: M,
            eventId: r,
            actionListId: o,
            actionItem: V,
            destination: te,
            continuous: !0,
            parameterId: L,
            actionGroups: N,
            smoothing: u,
            restingValue: s,
            pluginInstance: Z,
          });
        });
    }
    function sF(e = [], t, n) {
      let r = [...e],
        i;
      return (
        r.some((o, a) => (o.keyframe === t ? ((i = a), !0) : !1)),
        i == null && ((i = r.length), r.push({ keyframe: t, actionItems: [] })),
        r[i].actionItems.push(n),
        r
      );
    }
    function uF(e) {
      let { ixData: t } = e.getState(),
        { eventTypeMap: n } = t;
      hv(e),
        (0, en.default)(n, (i, o) => {
          let a = nv[o];
          if (!a) {
            console.warn(`IX2 event type not configured: ${o}`);
            return;
          }
          gF({ logic: a, store: e, events: i });
        });
      let { ixSession: r } = e.getState();
      r.eventListeners.length && lF(e);
    }
    function lF(e) {
      let t = () => {
        hv(e);
      };
      cF.forEach((n) => {
        window.addEventListener(n, t), e.dispatch(Sr(window, [n, t]));
      }),
        t();
    }
    function hv(e) {
      let { ixSession: t, ixData: n } = e.getState(),
        r = window.innerWidth;
      if (r !== t.viewportWidth) {
        let { mediaQueries: i } = n;
        e.dispatch(Vo({ width: r, mediaQueries: i }));
      }
    }
    function gF({ logic: e, store: t, events: n }) {
      hF(n);
      let { types: r, handler: i } = e,
        { ixData: o } = t.getState(),
        { actionLists: a } = o,
        u = fF(n, pF);
      if (!(0, sv.default)(u)) return;
      (0, en.default)(u, (v, g) => {
        let E = n[g],
          { action: T, id: w, mediaQueries: R = o.mediaQueryKeys } = E,
          { actionListId: b } = T.config;
        BM(R, o.mediaQueryKeys) || t.dispatch(Ho()),
          T.actionTypeId === xe.GENERAL_CONTINUOUS_ACTION &&
            (Array.isArray(E.config) ? E.config : [E.config]).forEach((C) => {
              let { continuousParameterGroupId: M } = C,
                F = (0, ct.default)(a, `${b}.continuousParameterGroups`, []),
                N = (0, av.default)(F, ({ id: Q }) => Q === M),
                V = (C.smoothing || 0) / 100,
                B = (C.restingState || 0) / 100;
              N &&
                v.forEach((Q, Z) => {
                  let te = w + oa + Z;
                  aF({
                    store: t,
                    eventStateKey: te,
                    eventTarget: Q,
                    eventId: w,
                    eventConfig: C,
                    actionListId: b,
                    parameterGroup: N,
                    smoothing: V,
                    restingValue: B,
                  });
                });
            }),
          (T.actionTypeId === xe.GENERAL_START_ACTION || ia(T.actionTypeId)) &&
            vv({ store: t, actionListId: b, eventId: w });
      });
      let s = (v) => {
          let { ixSession: g } = t.getState();
          dF(u, (E, T, w) => {
            let R = n[T],
              b = g.eventState[w],
              { action: L, mediaQueries: C = o.mediaQueryKeys } = R;
            if (!Wr(C, g.mediaQueryKey)) return;
            let M = (F = {}) => {
              let N = i(
                {
                  store: t,
                  element: E,
                  event: R,
                  eventConfig: F,
                  nativeEvent: v,
                  eventStateKey: w,
                },
                b
              );
              zM(N, b) || t.dispatch(Go(w, N));
            };
            L.actionTypeId === xe.GENERAL_CONTINUOUS_ACTION
              ? (Array.isArray(R.config) ? R.config : [R.config]).forEach(M)
              : M();
          });
        },
        f = (0, fv.default)(s, YM),
        m = ({ target: v = document, types: g, throttle: E }) => {
          g.split(" ")
            .filter(Boolean)
            .forEach((T) => {
              let w = E ? f : s;
              v.addEventListener(T, w), t.dispatch(Sr(v, [T, w]));
            });
        };
      Array.isArray(r) ? r.forEach(m) : typeof r == "string" && m(e);
    }
    function hF(e) {
      if (!jM) return;
      let t = {},
        n = "";
      for (let r in e) {
        let { eventTypeId: i, target: o } = e[r],
          a = zo(o);
        t[a] ||
          ((i === Be.MOUSE_CLICK || i === Be.MOUSE_SECOND_CLICK) &&
            ((t[a] = !0),
            (n += a + "{cursor: pointer;touch-action: manipulation;}")));
      }
      if (n) {
        let r = document.createElement("style");
        (r.textContent = n), document.body.appendChild(r);
      }
    }
    function vv({ store: e, actionListId: t, eventId: n }) {
      let { ixData: r, ixSession: i } = e.getState(),
        { actionLists: o, events: a } = r,
        u = a[n],
        s = o[t];
      if (s && s.useFirstGroupAsInitialState) {
        let f = (0, ct.default)(s, "actionItemGroups[0].actionItems", []),
          m = (0, ct.default)(u, "mediaQueries", r.mediaQueryKeys);
        if (!Wr(m, i.mediaQueryKey)) return;
        f.forEach((v) => {
          let { config: g, actionTypeId: E } = v,
            T =
              g?.target?.useEventTarget === !0 && g?.target?.objectId == null
                ? { target: u.target, targets: u.targets }
                : g,
            w = Ur({ config: T, event: u, elementApi: Ce }),
            R = Vr(E);
          w.forEach((b) => {
            let L = R ? sa(E)(b, v) : null;
            ua({
              destination: aa({ element: b, actionItem: v, elementApi: Ce }, L),
              immediate: !0,
              store: e,
              element: b,
              eventId: n,
              actionItem: v,
              actionListId: t,
              pluginInstance: L,
            });
          });
        });
      }
    }
    function Ev({ store: e }) {
      let { ixInstances: t } = e.getState();
      (0, en.default)(t, (n) => {
        if (!n.continuous) {
          let { actionListId: r, verbose: i } = n;
          ca(n, e), i && e.dispatch(Zt({ actionListId: r, isPlaying: !1 }));
        }
      });
    }
    function Jt({
      store: e,
      eventId: t,
      eventTarget: n,
      eventStateKey: r,
      actionListId: i,
    }) {
      let { ixInstances: o, ixSession: a } = e.getState(),
        u = a.hasBoundaryNodes && n ? xn(n, Xr) : null;
      (0, en.default)(o, (s) => {
        let f = (0, ct.default)(s, "actionItem.config.target.boundaryMode"),
          m = r ? s.eventStateKey === r : !0;
        if (s.actionListId === i && s.eventId === t && m) {
          if (u && f && !Ko(u, s.element)) return;
          ca(s, e),
            s.verbose && e.dispatch(Zt({ actionListId: i, isPlaying: !1 }));
        }
      });
    }
    function Ln({
      store: e,
      eventId: t,
      eventTarget: n,
      eventStateKey: r,
      actionListId: i,
      groupIndex: o = 0,
      immediate: a,
      verbose: u,
    }) {
      let { ixData: s, ixSession: f } = e.getState(),
        { events: m } = s,
        v = m[t] || {},
        { mediaQueries: g = s.mediaQueryKeys } = v,
        E = (0, ct.default)(s, `actionLists.${i}`, {}),
        { actionItemGroups: T, useFirstGroupAsInitialState: w } = E;
      if (!T || !T.length) return !1;
      o >= T.length && (0, ct.default)(v, "config.loop") && (o = 0),
        o === 0 && w && o++;
      let b =
          (o === 0 || (o === 1 && w)) && ia(v.action?.actionTypeId)
            ? v.config.delay
            : void 0,
        L = (0, ct.default)(T, [o, "actionItems"], []);
      if (!L.length || !Wr(g, f.mediaQueryKey)) return !1;
      let C = f.hasBoundaryNodes && n ? xn(n, Xr) : null,
        M = FM(L),
        F = !1;
      return (
        L.forEach((N, V) => {
          let { config: B, actionTypeId: Q } = N,
            Z = Vr(Q),
            { target: te } = B;
          if (!te) return;
          let G = te.boundaryMode ? C : null;
          Ur({
            config: B,
            event: v,
            eventTarget: n,
            elementRoot: G,
            elementApi: Ce,
          }).forEach((q, z) => {
            let H = Z ? sa(Q)(q, N) : null,
              ne = Z ? KM(Q)(q, N) : null;
            F = !0;
            let ie = M === V && z === 0,
              X = qM({ element: q, actionItem: N }),
              Y = aa({ element: q, actionItem: N, elementApi: Ce }, H);
            ua({
              store: e,
              element: q,
              actionItem: N,
              eventId: t,
              eventTarget: n,
              eventStateKey: r,
              actionListId: i,
              groupIndex: o,
              isCarrier: ie,
              computedStyle: X,
              destination: Y,
              immediate: a,
              verbose: u,
              pluginInstance: H,
              pluginDuration: ne,
              instanceDelay: b,
            });
          });
        }),
        F
      );
    }
    function ua(e) {
      let { store: t, computedStyle: n, ...r } = e,
        {
          element: i,
          actionItem: o,
          immediate: a,
          pluginInstance: u,
          continuous: s,
          restingValue: f,
          eventId: m,
        } = r,
        v = !s,
        g = DM(),
        { ixElements: E, ixSession: T, ixData: w } = t.getState(),
        R = NM(E, i),
        { refState: b } = E[R] || {},
        L = jo(i),
        C = T.reducedMotion && Ii[o.actionTypeId],
        M;
      if (C && s)
        switch (w.events[m]?.eventTypeId) {
          case Be.MOUSE_MOVE:
          case Be.MOUSE_MOVE_IN_VIEWPORT:
            M = f;
            break;
          default:
            M = 0.5;
            break;
        }
      let F = kM(i, b, n, o, Ce, u);
      if (
        (t.dispatch(
          Xo({
            instanceId: g,
            elementId: R,
            origin: F,
            refType: L,
            skipMotion: C,
            skipToValue: M,
            ...r,
          })
        ),
        mv(document.body, "ix2-animation-started", g),
        a)
      ) {
        vF(t, g);
        return;
      }
      At({ store: t, select: ({ ixInstances: N }) => N[g], onChange: yv }),
        v && t.dispatch(Rr(g, T.tick));
    }
    function ca(e, t) {
      mv(document.body, "ix2-animation-stopping", {
        instanceId: e.id,
        state: t.getState(),
      });
      let { elementId: n, actionItem: r } = e,
        { ixElements: i } = t.getState(),
        { ref: o, refType: a } = i[n] || {};
      a === dv && WM(o, r, Ce), t.dispatch(Uo(e.id));
    }
    function mv(e, t, n) {
      let r = document.createEvent("CustomEvent");
      r.initCustomEvent(t, !0, !0, n), e.dispatchEvent(r);
    }
    function vF(e, t) {
      let { ixParameters: n } = e.getState();
      e.dispatch(Rr(t, 0)), e.dispatch(xr(performance.now(), n));
      let { ixInstances: r } = e.getState();
      yv(r[t], e);
    }
    function yv(e, t) {
      let {
          active: n,
          continuous: r,
          complete: i,
          elementId: o,
          actionItem: a,
          actionTypeId: u,
          renderType: s,
          current: f,
          groupIndex: m,
          eventId: v,
          eventTarget: g,
          eventStateKey: E,
          actionListId: T,
          isCarrier: w,
          styleProp: R,
          verbose: b,
          pluginInstance: L,
        } = e,
        { ixData: C, ixSession: M } = t.getState(),
        { events: F } = C,
        N = F && F[v] ? F[v] : {},
        { mediaQueries: V = C.mediaQueryKeys } = N;
      if (Wr(V, M.mediaQueryKey) && (r || n || i)) {
        if (f || (s === LM && i)) {
          t.dispatch(Wo(o, u, f, a));
          let { ixElements: B } = t.getState(),
            { ref: Q, refType: Z, refState: te } = B[o] || {},
            G = te && te[u];
          (Z === dv || Vr(u)) && MM(Q, te, G, v, a, R, Ce, s, L);
        }
        if (i) {
          if (w) {
            let B = Ln({
              store: t,
              eventId: v,
              eventTarget: g,
              eventStateKey: E,
              actionListId: T,
              groupIndex: m + 1,
              verbose: b,
            });
            b && !B && t.dispatch(Zt({ actionListId: T, isPlaying: !1 }));
          }
          ca(e, t);
        }
      }
    }
    var av,
      ct,
      sv,
      uv,
      cv,
      lv,
      en,
      fv,
      Gr,
      PM,
      ia,
      oa,
      Xr,
      dv,
      LM,
      iv,
      Ur,
      NM,
      aa,
      At,
      DM,
      MM,
      pv,
      FM,
      qM,
      kM,
      GM,
      XM,
      UM,
      Wr,
      WM,
      VM,
      HM,
      BM,
      zM,
      Vr,
      sa,
      KM,
      ov,
      jM,
      YM,
      cF,
      fF,
      dF,
      pF,
      ra = Ee(() => {
        "use strict";
        (av = fe(Qi())),
          (ct = fe(ur())),
          (sv = fe(Np())),
          (uv = fe(og())),
          (cv = fe(sg())),
          (lv = fe(cg())),
          (en = fe(hg())),
          (fv = fe(Tg()));
        Me();
        Gr = fe(wt());
        Cr();
        xg();
        rv();
        (PM = Object.keys(Xn)),
          (ia = (e) => PM.includes(e)),
          ({
            COLON_DELIMITER: oa,
            BOUNDARY_SELECTOR: Xr,
            HTML_ELEMENT: dv,
            RENDER_GENERAL: LM,
            W_MOD_IX: iv,
          } = Ae),
          ({
            getAffectedElements: Ur,
            getElementId: NM,
            getDestinationValues: aa,
            observeStore: At,
            getInstanceId: DM,
            renderHTMLElement: MM,
            clearAllStyles: pv,
            getMaxDurationItemIndex: FM,
            getComputedStyle: qM,
            getInstanceOrigin: kM,
            reduceListToGroup: GM,
            shouldNamespaceEventParameter: XM,
            getNamespacedParameterId: UM,
            shouldAllowMediaQuery: Wr,
            cleanupHTMLElement: WM,
            clearObjectCache: VM,
            stringifyTarget: HM,
            mediaQueriesEqual: BM,
            shallowEqual: zM,
          } = Gr.IX2VanillaUtils),
          ({
            isPluginType: Vr,
            createPluginInstance: sa,
            getPluginDuration: KM,
          } = Gr.IX2VanillaPlugins),
          (ov = navigator.userAgent),
          (jM = ov.match(/iPad/i) || ov.match(/iPhone/)),
          (YM = 12);
        cF = ["resize", "orientationchange"];
        (fF = (e, t) => (0, uv.default)((0, lv.default)(e, t), cv.default)),
          (dF = (e, t) => {
            (0, en.default)(e, (n, r) => {
              n.forEach((i, o) => {
                let a = r + oa + o;
                t(i, r, a);
              });
            });
          }),
          (pF = (e) => {
            let t = { target: e.target, targets: e.targets };
            return Ur({ config: t, elementApi: Ce });
          });
      });
    var bv = d((fa) => {
      "use strict";
      Object.defineProperty(fa, "__esModule", { value: !0 });
      function EF(e, t) {
        for (var n in t)
          Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
      }
      EF(fa, {
        actions: function () {
          return _F;
        },
        destroy: function () {
          return Tv;
        },
        init: function () {
          return wF;
        },
        setEnv: function () {
          return bF;
        },
        store: function () {
          return zr;
        },
      });
      var mF = mi(),
        yF = IF((gp(), Qe(pp))),
        la = (ra(), Qe(_v)),
        _F = TF((Cr(), Qe(wg)));
      function IF(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function Iv(e) {
        if (typeof WeakMap != "function") return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (Iv = function (r) {
          return r ? n : t;
        })(e);
      }
      function TF(e, t) {
        if (!t && e && e.__esModule) return e;
        if (e === null || (typeof e != "object" && typeof e != "function"))
          return { default: e };
        var n = Iv(t);
        if (n && n.has(e)) return n.get(e);
        var r = { __proto__: null },
          i = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var o in e)
          if (o !== "default" && Object.prototype.hasOwnProperty.call(e, o)) {
            var a = i ? Object.getOwnPropertyDescriptor(e, o) : null;
            a && (a.get || a.set)
              ? Object.defineProperty(r, o, a)
              : (r[o] = e[o]);
          }
        return (r.default = e), n && n.set(e, r), r;
      }
      var zr = (0, mF.createStore)(yF.default);
      function bF(e) {
        e() && (0, la.observeRequests)(zr);
      }
      function wF(e) {
        Tv(), (0, la.startEngine)({ store: zr, rawData: e, allowEvents: !0 });
      }
      function Tv() {
        (0, la.stopEngine)(zr);
      }
    });
    var Sv = d((RG, Ov) => {
      "use strict";
      var wv = De(),
        Av = bv();
      Av.setEnv(wv.env);
      wv.define(
        "ix2",
        (Ov.exports = function () {
          return Av;
        })
      );
    });
    var Rv = d((CG, xv) => {
      "use strict";
      var tn = De();
      tn.define(
        "links",
        (xv.exports = function (e, t) {
          var n = {},
            r = e(window),
            i,
            o = tn.env(),
            a = window.location,
            u = document.createElement("a"),
            s = "w--current",
            f = /index\.(html|php)$/,
            m = /\/$/,
            v,
            g;
          n.ready = n.design = n.preview = E;
          function E() {
            (i = o && tn.env("design")),
              (g = tn.env("slug") || a.pathname || ""),
              tn.scroll.off(w),
              (v = []);
            for (var b = document.links, L = 0; L < b.length; ++L) T(b[L]);
            v.length && (tn.scroll.on(w), w());
          }
          function T(b) {
            if (!b.getAttribute("hreflang")) {
              var L =
                (i && b.getAttribute("href-disabled")) || b.getAttribute("href");
              if (((u.href = L), !(L.indexOf(":") >= 0))) {
                var C = e(b);
                if (
                  u.hash.length > 1 &&
                  u.host + u.pathname === a.host + a.pathname
                ) {
                  if (!/^#[a-zA-Z0-9\-\_]+$/.test(u.hash)) return;
                  var M = e(u.hash);
                  M.length && v.push({ link: C, sec: M, active: !1 });
                  return;
                }
                if (!(L === "#" || L === "")) {
                  var F =
                    u.href === a.href || L === g || (f.test(L) && m.test(g));
                  R(C, s, F);
                }
              }
            }
          }
          function w() {
            var b = r.scrollTop(),
              L = r.height();
            t.each(v, function (C) {
              if (!C.link.attr("hreflang")) {
                var M = C.link,
                  F = C.sec,
                  N = F.offset().top,
                  V = F.outerHeight(),
                  B = L * 0.5,
                  Q = F.is(":visible") && N + V - B >= b && N + B <= b + L;
                C.active !== Q && ((C.active = Q), R(M, s, Q));
              }
            });
          }
          function R(b, L, C) {
            var M = b.hasClass(L);
            (C && M) || (!C && !M) || (C ? b.addClass(L) : b.removeClass(L));
          }
          return n;
        })
      );
    });
    var Pv = d((PG, Cv) => {
      "use strict";
      var Kr = De();
      Kr.define(
        "scroll",
        (Cv.exports = function (e) {
          var t = {
              WF_CLICK_EMPTY: "click.wf-empty-link",
              WF_CLICK_SCROLL: "click.wf-scroll",
            },
            n = window.location,
            r = T() ? null : window.history,
            i = e(window),
            o = e(document),
            a = e(document.body),
            u =
              window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              function (G) {
                window.setTimeout(G, 15);
              },
            s = Kr.env("editor") ? ".w-editor-body" : "body",
            f =
              "header, " +
              s +
              " > .header, " +
              s +
              " > .w-nav:not([data-no-scroll])",
            m = 'a[href="#"]',
            v = 'a[href*="#"]:not(.w-tab-link):not(' + m + ")",
            g = '.wf-force-outline-none[tabindex="-1"]:focus{outline:none;}',
            E = document.createElement("style");
          E.appendChild(document.createTextNode(g));
          function T() {
            try {
              return !!window.frameElement;
            } catch {
              return !0;
            }
          }
          var w = /^#[a-zA-Z0-9][\w:.-]*$/;
          function R(G) {
            return w.test(G.hash) && G.host + G.pathname === n.host + n.pathname;
          }
          let b =
            typeof window.matchMedia == "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)");
          function L() {
            return (
              document.body.getAttribute("data-wf-scroll-motion") === "none" ||
              b.matches
            );
          }
          function C(G, S) {
            var q;
            switch (S) {
              case "add":
                (q = G.attr("tabindex")),
                  q
                    ? G.attr("data-wf-tabindex-swap", q)
                    : G.attr("tabindex", "-1");
                break;
              case "remove":
                (q = G.attr("data-wf-tabindex-swap")),
                  q
                    ? (G.attr("tabindex", q),
                      G.removeAttr("data-wf-tabindex-swap"))
                    : G.removeAttr("tabindex");
                break;
            }
            G.toggleClass("wf-force-outline-none", S === "add");
          }
          function M(G) {
            var S = G.currentTarget;
            if (
              !(
                Kr.env("design") ||
                (window.$.mobile && /(?:^|\s)ui-link(?:$|\s)/.test(S.className))
              )
            ) {
              var q = R(S) ? S.hash : "";
              if (q !== "") {
                var z = e(q);
                z.length &&
                  (G && (G.preventDefault(), G.stopPropagation()),
                  F(q, G),
                  window.setTimeout(
                    function () {
                      N(z, function () {
                        C(z, "add"),
                          z.get(0).focus({ preventScroll: !0 }),
                          C(z, "remove");
                      });
                    },
                    G ? 0 : 300
                  ));
              }
            }
          }
          function F(G) {
            if (
              n.hash !== G &&
              r &&
              r.pushState &&
              !(Kr.env.chrome && n.protocol === "file:")
            ) {
              var S = r.state && r.state.hash;
              S !== G && r.pushState({ hash: G }, "", G);
            }
          }
          function N(G, S) {
            var q = i.scrollTop(),
              z = V(G);
            if (q !== z) {
              var H = B(G, q, z),
                ne = Date.now(),
                ie = function () {
                  var X = Date.now() - ne;
                  window.scroll(0, Q(q, z, X, H)),
                    X <= H ? u(ie) : typeof S == "function" && S();
                };
              u(ie);
            }
          }
          function V(G) {
            var S = e(f),
              q = S.css("position") === "fixed" ? S.outerHeight() : 0,
              z = G.offset().top - q;
            if (G.data("scroll") === "mid") {
              var H = i.height() - q,
                ne = G.outerHeight();
              ne < H && (z -= Math.round((H - ne) / 2));
            }
            return z;
          }
          function B(G, S, q) {
            if (L()) return 0;
            var z = 1;
            return (
              a.add(G).each(function (H, ne) {
                var ie = parseFloat(ne.getAttribute("data-scroll-time"));
                !isNaN(ie) && ie >= 0 && (z = ie);
              }),
              (472.143 * Math.log(Math.abs(S - q) + 125) - 2e3) * z
            );
          }
          function Q(G, S, q, z) {
            return q > z ? S : G + (S - G) * Z(q / z);
          }
          function Z(G) {
            return G < 0.5
              ? 4 * G * G * G
              : (G - 1) * (2 * G - 2) * (2 * G - 2) + 1;
          }
          function te() {
            var { WF_CLICK_EMPTY: G, WF_CLICK_SCROLL: S } = t;
            o.on(S, v, M),
              o.on(G, m, function (q) {
                q.preventDefault();
              }),
              document.head.insertBefore(E, document.head.firstChild);
          }
          return { ready: te };
        })
      );
    });
    var Nv = d((LG, Lv) => {
      "use strict";
      var AF = De();
      AF.define(
        "touch",
        (Lv.exports = function (e) {
          var t = {},
            n = window.getSelection;
          (e.event.special.tap = { bindType: "click", delegateType: "click" }),
            (t.init = function (o) {
              return (
                (o = typeof o == "string" ? e(o).get(0) : o), o ? new r(o) : null
              );
            });
          function r(o) {
            var a = !1,
              u = !1,
              s = Math.min(Math.round(window.innerWidth * 0.04), 40),
              f,
              m;
            o.addEventListener("touchstart", v, !1),
              o.addEventListener("touchmove", g, !1),
              o.addEventListener("touchend", E, !1),
              o.addEventListener("touchcancel", T, !1),
              o.addEventListener("mousedown", v, !1),
              o.addEventListener("mousemove", g, !1),
              o.addEventListener("mouseup", E, !1),
              o.addEventListener("mouseout", T, !1);
            function v(R) {
              var b = R.touches;
              (b && b.length > 1) ||
                ((a = !0),
                b ? ((u = !0), (f = b[0].clientX)) : (f = R.clientX),
                (m = f));
            }
            function g(R) {
              if (a) {
                if (u && R.type === "mousemove") {
                  R.preventDefault(), R.stopPropagation();
                  return;
                }
                var b = R.touches,
                  L = b ? b[0].clientX : R.clientX,
                  C = L - m;
                (m = L),
                  Math.abs(C) > s &&
                    n &&
                    String(n()) === "" &&
                    (i("swipe", R, { direction: C > 0 ? "right" : "left" }), T());
              }
            }
            function E(R) {
              if (a && ((a = !1), u && R.type === "mouseup")) {
                R.preventDefault(), R.stopPropagation(), (u = !1);
                return;
              }
            }
            function T() {
              a = !1;
            }
            function w() {
              o.removeEventListener("touchstart", v, !1),
                o.removeEventListener("touchmove", g, !1),
                o.removeEventListener("touchend", E, !1),
                o.removeEventListener("touchcancel", T, !1),
                o.removeEventListener("mousedown", v, !1),
                o.removeEventListener("mousemove", g, !1),
                o.removeEventListener("mouseup", E, !1),
                o.removeEventListener("mouseout", T, !1),
                (o = null);
            }
            this.destroy = w;
          }
          function i(o, a, u) {
            var s = e.Event(o, { originalEvent: a });
            e(a.target).trigger(s, u);
          }
          return (t.instance = t.init(document)), t;
        })
      );
    });
    var Fv = d((NG, Mv) => {
      "use strict";
      var Ot = De(),
        OF = rn(),
        je = {
          ARROW_LEFT: 37,
          ARROW_UP: 38,
          ARROW_RIGHT: 39,
          ARROW_DOWN: 40,
          ESCAPE: 27,
          SPACE: 32,
          ENTER: 13,
          HOME: 36,
          END: 35,
        },
        Dv = !0,
        SF = /^#[a-zA-Z0-9\-_]+$/;
      Ot.define(
        "dropdown",
        (Mv.exports = function (e, t) {
          var n = t.debounce,
            r = {},
            i = Ot.env(),
            o = !1,
            a,
            u = Ot.env.touch,
            s = ".w-dropdown",
            f = "w--open",
            m = OF.triggers,
            v = 900,
            g = "focusout" + s,
            E = "keydown" + s,
            T = "mouseenter" + s,
            w = "mousemove" + s,
            R = "mouseleave" + s,
            b = (u ? "click" : "mouseup") + s,
            L = "w-close" + s,
            C = "setting" + s,
            M = e(document),
            F;
          (r.ready = N),
            (r.design = function () {
              o && S(), (o = !1), N();
            }),
            (r.preview = function () {
              (o = !0), N();
            });
          function N() {
            (a = i && Ot.env("design")), (F = M.find(s)), F.each(V);
          }
          function V(c, k) {
            var W = e(k),
              x = e.data(k, s);
            x ||
              (x = e.data(k, s, {
                open: !1,
                el: W,
                config: {},
                selectedIdx: -1,
              })),
              (x.toggle = x.el.children(".w-dropdown-toggle")),
              (x.list = x.el.children(".w-dropdown-list")),
              (x.links = x.list.find("a:not(.w-dropdown .w-dropdown a)")),
              (x.complete = H(x)),
              (x.mouseLeave = ie(x)),
              (x.mouseUpOutside = z(x)),
              (x.mouseMoveOutside = X(x)),
              B(x);
            var J = x.toggle.attr("id"),
              se = x.list.attr("id");
            J || (J = "w-dropdown-toggle-" + c),
              se || (se = "w-dropdown-list-" + c),
              x.toggle.attr("id", J),
              x.toggle.attr("aria-controls", se),
              x.toggle.attr("aria-haspopup", "menu"),
              x.toggle.attr("aria-expanded", "false"),
              x.toggle
                .find(".w-icon-dropdown-toggle")
                .attr("aria-hidden", "true"),
              x.toggle.prop("tagName") !== "BUTTON" &&
                (x.toggle.attr("role", "button"),
                x.toggle.attr("tabindex") || x.toggle.attr("tabindex", "0")),
              x.list.attr("id", se),
              x.list.attr("aria-labelledby", J),
              x.links.each(function (h, U) {
                U.hasAttribute("tabindex") || U.setAttribute("tabindex", "0"),
                  SF.test(U.hash) && U.addEventListener("click", G.bind(null, x));
              }),
              x.el.off(s),
              x.toggle.off(s),
              x.nav && x.nav.off(s);
            var re = Z(x, Dv);
            a && x.el.on(C, Q(x)),
              a ||
                (i && ((x.hovering = !1), G(x)),
                x.config.hover && x.toggle.on(T, ne(x)),
                x.el.on(L, re),
                x.el.on(E, Y(x)),
                x.el.on(g, _(x)),
                x.toggle.on(b, re),
                x.toggle.on(E, y(x)),
                (x.nav = x.el.closest(".w-nav")),
                x.nav.on(L, re));
          }
          function B(c) {
            var k = Number(c.el.css("z-index"));
            (c.manageZ = k === v || k === v + 1),
              (c.config = {
                hover: c.el.attr("data-hover") === "true" && !u,
                delay: c.el.attr("data-delay"),
              });
          }
          function Q(c) {
            return function (k, W) {
              (W = W || {}),
                B(c),
                W.open === !0 && te(c, !0),
                W.open === !1 && G(c, { immediate: !0 });
            };
          }
          function Z(c, k) {
            return n(function (W) {
              if (c.open || (W && W.type === "w-close"))
                return G(c, { forceClose: k });
              te(c);
            });
          }
          function te(c) {
            if (!c.open) {
              q(c),
                (c.open = !0),
                c.list.addClass(f),
                c.toggle.addClass(f),
                c.toggle.attr("aria-expanded", "true"),
                m.intro(0, c.el[0]),
                Ot.redraw.up(),
                c.manageZ && c.el.css("z-index", v + 1);
              var k = Ot.env("editor");
              a || M.on(b, c.mouseUpOutside),
                c.hovering && !k && c.el.on(R, c.mouseLeave),
                c.hovering && k && M.on(w, c.mouseMoveOutside),
                window.clearTimeout(c.delayId);
            }
          }
          function G(c, { immediate: k, forceClose: W } = {}) {
            if (c.open && !(c.config.hover && c.hovering && !W)) {
              c.toggle.attr("aria-expanded", "false"), (c.open = !1);
              var x = c.config;
              if (
                (m.outro(0, c.el[0]),
                M.off(b, c.mouseUpOutside),
                M.off(w, c.mouseMoveOutside),
                c.el.off(R, c.mouseLeave),
                window.clearTimeout(c.delayId),
                !x.delay || k)
              )
                return c.complete();
              c.delayId = window.setTimeout(c.complete, x.delay);
            }
          }
          function S() {
            M.find(s).each(function (c, k) {
              e(k).triggerHandler(L);
            });
          }
          function q(c) {
            var k = c.el[0];
            F.each(function (W, x) {
              var J = e(x);
              J.is(k) || J.has(k).length || J.triggerHandler(L);
            });
          }
          function z(c) {
            return (
              c.mouseUpOutside && M.off(b, c.mouseUpOutside),
              n(function (k) {
                if (c.open) {
                  var W = e(k.target);
                  if (!W.closest(".w-dropdown-toggle").length) {
                    var x = e.inArray(c.el[0], W.parents(s)) === -1,
                      J = Ot.env("editor");
                    if (x) {
                      if (J) {
                        var se =
                            W.parents().length === 1 &&
                            W.parents("svg").length === 1,
                          re = W.parents(
                            ".w-editor-bem-EditorHoverControls"
                          ).length;
                        if (se || re) return;
                      }
                      G(c);
                    }
                  }
                }
              })
            );
          }
          function H(c) {
            return function () {
              c.list.removeClass(f),
                c.toggle.removeClass(f),
                c.manageZ && c.el.css("z-index", "");
            };
          }
          function ne(c) {
            return function () {
              (c.hovering = !0), te(c);
            };
          }
          function ie(c) {
            return function () {
              (c.hovering = !1), c.links.is(":focus") || G(c);
            };
          }
          function X(c) {
            return n(function (k) {
              if (c.open) {
                var W = e(k.target),
                  x = e.inArray(c.el[0], W.parents(s)) === -1;
                if (x) {
                  var J = W.parents(".w-editor-bem-EditorHoverControls").length,
                    se = W.parents(".w-editor-bem-RTToolbar").length,
                    re = e(".w-editor-bem-EditorOverlay"),
                    h =
                      re.find(".w-editor-edit-outline").length ||
                      re.find(".w-editor-bem-RTToolbar").length;
                  if (J || se || h) return;
                  (c.hovering = !1), G(c);
                }
              }
            });
          }
          function Y(c) {
            return function (k) {
              if (!(a || !c.open))
                switch (
                  ((c.selectedIdx = c.links.index(document.activeElement)),
                  k.keyCode)
                ) {
                  case je.HOME:
                    return c.open
                      ? ((c.selectedIdx = 0), p(c), k.preventDefault())
                      : void 0;
                  case je.END:
                    return c.open
                      ? ((c.selectedIdx = c.links.length - 1),
                        p(c),
                        k.preventDefault())
                      : void 0;
                  case je.ESCAPE:
                    return G(c), c.toggle.focus(), k.stopPropagation();
                  case je.ARROW_RIGHT:
                  case je.ARROW_DOWN:
                    return (
                      (c.selectedIdx = Math.min(
                        c.links.length - 1,
                        c.selectedIdx + 1
                      )),
                      p(c),
                      k.preventDefault()
                    );
                  case je.ARROW_LEFT:
                  case je.ARROW_UP:
                    return (
                      (c.selectedIdx = Math.max(-1, c.selectedIdx - 1)),
                      p(c),
                      k.preventDefault()
                    );
                }
            };
          }
          function p(c) {
            c.links[c.selectedIdx] && c.links[c.selectedIdx].focus();
          }
          function y(c) {
            var k = Z(c, Dv);
            return function (W) {
              if (!a) {
                if (!c.open)
                  switch (W.keyCode) {
                    case je.ARROW_UP:
                    case je.ARROW_DOWN:
                      return W.stopPropagation();
                  }
                switch (W.keyCode) {
                  case je.SPACE:
                  case je.ENTER:
                    return k(), W.stopPropagation(), W.preventDefault();
                }
              }
            };
          }
          function _(c) {
            return n(function (k) {
              var { relatedTarget: W, target: x } = k,
                J = c.el[0],
                se = J.contains(W) || J.contains(x);
              return se || G(c), k.stopPropagation();
            });
          }
          return r;
        })
      );
    });
    var qv = d((da) => {
      "use strict";
      Object.defineProperty(da, "__esModule", { value: !0 });
      Object.defineProperty(da, "default", {
        enumerable: !0,
        get: function () {
          return xF;
        },
      });
      function xF(e, t, n, r, i, o, a, u, s, f, m, v, g) {
        return function (E) {
          e(E);
          var T = E.form,
            w = {
              name: T.attr("data-name") || T.attr("name") || "Untitled Form",
              pageId: T.attr("data-wf-page-id") || "",
              elementId: T.attr("data-wf-element-id") || "",
              source: t.href,
              test: n.env(),
              fields: {},
              fileUploads: {},
              dolphin: /pass[\s-_]?(word|code)|secret|login|credentials/i.test(
                T.html()
              ),
              trackingCookies: r(),
            };
          let R = T.attr("data-wf-flow");
          R && (w.wfFlow = R), i(E);
          var b = o(T, w.fields);
          if (b) return a(b);
          if (((w.fileUploads = u(T)), s(E), !f)) {
            m(E);
            return;
          }
          v.ajax({
            url: g,
            type: "POST",
            data: w,
            dataType: "json",
            crossDomain: !0,
          })
            .done(function (L) {
              L && L.code === 200 && (E.success = !0), m(E);
            })
            .fail(function () {
              m(E);
            });
        };
      }
    });
    var Gv = d((MG, kv) => {
      "use strict";
      var jr = De(),
        RF = (e, t, n, r) => {
          let i = document.createElement("div");
          t.appendChild(i),
            turnstile.render(i, {
              sitekey: e,
              callback: function (o) {
                return n(o);
              },
              "error-callback": function () {
                r();
              },
            });
        };
      jr.define(
        "forms",
        (kv.exports = function (e, t) {
          var n = {},
            r = e(document),
            i,
            o = window.location,
            a = window.XDomainRequest && !window.atob,
            u = ".w-form",
            s,
            f = /e(-)?mail/i,
            m = /^\S+@\S+$/,
            v = window.alert,
            g = jr.env(),
            E,
            T,
            w,
            R = /list-manage[1-9]?.com/i,
            b = t.debounce(function () {
              v(
                "Oops! This page has improperly configured forms. Please contact your website administrator to fix this issue."
              );
            }, 100);
          n.ready =
            n.design =
            n.preview =
              function () {
                L(), !g && !E && M();
              };
          function L() {
            (s = e("html").attr("data-wf-site")),
              (T = "https://webflow.com/api/v1/form/" + s),
              a &&
                T.indexOf("https://webflow.com") >= 0 &&
                (T = T.replace(
                  "https://webflow.com",
                  "https://formdata.webflow.com"
                )),
              (w = `${T}/signFile`),
              (i = e(u + " form")),
              i.length && i.each(C);
          }
          function C(X, Y) {
            var p = e(Y),
              y = e.data(Y, u);
            y || (y = e.data(Y, u, { form: p })), F(y);
            var _ = p.closest("div.w-form");
            (y.done = _.find("> .w-form-done")),
              (y.fail = _.find("> .w-form-fail")),
              (y.fileUploads = _.find(".w-file-upload")),
              y.fileUploads.each(function (W) {
                H(W, y);
              });
            var c =
              y.form.attr("aria-label") || y.form.attr("data-name") || "Form";
            y.done.attr("aria-label") || y.form.attr("aria-label", c),
              y.done.attr("tabindex", "-1"),
              y.done.attr("role", "region"),
              y.done.attr("aria-label") ||
                y.done.attr("aria-label", c + " success"),
              y.fail.attr("tabindex", "-1"),
              y.fail.attr("role", "region"),
              y.fail.attr("aria-label") ||
                y.fail.attr("aria-label", c + " failure");
            var k = (y.action = p.attr("action"));
            if (
              ((y.handler = null),
              (y.redirect = p.attr("data-redirect")),
              R.test(k))
            ) {
              y.handler = S;
              return;
            }
            if (!k) {
              if (s) {
                y.handler = (() => {
                  let W = qv().default;
                  return W(F, o, jr, Z, z, V, v, B, N, s, q, e, T);
                })();
                return;
              }
              b();
            }
          }
          function M() {
            E = !0;
            let X = r.find("[data-turnstile-sitekey]").data("turnstile-sitekey");
            if (X) {
              let x = document.createElement("script");
              (x.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"),
                document.head.appendChild(x),
                (x.onload = () => {
                  r.on("submit", u + " form", function (J) {
                    var se = e.data(this, u);
                    N(se),
                      se.handler &&
                        ((se.evt = J),
                        J.preventDefault(),
                        RF(
                          X,
                          this,
                          (re) => se.handler({ ...se, turnstileToken: re }),
                          () => {
                            se.fail.toggle(!0), se.fail.focus(), F(se);
                          }
                        ));
                  });
                });
            } else
              r.on("submit", u + " form", function (x) {
                var J = e.data(this, u);
                J.handler && ((J.evt = x), J.handler(J));
              });
            let Y = ".w-checkbox-input",
              p = ".w-radio-input",
              y = "w--redirected-checked",
              _ = "w--redirected-focus",
              c = "w--redirected-focus-visible",
              k = ":focus-visible, [data-wf-focus-visible]",
              W = [
                ["checkbox", Y],
                ["radio", p],
              ];
            r.on(
              "change",
              u + ' form input[type="checkbox"]:not(' + Y + ")",
              (x) => {
                e(x.target).siblings(Y).toggleClass(y);
              }
            ),
              r.on("change", u + ' form input[type="radio"]', (x) => {
                e(`input[name="${x.target.name}"]:not(${Y})`).map((se, re) =>
                  e(re).siblings(p).removeClass(y)
                );
                let J = e(x.target);
                J.hasClass("w-radio-input") || J.siblings(p).addClass(y);
              }),
              W.forEach(([x, J]) => {
                r.on(
                  "focus",
                  u + ` form input[type="${x}"]:not(` + J + ")",
                  (se) => {
                    e(se.target).siblings(J).addClass(_),
                      e(se.target).filter(k).siblings(J).addClass(c);
                  }
                ),
                  r.on(
                    "blur",
                    u + ` form input[type="${x}"]:not(` + J + ")",
                    (se) => {
                      e(se.target).siblings(J).removeClass(`${_} ${c}`);
                    }
                  );
              });
          }
          function F(X) {
            var Y = (X.btn = X.form.find(':input[type="submit"]'));
            (X.wait = X.btn.attr("data-wait") || null),
              (X.success = !1),
              Y.prop("disabled", !1),
              X.label && Y.val(X.label);
          }
          function N(X) {
            var Y = X.btn,
              p = X.wait;
            Y.prop("disabled", !0), p && ((X.label = Y.val()), Y.val(p));
          }
          function V(X, Y) {
            var p = null;
            return (
              (Y = Y || {}),
              X.find(':input:not([type="submit"]):not([type="file"])').each(
                function (y, _) {
                  var c = e(_),
                    k = c.attr("type"),
                    W =
                      c.attr("data-name") || c.attr("name") || "Field " + (y + 1);
                  W = encodeURIComponent(W);
                  var x = c.val();
                  if (k === "checkbox") x = c.is(":checked");
                  else if (k === "radio") {
                    if (Y[W] === null || typeof Y[W] == "string") return;
                    x =
                      X.find(
                        'input[name="' + c.attr("name") + '"]:checked'
                      ).val() || null;
                  }
                  typeof x == "string" && (x = e.trim(x)),
                    (Y[W] = x),
                    (p = p || te(c, k, W, x));
                }
              ),
              p
            );
          }
          function B(X) {
            var Y = {};
            return (
              X.find(':input[type="file"]').each(function (p, y) {
                var _ = e(y),
                  c = _.attr("data-name") || _.attr("name") || "File " + (p + 1),
                  k = _.attr("data-value");
                typeof k == "string" && (k = e.trim(k)), (Y[c] = k);
              }),
              Y
            );
          }
          let Q = { _mkto_trk: "marketo" };
          function Z() {
            return document.cookie.split("; ").reduce(function (Y, p) {
              let y = p.split("="),
                _ = y[0];
              if (_ in Q) {
                let c = Q[_],
                  k = y.slice(1).join("=");
                Y[c] = k;
              }
              return Y;
            }, {});
          }
          function te(X, Y, p, y) {
            var _ = null;
            return (
              Y === "password"
                ? (_ = "Passwords cannot be submitted.")
                : X.attr("required")
                ? y
                  ? f.test(X.attr("type")) &&
                    (m.test(y) ||
                      (_ = "Please enter a valid email address for: " + p))
                  : (_ = "Please fill out the required field: " + p)
                : p === "g-recaptcha-response" &&
                  !y &&
                  (_ = "Please confirm you\u2019re not a robot."),
              _
            );
          }
          function G(X) {
            z(X), q(X);
          }
          function S(X) {
            F(X);
            var Y = X.form,
              p = {};
            if (/^https/.test(o.href) && !/^https/.test(X.action)) {
              Y.attr("method", "post");
              return;
            }
            z(X);
            var y = V(Y, p);
            if (y) return v(y);
            N(X);
            var _;
            t.each(p, function (x, J) {
              f.test(J) && (p.EMAIL = x),
                /^((full[ _-]?)?name)$/i.test(J) && (_ = x),
                /^(first[ _-]?name)$/i.test(J) && (p.FNAME = x),
                /^(last[ _-]?name)$/i.test(J) && (p.LNAME = x);
            }),
              _ &&
                !p.FNAME &&
                ((_ = _.split(" ")),
                (p.FNAME = _[0]),
                (p.LNAME = p.LNAME || _[1]));
            var c = X.action.replace("/post?", "/post-json?") + "&c=?",
              k = c.indexOf("u=") + 2;
            k = c.substring(k, c.indexOf("&", k));
            var W = c.indexOf("id=") + 3;
            (W = c.substring(W, c.indexOf("&", W))),
              (p["b_" + k + "_" + W] = ""),
              e
                .ajax({ url: c, data: p, dataType: "jsonp" })
                .done(function (x) {
                  (X.success = x.result === "success" || /already/.test(x.msg)),
                    X.success || console.info("MailChimp error: " + x.msg),
                    q(X);
                })
                .fail(function () {
                  q(X);
                });
          }
          function q(X) {
            var Y = X.form,
              p = X.redirect,
              y = X.success;
            if (y && p) {
              jr.location(p);
              return;
            }
            X.done.toggle(y),
              X.fail.toggle(!y),
              y ? X.done.focus() : X.fail.focus(),
              Y.toggle(!y),
              F(X);
          }
          function z(X) {
            X.evt && X.evt.preventDefault(), (X.evt = null);
          }
          function H(X, Y) {
            if (!Y.fileUploads || !Y.fileUploads[X]) return;
            var p,
              y = e(Y.fileUploads[X]),
              _ = y.find("> .w-file-upload-default"),
              c = y.find("> .w-file-upload-uploading"),
              k = y.find("> .w-file-upload-success"),
              W = y.find("> .w-file-upload-error"),
              x = _.find(".w-file-upload-input"),
              J = _.find(".w-file-upload-label"),
              se = J.children(),
              re = W.find(".w-file-upload-error-msg"),
              h = k.find(".w-file-upload-file"),
              U = k.find(".w-file-remove-link"),
              $ = h.find(".w-file-upload-file-name"),
              K = re.attr("data-w-size-error"),
              de = re.attr("data-w-type-error"),
              Pe = re.attr("data-w-generic-error");
            if (
              (g ||
                J.on("click keydown", function (A) {
                  (A.type === "keydown" && A.which !== 13 && A.which !== 32) ||
                    (A.preventDefault(), x.click());
                }),
              J.find(".w-icon-file-upload-icon").attr("aria-hidden", "true"),
              U.find(".w-icon-file-upload-remove").attr("aria-hidden", "true"),
              g)
            )
              x.on("click", function (A) {
                A.preventDefault();
              }),
                J.on("click", function (A) {
                  A.preventDefault();
                }),
                se.on("click", function (A) {
                  A.preventDefault();
                });
            else {
              U.on("click keydown", function (A) {
                if (A.type === "keydown") {
                  if (A.which !== 13 && A.which !== 32) return;
                  A.preventDefault();
                }
                x.removeAttr("data-value"),
                  x.val(""),
                  $.html(""),
                  _.toggle(!0),
                  k.toggle(!1),
                  J.focus();
              }),
                x.on("change", function (A) {
                  (p = A.target && A.target.files && A.target.files[0]),
                    p &&
                      (_.toggle(!1),
                      W.toggle(!1),
                      c.toggle(!0),
                      c.focus(),
                      $.text(p.name),
                      P() || N(Y),
                      (Y.fileUploads[X].uploading = !0),
                      ne(p, I));
                });
              var Ge = J.outerHeight();
              x.height(Ge), x.width(1);
            }
            function l(A) {
              var D = A.responseJSON && A.responseJSON.msg,
                ee = Pe;
              typeof D == "string" && D.indexOf("InvalidFileTypeError") === 0
                ? (ee = de)
                : typeof D == "string" &&
                  D.indexOf("MaxFileSizeError") === 0 &&
                  (ee = K),
                re.text(ee),
                x.removeAttr("data-value"),
                x.val(""),
                c.toggle(!1),
                _.toggle(!0),
                W.toggle(!0),
                W.focus(),
                (Y.fileUploads[X].uploading = !1),
                P() || F(Y);
            }
            function I(A, D) {
              if (A) return l(A);
              var ee = D.fileName,
                ae = D.postData,
                he = D.fileId,
                j = D.s3Url;
              x.attr("data-value", he), ie(j, ae, p, ee, O);
            }
            function O(A) {
              if (A) return l(A);
              c.toggle(!1),
                k.css("display", "inline-block"),
                k.focus(),
                (Y.fileUploads[X].uploading = !1),
                P() || F(Y);
            }
            function P() {
              var A = (Y.fileUploads && Y.fileUploads.toArray()) || [];
              return A.some(function (D) {
                return D.uploading;
              });
            }
          }
          function ne(X, Y) {
            var p = new URLSearchParams({ name: X.name, size: X.size });
            e.ajax({ type: "GET", url: `${w}?${p}`, crossDomain: !0 })
              .done(function (y) {
                Y(null, y);
              })
              .fail(function (y) {
                Y(y);
              });
          }
          function ie(X, Y, p, y, _) {
            var c = new FormData();
            for (var k in Y) c.append(k, Y[k]);
            c.append("file", p, y),
              e
                .ajax({
                  type: "POST",
                  url: X,
                  data: c,
                  processData: !1,
                  contentType: !1,
                })
                .done(function () {
                  _(null);
                })
                .fail(function (W) {
                  _(W);
                });
          }
          return n;
        })
      );
    });
    var Uv = d((FG, Xv) => {
      "use strict";
      var vt = De(),
        CF = rn(),
        we = {
          ARROW_LEFT: 37,
          ARROW_UP: 38,
          ARROW_RIGHT: 39,
          ARROW_DOWN: 40,
          ESCAPE: 27,
          SPACE: 32,
          ENTER: 13,
          HOME: 36,
          END: 35,
        };
      vt.define(
        "navbar",
        (Xv.exports = function (e, t) {
          var n = {},
            r = e.tram,
            i = e(window),
            o = e(document),
            a = t.debounce,
            u,
            s,
            f,
            m,
            v = vt.env(),
            g = '<div class="w-nav-overlay" data-wf-ignore />',
            E = ".w-nav",
            T = "w--open",
            w = "w--nav-dropdown-open",
            R = "w--nav-dropdown-toggle-open",
            b = "w--nav-dropdown-list-open",
            L = "w--nav-link-open",
            C = CF.triggers,
            M = e();
          (n.ready = n.design = n.preview = F),
            (n.destroy = function () {
              (M = e()), N(), s && s.length && s.each(Z);
            });
          function F() {
            (f = v && vt.env("design")),
              (m = vt.env("editor")),
              (u = e(document.body)),
              (s = o.find(E)),
              s.length && (s.each(Q), N(), V());
          }
          function N() {
            vt.resize.off(B);
          }
          function V() {
            vt.resize.on(B);
          }
          function B() {
            s.each(_);
          }
          function Q(h, U) {
            var $ = e(U),
              K = e.data(U, E);
            K ||
              (K = e.data(U, E, {
                open: !1,
                el: $,
                config: {},
                selectedIdx: -1,
              })),
              (K.menu = $.find(".w-nav-menu")),
              (K.links = K.menu.find(".w-nav-link")),
              (K.dropdowns = K.menu.find(".w-dropdown")),
              (K.dropdownToggle = K.menu.find(".w-dropdown-toggle")),
              (K.dropdownList = K.menu.find(".w-dropdown-list")),
              (K.button = $.find(".w-nav-button")),
              (K.container = $.find(".w-container")),
              (K.overlayContainerId = "w-nav-overlay-" + h),
              (K.outside = p(K));
            var de = $.find(".w-nav-brand");
            de &&
              de.attr("href") === "/" &&
              de.attr("aria-label") == null &&
              de.attr("aria-label", "home"),
              K.button.attr("style", "-webkit-user-select: text;"),
              K.button.attr("aria-label") == null &&
                K.button.attr("aria-label", "menu"),
              K.button.attr("role", "button"),
              K.button.attr("tabindex", "0"),
              K.button.attr("aria-controls", K.overlayContainerId),
              K.button.attr("aria-haspopup", "menu"),
              K.button.attr("aria-expanded", "false"),
              K.el.off(E),
              K.button.off(E),
              K.menu.off(E),
              S(K),
              f
                ? (te(K), K.el.on("setting" + E, q(K)))
                : (G(K),
                  K.button.on("click" + E, X(K)),
                  K.menu.on("click" + E, "a", Y(K)),
                  K.button.on("keydown" + E, z(K)),
                  K.el.on("keydown" + E, H(K))),
              _(h, U);
          }
          function Z(h, U) {
            var $ = e.data(U, E);
            $ && (te($), e.removeData(U, E));
          }
          function te(h) {
            h.overlay && (re(h, !0), h.overlay.remove(), (h.overlay = null));
          }
          function G(h) {
            h.overlay ||
              ((h.overlay = e(g).appendTo(h.el)),
              h.overlay.attr("id", h.overlayContainerId),
              (h.parent = h.menu.parent()),
              re(h, !0));
          }
          function S(h) {
            var U = {},
              $ = h.config || {},
              K = (U.animation = h.el.attr("data-animation") || "default");
            (U.animOver = /^over/.test(K)),
              (U.animDirect = /left$/.test(K) ? -1 : 1),
              $.animation !== K && h.open && t.defer(ie, h),
              (U.easing = h.el.attr("data-easing") || "ease"),
              (U.easing2 = h.el.attr("data-easing2") || "ease");
            var de = h.el.attr("data-duration");
            (U.duration = de != null ? Number(de) : 400),
              (U.docHeight = h.el.attr("data-doc-height")),
              (h.config = U);
          }
          function q(h) {
            return function (U, $) {
              $ = $ || {};
              var K = i.width();
              S(h),
                $.open === !0 && J(h, !0),
                $.open === !1 && re(h, !0),
                h.open &&
                  t.defer(function () {
                    K !== i.width() && ie(h);
                  });
            };
          }
          function z(h) {
            return function (U) {
              switch (U.keyCode) {
                case we.SPACE:
                case we.ENTER:
                  return X(h)(), U.preventDefault(), U.stopPropagation();
                case we.ESCAPE:
                  return re(h), U.preventDefault(), U.stopPropagation();
                case we.ARROW_RIGHT:
                case we.ARROW_DOWN:
                case we.HOME:
                case we.END:
                  return h.open
                    ? (U.keyCode === we.END
                        ? (h.selectedIdx = h.links.length - 1)
                        : (h.selectedIdx = 0),
                      ne(h),
                      U.preventDefault(),
                      U.stopPropagation())
                    : (U.preventDefault(), U.stopPropagation());
              }
            };
          }
          function H(h) {
            return function (U) {
              if (h.open)
                switch (
                  ((h.selectedIdx = h.links.index(document.activeElement)),
                  U.keyCode)
                ) {
                  case we.HOME:
                  case we.END:
                    return (
                      U.keyCode === we.END
                        ? (h.selectedIdx = h.links.length - 1)
                        : (h.selectedIdx = 0),
                      ne(h),
                      U.preventDefault(),
                      U.stopPropagation()
                    );
                  case we.ESCAPE:
                    return (
                      re(h),
                      h.button.focus(),
                      U.preventDefault(),
                      U.stopPropagation()
                    );
                  case we.ARROW_LEFT:
                  case we.ARROW_UP:
                    return (
                      (h.selectedIdx = Math.max(-1, h.selectedIdx - 1)),
                      ne(h),
                      U.preventDefault(),
                      U.stopPropagation()
                    );
                  case we.ARROW_RIGHT:
                  case we.ARROW_DOWN:
                    return (
                      (h.selectedIdx = Math.min(
                        h.links.length - 1,
                        h.selectedIdx + 1
                      )),
                      ne(h),
                      U.preventDefault(),
                      U.stopPropagation()
                    );
                }
            };
          }
          function ne(h) {
            if (h.links[h.selectedIdx]) {
              var U = h.links[h.selectedIdx];
              U.focus(), Y(U);
            }
          }
          function ie(h) {
            h.open && (re(h, !0), J(h, !0));
          }
          function X(h) {
            return a(function () {
              h.open ? re(h) : J(h);
            });
          }
          function Y(h) {
            return function (U) {
              var $ = e(this),
                K = $.attr("href");
              if (!vt.validClick(U.currentTarget)) {
                U.preventDefault();
                return;
              }
              K && K.indexOf("#") === 0 && h.open && re(h);
            };
          }
          function p(h) {
            return (
              h.outside && o.off("click" + E, h.outside),
              function (U) {
                var $ = e(U.target);
                (m && $.closest(".w-editor-bem-EditorOverlay").length) || y(h, $);
              }
            );
          }
          var y = a(function (h, U) {
            if (h.open) {
              var $ = U.closest(".w-nav-menu");
              h.menu.is($) || re(h);
            }
          });
          function _(h, U) {
            var $ = e.data(U, E),
              K = ($.collapsed = $.button.css("display") !== "none");
            if (($.open && !K && !f && re($, !0), $.container.length)) {
              var de = k($);
              $.links.each(de), $.dropdowns.each(de);
            }
            $.open && se($);
          }
          var c = "max-width";
          function k(h) {
            var U = h.container.css(c);
            return (
              U === "none" && (U = ""),
              function ($, K) {
                (K = e(K)), K.css(c, ""), K.css(c) === "none" && K.css(c, U);
              }
            );
          }
          function W(h, U) {
            U.setAttribute("data-nav-menu-open", "");
          }
          function x(h, U) {
            U.removeAttribute("data-nav-menu-open");
          }
          function J(h, U) {
            if (h.open) return;
            (h.open = !0),
              h.menu.each(W),
              h.links.addClass(L),
              h.dropdowns.addClass(w),
              h.dropdownToggle.addClass(R),
              h.dropdownList.addClass(b),
              h.button.addClass(T);
            var $ = h.config,
              K = $.animation;
            (K === "none" || !r.support.transform || $.duration <= 0) && (U = !0);
            var de = se(h),
              Pe = h.menu.outerHeight(!0),
              Ge = h.menu.outerWidth(!0),
              l = h.el.height(),
              I = h.el[0];
            if (
              (_(0, I),
              C.intro(0, I),
              vt.redraw.up(),
              f || o.on("click" + E, h.outside),
              U)
            ) {
              A();
              return;
            }
            var O = "transform " + $.duration + "ms " + $.easing;
            if (
              (h.overlay &&
                ((M = h.menu.prev()), h.overlay.show().append(h.menu)),
              $.animOver)
            ) {
              r(h.menu)
                .add(O)
                .set({ x: $.animDirect * Ge, height: de })
                .start({ x: 0 })
                .then(A),
                h.overlay && h.overlay.width(Ge);
              return;
            }
            var P = l + Pe;
            r(h.menu).add(O).set({ y: -P }).start({ y: 0 }).then(A);
            function A() {
              h.button.attr("aria-expanded", "true");
            }
          }
          function se(h) {
            var U = h.config,
              $ = U.docHeight ? o.height() : u.height();
            return (
              U.animOver
                ? h.menu.height($)
                : h.el.css("position") !== "fixed" && ($ -= h.el.outerHeight(!0)),
              h.overlay && h.overlay.height($),
              $
            );
          }
          function re(h, U) {
            if (!h.open) return;
            (h.open = !1), h.button.removeClass(T);
            var $ = h.config;
            if (
              (($.animation === "none" ||
                !r.support.transform ||
                $.duration <= 0) &&
                (U = !0),
              C.outro(0, h.el[0]),
              o.off("click" + E, h.outside),
              U)
            ) {
              r(h.menu).stop(), I();
              return;
            }
            var K = "transform " + $.duration + "ms " + $.easing2,
              de = h.menu.outerHeight(!0),
              Pe = h.menu.outerWidth(!0),
              Ge = h.el.height();
            if ($.animOver) {
              r(h.menu)
                .add(K)
                .start({ x: Pe * $.animDirect })
                .then(I);
              return;
            }
            var l = Ge + de;
            r(h.menu).add(K).start({ y: -l }).then(I);
            function I() {
              h.menu.height(""),
                r(h.menu).set({ x: 0, y: 0 }),
                h.menu.each(x),
                h.links.removeClass(L),
                h.dropdowns.removeClass(w),
                h.dropdownToggle.removeClass(R),
                h.dropdownList.removeClass(b),
                h.overlay &&
                  h.overlay.children().length &&
                  (M.length ? h.menu.insertAfter(M) : h.menu.prependTo(h.parent),
                  h.overlay.attr("style", "").hide()),
                h.el.triggerHandler("w-close"),
                h.button.attr("aria-expanded", "false");
            }
          }
          return n;
        })
      );
    });
    var Hv = d((qG, Vv) => {
      "use strict";
      var Et = De(),
        PF = rn(),
        it = {
          ARROW_LEFT: 37,
          ARROW_UP: 38,
          ARROW_RIGHT: 39,
          ARROW_DOWN: 40,
          SPACE: 32,
          ENTER: 13,
          HOME: 36,
          END: 35,
        },
        Wv =
          'a[href], area[href], [role="button"], input, select, textarea, button, iframe, object, embed, *[tabindex], *[contenteditable]';
      Et.define(
        "slider",
        (Vv.exports = function (e, t) {
          var n = {},
            r = e.tram,
            i = e(document),
            o,
            a,
            u = Et.env(),
            s = ".w-slider",
            f = '<div class="w-slider-dot" data-wf-ignore />',
            m =
              '<div aria-live="off" aria-atomic="true" class="w-slider-aria-label" data-wf-ignore />',
            v = "w-slider-force-show",
            g = PF.triggers,
            E,
            T = !1;
          (n.ready = function () {
            (a = Et.env("design")), w();
          }),
            (n.design = function () {
              (a = !0), setTimeout(w, 1e3);
            }),
            (n.preview = function () {
              (a = !1), w();
            }),
            (n.redraw = function () {
              (T = !0), w(), (T = !1);
            }),
            (n.destroy = R);
          function w() {
            (o = i.find(s)), o.length && (o.each(C), !E && (R(), b()));
          }
          function R() {
            Et.resize.off(L), Et.redraw.off(n.redraw);
          }
          function b() {
            Et.resize.on(L), Et.redraw.on(n.redraw);
          }
          function L() {
            o.filter(":visible").each(H);
          }
          function C(p, y) {
            var _ = e(y),
              c = e.data(y, s);
            c ||
              (c = e.data(y, s, {
                index: 0,
                depth: 1,
                hasFocus: { keyboard: !1, mouse: !1 },
                el: _,
                config: {},
              })),
              (c.mask = _.children(".w-slider-mask")),
              (c.left = _.children(".w-slider-arrow-left")),
              (c.right = _.children(".w-slider-arrow-right")),
              (c.nav = _.children(".w-slider-nav")),
              (c.slides = c.mask.children(".w-slide")),
              c.slides.each(g.reset),
              T && (c.maskWidth = 0),
              _.attr("role") === void 0 && _.attr("role", "region"),
              _.attr("aria-label") === void 0 && _.attr("aria-label", "carousel");
            var k = c.mask.attr("id");
            if (
              (k || ((k = "w-slider-mask-" + p), c.mask.attr("id", k)),
              !a && !c.ariaLiveLabel && (c.ariaLiveLabel = e(m).appendTo(c.mask)),
              c.left.attr("role", "button"),
              c.left.attr("tabindex", "0"),
              c.left.attr("aria-controls", k),
              c.left.attr("aria-label") === void 0 &&
                c.left.attr("aria-label", "previous slide"),
              c.right.attr("role", "button"),
              c.right.attr("tabindex", "0"),
              c.right.attr("aria-controls", k),
              c.right.attr("aria-label") === void 0 &&
                c.right.attr("aria-label", "next slide"),
              !r.support.transform)
            ) {
              c.left.hide(), c.right.hide(), c.nav.hide(), (E = !0);
              return;
            }
            c.el.off(s),
              c.left.off(s),
              c.right.off(s),
              c.nav.off(s),
              M(c),
              a
                ? (c.el.on("setting" + s, S(c)), G(c), (c.hasTimer = !1))
                : (c.el.on("swipe" + s, S(c)),
                  c.left.on("click" + s, B(c)),
                  c.right.on("click" + s, Q(c)),
                  c.left.on("keydown" + s, V(c, B)),
                  c.right.on("keydown" + s, V(c, Q)),
                  c.nav.on("keydown" + s, "> div", S(c)),
                  c.config.autoplay &&
                    !c.hasTimer &&
                    ((c.hasTimer = !0), (c.timerCount = 1), te(c)),
                  c.el.on("mouseenter" + s, N(c, !0, "mouse")),
                  c.el.on("focusin" + s, N(c, !0, "keyboard")),
                  c.el.on("mouseleave" + s, N(c, !1, "mouse")),
                  c.el.on("focusout" + s, N(c, !1, "keyboard"))),
              c.nav.on("click" + s, "> div", S(c)),
              u ||
                c.mask
                  .contents()
                  .filter(function () {
                    return this.nodeType === 3;
                  })
                  .remove();
            var W = _.filter(":hidden");
            W.addClass(v);
            var x = _.parents(":hidden");
            x.addClass(v), T || H(p, y), W.removeClass(v), x.removeClass(v);
          }
          function M(p) {
            var y = {};
            (y.crossOver = 0),
              (y.animation = p.el.attr("data-animation") || "slide"),
              y.animation === "outin" &&
                ((y.animation = "cross"), (y.crossOver = 0.5)),
              (y.easing = p.el.attr("data-easing") || "ease");
            var _ = p.el.attr("data-duration");
            if (
              ((y.duration = _ != null ? parseInt(_, 10) : 500),
              F(p.el.attr("data-infinite")) && (y.infinite = !0),
              F(p.el.attr("data-disable-swipe")) && (y.disableSwipe = !0),
              F(p.el.attr("data-hide-arrows"))
                ? (y.hideArrows = !0)
                : p.config.hideArrows && (p.left.show(), p.right.show()),
              F(p.el.attr("data-autoplay")))
            ) {
              (y.autoplay = !0),
                (y.delay = parseInt(p.el.attr("data-delay"), 10) || 2e3),
                (y.timerMax = parseInt(p.el.attr("data-autoplay-limit"), 10));
              var c = "mousedown" + s + " touchstart" + s;
              a ||
                p.el.off(c).one(c, function () {
                  G(p);
                });
            }
            var k = p.right.width();
            (y.edge = k ? k + 40 : 100), (p.config = y);
          }
          function F(p) {
            return p === "1" || p === "true";
          }
          function N(p, y, _) {
            return function (c) {
              if (y) p.hasFocus[_] = y;
              else if (
                e.contains(p.el.get(0), c.relatedTarget) ||
                ((p.hasFocus[_] = y),
                (p.hasFocus.mouse && _ === "keyboard") ||
                  (p.hasFocus.keyboard && _ === "mouse"))
              )
                return;
              y
                ? (p.ariaLiveLabel.attr("aria-live", "polite"),
                  p.hasTimer && G(p))
                : (p.ariaLiveLabel.attr("aria-live", "off"), p.hasTimer && te(p));
            };
          }
          function V(p, y) {
            return function (_) {
              switch (_.keyCode) {
                case it.SPACE:
                case it.ENTER:
                  return y(p)(), _.preventDefault(), _.stopPropagation();
              }
            };
          }
          function B(p) {
            return function () {
              z(p, { index: p.index - 1, vector: -1 });
            };
          }
          function Q(p) {
            return function () {
              z(p, { index: p.index + 1, vector: 1 });
            };
          }
          function Z(p, y) {
            var _ = null;
            y === p.slides.length && (w(), ne(p)),
              t.each(p.anchors, function (c, k) {
                e(c.els).each(function (W, x) {
                  e(x).index() === y && (_ = k);
                });
              }),
              _ != null && z(p, { index: _, immediate: !0 });
          }
          function te(p) {
            G(p);
            var y = p.config,
              _ = y.timerMax;
            (_ && p.timerCount++ > _) ||
              (p.timerId = window.setTimeout(function () {
                p.timerId == null || a || (Q(p)(), te(p));
              }, y.delay));
          }
          function G(p) {
            window.clearTimeout(p.timerId), (p.timerId = null);
          }
          function S(p) {
            return function (y, _) {
              _ = _ || {};
              var c = p.config;
              if (a && y.type === "setting") {
                if (_.select === "prev") return B(p)();
                if (_.select === "next") return Q(p)();
                if ((M(p), ne(p), _.select == null)) return;
                Z(p, _.select);
                return;
              }
              if (y.type === "swipe")
                return c.disableSwipe || Et.env("editor")
                  ? void 0
                  : _.direction === "left"
                  ? Q(p)()
                  : _.direction === "right"
                  ? B(p)()
                  : void 0;
              if (p.nav.has(y.target).length) {
                var k = e(y.target).index();
                if (
                  (y.type === "click" && z(p, { index: k }), y.type === "keydown")
                )
                  switch (y.keyCode) {
                    case it.ENTER:
                    case it.SPACE: {
                      z(p, { index: k }), y.preventDefault();
                      break;
                    }
                    case it.ARROW_LEFT:
                    case it.ARROW_UP: {
                      q(p.nav, Math.max(k - 1, 0)), y.preventDefault();
                      break;
                    }
                    case it.ARROW_RIGHT:
                    case it.ARROW_DOWN: {
                      q(p.nav, Math.min(k + 1, p.pages)), y.preventDefault();
                      break;
                    }
                    case it.HOME: {
                      q(p.nav, 0), y.preventDefault();
                      break;
                    }
                    case it.END: {
                      q(p.nav, p.pages), y.preventDefault();
                      break;
                    }
                    default:
                      return;
                  }
              }
            };
          }
          function q(p, y) {
            var _ = p.children().eq(y).focus();
            p.children().not(_);
          }
          function z(p, y) {
            y = y || {};
            var _ = p.config,
              c = p.anchors;
            p.previous = p.index;
            var k = y.index,
              W = {};
            k < 0
              ? ((k = c.length - 1),
                _.infinite &&
                  ((W.x = -p.endX), (W.from = 0), (W.to = c[0].width)))
              : k >= c.length &&
                ((k = 0),
                _.infinite &&
                  ((W.x = c[c.length - 1].width),
                  (W.from = -c[c.length - 1].x),
                  (W.to = W.from - W.x))),
              (p.index = k);
            var x = p.nav
              .children()
              .eq(k)
              .addClass("w-active")
              .attr("aria-pressed", "true")
              .attr("tabindex", "0");
            p.nav
              .children()
              .not(x)
              .removeClass("w-active")
              .attr("aria-pressed", "false")
              .attr("tabindex", "-1"),
              _.hideArrows &&
                (p.index === c.length - 1 ? p.right.hide() : p.right.show(),
                p.index === 0 ? p.left.hide() : p.left.show());
            var J = p.offsetX || 0,
              se = (p.offsetX = -c[p.index].x),
              re = { x: se, opacity: 1, visibility: "" },
              h = e(c[p.index].els),
              U = e(c[p.previous] && c[p.previous].els),
              $ = p.slides.not(h),
              K = _.animation,
              de = _.easing,
              Pe = Math.round(_.duration),
              Ge = y.vector || (p.index > p.previous ? 1 : -1),
              l = "opacity " + Pe + "ms " + de,
              I = "transform " + Pe + "ms " + de;
            if (
              (h.find(Wv).removeAttr("tabindex"),
              h.removeAttr("aria-hidden"),
              h.find("*").removeAttr("aria-hidden"),
              $.find(Wv).attr("tabindex", "-1"),
              $.attr("aria-hidden", "true"),
              $.find("*").attr("aria-hidden", "true"),
              a || (h.each(g.intro), $.each(g.outro)),
              y.immediate && !T)
            ) {
              r(h).set(re), A();
              return;
            }
            if (p.index === p.previous) return;
            if (
              (a || p.ariaLiveLabel.text(`Slide ${k + 1} of ${c.length}.`),
              K === "cross")
            ) {
              var O = Math.round(Pe - Pe * _.crossOver),
                P = Math.round(Pe - O);
              (l = "opacity " + O + "ms " + de),
                r(U).set({ visibility: "" }).add(l).start({ opacity: 0 }),
                r(h)
                  .set({ visibility: "", x: se, opacity: 0, zIndex: p.depth++ })
                  .add(l)
                  .wait(P)
                  .then({ opacity: 1 })
                  .then(A);
              return;
            }
            if (K === "fade") {
              r(U).set({ visibility: "" }).stop(),
                r(h)
                  .set({ visibility: "", x: se, opacity: 0, zIndex: p.depth++ })
                  .add(l)
                  .start({ opacity: 1 })
                  .then(A);
              return;
            }
            if (K === "over") {
              (re = { x: p.endX }),
                r(U).set({ visibility: "" }).stop(),
                r(h)
                  .set({
                    visibility: "",
                    zIndex: p.depth++,
                    x: se + c[p.index].width * Ge,
                  })
                  .add(I)
                  .start({ x: se })
                  .then(A);
              return;
            }
            _.infinite && W.x
              ? (r(p.slides.not(U))
                  .set({ visibility: "", x: W.x })
                  .add(I)
                  .start({ x: se }),
                r(U).set({ visibility: "", x: W.from }).add(I).start({ x: W.to }),
                (p.shifted = U))
              : (_.infinite &&
                  p.shifted &&
                  (r(p.shifted).set({ visibility: "", x: J }),
                  (p.shifted = null)),
                r(p.slides).set({ visibility: "" }).add(I).start({ x: se }));
            function A() {
              (h = e(c[p.index].els)),
                ($ = p.slides.not(h)),
                K !== "slide" && (re.visibility = "hidden"),
                r($).set(re);
            }
          }
          function H(p, y) {
            var _ = e.data(y, s);
            if (_) {
              if (X(_)) return ne(_);
              a && Y(_) && ne(_);
            }
          }
          function ne(p) {
            var y = 1,
              _ = 0,
              c = 0,
              k = 0,
              W = p.maskWidth,
              x = W - p.config.edge;
            x < 0 && (x = 0),
              (p.anchors = [{ els: [], x: 0, width: 0 }]),
              p.slides.each(function (se, re) {
                c - _ > x &&
                  (y++,
                  (_ += W),
                  (p.anchors[y - 1] = { els: [], x: c, width: 0 })),
                  (k = e(re).outerWidth(!0)),
                  (c += k),
                  (p.anchors[y - 1].width += k),
                  p.anchors[y - 1].els.push(re);
                var h = se + 1 + " of " + p.slides.length;
                e(re).attr("aria-label", h), e(re).attr("role", "group");
              }),
              (p.endX = c),
              a && (p.pages = null),
              p.nav.length && p.pages !== y && ((p.pages = y), ie(p));
            var J = p.index;
            J >= y && (J = y - 1), z(p, { immediate: !0, index: J });
          }
          function ie(p) {
            var y = [],
              _,
              c = p.el.attr("data-nav-spacing");
            c && (c = parseFloat(c) + "px");
            for (var k = 0, W = p.pages; k < W; k++)
              (_ = e(f)),
                _.attr("aria-label", "Show slide " + (k + 1) + " of " + W)
                  .attr("aria-pressed", "false")
                  .attr("role", "button")
                  .attr("tabindex", "-1"),
                p.nav.hasClass("w-num") && _.text(k + 1),
                c != null && _.css({ "margin-left": c, "margin-right": c }),
                y.push(_);
            p.nav.empty().append(y);
          }
          function X(p) {
            var y = p.mask.width();
            return p.maskWidth !== y ? ((p.maskWidth = y), !0) : !1;
          }
          function Y(p) {
            var y = 0;
            return (
              p.slides.each(function (_, c) {
                y += e(c).outerWidth(!0);
              }),
              p.slidesWidth !== y ? ((p.slidesWidth = y), !0) : !1
            );
          }
          return n;
        })
      );
    });
    Oa();
    xa();
    Ca();
    Na();
    rn();
    Sv();
    Rv();
    Pv();
    Nv();
    Fv();
    Gv();
    Uv();
    Hv();
  })();
  /*!
   * tram.js v0.8.2-global
   * Cross-browser CSS3 transitions in JavaScript
   * https://github.com/bkwld/tram
   * MIT License
   */
  /*!
   * Webflow._ (aka) Underscore.js 1.6.0 (custom build)
   *
   * http://underscorejs.org
   * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   * Underscore may be freely distributed under the MIT license.
   * @license MIT
   */
  /*! Bundled license information:
  
  timm/lib/timm.js:
    (*!
     * Timm
     *
     * Immutability helpers with fast reads and acceptable writes.
     *
     * @copyright Guillermo Grau Panea 2016
     * @license MIT
     *)
  */
  /**
   * ----------------------------------------------------------------------
   * Webflow: Interactions 2.0: Init
   */
  Webflow.require("ix2").init({
    events: {
      e: {
        id: "e",
        name: "",
        animationType: "custom",
        eventTypeId: "NAVBAR_OPEN",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-2",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d8b",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d8b",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726900812676,
      },
      "e-2": {
        id: "e-2",
        name: "",
        animationType: "custom",
        eventTypeId: "NAVBAR_CLOSE",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-2",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d8b",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d8b",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726900812677,
      },
      "e-3": {
        id: "e-3",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-3",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-4",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d92",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d92",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726900964804,
      },
      "e-4": {
        id: "e-4",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-4",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-3",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d92",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d92",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726900964804,
      },
      "e-5": {
        id: "e-5",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-3",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-6",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51da1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51da1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726901062353,
      },
      "e-6": {
        id: "e-6",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-4",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-5",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51da1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51da1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726901062353,
      },
      "e-7": {
        id: "e-7",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-3",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-8",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d9c",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d9c",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726901062625,
      },
      "e-8": {
        id: "e-8",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-4",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-7",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d9c",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d9c",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726901062625,
      },
      "e-9": {
        id: "e-9",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-3",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-25",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d97",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d97",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726901062905,
      },
      "e-10": {
        id: "e-10",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-4",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-9",
          },
        },
        mediaQueries: ["main"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51d97",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51d97",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1726901062905,
      },
      "e-15": {
        id: "e-15",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-16",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51dac",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51dac",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727071482235,
      },
      "e-16": {
        id: "e-16",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-15",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51dac",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51dac",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727071482235,
      },
      "e-17": {
        id: "e-17",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-26",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51da6",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51da6",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727072213174,
      },
      "e-18": {
        id: "e-18",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-17",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "7d76a119-0df5-6eea-e914-f1adc1e51da6",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "7d76a119-0df5-6eea-e914-f1adc1e51da6",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727072213174,
      },
      "e-19": {
        id: "e-19",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-20",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1097d21988f0754da8f3e|4b347649-ed3e-82a1-0a90-776d7d39041e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1097d21988f0754da8f3e|4b347649-ed3e-82a1-0a90-776d7d39041e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727072637375,
      },
      "e-20": {
        id: "e-20",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-19",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1097d21988f0754da8f3e|4b347649-ed3e-82a1-0a90-776d7d39041e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1097d21988f0754da8f3e|4b347649-ed3e-82a1-0a90-776d7d39041e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727072637375,
      },
      "e-21": {
        id: "e-21",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-22",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1097d21988f0754da8f3e|c18273f1-b2ec-b747-6cd4-04e3c7a12f40",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1097d21988f0754da8f3e|c18273f1-b2ec-b747-6cd4-04e3c7a12f40",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727072637375,
      },
      "e-22": {
        id: "e-22",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-21",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1097d21988f0754da8f3e|c18273f1-b2ec-b747-6cd4-04e3c7a12f40",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1097d21988f0754da8f3e|c18273f1-b2ec-b747-6cd4-04e3c7a12f40",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727072637375,
      },
      "e-23": {
        id: "e-23",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-24",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f10e57fd281cd72b4b5706|6eaed42d-e18f-89e3-893c-632e1e9a04e1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f10e57fd281cd72b4b5706|6eaed42d-e18f-89e3-893c-632e1e9a04e1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727074492445,
      },
      "e-24": {
        id: "e-24",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-23",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f10e57fd281cd72b4b5706|6eaed42d-e18f-89e3-893c-632e1e9a04e1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f10e57fd281cd72b4b5706|6eaed42d-e18f-89e3-893c-632e1e9a04e1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727074492445,
      },
      "e-25": {
        id: "e-25",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_OPEN",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-7",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-26",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff2d",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff2d",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1710935109707,
      },
      "e-26": {
        id: "e-26",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_CLOSE",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-8",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-25",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff2d",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff2d",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1710935109707,
      },
      "e-29": {
        id: "e-29",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_OPEN",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-7",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-30",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff64",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff64",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091785621,
      },
      "e-30": {
        id: "e-30",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_CLOSE",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-8",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-29",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff64",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff64",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091785621,
      },
      "e-31": {
        id: "e-31",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_OPEN",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-7",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-32",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff59",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff59",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091786411,
      },
      "e-32": {
        id: "e-32",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_CLOSE",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-8",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-31",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff59",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff59",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091786411,
      },
      "e-33": {
        id: "e-33",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_OPEN",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-7",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-34",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff4e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff4e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091787107,
      },
      "e-34": {
        id: "e-34",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_CLOSE",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-8",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-33",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff4e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff4e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091787107,
      },
      "e-35": {
        id: "e-35",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_OPEN",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-7",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-36",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff43",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff43",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091787581,
      },
      "e-36": {
        id: "e-36",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_CLOSE",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-8",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-35",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff43",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff43",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091787581,
      },
      "e-37": {
        id: "e-37",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_OPEN",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-7",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-38",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff38",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff38",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091788029,
      },
      "e-38": {
        id: "e-38",
        name: "",
        animationType: "preset",
        eventTypeId: "DROPDOWN_CLOSE",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-8",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-37",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff38",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff38",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727091788029,
      },
      "e-39": {
        id: "e-39",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-40",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367eb",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367eb",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094094614,
      },
      "e-40": {
        id: "e-40",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-39",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367eb",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367eb",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094094615,
      },
      "e-41": {
        id: "e-41",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-42",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367e7",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367e7",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094302717,
      },
      "e-42": {
        id: "e-42",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-41",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367e7",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f156cd09b07cedd8dbd6f1|676d1f55-07cb-2e5c-84ee-23c04d8367e7",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094302717,
      },
      "e-43": {
        id: "e-43",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-44",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094565151,
      },
      "e-44": {
        id: "e-44",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-43",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094565151,
      },
      "e-45": {
        id: "e-45",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-46",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f8",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f8",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094565151,
      },
      "e-46": {
        id: "e-46",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-45",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f8",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1573cdb5267e64707c184|f518455b-3cc5-d879-1fab-79692e59d7f8",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727094565151,
      },
      "e-47": {
        id: "e-47",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-48",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc39",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc39",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727096745444,
      },
      "e-48": {
        id: "e-48",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-47",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc39",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc39",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727096745444,
      },
      "e-49": {
        id: "e-49",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-50",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc40",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc40",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727096745444,
      },
      "e-50": {
        id: "e-50",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-49",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc40",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f161db07af2449527a9911|1645cdaa-d4db-ab79-6560-8ee43180cc40",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727096745444,
      },
      "e-51": {
        id: "e-51",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-9",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-52",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f161db07af2449527a9911|32ccf670-6b80-1e15-d9b2-af6d0c0754f6",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f161db07af2449527a9911|32ccf670-6b80-1e15-d9b2-af6d0c0754f6",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727151745316,
      },
      "e-52": {
        id: "e-52",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-10",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-51",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f161db07af2449527a9911|32ccf670-6b80-1e15-d9b2-af6d0c0754f6",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f161db07af2449527a9911|32ccf670-6b80-1e15-d9b2-af6d0c0754f6",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727151745317,
      },
      "e-53": {
        id: "e-53",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-9",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-54",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c15e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c15e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727152467047,
      },
      "e-54": {
        id: "e-54",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-10",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-53",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c15e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c15e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727152467047,
      },
      "e-55": {
        id: "e-55",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-56",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c16d",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c16d",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727152467047,
      },
      "e-56": {
        id: "e-56",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-55",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c16d",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c16d",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727152467047,
      },
      "e-57": {
        id: "e-57",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-58",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c174",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c174",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727152467047,
      },
      "e-58": {
        id: "e-58",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-57",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c174",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f162980e4e0f5679ddf77c|b0765c31-7972-2807-fc0a-9d0bbbe0c174",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727152467047,
      },
      "e-59": {
        id: "e-59",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-60",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "0b44f9a7-b420-9191-3b78-aef50545caf9",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "0b44f9a7-b420-9191-3b78-aef50545caf9",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727154232141,
      },
      "e-60": {
        id: "e-60",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-59",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "0b44f9a7-b420-9191-3b78-aef50545caf9",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "0b44f9a7-b420-9191-3b78-aef50545caf9",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727154232141,
      },
      "e-61": {
        id: "e-61",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-62",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040b7",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040b7",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727157064274,
      },
      "e-62": {
        id: "e-62",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-61",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040b7",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040b7",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727157064274,
      },
      "e-63": {
        id: "e-63",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-64",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040be",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040be",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727157064274,
      },
      "e-64": {
        id: "e-64",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-63",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040be",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|c653ead5-ef19-b6c7-69bc-c9b86eb040be",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727157064274,
      },
      "e-68": {
        id: "e-68",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_MOVE",
        action: {
          id: "",
          actionTypeId: "GENERAL_CONTINUOUS_ACTION",
          config: { actionListId: "a-11", affectedElements: {}, duration: 0 },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|131ec95f-5fc4-4e7f-0209-74178a2cf902",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|131ec95f-5fc4-4e7f-0209-74178a2cf902",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: [
          {
            continuousParameterGroupId: "a-11-p",
            selectedAxis: "X_AXIS",
            basedOn: "ELEMENT",
            reverse: false,
            smoothing: 50,
            restingState: 50,
          },
          {
            continuousParameterGroupId: "a-11-p-2",
            selectedAxis: "Y_AXIS",
            basedOn: "ELEMENT",
            reverse: false,
            smoothing: 50,
            restingState: 50,
          },
        ],
        createdOn: 1727157713484,
      },
      "e-69": {
        id: "e-69",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-12",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-70",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|131ec95f-5fc4-4e7f-0209-74178a2cf902",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|131ec95f-5fc4-4e7f-0209-74178a2cf902",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727157730612,
      },
      "e-70": {
        id: "e-70",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-13",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-69",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|131ec95f-5fc4-4e7f-0209-74178a2cf902",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|131ec95f-5fc4-4e7f-0209-74178a2cf902",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727157730613,
      },
      "e-71": {
        id: "e-71",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-72",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|d3163eae-7093-0d34-c9ec-c397bf15047f",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|d3163eae-7093-0d34-c9ec-c397bf15047f",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159110295,
      },
      "e-72": {
        id: "e-72",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-71",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|d3163eae-7093-0d34-c9ec-c397bf15047f",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|d3163eae-7093-0d34-c9ec-c397bf15047f",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159110295,
      },
      "e-73": {
        id: "e-73",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-74",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|693e9049-4b9b-f440-bb9f-afb2d58d90df",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|693e9049-4b9b-f440-bb9f-afb2d58d90df",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159385478,
      },
      "e-74": {
        id: "e-74",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-73",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|693e9049-4b9b-f440-bb9f-afb2d58d90df",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|693e9049-4b9b-f440-bb9f-afb2d58d90df",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159385478,
      },
      "e-75": {
        id: "e-75",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_MOVE",
        action: {
          id: "",
          actionTypeId: "GENERAL_CONTINUOUS_ACTION",
          config: { actionListId: "a-11", affectedElements: {}, duration: 0 },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0b",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0b",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: [
          {
            continuousParameterGroupId: "a-11-p",
            selectedAxis: "X_AXIS",
            basedOn: "ELEMENT",
            reverse: false,
            smoothing: 50,
            restingState: 50,
          },
          {
            continuousParameterGroupId: "a-11-p-2",
            selectedAxis: "Y_AXIS",
            basedOn: "ELEMENT",
            reverse: false,
            smoothing: 50,
            restingState: 50,
          },
        ],
        createdOn: 1727159453511,
      },
      "e-76": {
        id: "e-76",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-12",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-77",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0b",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0b",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159453511,
      },
      "e-77": {
        id: "e-77",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-13",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-76",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0b",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0b",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159453511,
      },
      "e-78": {
        id: "e-78",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-79",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc17",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc17",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159453511,
      },
      "e-79": {
        id: "e-79",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-78",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc17",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc17",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159453511,
      },
      "e-80": {
        id: "e-80",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-81",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc1e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc1e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159453511,
      },
      "e-81": {
        id: "e-81",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-80",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc1e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc1e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727159453511,
      },
      "e-82": {
        id: "e-82",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-83",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|14332df0-54fb-cb91-f497-77812c99871c",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|14332df0-54fb-cb91-f497-77812c99871c",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727160586156,
      },
      "e-83": {
        id: "e-83",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-82",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|14332df0-54fb-cb91-f497-77812c99871c",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|14332df0-54fb-cb91-f497-77812c99871c",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727160586156,
      },
      "e-84": {
        id: "e-84",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-14",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-85",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "8faa0133-4fcf-d0af-1c4c-eaa2c3d49a02",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "8faa0133-4fcf-d0af-1c4c-eaa2c3d49a02",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: true,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727171731208,
      },
      "e-86": {
        id: "e-86",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-9",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-87",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fd8aa280-9313-1a4c-788c-b8d2dc4060c1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fd8aa280-9313-1a4c-788c-b8d2dc4060c1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173556959,
      },
      "e-87": {
        id: "e-87",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-10",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-86",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fd8aa280-9313-1a4c-788c-b8d2dc4060c1",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fd8aa280-9313-1a4c-788c-b8d2dc4060c1",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173556959,
      },
      "e-88": {
        id: "e-88",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-89",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed6fb",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed6fb",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173556959,
      },
      "e-89": {
        id: "e-89",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-88",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed6fb",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed6fb",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173556959,
      },
      "e-90": {
        id: "e-90",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-91",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed702",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed702",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173556959,
      },
      "e-91": {
        id: "e-91",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-90",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed702",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|cecfcdeb-f03c-dd13-337c-d1c8b61ed702",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173556959,
      },
      "e-92": {
        id: "e-92",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-93",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fd8aa280-9313-1a4c-788c-b8d2dc4060d0",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fd8aa280-9313-1a4c-788c-b8d2dc4060d0",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173685069,
      },
      "e-93": {
        id: "e-93",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-92",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fd8aa280-9313-1a4c-788c-b8d2dc4060d0",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fd8aa280-9313-1a4c-788c-b8d2dc4060d0",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727173685069,
      },
      "e-94": {
        id: "e-94",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-95",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|37105e2f-4a62-cec5-4ba0-0d749ca23324",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|37105e2f-4a62-cec5-4ba0-0d749ca23324",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175514584,
      },
      "e-95": {
        id: "e-95",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-94",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|37105e2f-4a62-cec5-4ba0-0d749ca23324",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|37105e2f-4a62-cec5-4ba0-0d749ca23324",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175514584,
      },
      "e-96": {
        id: "e-96",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_MOVE",
        action: {
          id: "",
          actionTypeId: "GENERAL_CONTINUOUS_ACTION",
          config: { actionListId: "a-11", affectedElements: {}, duration: 0 },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec4",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec4",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: [
          {
            continuousParameterGroupId: "a-11-p",
            selectedAxis: "X_AXIS",
            basedOn: "ELEMENT",
            reverse: false,
            smoothing: 50,
            restingState: 50,
          },
          {
            continuousParameterGroupId: "a-11-p-2",
            selectedAxis: "Y_AXIS",
            basedOn: "ELEMENT",
            reverse: false,
            smoothing: 50,
            restingState: 50,
          },
        ],
        createdOn: 1727175599510,
      },
      "e-97": {
        id: "e-97",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-12",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-98",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec4",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec4",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175599510,
      },
      "e-98": {
        id: "e-98",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-13",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-97",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec4",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec4",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175599510,
      },
      "e-99": {
        id: "e-99",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-100",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed0",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed0",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175599510,
      },
      "e-100": {
        id: "e-100",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-99",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed0",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed0",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175599510,
      },
      "e-101": {
        id: "e-101",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-102",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed7",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed7",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175599510,
      },
      "e-102": {
        id: "e-102",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-101",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed7",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ed7",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727175599510,
      },
      "e-103": {
        id: "e-103",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-104",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|fe305e02-2f2d-bc8e-fb9e-f360cee9f099",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|fe305e02-2f2d-bc8e-fb9e-f360cee9f099",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727177377386,
      },
      "e-104": {
        id: "e-104",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-103",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|fe305e02-2f2d-bc8e-fb9e-f360cee9f099",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|fe305e02-2f2d-bc8e-fb9e-f360cee9f099",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727177377387,
      },
      "e-105": {
        id: "e-105",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-5",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-106",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|0217f34b-deb0-521a-f058-00e64bbd19c0",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|0217f34b-deb0-521a-f058-00e64bbd19c0",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727182535614,
      },
      "e-106": {
        id: "e-106",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-6",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-105",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|0217f34b-deb0-521a-f058-00e64bbd19c0",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|0217f34b-deb0-521a-f058-00e64bbd19c0",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727182535614,
      },
      "e-107": {
        id: "e-107",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "SLIDE_EFFECT",
          instant: false,
          config: { actionListId: "slideInBottom", autoStopEventId: "e-108" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d457f306-7377-ad38-ea59-99915a7b4bd9",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d457f306-7377-ad38-ea59-99915a7b4bd9",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 40,
          direction: "BOTTOM",
          effectIn: true,
        },
        createdOn: 1727182900922,
      },
      "e-109": {
        id: "e-109",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "SLIDE_EFFECT",
          instant: false,
          config: { actionListId: "slideInBottom", autoStopEventId: "e-110" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|6cb336c6-036d-2584-d237-2b5dbd85bd74",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|6cb336c6-036d-2584-d237-2b5dbd85bd74",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 120,
          direction: "BOTTOM",
          effectIn: true,
        },
        createdOn: 1727182935290,
      },
      "e-113": {
        id: "e-113",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "SLIDE_EFFECT",
          instant: false,
          config: { actionListId: "slideInBottom", autoStopEventId: "e-114" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|859f8cfd-b4e0-96ad-2fbd-811fb69dd753",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|859f8cfd-b4e0-96ad-2fbd-811fb69dd753",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 40,
          direction: "BOTTOM",
          effectIn: true,
        },
        createdOn: 1727183025010,
      },
      "e-115": {
        id: "e-115",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "SLIDE_EFFECT",
          instant: false,
          config: { actionListId: "slideInBottom", autoStopEventId: "e-116" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|2f67d5e7-a909-5d07-ecd1-136ff12cb034",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|2f67d5e7-a909-5d07-ecd1-136ff12cb034",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 120,
          direction: "BOTTOM",
          effectIn: true,
        },
        createdOn: 1727183039065,
      },
      "e-117": {
        id: "e-117",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "SLIDE_EFFECT",
          instant: false,
          config: { actionListId: "slideInBottom", autoStopEventId: "e-118" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|a5b16a8c-b894-0808-1565-37eff82a93e6",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|a5b16a8c-b894-0808-1565-37eff82a93e6",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 240,
          direction: "BOTTOM",
          effectIn: true,
        },
        createdOn: 1727183054273,
      },
      "e-119": {
        id: "e-119",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-15",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-120",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|a9472a6a-79e4-ddd8-b411-5cc74eb412e5",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|a9472a6a-79e4-ddd8-b411-5cc74eb412e5",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727183175679,
      },
      "e-121": {
        id: "e-121",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-16",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-122",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0a",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0a",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727239521269,
      },
      "e-122": {
        id: "e-122",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-17",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-121",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0a",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24f72e185674bf59856ad|72d95833-335e-267f-2152-4a63c25bcc0a",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727239521270,
      },
      "e-123": {
        id: "e-123",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-16",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-124",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|dc67f0b8-04a3-5f39-b93b-36845ddaf62d",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|dc67f0b8-04a3-5f39-b93b-36845ddaf62d",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727241049091,
      },
      "e-124": {
        id: "e-124",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-17",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-123",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f24e45917b5eb560bce38f|dc67f0b8-04a3-5f39-b93b-36845ddaf62d",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f24e45917b5eb560bce38f|dc67f0b8-04a3-5f39-b93b-36845ddaf62d",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727241049092,
      },
      "e-125": {
        id: "e-125",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-16",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-126",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec3",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec3",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727241171759,
      },
      "e-126": {
        id: "e-126",
        name: "",
        animationType: "custom",
        eventTypeId: "MOUSE_OUT",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-17",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-125",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec3",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|d8a48679-e498-c871-41a1-af4881a11ec3",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727241171760,
      },
      "e-127": {
        id: "e-127",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-18",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-128",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f1181b2c4aa4290cc38433|ce2bcf24-23eb-2d2e-a045-fc148858ebb7",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f1181b2c4aa4290cc38433|ce2bcf24-23eb-2d2e-a045-fc148858ebb7",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727244583142,
      },
      "e-129": {
        id: "e-129",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-19",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-130",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "fb947086-6857-0de0-9836-e681ef10ff2a",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "fb947086-6857-0de0-9836-e681ef10ff2a",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727244663468,
      },
      "e-131": {
        id: "e-131",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-18",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-132",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f242e76507371d839146ca|7e1299a9-835d-927b-7e69-b09ff827a0ba",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f242e76507371d839146ca|7e1299a9-835d-927b-7e69-b09ff827a0ba",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727244867718,
      },
      "e-133": {
        id: "e-133",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-18",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-134",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|6e46c7cb-3135-c286-fcc5-c4a693e50c7d",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|6e46c7cb-3135-c286-fcc5-c4a693e50c7d",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727244890917,
      },
      "e-135": {
        id: "e-135",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-19",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-136",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "8faa0133-4fcf-d0af-1c4c-eaa2c3d499e9",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "8faa0133-4fcf-d0af-1c4c-eaa2c3d499e9",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727244909341,
      },
      "e-139": {
        id: "e-139",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "FLY_EFFECT",
          instant: false,
          config: { actionListId: "flyInRight", autoStopEventId: "e-140" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|1d760040-e543-564c-6f1a-62bcc4e0ed29",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|1d760040-e543-564c-6f1a-62bcc4e0ed29",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 60,
          direction: "RIGHT",
          effectIn: true,
        },
        createdOn: 1727245045331,
      },
      "e-143": {
        id: "e-143",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "FLY_EFFECT",
          instant: false,
          config: { actionListId: "flyInRight", autoStopEventId: "e-144" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|a4e88676-393f-e1f8-9ef7-ae9579d4eb09",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|a4e88676-393f-e1f8-9ef7-ae9579d4eb09",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 110,
          direction: "RIGHT",
          effectIn: true,
        },
        createdOn: 1727245070131,
      },
      "e-145": {
        id: "e-145",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "FLY_EFFECT",
          instant: false,
          config: { actionListId: "flyInRight", autoStopEventId: "e-146" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|4d26af2d-a928-a8f5-c51b-047d1fa6d1ea",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|4d26af2d-a928-a8f5-c51b-047d1fa6d1ea",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 160,
          direction: "RIGHT",
          effectIn: true,
        },
        createdOn: 1727245085930,
      },
      "e-147": {
        id: "e-147",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "FLY_EFFECT",
          instant: false,
          config: { actionListId: "flyInRight", autoStopEventId: "e-148" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|9243e9cf-f1af-2880-6d12-6c0031db8678",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|9243e9cf-f1af-2880-6d12-6c0031db8678",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 220,
          direction: "RIGHT",
          effectIn: true,
        },
        createdOn: 1727245098922,
      },
      "e-149": {
        id: "e-149",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "BOUNCE_EFFECT",
          instant: false,
          config: { actionListId: "bounce", autoStopEventId: "e-150" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|7901f256-5a0e-2d97-2250-0ce171ede31e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|7901f256-5a0e-2d97-2250-0ce171ede31e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: 0,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727245168763,
      },
      "e-151": {
        id: "e-151",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "BOUNCE_EFFECT",
          instant: false,
          config: { actionListId: "bounce", autoStopEventId: "e-152" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|1d760040-e543-564c-6f1a-62bcc4e0ed29",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|1d760040-e543-564c-6f1a-62bcc4e0ed29",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: 0,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727245229053,
      },
      "e-153": {
        id: "e-153",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "BOUNCE_EFFECT",
          instant: false,
          config: { actionListId: "bounce", autoStopEventId: "e-154" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|a4e88676-393f-e1f8-9ef7-ae9579d4eb09",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|a4e88676-393f-e1f8-9ef7-ae9579d4eb09",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: 0,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727245235403,
      },
      "e-155": {
        id: "e-155",
        name: "",
        animationType: "preset",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "FLY_EFFECT",
          instant: false,
          config: { actionListId: "flyInRight", autoStopEventId: "e-156" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|7901f256-5a0e-2d97-2250-0ce171ede31e",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|7901f256-5a0e-2d97-2250-0ce171ede31e",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 20,
          scrollOffsetUnit: "%",
          delay: 20,
          direction: "RIGHT",
          effectIn: true,
        },
        createdOn: 1727245243971,
      },
      "e-157": {
        id: "e-157",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "BOUNCE_EFFECT",
          instant: false,
          config: { actionListId: "bounce", autoStopEventId: "e-158" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|4d26af2d-a928-a8f5-c51b-047d1fa6d1ea",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|4d26af2d-a928-a8f5-c51b-047d1fa6d1ea",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: 0,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727245259482,
      },
      "e-159": {
        id: "e-159",
        name: "",
        animationType: "preset",
        eventTypeId: "MOUSE_OVER",
        action: {
          id: "",
          actionTypeId: "BOUNCE_EFFECT",
          instant: false,
          config: { actionListId: "bounce", autoStopEventId: "e-160" },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "66f25d374f3985abb1508c9f|9243e9cf-f1af-2880-6d12-6c0031db8678",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "66f25d374f3985abb1508c9f|9243e9cf-f1af-2880-6d12-6c0031db8678",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: null,
          scrollOffsetUnit: null,
          delay: 0,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727245266437,
      },
      "e-161": {
        id: "e-161",
        name: "",
        animationType: "custom",
        eventTypeId: "SCROLL_INTO_VIEW",
        action: {
          id: "",
          actionTypeId: "GENERAL_START_ACTION",
          config: {
            delay: 0,
            easing: "",
            duration: 0,
            actionListId: "a-18",
            affectedElements: {},
            playInReverse: false,
            autoStopEventId: "e-162",
          },
        },
        mediaQueries: ["main", "medium", "small", "tiny"],
        target: {
          id: "665461fa57cc645033f62920|1595b7f9-220a-fc31-b0ad-b4f51c61b50c",
          appliesTo: "ELEMENT",
          styleBlockIds: [],
        },
        targets: [
          {
            id: "665461fa57cc645033f62920|1595b7f9-220a-fc31-b0ad-b4f51c61b50c",
            appliesTo: "ELEMENT",
            styleBlockIds: [],
          },
        ],
        config: {
          loop: false,
          playInReverse: false,
          scrollOffsetValue: 0,
          scrollOffsetUnit: "%",
          delay: null,
          direction: null,
          effectIn: null,
        },
        createdOn: 1727245660445,
      },
    },
    actionLists: {
      a: {
        id: "a",
        title: "Navbar Open",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".top-line",
                    selectorGuids: ["d2b89b4d-7488-1fea-e40f-9e3d363c8e26"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
              {
                id: "a-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".bottom-line",
                    selectorGuids: ["4b931124-64f5-4b1d-a7b8-0bf8a9d64374"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
              {
                id: "a-n-3",
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".center-line",
                    selectorGuids: ["0050d4a2-585a-5eeb-463c-c24b8ff52313"],
                  },
                  value: 1,
                  unit: "",
                },
              },
              {
                id: "a-n-4",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".top-line",
                    selectorGuids: ["d2b89b4d-7488-1fea-e40f-9e3d363c8e26"],
                  },
                  zValue: 0,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
              {
                id: "a-n-5",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".bottom-line",
                    selectorGuids: ["4b931124-64f5-4b1d-a7b8-0bf8a9d64374"],
                  },
                  zValue: 0,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-n-6",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".top-line",
                    selectorGuids: ["d2b89b4d-7488-1fea-e40f-9e3d363c8e26"],
                  },
                  yValue: 7,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
              {
                id: "a-n-10",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".bottom-line",
                    selectorGuids: ["4b931124-64f5-4b1d-a7b8-0bf8a9d64374"],
                  },
                  zValue: 45,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
              {
                id: "a-n-9",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".top-line",
                    selectorGuids: ["d2b89b4d-7488-1fea-e40f-9e3d363c8e26"],
                  },
                  zValue: -45,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
              {
                id: "a-n-8",
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".center-line",
                    selectorGuids: ["0050d4a2-585a-5eeb-463c-c24b8ff52313"],
                  },
                  value: 0,
                  unit: "",
                },
              },
              {
                id: "a-n-7",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".bottom-line",
                    selectorGuids: ["4b931124-64f5-4b1d-a7b8-0bf8a9d64374"],
                  },
                  yValue: -7,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1726900816592,
      },
      "a-2": {
        id: "a-2",
        title: "Navbar Close",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-2-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".top-line",
                    selectorGuids: ["d2b89b4d-7488-1fea-e40f-9e3d363c8e26"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
              {
                id: "a-2-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".bottom-line",
                    selectorGuids: ["4b931124-64f5-4b1d-a7b8-0bf8a9d64374"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
              {
                id: "a-2-n-3",
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".center-line",
                    selectorGuids: ["0050d4a2-585a-5eeb-463c-c24b8ff52313"],
                  },
                  value: 1,
                  unit: "",
                },
              },
              {
                id: "a-2-n-4",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".top-line",
                    selectorGuids: ["d2b89b4d-7488-1fea-e40f-9e3d363c8e26"],
                  },
                  zValue: 0,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
              {
                id: "a-2-n-5",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".bottom-line",
                    selectorGuids: ["4b931124-64f5-4b1d-a7b8-0bf8a9d64374"],
                  },
                  zValue: 0,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1726900816592,
      },
      "a-3": {
        id: "a-3",
        title: "Nav Link Hover In",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-3-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".nav-text",
                    selectorGuids: ["5b0060d4-373d-92b7-5df3-d3ada2960ca9"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
              {
                id: "a-3-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".nav-link-text",
                    selectorGuids: ["7de4325b-de8c-6221-5fab-74d527d226e0"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-3-n-3",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 200,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".nav-text",
                    selectorGuids: ["5b0060d4-373d-92b7-5df3-d3ada2960ca9"],
                  },
                  yValue: -100,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
              {
                id: "a-3-n-4",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 200,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".nav-link-text",
                    selectorGuids: ["7de4325b-de8c-6221-5fab-74d527d226e0"],
                  },
                  yValue: -100,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1726900967555,
      },
      "a-4": {
        id: "a-4",
        title: "Nav Link Hover Out",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-4-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".nav-text",
                    selectorGuids: ["5b0060d4-373d-92b7-5df3-d3ada2960ca9"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
              {
                id: "a-4-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".nav-link-text",
                    selectorGuids: ["7de4325b-de8c-6221-5fab-74d527d226e0"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1726900967555,
      },
      "a-5": {
        id: "a-5",
        title: "Button Hover In",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-5-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".btn-text",
                    selectorGuids: ["596c2ee7-2956-1d2f-9eb5-8b447407d09e"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
              {
                id: "a-5-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".hover-text",
                    selectorGuids: ["9489a874-1632-9bf6-1326-f4df145233c6"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-5-n-3",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 200,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".btn-text",
                    selectorGuids: ["596c2ee7-2956-1d2f-9eb5-8b447407d09e"],
                  },
                  yValue: -100,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
              {
                id: "a-5-n-4",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 200,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".hover-text",
                    selectorGuids: ["9489a874-1632-9bf6-1326-f4df145233c6"],
                  },
                  yValue: -100,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1727069129149,
      },
      "a-6": {
        id: "a-6",
        title: "Button Hover Out",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-6-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 200,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".btn-text",
                    selectorGuids: ["596c2ee7-2956-1d2f-9eb5-8b447407d09e"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
              {
                id: "a-6-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 200,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".hover-text",
                    selectorGuids: ["9489a874-1632-9bf6-1326-f4df145233c6"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1727069129149,
      },
      "a-7": {
        id: "a-7",
        title: "FAQ Open",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-7-n",
                actionTypeId: "STYLE_SIZE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".ans",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f0"],
                  },
                  heightValue: 0,
                  widthUnit: "PX",
                  heightUnit: "px",
                  locked: false,
                },
              },
              {
                id: "a-7-n-2",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que-icon",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f6"],
                  },
                  zValue: 0,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
              {
                id: "a-7-n-3",
                actionTypeId: "STYLE_BORDER",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f4"],
                  },
                  globalSwatchId: "",
                  rValue: 0,
                  bValue: 0,
                  gValue: 0,
                  aValue: 0.1,
                },
              },
              {
                id: "a-7-n-7",
                actionTypeId: "STYLE_BACKGROUND_COLOR",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f4"],
                  },
                  globalSwatchId: "",
                  rValue: 0,
                  bValue: 0,
                  gValue: 0,
                  aValue: 0,
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-7-n-4",
                actionTypeId: "STYLE_SIZE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".ans",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f0"],
                  },
                  widthUnit: "PX",
                  heightUnit: "AUTO",
                  locked: false,
                },
              },
              {
                id: "a-7-n-5",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que-icon",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f6"],
                  },
                  zValue: 45,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
              {
                id: "a-7-n-6",
                actionTypeId: "STYLE_BORDER",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f4"],
                  },
                  globalSwatchId: "",
                  rValue: 0,
                  bValue: 0,
                  gValue: 0,
                  aValue: 1,
                },
              },
              {
                id: "a-7-n-8",
                actionTypeId: "STYLE_BACKGROUND_COLOR",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f4"],
                  },
                  globalSwatchId: "--bg",
                  rValue: 247,
                  bValue: 247,
                  gValue: 247,
                  aValue: 1,
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1710417191020,
      },
      "a-8": {
        id: "a-8",
        title: "FAQ Close",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-8-n",
                actionTypeId: "STYLE_SIZE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".ans",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f0"],
                  },
                  heightValue: 0,
                  widthUnit: "PX",
                  heightUnit: "px",
                  locked: false,
                },
              },
              {
                id: "a-8-n-2",
                actionTypeId: "TRANSFORM_ROTATE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que-icon",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f6"],
                  },
                  zValue: 0,
                  xUnit: "DEG",
                  yUnit: "DEG",
                  zUnit: "deg",
                },
              },
              {
                id: "a-8-n-3",
                actionTypeId: "STYLE_BORDER",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f4"],
                  },
                  globalSwatchId: "",
                  rValue: 0,
                  bValue: 0,
                  gValue: 0,
                  aValue: 0.1,
                },
              },
              {
                id: "a-8-n-4",
                actionTypeId: "STYLE_BACKGROUND_COLOR",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".que",
                    selectorGuids: ["08ee5675-c69f-117b-8344-9cd1107ea1f4"],
                  },
                  globalSwatchId: "",
                  rValue: 0,
                  bValue: 0,
                  gValue: 0,
                  aValue: 0,
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1710417191020,
      },
      "a-9": {
        id: "a-9",
        title: "Post Hover In",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-9-n",
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".post-image",
                    selectorGuids: ["fec2825c-632a-f2b0-3483-61e4156fe1dc"],
                  },
                  xValue: 1,
                  yValue: 1,
                  locked: true,
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-9-n-2",
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".post-image",
                    selectorGuids: ["fec2825c-632a-f2b0-3483-61e4156fe1dc"],
                  },
                  xValue: 1.03,
                  yValue: 1.03,
                  locked: true,
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1727151747647,
      },
      "a-10": {
        id: "a-10",
        title: "Post Hover Out",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-10-n",
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".post-image",
                    selectorGuids: ["fec2825c-632a-f2b0-3483-61e4156fe1dc"],
                  },
                  xValue: 1,
                  yValue: 1,
                  locked: true,
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1727151747647,
      },
      "a-11": {
        id: "a-11",
        title: "Work Hover In (Cursor)",
        continuousParameterGroups: [
          {
            id: "a-11-p",
            type: "MOUSE_X",
            parameterLabel: "Mouse X",
            continuousActionGroups: [
              {
                keyframe: 0,
                actionItems: [
                  {
                    id: "a-11-n",
                    actionTypeId: "TRANSFORM_MOVE",
                    config: {
                      delay: 0,
                      easing: "",
                      duration: 500,
                      target: {
                        useEventTarget: "CHILDREN",
                        selector: ".view-cursor",
                        selectorGuids: ["d4cff82a-4b3f-ff17-1f90-f1594cb37222"],
                      },
                      xValue: -18,
                      xUnit: "vw",
                      yUnit: "PX",
                      zUnit: "PX",
                    },
                  },
                ],
              },
              {
                keyframe: 100,
                actionItems: [
                  {
                    id: "a-11-n-2",
                    actionTypeId: "TRANSFORM_MOVE",
                    config: {
                      delay: 0,
                      easing: "",
                      duration: 500,
                      target: {
                        useEventTarget: "CHILDREN",
                        selector: ".view-cursor",
                        selectorGuids: ["d4cff82a-4b3f-ff17-1f90-f1594cb37222"],
                      },
                      xValue: 18,
                      xUnit: "vw",
                      yUnit: "PX",
                      zUnit: "PX",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "a-11-p-2",
            type: "MOUSE_Y",
            parameterLabel: "Mouse Y",
            continuousActionGroups: [
              {
                keyframe: 0,
                actionItems: [
                  {
                    id: "a-11-n-3",
                    actionTypeId: "TRANSFORM_MOVE",
                    config: {
                      delay: 0,
                      easing: "",
                      duration: 500,
                      target: {
                        useEventTarget: "CHILDREN",
                        selector: ".view-cursor",
                        selectorGuids: ["d4cff82a-4b3f-ff17-1f90-f1594cb37222"],
                      },
                      yValue: -26,
                      xUnit: "PX",
                      yUnit: "vh",
                      zUnit: "PX",
                    },
                  },
                ],
              },
              {
                keyframe: 100,
                actionItems: [
                  {
                    id: "a-11-n-4",
                    actionTypeId: "TRANSFORM_MOVE",
                    config: {
                      delay: 0,
                      easing: "",
                      duration: 500,
                      target: {
                        useEventTarget: "CHILDREN",
                        selector: ".view-cursor",
                        selectorGuids: ["d4cff82a-4b3f-ff17-1f90-f1594cb37222"],
                      },
                      yValue: 26,
                      xUnit: "PX",
                      yUnit: "vh",
                      zUnit: "PX",
                    },
                  },
                ],
              },
            ],
          },
        ],
        createdOn: 1721213937589,
      },
      "a-12": {
        id: "a-12",
        title: "Work Image Hover In",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-12-n",
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".view-cursor",
                    selectorGuids: ["d4cff82a-4b3f-ff17-1f90-f1594cb37222"],
                  },
                  value: 0,
                  unit: "",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-12-n-2",
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 600,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".view-cursor",
                    selectorGuids: ["d4cff82a-4b3f-ff17-1f90-f1594cb37222"],
                  },
                  value: 1,
                  unit: "",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1721200405204,
      },
      "a-13": {
        id: "a-13",
        title: "Work Image Hover Out",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-13-n",
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".view-cursor",
                    selectorGuids: ["d4cff82a-4b3f-ff17-1f90-f1594cb37222"],
                  },
                  value: 0,
                  unit: "",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1721200405204,
      },
      "a-14": {
        id: "a-14",
        title: "Contact Logo Animation",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-14-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 20000,
                  target: { id: "8faa0133-4fcf-d0af-1c4c-eaa2c3d49a03" },
                  xValue: -560,
                  xUnit: "px",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-14-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  target: { id: "8faa0133-4fcf-d0af-1c4c-eaa2c3d49a03" },
                  xValue: 0,
                  xUnit: "px",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1725626724161,
      },
      "a-15": {
        id: "a-15",
        title: "Hero Image Animation",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-15-n",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".hero-image",
                    selectorGuids: ["28372d14-eba7-e5d4-42d9-7245664ff88f"],
                  },
                  yValue: 30,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-15-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".hero-image",
                    selectorGuids: ["28372d14-eba7-e5d4-42d9-7245664ff88f"],
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "px",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1727183177980,
      },
      "a-16": {
        id: "a-16",
        title: "Work Hover In",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-16-n",
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 500,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".work-image",
                    selectorGuids: ["fbca2800-373d-ac62-8945-78ea41a5c0ad"],
                  },
                  xValue: 1,
                  yValue: 1,
                  locked: true,
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-16-n-2",
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".work-image",
                    selectorGuids: ["fbca2800-373d-ac62-8945-78ea41a5c0ad"],
                  },
                  xValue: 1.02,
                  yValue: 1.02,
                  locked: true,
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1727239524323,
      },
      "a-17": {
        id: "a-17",
        title: "Work Hover Out",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-17-n",
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 300,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".work-image",
                    selectorGuids: ["fbca2800-373d-ac62-8945-78ea41a5c0ad"],
                  },
                  xValue: 1,
                  yValue: 1,
                  locked: true,
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: false,
        createdOn: 1727239524323,
      },
      "a-18": {
        id: "a-18",
        title: "On Scroll (Top)",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-18-n",
                actionTypeId: "GENERAL_DISPLAY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".on-scroll",
                    selectorGuids: ["7525cd69-f73b-5085-5e38-a1fccfc80888"],
                  },
                  value: "flex",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-18-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 300,
                  easing: [0.789, 0.205, 0.287, 1.007],
                  duration: 1000,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".on-scroll",
                    selectorGuids: ["7525cd69-f73b-5085-5e38-a1fccfc80888"],
                  },
                  yValue: -100,
                  xUnit: "PX",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1727244587990,
      },
      "a-19": {
        id: "a-19",
        title: "On Scroll (Left)",
        actionItemGroups: [
          {
            actionItems: [
              {
                id: "a-19-n",
                actionTypeId: "GENERAL_DISPLAY",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".on-scroll",
                    selectorGuids: ["7525cd69-f73b-5085-5e38-a1fccfc80888"],
                  },
                  value: "flex",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                id: "a-19-n-2",
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 300,
                  easing: [0.789, 0.205, 0.287, 1.007],
                  duration: 1000,
                  target: {
                    useEventTarget: "CHILDREN",
                    selector: ".on-scroll",
                    selectorGuids: ["7525cd69-f73b-5085-5e38-a1fccfc80888"],
                  },
                  xValue: -100,
                  yValue: null,
                  xUnit: "%",
                  yUnit: "%",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
        useFirstGroupAsInitialState: true,
        createdOn: 1727244587990,
      },
      slideInBottom: {
        id: "slideInBottom",
        useFirstGroupAsInitialState: true,
        actionItemGroups: [
          {
            actionItems: [
              {
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  duration: 0,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  value: 0,
                },
              },
            ],
          },
          {
            actionItems: [
              {
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  duration: 0,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  xValue: 0,
                  yValue: 100,
                  xUnit: "PX",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "outQuart",
                  duration: 1000,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  xValue: 0,
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
              {
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "outQuart",
                  duration: 1000,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  value: 1,
                },
              },
            ],
          },
        ],
      },
      flyInRight: {
        id: "flyInRight",
        useFirstGroupAsInitialState: true,
        actionItemGroups: [
          {
            actionItems: [
              {
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  duration: 0,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  value: 0,
                },
              },
            ],
          },
          {
            actionItems: [
              {
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  duration: 0,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  xValue: 800,
                  xUnit: "PX",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
              {
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  duration: 0,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  xValue: 0.25,
                  yValue: 0.25,
                },
              },
            ],
          },
          {
            actionItems: [
              {
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "outQuart",
                  duration: 1000,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  xValue: 0,
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
              {
                actionTypeId: "TRANSFORM_SCALE",
                config: {
                  delay: 0,
                  easing: "inOutQuart",
                  duration: 1000,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  xValue: 1,
                  yValue: 1,
                },
              },
              {
                actionTypeId: "STYLE_OPACITY",
                config: {
                  delay: 0,
                  easing: "outQuart",
                  duration: 1000,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  value: 1,
                },
              },
            ],
          },
        ],
      },
      bounce: {
        id: "bounce",
        actionItemGroups: [
          {
            actionItems: [
              {
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "outQuart",
                  duration: 250,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  yValue: -100,
                  xUnit: "PX",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
            ],
          },
          {
            actionItems: [
              {
                actionTypeId: "TRANSFORM_MOVE",
                config: {
                  delay: 0,
                  easing: "outBounce",
                  duration: 1000,
                  target: {
                    id: "N/A",
                    appliesTo: "TRIGGER_ELEMENT",
                    useEventTarget: true,
                  },
                  yValue: 0,
                  xUnit: "PX",
                  yUnit: "PX",
                  zUnit: "PX",
                },
              },
            ],
          },
        ],
      },
    },
    site: {
      mediaQueries: [
        { key: "main", min: 992, max: 10000 },
        { key: "medium", min: 768, max: 991 },
        { key: "small", min: 480, max: 767 },
        { key: "tiny", min: 0, max: 479 },
      ],
    },
  });
  