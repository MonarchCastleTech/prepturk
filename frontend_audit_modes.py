from playwright.sync_api import sync_playwright
import time

def run_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile view
        context = browser.new_context(viewport={'width': 375, 'height': 667}, is_mobile=True)
        page = context.new_page()

        print("Navigating to http://localhost:3000 (Mobile View)...")
        try:
            page.goto("http://localhost:3000")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="audit_mobile_home.png")
            
            # Check for Mobile Menu
            menu_btn = page.locator("button[aria-label='Navigasyonu ac']").first
            if menu_btn.count() > 0:
                print("Mobile menu button found.")
                menu_btn.click()
                page.wait_for_timeout(500)
                print("Successfully opened mobile menu.")
                page.screenshot(path="audit_mobile_menu.png")
            
            # Test Low Power Mode (Simulate via localStorage)
            print("Enabling Low Power Mode...")
            page.evaluate("localStorage.setItem('prepturk:powerMode', 'true')")
            page.reload()
            page.wait_for_load_state("networkidle")
            # Check if grayscale filter is applied
            grayscale = page.evaluate("getComputedStyle(document.documentElement).filter")
            if 'grayscale' in grayscale or 'grayscale' in page.evaluate("getComputedStyle(document.body).filter"):
                print("Low Power Mode (Grayscale) active.")
            else:
                print("WARNING: Low Power Mode grayscale filter NOT found in computed style.")
            page.screenshot(path="audit_low_power.png")

            # Test Easy Mode
            print("Enabling Easy Mode...")
            page.evaluate("localStorage.setItem('prepturk:easyMode', 'true')")
            page.reload()
            page.wait_for_load_state("networkidle")
            font_size = page.evaluate("getComputedStyle(document.documentElement).fontSize")
            print(f"Easy Mode root font size: {font_size}")
            page.screenshot(path="audit_easy_mode.png")

        except Exception as e:
            print(f"Mobile/Mode Audit failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_audit()
