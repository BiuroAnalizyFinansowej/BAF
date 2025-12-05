import os
import re
import subprocess
from datetime import datetime

# --- 1. KONFIGURACJA DANYCH ---
def pobierz_dane():
    print("\n" + "="*50)
    print("   BAF RATUNEK - CZYSZCZENIE I NAPRAWA")
    print("="*50)
    
    # Domyślne wartości (żebyś mógł klikać Enter)
    w1m = input("1. WIBOR 1M [Enter = 4,18%]: ").strip() or "4,18%"
    w3m = input("2. WIBOR 3M [Enter = 4,12%]: ").strip() or "4,12%"
    w6m = input("3. WIBOR 6M [Enter = 3,97%]: ").strip() or "3,97%"
    ods = input("4. ODSETKI  [Enter = 9,5%]:  ").strip() or "9,5%"
    
    # Dodajemy % jeśli brakuje
    if not w1m.endswith("%"): w1m += "%"
    if not w3m.endswith("%"): w3m += "%"
    if not w6m.endswith("%"): w6m += "%"
    if not ods.endswith("%"): ods += "%"

    return {"WIBOR_1M": w1m, "WIBOR_3M": w3m, "WIBOR_6M": w6m, "ODSETKI": ods}

# --- 2. GŁÓWNA LOGIKA NAPRAWY ---
def napraw_pliki(dane):
    nowa_data = datetime.now().strftime("%d.%m.%Y")
    licznik = 0
    katalog = os.getcwd()
    
    print(f"\nRozpoczynam ratowanie plików (Data: {nowa_data})...")

    # To jest nowy, czysty skrypt, który dokleimy na koniec każdego pliku
    nowy_skrypt_js = f"""
    <script>
        // BAF AUTO UPDATE - {nowa_data}
        try {{
            document.getElementById('wibor-1m').textContent = '{dane['WIBOR_1M']}';
            document.getElementById('wibor-3m').textContent = '{dane['WIBOR_3M']}';
            document.getElementById('wibor-6m').textContent = '{dane['WIBOR_6M']}';
            document.getElementById('odsetki-opoznienie').textContent = '{dane['ODSETKI']}';
            
            const dzisiaj = 'Dane na dzień: {nowa_data}';
            if(document.getElementById('current-date-wibor')) document.getElementById('current-date-wibor').textContent = dzisiaj;
            if(document.getElementById('current-date-odsetki')) document.getElementById('current-date-odsetki').textContent = dzisiaj;
        }} catch(e) {{ console.log('Brak elementu w tym pliku'); }}
    </script>
    </body>
    """

    for root, dirs, files in os.walk(katalog):
        for file in files:
            if file.endswith(".html") and "auto_baf" not in file:
                sciezka = os.path.join(root, file)
                try:
                    with open(sciezka, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    
                    new_lines = []
                    zmiana = False
                    
                    # KROK A: CZYSZCZENIE
                    # Usuwamy stare, zepsute linijki, żeby nie blokowały przeglądarki
                    for line in lines:
                        # Jeśli linia zawiera próbę zmiany wiboru (stare skrypty), pomijamy ją (usuwamy)
                        if "document.getElementById" in line and ("wibor-" in line or "odsetki-" in line):
                            zmiana = True # Zaznaczamy, że czyścimy syf
                            continue 
                        # Usuwamy stary blok skryptu auto update jeśli istnieje (żeby się nie dublowały)
                        if "// BAF AUTO UPDATE" in line:
                            continue
                            
                        # Jeśli to nie jest zamknięcie body, dodajemy linię
                        if "</body>" not in line:
                            new_lines.append(line)

                    # KROK B: WSTAWIANIE NOWEGO SKRYPTU
                    # Składamy plik z powrotem i doklejamy na końcu (zamiast </body>) nasz kod
                    full_content = "".join(new_lines)
                    full_content += nowy_skrypt_js

                    with open(sciezka, 'w', encoding='utf-8') as f:
                        f.write(full_content)
                    
                    print(f"[NAPRAWIONO] {file}")
                    licznik += 1
                        
                except Exception as e:
                    print(f"Błąd w {file}: {e}")
                    
    print(f"\nUratowano plików: {licznik}")

# --- 3. WYSYŁANIE Z KONFIGURACJĄ TOŻSAMOŚCI ---
def git_push():
    print("\n--- KONFIGURACJA I WYSYŁANIE ---")
    try:
        # 1. NAJWAŻNIEJSZE: Przedstawiamy się Gitowi (rozwiązuje błąd Identity Unknown)
        print("1. Konfiguracja użytkownika...")
        subprocess.run('git config --global user.email "admin@baf.pl"', shell=True, check=False)
        subprocess.run('git config --global user.name "BAF Admin"', shell=True, check=False)
        
        # 2. Wysyłanie
        print("2. Wysyłanie zmian...")
        subprocess.run("git add .", shell=True, check=True)
        subprocess.run(f'git commit -m "Naprawa {datetime.now().strftime("%d.%m %H:%M")}"', shell=True, check=True)
        subprocess.run("git push", shell=True, check=True)
        
        print("\n[SUKCES] Wszystko naprawione i wysłane na GitHub!")
        
    except subprocess.CalledProcessError as e:
        print(f"\n[INFO] Git: {e}")
        print("Jeśli widzisz błąd, spróbuj wpisać w czarnym oknie: git push")

if __name__ == "__main__":
    dane = pobierz_dane()
    napraw_pliki(dane)
    git_push()
    input("\nNaciśnij ENTER, aby zamknąć...")
