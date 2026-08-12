# Two deployers, one project — the permanently red Workers Build (2026-08-03)

**Occasion.** Every pull request in this repository carries a failing check called
`Workers Builds: frankbueltge-de`. It has failed on #323, #329, #338, #339, #343 — all of
which were merged anyway. A check that is always red teaches everyone to merge past red,
and the day a real check fails it will be merged past too. This note names the cause so the
next session does not re-investigate it, and so the red is understood rather than absorbed.

## Finding

The Cloudflare project `frankbueltge-de` has **two** deployers pointed at it.

1. **GitHub Actions — the working one, and the intended one.**
   `.github/workflows/deploy-cf.yml` builds on GitHub's runners and pushes the finished
   `dist/` with `npx wrangler@4 pages deploy dist --project-name=frankbueltge-de`. Recent
   runs: success. This is the path the workflow's own header describes, and it is the path
   that carries the nightly pipelines to production via `workflow_run`.

2. **A Cloudflare-side git integration — permanently red.**
   Cloudflare also watches this repository directly and tries to build it itself. It cannot
   succeed: the repository contains no `wrangler.toml` / `wrangler.jsonc` and is not a
   Worker project. Its build is a duplicate of a job Actions already does correctly.

The red check blocks nothing — `main` carries no branch protection and no required status
checks. It is noise, not a gate. That is precisely why it is worth removing: noise that
blocks nothing is noise nobody ever fixes.

## Why this is not fixed in the repository

Two repo-side "fixes" exist and both are wrong:

- **Adding a `wrangler.jsonc`** would make the Cloudflare-side build succeed — and would
  then give the project two independent deployers racing on the same production target,
  with different build environments. The Actions build injects `PUBLIC_TURNSTILE_SITE_KEY`
  at build time; a Cloudflare-side build would not, and would ship the `/seed` form in
  permanent standby. Green check, broken site: the worst possible trade.
- **Deleting `deploy-cf.yml`** and letting Cloudflare build would lose the `workflow_run`
  trigger that carries the nightly pipelines to production. Pushes made with the built-in
  `GITHUB_TOKEN` do not fire `on: push`; that is the whole reason the workflow exists.

The correct fix is on Cloudflare's side, in a dashboard this repository has no access to.

## What to do

In the Cloudflare dashboard, on the `frankbueltge-de` project: **disconnect the git
integration / Workers Builds connection.** Deployment continues unchanged through GitHub
Actions — that is already the only path doing the work. The check disappears with it.

Verification afterwards: open any pull request and confirm the check is gone, then confirm
a merge to `main` still produces a successful `deploy-cf.yml` run and a live page.

## Status

Open. Diagnosis committed 2026-08-03; the dashboard action is Frank's, being the one
account holder. Until it is done, `Workers Builds: frankbueltge-de` is a known-red check
with a written cause — which is a different thing from a red check nobody has looked at.
