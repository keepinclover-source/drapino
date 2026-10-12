## 2025-05-18 - Overlay drawers keyboard dismissal pattern
**Learning:** Sliding drawer modals (e.g., NotificationCenter) without explicit keydown listener for `Escape` hinder accessibility for keyboard users navigating RTL layouts.
**Action:** Always register a clean `window` keydown listener when an overlay drawer opens to enable quick `Escape` key dismissal alongside explicit icon `aria-label` attributes.
