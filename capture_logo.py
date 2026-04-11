from playwright.sync_api import sync_playwright
import os

def capture_logo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1024, 'height': 1024})
        
        # Get absolute path
        file_path = os.path.abspath('logo_render.html')
        url = f"file:///{file_path.replace('\\', '/')}"
        
        print(f"Opening {url}...")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        # Capture the container
        container = page.locator(".container")
        container.screenshot(path="prepturk/apps/web/public/logo.png", omit_background=True)
        print("Logo saved to prepturk/apps/web/public/logo.png")
        
        browser.close()

if __name__ == "__main__":
    capture_logo()
