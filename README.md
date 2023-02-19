# Import-tools

## Scripts available

### Import all

Models imported in following order:

- `rein-emblems`
- `rein-costumes`
- `weapon-stories`

Usage:

```sh
npm run import:all
```

### NieR Re[in]carnation

#### Costume emblems

Import costume emblems (abyssal, celebratory...) from https://nierrein.guide/ database to Accord's Library database


Model: `rein-emblems`

Usage:

```sh
npm run import:emblems
```

#### Costumes

Import costumes from https://nierrein.guide/ database to Accord's Library database


Model: `rein-costumes`

Usage:

> ⚠️ Importing the emblems before the costumes is mandatory.

```sh
npm run import:costumes
```

#### Weapon stories

Import weapon stories from https://nierrein.guide/ database to Accord's Library database


Model: `weapon-stories`

Usage:

```sh
npm run import:weapon-stories
```

Related checks:

```sh
npm run check:weapon-stories-duplicates
```