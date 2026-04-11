from playwright.sync_api import sync_playwright
import os
import time

ROUTES = [
    "/dashboard", "/documents", "/search", "/ai-chat", "/education", "/maps",
    "/acil", "/toplanma", "/sablonlar", "/su-aritma",
    "/saglik", "/kronik-hastalik", "/semptom-kontrol", "/psikolojik-saglik", "/pandemi-hazirlik",
    "/gida-saklama", "/barinak-isinma", "/mesafe-tahmin", "/yildiz-navigasyon", "/hazirlik-zaman-cizelgesi", "/mevsim-hazirlik", "/sehir-koy",
    "/dusuk-guc", "/gunes-sarj", "/guc-hesaplayici", "/envanter", "/radyo-frekans",
    "/qr-mesaj", "/topluluk-kaynak", "/takas-rehberi", "/veri-senkronizasyon", "/topluluk",
    "/sinav", "/cocuk-aktivite", "/cocuk-kimlik",
    "/guvenlik-planlama", "/emp-hazirlik",
    "/vault", "/settings", "/admin"
]

def verify_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        results = []
        
        for route in ROUTES:
            url = f"http://localhost:3000{route}"
            print(f"Checking {url}...")
            try:
                response = page.goto(url, timeout=5000)
                page.wait_for_load_state("networkidle")
                
                status = response.status
                title = page.title()
                
                # Check for "Not Found" or empty page
                h1 = page.locator("h1").first
                h1_text = h1.inner_text() if h1.count() > 0 else "NO H1"
                
                # Basic usability check: Is there a back button or navigation?
                has_nav = page.locator("nav").count() > 0
                
                # Check for "placeholder" or "Lorem Ipsum"
                content = page.content().lower()
                has_placeholder = "placeholder" in content or "lorem ipsum" in content
                
                results.append({
                    "route": route,
                    "status": status,
                    "h1": h1_text,
                    "nav": has_nav,
                    "placeholder": has_placeholder
                })
                
                if status != 200:
                    print(f"  [!] Non-200 status: {status}")
                if has_placeholder:
                    print(f"  [!] Found placeholder text on {route}")
                    
            except Exception as e:
                results.append({
                    "route": route,
                    "status": "ERROR",
                    "error": str(e)
                })
                print(f"  [!] Error checking {route}: {e}")

        browser.close()
        return results

if __name__ == "__main__":
    import json
    res = verify_pages()
    with open("audit_results.json", "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2, ensure_ascii=False)
