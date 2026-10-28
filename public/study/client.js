// /study/client.js — a practice's work asks its viewers, through the house's consent frame (2026-10-27).
//
// A same-origin static file, so it runs under the practices' policy (script-src 'self') with nothing
// new. It puts the house's frame, /study/frame/?study=<id>, into the work, and passes messages between
// the work and the frame. Taking part comes first (since 2026-10-29): the reader takes part in the work
// as it is, and the answers stay in the page. The work hands them to the frame whenever it has them,
// and again when they change. The frame shows them exactly as they would be sent, with the study's
// reason and the consent text, takes the reader's consent and sends nothing before its last button.
// The work sends nothing itself: its constitution forbids it to keep or send answers any other way.
// The frame answers only a person's click, and only inside the work whose study it is.
// The guide: https://github.com/frankbueltge/frankbueltge.de/blob/main/docs/studies/GUIDE.md
//
//   var study = HouseStudy.mount(document.getElementById('ask'), {
//     study: 'studio-what-you-heard',
//     onReady: function () { /* the study takes answers: the work may say so */ },
//     onClosed: function (r) { /* it takes none now: r.reason */ },
//     onResult: function (r) { /* r.stored true or false, r.reason */ },
//   })
//   // whenever the reader has answered something, and again when it changes:
//   study.submit({ heard: 'a gap', weight: 6, urgent: [['food', 'water', 0]], note: null })
;(function () {
  'use strict'
  if (window.HouseStudy) return
  var ORIGIN = window.location.origin

  function mount(container, options) {
    if (!container || !options || typeof options.study !== 'string') throw new Error('HouseStudy.mount(container, { study })')
    var frame = document.createElement('iframe')
    frame.src = '/study/frame/?study=' + encodeURIComponent(options.study)
    frame.title = 'Your answers, and whether to add them to the record, by frankbueltge.de'
    frame.setAttribute('loading', 'lazy')
    frame.style.display = 'block'
    frame.style.width = '100%'
    frame.style.border = '0'
    frame.style.height = '120px'
    container.appendChild(frame)

    var pending = []
    var ready = false
    // the newest answers, kept until the frame is ready for them
    var latest = null
    function offer() {
      if (ready && latest) frame.contentWindow.postMessage({ type: 'house-study:answers', answers: latest }, ORIGIN)
    }
    function onMessage(e) {
      if (e.origin !== ORIGIN || e.source !== frame.contentWindow) return
      var m = e.data || {}
      if (m.type === 'house-study:height' && typeof m.height === 'number') frame.style.height = Math.min(Math.max(m.height, 60), 2400) + 'px'
      else if (m.type === 'house-study:ready') {
        ready = true
        options.onReady && options.onReady(m)
        offer()
      } else if (m.type === 'house-study:closed') options.onClosed && options.onClosed(m)
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
      /** Hands the reader's answers to the frame, which shows them and sends them only when the reader
       *  presses its last button. Call it again when they change; the frame shows the newest. Resolves
       *  with the frame's result. */
      submit: function (answers) {
        latest = answers
        return new Promise(function (resolve) {
          pending.push(resolve)
          offer()
        })
      },
      destroy: function () {
        window.removeEventListener('message', onMessage)
        frame.remove()
      },
    }
  }

  window.HouseStudy = { mount: mount, version: 2 }
})()
