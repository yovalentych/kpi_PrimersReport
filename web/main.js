const SAMPLE_SEQUENCE = `>Mycobacterium tuberculosis target fragment
GTGGACACGTACGCGGGTGCTTACGACCGTCAGTCGCGCGAGCGCGAGAATTCGAGCGCAGCAAGCCCAGCGACACAGCGTAGCGCCAACGAAGACAAGGCGGCCGACCTTCAGCGCGAAGTCGAGCGCGACGGGGGCCGGTTCAGGTTCGTCGGGCATTTCAGCGAAGCGCCGGGCACGTCGGCGTTCGGGACGGCGGAGCGCCCGGAGTTCGAACGCATCCTGAACGAATGCCGCGCCGGGCGGCTCAACATGATCATTGTCTATGACGTGTCGCGCTTCTCGCGCCTGAAGGTCATGGACGCGATTCCGATTGTCTCGGAATTGCTCGCCCTGGGCGTGACGATTGTTTCCACTCAGGAAGGCGTCTTCCGGCAGGGAAACGTCATGGACCTGATTCACCTGATTATGCGGCTCGACGCGTCGCACAAAGAATCTTCGCTGAAGTCGGCGAAGATTCTCGACACGAAGAACCTTCAGCGCGAATTGGGCGGGTACGTCGGCGGGAAGGCGCCTTACGGCTTCGAGCTTGTTTCGGAGACGAAGGAGATCACGCGCAACGGCCGAATGGTCAATGTCGTCATCAACAAGCTTGCGCACTCGACCACTCCCCTTACCGGACCCTTCGAGTTCGAGCCCGACGTAATCCGGTGGTGGTGGCGTGAGATCAAGACGCACAAACACCTTCCCTTCAAGCCGGGCAGTCAAGCCGCCATTCACCCGGGCAGCATCACGGGGCTTTGTAAGCGCATGGACGCTGACGCCGTGCCGACCCGGGGCGAGACGATTGGGAAGAAGACCGCTTCAAGCGCCTGGGACCCGGCAACCGTTATGCGAATCCTTCGGGACCCGCGTATTGCGGGCTTCGCCGCTGAGGTGATCTACAAGAAGAAGCCGGACGGCACGCCGACCACGAAGATTGAGGGTTACCGCATTCAGCGCGACCCGATCACGCTCCGGCCGGTCGAGCTTGATTGCGGACCGATCATCGAGCCCGCTGAGTGGTATGAGCTTCAGGCGTGGTTGGACGGCAGGGGGCGCGGCAAGGGGCTTTCCCGGGGGCAAGCCAT`;

const elements = {
  sequenceInput: document.getElementById("dnaSequence"),
  sampleBtn: document.getElementById("sampleBtn"),
  clearBtn: document.getElementById("clearBtn"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  copyReportBtn: document.getElementById("copyReportBtn"),
  replayAnimationBtn: document.getElementById("replayAnimationBtn"),
  baseCount: document.getElementById("baseCount"),
  gcSummary: document.getElementById("gcSummary"),
  validationMessage: document.getElementById("validationMessage"),
  sequenceStatus: document.getElementById("sequenceStatus"),
  minLength: document.getElementById("minLength"),
  optLength: document.getElementById("optLength"),
  maxLength: document.getElementById("maxLength"),
  minGc: document.getElementById("minGc"),
  maxGc: document.getElementById("maxGc"),
  minTm: document.getElementById("minTm"),
  optTm: document.getElementById("optTm"),
  maxTm: document.getElementById("maxTm"),
  maxDeltaTm: document.getElementById("maxDeltaTm"),
  minProduct: document.getElementById("minProduct"),
  maxProduct: document.getElementById("maxProduct"),
  maxRun: document.getElementById("maxRun"),
  candidateLimit: document.getElementById("candidateLimit"),
  forwardCard: document.getElementById("forwardCard"),
  reverseCard: document.getElementById("reverseCard"),
  candidatePairs: document.getElementById("candidatePairs"),
  reportOutput: document.getElementById("reportOutput"),
  ampliconSize: document.getElementById("ampliconSize"),
  deltaTm: document.getElementById("deltaTm"),
  pairScore: document.getElementById("pairScore"),
  sequenceMap: document.getElementById("sequenceMap"),
  pcrAnimation: document.getElementById("pcrAnimation"),
  nucleotidePreview: document.getElementById("nucleotidePreview"),
  ampliconLabel: document.getElementById("ampliconLabel"),
};

const state = {
  report: "",
  latestPair: null,
  latestPairs: [],
};

function sanitizeSequence(value) {
  return value
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(">"))
    .join("")
    .replace(/\s+/g, "")
    .toUpperCase();
}

function getGcCount(sequence) {
  return [...sequence].filter((base) => base === "G" || base === "C").length;
}

function getGcPercent(sequence) {
  if (!sequence.length) {
    return 0;
  }
  return (getGcCount(sequence) / sequence.length) * 100;
}

function getTm(sequence) {
  const gc = getGcCount(sequence);
  const at = sequence.length - gc;
  return gc * 4 + at * 2;
}

function complement(sequence) {
  const map = { A: "T", T: "A", C: "G", G: "C" };
  return [...sequence].map((base) => map[base]).join("");
}

function reverseComplement(sequence) {
  return complement(sequence).split("").reverse().join("");
}

function validateSequence(sequence) {
  if (!sequence) {
    return "Вставте ДНК-послідовність або FASTA.";
  }
  if (/[^ACGT]/.test(sequence)) {
    return "Послідовність має містити тільки A, C, G, T.";
  }
  if (sequence.length < 45) {
    return "Для підбору пари праймерів потрібно мінімум 45 bp.";
  }
  return "";
}

function readSettings() {
  const minLength = Number(elements.minLength.value);
  const optLength = Number(elements.optLength.value);
  const maxLength = Number(elements.maxLength.value);
  const minGc = Number(elements.minGc.value);
  const maxGc = Number(elements.maxGc.value);
  const minTm = Number(elements.minTm.value);
  const optTm = Number(elements.optTm.value);
  const maxTm = Number(elements.maxTm.value);
  const maxDeltaTm = Number(elements.maxDeltaTm.value);
  const minProduct = Number(elements.minProduct.value);
  const maxProduct = Number(elements.maxProduct.value);
  const maxRun = Number(elements.maxRun.value);
  const candidateLimit = Number(elements.candidateLimit.value);

  if (minLength > maxLength) {
    throw new Error("Мінімальна довжина не може бути більшою за максимальну.");
  }
  if (optLength < minLength || optLength > maxLength) {
    throw new Error("Оптимальна довжина має бути між мінімальною та максимальною.");
  }
  if (minGc > maxGc) {
    throw new Error("Мінімальний GC не може бути більшим за максимальний.");
  }
  if (minTm > maxTm) {
    throw new Error("Мінімальна Tm не може бути більшою за максимальну.");
  }
  if (optTm < minTm || optTm > maxTm) {
    throw new Error("Оптимальна Tm має бути між мінімальною та максимальною.");
  }
  if (minProduct > maxProduct) {
    throw new Error("Мінімальний продукт не може бути більшим за максимальний.");
  }

  return {
    minLength,
    optLength,
    maxLength,
    minGc,
    maxGc,
    minTm,
    optTm,
    maxTm,
    maxDeltaTm,
    minProduct,
    maxProduct,
    maxRun,
    candidateLimit,
  };
}

function analyzePrimer(name, sequence, start, end, direction) {
  const gcPercent = getGcPercent(sequence);
  const tm = getTm(sequence);
  return {
    name,
    sequence,
    start,
    end,
    direction,
    length: sequence.length,
    gcCount: getGcCount(sequence),
    gcPercent,
    tm,
    complement: complement(sequence),
    reverseComplement: reverseComplement(sequence),
    endGcCount: getEndGcCount(sequence),
    maxRun: getMaxHomopolymerRun(sequence),
    maxDinucleotideRun: getMaxDinucleotideRun(sequence),
    selfComplementarity: getSelfComplementarityScore(sequence),
  };
}

function scorePrimer(primer, settings) {
  const gcTarget = (settings.minGc + settings.maxGc) / 2;
  const lengthTarget = settings.optLength;
  const gcPenalty = Math.abs(primer.gcPercent - gcTarget) * 1.35;
  const tmPenalty = Math.abs(primer.tm - settings.optTm) * 2.2;
  const lengthPenalty = Math.abs(primer.length - lengthTarget) * 1.4;
  const clampPenalty = primer.sequence.endsWith("G") || primer.sequence.endsWith("C") ? 0 : 12;
  const endGcPenalty = primer.endGcCount > 3 ? (primer.endGcCount - 3) * 4 : 0;
  const runPenalty = primer.maxRun > settings.maxRun ? (primer.maxRun - settings.maxRun) * 8 : 0;
  const repeatPenalty = primer.maxDinucleotideRun >= 4 ? (primer.maxDinucleotideRun - 3) * 5 : 0;
  const selfPenalty = primer.selfComplementarity > 3 ? (primer.selfComplementarity - 3) * 4 : 0;
  return 100 - gcPenalty - tmPenalty - lengthPenalty - clampPenalty - endGcPenalty - runPenalty - repeatPenalty - selfPenalty;
}

function getEndGcCount(sequence) {
  return getGcCount(sequence.slice(-5));
}

function getMaxHomopolymerRun(sequence) {
  let maxRun = 1;
  let currentRun = 1;

  for (let index = 1; index < sequence.length; index += 1) {
    if (sequence[index] === sequence[index - 1]) {
      currentRun += 1;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 1;
    }
  }

  return maxRun;
}

function getMaxDinucleotideRun(sequence) {
  let maxRun = 1;

  for (let index = 0; index <= sequence.length - 4; index += 1) {
    const motif = sequence.slice(index, index + 2);
    let run = 1;
    let cursor = index + 2;

    while (sequence.slice(cursor, cursor + 2) === motif) {
      run += 1;
      cursor += 2;
    }

    maxRun = Math.max(maxRun, run);
  }

  return maxRun;
}

function getSelfComplementarityScore(sequence) {
  const rc = reverseComplement(sequence);
  let best = 0;

  for (let left = 0; left < sequence.length; left += 1) {
    for (let right = 0; right < rc.length; right += 1) {
      let length = 0;
      while (sequence[left + length] && sequence[left + length] === rc[right + length]) {
        length += 1;
      }
      best = Math.max(best, length);
    }
  }

  return best;
}

function getPairComplementarityScore(forward, reverse) {
  const rcReverse = reverseComplement(reverse.sequence);
  let best = 0;

  for (let left = 0; left < forward.sequence.length; left += 1) {
    for (let right = 0; right < rcReverse.length; right += 1) {
      let length = 0;
      while (forward.sequence[left + length] && forward.sequence[left + length] === rcReverse[right + length]) {
        length += 1;
      }
      best = Math.max(best, length);
    }
  }

  return best;
}

function getThreePrimeComplementarityScore(forward, reverse) {
  const forwardTail = forward.sequence.slice(-5);
  const reverseTailRc = reverseComplement(reverse.sequence.slice(-5));
  let best = 0;

  for (let left = 0; left < forwardTail.length; left += 1) {
    for (let right = 0; right < reverseTailRc.length; right += 1) {
      let length = 0;
      while (forwardTail[left + length] && forwardTail[left + length] === reverseTailRc[right + length]) {
        length += 1;
      }
      best = Math.max(best, length);
    }
  }

  return best;
}

function findCandidates(sequence, side, settings) {
  const candidates = [];

  for (let start = 0; start <= sequence.length - settings.minLength; start += 1) {
    for (let length = settings.minLength; length <= settings.maxLength; length += 1) {
      const end = start + length;
      const rawSite = sequence.slice(start, end);

      if (rawSite.length !== length) {
        continue;
      }

      const primerSequence = side === "forward" ? rawSite : reverseComplement(rawSite);
      const primer = analyzePrimer(
        side === "forward" ? "Forward" : "Reverse",
        primerSequence,
        start + 1,
        end,
        side
      );

      const gcOk = primer.gcPercent >= settings.minGc && primer.gcPercent <= settings.maxGc;
      const tmOk = primer.tm >= settings.minTm && primer.tm <= settings.maxTm;
      const clampOk = /[GC]$/.test(primer.sequence);
      const endGcOk = primer.endGcCount <= 3;
      const runOk = primer.maxRun <= settings.maxRun;
      const dinucleotideOk = primer.maxDinucleotideRun < 4;

      if (gcOk && tmOk && clampOk && endGcOk && runOk && dinucleotideOk) {
        candidates.push({ ...primer, score: scorePrimer(primer, settings) });
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

function findPrimerPairs(sequence, settings) {
  const forwardCandidates = findCandidates(sequence, "forward", settings);
  const reverseCandidates = findCandidates(sequence, "reverse", settings);

  if (!forwardCandidates.length || !reverseCandidates.length) {
    throw new Error("Не вдалося знайти праймери з поточними параметрами. Розширте межі довжини, GC або Tm.");
  }

  const pairs = [];
  const topForward = forwardCandidates.slice(0, 350);
  const topReverse = reverseCandidates.slice(0, 350);

  for (const forward of topForward) {
    for (const reverse of topReverse) {
      if (reverse.start <= forward.end) {
        continue;
      }

      const ampliconSize = reverse.end - forward.start + 1;
      if (ampliconSize < settings.minProduct || ampliconSize > settings.maxProduct) {
        continue;
      }

      const deltaTm = Math.abs(forward.tm - reverse.tm);
      if (deltaTm > settings.maxDeltaTm) {
        continue;
      }

      const deltaGc = Math.abs(forward.gcPercent - reverse.gcPercent);
      const pairComplementarity = getPairComplementarityScore(forward, reverse);
      const threePrimeComplementarity = getThreePrimeComplementarityScore(forward, reverse);
      const productTarget = (settings.minProduct + settings.maxProduct) / 2;
      const productPenalty = Math.abs(ampliconSize - productTarget) / Math.max(productTarget, 1) * 12;
      const pairPenalty = pairComplementarity > 4 ? (pairComplementarity - 4) * 5 : 0;
      const tailPenalty = threePrimeComplementarity > 2 ? (threePrimeComplementarity - 2) * 10 : 0;
      const pairScore = forward.score + reverse.score - deltaTm * 4 - deltaGc * 0.7 - productPenalty - pairPenalty - tailPenalty;

      pairs.push({
        forward,
        reverse,
        deltaTm,
        deltaGc,
        ampliconSize,
        pairComplementarity,
        threePrimeComplementarity,
        pairScore,
      });
    }
  }

  const uniquePairs = [];
  const seen = new Set();

  pairs
    .sort((a, b) => b.pairScore - a.pairScore)
    .forEach((pair) => {
      const key = `${pair.forward.start}-${pair.forward.end}-${pair.reverse.start}-${pair.reverse.end}`;
      if (!seen.has(key)) {
        uniquePairs.push(pair);
        seen.add(key);
      }
    });

  if (!uniquePairs.length) {
    throw new Error("Не знайдено пар у заданому діапазоні продукту або ΔTm. Розширте product size чи max ΔTm.");
  }

  return uniquePairs.slice(0, settings.candidateLimit);
}

function formatPairScore(pairScore) {
  return Math.min(100, Math.max(0, Math.round(pairScore)));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function getQualityTags(primer, pair) {
  return [
    { label: primer.length >= 18 && primer.length <= 22 ? "довжина OK" : "перевірити довжину", good: primer.length >= 18 && primer.length <= 22 },
    { label: primer.gcPercent >= 40 && primer.gcPercent <= 60 ? "GC OK" : "GC поза ціллю", good: primer.gcPercent >= 40 && primer.gcPercent <= 60 },
    { label: primer.tm >= 50 && primer.tm <= 60 ? "Tm OK" : "Tm поза ціллю", good: primer.tm >= 50 && primer.tm <= 60 },
    { label: pair.deltaTm <= 5 ? "Delta Tm OK" : "Delta Tm висока", good: pair.deltaTm <= 5 },
    { label: primer.maxRun <= 4 ? "без довгих повторів" : `повтор ${primer.maxRun}x`, good: primer.maxRun <= 4 },
    { label: primer.selfComplementarity <= 3 ? "self-dimer низький" : `self ${primer.selfComplementarity} bp`, good: primer.selfComplementarity <= 3 },
  ];
}

function renderPrimerCard(container, primer, pair) {
  const tags = getQualityTags(primer, pair)
    .map((tag) => `<span class="tag ${tag.good ? "is-good" : "is-warn"}">${tag.label}</span>`)
    .join("");

  container.innerHTML = `
    <div class="primer-card__top">
      <div>
        <div class="primer-title">${primer.name}</div>
        <div class="sequence-code">5'-${primer.sequence}-3'</div>
      </div>
      <button class="ghost-button" type="button" data-copy="${primer.sequence}">Копіювати</button>
    </div>
    <div class="metric-grid">
      <div class="metric"><span>Довжина</span><strong>${primer.length} bp</strong></div>
      <div class="metric"><span>Tm</span><strong>${primer.tm}°C</strong></div>
      <div class="metric"><span>GC</span><strong>${primer.gcPercent.toFixed(1)}%</strong></div>
      <div class="metric"><span>Координати</span><strong>${primer.start}-${primer.end}</strong></div>
      <div class="metric"><span>3' GC</span><strong>${primer.endGcCount}/5</strong></div>
      <div class="metric"><span>Повтор</span><strong>${primer.maxRun}x</strong></div>
      <div class="metric"><span>Self comp.</span><strong>${primer.selfComplementarity} bp</strong></div>
      <div class="metric"><span>Di-repeat</span><strong>${primer.maxDinucleotideRun}x</strong></div>
    </div>
    <div class="tag-row">${tags}</div>
  `;
}

function renderCandidatePairs(pairs) {
  const rows = pairs
    .map((pair, index) => {
      const active = index === 0 ? " is-active" : "";
      return `
        <button class="candidate-row${active}" type="button" data-pair-index="${index}">
          <span class="candidate-rank">#${index + 1}</span>
          <span><strong>${pair.ampliconSize} bp</strong><small>product</small></span>
          <span><strong>${formatPairScore(pair.pairScore)}/100</strong><small>score</small></span>
          <span><strong>${pair.deltaTm}°C</strong><small>ΔTm</small></span>
          <span><strong>${pair.pairComplementarity} bp</strong><small>hetero</small></span>
          <span><strong>${pair.threePrimeComplementarity} bp</strong><small>3' comp.</small></span>
          <span class="candidate-seq">${pair.forward.sequence}</span>
          <span class="candidate-seq">${pair.reverse.sequence}</span>
        </button>
      `;
    })
    .join("");

  elements.candidatePairs.innerHTML = rows;
}

function renderSelectedPair(sequence, pair) {
  state.latestPair = pair;
  renderPrimerCard(elements.forwardCard, pair.forward, pair);
  renderPrimerCard(elements.reverseCard, pair.reverse, pair);
  renderSequenceMap(sequence, pair);
  runPcrAnimation(pair, sequence);
  elements.ampliconSize.textContent = `${pair.ampliconSize} bp`;
  elements.deltaTm.textContent = `${pair.deltaTm}°C`;
  elements.pairScore.textContent = `${formatPairScore(pair.pairScore)}/100`;
}

function getPercent(position, windowStart, windowEnd) {
  return ((position - windowStart) / (windowEnd - windowStart + 1)) * 100;
}

function renderSequenceWindow(sequence, pair, windowStart, windowEnd) {
  const chunks = [];
  const lineSize = 72;

  for (let index = windowStart; index <= windowEnd; index += 1) {
    const position = index + 1;
    const base = escapeHtml(sequence[index]);
    let className = "";

    if (position >= pair.forward.start && position <= pair.forward.end) {
      className = "forward-base";
    } else if (position >= pair.reverse.start && position <= pair.reverse.end) {
      className = "reverse-base";
    } else if (position >= pair.forward.start && position <= pair.reverse.end) {
      className = "amplicon-base";
    }

    const renderedBase = className ? `<mark class="${className}">${base}</mark>` : base;
    const lineIndex = Math.floor((index - windowStart) / lineSize);
    chunks[lineIndex] = `${chunks[lineIndex] || ""}${renderedBase}`;
  }

  return chunks
    .map((chunk, index) => {
      const start = windowStart + index * lineSize + 1;
      const end = Math.min(start + lineSize - 1, windowEnd + 1);
      return `
        <div class="sequence-window__line">
          <span class="sequence-window__coord">${start}-${end}</span>
          <span class="sequence-window__bases">${chunk}</span>
        </div>
      `;
    })
    .join("");
}

function renderSequenceMap(sequence, pair) {
  const flank = 70;
  const windowStart = Math.max(0, pair.forward.start - flank - 1);
  const windowEnd = Math.min(sequence.length - 1, pair.reverse.end + flank - 1);
  const windowLength = windowEnd - windowStart + 1;
  const windowStartPosition = windowStart + 1;
  const windowEndPosition = windowEnd + 1;
  const forwardLeft = getPercent(pair.forward.start, windowStartPosition, windowEndPosition);
  const forwardWidth = (pair.forward.length / windowLength) * 100;
  const reverseLeft = getPercent(pair.reverse.start, windowStartPosition, windowEndPosition);
  const reverseWidth = (pair.reverse.length / windowLength) * 100;
  const ampliconLeft = getPercent(pair.forward.start, windowStartPosition, windowEndPosition);
  const ampliconWidth = (pair.ampliconSize / windowLength) * 100;

  elements.sequenceMap.innerHTML = `
    <div class="map-axis">
      <span class="amplicon-bar" style="left:${ampliconLeft}%; width:${ampliconWidth}%"></span>
      <span class="primer-highlight primer-highlight--forward" style="left:${forwardLeft}%; width:${forwardWidth}%"></span>
      <span class="primer-highlight primer-highlight--reverse" style="left:${reverseLeft}%; width:${reverseWidth}%"></span>
      <span class="map-marker map-marker--start" style="left:0%"><span>${windowStartPosition}</span></span>
      <span class="map-marker" style="left:50%"><span>${Math.round((windowStartPosition + windowEndPosition) / 2)}</span></span>
      <span class="map-marker map-marker--end" style="left:100%"><span>${windowEndPosition}</span></span>
    </div>
    <div class="sequence-window">${renderSequenceWindow(sequence, pair, windowStart, windowEnd)}</div>
    <div class="map-legend">
      <span class="legend-item"><span class="legend-swatch legend-swatch--forward"></span>Forward ${pair.forward.start}-${pair.forward.end}</span>
      <span class="legend-item"><span class="legend-swatch legend-swatch--reverse"></span>Reverse ${pair.reverse.start}-${pair.reverse.end}</span>
      <span class="legend-item"><span class="legend-swatch legend-swatch--amplicon"></span>Amplicon ${pair.ampliconSize} bp</span>
    </div>
  `;
}

function getAmpliconPreview(sequence, pair) {
  const amplicon = sequence.slice(pair.forward.start - 1, pair.reverse.end);
  const maxBases = 42;

  if (amplicon.length <= maxBases) {
    return {
      display: amplicon,
      segments: [{ type: "sequence", start: 0, text: amplicon }],
    };
  }

  const edge = 17;
  const middle = Math.floor(amplicon.length / 2);
  const middleStart = Math.max(edge, middle - 4);
  const middleEnd = Math.min(amplicon.length - edge, middle + 5);

  return {
    display: `${amplicon.slice(0, edge)}...${amplicon.slice(middleStart, middleEnd)}...${amplicon.slice(-edge)}`,
    segments: [
      { type: "sequence", start: 0, text: amplicon.slice(0, edge) },
      { type: "gap", text: "..." },
      { type: "sequence", start: middleStart, text: amplicon.slice(middleStart, middleEnd) },
      { type: "gap", text: "..." },
      { type: "sequence", start: amplicon.length - edge, text: amplicon.slice(-edge) },
    ],
  };
}

function renderBaseStrip(preview, getBaseClass, getBaseValue = (base) => base) {
  let html = "";
  let renderedIndex = 0;

  preview.segments.forEach((segment) => {
    if (segment.type === "gap") {
      html += `<span class="base-gap">${segment.text}</span>`;
      return;
    }

    [...segment.text].forEach((base, offset) => {
      const ampliconIndex = segment.start + offset;
      const className = getBaseClass(ampliconIndex);
      const value = getBaseValue(base, ampliconIndex);
      const style = className.includes("is-new") ? ` style="--base-index:${renderedIndex}"` : "";
      html += `<span class="base-token ${className}"${style}>${escapeHtml(value)}</span>`;
      renderedIndex += 1;
    });
  });

  return html;
}

function renderNucleotidePreview(sequence, pair) {
  const preview = getAmpliconPreview(sequence, pair);
  const forwardEnd = pair.forward.length - 1;
  const reverseStart = pair.ampliconSize - pair.reverse.length;

  const templateStrip = renderBaseStrip(preview, (index) => {
    if (index <= forwardEnd) {
      return "is-forward";
    }
    if (index >= reverseStart) {
      return "is-reverse";
    }
    return "";
  });

  const forwardPrimerStrip = renderBaseStrip(
    preview,
    (index) => (index <= forwardEnd ? "is-forward" : ""),
    (base, index) => (index <= forwardEnd ? base : "")
  );
  const reversePrimerStrip = renderBaseStrip(
    preview,
    (index) => (index >= reverseStart ? "is-reverse" : ""),
    (base, index) => (index >= reverseStart ? complement(base) : "")
  );
  const newForwardStrip = renderBaseStrip(
    preview,
    (index) => (index > forwardEnd ? "is-new" : ""),
    (base, index) => (index > forwardEnd ? complement(base) : "")
  );
  const newReverseStrip = renderBaseStrip(
    preview,
    (index) => (index < reverseStart ? "is-new" : ""),
    (base, index) => (index < reverseStart ? complement(base) : "")
  );

  elements.nucleotidePreview.innerHTML = `
    <div class="nucleotide-track">
      <span class="track-label">Template 5'→3'</span>
      <div class="base-strip">${templateStrip}</div>
    </div>
    <div class="nucleotide-track">
      <span class="track-label">Forward primer</span>
      <div class="base-strip">${forwardPrimerStrip}</div>
    </div>
    <div class="nucleotide-track">
      <span class="track-label">Synthesis →</span>
      <div class="base-strip">${newForwardStrip}</div>
    </div>
    <div class="nucleotide-track">
      <span class="track-label">← Synthesis</span>
      <div class="base-strip">${newReverseStrip}</div>
    </div>
    <div class="nucleotide-track">
      <span class="track-label">Reverse primer</span>
      <div class="base-strip">${reversePrimerStrip}</div>
    </div>
  `;
}

function runPcrAnimation(pair, sequence) {
  if (sequence) {
    renderNucleotidePreview(sequence, pair);
  }
  elements.ampliconLabel.textContent = `Амплікон ${pair.forward.start}-${pair.reverse.end}: ${pair.ampliconSize} bp`;
  elements.pcrAnimation.classList.remove("is-running");
  window.requestAnimationFrame(() => {
    elements.pcrAnimation.classList.add("is-running");
  });
  elements.replayAnimationBtn.disabled = false;
}

function buildReport(sequence, pair) {
  const now = new Date().toLocaleString("uk-UA");
  return [
    `Дата та час формування: ${now}`,
    `Довжина матриці: ${sequence.length} bp`,
    `GC матриці: ${getGcPercent(sequence).toFixed(1)}%`,
    "------------------------------------------------------",
    `Forward: 5'-${pair.forward.sequence}-3'`,
    `Forward coordinates: ${pair.forward.start}-${pair.forward.end}`,
    `Forward length: ${pair.forward.length} bp`,
    `Forward GC: ${pair.forward.gcPercent.toFixed(1)}% (${pair.forward.gcCount}/${pair.forward.length})`,
    `Forward Tm: ${pair.forward.tm}°C`,
    "------------------------------------------------------",
    `Reverse: 5'-${pair.reverse.sequence}-3'`,
    `Reverse coordinates: ${pair.reverse.start}-${pair.reverse.end}`,
    `Reverse length: ${pair.reverse.length} bp`,
    `Reverse GC: ${pair.reverse.gcPercent.toFixed(1)}% (${pair.reverse.gcCount}/${pair.reverse.length})`,
    `Reverse Tm: ${pair.reverse.tm}°C`,
    "------------------------------------------------------",
    `Amplicon size: ${pair.ampliconSize} bp`,
    `Delta Tm: ${pair.deltaTm}°C`,
    `Delta GC: ${pair.deltaGc.toFixed(1)}%`,
    `Pair complementarity: ${pair.pairComplementarity} bp`,
    `3' complementarity: ${pair.threePrimeComplementarity} bp`,
    `Pair score: ${formatPairScore(pair.pairScore)}/100`,
    "------------------------------------------------------",
  ].join("\n");
}

function updateSequenceStats() {
  const sequence = sanitizeSequence(elements.sequenceInput.value);
  const error = validateSequence(sequence);

  elements.baseCount.textContent = `${sequence.length} bp`;
  elements.gcSummary.textContent = `GC: ${getGcPercent(sequence).toFixed(1)}%`;
  elements.validationMessage.textContent = error || "Послідовність готова до аналізу.";
  elements.validationMessage.classList.toggle("is-error", Boolean(error && sequence.length));
  elements.sequenceStatus.textContent = error ? "Потрібна валідна послідовність" : "Готово до аналізу";
  elements.sequenceStatus.classList.toggle("is-error", Boolean(error && sequence.length));
  elements.sequenceStatus.classList.toggle("is-ready", !error);
}

function resetResults() {
  state.report = "";
  state.latestPair = null;
  state.latestPairs = [];
  elements.forwardCard.innerHTML = `<div class="empty-state">Forward primer з'явиться після аналізу</div>`;
  elements.reverseCard.innerHTML = `<div class="empty-state">Reverse primer з'явиться після аналізу</div>`;
  elements.candidatePairs.innerHTML = `<div class="empty-state">Після аналізу тут буде список кандидатних пар</div>`;
  elements.reportOutput.textContent = "Після аналізу тут буде готовий текстовий звіт.";
  elements.sequenceMap.innerHTML = `<div class="empty-state">Тут буде підсвічена ділянка матриці після аналізу</div>`;
  elements.nucleotidePreview.innerHTML = `<div class="empty-state">Після аналізу тут з'являться реальні нуклеотиди амплікону</div>`;
  elements.pcrAnimation.classList.remove("is-running");
  elements.ampliconLabel.textContent = "Амплікон з'явиться після підбору";
  elements.ampliconSize.textContent = "0 bp";
  elements.deltaTm.textContent = "0°C";
  elements.pairScore.textContent = "-";
  elements.downloadBtn.disabled = true;
  elements.copyReportBtn.disabled = true;
  elements.replayAnimationBtn.disabled = true;
}

function showError(message) {
  elements.sequenceStatus.textContent = "Помилка аналізу";
  elements.sequenceStatus.classList.add("is-error");
  elements.sequenceStatus.classList.remove("is-ready");
  elements.validationMessage.textContent = message;
  elements.validationMessage.classList.add("is-error");
}

function analyzeCurrentSequence() {
  resetResults();

  const sequence = sanitizeSequence(elements.sequenceInput.value);
  const validationError = validateSequence(sequence);
  if (validationError) {
    showError(validationError);
    return;
  }

  try {
    const settings = readSettings();
    const pairs = findPrimerPairs(sequence, settings);
    const pair = pairs[0];
    const report = buildReport(sequence, pair);

    state.report = report;
    state.latestPairs = pairs;

    renderCandidatePairs(pairs);
    renderSelectedPair(sequence, pair);
    elements.reportOutput.textContent = report;
    elements.downloadBtn.disabled = false;
    elements.copyReportBtn.disabled = false;
    updateSequenceStats();
  } catch (error) {
    showError(error.message);
  }
}

function downloadReport() {
  if (!state.report) {
    return;
  }

  const blob = new Blob([state.report, "\n"], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `primer_report_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyText(text) {
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

elements.sampleBtn.addEventListener("click", () => {
  elements.sequenceInput.value = SAMPLE_SEQUENCE;
  resetResults();
  updateSequenceStats();
});

elements.clearBtn.addEventListener("click", () => {
  elements.sequenceInput.value = "";
  resetResults();
  updateSequenceStats();
  elements.sequenceInput.focus();
});

elements.analyzeBtn.addEventListener("click", analyzeCurrentSequence);
elements.downloadBtn.addEventListener("click", downloadReport);
elements.copyReportBtn.addEventListener("click", () => copyText(state.report));
elements.replayAnimationBtn.addEventListener("click", () => {
  if (state.latestPair) {
    runPcrAnimation(state.latestPair);
  }
});
elements.sequenceInput.addEventListener("input", () => {
  resetResults();
  updateSequenceStats();
});

document.addEventListener("click", (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    copyText(copyButton.dataset.copy);
  }

  const candidateButton = event.target.closest("[data-pair-index]");
  if (candidateButton) {
    const sequence = sanitizeSequence(elements.sequenceInput.value);
    const pair = state.latestPairs[Number(candidateButton.dataset.pairIndex)];
    if (!pair) {
      return;
    }

    document.querySelectorAll(".candidate-row").forEach((row) => row.classList.remove("is-active"));
    candidateButton.classList.add("is-active");
    state.report = buildReport(sequence, pair);
    elements.reportOutput.textContent = state.report;
    renderSelectedPair(sequence, pair);
  }
});

updateSequenceStats();
