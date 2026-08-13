"""Generate app icons for the HMS frontend PWA."""
from PIL import Image, ImageDraw, ImageFont

def generate_icon(size: int, path: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Rounded rectangle background with blue gradient-like solid
    radius = int(size * 0.22)
    d.rounded_rectangle(
        [0, 0, size - 1, size - 1],
        radius=radius,
        fill=(37, 99, 235, 255),
    )

    # Hospital cross symbol (white)
    arm_w = int(size * 0.14)
    arm_l = int(size * 0.52)
    center = size // 2
    d.rectangle(
        [center - arm_l // 2, center - arm_w // 2, center + arm_l // 2, center + arm_w // 2],
        fill=(255, 255, 255, 255),
    )
    d.rectangle(
        [center - arm_w // 2, center - arm_l // 2, center + arm_w // 2, center + arm_l // 2],
        fill=(255, 255, 255, 255),
    )

    img.save(path)
    print(f"Saved {path} ({size}x{size})")

base = "/home/ubuntu/hospital-management-system/frontend/public"
generate_icon(192, f"{base}/icon-192x192.png")
generate_icon(512, f"{base}/icon-512x512.png")

# Maskable icons (larger safe zone)
generate_icon(512, f"{base}/masked-icon.svg".replace(".svg", ".png") if False else f"{base}/maskable-icon-512x512.png")

# favicon.ico
generate_icon(64, "/tmp/favicon-64.png")
Image.open("/tmp/favicon-64.png").save(f"{base}/favicon.ico", sizes=[(64, 64), (48, 48), (32, 32), (16, 16)])
print("Saved favicon.ico")
