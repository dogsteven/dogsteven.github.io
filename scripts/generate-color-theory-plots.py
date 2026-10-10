"""Generate the article's SVG figures from checked-in CIE reference data.

Install scripts/requirements-color-plots.txt in a temporary virtual environment.
Run this script from any directory; it needs no network access.
"""

import csv
import hashlib
import json
import math
import os
from pathlib import Path
import tempfile

# Keep Matplotlib's font cache out of the repository and user configuration.
os.environ.setdefault("MPLCONFIGDIR", str(Path(tempfile.gettempdir()) / "sereneblog-matplotlib"))
os.environ.setdefault("XDG_CACHE_HOME", str(Path(tempfile.gettempdir()) / "sereneblog-plot-cache"))

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts/data/color-theory"
OUTPUT = ROOT / "public/assets/color-theory"
LICENSE = "https://creativecommons.org/licenses/by-sa/4.0/"
SPECTRA = (
    ("CIE_std_illum_D65.csv", None, "daylight-d65", "Daylight · CIE D65", "#205b9b"),
    ("CIE_std_illum_A_1nm.csv", None, "incandescent-a", "Incandescent light · CIE illuminant A", "#9b4c12"),
    ("CIE_illum_LEDs.csv", "LED-B3", "white-led-b3", "White LED · CIE LED-B3", "#46692a"),
)


def load_spectrum(filename, column):
    path = DATA / filename
    metadata = json.loads((DATA / f"{filename}_metadata_v2.json").read_text())
    expected = next(c["checksum"] for c in metadata["checksums"] if c["hashMethod"] == "sha256")
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise ValueError(f"Checksum mismatch: {filename}")
    headers = metadata["datatableInfo"]["columnHeaders"]
    index = next(i for i, h in enumerate(headers) if h["title"] == column) if column else 1
    with path.open(newline="") as stream:
        rows = [tuple(float(value) for value in row) for row in csv.reader(stream)]
    if any(len(row) != len(headers) for row in rows):
        raise ValueError(f"Unexpected column count: {filename}")
    visible = [(row[0], row[index]) for row in rows if 380 <= row[0] <= 780]
    wavelengths, power = zip(*visible)
    if wavelengths[0] != 380 or wavelengths[-1] != 780:
        raise ValueError(f"Incomplete visible range: {filename}")
    step = headers[index]["wavelength_step"]
    if any(b - a != step for a, b in zip(wavelengths, wavelengths[1:])):
        raise ValueError(f"Unexpected wavelength spacing: {filename}")
    if any(not math.isfinite(value) or value < 0 for value in power) or max(power) <= 0:
        raise ValueError(f"Invalid spectral power: {filename}")
    return wavelengths, [value / max(power) for value in power]


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    plt.rcParams.update({
        "font.family": "DejaVu Sans",
        "font.size": 17,
        "svg.fonttype": "none",
        "svg.hashsalt": "sereneblog-color-theory",
        "axes.labelcolor": "#202b38",
        "text.color": "#202b38",
        "xtick.color": "#202b38",
        "ytick.color": "#202b38",
    })
    for filename, column, slug, title, color in SPECTRA:
        wavelengths, power = load_spectrum(filename, column)
        fig, ax = plt.subplots(figsize=(8, 4.6), layout="constrained", facecolor="#f8fafc")
        ax.set_facecolor("#f8fafc")
        ax.plot(wavelengths, power, color=color, linewidth=2.7)
        ax.set(xlim=(380, 780), ylim=(0, 1.08), xlabel="Wavelength (nm)", ylabel="Relative spectral power")
        ax.set_title(title, loc="left", fontsize=18, pad=14)
        ax.set_xticks([380, 480, 580, 680, 780])
        ax.set_yticks([0, 0.25, 0.5, 0.75, 1], ["0", "0.25", "0.5", "0.75", "1"])
        ax.grid(color="#d6dee7", linewidth=0.8)
        ax.set_axisbelow(True)
        ax.spines[["top", "right"]].set_visible(False)
        ax.spines[["bottom", "left"]].set_color("#6b7785")
        fig.savefig(OUTPUT / f"{slug}.svg", metadata={
            "Date": None,
            "Title": title,
            "Creator": "SereneBlog; source data: International Commission on Illumination (CIE)",
            "Description": "CIE reference spectrum, cropped to 380–780 nm and independently peak-normalized to 1."
                           " Line segments connect the original tabulated samples; no smoothing is applied.",
            "Rights": f"CIE data and adapted figure: CC BY-SA 4.0, {LICENSE}",
        })
        plt.close(fig)
        print(f"Generated {slug}.svg ({len(wavelengths)} samples)")


if __name__ == "__main__":
    main()
