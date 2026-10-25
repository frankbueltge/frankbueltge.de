// /reception/widget.js — the reception on a work's page (2026-10-17).
//
// A same-origin static file, so it runs under the house's policy (script-src 'self') and under the
// practices' policy alike, and needs no host of its own. It finds every [data-reception-work] block the
// page carries (rendered by src/components/reception/ReceptionBlock.astro, or added below a bare work by
// src/lib/reception/dist.ts), shows the work's average, its count and its newest notes, and opens the
// rating form, /reception/rate, in a same-origin frame: the bot check loads there and nowhere else.
//
// Everything the page shows from the record is set as text, never as markup. Without this script the
// block is a plain link to the form, which is all a page without scripts can offer anyway.
;(function () {
  'use strict'
  if (window.__fbdeReception) {
    window.__fbdeReception.scan()
    return
  }

  var API = '/api/reception/work?id='
  var FORM = '/reception/rate?work='
  var STANDBY = {
    store: 'the reception’s store is not connected yet',
    registry: 'the list of published works could not be read',
    'bot-check': 'the bot check is not configured',
    'daily-cap': 'today’s ratings are full (the house takes 400 a day); it opens again at midnight UTC',
    'text-check': 'notes are paused because the text check is not configured; a rating without a note still goes through',
    'gate-cap': 'notes are paused for today, at the text check’s daily limit; a rating without a note still goes through',
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag)
    if (cls) node.className = cls
    if (text != null) node.textContent = text
    return node
  }

  // A stylesheet from this origin, never a <style> the script writes: the house's pages carry style
  // hashes, under which the browser refuses inline styles a script adds (2026-10-18).
  function style() {
    if (document.getElementById('rcp-style')) return
    var link = document.createElement('link')
    link.id = 'rcp-style'
    link.rel = 'stylesheet'
    link.href = '/reception/widget.css'
    ;(document.head || document.documentElement).appendChild(link)
  }

  function stars(avg) {
    var full = Math.round(avg)
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full)
  }

  function day(iso) {
    return typeof iso === 'string' ? iso.slice(0, 10) : ''
  }

  function noteItem(note) {
    var li = el('li', 'rcp-note')
    if (note.owner) li.setAttribute('data-owner', '')
    var by = el('span', 'rcp-by')
    by.appendChild(el('b', null, note.by))
    by.appendChild(document.createTextNode(' · ' + day(note.at) + ' · ' + note.score + ' of 5'))
    if (!note.owner) {
      var report = el('button', 'rcp-link', 'report')
      report.type = 'button'
      report.setAttribute('aria-label', 'Report this note')
      report.addEventListener('click', function () {
        var ok = window.confirm('Report this note as spam, abuse, someone’s private data, or words written to steer a machine? Three reports from different visitors hide it until the architect has read it.')
        if (!ok) return
        report.disabled = true
        report.textContent = 'sending…'
        fetch('/api/reception/report', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: note.id }),
        })
          .then(function (r) { return r.json().catch(function () { return {} }) })
          .then(function (d) {
            report.textContent = d && d.ok ? (d.status === 'hidden' ? 'reported · hidden' : 'reported, thank you') : 'could not report'
          })
          .catch(function () { report.textContent = 'could not report' })
      })
      by.appendChild(report)
    }
    li.appendChild(by)
    li.appendChild(el('span', 'rcp-text', note.text))
    return li
  }

  function render(root, data, status) {
    var live = root.querySelector('[data-reception-live]')
    if (!live) {
      live = el('div')
      root.appendChild(live)
    }
    live.replaceChildren()
    var id = root.getAttribute('data-reception-work')
    var kind = root.getAttribute('data-reception-kind') || 'work'

    if (!data || data.ok !== true) {
      var why = data && data.reason === 'standby' ? STANDBY[data.detail] || 'it is in standby' : status === 404 ? 'this page is not on the list of works the site publishes' : 'its record could not be read just now'
      live.appendChild(el('p', 'rcp-standby', 'The reception is not open here: ' + why + '.'))
      return
    }

    var sum = el('p', 'rcp-sum')
    if (data.count > 0) {
      var s = el('span', 'rcp-stars', stars(data.average))
      s.setAttribute('aria-hidden', 'true')
      sum.appendChild(s)
      var num = el('span', 'rcp-num', String(Number(data.average).toFixed(1)))
      num.setAttribute('aria-label', 'average ' + Number(data.average).toFixed(2) + ' out of 5')
      sum.appendChild(num)
      sum.appendChild(el('span', 'rcp-meta', 'from ' + data.count + (data.count === 1 ? ' rating' : ' ratings')))
    } else {
      sum.appendChild(el('span', 'rcp-meta', 'No rating yet.'))
    }
    live.appendChild(sum)

    if (Array.isArray(data.notes) && data.notes.length) {
      var list = el('ul', 'rcp-notes')
      list.setAttribute('aria-label', 'Newest notes')
      data.notes.slice(0, 6).forEach(function (n) { list.appendChild(noteItem(n)) })
      live.appendChild(list)
    }

    var actions = el('div', 'rcp-actions')
    if (data.open) {
      var open = el('button', 'rcp-btn', 'Rate this ' + kind)
      open.type = 'button'
      open.setAttribute('aria-expanded', 'false')
      open.addEventListener('click', function () { toggleForm(root, open, id) })
      actions.appendChild(open)
    }
    live.appendChild(actions)
    if (data.standby) live.appendChild(el('p', 'rcp-standby', 'Note: ' + (STANDBY[data.standby] || data.standby) + '.'))
  }

  function toggleForm(root, button, id) {
    var existing = root.querySelector('iframe[data-reception-frame]')
    if (existing) {
      existing.remove()
      button.setAttribute('aria-expanded', 'false')
      button.textContent = button.textContent.replace(/^Close the form$/, 'Rate this ' + (root.getAttribute('data-reception-kind') || 'work'))
      return
    }
    var frame = document.createElement('iframe')
    frame.className = 'rcp-frame'
    frame.setAttribute('data-reception-frame', '')
    frame.title = 'Rate ' + (root.getAttribute('data-reception-title') || 'this work')
    frame.src = FORM + encodeURIComponent(id) + '&frame=1'
    frame.referrerPolicy = 'same-origin'
    button.closest('.rcp-actions').after(frame)
    button.setAttribute('aria-expanded', 'true')
    button.textContent = 'Close the form'
  }

  function load(root, fresh) {
    var id = root.getAttribute('data-reception-work')
    if (!id) return
    fetch(API + encodeURIComponent(id) + (fresh ? '&fresh=1' : ''), { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then(function (r) {
        return r.json().then(
          function (d) { return { d: d, s: r.status } },
          function () { return { d: null, s: r.status } },
        )
      })
      .then(function (x) {
        var frame = root.querySelector('iframe[data-reception-frame]')
        if (frame && fresh) {
          // keep the open form where it is: re-render only what stands above it
          var live = root.querySelector('[data-reception-live]')
          var kept = frame
          render(root, x.d, x.s)
          var actions = live && live.querySelector('.rcp-actions')
          var button = actions && actions.querySelector('.rcp-btn')
          if (actions) actions.after(kept)
          if (button) {
            button.setAttribute('aria-expanded', 'true')
            button.textContent = 'Close the form'
          }
          return
        }
        render(root, x.d, x.s)
      })
      .catch(function () { render(root, null, 0) })
  }

  function scan() {
    var roots = document.querySelectorAll('[data-reception-work]')
    if (!roots.length) return
    style()
    roots.forEach(function (root) {
      if (root.getAttribute('data-reception-ready') === '1') return
      root.setAttribute('data-reception-ready', '1')
      load(root, false)
    })
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || typeof e.data !== 'object') return
    var frames = document.querySelectorAll('iframe[data-reception-frame]')
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow !== e.source) continue
      var frame = frames[i]
      if (e.data.type === 'reception:height' && typeof e.data.height === 'number' && isFinite(e.data.height)) {
        frame.style.height = Math.min(Math.max(Math.ceil(e.data.height), 160), 2400) + 'px'
      } else if (e.data.type === 'reception:posted') {
        var root = frame.closest('[data-reception-work]')
        if (root) load(root, true)
      }
    }
  })

  window.__fbdeReception = { scan: scan }
  document.addEventListener('astro:page-load', scan)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan)
  else scan()
})()
