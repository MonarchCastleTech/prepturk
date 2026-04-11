#!/usr/bin/env bash
set -euo pipefail

# prepturk Seed Demo Data Script
# Creates admin user, sample documents, province packs, and notes
# Usage: bash scripts/seed_demo.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

API_URL="${API_URL:-http://localhost:8000}"
ADMIN_EMAIL="admin@prepturk.local"
ADMIN_PASSWORD="admin123456"
ADMIN_NAME="Administrator"

get_auth_token() {
  local response
  response=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" 2>/dev/null)

  echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo ""
}

api_post() {
  local endpoint="$1"
  local data="$2"
  local token="$3"

  curl -s -X POST "$API_URL${endpoint}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${token}" \
    -d "$data" 2>/dev/null
}

api_get() {
  local endpoint="$1"
  local token="$2"

  curl -s -X GET "$API_URL${endpoint}" \
    -H "Authorization: Bearer ${token}" 2>/dev/null
}

log_info "Starting demo data seeding..."

# Step 1: Create admin user
log_info "Creating admin user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\",\"name\":\"${ADMIN_NAME}\"}" 2>/dev/null || echo "")

if echo "$REGISTER_RESPONSE" | grep -qi "error\|detail" 2>/dev/null; then
  log_warn "Admin user may already exist, continuing..."
else
  log_info "Admin user created: ${ADMIN_EMAIL}"
fi

# Get auth token
TOKEN=$(get_auth_token)
if [ -z "$TOKEN" ]; then
  log_error "Failed to authenticate. API may not be running."
  log_error "Start the API first: docker compose up -d api"
  exit 1
fi

log_info "Authenticated successfully"

# Step 2: Create sample documents
log_info "Creating sample documents..."

DOCUMENTS=(
  '{"title":"Deprem Aninda Ne Yapmali?","source_type":"official","source_name":"AFAD","source_url":"https://www.afad.gov.tr","category":"emergency_guide","province_code":"00","language":"tr","summary":"Deprem sirasinda ve sonrasinda alinmasi gereken onlemler","content_type":"guide"}'
  '{"title":"Acil Durum Cantasi Hazirlama Rehberi","source_type":"official","source_name":"AFAD","source_url":"https://www.afad.gov.tr","category":"emergency_guide","province_code":"00","language":"tr","summary":"Her evde bulunmasi gereken acil durum cantasi icerigi","content_type":"checklist"}'
  '{"title":"Istanbul Il Afet Risk Haritasi","source_type":"institutional","source_name":"Istanbul Buyuksehir Belediyesi","source_url":"https://ibb.istanbul","category":"risk_map","province_code":"34","language":"tr","summary":"Istanbul icin deprem risk analizi haritasi","content_type":"map"}'
  '{"title":"Izmir Deprem Sonrasi Toplanma Alanlari","source_type":"institutional","source_name":"Izmir Belediyesi","source_url":"https://www.izmir.bel.tr","category":"assembly_areas","province_code":"35","language":"tr","summary":"Izmir ilindeki acil toplanma alanlarinin konumlari","content_type":"map"}'
  '{"title":"Hatay Il Saglik Tesisleri Haritasi","source_type":"institutional","source_name":"Hatay Saglik Il Mudurlugu","source_url":"https://hataysaglik.gov.tr","category":"healthcare","province_code":"31","language":"tr","summary":"Hatay ilindeki hastane ve saglik ocaklari konumlari","content_type":"map"}'
  '{"title":"6 Subat 2023 Deprem Raporu","source_type":"official","source_name":"AFAD","source_url":"https://deprem.afad.gov.tr","category":"incident_report","province_code":"46","language":"tr","summary":"Kahramanmaras merkezli depremlerin detayli analizi","content_type":"report"}'
  '{"title":"Van Golu Cevresi Afet Planlama","source_type":"institutional","source_name":"Van Valiligi","source_url":"https://van.gov.tr","category":"emergency_plan","province_code":"65","language":"tr","summary":"Van Golu cevresi icin afet yonetim plani","content_type":"plan"}'
  '{"title":"Ilkyardim Temel Bilgiler","source_type":"official","source_name":"Saglik Bakanligi","source_url":"https://www.saglik.gov.tr","category":"first_aid","province_code":"00","language":"tr","summary":"Temel ilkyardim uygulamalari ve teknikleri","content_type":"guide"}'
  '{"title":"Deprem Cantasi Checklist","source_type":"user","source_name":"Topluluk Katkisi","category":"emergency_guide","province_code":"00","language":"tr","summary":"Pratik deprem cantasi hazirlama listesi","content_type":"checklist"}'
  '{"title":"Ankara Acil Durum Iletisim Rehberi","source_type":"institutional","source_name":"Ankara Valiligi","source_url":"https://ankara.gov.tr","category":"contacts","province_code":"06","language":"tr","summary":"Ankara il acil durum iletisim bilgileri","content_type":"directory"}'
  '{"title":"Marmara Bolgesi Tsunami Risk Analizi","source_type":"official","source_name":"Kandilli Rasathanesi","source_url":"https://www.koeri.boun.edu.tr","category":"risk_analysis","province_code":"34","language":"tr","summary":"Marmara Denizi tsunami risk degerlendirmesi","content_type":"report"}'
  '{"title":"Ege Bolgesi Fay Hatlari Haritasi","source_type":"official","source_name":"MTA","source_url":"https://www.mta.gov.tr","category":"geological","province_code":"35","language":"tr","summary":"Ege bolgesi aktif fay hatlari ve deprem riskleri","content_type":"map"}'
  '{"title":"Afet Sonrasi Psikolojik Destek Rehberi","source_type":"institutional","source_name":"Turk Psikologlar Dernegi","category":"mental_health","province_code":"00","language":"tr","summary":"Afet sonrasinda psikolojik saglamlik icin oneriler","content_type":"guide"}'
  '{"title":"Yangin Guvenligi ve Tahliye Plani","source_type":"official","source_name":"Itfaiye Dairesi","source_url":"https://www.itfaiye.gov.tr","category":"fire_safety","province_code":"00","language":"tr","summary":"Yangin onleme ve guvenli tahliye stratejileri","content_type":"guide"}'
  '{"title":"Sel ve Su Baskinina Karsi Onlemler","source_type":"official","source_name":"DSI","source_url":"https://www.dsi.gov.tr","category":"flood_safety","province_code":"00","language":"tr","summary":"Sel riski olan bolgelerde alinmasi gereken onlemler","content_type":"guide"}'
)

CREATED_COUNT=0
for doc in "${DOCUMENTS[@]}"; do
  RESPONSE=$(api_post "/api/documents" "$doc" "$TOKEN")
  if echo "$RESPONSE" | grep -qi "id\|title" 2>/dev/null; then
    CREATED_COUNT=$((CREATED_COUNT + 1))
  fi
done

log_info "Created ${CREATED_COUNT}/${#DOCUMENTS[@]} sample documents"

# Step 3: Create sample province packs references
log_info "Creating province pack references..."

PROVINCE_PACKS=(
  '{"province_code":"34","province_name":"Istanbul","region":"Marmara","description":"Istanbul afet hazirlik paketi"}'
  '{"province_code":"35","province_name":"Izmir","region":"Ege","description":"Izmir afet hazirlik paketi"}'
  '{"province_code":"31","province_name":"Hatay","region":"Akdeniz","description":"Hatay afet hazirlik paketi"}'
  '{"province_code":"46","province_name":"Kahramanmaras","region":"Akdeniz","description":"Kahramanmaras afet hazirlik paketi"}'
  '{"province_code":"65","province_name":"Van","region":"Dogu Anadolu","description":"Van afet hazirlik paketi"}'
  '{"province_code":"06","province_name":"Ankara","region":"Ic Anadolu","description":"Ankara afet hazirlik paketi"}'
)

PACK_COUNT=0
for pack in "${PROVINCE_PACKS[@]}"; do
  RESPONSE=$(api_post "/api/province-packs" "$pack" "$TOKEN")
  if echo "$RESPONSE" | grep -qi "id\|province" 2>/dev/null; then
    PACK_COUNT=$((PACK_COUNT + 1))
  fi
done

log_info "Created ${PACK_COUNT}/${#PROVINCE_PACKS[@]} province pack references"

# Step 4: Create sample notes
log_info "Creating sample notes..."

NOTES=(
  '{"title":"Deprem cantamizi hazirladik","content":"Ailece deprem cantalarimizi hazirladik. Su, konserven yiyecek, el feneri, ilk yardim malzemeleri tam.","tags":["deprem","hazirlik"],"province_code":"34"}'
  '{"title":"Toplanma alanimizi belirledik","content":"Mahallemizdeki acil toplanma alani okul bahcesi. En yakin rota uzerindeki alternatif yollari da belirledik.","tags":["toplanma","plan"],"province_code":"34"}'
  '{"title":"Ilkyardim egitimi tamamlandi","content":"Kizilaydan temel ilkyardim egitimini tamamladik. Her ev bireyinin bu egitimi almasini oneriyorum.","tags":["ilkyardim","egitim"],"province_code":"35"}'
  '{"title":"Acil durum iletisim plani","content":"Aile ictin acil durum iletisim plani hazirlandi. Herkesin arayacagi kisi belirlendi. Bulusma noktasi park.","tags":["iletisim","plan"],"province_code":"06"}'
  '{"title":"6 Subat deneyimleri","content":"Depremde en onemli ogrendigimiz sey: hazirlikli olmak hayat kurtariyor. Cantalar her zaman hazir olmali.","tags":["deneyim","deprem"],"province_code":"31"}'
)

NOTE_COUNT=0
for note in "${NOTES[@]}"; do
  RESPONSE=$(api_post "/api/notes" "$note" "$TOKEN")
  if echo "$RESPONSE" | grep -qi "id\|title" 2>/dev/null; then
    NOTE_COUNT=$((NOTE_COUNT + 1))
  fi
done

log_info "Created ${NOTE_COUNT}/${#NOTES[@]} sample notes"

# Summary
echo ""
log_info "============================================"
log_info "  Demo data seeding complete!"
log_info "============================================"
log_info ""
log_info "Admin login:"
log_info "  Email: ${ADMIN_EMAIL}"
log_info "  Password: ${ADMIN_PASSWORD}"
log_info ""
log_info "Created:"
log_info "  Documents: ${CREATED_COUNT}"
log_info "  Province Packs: ${PACK_COUNT}"
log_info "  Notes: ${NOTE_COUNT}"
log_info ""
log_info "Access: ${API_URL}"
log_info "============================================"
