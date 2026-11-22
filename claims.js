/* QInsight — Claims tab: local & outstation conveyance claims, advance requests.
   Loaded by index.html; talks to the same backend through window.QTS (token, api, storage). */
(function () {
  'use strict';
  var Q = null;                       // bridge from index.html
  var $ = function (id) { return document.getElementById(id); };
  var root, bar, view = 'home', curId = null, busy = false, openPanel = null;

  // ---------- styles ----------
  var css = '' +
    '.cl-h{display:flex;align-items:center;gap:10px;margin:2px 0 12px}.cl-h h2{margin:0;font-size:19px;color:var(--navy);flex:1}' +
    '.cl-back{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 12px;font-weight:700;color:var(--navy)}' +
    '.cl-new{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:14px}' +
    '.cl-new button{display:flex;align-items:center;gap:12px;text-align:left;border:1px solid #e6ebf0;background:#fff;border-radius:12px;padding:12px 14px;box-shadow:-3px 3px 13px rgba(0,0,0,.05);color:var(--ink)}' +
    '.cl-new button i{font-style:normal;width:38px;height:38px;border-radius:10px;background:#eef2f6;display:grid;place-items:center;font-size:20px;flex:none}' +
    '.cl-new b{display:block;color:var(--navy);font-size:15px}.cl-new small{color:var(--muted);font-size:12.5px}' +
    '.cl-sec{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:16px 2px 6px}' +
    '.cl-list .row{display:flex;align-items:center;gap:10px;padding:11px 12px;border-top:1px solid var(--line);cursor:pointer}' +
    '.cl-list .row:first-child{border-top:0}.cl-list .row .g{flex:1;min-width:0}' +
    '.cl-list .row b{display:block;color:var(--navy);font-size:14.5px}.cl-list .row small{display:block;color:var(--muted);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.cl-list .amt{font-weight:700;font-size:13.5px;color:var(--ink);text-align:right;white-space:nowrap}' +
    '.st{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 8px;margin-top:3px}' +
    '.st-p{background:#fff5df;color:#7a5508}.st-a{background:#e8f1fb;color:#174f86}.st-r{background:#fdecea;color:#8e2a1f}.st-d{background:#e7f6ef;color:#17694a}.st-dr{background:#eef2f6;color:#3d5164}.st-w{background:#f1eef6;color:#5b4a7a}' +
    '.cl-det{padding:4px 12px 12px;border-top:1px dashed var(--line);background:#fbfcfd;font-size:13.5px}' +
    '.cl-det table{width:100%;border-collapse:collapse;margin:6px 0}.cl-det td{padding:4px 0;vertical-align:top}.cl-det td:last-child{text-align:right;font-weight:700}' +
    '.cl-det .cm{background:#fff8f3;border-left:4px solid var(--orange);padding:8px 10px;margin:6px 0;border-radius:4px}' +
    '.cl-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.cl-acts button,.cl-acts a{flex:1;text-align:center;text-decoration:none;border:1px solid var(--navy);background:#fff;color:var(--navy);border-radius:10px;padding:9px 10px;font-weight:700;font-size:14px}' +
    '.cl-acts .pri{background:var(--navy);color:#fff}.cl-acts .del{border-color:#d9a3a3;color:#a33}.cl-acts .wd{border-color:#c98a8a;color:#a33}' +
    '.cl-card{background:#fff;border:1px solid #e6ebf0;border-radius:12px;box-shadow:-3px 3px 13px rgba(0,0,0,.05);padding:12px;margin-bottom:12px}' +
    '.cl-card>h3{margin:0 0 10px;font-size:15px;color:var(--navy);display:flex;align-items:center;gap:8px}.cl-card>h3 span{flex:1}' +
    '.cl-card>h3 button{border:0;background:#f3f5f8;color:#a33;border-radius:8px;width:32px;height:32px;font-size:18px;line-height:1}' +
    '.cl-card.visit{border-left:5px solid var(--teal2)}.cl-card.trip{border-left:5px solid var(--orange)}' +
    '.f{display:block;margin:0 0 10px}.f>span{display:block;font-size:12.5px;font-weight:700;color:#3d5164;margin-bottom:4px}' +
    '.f input,.f select,.f textarea{width:100%;border:1px solid var(--line);border-radius:9px;padding:9px 10px;font:inherit;font-size:15px;background:#fff;color:var(--ink);min-height:40px}' +
    '.f textarea{resize:vertical;min-height:58px}.f input:focus,.f select:focus,.f textarea:focus{outline:none;border-color:var(--teal2)}' +
    '.f.bad input,.f.bad select,.f.bad textarea,.seg.bad{border-color:#d64545!important;background:#fff6f6}' +
    '.two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.two .f{margin-bottom:10px}' +
    '.seg{display:flex;gap:6px;border-radius:10px}.seg button{flex:1;border:1px solid var(--line);background:#fff;border-radius:9px;padding:9px 6px;font-weight:700;font-size:14px;color:var(--navy)}' +
    '.seg button.on{background:var(--navy);border-color:var(--navy);color:#fff}' +
    '.cust{display:flex;gap:6px;margin-bottom:6px}.cust input{flex:1}.x{border:1px solid var(--line);background:#fff;color:#a33;border-radius:9px;width:40px;flex:none;font-size:17px}' +
    '.plus{border:1px dashed #9fb3c4;background:#f8fafc;color:var(--teal2);border-radius:9px;padding:8px 12px;font-weight:700;font-size:14px;width:100%}' +
    '.plus.big{padding:12px;font-size:15px;margin-bottom:12px;background:#fff}' +
    '.ln{border:1px solid #e9eef3;border-radius:10px;padding:8px;margin-bottom:8px;background:#fbfcfd}' +
    '.ln .row1{display:flex;gap:6px}.ln .row1 input{border:1px solid var(--line);border-radius:8px;padding:8px 9px;font:inherit;font-size:14.5px;min-width:0;background:#fff}' +
    '.ln .det{flex:1}.ln .am{width:110px;text-align:right}.ln .dt{width:150px;border:1px solid var(--line);border-radius:8px;padding:6px 8px;font:inherit;font-size:13.5px;background:#fff;min-height:34px;color:var(--ink)}' +
    '.ln .row2{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}' +
    '.att{border:1px solid #c9d6e1;background:#fff;border-radius:8px;padding:6px 10px;font-size:13px;font-weight:700;color:var(--teal2)}' +
    '.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #dfe6ec;background:#fff;border-radius:8px;padding:3px 4px 3px 3px;font-size:12px;max-width:180px}' +
    '.chip img,.chip em{width:30px;height:30px;border-radius:6px;object-fit:cover;flex:none;background:#eef2f6;display:grid;place-items:center;font-style:normal;font-size:10px;font-weight:700;color:#a33}' +
    '.chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.chip button{border:0;background:transparent;color:#a33;font-size:15px;padding:0 4px}' +
    '.hint{font-size:12px;color:var(--muted);margin:-4px 0 8px}.hint.adv{color:#8a5a00}' +
    '.head{border-top:1px solid var(--line)}.head:first-of-type{border-top:0}' +
    '.head>button{display:flex;width:100%;align-items:center;gap:8px;border:0;background:transparent;padding:10px 2px;text-align:left;color:var(--navy);font-weight:700;font-size:14px}' +
    '.head>button span{flex:1}.head>button small{color:var(--muted);font-weight:600}.head>button em{font-style:normal;color:var(--teal2)}' +
    '.head .body{padding:0 0 8px}' +
    '.sum table{border-collapse:collapse}.sum td{padding:5px 0;font-size:14px}.sum td:last-child{text-align:right;white-space:nowrap;font-weight:700}.sum tr.tot td{border-top:2px solid var(--navy);font-size:16px;color:var(--navy);padding-top:8px}' +
    '.sum tr.net td{color:var(--orange);font-size:16px}' +
    '.banner{border-radius:10px;padding:10px 12px;font-size:13.5px;margin-bottom:12px}.banner.warn{background:#fff5df;color:#7a5508}.banner.err{background:#fdecea;color:#8e2a1f}.banner.ok{background:#e7f6ef;color:#17694a}.banner.info{background:#eef4f8;color:#2c5566}' +
    '.adv label{display:flex;align-items:center;gap:10px;padding:8px 2px;border-top:1px solid var(--line);font-size:14px}.adv label:first-child{border-top:0}.adv input{width:20px;height:20px;accent-color:var(--navy)}' +
    '.ts label{display:flex;gap:10px;align-items:flex-start;padding:9px 2px;border-top:1px solid var(--line);font-size:14px}.ts label:first-child{border-top:0}.ts input{width:20px;height:20px;margin-top:2px;accent-color:var(--navy)}' +
    '.ts label.dis{opacity:.5}.ts small{display:block;color:var(--muted);font-size:12.5px}' +
    '.kmrow{display:flex;align-items:center;gap:10px;margin-bottom:8px}.kmrow b{flex:1;color:var(--navy)}.kmrow input{width:130px;border:1px solid var(--line);border-radius:9px;padding:9px;font:inherit;text-align:right}' +
    '#cbar{position:fixed;left:0;right:0;bottom:0;z-index:6;background:rgba(255,255,255,.97);border-top:1px solid var(--line);padding:10px 12px calc(10px + env(safe-area-inset-bottom))}' +
    '#cbar .wrap{display:flex;align-items:center;gap:12px}#cbar .t{flex:1;font-size:13px;color:var(--muted)}#cbar .t b{display:block;color:var(--navy);font-size:17px}' +
    '#cbar button{border:0;border-radius:12px;background:var(--orange);color:#fff;font-weight:700;font-size:16px;padding:13px 20px;min-width:150px}#cbar button:disabled{opacity:.6}' +
    '.empty{padding:18px;text-align:center;color:var(--muted);font-size:14px}';
  function injectCss() { if ($('cl-css')) return; var s = document.createElement('style'); s.id = 'cl-css'; s.textContent = css; document.head.appendChild(s); }

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
  function num(v) { var n = Number(String(v == null ? '' : v).replace(/[, ₹]/g, '')); return isFinite(n) ? n : 0; }
  function r2(n) { return Math.round(n * 100) / 100; }
  function amt(n, cur) {
    n = r2(n); var neg = n < 0; n = Math.abs(n);
    var s = n.toFixed(2).replace(/\.00$/, ''), p = s.split('.'), x = p[0];
    if (!cur || cur === 'INR') { var l3 = x.slice(-3), rest = x.slice(0, -3); if (rest) l3 = ',' + l3; x = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + l3; }
    else x = x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + x + (p[1] ? '.' + p[1] : '');
  }
  function money(n, cur) { return (cur === 'INR' || !cur ? '₹ ' : cur + ' ') + amt(n, cur); }
  function moneyObj(o) {
    var ks = Object.keys(o || {}).filter(function (k) { return r2(o[k]) !== 0; });
    if (!ks.length) return '₹ 0';
    var order = ccfg().currencies || ['INR'];
    ks.sort(function (a, b) { return (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99); });
    return ks.map(function (k) { return money(o[k], k); }).join(' + ');
  }
  function addTo(o, k, n) { o[k] = r2((o[k] || 0) + n); return o; }
  function S() { return Q.S(); }
  function ccfg() { return S().claimsCfg || { currencies: ['INR', 'AED', 'USD'], modes: ['Bus', 'Train', 'Flight', 'Own car', 'Bike', 'Taxi', 'Other'], localModes: ['Bike', 'Car', 'Public transport'], heads: HEADS, full: 80, half: 40, night: 200, maxMB: 8, today: Q.today(), fyStart: fyStartOf(Q.today()), minDate: prevFy(Q.today()), advances: [] }; }
  var HEADS = [['toBoarding', 'Office / residence to boarding point'], ['travel', 'Travel'], ['arrivalToStay', 'Point of arrival to place of accommodation'], ['stayToWork', 'Accommodation to place of work'], ['stay', 'Accommodation'], ['meals', 'Meals'], ['local', 'Local travel (including travel for departure)'], ['oop', 'Other out-of-pocket expenses']];
  function heads() { return ccfg().heads || HEADS; }
  function fyStartOf(d) { var y = +d.slice(0, 4), m = +d.slice(5, 7); return (m >= 4 ? y : y - 1) + '-04-01'; }
  function prevFy(d) { return (+fyStartOf(d).slice(0, 4) - 1) + '-04-01'; }
  function today() { return Q.today(); }
  function pretty(s) { return s ? Q.pretty(s) : ''; }
  function span(a, b) { if (!a) return ''; return (!b || a === b) ? pretty(a) : pretty(a) + ' – ' + pretty(b); }
  function dnum(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5; }
  function store() { var s = S(); s.claimDrafts = s.claimDrafts || {}; return s; }
  function drafts() { return store().claimDrafts; }
  function save() { var d = draft(); if (d) d.updatedAt = Date.now(); Q.persist(); }
  function draft() { return curId ? drafts()[curId] : null; }
  function online() { return navigator.onLine !== false; }

  // ---------- IndexedDB for receipt files (localStorage is too small) ----------
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      var rq = indexedDB.open('qts-claims', 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore('files'); };
      rq.onsuccess = function () { res(rq.result); }; rq.onerror = function () { rej(rq.error); };
    });
    return dbp;
  }
  function idb(mode, fn) { return db().then(function (d) { return new Promise(function (res, rej) { var tx = d.transaction('files', mode), st = tx.objectStore('files'), r = fn(st); tx.oncomplete = function () { res(r && r.result); }; tx.onerror = function () { rej(tx.error); }; }); }); }
  function putFile(lid, blob) { return idb('readwrite', function (st) { return st.put(blob, lid); }); }
  function getFile(lid) { return idb('readonly', function (st) { return st.get(lid); }); }
  function delFile(lid) { return idb('readwrite', function (st) { return st.delete(lid); }).catch(function () {}); }
  var urlCache = {};
  function thumbUrl(ref) {
    if (urlCache[ref.lid]) return Promise.resolve(urlCache[ref.lid]);
    return getFile(ref.lid).then(function (b) { if (!b) return ''; urlCache[ref.lid] = URL.createObjectURL(b); return urlCache[ref.lid]; }).catch(function () { return ''; });
  }

  // shrink photos on the phone before upload (long side 1600 px, JPEG ~0.72)
  function shrink(file) {
    return new Promise(function (res) {
      if (!/^image\//.test(file.type) || /gif|svg/.test(file.type)) return res(file);
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { res(b && b.size < file.size ? b : file); }, 'image/jpeg', 0.72);
      };
      img.onerror = function () { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
  }
  function toB64(blob) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1] || ''); }; fr.onerror = rej; fr.readAsDataURL(blob); }); }

  // ---------- new drafts ----------
  function newVisit(prev) {
    return { id: uid(), start: '', end: '', tStart: '', tEnd: '', location: prev ? prev.location : '', purpose: '', customers: [''], inv: '', day: '', mode: prev ? prev.mode : '', km: '', tickets: [newLine()], overnight: 'No', nights: 1 };
  }
  function newLine() { return { id: uid(), date: '', details: '', amount: '', files: [] }; }
  function newTrip() { var h = {}; heads().forEach(function (x) { h[x[0]] = []; }); return { id: uid(), start: '', end: '', location: '', purpose: '', customers: [''], inv: '', currency: 'INR', heads: h, open: {} }; }
  function create(kind) {
    var d = { id: uid(), kind: kind, createdAt: Date.now(), updatedAt: Date.now(), note: '', advances: [] };
    if (kind === 'local') { d.visits = [newVisit()]; d.bikeAmount = ''; d.carAmount = ''; d.oop = []; }
    if (kind === 'outstation') { d.trips = [newTrip()]; }
    if (kind === 'advance') { Object.assign(d, { start: '', end: '', location: '', customers: [''], mode: '', modeOther: '', purpose: '', inv: '', currency: 'INR', amount: '' }); }
    drafts()[d.id] = d; Q.persist();
    edit(d.id); refresh();
  }
  function fromServer(rec) {
    var src = rec.data || {}, d = JSON.parse(JSON.stringify(src));
    d.id = uid(); d.no = rec.no; d.createdAt = Date.now(); d.updatedAt = Date.now();
    if (rec.kind === 'advance') { d.kind = 'advance'; d.amount = String(src.amount || ''); }
    delete d.calc; delete d.from; delete d.to; delete d.prevFY;
    (d.visits || []).forEach(function (v) { v.id = uid(); v.km = v.km ? String(v.km) : ''; (v.tickets || []).forEach(function (t) { t.id = uid(); }); if (!v.tickets || !v.tickets.length) v.tickets = [newLine()]; });
    (d.oop || []).forEach(function (t) { t.id = uid(); });
    (d.trips || []).forEach(function (t) { t.id = uid(); t.open = {}; heads().forEach(function (h) { t.heads[h[0]] = (t.heads[h[0]] || []).map(function (x) { x.id = uid(); return x; }); }); });
    if (d.kind === 'local') { d.bikeAmount = String(src.bikeAmount || ''); d.carAmount = String(src.carAmount || ''); }
    return d;
  }

  // ---------- totals (mirrors the server) ----------
  function calc(d) {
    var c = ccfg(), out = { claimed: {}, advance: {}, net: {}, items: {} };
    if (d.kind === 'local') {
      var dayMap = {}, bikeKm = 0, carKm = 0, pub = 0, nights = 0;
      d.visits.forEach(function (v) {
        if (v.mode === 'Bike') bikeKm += num(v.km); else if (v.mode === 'Car') carKm += num(v.km);
        else if (v.mode === 'Public transport') v.tickets.forEach(function (t) { pub += num(t.amount); });
        if (v.overnight === 'Yes') nights += Math.max(1, Math.round(num(v.nights) || 1));
        if (v.start && v.day) {
          var e = v.end && v.end >= v.start ? v.end : v.start;
          for (var n = dnum(v.start); n <= Math.min(dnum(e), dnum(v.start) + 31); n++) {
            var ds = Q.addDays(v.start, n - dnum(v.start));
            if (v.day === 'Full' || !dayMap[ds]) dayMap[ds] = v.day === 'Full' ? 'Full' : (dayMap[ds] || 'Half');
          }
        }
      });
      var full = 0, half = 0; Object.keys(dayMap).forEach(function (k) { if (dayMap[k] === 'Full') full++; else half++; });
      var oop = d.oop.reduce(function (s, t) { return s + num(t.amount); }, 0);
      out.items = { bikeKm: r2(bikeKm), carKm: r2(carKm), bike: bikeKm ? num(d.bikeAmount) : 0, car: carKm ? num(d.carAmount) : 0, pub: r2(pub), full: full, half: half,
        allowance: full * c.full + half * c.half, nights: nights, overnight: nights * c.night, oop: r2(oop) };
      var it = out.items;
      out.claimed = { INR: r2(it.bike + it.car + it.pub + it.allowance + it.overnight + it.oop) };
    } else if (d.kind === 'outstation') {
      out.trips = d.trips.map(function (t) {
        var tot = 0, by = {};
        heads().forEach(function (h) { by[h[0]] = r2((t.heads[h[0]] || []).reduce(function (s, x) { return s + num(x.amount); }, 0)); tot += by[h[0]]; });
        addTo(out.claimed, t.currency || 'INR', tot);
        return { total: r2(tot), by: by, currency: t.currency || 'INR' };
      });
    } else {
      out.claimed[d.currency || 'INR'] = num(d.amount);
    }
    if (d.kind !== 'advance') {
      (c.advances || []).forEach(function (a) { if ((d.advances || []).indexOf(a.no) >= 0) addTo(out.advance, a.currency, a.amount); });
      Object.keys(out.claimed).forEach(function (k) { addTo(out.net, k, out.claimed[k]); });
      Object.keys(out.advance).forEach(function (k) { addTo(out.net, k, -out.advance[k]); });
    }
    return out;
  }
  function allDates(d) {
    var a = [];
    (d.visits || []).forEach(function (v) { a.push(v.start, v.end); (v.tickets || []).forEach(function (t) { a.push(t.date); }); });
    (d.oop || []).forEach(function (t) { a.push(t.date); });
    (d.trips || []).forEach(function (t) { a.push(t.start, t.end); heads().forEach(function (h) { (t.heads[h[0]] || []).forEach(function (x) { a.push(x.date); }); }); });
    if (d.kind === 'advance') a.push(d.start, d.end);
    return a.filter(Boolean);
  }
  function filesOf(d) {
    var a = [];
    function add(arr) { (arr || []).forEach(function (f) { a.push(f); }); }
    (d.visits || []).forEach(function (v) { if (v.mode === 'Public transport') (v.tickets || []).forEach(function (t) { add(t.files); }); });
    (d.oop || []).forEach(function (t) { add(t.files); });
    (d.trips || []).forEach(function (t) { heads().forEach(function (h) { (t.heads[h[0]] || []).forEach(function (x) { add(x.files); }); }); });
    return a;
  }

  // ---------- path helpers for inputs ----------
  function getP(obj, p) { return p.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function setP(obj, p, v) { var ks = p.split('.'), last = ks.pop(), o = ks.reduce(function (o, k) { return o[k]; }, obj); o[last] = v; }

  // ---------- UI pieces ----------
  function field(label, path, val, type, extra) {
    extra = extra || {};
    var attrs = ' data-p="' + path + '"' + (extra.min ? ' min="' + extra.min + '"' : '') + (extra.max ? ' max="' + extra.max + '"' : '') + (extra.ph ? ' placeholder="' + esc(extra.ph) + '"' : '') + (extra.im ? ' inputmode="' + extra.im + '"' : '');
    var inp = type === 'textarea' ? '<textarea rows="2"' + attrs + '>' + esc(val) + '</textarea>' : '<input type="' + (type || 'text') + '"' + attrs + ' value="' + esc(val) + '">';
    return '<label class="f" data-f="' + path + '"><span>' + esc(label) + '</span>' + inp + '</label>';
  }
  function seg(label, path, val, opts) {
    return '<div class="f" data-f="' + path + '"><span>' + esc(label) + '</span><div class="seg">' + opts.map(function (o) {
      var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
      return '<button type="button" data-seg="' + path + '" data-v="' + esc(v) + '" class="' + (val === v ? 'on' : '') + '">' + esc(t) + '</button>';
    }).join('') + '</div></div>';
  }
  function customersBox(path, list) {
    return '<div class="f" data-f="' + path + '"><span>Customer(s) visited</span>' + list.map(function (c, i) {
      return '<div class="cust"><input data-p="' + path + '.' + i + '" value="' + esc(c) + '" placeholder="Customer name">' + (list.length > 1 ? '<button type="button" class="x" data-act="rmCust" data-path="' + path + '" data-i="' + i + '" aria-label="Remove">×</button>' : '') + '</div>';
    }).join('') + '<button type="button" class="plus" data-act="addCust" data-path="' + path + '">+ Add customer</button></div>';
  }
  function linesBox(path, lines, cur, opt) {
    opt = opt || {};
    var c = ccfg();
    return lines.map(function (ln, i) {
      var p = path + '.' + i;
      return '<div class="ln"><div class="row1">' +
        '<input class="det" data-p="' + p + '.details" value="' + esc(ln.details) + '" placeholder="' + esc(opt.ph || 'Details') + '">' +
        '<input class="am" data-p="' + p + '.amount" value="' + esc(ln.amount) + '" inputmode="decimal" placeholder="' + esc(cur === 'INR' ? '₹ amount' : cur + ' amount') + '">' +
        '</div><div class="row2">' +
        (opt.date ? '<input type="date" class="dt" data-p="' + p + '.date" value="' + esc(ln.date) + '" min="' + c.minDate + '" max="' + today() + '" aria-label="Date (optional)" title="Date (optional)">' : '') +
        '<button type="button" class="att" data-act="attach" data-path="' + p + '.files">📎 ' + (opt.attachLabel || 'Receipt') + '</button>' +
        (ln.files || []).map(function (f, k) {
          return '<span class="chip">' + (/pdf/.test(f.mime) ? '<em>PDF</em>' : '<img data-thumb="' + esc(f.lid || '') + '" data-fid="' + esc(f.id || '') + '" alt="">') +
            '<span data-act="openFile" data-path="' + p + '.files" data-i="' + k + '">' + esc(f.name || 'receipt') + '</span><button type="button" data-act="rmFile" data-path="' + p + '.files" data-i="' + k + '" aria-label="Remove">×</button></span>';
        }).join('') +
        '<span style="flex:1"></span><button type="button" class="x" style="height:32px" data-act="rmLine" data-path="' + path + '" data-i="' + i + '" aria-label="Remove line">×</button></div></div>';
    }).join('') + '<button type="button" class="plus" data-act="addLine" data-path="' + path + '">+ ' + esc(opt.addLabel || 'Add line') + '</button>';
  }
  function statusChip(st) {
    var cls = /pending/i.test(st) ? 'st-p' : /approved/i.test(st) ? 'st-a' : /reject/i.test(st) ? 'st-r' : /paid/i.test(st) ? 'st-d' : /withdrawn/i.test(st) ? 'st-w' : 'st-dr';
    return '<span class="st ' + cls + '">' + esc(st) + '</span>';
  }

  // ---------- HOME ----------
  var openRec = null, flash = '';
  function renderHome() {
    view = 'home'; curId = null; bar.hidden = true;
    var recs = S().claimRecords || [], ds = Object.keys(drafts()).map(function (k) { return drafts()[k]; }).sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    var h = flash + '<div class="cl-new">' +
      '<button type="button" data-act="new" data-kind="local"><i>🛵</i><div><b>Local conveyance</b><small>Bike / car km, public transport, daily allowance</small></div></button>' +
      '<button type="button" data-act="new" data-kind="outstation"><i>✈️</i><div><b>Outstation conveyance</b><small>One or more trips: travel, stay, meals, local travel</small></div></button>' +
      '<button type="button" data-act="new" data-kind="advance"><i>💼</i><div><b>Advance request</b><small>Money before an upcoming trip</small></div></button></div>';
    if (!online()) h += '<div class="banner warn">You are offline. You can fill in claims; submitting needs internet.</div>';
    if (ds.length) {
      h += '<div class="cl-sec">Drafts on this phone</div><div class="card cl-list">' + ds.map(function (d) {
        var cc = calc(d), n = d.kind === 'local' ? d.visits.length + ' visit' + (d.visits.length === 1 ? '' : 's') : d.kind === 'outstation' ? d.trips.length + ' trip' + (d.trips.length === 1 ? '' : 's') : (d.location || 'Advance');
        return '<div class="row" data-act="open" data-id="' + d.id + '"><div class="g"><b>' + (d.no ? esc(d.no) + ' · editing' : kindName(d.kind)) + '</b><small>' + esc(n) + ' · saved ' + esc(Q.stamp(new Date(d.updatedAt).toISOString())) + '</small>' + statusChip('Draft') + '</div><div class="amt">' + esc(moneyObj(cc.claimed)) + '</div></div>';
      }).join('') + '</div>';
    }
    h += '<div class="cl-sec">My claims &amp; advances</div>';
    if (!recs.length) h += '<div class="card empty">' + (S().claimRecords ? 'Nothing submitted yet.' : (online() ? 'Loading…' : 'Connect to the internet to see your claims.')) + '</div>';
    else h += '<div class="card cl-list">' + recs.map(function (r) {
      var title = r.no + ' · ' + (r.kind === 'advance' ? 'Advance' : r.type);
      var sub = (r.from ? span(r.from, r.to) : '') + (r.location ? ' · ' + r.location : '');
      var shownAmt = r.status === 'Paid' && r.paid ? r.paid : r.approved || r.claimed;
      var det = '';
      if (openRec === r.no) {
        det = '<div class="cl-det"><table>' +
          '<tr><td>' + (r.kind === 'advance' ? 'Requested' : 'Claimed') + '</td><td>' + esc(r.claimed) + '</td></tr>' +
          (r.approved ? '<tr><td>Approved</td><td>' + esc(r.approved) + '</td></tr>' : '') +
          (r.kind === 'claim' && r.net && r.net !== r.claimed ? '<tr><td>Net after advance</td><td>' + esc(r.net) + '</td></tr>' : '') +
          (r.paid ? '<tr><td>Paid' + (r.paidOn ? ' on ' + esc(pretty(r.paidOn)) : '') + '</td><td>' + esc(r.paid) + '</td></tr>' : '') +
          (r.settledBy ? '<tr><td>Adjusted in</td><td>' + esc(r.settledBy) + '</td></tr>' : '') +
          '<tr><td>Submitted</td><td>' + esc(String(r.submitted).slice(0, 16)) + (r.revision > 1 ? ' (rev ' + r.revision + ')' : '') + '</td></tr></table>' +
          (r.comment ? '<div class="cm"><b>Manager:</b> ' + esc(r.comment) + '</div>' : '') +
          '<div class="cl-acts">' + (r.view ? '<a href="' + esc(r.view) + '" target="_blank" rel="noopener">View full ' + (r.kind === 'advance' ? 'request' : 'claim') + '</a>' : '') +
          (r.status === 'Rejected' || r.status === 'Withdrawn' ? '<button type="button" class="pri" data-act="resubmit" data-no="' + esc(r.no) + '">Edit &amp; resubmit</button>' : '') +
          (r.status === 'Pending approval' ? '<button type="button" class="wd" data-act="withdraw" data-no="' + esc(r.no) + '">Withdraw</button>' : '') + '</div></div>';
      }
      return '<div class="row" data-act="toggleRec" data-no="' + esc(r.no) + '"><div class="g"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small>' + statusChip(r.status) + '</div><div class="amt">' + esc(shownAmt) + '</div></div>' + det;
    }).join('') + '</div>';
    h += '<p class="muted foot">Your manager approves each claim; accounts is copied. You can withdraw a claim until your manager acts on it. Rejected or withdrawn claims can be edited and resubmitted.</p>';
    root.innerHTML = h;
  }
  function kindName(k) { return k === 'local' ? 'Local conveyance' : k === 'outstation' ? 'Outstation conveyance' : 'Advance request'; }
  function refresh() {
    if (!online()) return Promise.resolve();
    return Q.api('myClaims').then(function (r) {
      var s = S(), before = JSON.stringify(s.claimsCfg || null);
      s.claimRecords = r.records; s.claimsCfg = r.claimsCfg; Q.persist();
      if (view === 'home') renderHome();
      else if (view === 'edit' && draft() && before !== JSON.stringify(r.claimsCfg)) {   // new advances / currencies: redraw, keeping the cursor
        var ae = document.activeElement, p = ae && ae.dataset && ae.dataset.p, y = window.scrollY;
        renderEditor(); window.scrollTo(0, y);
        if (p) { var el = root.querySelector('[data-p="' + p + '"]'); if (el) el.focus(); }
      }
    }).catch(function (e) { if (view === 'home' && !S().claimRecords) { root.querySelector('.empty') && (root.querySelector('.empty').textContent = e.network ? 'Connect to the internet to see your claims.' : e.message); } });
  }

  // ---------- EDITOR ----------
  function edit(id) { flash = ''; curId = id; view = 'edit'; openPanel = null; renderEditor(); window.scrollTo(0, 0); }
  function renderEditor() {
    var d = draft(); if (!d) return renderHome();
    var c = ccfg(), h = '';
    h += '<div class="cl-h"><button type="button" class="cl-back" data-act="home">‹ Claims</button><h2>' + kindName(d.kind) + '</h2></div>';
    if (d.no) h += '<div class="banner info">Editing <b>' + esc(d.no) + '</b> after rejection. Fix what the manager asked and submit again; it keeps the same number.</div>';
    if (d.settling && !d.no) h += '<div class="banner info">Settling advance <b>' + esc(d.settling) + '</b>: it is already ticked below and will be deducted. Add your expenses and receipts, then submit.' +
      '<div class="cl-acts" style="margin-top:8px"><button type="button" data-act="switchKind">' + (d.kind === 'local' ? 'This was outstation travel' : 'This was local travel') + '</button></div></div>';
    h += '<div id="clErr"></div><div id="clFy"></div>';
    if (d.kind === 'local') h += localForm(d, c);
    else if (d.kind === 'outstation') h += outstationForm(d, c);
    else h += advanceForm(d, c);
    if (d.kind !== 'advance') h += advancesBox(d, c);
    h += '<div class="cl-card">' + field('Note for your manager (optional)', 'note', d.note || '', 'textarea', { ph: 'Anything the approver should know' }) + '</div>';
    h += '<div class="cl-card" id="clSum"></div>';
    h += '<div class="cl-acts" style="margin-bottom:10px"><button type="button" class="del" data-act="discard">' + (d.no ? 'Cancel editing' : 'Delete draft') + '</button></div>';
    root.innerHTML = h;
    bar.hidden = false;
    updateLive(); loadThumbs();
  }

  function localForm(d, c) {
    var h = '<div class="cl-card" style="background:#f6f9fb"><h3><span>📋 Add visits from my timesheet</span></h3><div class="hint" style="margin:0 0 8px">Site and Travel days you logged, with times, customer and invoiceable already filled in.</div>' +
      '<button type="button" class="plus" data-act="ts">' + (openPanel === 'ts' ? 'Hide timesheet days' : 'Show my Site / Travel days') + '</button><div id="tsBox"></div></div>';
    d.visits.forEach(function (v, i) {
      var p = 'visits.' + i;
      h += '<div class="cl-card visit"><h3><span>Visit ' + (i + 1) + '</span>' + (d.visits.length > 1 ? '<button type="button" data-act="rmVisit" data-i="' + i + '" aria-label="Remove visit">×</button>' : '') + '</h3>' +
        '<div class="two">' + field('Start date', p + '.start', v.start, 'date', { min: c.minDate, max: today() }) + field('Start time', p + '.tStart', v.tStart, 'time') + '</div>' +
        '<div class="two">' + field('End date', p + '.end', v.end, 'date', { min: c.minDate, max: today() }) + field('End time', p + '.tEnd', v.tEnd, 'time') + '</div>' +
        field('Location', p + '.location', v.location, 'text', { ph: 'e.g. Chakan MIDC, Pune' }) +
        field('Purpose of visit', p + '.purpose', v.purpose, 'text', { ph: 'e.g. UT inspection of pressure vessel' }) +
        customersBox(p + '.customers', v.customers) +
        seg('Invoiceable to customer?', p + '.inv', v.inv, ['Yes', 'No']) +
        seg('Half day or full day', p + '.day', v.day, [['Half', 'Half day'], ['Full', 'Full day']]) +
        seg('Mode of travel', p + '.mode', v.mode, c.localModes || ['Bike', 'Car', 'Public transport']);
      if (v.mode === 'Bike' || v.mode === 'Car') h += field('Kilometres travelled', p + '.km', v.km, 'text', { im: 'decimal', ph: 'e.g. 42' });
      if (v.mode === 'Public transport') h += '<div class="f"><span>Fare paid</span><div class="hint">A photo of the ticket, receipt or UPI screenshot is advisable.</div>' + linesBox(p + '.tickets', v.tickets, 'INR', { ph: 'e.g. Bus / metro / auto', attachLabel: 'Ticket', addLabel: 'Add another fare' }) + '</div>';
      h += seg('Overnight stay needed?', p + '.overnight', v.overnight || 'No', ['No', 'Yes']);
      if (v.overnight === 'Yes') h += field('Number of nights', p + '.nights', v.nights, 'number', { im: 'numeric' });
      h += '</div>';
    });
    h += '<button type="button" class="plus big" data-act="addVisit">+ Add another visit</button>';
    // always in the page; shown/hidden live as km are typed
    h += '<div class="cl-card" id="kmCard"><h3><span>Kilometre amounts</span></h3><div class="hint">Total km across all visits. Enter the amount you are claiming for each.</div>' +
      '<div class="kmrow" data-f="bikeAmount" id="kmRowB"><b>🛵 Bike · <span id="kmB">0</span> km</b><input data-p="bikeAmount" inputmode="decimal" placeholder="₹ amount" value="' + esc(d.bikeAmount) + '"></div>' +
      '<div class="kmrow" data-f="carAmount" id="kmRowC"><b>🚗 Car · <span id="kmC">0</span> km</b><input data-p="carAmount" inputmode="decimal" placeholder="₹ amount" value="' + esc(d.carAmount) + '"></div></div>';
    h += '<div class="cl-card"><h3><span>Out-of-pocket expenses</span></h3><div class="hint">Miscellaneous costs (parking, toll, printing…). Attach proof where you have it.</div>' + linesBox('oop', d.oop, 'INR', { date: true, ph: 'What was it for?', addLabel: 'Add expense' }) + '</div>';
    return h;
  }

  function outstationForm(d, c) {
    var h = '';
    d.trips.forEach(function (t, i) {
      var p = 'trips.' + i, ct = calc(d).trips[i];
      h += '<div class="cl-card trip"><h3><span>Trip ' + (i + 1) + '</span>' + (d.trips.length > 1 ? '<button type="button" data-act="rmTrip" data-i="' + i + '" aria-label="Remove trip">×</button>' : '') + '</h3>' +
        '<div class="two">' + field('Start date of travel', p + '.start', t.start, 'date', { min: c.minDate, max: today() }) + field('End date of travel', p + '.end', t.end, 'date', { min: c.minDate, max: today() }) + '</div>' +
        field('Place visited', p + '.location', t.location, 'text', { ph: 'e.g. Fujairah, UAE' }) +
        field('Purpose of visit', p + '.purpose', t.purpose, 'text', { ph: 'e.g. Site audit' }) +
        customersBox(p + '.customers', t.customers) +
        seg('Invoiceable to customer?', p + '.inv', t.inv, ['Yes', 'No']) +
        '<label class="f" data-f="' + p + '.currency"><span>Currency of these expenses</span><select data-p="' + p + '.currency">' + (c.currencies || ['INR']).map(function (x) { return '<option' + (x === t.currency ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>' +
        '<div class="f"><span>Expenses</span>';
      heads().forEach(function (hd) {
        var lines = t.heads[hd[0]] || [], open = t.open && t.open[hd[0]] !== undefined ? t.open[hd[0]] : lines.length > 0;
        h += '<div class="head"><button type="button" data-act="head" data-i="' + i + '" data-h="' + hd[0] + '"><span>' + esc(hd[1]) + '</span>' +
          (lines.length ? '<em data-ht="' + i + '.' + hd[0] + '">' + esc(money(ct.by[hd[0]], t.currency)) + '</em>' : '<small>+ add</small>') + '<small>' + (open ? '▴' : '▾') + '</small></button>' +
          (open ? '<div class="body">' + linesBox(p + '.heads.' + hd[0], lines, t.currency, { date: true, ph: headPh(hd[0]), addLabel: 'Add ' + hd[1].toLowerCase().replace(/\s*\(.*/, '') + ' line' }) + '</div>' : '') + '</div>';
      });
      h += '</div><div class="sum"><table style="width:100%"><tr class="tot"><td>Trip ' + (i + 1) + ' total</td><td id="tripT' + i + '">' + esc(money(ct.total, t.currency)) + '</td></tr></table></div></div>';
    });
    h += '<button type="button" class="plus big" data-act="addTrip">+ Add another trip</button>';
    return h;
  }
  function headPh(k) { return { toBoarding: 'e.g. Cab to airport', travel: 'e.g. Flight PNQ–DXB', arrivalToStay: 'e.g. Taxi airport to hotel', stayToWork: 'e.g. Daily cab to site', stay: 'e.g. Hotel, 3 nights', meals: 'e.g. Meals 3 days', local: 'e.g. Taxi to airport for return', oop: 'e.g. Visa fee, SIM card' }[k] || 'Details'; }

  function advanceForm(d, c) {
    var modes = c.modes || [];
    return '<div class="cl-card">' +
      '<div class="two">' + field('Travel start date', 'start', d.start, 'date', { min: c.minDate }) + field('Travel end date', 'end', d.end, 'date', { min: c.minDate }) + '</div>' +
      field('Location to be visited', 'location', d.location, 'text', { ph: 'e.g. Fujairah, UAE' }) +
      customersBox('customers', d.customers) +
      '<label class="f" data-f="mode"><span>Mode of travel</span><select data-p="mode"><option value="">Choose…</option>' + modes.map(function (m) { return '<option' + (m === d.mode ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></label>' +
      (/other/i.test(d.mode || '') ? field('Mode of travel (type it)', 'modeOther', d.modeOther, 'text', { ph: 'e.g. Company van' }) : '') +
      field('Purpose of visit', 'purpose', d.purpose, 'text', { ph: 'e.g. Site audit' }) +
      seg('Expenses invoiceable to customer?', 'inv', d.inv, ['Yes', 'No']) +
      '<div class="two"><label class="f" data-f="currency"><span>Currency</span><select data-p="currency">' + (c.currencies || ['INR']).map(function (x) { return '<option' + (x === d.currency ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>' +
      field('Advance amount required', 'amount', d.amount, 'text', { im: 'decimal', ph: 'Amount' }) + '</div></div>';
  }

  function advancesBox(d, c) {
    var list = c.advances || [];
    if (!list.length) return '';
    return '<div class="cl-card adv"><h3><span>Advance received</span></h3><div class="hint">Tick any advance for these trips. It is deducted from this claim.</div>' + list.map(function (a) {
      return '<label><input type="checkbox" data-adv="' + esc(a.no) + '"' + ((d.advances || []).indexOf(a.no) >= 0 ? ' checked' : '') + '><span style="flex:1"><b>' + esc(a.no) + '</b> · ' + esc(a.location || '') + '<br><small class="muted">' + esc(span(a.from, a.to)) + ' · ' + esc(a.status) + '</small></span><b>' + esc(money(a.amount, a.currency)) + '</b></label>';
    }).join('') + '</div>';
  }

  // live parts (no full re-render while typing)
  function updateLive() {
    var d = draft(); if (!d) return;
    var cc = calc(d), c = ccfg(), rows = [];
    if (d.kind === 'local') {
      var it = cc.items;
      if (it.bikeKm) rows.push(['Bike · ' + it.bikeKm + ' km', it.bike, 'INR']);
      if (it.carKm) rows.push(['Car · ' + it.carKm + ' km', it.car, 'INR']);
      if (it.pub) rows.push(['Public transport', it.pub, 'INR']);
      if (it.full || it.half) rows.push(['Daily allowance · ' + (it.full ? it.full + ' full × ₹' + c.full : '') + (it.full && it.half ? ' + ' : '') + (it.half ? it.half + ' half × ₹' + c.half : ''), it.allowance, 'INR']);
      if (it.nights) rows.push(['Overnight stay · ' + it.nights + ' × ₹' + c.night, it.overnight, 'INR']);
      if (it.oop) rows.push(['Out-of-pocket', it.oop, 'INR']);
      if ($('kmCard')) {
        $('kmB').textContent = it.bikeKm; $('kmC').textContent = it.carKm;
        $('kmRowB').hidden = !it.bikeKm; $('kmRowC').hidden = !it.carKm; $('kmCard').hidden = !it.bikeKm && !it.carKm;
      }
    } else if (d.kind === 'outstation') {
      cc.trips.forEach(function (t, i) { rows.push(['Trip ' + (i + 1) + (d.trips[i].location ? ' · ' + d.trips[i].location : ''), t.total, t.currency]); var el = $('tripT' + i); if (el) el.textContent = money(t.total, t.currency);
        heads().forEach(function (hd) { var em = root.querySelector('[data-ht="' + i + '.' + hd[0] + '"]'); if (em) em.textContent = money(t.by[hd[0]], t.currency); }); });
    }
    var sum = $('clSum');
    if (sum) {
      if (d.kind === 'advance') sum.innerHTML = '<div class="sum"><table style="width:100%"><tr class="tot"><td>Advance requested</td><td>' + esc(moneyObj(cc.claimed)) + '</td></tr></table></div>';
      else {
        var h = '<h3><span>Summary</span></h3><div class="sum"><table style="width:100%">' + rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(money(r[1], r[2])) + '</td></tr>'; }).join('') +
          '<tr class="tot"><td>Total claim</td><td>' + esc(moneyObj(cc.claimed)) + '</td></tr>';
        if (Object.keys(cc.advance).length) {
          h += '<tr><td>Less advance</td><td>− ' + esc(moneyObj(cc.advance)) + '</td></tr>';
          var neg = Object.keys(cc.net).some(function (k) { return cc.net[k] < 0; });
          h += '<tr class="net"><td>' + (neg ? 'Net (− means you return it)' : 'Net payable to you') + '</td><td>' + esc(moneyObj(cc.net)) + '</td></tr>';
        }
        sum.innerHTML = h + '</table></div>';
      }
    }
    // previous-FY banner
    var fy = c.fyStart || fyStartOf(today()), old = allDates(d).some(function (x) { return x < fy; });
    var fb = $('clFy'); if (fb) fb.innerHTML = old ? '<div class="banner warn">Some dates are before ' + esc(pretty(fy)) + ' ' + fy.slice(0, 4) + ' (previous financial year). Your manager has to approve them explicitly.</div>' : '';
    // bar
    var t = bar.querySelector('.t'), b = bar.querySelector('button');
    if (!busy) {
      t.innerHTML = '<b>' + esc(moneyObj(d.kind === 'advance' ? cc.claimed : (Object.keys(cc.advance).length ? cc.net : cc.claimed))) + '</b>' + (d.kind === 'advance' ? 'advance requested' : Object.keys(cc.advance).length ? 'net after advance' : 'total claim');
      b.textContent = d.no ? 'Resubmit' : d.kind === 'advance' ? 'Submit request' : 'Submit claim';
      b.disabled = false;
    }
  }
  function rerender() { var y = window.scrollY; renderEditor(); window.scrollTo(0, y); }

  function loadThumbs() {
    root.querySelectorAll('img[data-thumb]').forEach(function (img) {
      var lid = img.getAttribute('data-thumb');
      if (lid) thumbUrl({ lid: lid }).then(function (u) { if (u) img.src = u; });
      else { img.replaceWith(Object.assign(document.createElement('em'), { textContent: 'IMG' })); }
    });
  }

  // ---------- timesheet prefill ----------
  var tsCache = null;
  function toggleTs() {
    var d = draft();
    if (openPanel === 'ts') { openPanel = null; rerender(); return; }
    openPanel = 'ts'; rerender();
    var box = $('tsBox'); box.innerHTML = '<div class="hint" style="margin-top:8px">Loading your timesheet…</div>';
    if (!online()) { box.innerHTML = '<div class="hint" style="margin-top:8px">Needs internet.</div>'; return; }
    var from = Q.addDays(today(), -62); if (from < ccfg().minDate) from = ccfg().minDate;
    Q.api('tsDays', { from: from, to: today(), no: d.no || '' }).then(function (r) { tsCache = r.days; drawTs(); })
      .catch(function (e) { box.innerHTML = '<div class="hint" style="margin-top:8px">' + esc(e.network ? 'Could not reach the server.' : e.message) + '</div>'; });
  }
  function drawTs() {
    var d = draft(), box = $('tsBox'); if (!box || !tsCache) return;
    var have = {}; d.visits.forEach(function (v) { if (v.start) have[v.start] = 1; });
    var list = tsCache.slice().reverse();
    if (!list.length) { box.innerHTML = '<div class="hint" style="margin-top:8px">No Site or Travel days in your timesheet for the last two months.</div>'; return; }
    box.innerHTML = '<div class="ts" style="margin-top:8px">' + list.map(function (x) {
      var dis = x.claimedIn || have[x.date];
      return '<label class="' + (dis ? 'dis' : '') + '"><input type="checkbox" data-ts="' + x.date + '"' + (dis ? ' disabled' : '') + '><span><b>' + esc(pretty(x.date)) + '</b> · ' + esc(x.type) + (x.client ? ' · ' + esc(x.client) : '') +
        '<small>' + (x.tStart ? esc(x.tStart + '–' + x.tEnd) + ' · ' : '') + esc(Math.round((x.hours || 0) * 10) / 10) + ' h' + (x.note ? ' · ' + esc(x.note) : '') + (x.claimedIn ? ' · already in ' + esc(x.claimedIn) : have[x.date] ? ' · already added' : '') + '</small></span></label>';
    }).join('') + '</div><button type="button" class="plus" style="margin-top:8px;background:var(--navy);color:#fff;border-style:solid" data-act="tsAdd">Add ticked days as visits</button>';
  }
  function tsAdd() {
    var d = draft(), picks = Array.prototype.map.call(root.querySelectorAll('[data-ts]:checked'), function (x) { return x.getAttribute('data-ts'); });
    if (!picks.length) return Q.toast('Tick at least one day.');
    var byDate = {}; tsCache.forEach(function (x) { byDate[x.date] = x; });
    // drop the empty starter visit
    d.visits = d.visits.filter(function (v) { return v.start || v.location || v.purpose || v.km || (v.customers || []).join(''); });
    var prev = d.visits[d.visits.length - 1];
    picks.sort().forEach(function (dt) {
      var x = byDate[dt], v = newVisit(prev);
      v.start = dt; v.end = x.endNextDay ? Q.addDays(dt, 1) : dt; v.tStart = x.tStart || ''; v.tEnd = x.tEnd || '';
      v.purpose = x.note || ''; v.customers = [x.client || '']; v.inv = x.inv === 'Yes' || x.inv === 'No' ? x.inv : '';
      v.day = (x.hours || 0) >= 6 ? 'Full' : 'Half';
      d.visits.push(v);
    });
    d.visits.sort(function (a, b) { return (a.start || '9') < (b.start || '9') ? -1 : 1; });
    openPanel = null; save(); rerender();
    Q.toast(picks.length + ' visit' + (picks.length > 1 ? 's' : '') + ' added. Add location and mode of travel.');
  }

  // ---------- events ----------
  function onInput(ev) {
    var el = ev.target, p = el.dataset && el.dataset.p, d = draft();
    if (!p || !d) return;
    var v = el.value;
    if (el.type === 'date' && v && /\.start$/.test(p)) {   // keep end date sensible
      var endP = p.replace(/start$/, 'end'), e = getP(d, endP);
      if (!e || e < v) { setP(d, endP, v); var ee = root.querySelector('[data-p="' + endP + '"]'); if (ee) ee.value = v; }
    }
    if (p === 'start' && d.kind === 'advance' && (!d.end || d.end < v)) { d.end = v; var ae = root.querySelector('[data-p="end"]'); if (ae) ae.value = v; }
    setP(d, p, v);
    var f = el.closest('.f,.kmrow'); if (f) f.classList.remove('bad');
    save();
    if (/\.currency$|^mode$|^currency$/.test(p)) rerender(); else updateLive();
  }
  function onClick(ev) {
    var t = ev.target.closest('[data-act],[data-seg],[data-adv]'); if (!t) return;
    var d = draft(), a = t.dataset.act;
    if (t.dataset.adv !== undefined && t.tagName === 'INPUT') {
      var no = t.dataset.adv; d.advances = d.advances || [];
      if (t.checked) { if (d.advances.indexOf(no) < 0) d.advances.push(no); } else d.advances = d.advances.filter(function (x) { return x !== no; });
      save(); updateLive(); return;
    }
    if (t.dataset.seg) {
      var p = t.dataset.seg, val = t.dataset.v; setP(d, p, val); save();
      if (/\.mode$|\.overnight$/.test(p)) rerender();
      else { t.parentNode.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === t); }); var f = t.closest('.f'); if (f) f.classList.remove('bad'); updateLive(); }
      return;
    }
    switch (a) {
      case 'new': return create(t.dataset.kind);
      case 'open': edit(t.dataset.id); refresh(); return;
      case 'home': flash = ''; renderHome(); window.scrollTo(0, 0); refresh(); return;
      case 'toggleRec': openRec = openRec === t.dataset.no ? null : t.dataset.no; renderHome(); return;
      case 'resubmit': return resubmit(t.dataset.no);
      case 'withdraw': return withdraw(t.dataset.no, t);
      case 'discard':
        if (!confirm(d.no ? 'Stop editing? Your changes on this phone will be removed.' : 'Delete this draft?')) return;
        filesOf(d).forEach(function (f) { if (f.lid && !f.id) delFile(f.lid); });
        delete drafts()[d.id]; Q.persist(); renderHome(); return;
      case 'addVisit': d.visits.push(newVisit(d.visits[d.visits.length - 1])); save(); rerender(); setTimeout(function () { var cs = root.querySelectorAll('.visit'); cs[cs.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30); return;
      case 'rmVisit': if (!confirm('Remove visit ' + (+t.dataset.i + 1) + '?')) return; d.visits.splice(+t.dataset.i, 1); save(); rerender(); return;
      case 'addTrip': d.trips.push(newTrip()); save(); rerender(); setTimeout(function () { var cs = root.querySelectorAll('.trip'); cs[cs.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30); return;
      case 'rmTrip': if (!confirm('Remove trip ' + (+t.dataset.i + 1) + ' and its expenses?')) return; d.trips.splice(+t.dataset.i, 1); save(); rerender(); return;
      case 'addCust': getP(d, t.dataset.path).push(''); save(); rerender(); focusLast(t.dataset.path); return;
      case 'rmCust': getP(d, t.dataset.path).splice(+t.dataset.i, 1); save(); rerender(); return;
      case 'addLine': getP(d, t.dataset.path).push(newLine()); save(); rerender(); focusLast(t.dataset.path, 'details'); return;
      case 'rmLine': var arr = getP(d, t.dataset.path), ln = arr[+t.dataset.i];
        if ((ln.amount || ln.details || (ln.files || []).length) && !confirm('Remove this line?')) return;
        (ln.files || []).forEach(function (f) { if (f.lid && !f.id) delFile(f.lid); }); arr.splice(+t.dataset.i, 1); save(); rerender(); return;
      case 'head': var tr = d.trips[+t.dataset.i]; tr.open = tr.open || {}; var lines = tr.heads[t.dataset.h] || (tr.heads[t.dataset.h] = []);
        var isOpen = tr.open[t.dataset.h] !== undefined ? tr.open[t.dataset.h] : lines.length > 0;
        tr.open[t.dataset.h] = !isOpen; if (!isOpen && !lines.length) lines.push(newLine()); save(); rerender(); return;
      case 'attach': return pickFiles(t.dataset.path);
      case 'rmFile': var fs = getP(d, t.dataset.path), fr = fs[+t.dataset.i]; if (fr.lid && !fr.id) delFile(fr.lid); fs.splice(+t.dataset.i, 1); save(); rerender(); return;
      case 'openFile': return openFile(getP(d, t.dataset.path)[+t.dataset.i]);
      case 'ts': return toggleTs();
      case 'tsAdd': return tsAdd();
      case 'switchKind': return switchSettleKind();
    }
  }
  function focusLast(path, sub) {
    setTimeout(function () { var els = root.querySelectorAll('[data-p^="' + path + '."]'); var cand = Array.prototype.filter.call(els, function (e) { return !sub || /\.details$/.test(e.dataset.p); }); var el = cand[cand.length - 1]; if (el) el.focus(); }, 30);
  }

  // ---------- files ----------
  var picker = null, pickPath = null;
  function pickFiles(path) {
    if (!picker) {
      picker = document.createElement('input'); picker.type = 'file'; picker.accept = 'image/*,application/pdf'; picker.multiple = true; picker.style.display = 'none';
      document.body.appendChild(picker);
      picker.onchange = function () { var files = Array.prototype.slice.call(picker.files || []); picker.value = ''; addFiles(pickPath, files); };
    }
    pickPath = path; picker.click();
  }
  function addFiles(path, files) {
    var d = draft(), maxMB = ccfg().maxMB || 8, arr = getP(d, path);
    var chain = Promise.resolve(), added = 0;
    files.slice(0, 10).forEach(function (f) {
      chain = chain.then(function () {
        if (!/^image\//.test(f.type) && f.type !== 'application/pdf') { Q.toast('Only photos and PDF files can be attached.'); return; }
        return shrink(f).then(function (b) {
          if (b.size > maxMB * 1048576) { Q.toast(f.name + ' is larger than ' + maxMB + ' MB.'); return; }
          var lid = uid(), name = (f.name || 'receipt').replace(/\.(heic|heif|png|webp)$/i, b.type === 'image/jpeg' ? '.jpg' : '.$1');
          if (b.type === 'image/jpeg' && !/\.jpe?g$/i.test(name) && !/\.pdf$/i.test(name)) name = name.replace(/\.[^.]*$/, '') + '.jpg';
          return putFile(lid, b).then(function () { arr.push({ lid: lid, name: name, mime: b.type || f.type, size: b.size }); added++; });
        });
      });
    });
    chain.then(function () { save(); rerender(); if (added) Q.toast(added + ' receipt' + (added > 1 ? 's' : '') + ' attached'); })
      .catch(function () { Q.toast('Could not save the file on this phone. Please try again.'); });
  }
  function openFile(ref) {
    var w = window.open('', '_blank');
    function show(blob) { var u = URL.createObjectURL(blob); if (w) w.location = u; else location.href = u; }
    if (ref.lid) return getFile(ref.lid).then(function (b) { if (b) show(b); else if (ref.id) fetchRemote(); else { if (w) w.close(); Q.toast('File not found on this phone.'); } });
    fetchRemote();
    function fetchRemote() {
      Q.api('myFile', { fileId: ref.id }).then(function (r) {
        var bin = atob(r.file.b64), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        show(new Blob([u8], { type: r.file.mime }));
      }).catch(function (e) { if (w) w.close(); Q.toast(e.network ? 'Needs internet to open this receipt.' : e.message); });
    }
  }

  // ---------- validation (quick, on the phone; the server checks everything again) ----------
  function check(d) {
    var c = ccfg(), probs = [];
    function need(cond, path, msg) { if (!cond) probs.push([path, msg]); }
    function dateOk(v, path, label, future) { need(v, path, label + ': pick a date.'); if (v) { need(v >= c.minDate, path, label + ' is before the previous financial year.'); if (!future) need(v <= today(), path, label + ' is in the future.'); } }
    function custs(list, path, label) { need((list || []).some(function (x) { return String(x).trim(); }), path, label + ': add at least one customer.'); }
    function lines(arr, path, label) { (arr || []).forEach(function (l, i) { var any = l.amount || l.details || (l.files || []).length; if (any) need(num(l.amount) > 0, path + '.' + i, label + ': enter the amount (or remove the line).'); if (l.date) dateOk(l.date, path + '.' + i, label + ' date'); }); }
    if (d.kind === 'local') {
      d.visits.forEach(function (v, i) {
        var L = 'Visit ' + (i + 1), p = 'visits.' + i;
        dateOk(v.start, p + '.start', L + ' start date'); dateOk(v.end || v.start, p + '.end', L + ' end date');
        need(!v.end || !v.start || v.end >= v.start, p + '.end', L + ': end date is before the start date.');
        need(v.tStart, p + '.tStart', L + ': enter the start time.'); need(v.tEnd, p + '.tEnd', L + ': enter the end time.');
        if (v.tStart && v.tEnd && (v.end || v.start) === v.start) need(v.tEnd > v.tStart, p + '.tEnd', L + ': end time must be after the start time.');
        need(String(v.location).trim(), p + '.location', L + ': enter the location.');
        need(String(v.purpose).trim(), p + '.purpose', L + ': enter the purpose of visit.');
        custs(v.customers, p + '.customers', L);
        need(v.inv, p + '.inv', L + ': invoiceable to customer? Choose Yes or No.');
        need(v.day, p + '.day', L + ': choose half day or full day.');
        need(v.mode, p + '.mode', L + ': choose the mode of travel.');
        if (v.mode === 'Bike' || v.mode === 'Car') need(num(v.km) > 0, p + '.km', L + ': enter the kilometres.');
        if (v.mode === 'Public transport') { need(v.tickets.some(function (t) { return num(t.amount) > 0; }), p + '.tickets', L + ': enter the fare.'); lines(v.tickets, p + '.tickets', L + ' fare'); }
      });
      var it = calc(d).items;
      if (it.bikeKm) need(num(d.bikeAmount) > 0, 'bikeAmount', 'Enter the amount for ' + it.bikeKm + ' km by bike.');
      if (it.carKm) need(num(d.carAmount) > 0, 'carAmount', 'Enter the amount for ' + it.carKm + ' km by car.');
      lines(d.oop, 'oop', 'Out-of-pocket');
      d.oop.forEach(function (l, i) { if (num(l.amount) > 0) need(String(l.details).trim(), 'oop.' + i, 'Out-of-pocket: say what it was for.'); });
    } else if (d.kind === 'outstation') {
      d.trips.forEach(function (t, i) {
        var L = 'Trip ' + (i + 1), p = 'trips.' + i;
        dateOk(t.start, p + '.start', L + ' start date'); dateOk(t.end || t.start, p + '.end', L + ' end date');
        need(!t.end || !t.start || t.end >= t.start, p + '.end', L + ': end date is before the start date.');
        need(String(t.location).trim(), p + '.location', L + ': enter the place visited.');
        need(String(t.purpose).trim(), p + '.purpose', L + ': enter the purpose of visit.');
        custs(t.customers, p + '.customers', L);
        need(t.inv, p + '.inv', L + ': invoiceable to customer? Choose Yes or No.');
        heads().forEach(function (h) { lines(t.heads[h[0]], p + '.heads.' + h[0], L + ' · ' + h[1]); });
        need(calc(d).trips[i].total > 0, p + '.location', L + ': add at least one expense.');
      });
    } else {
      dateOk(d.start, 'start', 'Travel start date', true); dateOk(d.end || d.start, 'end', 'Travel end date', true);
      need(!d.end || !d.start || d.end >= d.start, 'end', 'Travel end date is before the start date.');
      need(String(d.location).trim(), 'location', 'Enter the location to be visited.');
      custs(d.customers, 'customers', 'Customers');
      need(d.mode, 'mode', 'Choose the mode of travel.');
      if (/other/i.test(d.mode || '')) need(String(d.modeOther || '').trim(), 'modeOther', 'Type the mode of travel.');
      need(String(d.purpose).trim(), 'purpose', 'Enter the purpose of visit.');
      need(d.inv, 'inv', 'Invoiceable to customer? Choose Yes or No.');
      need(num(d.amount) > 0, 'amount', 'Enter the advance amount required.');
    }
    return probs;
  }
  function showProblems(probs) {
    root.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); });
    var first = null;
    probs.forEach(function (pr) {
      var el = root.querySelector('[data-f="' + pr[0] + '"]') || root.querySelector('[data-p="' + pr[0] + '.details"]') || root.querySelector('[data-p^="' + pr[0] + '"]');
      if (el) { var box = el.closest('.f,.kmrow,.ln') || el; box.classList.add('bad'); if (!first) first = box; }
    });
    $('clErr').innerHTML = '<div class="banner err"><b>Please fix ' + (probs.length === 1 ? 'this' : 'these ' + probs.length) + ':</b><br>' + probs.slice(0, 6).map(function (p) { return '• ' + esc(p[1]); }).join('<br>') + (probs.length > 6 ? '<br>…and ' + (probs.length - 6) + ' more' : '') + '</div>';
    (first || $('clErr')).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ---------- submit ----------
  function payload(d) {
    function lines(arr) { return (arr || []).filter(function (l) { return l.amount || l.details || (l.files || []).length; }).map(function (l) { return { date: l.date || '', details: l.details, amount: l.amount, files: (l.files || []).map(function (f) { return { id: f.id, name: f.name, mime: f.mime, size: f.size }; }) }; }); }
    if (d.kind === 'advance') return { no: d.no || '', start: d.start, end: d.end || d.start, location: d.location, customers: d.customers, mode: d.mode, modeOther: d.modeOther, purpose: d.purpose, inv: d.inv, currency: d.currency, amount: d.amount, note: d.note };
    var o = { no: d.no || '', kind: d.kind, note: d.note, advances: d.advances || [] };
    if (d.kind === 'local') {
      o.visits = d.visits.map(function (v) { return { start: v.start, end: v.end || v.start, tStart: v.tStart, tEnd: v.tEnd, location: v.location, purpose: v.purpose, customers: v.customers, inv: v.inv, day: v.day, mode: v.mode, km: v.km, tickets: v.mode === 'Public transport' ? lines(v.tickets) : [], overnight: v.overnight || 'No', nights: v.nights }; });
      o.bikeAmount = d.bikeAmount; o.carAmount = d.carAmount; o.oop = lines(d.oop);
    } else {
      o.trips = d.trips.map(function (t) { var h = {}; heads().forEach(function (x) { h[x[0]] = lines(t.heads[x[0]]); }); return { start: t.start, end: t.end || t.start, location: t.location, purpose: t.purpose, customers: t.customers, inv: t.inv, currency: t.currency, heads: h }; });
    }
    return o;
  }
  function setBar(txt, sub, disabled) { var t = bar.querySelector('.t'), b = bar.querySelector('button'); t.innerHTML = '<b>' + esc(txt) + '</b>' + esc(sub || ''); b.disabled = !!disabled; }
  function submit() {
    var d = draft(); if (!d || busy) return;
    var probs = check(d);
    if (probs.length) { Q.toast(probs[0][1]); return showProblems(probs); }
    $('clErr').innerHTML = '';
    if (!online()) return Q.toast('You are offline. Your claim is saved on this phone; submit it when you are connected.');
    var noProof = d.kind !== 'advance' && filesOf(d).length === 0;
    if (noProof && !confirm('No receipts are attached. Submit anyway?')) return;
    busy = true;
    var pending = filesOf(d).filter(function (f) { return !f.id; }), done = 0;
    var chain = Promise.resolve();
    pending.forEach(function (f) {
      chain = chain.then(function () {
        setBar('Uploading receipts…', ' ' + (done + 1) + ' of ' + pending.length, true);
        return getFile(f.lid).then(function (blob) {
          if (!blob) throw new Error('A receipt (' + f.name + ') is missing on this phone. Please attach it again.');
          return toB64(blob);
        }).then(function (b64) { return Q.api('upload', { name: f.name, mime: f.mime, b64: b64 }); })
          .then(function (r) { f.id = r.file.id; done++; save(); });
      });
    });
    chain.then(function () {
      setBar('Submitting…', '', true);
      return Q.api(d.kind === 'advance' ? 'submitAdvance' : 'submitClaim', d.kind === 'advance' ? { advance: payload(d) } : { claim: payload(d) });
    }).then(function (r) {
      busy = false;
      filesOf(d).forEach(function (f) { if (f.lid) delFile(f.lid); });
      delete drafts()[d.id]; Q.persist();
      openRec = r.no;
      flash = '<div class="banner ok"><b>' + esc(r.no) + ' ' + (d.no ? 'resubmitted' : 'submitted') + '.</b> It has gone to your manager for approval; you and accounts got a copy by email.</div>';
      renderHome(); window.scrollTo(0, 0);
      Q.toast((d.kind === 'advance' ? 'Advance request ' : 'Claim ') + r.no + ' submitted ✓');
      refresh();
    }).catch(function (e) {
      busy = false; updateLive();
      if (e.network) return Q.toast('Connection lost. Nothing was lost: tap Submit again when you are online.');
      $('clErr').innerHTML = '<div class="banner err">' + esc(e.message) + '</div>'; $('clErr').scrollIntoView({ behavior: 'smooth', block: 'center' });
      Q.toast(e.message);
      if (/advance|currency/i.test(e.message)) refresh();
    });
  }

  function withdraw(no, btn) {
    if (!online()) return Q.toast('Withdrawing needs internet.');
    var isAdv = /^ADV/.test(no);
    if (!confirm('Withdraw ' + (isAdv ? 'advance request ' : 'claim ') + no + '?\n\nYour manager will be told it is withdrawn and will not need to approve it. You can edit and send it again later with the same number.')) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Withdrawing…'; }
    Q.api('withdraw', { no: no }).then(function () {
      (S().claimRecords || []).forEach(function (r) { if (r.no === no) r.status = 'Withdrawn'; });
      Q.persist(); openRec = no;
      flash = '<div class="banner ok"><b>' + esc(no) + ' withdrawn.</b> Your manager has been told. Tap it and choose <b>Edit &amp; resubmit</b> if you want to send it again.</div>';
      renderHome(); window.scrollTo(0, 0); refresh();
    }).catch(function (e) { if (btn) { btn.disabled = false; btn.textContent = 'Withdraw'; } Q.toast(e.message); });
  }

  function resubmit(no) {
    var existing = Object.keys(drafts()).map(function (k) { return drafts()[k]; }).filter(function (d) { return d.no === no; })[0];
    if (existing) return edit(existing.id);
    if (!online()) return Q.toast('Needs internet to load the claim.');
    Q.toast('Loading ' + no + '…');
    Q.api('getClaim', { no: no }).then(function (r) {
      var d = fromServer(r.record); drafts()[d.id] = d; Q.persist(); edit(d.id);
      return Q.api('claimsCfg').then(function (x) { S().claimsCfg = x.claimsCfg; Q.persist(); if (curId === d.id) rerender(); });
    }).catch(function (e) { Q.toast(e.message); });
  }

  // ---------- settle an advance (link from the reminder email) ----------
  function draftFromAdvance(a, kind) {
    var d = { id: uid(), kind: kind, createdAt: Date.now(), updatedAt: Date.now(), note: '', advances: [a.no], settling: a.no };
    var custs = (a.customers && a.customers.length ? a.customers.slice() : ['']);
    if (kind === 'outstation') {
      var t = newTrip(); t.start = a.from <= today() ? a.from : ''; t.end = a.to <= today() ? a.to : '';
      t.location = a.location || ''; t.purpose = a.purpose || ''; t.customers = custs; t.inv = a.inv || ''; t.currency = a.currency || 'INR';
      d.trips = [t];
    } else {
      var v = newVisit(); v.start = a.from <= today() ? a.from : ''; v.end = a.to <= today() ? a.to : v.start;
      v.location = a.location || ''; v.purpose = a.purpose || ''; v.customers = custs; v.inv = a.inv || '';
      d.visits = [v]; d.bikeAmount = ''; d.carAmount = ''; d.oop = [];
    }
    return d;
  }
  function settle(no) {
    init();
    var existing = Object.keys(drafts()).map(function (k) { return drafts()[k]; }).filter(function (d) { return (d.advances || []).indexOf(no) >= 0; })[0];
    if (existing) { edit(existing.id); Q.toast('Continue your claim for ' + no + '.'); return; }
    if (!online()) { renderHome(); Q.toast('Connect to the internet to settle ' + no + '.'); return; }
    renderHome(); Q.toast('Opening a claim for ' + no + '…');
    Q.api('claimsCfg').then(function (r) {
      S().claimsCfg = r.claimsCfg; Q.persist();
      var a = (r.claimsCfg.advances || []).filter(function (x) { return x.no === no; })[0];
      if (!a) { flash = '<div class="banner warn">Advance <b>' + esc(no) + '</b> is already settled in a claim, or it is not yours.</div>'; renderHome(); return; }
      var d = draftFromAdvance(a, a.currency && a.currency !== 'INR' ? 'outstation' : (/bike|own car|taxi/i.test(a.mode || '') ? 'local' : 'outstation'));
      drafts()[d.id] = d; Q.persist(); edit(d.id);
    }).catch(function (e) { Q.toast(e.network ? 'Could not reach the server. Try again when you are online.' : e.message); });
  }
  function switchSettleKind() {
    var d = draft(); if (!d || !d.settling) return;
    var a = (ccfg().advances || []).filter(function (x) { return x.no === d.settling; })[0]; if (!a) return;
    var other = draftFromAdvance(a, d.kind === 'local' ? 'outstation' : 'local');
    filesOf(d).forEach(function (f) { if (f.lid && !f.id) delFile(f.lid); });
    delete drafts()[d.id]; drafts()[other.id] = other; Q.persist(); edit(other.id);
  }

  // ---------- public ----------
  var inited = false;
  function init() {
    if (inited) return; inited = true; injectCss();
    root = $('tab-claims');
    bar = document.createElement('div'); bar.id = 'cbar'; bar.hidden = true;
    bar.innerHTML = '<i class="cb cb-br"></i><div class="wrap"><div class="t"></div><button type="button">Submit claim</button></div>';
    document.body.appendChild(bar);
    bar.querySelector('button').onclick = submit;
    root.addEventListener('input', onInput);
    root.addEventListener('change', function (ev) { if (ev.target.type === 'checkbox') onClick(ev); else onInput(ev); });
    root.addEventListener('click', function (ev) { if (ev.target.type === 'checkbox') return; onClick(ev); });
    window.addEventListener('online', function () { if (Q.tab() === 'claims') { if (view === 'home') renderHome(); refresh(); } });
    window.addEventListener('offline', function () { if (Q.tab() === 'claims' && view === 'home') renderHome(); });
  }
  window.QTSClaims = {
    attach: function (bridge) { Q = bridge; },
    show: function () { init(); if (view === 'edit' && draft()) { renderEditor(); } else renderHome(); refresh(); },
    settle: function (no) { settle(no); },
    hide: function () { if (bar) bar.hidden = true; }
  };
})();
