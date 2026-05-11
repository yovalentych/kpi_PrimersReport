# PCR Primer Studio

[![Netlify Status](https://api.netlify.com/api/v1/badges/4b8a7407-8fd4-44ad-b0de-a4fd51b20af6/deploy-status)](https://app.netlify.com/projects/primers-go/deploys)

PCR Primer Studio is an educational PCR primer design toolkit with a Python CLI and a static web interface.

The web app supports FASTA input, primer pair ranking, primer QC metrics, amplicon visualization, PCR synthesis animation, report export, and a scientific reference section.

## Features

- Forward/reverse primer design from a DNA template.
- Primer length, GC content, Tm, delta Tm, and amplicon size filters.
- Alternative primer pair ranking.
- QC heuristics for GC clamp, homopolymer runs, dinucleotide repeats, self-complementarity, heterodimer risk, and 3' complementarity.
- Sequence map with highlighted primer binding regions and amplicon.
- PCR animation with real nucleotide sequences from the selected template.
- Text report copy/download.
- Python CLI for direct forward/reverse primer analysis.

## Web App

Open the static app directly:

```text
web/index.html
```

Or run a local server:

```bash
cd web
python3 -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080
```

## Python CLI

Interactive mode:

```bash
python3 primers_designe.py
```

Argument mode:

```bash
python3 primers_designe.py \
  --forward ATGCGTACGTAGCTAGCTAA \
  --reverse TTAGCTAGCTACGTACGCAT \
  --author "Student" \
  --output report
```

## Tests

```bash
python3 -m unittest -v
```

## Scientific Notes

The local primer design and QC logic is based on common PCR primer design recommendations from Primer3, NCBI Primer-BLAST, Thermo Fisher, IDT, and QIAGEN.

This app does not currently perform BLAST/Primer-BLAST specificity screening against a genome or sequence database. For experimental work, candidate primers should still be validated with a specificity tool and laboratory controls.

## References

- Primer3 Manual: https://primer3.org/manual.html
- NCBI Primer-BLAST overview: https://www.nlm.nih.gov/ncbi/workshops/2023-09_Primer-BLAST/PB_description.html
- Thermo Fisher PCR primer guidelines: https://www.thermofisher.com/uk/en/home/technical-resources/technical-reference-library/pcr-cdna-synthesis-support-center/end-point-pcr-primers-support/end-point-pcr-primers-support-getting-started.html
- IDT OligoAnalyzer guidance: https://www.idtdna.com/pages/support/faqs/how-can-i-check-my-pcr-primers-using-the-oligoanalyzer-program-to-ensure-there-are-no-significant-primer-design-issues-
- QIAGEN PCR primer design: https://www.qiagen.com/us/knowledge-and-support/knowledge-hub/bench-guide/pcr/introduction/pcr-primer-design
