# -*- coding: utf-8 -*-
"""Un PDF par cours, lu directement dans seances/SXX-slug/.

Chaque dossier fournit : SUPPORT.md, ENONCE.md, CORRIGE.md, PROMPTS.json,
CHECKS.json, CONDUCTEUR.md. Les cours futurs sortiront sans toucher ce script.
"""
import json
import pathlib
import re
import sys
import unicodedata

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _style import *  # noqa
from _markdown import md, sanitize
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether

ROOT = pathlib.Path(__file__).resolve().parents[2]
SEANCES = ROOT / "seances"
OUT = ROOT / "junior" / "pdf" / "cours"
OUT.mkdir(exist_ok=True)
W = CONTENT_W


def slugify(text):
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Za-z0-9]+", "-", t).strip("-")


def curriculum():
    """Titres et promesses en anglais, lus dans le squelette public du site.
    Le conducteur est en français : il ne peut pas servir de sous-titre."""
    src = (ROOT / "src" / "lib" / "curriculum.ts").read_text()
    out = {}
    for m in re.finditer(r'slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*promise:\s*"([^"]+)"', src):
        out[m.group(1)] = (m.group(2), m.group(3))
    return out


CURRICULUM = curriculum()


def read(folder, name):
    p = folder / name
    return p.read_text() if p.exists() else None


def checklist(checks):
    """Cases à cocher dessinées, pour qu'on puisse imprimer et cocher au stylo."""
    rows = []
    for c in checks:
        box = Table([[""]], colWidths=[4.2 * mm], rowHeights=[4.2 * mm])
        box.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1.1, ACCENT_LINE if not c.get("is_bonus") else XP_LINE),
            ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ]))
        label = sanitize(c["label"])
        if c.get("is_bonus"):
            label = re.sub(r"^bonus\s*[:.]?\s*", "", label, flags=re.I)
            label = f'<font color="#6B3B8F"><b>Bonus.</b></font> {label}'
        rows.append([box, Paragraph(label, S["check"])])
    t = Table(rows, colWidths=[8 * mm, W - 8 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
    ]))
    return t


def prompts_block(prompts):
    out = []
    for i, p in enumerate(prompts):
        head = f'<font color="#B8341A"><b>{i + 1:02d}</b></font>'
        if p.get("label"):
            head += f'  <b>{sanitize(p["label"])}</b>'
        body = sanitize(p["body"]).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        code = Paragraph(body.replace(" ", "&nbsp;"), S["codeblock"])
        t = Table([[code]], colWidths=[W])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), INK),
            ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ]))
        out.append(KeepTogether([Paragraph(head, S["body"]), Spacer(1, 2), t, Spacer(1, 9)]))
    return out


def build_course(folder):
    number = int(folder.name[1:3])
    support = read(folder, "SUPPORT.md")
    enonce = read(folder, "ENONCE.md")
    if not support or not enonce:
        return None

    corrige = read(folder, "CORRIGE.md")
    conducteur = read(folder, "CONDUCTEUR.md")
    prompts = json.loads(read(folder, "PROMPTS.json") or "[]")
    checks = json.loads(read(folder, "CHECKS.json") or "[]")
    title = sanitize(read(folder, "CONDUCTEUR.md")).split("\n")[0].split("—")[-1].replace("· conducteur", "").strip()
    promise = ""
    m = re.search(r"Victoire de fin d'heure\s*:\s*(.+)", conducteur or "")
    if m:
        promise = sanitize(m.group(1).strip())

    s = []
    s += [callout("How to use this module",
                  "Work through it alone, at your own pace, in about an hour. Everything you need is here: "
                  "the idea, the exact commands, the prompts to copy, and what to do when it breaks. "
                  "Bring your questions to the weekly help hour. The last section is for the organisers.",
                  "done")]

    s += section("The idea")
    s += md(support, h1_style="h2", h2_style="h3")

    if prompts:
        s += section("Prompts for this module")
        s += [para("Replace everything between &lt; and &gt; with your own words before you press Enter. "
                   "The agent takes placeholders literally.", "muted")]
        s += prompts_block(prompts)

    s += section("What you build")
    s += md(enonce, h1_style="h2", h2_style="h3")

    if checks:
        s += section("Done means")
        s += [para("Every line is something another person can check without reading your code. "
                   "Tick them as you go.", "muted"), Spacer(1, 4), checklist(checks), Spacer(1, 6)]

    if corrige:
        s += section("How it was done")
        s += [callout("Read this after you have tried, not before.",
                      "The value of this module is in the attempt, not in the answer. If you are stuck for "
                      "more than twenty minutes, read on.", "streak")]
        s += md(corrige, h1_style="h2", h2_style="h3")

    if conducteur:
        s += [PageBreak()]
        s += section("Pour les organisateurs")
        s += [para("Cette dernière partie est en français et ne s'adresse pas aux membres. "
                   "C'est le conducteur de l'heure d'entraide et la préparation à faire avant.", "muted")]
        s += md(conducteur, h1_style="h2", h2_style="h3")

    filename = f"AI-bert-Cours-{number:02d}-{slugify(title)}.pdf"
    build(str(OUT / filename), f"{number:02d} · {title}",
          promise or "Self-paced module", s,
          f"Cours {number:02d} · {title} · AI-bert Vibe Coding")
    return filename, number, title


if __name__ == "__main__":
    made = []
    for folder in sorted(SEANCES.glob("S[0-9][0-9]-*")):
        r = build_course(folder)
        if r:
            made.append(r)
            print(f"  {r[0]}")
        else:
            print(f"  ignoré, contenu incomplet : {folder.name}")
    print(f"{len(made)} cours générés")
