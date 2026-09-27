# -*- coding: utf-8 -*-
"""Convertisseur Markdown vers flowables ReportLab, limité à ce que les
documents de cours utilisent réellement : titres, paragraphes, listes à
puces et numérotées, gras, code inline, blocs de code, tableaux, citations.

Volontairement simple : pas de parseur générique, pas de dépendance.
"""
import html
import re

from _style import (CONTENT_W, LINE, S, Spacer, Table, TableStyle, colors, para)
from reportlab.platypus import KeepTogether, Paragraph


# Helvetica et Courier ne dessinent que le jeu Latin-1 : tout caractère hors
# de ce jeu sort en carré noir. On les remplace avant tout rendu.
SAFE = {
    "\u2192": "->", "\u2190": "<-", "\u2194": "<->", "\u21d2": "=>",
    "\u2265": ">=", "\u2264": "<=", "\u2260": "!=", "\u2248": "~",
    "\u2022": "-", "\u25aa": "-", "\u2713": "v", "\u2714": "v",
    "\u26a0": "", "\ufe0f": "", "\u2705": "", "\u274c": "", "\U0001f534": "",
    "\U0001f6a9": "", "\u2011": "-", "\u2012": "-",
}


def sanitize(text):
    for bad, good in SAFE.items():
        text = text.replace(bad, good)
    # Filet de sécurité : tout ce qui reste hors Latin-1 disparaît.
    return "".join(c for c in text if ord(c) < 0x2100)


def _inline(text):
    text = sanitize(text)
    """Gras, code inline et liens, convertis en balises ReportLab."""
    text = html.escape(text, quote=False)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<font color="#B8341A">\1</font>', text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+)`", r'<font face="Courier" size="9">\1</font>', text)
    return text


def _code_block(lines):
    """Bloc de code : fond encre, corps généreux, il sera projeté."""
    body = "<br/>".join(html.escape(sanitize(l), quote=False).replace(" ", "&nbsp;") for l in lines)
    p = Paragraph(body, S["codeblock"])
    t = Table([[p]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#14121A")),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
    ]))
    return KeepTogether([Spacer(1, 3), t, Spacer(1, 8)])


def _table(rows):
    """Tableau markdown, première ligne en en-tête."""
    from _style import table as styled_table
    n = max(len(r) for r in rows)
    rows = [r + [""] * (n - len(r)) for r in rows]
    rows = [[_inline(c) for c in r] for r in rows]
    widths = [CONTENT_W / n] * n
    return [Spacer(1, 3), styled_table(rows, widths), Spacer(1, 8)]


def md(text, h1_style="h1", h2_style="h2"):
    """Rend un document Markdown en liste de flowables."""
    out, lines = [], text.split("\n")
    i, code, quote, tbl = 0, None, [], []

    def flush_quote():
        if quote:
            out.append(para(" ".join(_inline(q) for q in quote), "muted"))
            quote.clear()

    def flush_table():
        if tbl:
            out.extend(_table(list(tbl)))
            tbl.clear()

    while i < len(lines):
        raw = lines[i]
        line = raw.rstrip()

        if line.startswith("```"):
            if code is None:
                flush_quote(); flush_table(); code = []
            else:
                out.append(_code_block(code)); code = None
            i += 1; continue
        if code is not None:
            code.append(raw); i += 1; continue

        if line.startswith("|"):
            flush_quote()
            cells = [c.strip() for c in line.strip("|").split("|")]
            if not all(set(c) <= set("-: ") for c in cells):
                tbl.append(cells)
            i += 1; continue
        flush_table()

        if line.startswith(">"):
            quote.append(line.lstrip("> ").strip()); i += 1; continue
        flush_quote()

        if not line.strip():
            i += 1; continue

        if line.startswith("### "):
            out.append(para(_inline(line[4:]), h2_style))
        elif line.startswith("## "):
            out.append(para(_inline(line[3:]), h1_style))
        elif line.startswith("# "):
            out.append(para(_inline(line[2:]), h1_style))
        elif line.startswith("---"):
            pass
        elif re.match(r"^[-*] ", line):
            out.append(Paragraph(_inline(line[2:]), S["bullet"], bulletText="•"))
        elif re.match(r"^\d+\.\s", line):
            num, rest = line.split(".", 1)
            out.append(Paragraph(_inline(rest.strip()), S["bullet"], bulletText=f"{num}."))
        else:
            out.append(para(_inline(line), "body"))
        i += 1

    flush_quote(); flush_table()
    if code:
        out.append(_code_block(code))
    return out
