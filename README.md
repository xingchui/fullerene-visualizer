# Fullerene 3D Visualization Tool

A desktop application for visualizing fullerene carbon cage molecules (C20, C60, C70, C76, C78, C80, C84) in 3D using React, Three.js, and Electron.

![Fullerene Visualization](https://raw.githubusercontent.com/xingchui/fullerene-visualizer/main/docs/preview.png)

## Features

- **7 Supported Structures**: C20, C60, C70, C76, C78, C80, C84
- **3D Interactive View**: Rotate, zoom, pan with mouse controls
- **Topology Validation**: All structures verified using Euler formula (V - E + F = 2)
- **Display Options**: Toggle atoms/bonds, adjust sizes, switch projection modes
- **Automated Rotation**: Optional auto-rotation with adjustable speed
- **Screenshot Export**: Save current view as PNG image

## Supported Molecules

| Structure | Atoms | Bonds | Faces | Pentagons | Hexagons | Symmetry |
|-----------|-------|-------|-------|-----------|----------|----------|
| C20 | 20 | 30 | 14 | 12 | 2 | Ih |
| C60 | 60 | 90 | 32 | 12 | 20 | Ih |
| C70 | 70 | 105 | 37 | 12 | 25 | D5h |
| C76 | 76 | 114 | 40 | 12 | 26 | D2 |
| C78 | 78 | 117 | 41 | 12 | 27 | D3 |
| C80 | 80 | 120 | 42 | 12 | 28 | D5d |
| C84 | 84 | 126 | 44 | 12 | 32 | D2 |

## Requirements

- Node.js 18+
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/xingchui/fullerene-visualizer.git
cd fullerene-visualizer

# Install dependencies
npm install
```

## Development

### Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 to view in browser.

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Build Electron App

```bash
npm run electron:build
```

Output: `release/` directory

### Run Tests

```bash
# Run all tests
npm test

# Run tests once
npm run test:run
```

## Usage

### Interface Controls

1. **Molecule Selector**: Dropdown in header to switch between structures
2. **3D Viewport**:
   - Left-drag: Rotate view
   - Scroll: Zoom in/out
   - Right-drag: Pan
3. **Display Options Panel** (left side):
   - Toggle atoms/chemical bonds
   - Adjust atom and bond sizes
   - Switch projection mode (perspective/orthographic)
   - Control auto-rotation
4. **Molecule Info Panel** (right side):
   - Shows atom/bond counts
   - Displays selected atom index

### Taking Screenshots

Click the "截图" (Screenshot) button to save the current view as a PNG file.

## Project Structure

```
src/
├── App.tsx                 # Main React application
├── data/
│   ├── types.ts           # Type definitions
│   ├── fullerenes.ts      # Shared utilities
│   └── c20.ts - c84.ts    # Fullerene coordinate data
├── test/
│   └── fullerene.test.ts  # Unit tests
└── tools/
    └── verify_*.js        # Verification scripts

electron/
└── main.ts                # Electron main process

docs/
└── HELP.md                # Detailed documentation
```

## Coordinate Data Sources

Molecular coordinates are sourced from authoritative databases:

- **CCL Database**: https://server.ccl.net/cca/data/fullerenes/
- **Nanoten Database**: https://nanotube.msu.edu/fullerene/
- **Zenodo**: https://zenodo.org/records/5615405
- **Scientific Literature**: J. Phys. Chem. C 2009, 113, 5141-5149

## Topology Validation

All structures satisfy the Euler formula for convex polyhedra:

```
V - E + F = 2
```

Where:
- V = vertices (atoms)
- E = edges (chemical bonds)
- F = faces (pentagons + hexagons)

## Algorithm

Chemical bonds are generated using the Mutual k-Nearest Neighbors (k=3) algorithm:

1. Calculate Euclidean distances between all atom pairs
2. Find k=3 nearest neighbors for each atom
3. Keep only mutual (bidirectional) connections
4. Additional bonds are filled to match expected count

## Adding New Structures

To add support for additional fullerenes (e.g., C90):

1. Obtain precise coordinates from authoritative source
2. Create new data file in `src/data/` directory
3. Follow the pattern in existing files (c20.ts - c84.ts)
4. Add molecule type to `App.tsx`
5. Run tests and build to verify

## Contributing

Contributions are welcome. Please ensure:

1. All tests pass (`npm test`)
2. Code follows existing patterns
3. Add tests for new features

## License

This project is open source.

## Acknowledgments

- Three.js and React Three Fiber for 3D rendering
- Electron for desktop application framework
- CCL, Nanoten, and Zenodo for molecular data

---

*Last updated: 2026-03-12*
