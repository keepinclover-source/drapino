## 2026-10-12 - DOM XSS in Blog Post HTML Rendering
**Vulnerability:** Unsanitized blog post HTML content was directly passed into `dangerouslySetInnerHTML` in `BlogPostModal.tsx`.
**Learning:** Blog post contents modified via rich editors or external sources could contain malicious `<script>` tags, inline event handlers, or unsafe protocols leading to cross-site scripting (XSS) in users' browsers.
**Prevention:** Always pass untrusted dynamic HTML through an HTML sanitizer (`sanitizeHtml`) before rendering with `dangerouslySetInnerHTML`.
