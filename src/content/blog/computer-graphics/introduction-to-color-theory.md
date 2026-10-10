---
title: "Introduction to Color Theory for Computer Graphics"
description: "How light spectra and human vision lead to CIE RGB, XYZ, xyY, linear sRGB, and encoded sRGB."
date: 2026-10-10
tags:
  - Computer Graphics
draft: false
---

A computer usually represents a color with three numbers: red, green, and blue. Sunlight, however, contains light at many wavelengths. Why can three numbers describe its color? And what do those numbers measure?

The answer begins with the distribution of light across wavelengths and the way our eyes respond to that distribution. Color matching then connects this physical description to the three-coordinate systems used in computer graphics.

## Light and its spectral power distribution

Most light we encounter—sunlight, lamp light, and light reflected from objects—contains photons of many different wavelengths. Such light is **polychromatic**. **Monochromatic** light has a single wavelength; a laser with its light concentrated in a very narrow wavelength range approximates this case.

Light carries energy. Its **radiant power** is the energy carried per unit time, measured in watts: one watt is one joule per second. For a beam containing photons of different wavelengths, the total power includes contributions from all those wavelengths.

To describe how this power is distributed, we use a **spectral power distribution** (SPD), written $P(\lambda)$, where $\lambda$ denotes wavelength. For any wavelength region $S$, the power carried by wavelengths in that region is

$$
\int_S P(\lambda)\,d\lambda.
$$

Thus, $P$ is a density of power with respect to wavelength. If wavelength is measured in nanometers, its units are watts per nanometer (W/nm). Integrating over all wavelengths gives the beam's total power. Integrating over a smaller region, such as 500–600 nm, gives only the power carried in that region.

An SPD plot shows which wavelength ranges carry more of a light signal's power. The following plots illustrate daylight, incandescent lighting, and a white LED. Each distribution has been divided by its own maximum, so the vertical axes show relative values rather than power in W/nm.

<figure>
  <img src="/assets/color-theory/daylight-d65.svg" alt="Relative spectrum of CIE D65 daylight from 380 to 780 nanometers, with power distributed broadly across the visible range." width="800" height="460" />
  <figcaption><a href="https://cie.co.at/datatable/cie-standard-illuminant-d65">CIE standard illuminant D65</a>, a reference spectrum representing average daylight.</figcaption>
</figure>

<figure>
  <img src="/assets/color-theory/incandescent-a.svg" alt="Relative spectrum of CIE illuminant A, rising smoothly from shorter to longer wavelengths across the visible range." width="800" height="460" loading="lazy" />
  <figcaption><a href="https://cie.co.at/datatable/cie-standard-illuminant-1-nm">CIE standard illuminant A</a>, a reference spectrum representing tungsten-filament lighting.</figcaption>
</figure>

<figure>
  <img src="/assets/color-theory/white-led-b3.svg" alt="Relative spectrum of CIE LED-B3, showing a narrow blue peak and a broad band at longer wavelengths." width="800" height="460" loading="lazy" />
  <figcaption>LED-B3, a white LED reference from the <a href="https://cie.co.at/datatable/relative-spectral-power-distributions-illuminants-representing-typical-led-lamps">CIE LED illuminant dataset</a>.</figcaption>
</figure>

Daylight has a broad distribution. The incandescent spectrum puts more power into longer visible wavelengths, while the LED has a narrow blue peak and a broader band at longer wavelengths. These plots describe the physical light. The next step is to determine how the eye responds to it.

## How the eye combines wavelengths

The retina contains light-sensitive cells called rods and cones. Rods are especially useful at low light levels. Under ordinary daylight conditions, color vision begins with three types of cones: **L**, **M**, and **S**, named for their sensitivity to long, medium, and short wavelengths. Their sensitivity ranges overlap, so a wavelength can stimulate more than one cone type. [Stockman and Rider, 2023](https://discovery.ucl.ac.uk/id/eprint/10174051/)

A cone combines the contributions from wavelengths to which it is sensitive. Each contribution depends on the power arriving at those wavelengths and the cone's sensitivity there. Consequently, equal-power beams at different wavelengths need not stimulate it equally.

This gives the SPD its role in a color calculation: it describes the power available at each wavelength, which the eye combines according to its sensitivities. Each cone type produces a combined response, so the spectrum is summarized by three responses at this initial stage of daylight vision.

Two different spectra can produce the same three responses and match in color under the same viewing conditions. Such light signals are called **metamers**. This is why a display can reproduce the color of a light signal without reproducing its entire spectrum: it needs a mixture of its primaries that produces a color match. [CIE metameric stimuli](https://cie.co.at/eilvterm/17-23-008)

## CIE RGB: measuring a color match

A **color space** specifies a system of coordinates for describing colors. One way to establish those coordinates is to measure the amounts of three reference lights, called **primaries**, that match a test light.

In a color-matching experiment, an observer sees the test light beside a mixture of the primaries and adjusts their intensities until the two sides match. The International Commission on Illumination (CIE) standardized such measurements in the **CIE 1931 RGB** system. Its monochromatic primaries are red at 700 nm, green at 546.1 nm, and blue at 435.8 nm. The standardized matching behavior, based on experiments with a small viewing field, is called the **CIE 1931 standard observer**. [NIST: CIE Fundamentals for Color Measurements](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=841491)

First consider monochromatic test lights with the same radiant power. Repeating the experiment at different wavelengths produces three **color-matching functions**, $\bar r(\lambda)$, $\bar g(\lambda)$, and $\bar b(\lambda)$. They specify the primary amounts required at each wavelength, using fixed units for the test power and primary intensities.

Some wavelengths cannot be matched by adding only these three primaries. A primary must instead be added to the test side. If test light plus red matches green plus blue, rearranging the matching equation gives the test light a negative red coefficient. This accounts for the negative regions of the CIE RGB matching functions.

### From monochromatic matches to a spectrum

A polychromatic signal combines light at many wavelengths. Its matching primary amounts are found by weighting the monochromatic matching coefficients by the signal's SPD and combining their contributions. Integrating over the visible wavelength range $\Lambda$ gives

$$
\begin{aligned}
R[P]&=k\int_{\Lambda}P(\lambda)\,\bar r(\lambda)\,d\lambda,\\
G[P]&=k\int_{\Lambda}P(\lambda)\,\bar g(\lambda)\,d\lambda,\\
B[P]&=k\int_{\Lambda}P(\lambda)\,\bar b(\lambda)\,d\lambda.
\end{aligned}
$$

The notation $R[P]$ means the red coordinate calculated from spectrum $P$, and similarly for $G[P]$ and $B[P]$. These three coordinates are called **tristimulus values**. The positive constant $k$ sets their overall scale: $k=1$ leaves the integrals unscaled, while another fixed value multiplies all three coordinates by that value. The same $k$ is used for every light signal being compared or combined.

For ordinary light mixtures, powers add wavelength by wavelength. Two spectra $P_1$ and $P_2$, scaled by amounts $a$ and $b$, give the combined spectrum $aP_1+bP_2$. Its red coordinate satisfies

$$
\begin{aligned}
R[aP_1+bP_2]
&=k\int_{\Lambda}(aP_1+bP_2)\,\bar r\,d\lambda\\
&=aR[P_1]+bR[P_2].
\end{aligned}
$$

Green and blue obey the same relation. Writing the coordinates as a vector $\mathbf c[P]=(R[P],G[P],B[P])^T$ gives

$$
\mathbf c[aP_1+bP_2]
=a\mathbf c[P_1]+b\mathbf c[P_2].
$$

This is the **linearity** used in light calculations: adding spectra corresponds to adding color vectors, and scaling a spectrum corresponds to scaling its vector. A renderer can therefore accumulate light contributions using three numbers per contribution.

## CIE XYZ: choosing more convenient coordinates

CIE RGB provides a color-matching description, but its negative coefficients are inconvenient. It also has no single coordinate for measuring the light with the eye's overall daylight sensitivity. **CIE XYZ** addresses both points by using three new matching functions, $\bar x$, $\bar y$, and $\bar z$.

These functions are nonnegative. In addition, $\bar y$ is the CIE's standard daylight wavelength weighting: it measures the relative contribution per watt used to compare light according to human visual sensitivity. It is dimensionless, with a maximum of 1 near 555 nm. A wavelength where $\bar y=0.5$ contributes half as much per watt to this measurement as one where $\bar y=1$. [CIE daylight wavelength weighting](https://www.cie.co.at/eilvterm/17-21-035)

The XYZ coordinates are calculated as

$$
\begin{aligned}
X[P]&=k\int_{\Lambda}P(\lambda)\,\bar x(\lambda)\,d\lambda,\\
Y[P]&=k\int_{\Lambda}P(\lambda)\,\bar y(\lambda)\,d\lambda,\\
Z[P]&=k\int_{\Lambda}P(\lambda)\,\bar z(\lambda)\,d\lambda.
\end{aligned}
$$

The $Y$ integral therefore gives a visually weighted measure of the light's power. In relative color calculations, a chosen white light is assigned $Y=1$. The constant $k$ is then the reciprocal of that white's unscaled $Y$ integral, so every signal is measured on the same relative scale.

The new matching functions are fixed linear combinations of the CIE RGB functions. For example, a relation $\bar x=a_{11}\bar r+a_{12}\bar g+a_{13}\bar b$ gives $X=a_{11}R+a_{12}G+a_{13}B$. Collecting the coefficients for all three coordinates gives a fixed, invertible matrix $A$:

$$
\begin{pmatrix}X\\Y\\Z\end{pmatrix}
=A\begin{pmatrix}R\\G\\B\end{pmatrix}.
$$

XYZ uses a mathematical coordinate basis rather than three physical lamps. It retains the same color matches as CIE RGB. Multiplication by $A$ preserves addition and scaling, so XYZ retains the linearity of the spectral integrals. [CIE 1931 XYZ system](https://cie.co.at/eilv/150)

## CIE xyY: separating proportions from magnitude

Doubling a light signal doubles $X$, $Y$, and $Z$, but leaves their proportions unchanged. Those proportions describe its **chromaticity**. To record them separately from the light level, divide $X$ and $Y$ by the tristimulus sum:

$$
x=\frac{X}{X+Y+Z},\qquad
y=\frac{Y}{X+Y+Z}.
$$

The remaining proportion is $Z/(X+Y+Z)=1-x-y$, so two coordinates suffice. The **CIE xyY** representation keeps $x$ and $y$ for chromaticity and the original $Y$ for the light level. Plotting $x$ against $y$ gives the CIE chromaticity diagram, on which a primary or a white reference can be specified by a point. [CIE chromaticity coordinates](https://cie.co.at/eilvterm/17-23-053)

To recover XYZ, use $y=Y/(X+Y+Z)$. For $y>0$, the sum is $Y/y$, giving

$$
X=\frac{xY}{y},\qquad
Z=\frac{(1-x-y)Y}{y},
$$

with $Y$ retained directly. For example, $(X,Y,Z)=(0.3,0.4,0.3)$ becomes $(x,y,Y)=(0.3,0.4,0.4)$. Doubling the light changes xyY to $(0.3,0.4,0.8)$: chromaticity stays fixed while $Y$ doubles. Black, where all XYZ coordinates are zero, has no defined chromaticity.

To combine signals expressed in xyY, recover their XYZ values, add the XYZ vectors, and convert back. The division used to calculate chromaticity changes the arithmetic of these coordinates; the underlying light mixture still follows the linear XYZ relation.

## sRGB: specifying a display's primaries

XYZ describes color matches without tying them to a particular display. **sRGB**, defined by IEC 61966-2-1, specifies red, green, and blue primaries and a D65 white point:

| | $x$ | $y$ |
| --- | ---: | ---: |
| Red | 0.64 | 0.33 |
| Green | 0.30 | 0.60 |
| Blue | 0.15 | 0.06 |
| White (D65) | 0.3127 | 0.3290 |

These primaries differ from the monochromatic primaries of CIE RGB. The white point is the chromaticity produced when all three contribute their full reference amounts. [ICC sRGB specification](https://registry.color.org/rgb-registry/srgb)

### Linear sRGB

**Linear sRGB** values $r$, $g$, and $b$ are proportional to the light contributed by each primary: 0 means no contribution and 1 means the full reference amount. IEC 61966-2-1 relates them to XYZ by a fixed matrix, shown here with rounded coefficients:

$$
\begin{pmatrix}r\\g\\b\end{pmatrix}
\approx\begin{pmatrix}
3.2406&-1.5372&-0.4986\\
-0.9689&1.8758&0.0415\\
0.0557&-0.2040&1.0570
\end{pmatrix}
\begin{pmatrix}X\\Y\\Z\end{pmatrix}.
$$

XYZ uses the relative scale where the D65 reference white has $Y=1$. This conversion is linear, so linear sRGB preserves the addition and scaling properties established for CIE RGB and XYZ. [ICC explanation of IEC 61966-2-1](https://registry.color.org/rgb-registry/files/sRGB.pdf)

### Encoded sRGB

The sRGB values commonly stored in images use a nonlinear encoding of these same primary amounts. It assigns finer steps to low light levels when stored values are uniformly quantized. Each linear channel $c\in[0,1]$ is encoded as

$$
f(c)=\begin{cases}
12.92c,&c\leq0.0031308,\\
1.055c^{1/2.4}-0.055,&c>0.0031308.
\end{cases}
$$

For example, a linear value of 0.5 encodes to about 0.735, while an encoded value of 0.5 represents only about 0.214 of the reference light amount. This encoding does not preserve addition or scaling. To combine light contributions from sRGB images, decode the stored values with $f^{-1}$, calculate in linear sRGB, and encode the result for output. [W3C sRGB encoding and decoding functions](https://www.w3.org/TR/css-color-4/#color-conversion-code)

---

The spectral plots adapt CIE datasets for D65 (2019), illuminant A (2018), and LED illuminants (2018). They show 380–780 nm, independently normalized to their maxima, with the original samples connected without smoothing. The data and adapted figures are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
