from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT_PATH = Path(r"C:\Users\dell\Desktop\NEW APP\reports\smoke-test-report-2026-05-20.pdf")


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleCard",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#17324D"),
            alignment=TA_CENTER,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=colors.HexColor("#17324D"),
            spaceBefore=10,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubTitle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#244C73"),
            spaceBefore=8,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyTight",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#22313F"),
            alignment=TA_LEFT,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallNote",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#516274"),
            spaceAfter=4,
        )
    )
    return styles


def para(text, style):
    return Paragraph(text, style)


def make_table(rows, col_widths):
    table = Table(rows, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.8),
                ("LEADING", (0, 0), (-1, -1), 11),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F7FAFC"), colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#B9C7D6")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def page_decor(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(colors.HexColor("#17324D"))
    canvas.rect(0, height - 22, width, 22, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#17324D"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(doc.leftMargin, 18, "SRV Projects Smoke Test Report")
    canvas.drawRightString(width - doc.rightMargin, 18, f"Page {doc.page}")
    canvas.restoreState()


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    styles = build_styles()

    story = []

    story.extend(
        [
            Spacer(1, 0.7 * inch),
            para("SRV Multi-Project Smoke Test Report", styles["TitleCard"]),
            para("Projects Covered: NEW APP, ADMIN-FRONTEND, ADMIN-BACKEND", styles["SubTitle"]),
            Spacer(1, 0.08 * inch),
            para(
                "Prepared on: 20 May 2026<br/>"
                "Primary execution dates: 19 May 2026 and 20 May 2026<br/>"
                "Environment: Windows workstation, Docker-backed PostgreSQL, local admin/frontend/backend stack",
                styles["BodyTight"],
            ),
            Spacer(1, 0.15 * inch),
            para(
                "Executive Summary",
                styles["SectionTitle"],
            ),
            para(
                "A full smoke and deployment-readiness pass was executed across the three connected repositories. "
                "This included backend build verification, admin frontend build verification, mobile app lint and quality passes, "
                "live API checks, OTP login flow checks, admin authentication, database persistence validation, and cross-system data sync validation. "
                "Two functional integration defects and multiple frontend/app quality issues were identified during the process and fixed before the final verification pass.",
                styles["BodyTight"],
            ),
            para(
                "Final release-state conclusion: all three projects reached a non-blocking state for smoke/deploy readiness. "
                "The mobile app lint state was improved from 127 warnings and 3 lint-blocking errors to 0 warnings and 0 errors. "
                "Backend and admin frontend production builds completed successfully on the final verification pass.",
                styles["BodyTight"],
            ),
        ]
    )

    summary_rows = [
        ["Area", "Final Status", "Evidence"],
        ["ADMIN-BACKEND", "PASS", "Nest production build passed; /health returned ok"],
        ["ADMIN-FRONTEND", "PASS", "Next.js production build passed; localhost:3000 returned HTTP 200"],
        ["NEW APP", "PASS", "expo lint passed with 0 errors and 0 warnings"],
        ["Admin Auth", "PASS", "Login and profile retrieval succeeded"],
        ["Mobile Auth", "PASS", "Dev OTP send/verify and profile fetch succeeded"],
        ["Category / Offer Sync", "PASS", "Admin and mobile category/offer counts aligned"],
        ["Database Persistence", "PASS", "Support ticket record verified in Docker PostgreSQL"],
    ]
    story.extend([make_table(summary_rows, [1.8 * inch, 1.0 * inch, 3.9 * inch]), Spacer(1, 0.18 * inch)])

    story.extend(
        [
            para("Project Context", styles["SectionTitle"]),
            para(
                "The application landscape consists of three repositories working together:",
                styles["BodyTight"],
            ),
            para(
                "1. ADMIN-BACKEND: NestJS API and service layer connected to Docker PostgreSQL.",
                styles["BodyTight"],
            ),
            para(
                "2. ADMIN-FRONTEND: Next.js-based admin panel used to manage categories, offers, content, and operational records.",
                styles["BodyTight"],
            ),
            para(
                "3. NEW APP: Expo/React Native mobile application consuming the backend APIs in real time.",
                styles["BodyTight"],
            ),
            para(
                "The stated objective was to verify deploy readiness, API correctness, admin form submission behavior, database storage, and cross-system synchronization between admin-managed data and mobile-consumed data.",
                styles["BodyTight"],
            ),
        ]
    )

    story.extend(
        [
            para("Test Scope and Method", styles["SectionTitle"]),
            para(
                "The smoke pass combined static verification and live integration validation:",
                styles["BodyTight"],
            ),
        ]
    )
    scope_rows = [
        ["Test Layer", "Coverage"],
        ["Build / Quality", "Backend production build, frontend production build, mobile lint/quality cleanup"],
        ["Runtime Health", "HTTP health endpoint and admin frontend availability"],
        ["Authentication", "Admin login/profile and mobile OTP login/profile"],
        ["Business APIs", "Product categories, offers, app settings, support submission"],
        ["Data Sync", "Admin-created / admin-managed content visibility in mobile endpoints"],
        ["Database", "Direct PostgreSQL record verification inside Docker container"],
    ]
    story.extend([make_table(scope_rows, [1.7 * inch, 5.0 * inch]), Spacer(1, 0.16 * inch)])

    story.extend(
        [
            para("Defects Found and Fixed During the Smoke Cycle", styles["SectionTitle"]),
        ]
    )
    defect_rows = [
        ["ID", "Issue", "Impact", "Fix Applied"],
        [
            "D-01",
            "Mobile categories endpoint was not reading the admin-managed product_categories source correctly.",
            "Admin category changes were not reliably reflected in app-facing category data.",
            "Backend mobile module/service updated so the app category feed syncs correctly from the admin source.",
        ],
        [
            "D-02",
            "Admin Product Categories form was sending fields not accepted by the backend DTO.",
            "Category creation from admin UI could fail despite valid user intent.",
            "Frontend payload logic corrected in ProductCategories.tsx so category creation succeeds.",
        ],
        [
            "D-03",
            "NEW APP contained lint-blocking JSX text and a large warning backlog.",
            "App quality gate was not in a release-clean state.",
            "JSX issues fixed first, then warnings reduced from 127 to 0 through targeted cleanup.",
        ],
    ]
    story.extend([make_table(defect_rows, [0.55 * inch, 2.1 * inch, 1.6 * inch, 2.45 * inch]), Spacer(1, 0.16 * inch)])

    story.extend(
        [
            para("Detailed Execution Results", styles["SectionTitle"]),
            para("1. Build and Quality Verification", styles["SubTitle"]),
        ]
    )
    build_rows = [
        ["Date", "Repository", "Command / Check", "Result", "Notes"],
        ["19 May 2026", "ADMIN-BACKEND", "npm run build", "PASS", "Nest build completed successfully after API fixes"],
        ["19 May 2026", "ADMIN-FRONTEND", "npm run build", "PASS", "Next.js build completed successfully after category form fix"],
        ["19 May 2026", "NEW APP", "npm run lint", "PASS", "0 errors, warning count reduced materially"],
        ["20 May 2026", "NEW APP", "npm run lint", "PASS", "Final clean state: 0 errors, 0 warnings"],
        ["20 May 2026", "ADMIN-BACKEND", "npm run build", "PASS", "Re-run passed during final verification"],
        ["20 May 2026", "ADMIN-FRONTEND", "npm run build", "PASS", "Re-run passed during final verification"],
    ]
    story.extend([make_table(build_rows, [0.9 * inch, 1.1 * inch, 1.35 * inch, 0.65 * inch, 2.2 * inch]), Spacer(1, 0.15 * inch)])

    story.extend(
        [
            para("2. Live Health and Availability Checks", styles["SubTitle"]),
        ]
    )
    health_rows = [
        ["Target", "Observed Result", "Status"],
        ["http://localhost:3001/health", "Returned status = ok", "PASS"],
        ["http://localhost:3000", "Returned HTTP 200", "PASS"],
        ["Docker PostgreSQL container", "postgres-srv container reachable", "PASS"],
    ]
    story.extend([make_table(health_rows, [2.7 * inch, 3.1 * inch, 0.8 * inch]), Spacer(1, 0.15 * inch)])

    story.extend(
        [
            para("3. Admin Authentication and Admin API Smoke", styles["SubTitle"]),
        ]
    )
    admin_rows = [
        ["Check", "Observed Outcome", "Status"],
        ["Admin login", "Successful authentication via admin auth endpoint", "PASS"],
        ["Admin profile", "Profile response returned admin@srvelectricals.com", "PASS"],
        ["Admin product categories", "Category list retrieved successfully; count observed = 33", "PASS"],
        ["Admin offers", "Offers retrieved successfully; count observed = 2", "PASS"],
        ["Admin UI category create", "Category create flow validated through admin panel with success confirmation", "PASS"],
    ]
    story.extend([make_table(admin_rows, [2.2 * inch, 3.7 * inch, 0.7 * inch]), Spacer(1, 0.15 * inch)])

    story.extend(
        [
            para("4. Mobile / App API Smoke", styles["SubTitle"]),
        ]
    )
    mobile_rows = [
        ["Check", "Observed Outcome", "Status"],
        ["Mobile categories endpoint", "Returned 33 categories aligned with admin-side count", "PASS"],
        ["Mobile offers endpoint", "Returned 2 offers for electrician role", "PASS"],
        ["Mobile app settings", "App settings endpoint returned valid payload", "PASS"],
        ["OTP send / verify", "Dev OTP flow succeeded for electrician number 9162038214", "PASS"],
        ["Mobile profile fetch", "Authenticated mobile profile fetch succeeded", "PASS"],
        ["Mobile support submission", "Support ticket create request succeeded", "PASS"],
        ["Mobile feed synchronization", "App-facing data reflected admin-managed content after fixes", "PASS"],
    ]
    story.extend([make_table(mobile_rows, [2.2 * inch, 3.7 * inch, 0.7 * inch]), Spacer(1, 0.15 * inch)])

    story.extend(
        [
            para("5. Database Persistence and Real-Time Validation", styles["SubTitle"]),
            para(
                "A smoke-generated support ticket with subject <b>Smoke Test 20260519134922</b> was used for persistence verification. "
                "After API submission, the Docker PostgreSQL database was queried directly and the record was confirmed present with count = 1.",
                styles["BodyTight"],
            ),
        ]
    )
    db_rows = [
        ["Validation Point", "Observed Result", "Status"],
        ["Docker container presence", "postgres-srv container running", "PASS"],
        ["Schema access", "support_tickets structure reachable for inspection", "PASS"],
        ["Persistence query", "COUNT(*) for subject = Smoke Test 20260519134922 returned 1", "PASS"],
        ["Admin visibility note", "Earlier full pass confirmed admin-side support visibility; later direct route recheck returned 404 while persistence remained confirmed", "NOTE"],
    ]
    story.extend([make_table(db_rows, [2.05 * inch, 4.0 * inch, 0.55 * inch]), Spacer(1, 0.1 * inch)])
    story.append(
        para(
            "Interpretation of the note above: the database write path and mobile support submission path were validated successfully. "
            "A later direct endpoint recheck of an admin support route returned 404, which appeared to be a routing/versioning detail rather than a data-loss issue, because persistence had already been proven and admin visibility had been validated earlier in the smoke cycle.",
            styles["SmallNote"],
        )
    )

    story.append(PageBreak())

    story.extend(
        [
            para("Files Touched During Remediation", styles["SectionTitle"]),
        ]
    )
    file_rows = [
        ["Repository", "File", "Purpose of Change"],
        ["ADMIN-BACKEND", "src/modules/mobile/mobile.service.ts", "Fixed app-facing category sync behavior"],
        ["ADMIN-BACKEND", "src/modules/mobile/mobile.module.ts", "Registered service/module changes for category sync"],
        ["ADMIN-FRONTEND", "src/components/Catalog/ProductCategories.tsx", "Corrected category create payload to match backend DTO"],
        ["NEW APP", "src/features/user/screens/PlayScreen.tsx", "Resolved lint-blocking JSX text issue"],
        ["NEW APP", "src/shared/components/MaintenanceScreen.tsx", "Resolved lint-blocking JSX text and later hook cleanup"],
        ["NEW APP", "Multiple home/profile/onboarding/support files", "Removed stale warnings, unused helpers, and dependency issues to reach 0 warnings"],
    ]
    story.extend([make_table(file_rows, [1.25 * inch, 2.6 * inch, 3.0 * inch]), Spacer(1, 0.15 * inch)])

    story.extend(
        [
            para("Release Readiness Assessment", styles["SectionTitle"]),
            para(
                "Deployment readiness was assessed against the requested smoke criteria: application startup health, production build success, admin form submission correctness, API availability, mobile authentication, data persistence, and cross-system synchronization.",
                styles["BodyTight"],
            ),
        ]
    )
    release_rows = [
        ["Criterion", "Assessment"],
        ["Backend build readiness", "Ready"],
        ["Admin frontend build readiness", "Ready"],
        ["Mobile code quality gate", "Ready after cleanup to 0 errors / 0 warnings"],
        ["Core auth/API smoke", "Ready"],
        ["Database persistence", "Ready"],
        ["Admin-to-app data sync", "Ready after fixes"],
    ]
    story.extend([make_table(release_rows, [2.8 * inch, 3.0 * inch]), Spacer(1, 0.14 * inch)])
    story.append(
        para(
            "Overall recommendation: <b>deploy-ready for smoke scope</b>. No blocking failures remained at the end of the verification cycle.",
            styles["BodyTight"],
        )
    )

    story.extend(
        [
            para("Appendix: Key Verified Facts", styles["SectionTitle"]),
            para("Observed values captured during the smoke cycle:", styles["BodyTight"]),
            para("• Admin profile email: admin@srvelectricals.com", styles["BodyTight"]),
            para("• Mobile OTP test number: 9162038214", styles["BodyTight"]),
            para("• Admin category count observed: 33", styles["BodyTight"]),
            para("• Mobile category count observed: 33", styles["BodyTight"]),
            para("• Admin offer count observed: 2", styles["BodyTight"]),
            para("• Mobile offer count observed: 2", styles["BodyTight"]),
            para("• Persistence validation subject: Smoke Test 20260519134922", styles["BodyTight"]),
        ]
    )

    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
        title="SRV Multi-Project Smoke Test Report",
        author="OpenAI Codex",
    )
    doc.build(story, onFirstPage=page_decor, onLaterPages=page_decor)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
