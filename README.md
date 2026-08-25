# Focus Timer Dashboard

A minimal static dashboard. The planned focus-timer feature is deliberately
not yet implemented; its four ready-to-file GitHub issue drafts are in
[`docs/issue-drafts`](docs/issue-drafts), with setup instructions in
[`docs/GITHUB_ISSUES.md`](docs/GITHUB_ISSUES.md).

Open `index.html` in a browser to run the app.

## Duration selector integration

`focus-duration-selector.js` supplies the reusable `<focus-duration-selector>`
element for the timer modal. It has no modal or session behavior of its own.
See [`docs/duration-selector-contract.md`](docs/duration-selector-contract.md)
for the integration API.
