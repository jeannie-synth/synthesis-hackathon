"""Pixel-art figurine tokens for the five Landlord's Game players.

Each sprite is a 16x16 grid of palette keys, rendered with nearest-neighbor
scaling so the pixels stay crisp. Colors come from core.STRATEGY_COLORS.
"""

from PIL import Image, ImageDraw

SCALE = 14  # 16px grid -> 224px sprite

# Shared token-base colors (every figurine stands on a game-token pedestal)
BASE = {"s": "#B0BEC5", "S": "#78909C"}

FIGURES = {
    "Extractive": {
        "nick": "The Shark",
        "palette": {
            "m": "#A93B6B",  # body
            "d": "#7E2B4F",  # fins
            "b": "#EBC7D8",  # belly
            "w": "#FFFFFF",  # teeth
            "e": "#1A1A1A",  # eye
            **BASE,
        },
        "grid": [
            "................",
            "................",
            "......d.........",
            ".....dm.........",
            "....dmmm........",
            "..mmmmmmmmm...d.",
            ".mmmmmmmmmmmm.dd",
            "mmemmmmmmmmmmddd",
            "mmmmmmmmmmmmmd..",
            "mwmwmwmmmmmmdd..",
            ".bbbbbbbbbbb....",
            "...bbbbbb.......",
            "................",
            "..ssssssssssss..",
            ".SSSSSSSSSSSSSS.",
            "................",
        ],
    },
    "Generative": {
        "nick": "The Builder",
        "palette": {
            "m": "#0097A7",  # overalls
            "d": "#00646F",  # legs
            "f": "#E0B08A",  # skin
            "e": "#1A1A1A",  # eyes
            "r": "#C96A50",  # brick
            "h": "#ECEFF1",  # hard-hat dome (site-manager white)
            "H": "#B0BEC5",  # hard-hat brim
            **BASE,
        },
        "grid": [
            "................",
            "......hhhh......",
            ".....hhhhhh.....",
            "....HHHHHHHH....",
            ".....ffffff.....",
            ".....feffef.....",
            ".....ffffff.....",
            "....mmmmmmmm....",
            "...fmmmmmmmmf...",
            "...f.mmmmmm.f...",
            ".rrr.mmmmmm.....",
            ".rrrddd..ddd....",
            "....ddd..ddd....",
            "..ssssssssssss..",
            ".SSSSSSSSSSSSSS.",
            "................",
        ],
    },
    "Conditional": {
        "nick": "The Mirror",
        "palette": {
            "d": "#1F618D",  # frame + handle
            "g": "#AED6F1",  # glass
            "w": "#FFFFFF",  # shine
            **BASE,
        },
        "grid": [
            "................",
            ".....ddddd......",
            "....dgggggd.....",
            "...dgwwggggd....",
            "...dgwgggggd....",
            "...dgggggggd....",
            "...dgggggggd....",
            "....dgggggd.....",
            ".....ddddd......",
            ".......dd.......",
            ".......dd.......",
            "......dddd......",
            "................",
            "..ssssssssssss..",
            ".SSSSSSSSSSSSSS.",
            "................",
        ],
    },
    "FreeRider": {
        "nick": "The Passenger",
        "palette": {
            "m": "#E6A817",  # shirt/body
            "d": "#B58410",  # deck chair
            "f": "#E0B08A",  # skin
            "k": "#1A1A1A",  # sunglasses
            **BASE,
        },
        "grid": [
            "................",
            "................",
            "................",
            "...fff..........",
            "...kkk..........",
            "...fff..........",
            "....mmm.........",
            "....mmmmm.......",
            ".....mmmmmmm....",
            "......mmmmmmmmf.",
            "...ddddddddddd..",
            "....d.......d...",
            "....d.......d...",
            "..ssssssssssss..",
            ".SSSSSSSSSSSSSS.",
            "................",
        ],
    },
    "Pavlov": {
        "nick": "The Streak",
        "palette": {
            "m": "#7E57C2",  # bolt
            **BASE,
        },
        "grid": [
            "................",
            "........mmm.....",
            ".......mmmm.....",
            "......mmmm......",
            ".....mmmm.......",
            "....mmmmmmm.....",
            "......mmmm......",
            ".....mmmm.......",
            "....mmmm........",
            "...mmmm.........",
            "...mmm..........",
            "...mm...........",
            "...m............",
            "..ssssssssssss..",
            ".SSSSSSSSSSSSSS.",
            "................",
        ],
    },
}


def render(grid, palette, scale=SCALE):
    n = len(grid)
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(grid):
        assert len(row) == n, f"row {y} has {len(row)} cols, want {n}: {row!r}"
        for x, ch in enumerate(row):
            if ch != ".":
                px[x, y] = tuple(
                    int(palette[ch][i:i + 2], 16) for i in (1, 3, 5)
                ) + (255,)
    return img.resize((n * scale, n * scale), Image.NEAREST)


def contact_sheet(out_dir):
    pad, label_h = 20, 44
    size = 16 * SCALE
    sheet = Image.new(
        "RGB",
        (pad + len(FIGURES) * (size + pad), size + label_h + 2 * pad),
        "#f8f9fa",
    )
    draw = ImageDraw.Draw(sheet)
    for i, (name, spec) in enumerate(FIGURES.items()):
        sprite = render(spec["grid"], spec["palette"])
        x = pad + i * (size + pad)
        sheet.paste(sprite, (x, pad), sprite)
        sprite.save(f"{out_dir}/{name.lower()}.png")
        draw.text((x + 4, pad + size + 6), name, fill="#333333")
        draw.text((x + 4, pad + size + 24), f'"{spec["nick"]}"', fill="#888888")
    sheet.save(f"{out_dir}/contact_sheet.png")
    print("wrote", f"{out_dir}/contact_sheet.png")


if __name__ == "__main__":
    import os
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(__file__)
    contact_sheet(out)
