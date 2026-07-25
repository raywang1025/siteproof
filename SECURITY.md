# Security and privacy

SiteProof is local-first. The extension does not send page content, screenshots,
audit findings, cookies, or credentials to a SiteProof server.

## Why the debugger permission exists

Chrome requires the `debugger` permission to let an extension use supported
Chrome DevTools Protocol domains. SiteProof uses it only on temporary audit tabs
that it creates for:

- device-metric emulation;
- viewport screenshots;
- Console and JavaScript exceptions;
- failed Network responses;
- DOM evaluation for deterministic audit rules.

The temporary tab is detached and closed after each viewport. SiteProof does not
submit forms, perform purchases, or intentionally modify the audited site.

## Current PoC limitations

- Reports and screenshots are kept in `chrome.storage.local`.
- Auditing authenticated pages is out of scope.
- Do not use the PoC on sites containing sensitive personal or customer data.
- Chrome's debugger permission is powerful. Review the source before installing
  an unpacked build.

## Reporting a vulnerability

Please open a GitHub security advisory after the public repository is created.
Avoid putting sensitive reproduction details in a public issue.
