"""Chaîne de mise en page commune aux PDF de la structure junior.

Palette alignée sur le site : papier chaud, encre presque noire, vermillon.
Les polices du site ne sont pas installées sur le système, on retombe sur
Helvetica, qui reste neutre et lisible en impression.
"""
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Flowable, Frame, KeepTogether, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)

PAPER = colors.HexColor("#F4F1EA")
SURFACE = colors.white
INK = colors.HexColor("#14121A")
MUTED = colors.HexColor("#5F5647")
LINE = colors.HexColor("#DDD6C9")
ACCENT = colors.HexColor("#C2341A")
ACCENT_FILL = colors.HexColor("#FF4D2E")
DONE = colors.HexColor("#0D6B4F")
STREAK = colors.HexColor("#8A5200")

MARGIN = 20 * mm
CONTENT_W = A4[0] - 2 * MARGIN

_base = getSampleStyleSheet()

S = {
    "title": ParagraphStyle("title", parent=_base["Title"], fontName="Helvetica-Bold",
                            fontSize=30, leading=34, textColor=INK, alignment=TA_LEFT,
                            spaceAfter=4),
    "subtitle": ParagraphStyle("subtitle", parent=_base["Normal"], fontName="Helvetica",
                               fontSize=12.5, leading=17, textColor=MUTED, spaceAfter=18),
    "eyebrow": ParagraphStyle("eyebrow", parent=_base["Normal"], fontName="Helvetica-Bold",
                              fontSize=8, leading=11, textColor=ACCENT, spaceAfter=6),
    "h1": ParagraphStyle("h1", parent=_base["Heading1"], fontName="Helvetica-Bold",
                         fontSize=17, leading=21, textColor=INK, spaceBefore=18, spaceAfter=7),
    "h2": ParagraphStyle("h2", parent=_base["Heading2"], fontName="Helvetica-Bold",
                         fontSize=12.5, leading=16, textColor=INK, spaceBefore=12, spaceAfter=5),
    "body": ParagraphStyle("body", parent=_base["Normal"], fontName="Helvetica",
                           fontSize=9.7, leading=14.2, textColor=INK, spaceAfter=7),
    "muted": ParagraphStyle("muted", parent=_base["Normal"], fontName="Helvetica",
                            fontSize=9, leading=13, textColor=MUTED, spaceAfter=7),
    "bullet": ParagraphStyle("bullet", parent=_base["Normal"], fontName="Helvetica",
                             fontSize=9.7, leading=14.2, textColor=INK,
                             leftIndent=11, bulletIndent=2, spaceAfter=4),
    "cell": ParagraphStyle("cell", parent=_base["Normal"], fontName="Helvetica",
                           fontSize=8.6, leading=11.6, textColor=INK),
    "cellb": ParagraphStyle("cellb", parent=_base["Normal"], fontName="Helvetica-Bold",
                            fontSize=8.6, leading=11.6, textColor=INK),
    "cellhead": ParagraphStyle("cellhead", parent=_base["Normal"], fontName="Helvetica-Bold",
                               fontSize=8.4, leading=11, textColor=colors.white),
    "callout": ParagraphStyle("callout", parent=_base["Normal"], fontName="Helvetica",
                              fontSize=9.7, leading=14, textColor=INK),
    "calloutb": ParagraphStyle("calloutb", parent=_base["Normal"], fontName="Helvetica-Bold",
                               fontSize=9.7, leading=14, textColor=INK),
    "foot": ParagraphStyle("foot", parent=_base["Normal"], fontName="Helvetica",
                           fontSize=7.6, leading=10, textColor=MUTED),
}


class Rule(Flowable):
    """Filet horizontal, épais et coloré."""
    def __init__(self, width=CONTENT_W, thickness=2.2, color=ACCENT_FILL, space=7):
        super().__init__()
        self.width, self.thickness, self.color, self.space = width, thickness, color, space
        self.height = thickness + space

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, self.space, self.width, self.thickness, stroke=0, fill=1)


def para(text, style="body"):
    return Paragraph(text, S[style])


def section(text):
    """Titre de niveau 1. Saute la page s'il reste moins de 55 mm, pour qu'un
    titre ne finisse jamais seul en bas de page, coupé de son contenu."""
    return [CondPageBreak(55 * mm), Paragraph(text, S["h1"])]


def bullets(items, style="bullet"):
    return [Paragraph(t, S[style], bulletText="•") for t in items]


def table(rows, widths, header=True, zebra=True, align=None):
    """Tableau : en-tête sombre, lignes alternées, filets fins."""
    data = []
    for i, row in enumerate(rows):
        style = "cellhead" if (header and i == 0) else "cell"
        data.append([c if isinstance(c, Flowable) else Paragraph(str(c), S[style]) for c in row])

    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
    ]
    if header:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), INK),
                 ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
                 ("TOPPADDING", (0, 0), (-1, 0), 6)]
    if zebra:
        start = 1 if header else 0
        for r in range(start, len(data)):
            if (r - start) % 2 == 1:
                cmds.append(("BACKGROUND", (0, r), (-1, r), colors.HexColor("#EFEBE1")))
    if align:
        for col, a in align.items():
            cmds.append(("ALIGN", (col, 0), (col, -1), a))

    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    t.setStyle(TableStyle(cmds))
    return t


def callout(title, body, tone="accent"):
    """Encadré. tone: accent (alerte), done (bon à savoir), streak (attention)."""
    bar = {"accent": ACCENT_FILL, "done": colors.HexColor("#16C08A"),
           "streak": colors.HexColor("#FFB43D")}[tone]
    inner = [Paragraph(title, S["calloutb"])]
    if body:
        inner.append(Spacer(1, 3))
        inner.append(Paragraph(body, S["callout"]))
    t = Table([[inner]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 3.5, bar),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return KeepTogether([Spacer(1, 4), t, Spacer(1, 9)])


def build(path, title, subtitle, story, doc_label):
    """Assemble le document, fond papier et pied de page paginé."""
    def decorate(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 7.6)
        canvas.drawString(MARGIN, 12 * mm, doc_label)
        canvas.drawRightString(A4[0] - MARGIN, 12 * mm, str(canvas.getPageNumber()))
        canvas.setFillColor(LINE)
        canvas.rect(MARGIN, 15.5 * mm, CONTENT_W, 0.5, stroke=0, fill=1)
        canvas.restoreState()

    doc = BaseDocTemplate(
        path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=24 * mm,
        title=title, author="AI-bert Vibe Coding", subject=subtitle,
    )
    frame = Frame(MARGIN, 24 * mm, CONTENT_W, A4[1] - MARGIN - 24 * mm, id="main",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=decorate)])

    head = [
        Paragraph("AI-BERT VIBE CODING · ALBERT SCHOOL", S["eyebrow"]),
        Paragraph(title, S["title"]),
        Paragraph(subtitle, S["subtitle"]),
        Rule(),
        Spacer(1, 6),
    ]
    doc.build(head + story)
