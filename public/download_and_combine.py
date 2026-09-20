import os
import sys
import json
import urllib.request
import time

sys.stdout.reconfigure(encoding='utf-8')

CACHE_PATH = r"C:\Users\nihal\OneDrive\Desktop\quran pdf\quran_uthmani_cache.json"
AUDIO_DIR = r"C:\Users\nihal\OneDrive\Desktop\quran pdf\audio_cache"
OUTPUT_FILE = r"C:\Users\nihal\OneDrive\Desktop\quran pdf\combined_ayahs.mp3"

# Reciter: Mishary Rashid Alafasy 128kbps
BASE_URL = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/{}.mp3"

# Same ranges from build_pdf_styled.py (numberInSurah)
SURAH_RANGES = {
    1: [(1, 7)],
    2: [(1, 4), (102, 102), (152, 166), (255, 257), (285, 286)],
    3: [(1, 6), (15, 30), (133, 136), (190, 200)],
    4: [(72, 77), (90, 91), (116, 121), (171, 173)],
    6: [(61, 61), (112, 113), (123, 130)],
    7: [(11, 22), (54, 56), (115, 122), (196, 206)],
    8: [(7, 19), (48, 48)],
    9: [(7, 16), (25, 32), (40, 40), (128, 129)],
    10: [(57, 64), (79, 82)],
    11: [(64, 101)],
    13: [(8, 13), (28, 29)],
    14: [(10, 17), (42, 42)],
    15: [(28, 50)],
    16: [(63, 69), (96, 102)],
    17: [(26, 28), (45, 46), (53, 53), (78, 82), (105, 105)],
    18: [(1, 14), (103, 103)],
    19: [(83, 83)],
    20: [(60, 70), (98, 114), (124, 124)],
    21: [(42, 43), (74, 92)],
    22: [(19, 24), (38, 41)],
    23: [(97, 118)],
    24: [(35, 39)],
    25: [(21, 33)],
    26: [(78, 104), (221, 227)],
    27: [(59, 65), (76, 77)],
    30: [(20, 27)],
    36: [(1, 83)],
    37: [(1, 10)],
    39: [(21, 23)],
    40: [(38, 52)],
    41: [(31, 36)],
    43: [(36, 38)],
    50: [(26, 33)],
    59: [(18, 24)],
    72: [(1, 28)],
    99: [(1, 8)],
    109: [(1, 6)],
    110: [(1, 3)],
    112: [(1, 4)],
    113: [(1, 5)],
    114: [(1, 6)],
}

def get_global_ayah_numbers(quran_data, surah_num, local_start, local_end):
    surah = quran_data['surahs'][surah_num - 1]
    numbers = []
    for ayah in surah['ayahs']:
        if local_start <= ayah['numberInSurah'] <= local_end:
            numbers.append(ayah['number'])
    return numbers

def download_audio(url, filepath):
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        return True
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            with open(filepath, 'wb') as f:
                f.write(resp.read())
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def main():
    print("Loading Quran data...")
    with open(CACHE_PATH, 'r', encoding='utf-8-sig') as f:
        quran_data = json.load(f)

    os.makedirs(AUDIO_DIR, exist_ok=True)

    # Collect all global ayah numbers in order
    all_ayahs = []
    for surah_num in sorted(SURAH_RANGES.keys()):
        for local_start, local_end in SURAH_RANGES[surah_num]:
            globals_list = get_global_ayah_numbers(quran_data, surah_num, local_start, local_end)
            all_ayahs.extend(globals_list)

    total = len(all_ayahs)
    print(f"Total ayahs to download: {total}")

    # Download all
    downloaded = []
    for i, gnum in enumerate(all_ayahs):
        filepath = os.path.join(AUDIO_DIR, f"{gnum}.mp3")
        url = BASE_URL.format(gnum)

        if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
            downloaded.append(filepath)
            if (i + 1) % 50 == 0:
                print(f"  [{i+1}/{total}] cached ayah {gnum}")
            continue

        print(f"  [{i+1}/{total}] downloading ayah {gnum}...")
        if download_audio(url, filepath):
            downloaded.append(filepath)
        else:
            print(f"  RETRY ayah {gnum}...")
            time.sleep(2)
            if download_audio(url, filepath):
                downloaded.append(filepath)
            else:
                print(f"  SKIPPED ayah {gnum}")

        # Small delay to be polite to server
        if (i + 1) % 10 == 0:
            time.sleep(0.5)

    print(f"\nDownloaded: {len(downloaded)}/{total}")
    print("Combining audio files...")

    from pydub import AudioSegment
    combined = AudioSegment.empty()
    silence = AudioSegment.silent(duration=800)  # 0.8s pause between ayahs

    for i, fp in enumerate(downloaded):
        try:
            seg = AudioSegment.from_mp3(fp)
            combined += seg
            if i < len(downloaded) - 1:
                combined += silence
        except Exception as e:
            print(f"  Error processing {fp}: {e}")

    combined.export(OUTPUT_FILE, format="mp3", bitrate="192k")
    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    duration_sec = len(combined) / 1000
    mins = int(duration_sec // 60)
    secs = int(duration_sec % 60)
    print(f"\nDone! Output: {OUTPUT_FILE}")
    print(f"Size: {size_mb:.1f} MB | Duration: {mins}m {secs}s")

if __name__ == "__main__":
    main()
