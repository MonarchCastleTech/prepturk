from playwright.sync_api import sync_playwright
import time
import os

def run_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Capture console logs
        logs = []
        page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: logs.append(f"[EXCEPTION] {exc}"))

        print("Navigating to http://localhost:3000...")
        try:
            page.goto("http://localhost:3000", timeout=60000)
            page.wait_for_load_state("networkidle")
            
            # 1. Check Homepage
            print(f"Title: {page.title()}")
            page.screenshot(path="audit_home.png")
            
            # 2. Check Water Purification
            print("Navigating to /su-aritma...")
            page.goto("http://localhost:3000/su-aritma")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="audit_su_aritma.png")
            
            # Verify specific elements
            kaynatma_card = page.locator("text=Kaynatma")
            if kaynatma_card.count() > 0:
                print("Water purification card 'Kaynatma' found.")
                # Test interactivity: Expand card
                expand_btn = page.locator("button[aria-label='Ac']").first
                if expand_btn.count() > 0:
                    expand_btn.click()
                    page.wait_for_timeout(500)
                    print("Successfully expanded purification card.")
                    page.screenshot(path="audit_su_aritma_expanded.png")
            else:
                print("CRITICAL: Water purification content missing!")

            # 3. Check Symptom Checker
            print("Navigating to /semptom-kontrol...")
            page.goto("http://localhost:3000/semptom-kontrol")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="audit_semptom_kontrol.png")
            
            # Test interactivity: Select a symptom
            ates_btn = page.locator("text=Ateş")
            if ates_btn.count() > 0:
                print("Symptom 'Ateş' button found.")
                ates_btn.click()
                page.wait_for_load_state("networkidle")
                print("Successfully navigated to Fever detail page.")
                page.screenshot(path="audit_semptom_detail.png")
                
                # Check for critical warning signs section
                warning_section = page.locator("text=112 ARANMASI GEREKEN")
                if warning_section.count() > 0:
                    print("Emergency warning section visible.")
                else:
                    print("WARNING: Emergency warning section NOT found in detail page!")
            else:
                print("CRITICAL: Symptom list missing!")

            # 4. Check for local assets errors
            print("\n--- Console Error Audit ---")
            error_found = False
            for log in logs:
                # Filter out intentional network failures for backend API if needed
                if "error" in log.lower() or "exception" in log.lower() or "failed to load" in log.lower():
                    # Ignore expected backend connection errors since we are only testing frontend isolation
                    if "http://localhost:8000" in log:
                        continue
                    print(log)
                    error_found = True
            if not error_found:
                print("No critical frontend asset or logic errors found.")
            print("--------------------\n")

        except Exception as e:
            print(f"Audit failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_audit()
