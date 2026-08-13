"""Generate Android launcher icons for all densities."""
from PIL import Image, ImageDraw

SRC = "/home/ubuntu/hospital-management-system/frontend/public/icon-512x512.png"

DENSITIES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

base = "/home/ubuntu/hospital-management-system/frontend/android/app/src/main/res"

# Foreground square icon (adaptive icon foreground, full bleed)
src = Image.open(SRC).convert("RGBA")

for density, size in DENSITIES.items():
    folder = f"{base}/mipmap-{density}"
    img = src.resize((size, size), Image.LANCZOS)
    img.save(f"{folder}/ic_launcher.png")
    img.save(f"{folder}/ic_launcher_round.png")
    print(f"Saved {folder}/ic_launcher.png ({size}x{size})")

# Adaptive icon foreground (needs safe zone; use 432x432 @ xxxhdpi scaled)
FG_SRC = "/home/ubuntu/hospital-management-system/frontend/public/icon-192x192.png"
fg_src = Image.open(FG_SRC).convert("RGBA")

FG_SIZES = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}
import os
for density, size in FG_SIZES.items():
    folder = f"{base}/drawable-{density}"
    os.makedirs(folder, exist_ok=True)
    img = fg_src.resize((size, size), Image.LANCZOS)
    img.save(f"{folder}/ic_launcher_foreground.png")
    print(f"Saved {folder}/ic_launcher_foreground.png ({size}x{size})")

print("Done.")
