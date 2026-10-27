// /study/client.js — a practice's work asks its viewers, through the house's consent frame (2026-10-27).
//
// A same-origin static file, so it runs under the practices' policy (script-src 'self') with nothing
// new. It puts the house's frame, /study/frame/?study=<id>, into the work, and passes messages between
// the work and the frame. The frame shows the study and the consent text, takes the consent, shows the
// reader the answers before anything is sent, and sends them; the work never sends anything itself.
// The guide: https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/studies/GUIDE.md
//
//   var study = HouseStudy.mount(document.getElementById('ask'), {
//     study: 'studio-what-you-heard',
//     onConsent: function () { /* the reader agreed: start asking */ },
//     onResult: function (r) { /* r.stored true or false, r.reason */ },
//     onClosed: function (r) { /* the study takes no answers now: r.reason */ },
//   })
//   // ... when the reader is done:
//   study.submit({ heard: 'a gap', weight: 6, note: null }).then(function (r) { ... })
;(function () {
  'use strict'
  if (window.HouseStudy) return
  var ORIGIN = window.location.origin

  function mount(container, options) {
    if (!container || !options || typeof options.study !== 'string') throw new Error('HouseStudy.mount(container, { study })')
    var frame = document.createElement('iframe')
    frame.src = '/study/frame/?study=' + encodeURIComponent(options.study)
    frame.title = 'Consent and sending, by frankbueltge.de'
    frame.setAttribute('loading', 'lazy')
    frame.style.display = 'block'
    frame.style.width = '100%'
    frame.style.border = '0'
    frame.style.height = '320px'
    container.appendChild(frame)

    var pending = []
    function onMessage(e) {
      if (e.origin !== ORIGIN || e.source !== frame.contentWindow) return
      var m = e.data || {}
      if (m.type === 'house-study:height' && typeof m.height === 'number') frame.style.height = Math.min(Math.max(m.height, 120), 2400) + 'px'
      else if (m.type === 'house-study:consent') options.onConsent && options.onConsent(m)
      else if (m.type === 'house-study:closed') options.onClosed && options.onClosed(m)
      else if (m.type === 'house-study:result') {
        options.onResult && options.onResult(m)
        var waiting = pending
        pending = []
        for (var i = 0; i < waiting.length; i++) waiting[i](m)
      }
    }
    window.addEventListener('message', onMessage)

    return {
      frame: frame,
      /** Hands the reader's answers to the frame, which shows them back and sends them only when the
       *  reader presses its last button. Resolves with the frame's result. */
      submit: function (answers) {
        return new Promise(function (resolve) {
          pending.push(resolve)
          frame.contentWindow.postMessage({ type: 'house-study:answers', answers: answers }, ORIGIN)
          frame.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
      },
      destroy: function () {
        window.removeEventListener('message', onMessage)
        frame.remove()
      },
    }
  }

  window.HouseStudy = { mount: mount, version: 1 }
})()
