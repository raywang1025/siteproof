/**
 * Runs inside the inspected page through Chrome DevTools Protocol.
 * Keep this function self-contained: background.js serializes it with toString().
 */
export function collectPageEvidence(viewport) {
  const findings = [];
  const seen = new Set();
  let findingIndex = 0;

  const addFinding = ({
    rule,
    severity,
    category,
    title,
    message,
    element,
    evidence,
    heuristics = []
  }) => {
    const key = `${rule}:${element || ""}:${message || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    findingIndex += 1;
    findings.push({
      id: `${rule}-${String(findingIndex).padStart(3, "0")}`,
      rule,
      severity,
      category,
      title,
      message,
      element: element || null,
      evidence: evidence || null,
      heuristics
    });
  };

  const isVisible = (element) => {
    if (!(element instanceof Element)) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) !== 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  };

  const escapePart = (value) => {
    if (globalThis.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  };

  const selectorFor = (element) => {
    if (!(element instanceof Element)) return null;
    if (element.id) return `#${escapePart(element.id)}`;

    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
      let part = current.tagName.toLowerCase();
      const classes = [...current.classList]
        .filter((name) => name && !name.match(/^(active|open|selected|hover)$/i))
        .slice(0, 2);
      if (classes.length) {
        part += classes.map((name) => `.${escapePart(name)}`).join("");
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = [...parent.children].filter(
          (sibling) => sibling.tagName === current.tagName
        );
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(" > ");
  };

  const isExtensionInjected = (element) => {
    if (!(element instanceof Element)) return false;
    const extensionUrl = /^(?:chrome|moz|safari-web)-extension:\/\//i;
    let current = element;

    while (current instanceof Element) {
      for (const attribute of ["src", "href", "action", "poster"]) {
        if (extensionUrl.test(current.getAttribute(attribute) || "")) {
          return true;
        }
      }
      if (
        current instanceof HTMLImageElement &&
        extensionUrl.test(current.currentSrc || current.src || "")
      ) {
        return true;
      }
      current = current.parentElement;
    }

    return false;
  };

  const accessibleName = (element) => {
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel?.trim()) return ariaLabel.trim();

    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim())
        .filter(Boolean)
        .join(" ");
      if (text) return text;
    }

    if (element instanceof HTMLInputElement) {
      if (element.labels?.length) {
        const text = [...element.labels]
          .map((label) => label.textContent?.trim())
          .filter(Boolean)
          .join(" ");
        if (text) return text;
      }
      if (element.type === "submit" || element.type === "button") {
        return element.value?.trim() || "";
      }
    }

    const text = element.textContent?.replace(/\s+/g, " ").trim();
    if (text) return text;
    const title = element.getAttribute("title");
    if (title?.trim()) return title.trim();
    const imageAlt = element.querySelector("img[alt]")?.getAttribute("alt");
    return imageAlt?.trim() || "";
  };

  const parseRgb = (value) => {
    const match = value?.match(
      /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/
    );
    if (!match) return null;
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] === undefined ? 1 : Number(match[4])
    };
  };

  const backgroundFor = (element) => {
    let current = element;
    while (current instanceof Element) {
      const color = parseRgb(getComputedStyle(current).backgroundColor);
      if (color && color.a > 0.95) return color;
      current = current.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const luminance = ({ r, g, b }) => {
    const channels = [r, g, b].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };

  const contrastRatio = (foreground, background) => {
    const light = Math.max(luminance(foreground), luminance(background));
    const dark = Math.min(luminance(foreground), luminance(background));
    return (light + 0.05) / (dark + 0.05);
  };

  const title = document.title.trim();
  if (!title) {
    addFinding({
      rule: "SEO_TITLE",
      severity: "major",
      category: "seo",
      title: "Missing page title",
      message: "The document does not provide a non-empty <title>.",
      element: "head > title"
    });
  }

  const description = document
    .querySelector('meta[name="description" i]')
    ?.getAttribute("content")
    ?.trim();
  if (!description) {
    addFinding({
      rule: "SEO_DESCRIPTION",
      severity: "minor",
      category: "seo",
      title: "Missing meta description",
      message: "The page has no non-empty meta description.",
      element: 'meta[name="description"]'
    });
  }

  const lang = document.documentElement.getAttribute("lang")?.trim();
  if (!lang) {
    addFinding({
      rule: "A11Y_LANG",
      severity: "minor",
      category: "accessibility",
      title: "Missing page language",
      message: "The root <html> element has no lang attribute.",
      element: "html",
      heuristics: ["H2"]
    });
  }

  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(
    isVisible
  );
  const h1s = headings.filter((heading) => heading.tagName === "H1");
  if (h1s.length !== 1) {
    addFinding({
      rule: "STRUCTURE_H1",
      severity: h1s.length === 0 ? "major" : "minor",
      category: "structure",
      title: h1s.length === 0 ? "Missing H1" : "Multiple H1 headings",
      message: `Found ${h1s.length} visible H1 headings; expected one clear page heading.`,
      element: h1s[0] ? selectorFor(h1s[0]) : "body",
      evidence: { count: h1s.length },
      heuristics: ["H4", "H6"]
    });
  }

  let previousLevel = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    if (previousLevel && level > previousLevel + 1) {
      addFinding({
        rule: "STRUCTURE_HEADING_ORDER",
        severity: "minor",
        category: "structure",
        title: "Heading level is skipped",
        message: `Heading order jumps from H${previousLevel} to H${level}.`,
        element: selectorFor(heading),
        evidence: {
          text: heading.textContent?.trim().slice(0, 120),
          from: previousLevel,
          to: level
        },
        heuristics: ["H4", "H6"]
      });
    }
    previousLevel = level;
  }

  for (const image of [...document.images].filter(
    (item) => !isExtensionInjected(item)
  )) {
    if (!image.hasAttribute("alt")) {
      addFinding({
        rule: "A11Y_IMAGE_ALT",
        severity: "minor",
        category: "accessibility",
        title: "Image is missing alt",
        message: "The image has no alt attribute. Use descriptive text or alt=\"\" for decoration.",
        element: selectorFor(image),
        evidence: { src: image.currentSrc || image.src }
      });
    }
  }

  const controls = [
    ...document.querySelectorAll(
      'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]'
    )
  ].filter((element) => isVisible(element) && !isExtensionInjected(element));

  const touchMinimumFailures = [];
  const touchComfortObservations = [];
  const touchRects = controls.map((control) => ({
    control,
    rect: control.getBoundingClientRect()
  }));
  const hasMinimumSpacing = (candidate) => {
    const centerX = candidate.rect.left + candidate.rect.width / 2;
    const centerY = candidate.rect.top + candidate.rect.height / 2;
    return touchRects.every((other) => {
      if (other.control === candidate.control) return true;
      const otherCenterX = other.rect.left + other.rect.width / 2;
      const otherCenterY = other.rect.top + other.rect.height / 2;
      return (
        Math.abs(centerX - otherCenterX) >= 24 ||
        Math.abs(centerY - otherCenterY) >= 24
      );
    });
  };

  for (const candidate of touchRects) {
    const { control, rect } = candidate;
    const instance = {
      element: selectorFor(control),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      label: accessibleName(control).slice(0, 120)
    };

    if (
      viewport.mobile &&
      (rect.width < 24 || rect.height < 24) &&
      !hasMinimumSpacing(candidate)
    ) {
      touchMinimumFailures.push(instance);
    } else if (
      viewport.mobile &&
      (rect.width < 44 || rect.height < 44)
    ) {
      touchComfortObservations.push(instance);
    }

    if (!accessibleName(control)) {
      addFinding({
        rule: "A11Y_CONTROL_NAME",
        severity: "major",
        category: "accessibility",
        title: "Interactive control has no accessible name",
        message: "The control cannot be identified from visible text or accessible attributes.",
        element: selectorFor(control),
        heuristics: ["H2", "H9", "H10"]
      });
    }
  }

  if (touchMinimumFailures.length) {
    addFinding({
      rule: "TOUCH_TARGET_MIN",
      severity: "minor",
      category: "accessibility",
      title: "Touch targets do not meet the 24 CSS px minimum",
      message: `${touchMinimumFailures.length} interactive target${
        touchMinimumFailures.length === 1 ? "" : "s"
      } are smaller than 24 × 24 CSS px without sufficient spacing.`,
      element: touchMinimumFailures[0].element,
      evidence: {
        standard: "WCAG 2.2 SC 2.5.8 Target Size (Minimum)",
        count: touchMinimumFailures.length,
        instances: touchMinimumFailures.slice(0, 20),
        truncated: touchMinimumFailures.length > 20
      },
      heuristics: ["H7"]
    });
  }

  if (touchComfortObservations.length) {
    addFinding({
      rule: "TOUCH_TARGET_COMFORT",
      severity: "observation",
      category: "responsive",
      title: "Touch targets are below the comfort recommendation",
      message: `${touchComfortObservations.length} interactive target${
        touchComfortObservations.length === 1 ? "" : "s"
      } are below 44 × 44 CSS px. Treat this as a mobile comfort review, not an automatic launch failure.`,
      element: touchComfortObservations[0].element,
      evidence: {
        recommendation: "44 × 44 CSS px touch comfort",
        count: touchComfortObservations.length,
        instances: touchComfortObservations.slice(0, 20),
        truncated: touchComfortObservations.length > 20
      },
      heuristics: ["H7"]
    });
  }

  const genericLabels = new Set([
    "click here",
    "here",
    "more",
    "read more",
    "learn more",
    "點這裡",
    "按這裡",
    "更多",
    "了解更多"
  ]);
  const visiblePageLinks = [...document.querySelectorAll("a[href]")].filter(
    (element) => isVisible(element) && !isExtensionInjected(element)
  );
  for (const link of visiblePageLinks) {
    const label = accessibleName(link).toLowerCase();
    if (genericLabels.has(label)) {
      addFinding({
        rule: "UX_AMBIGUOUS_LINK",
        severity: "minor",
        category: "ux",
        title: "Ambiguous link label",
        message: `The link label “${accessibleName(
          link
        )}” may be unclear outside its visual context.`,
        element: selectorFor(link),
        evidence: { href: link.href, label: accessibleName(link) },
        heuristics: ["H2", "H6"]
      });
    }
  }

  const labelTargets = new Map();
  for (const link of visiblePageLinks) {
    const label = accessibleName(link).toLowerCase();
    if (!label) continue;
    const destinations = labelTargets.get(label) || new Set();
    destinations.add(link.href);
    labelTargets.set(label, destinations);
  }
  for (const [label, destinations] of labelTargets.entries()) {
    if (destinations.size > 1) {
      addFinding({
        rule: "UX_LABEL_DESTINATION",
        severity: "minor",
        category: "ux",
        title: "Same link label leads to different destinations",
        message: `“${label}” points to ${destinations.size} destinations; verify that users can predict each result.`,
        element: "a[href]",
        evidence: { label, destinations: [...destinations].slice(0, 8) },
        heuristics: ["H4", "H6"]
      });
    }
  }

  const viewportWidth = window.innerWidth;
  const configuredViewportWidth =
    Number(viewport?.width) > 0 ? Number(viewport.width) : viewportWidth;
  const layoutScaleRatio = viewportWidth / configuredViewportWidth;

  if (viewport.mobile && layoutScaleRatio > 1.1) {
    addFinding({
      rule: "RESPONSIVE_VIEWPORT_SCALE",
      severity: "major",
      category: "responsive",
      title: "Page layout is wider than the device viewport",
      message: `The browser is fitting a ${Math.round(
        viewportWidth
      )} CSS px layout into a ${configuredViewportWidth} CSS px device viewport. The page may appear zoomed out instead of responsive.`,
      element: "html",
      evidence: {
        configuredViewportWidth,
        layoutViewportWidth: viewportWidth,
        layoutScaleRatio: Number(layoutScaleRatio.toFixed(2)),
        visualViewportWidth: Number(
          (window.visualViewport?.width || viewportWidth).toFixed(2)
        ),
        visualViewportScale: Number(
          (window.visualViewport?.scale || 1).toFixed(3)
        ),
        documentWidth: document.documentElement.scrollWidth
      }
    });
  }

  const overflowElements = [...document.querySelectorAll("body *")]
    .filter((element) => isVisible(element) && !isExtensionInjected(element))
    .map((element) => ({
      element,
      rect: element.getBoundingClientRect(),
      style: getComputedStyle(element)
    }))
    .filter(
      ({ rect, style }) =>
        style.position !== "fixed" &&
        (rect.right > viewportWidth + 2 || rect.left < -2)
    )
    .sort(
      (a, b) =>
        Math.max(b.rect.right - viewportWidth, -b.rect.left) -
        Math.max(a.rect.right - viewportWidth, -a.rect.left)
    )
    .slice(0, 20);

  for (const { element, rect } of overflowElements) {
    addFinding({
      rule: "RESPONSIVE_OVERFLOW",
      severity: "major",
      category: "responsive",
      title: "Element extends beyond the viewport",
      message: `Element spans x=${Math.round(rect.left)} to ${Math.round(
        rect.right
      )} in a ${viewportWidth}px viewport.`,
      element: selectorFor(element),
      evidence: {
        viewportWidth,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        overflowBy: Math.round(Math.max(rect.right - viewportWidth, -rect.left))
      }
    });
  }

  const textCandidates = [
    ...document.querySelectorAll("p,li,label,a,button,h1,h2,h3,h4,h5,h6")
  ]
    .filter((element) => isVisible(element) && !isExtensionInjected(element))
    .filter((element) => element.textContent?.trim())
    .slice(0, 400);

  const contrastGroups = new Map();
  for (const element of textCandidates) {
    const style = getComputedStyle(element);
    const foreground = parseRgb(style.color);
    const background = backgroundFor(element);
    if (!foreground || foreground.a < 0.95) continue;
    const ratio = contrastRatio(foreground, background);
    const fontSize = Number.parseFloat(style.fontSize);
    const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
    const threshold = isLarge ? 3 : 4.5;
    if (ratio + 0.05 < threshold) {
      const backgroundColor = `rgb(${background.r}, ${background.g}, ${background.b})`;
      const groupKey = `${style.color}|${backgroundColor}|${threshold}`;
      const group = contrastGroups.get(groupKey) || {
        ratio: Number(ratio.toFixed(2)),
        threshold,
        color: style.color,
        background: backgroundColor,
        instances: []
      };
      group.instances.push({
        element: selectorFor(element),
        sample: element.textContent.trim().replace(/\s+/g, " ").slice(0, 100)
      });
      contrastGroups.set(groupKey, group);
    }
  }

  for (const group of contrastGroups.values()) {
    addFinding({
      rule: "A11Y_CONTRAST",
      severity: "major",
      category: "accessibility",
      title: "Low text contrast",
      message: `${group.instances.length} text element${
        group.instances.length === 1 ? "" : "s"
      } share an estimated contrast of ${group.ratio}:1, below the ${group.threshold}:1 threshold.`,
      element: group.instances[0].element,
      evidence: {
        ratio: group.ratio,
        threshold: group.threshold,
        color: group.color,
        background: group.background,
        count: group.instances.length,
        instances: group.instances.slice(0, 20),
        truncated: group.instances.length > 20
      },
      heuristics: []
    });
  }

  const requiredFields = [
    ...document.querySelectorAll("input[required],select[required],textarea[required]")
  ].filter((element) => isVisible(element) && !isExtensionInjected(element));
  for (const field of requiredFields) {
    const describedBy = field.getAttribute("aria-describedby");
    const nearbyMessage =
      describedBy ||
      field.parentElement?.querySelector(
        '[role="alert"],[aria-live],.error,.help,.hint'
      );
    if (!nearbyMessage) {
      addFinding({
        rule: "UX_REQUIRED_FIELD_GUIDANCE",
        severity: "minor",
        category: "ux",
        title: "Required field has no visible guidance",
        message:
          "No nearby help or error-message relationship was detected for this required field.",
        element: selectorFor(field),
        heuristics: ["H5", "H9", "H10"]
      });
    }
  }

  const landmarks = {
    main: document.querySelectorAll("main,[role='main']").length,
    navigation: document.querySelectorAll("nav,[role='navigation']").length
  };
  if (!landmarks.main) {
    addFinding({
      rule: "STRUCTURE_MAIN",
      severity: "minor",
      category: "structure",
      title: "No main landmark detected",
      message: "The page has no <main> element or role=\"main\" landmark.",
      element: "body",
      heuristics: ["H4", "H6"]
    });
  }

  return {
    viewport,
    page: {
      url: location.href,
      title,
      description: description || "",
      lang: lang || "",
      viewportWidth: window.innerWidth,
      configuredViewportWidth,
      visualViewportWidth: Number(
        (window.visualViewport?.width || window.innerWidth).toFixed(2)
      ),
      visualViewportScale: Number(
        (window.visualViewport?.scale || 1).toFixed(3)
      ),
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight
    },
    inventory: {
      images: document.images.length,
      headings: headings.length,
      links: document.links.length,
      interactiveControls: controls.length,
      forms: document.forms.length,
      requiredFields: requiredFields.length,
      landmarks
    },
    primaryActions: controls
      .map((control) => ({
        label: accessibleName(control).slice(0, 120),
        selector: selectorFor(control),
        href: control instanceof HTMLAnchorElement ? control.href : null
      }))
      .filter((item) => item.label)
      .slice(0, 30),
    findings
  };
}
