import os
from datetime import datetime

# --- AUTOMATYCZNA DZISIEJSZA DATA ---
dzisiaj = datetime.now().strftime("%d.%m.%Y")
print(f"Ustawiam datę aktualizacji na: {dzisiaj}")

# --- DEFINICJA ZMIAN ---

# 1. Zmiana WIBOR + Data
STARY_WIBOR = """Stawki Referencyjne
Dane na dzień: 04.11.2025
WIBOR 1M
4,50%
WIBOR 3M
4,38%
WIBOR 6M
4,27%"""

NOWY_WIBOR = f"""Stawki Referencyjne
Dane na dzień: {dzisiaj}
WIBOR 1M
4,19%
WIBOR 3M
4,15%
WIBOR 6M
4,01%"""

# 2. Zmiana Odsetek + Data
STARE_ODSETKI = """Odsetki ustawowe za opóźnienie
Dane na dzień: 04.11.2025
10%"""

NOWE_ODSETKI = f"""Odsetki ustawowe za opóźnienie
Dane na dzień: {dzisiaj}
9,5%"""

def naprawiaj():
    licznik = 0
    katalog = os.getcwd() # Obecny folder
    
    print("Rozpoczynam pracę...")
    
    for root, dirs, files in os.walk(katalog):
        for file in files:
            if file.endswith(".html"):
                sciezka = os.path.join(root, file)
                zmiana = False
                
                try:
                    with open(sciezka, 'r', encoding='utf-8') as f:
                        tresc = f.read()
                    
                    # Sprawdzenie i zamiana WIBOR
                    if STARY_WIBOR in tresc:
                        tresc = tresc.replace(STARY_WIBOR, NOWY_WIBOR)
                        zmiana = True
                        print(f" -> Zaktualizowano WIBOR w: {file}")

                    # Sprawdzenie i zamiana Odsetek
                    if STARE_ODSETKI in tresc:
                        tresc = tresc.replace(STARE_ODSETKI, NOWE_ODSETKI)
                        zmiana = True
                        print(f" -> Zaktualizowano ODSETKI w: {file}")
                    
                    # Zapisz tylko jeśli coś zmieniono
                    if zmiana:
                        with open(sciezka, 'w', encoding='utf-8') as f:
                            f.write(tresc)
                        licznik += 1
                        
                except Exception as e:
                    print(f"Błąd w pliku {file}: {e}")

    print("-" * 30)
    print(f"Gotowe! Zmieniono plików: {licznik}")
    print("Możesz teraz usunąć ten skrypt.")

if __name__ == "__main__":
    naprawiaj()
