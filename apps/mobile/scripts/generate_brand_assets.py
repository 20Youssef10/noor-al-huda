from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


BASE = Path(__file__).resolve().parent.parent / 'assets'
BRAND = BASE / 'branding'
BRAND.mkdir(exist_ok=True)

BG = '#13100A'
BG2 = '#1B150F'
GOLD = '#C9A84C'
GOLD_LIGHT = '#E8C97A'
CREAM = '#F8F3E8'
EMERALD = '#1A6B3C'


def hex_rgba(value: str, alpha: int = 255):
    return tuple(int(value[i:i + 2], 16) for i in (1, 3, 5)) + (alpha,)


def draw_mark(size: int, transparent: bool = False, mono: bool = False):
    bg = (0, 0, 0, 0) if transparent else hex_rgba(BG)
    image = Image.new('RGBA', (size, size), bg)
    draw = ImageDraw.Draw(image)
    cx = cy = size // 2
    outer = int(size * 0.86)
    gold = (255, 255, 255, 255) if mono else hex_rgba(GOLD)
    gold_light = (255, 255, 255, 255) if mono else hex_rgba(GOLD_LIGHT)
    cream = (255, 255, 255, 255)
    emerald = (255, 255, 255, 255) if mono else hex_rgba(EMERALD)

    if not transparent and not mono:
        for i in range(size):
            blend = i / max(1, size - 1)
            draw.line(
                (0, i, size, i),
                fill=(
                    int(19 * (1 - blend) + 27 * blend),
                    int(16 * (1 - blend) + 21 * blend),
                    int(10 * (1 - blend) + 15 * blend),
                    255,
                ),
            )

    draw.rounded_rectangle(
        (int(size * 0.03), int(size * 0.03), int(size * 0.97), int(size * 0.97)),
        radius=int(size * 0.22),
        outline=(gold[0], gold[1], gold[2], 80),
        width=max(2, size // 64),
    )
    draw.ellipse(
        (cx - outer // 2, cy - outer // 2, cx + outer // 2, cy + outer // 2),
        outline=gold,
        width=max(4, size // 32),
    )

    draw.ellipse((cx - int(size * 0.16), cy - int(size * 0.33), cx + int(size * 0.14), cy - int(size * 0.03)), fill=gold_light)
    cut = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cut_draw = ImageDraw.Draw(cut)
    cut_draw.ellipse((cx - int(size * 0.11), cy - int(size * 0.34), cx + int(size * 0.19), cy - int(size * 0.04)), fill=bg)
    image.alpha_composite(cut)

    draw.rounded_rectangle((int(size * 0.29), int(size * 0.39), int(size * 0.71), int(size * 0.69)), radius=int(size * 0.2), fill=emerald)
    draw.rectangle((int(size * 0.39), int(size * 0.39), int(size * 0.61), int(size * 0.69)), fill=emerald)
    draw.arc((int(size * 0.34), int(size * 0.42), int(size * 0.66), int(size * 0.76)), start=200, end=340, fill=cream, width=max(3, size // 48))
    draw.arc((int(size * 0.24), int(size * 0.56), int(size * 0.76), int(size * 0.86)), start=205, end=335, fill=gold, width=max(3, size // 56))
    draw.arc((int(size * 0.32), int(size * 0.66), int(size * 0.68), int(size * 0.9)), start=210, end=330, fill=cream, width=max(2, size // 72))

    for x, y, r in [(0.74, 0.27, 0.015), (0.79, 0.33, 0.009), (0.27, 0.31, 0.012)]:
        radius = int(size * r)
        draw.ellipse((int(size * x) - radius, int(size * y) - radius, int(size * x) + radius, int(size * y) + radius), fill=cream if mono else gold_light)

    return image


def generate_pngs():
    icon = draw_mark(1024)
    icon.save(BASE / 'icon.png')
    icon.save(BASE / 'splash-icon.png')
    icon.resize((64, 64), Image.LANCZOS).save(BASE / 'favicon.png')

    draw_mark(432, transparent=True).save(BASE / 'android-icon-foreground.png')
    draw_mark(432, transparent=True, mono=True).save(BASE / 'android-icon-monochrome.png')

    background = Image.new('RGBA', (432, 432), hex_rgba(BG))
    draw = ImageDraw.Draw(background)
    for i in range(432):
        blend = i / 431
        draw.line(
            (0, i, 432, i),
            fill=(
                int(19 * (1 - blend) + 26 * blend),
                int(16 * (1 - blend) + 107 * blend),
                int(10 * (1 - blend) + 60 * blend),
                255,
            ),
        )
    draw.ellipse((40, 40, 392, 392), outline=(201, 168, 76, 60), width=10)
    draw.arc((86, 86, 346, 346), start=205, end=335, fill=(248, 243, 232, 60), width=8)
    background.save(BASE / 'android-icon-background.png')

    hero = Image.new('RGBA', (1400, 800), hex_rgba(BG2))
    draw = ImageDraw.Draw(hero)
    for i in range(800):
        blend = i / 799
        draw.line(
            (0, i, 1400, i),
            fill=(
                int(27 * (1 - blend) + 19 * blend),
                int(21 * (1 - blend) + 16 * blend),
                int(15 * (1 - blend) + 10 * blend),
                255,
            ),
        )
    moon = Image.new('RGBA', (1400, 800), (0, 0, 0, 0))
    moon_draw = ImageDraw.Draw(moon)
    moon_draw.ellipse((1010, 60, 1290, 340), fill=hex_rgba(GOLD_LIGHT))
    moon_draw.ellipse((1052, 72, 1332, 352), fill=(0, 0, 0, 0))
    hero.alpha_composite(moon)
    draw.ellipse((1008, 58, 1292, 342), outline=(201, 168, 76, 200), width=12)
    draw.arc((180, 400, 1220, 640), start=195, end=345, fill=(201, 168, 76, 220), width=16)
    draw.arc((300, 500, 1052, 740), start=195, end=345, fill=(248, 243, 232, 160), width=10)
    for x, y, r, color in [(240, 180, 12, GOLD_LIGHT), (1250, 480, 10, GOLD_LIGHT), (133, 132, 7, CREAM)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=hex_rgba(color))
    hero.filter(ImageFilter.GaussianBlur(0.2)).save(BRAND / 'hero-ornament.png')


if __name__ == '__main__':
    generate_pngs()
