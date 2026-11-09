# Offline reference footprints

Source: KiCad library contributors, `KiCad/kicad-footprints` on GitHub, pinned commit `7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd`.

These are actual library footprints, **not** a claim of manufacturer approval, newest-release coverage, universal suitability, or IPC-7352 conformity. Package names may be standardized library models rather than commercial orderable part numbers. Electrical applicability is filtered separately from the mechanical family. Named resistor, capacitor, diode, inductor, crystal and oscillator library examples are only offered in their matching component groups (or the explicitly selected advanced/custom catalogue). Generic mechanical package references can be shared where applicable. A shared body outline is not permission to show a capacitor model under resistors.

## Attribution and changes

Original `.kicad_mod` files are included unmodified under the KiCad Libraries license (CC-BY-SA 4.0 with the library exception). See `LICENSE.txt`. Source paths and exact commit are listed in `manifest.json`; the UI links to that exact source. Copyright belongs to the KiCad library contributors. The embedded geometry data is a transformed subset: Y-axis conversion, selected copper pad data, and F.Fab lines/circles. The transformed reference data is distributed under the same library license. The application code is separate from that dataset.

The renderer preserves reference pad positions, dimensions, rotation, roundrect radii, drill/slot local dimensions, and polygon primitives plus anchor rectangles. A user-selected rectangular/oblong override can change non-circular SMT pad shapes. Source coordinates keep their original origin. F.Fab arcs, silkscreen, source courtyard, paste, mask and 3D models are not imported. The display envelope is recalculated with a stated 0.25 mm margin, not qualified as an IPC courtyard. Imported-reference Altium export is explicitly blocked, not silently approximated; edited data is available as JSON/CSV, while the downloadable original KiCad file does not include user edits.

## Rebuild

From the repository root: `python audits/import-reference-footprints.py`. This regenerates only the `referenceFootprintData` JSON block inside `tool.html` from the attributed local originals. No network or third-party dependency is required.

## Coverage

47 library references plus 3 existing direct TI templates cover **50 of the 66 package groups**. The remaining 16 groups have formula/configuration paths (6) or explicit user-dimension geometry builders (10), not sourced ready-made references. This does **not** mean 50 IPC formula solvers. All reference examples have an explicit model name, provenance and a warning requiring the user to adapt values to their own part datasheet.

| Group | Specific reference | Original file |
|---|---|---|
| `chip` | `R_1206_3216Metric` | [Resistor_SMD.pretty/R_1206_3216Metric.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Resistor_SMD.pretty/R_1206_3216Metric.kicad_mod) |
| `soic` | `SOIC-8_3.9x4.9mm_P1.27mm` | [Package_SO.pretty/SOIC-8_3.9x4.9mm_P1.27mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_SO.pretty/SOIC-8_3.9x4.9mm_P1.27mm.kicad_mod) |
| `qfp` | `LQFP-48_7x7mm_P0.5mm` | [Package_QFP.pretty/LQFP-48_7x7mm_P0.5mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_QFP.pretty/LQFP-48_7x7mm_P0.5mm.kicad_mod) |
| `bga` | `BGA-100_11.0x11.0mm_Layout10x10_P1.0mm_Ball0.5mm_Pad0.4mm_NSMD` | [Package_BGA.pretty/BGA-100_11.0x11.0mm_Layout10x10_P1.0mm_Ball0.5mm_Pad0.4mm_NSMD.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_BGA.pretty/BGA-100_11.0x11.0mm_Layout10x10_P1.0mm_Ball0.5mm_Pad0.4mm_NSMD.kicad_mod) |
| `dip` | `DIP-14_W7.62mm` | [Package_DIP.pretty/DIP-14_W7.62mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_DIP.pretty/DIP-14_W7.62mm.kicad_mod) |
| `sot23` | `SOT-23` | [Package_TO_SOT_SMD.pretty/SOT-23.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_SMD.pretty/SOT-23.kicad_mod) |
| `qfn` | `QFN-32-1EP_5x5mm_P0.5mm_EP3.45x3.45mm` | [Package_DFN_QFN.pretty/QFN-32-1EP_5x5mm_P0.5mm_EP3.45x3.45mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_DFN_QFN.pretty/QFN-32-1EP_5x5mm_P0.5mm_EP3.45x3.45mm.kicad_mod) |
| `son` | `DFN-10-1EP_3x3mm_P0.5mm_EP1.55x2.48mm` | [Package_DFN_QFN.pretty/DFN-10-1EP_3x3mm_P0.5mm_EP1.55x2.48mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_DFN_QFN.pretty/DFN-10-1EP_3x3mm_P0.5mm_EP1.55x2.48mm.kicad_mod) |
| `soj` | `SOJ-36_10.16x23.49mm_P1.27mm` | [Package_SO.pretty/SOJ-36_10.16x23.49mm_P1.27mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_SO.pretty/SOJ-36_10.16x23.49mm_P1.27mm.kicad_mod) |
| `plcc` | `PLCC-44` | [Package_LCC.pretty/PLCC-44.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_LCC.pretty/PLCC-44.kicad_mod) |
| `melf` | `D_MiniMELF` | [Diode_SMD.pretty/D_MiniMELF.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Diode_SMD.pretty/D_MiniMELF.kicad_mod) |
| `axial` | `R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal` | [Resistor_THT.pretty/R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Resistor_THT.pretty/R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal.kicad_mod) |
| `radial` | `CP_Radial_D5.0mm_P2.00mm` | [Capacitor_THT.pretty/CP_Radial_D5.0mm_P2.00mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Capacitor_THT.pretty/CP_Radial_D5.0mm_P2.00mm.kicad_mod) |
| `array-conc` | `R_Array_Concave_4x0603` | [Resistor_SMD.pretty/R_Array_Concave_4x0603.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Resistor_SMD.pretty/R_Array_Concave_4x0603.kicad_mod) |
| `array-convex` | `R_Array_Convex_4x0603` | [Resistor_SMD.pretty/R_Array_Convex_4x0603.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Resistor_SMD.pretty/R_Array_Convex_4x0603.kicad_mod) |
| `sot223` | `SOT-223-3_TabPin2` | [Package_TO_SOT_SMD.pretty/SOT-223-3_TabPin2.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_SMD.pretty/SOT-223-3_TabPin2.kicad_mod) |
| `sot89` | `SOT-89-3` | [Package_TO_SOT_SMD.pretty/SOT-89-3.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_SMD.pretty/SOT-89-3.kicad_mod) |
| `sot143` | `SOT-143` | [Package_TO_SOT_SMD.pretty/SOT-143.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_SMD.pretty/SOT-143.kicad_mod) |
| `sod` | `D_SOD-123` | [Diode_SMD.pretty/D_SOD-123.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Diode_SMD.pretty/D_SOD-123.kicad_mod) |
| `sodfl` | `D_SOD-123F` | [Diode_SMD.pretty/D_SOD-123F.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Diode_SMD.pretty/D_SOD-123F.kicad_mod) |
| `dpak` | `TO-252-3_TabPin2` | [Package_TO_SOT_SMD.pretty/TO-252-3_TabPin2.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_SMD.pretty/TO-252-3_TabPin2.kicad_mod) |
| `to-th` | `TO-92_Inline` | [Package_TO_SOT_THT.pretty/TO-92_Inline.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_THT.pretty/TO-92_Inline.kicad_mod) |
| `qfp-rect` | `PQFP-100_14x20mm_P0.65mm` | [Package_QFP.pretty/PQFP-100_14x20mm_P0.65mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_QFP.pretty/PQFP-100_14x20mm_P0.65mm.kicad_mod) |
| `qfn-rect` | `DFN-24-1EP_4x7mm_P0.5mm_EP2.64x6.44mm` | [Package_DFN_QFN.pretty/DFN-24-1EP_4x7mm_P0.5mm_EP2.64x6.44mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_DFN_QFN.pretty/DFN-24-1EP_4x7mm_P0.5mm_EP2.64x6.44mm.kicad_mod) |
| `pqfn` | `Infineon_PQFN-22-15-4EP_6x5mm_P0.65mm` | [Package_DFN_QFN.pretty/Infineon_PQFN-22-15-4EP_6x5mm_P0.65mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_DFN_QFN.pretty/Infineon_PQFN-22-15-4EP_6x5mm_P0.65mm.kicad_mod) |
| `lga` | `Bosch_LGA-14_3x2.5mm_P0.5mm` | [Package_LGA.pretty/Bosch_LGA-14_3x2.5mm_P0.5mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_LGA.pretty/Bosch_LGA-14_3x2.5mm_P0.5mm.kicad_mod) |
| `sip` | `SIP-8_19x3mm_P2.54mm` | [Package_SIP.pretty/SIP-8_19x3mm_P2.54mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_SIP.pretty/SIP-8_19x3mm_P2.54mm.kicad_mod) |
| `hdr` | `PinHeader_1x04_P2.54mm_Vertical` | [Connector_PinHeader_2.54mm.pretty/PinHeader_1x04_P2.54mm_Vertical.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Connector_PinHeader_2.54mm.pretty/PinHeader_1x04_P2.54mm_Vertical.kicad_mod) |
| `socket` | `PLCC-44_THT-Socket` | [Package_LCC.pretty/PLCC-44_THT-Socket.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_LCC.pretty/PLCC-44_THT-Socket.kicad_mod) |
| `connector-smd` | `USB_Micro-B_Molex-105017-0001` | [Connector_USB.pretty/USB_Micro-B_Molex-105017-0001.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Connector_USB.pretty/USB_Micro-B_Molex-105017-0001.kicad_mod) |
| `xtal-dfn` | `Crystal_SMD_3225-4Pin_3.2x2.5mm` | [Crystal.pretty/Crystal_SMD_3225-4Pin_3.2x2.5mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Crystal.pretty/Crystal_SMD_3225-4Pin_3.2x2.5mm.kicad_mod) |
| `osc-flat` | `Oscillator_SMD_Abracon_ASE-4Pin_3.2x2.5mm` | [Oscillator.pretty/Oscillator_SMD_Abracon_ASE-4Pin_3.2x2.5mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Oscillator.pretty/Oscillator_SMD_Abracon_ASE-4Pin_3.2x2.5mm.kicad_mod) |
| `electrolytic` | `C_Elec_6.3x5.4` | [Capacitor_SMD.pretty/C_Elec_6.3x5.4.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Capacitor_SMD.pretty/C_Elec_6.3x5.4.kicad_mod) |
| `chip-polar` | `CP_EIA-3216-18_Kemet-A` | [Capacitor_Tantalum_SMD.pretty/CP_EIA-3216-18_Kemet-A.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Capacitor_Tantalum_SMD.pretty/CP_EIA-3216-18_Kemet-A.kicad_mod) |
| `molded-polar` | `CP_EIA-3528-21_Kemet-B` | [Capacitor_Tantalum_SMD.pretty/CP_EIA-3528-21_Kemet-B.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Capacitor_Tantalum_SMD.pretty/CP_EIA-3528-21_Kemet-B.kicad_mod) |
| `flat` | `D_SOD-323F` | [Diode_SMD.pretty/D_SOD-323F.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Diode_SMD.pretty/D_SOD-323F.kicad_mod) |
| `conc` | `R_Array_Concave_2x0603` | [Resistor_SMD.pretty/R_Array_Concave_2x0603.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Resistor_SMD.pretty/R_Array_Concave_2x0603.kicad_mod) |
| `molded` | `D_SMA` | [Diode_SMD.pretty/D_SMA.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Diode_SMD.pretty/D_SMA.kicad_mod) |
| `dfn-discrete` | `SOT-883` | [Package_TO_SOT_SMD.pretty/SOT-883.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_SMD.pretty/SOT-883.kicad_mod) |
| `bga-dual` | `BGA-200_10.0x14.5mm_Layout12x22_P0.80x0.65mm` | [Package_BGA.pretty/BGA-200_10.0x14.5mm_Layout12x22_P0.80x0.65mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_BGA.pretty/BGA-200_10.0x14.5mm_Layout12x22_P0.80x0.65mm.kicad_mod) |
| `bgas` | `WLCSP-12_1.403x1.555mm_P0.4mm_Stagger` | [Package_CSP.pretty/WLCSP-12_1.403x1.555mm_P0.4mm_Stagger.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_CSP.pretty/WLCSP-12_1.403x1.555mm_P0.4mm_Stagger.kicad_mod) |
| `npth` | `MountingHole_2.2mm_M2` | [MountingHole.pretty/MountingHole_2.2mm_M2.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/MountingHole.pretty/MountingHole_2.2mm_M2.kicad_mod) |
| `osc-j` | `Oscillator_SMD_SeikoEpson_SG8002JA-4Pin_14.0x8.7mm` | [Oscillator.pretty/Oscillator_SMD_SeikoEpson_SG8002JA-4Pin_14.0x8.7mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Oscillator.pretty/Oscillator_SMD_SeikoEpson_SG8002JA-4Pin_14.0x8.7mm.kicad_mod) |
| `precision-molded` | `L_Coilcraft_XAL5030` | [Inductor_SMD.pretty/L_Coilcraft_XAL5030.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Inductor_SMD.pretty/L_Coilcraft_XAL5030.kicad_mod) |
| `custom` | `SW_PUSH_6mm` | [Button_Switch_THT.pretty/SW_PUSH_6mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Button_Switch_THT.pretty/SW_PUSH_6mm.kicad_mod) |
| `unique` | `SW_PUSH_6mm` | [Button_Switch_THT.pretty/SW_PUSH_6mm.kicad_mod](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Button_Switch_THT.pretty/SW_PUSH_6mm.kicad_mod) |

## Still without a verified matching starting reference

- `pull`: SON با Pullback دوطرفه
- `inward`: پایهٔ L رو به داخل
- `butt`: Butt / I-lead دوطرفه
- `lug`: Flat Lug دوطرفه
- `array-flat`: آرایهٔ چیپ تخت
- `corner`: Corner Concave
- `sotfl`: SOTFL؛ پایهٔ تخت ترانزیستور
- `lcc`: LCC / LCCS / Ceramic Leadless
- `cga`: CGA / PCGA؛ ستون / pillar
- `cdip`: CDIP / DIPC؛ دو ردیف متقارن
- `pressfit`: کانکتور Press-fit؛ سوراخ طبق دیتاشیت سازنده
- `osc-l`: اسیلاتور L-bend
- `jump-th`: جامپر سیمی دوپایه
- `diode-nonpolar`: دیود چیپ غیرقطبی DIONC
- `cfp`: CFP؛ Ceramic Flat Package
- `sol`: SOL؛ Small Outline L-lead
- `dfn-polar`: DFN قطب‌دار CAPPDFN

These groups retain explicit unsupported/configuration status as applicable. No unrelated sample is fabricated to claim complete coverage.

### Additional source

`sotfl`: [SOT-383FL](https://github.com/KiCad/kicad-footprints/blob/7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd/Package_TO_SOT_SMD.pretty/SOT-383FL.kicad_mod), original unmodified, same license and pinned version. This specific eight-pad flat-lead model does not represent all SOTFL devices.

The ten direct geometry builders intentionally start without made-up dimensions. Users must supply their exact manufacturer land pattern. These are application code, not derived library examples or IPC formula solvers.
