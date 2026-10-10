# CIE spectrum data and article figures

These unmodified CSV files and their metadata were downloaded from CIE on
2026-10-10. Metadata include column definitions, SHA-256 checksums, source
publications, and license information.

- CIE 2019, **CIE standard illuminant D65**, DOI
  [10.25039/CIE.DS.hjfjmt59](https://cie.co.at/datatable/cie-standard-illuminant-d65).
- CIE 2018, **CIE standard illuminant A – 1 nm**, DOI
  [10.25039/CIE.DS.8jsxjrsn](https://cie.co.at/datatable/cie-standard-illuminant-1-nm).
- CIE 2018, **Relative spectral power distributions of illuminants representing
  typical LED lamps**, DOI
  [10.25039/CIE.DS.vgssnyfg](https://cie.co.at/datatable/relative-spectral-power-distributions-illuminants-representing-typical-led-lamps).
  The article uses the LED-B3 column, a phosphor-type LED reference.

Creator and publisher: International Commission on Illumination (CIE), Vienna, AT.
The datasets and the three adapted SVG figures in `public/assets/color-theory/`
are licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).
This asset license is separate from the site's code license.

The figures crop the data to 380–780 nm and independently normalize each curve
to its maximum in that interval. They compare spectral shapes, not absolute
power. D65 represents daylight, illuminant A represents typical incandescent
lighting, and LED-B3 is a reference LED distribution; they are not measurements
of specific lamps or of the Sun. Lines connect the original samples without
smoothing.

## Regenerate

From the repository root, using a temporary virtual environment:

```sh
python3 -m venv /tmp/sereneblog-color-plots
/tmp/sereneblog-color-plots/bin/python -m pip install -r scripts/requirements-color-plots.txt
/tmp/sereneblog-color-plots/bin/python scripts/generate-color-theory-plots.py
```

The script verifies the original CSV SHA-256 checksums and selects the LED
column by its metadata name. Once dependencies are installed, generation is
offline. Matplotlib's cache is kept in the system temporary directory.
