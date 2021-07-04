# CSV to GeoJSONL

This program takes a CSV containing point location data from standard input and
outputs GeoJSONL (newline-delimited GeoJSON) to standard output.

Newlines are not allowed within a field. The following columns are required
and a header must be provided:
- `LATITUDE`
- `LONGITUDE`

All other fields will be placed in the output feature's properties.

## Use

### Running

Run with
```bash
DENO_DIR=./deno_dir deno run main.js < INPUT.CSV > OUTPUT.GEOJSONL
```

Equivalently, if you have a bundled file at `out/csv-to-geojsonl`
```bash
DENO_DIR=./deno_dir deno run out/csv-to-geojsonl < INPUT.CSV > OUTPUT.GEOJSONL
```

See `example/README.md` for an example.

### Building

**None of this should be necessary. Follow the instructions above if you just
want to run the program.**

Create or update `lock.json` (if necessary) with
```bash
DENO_DIR=./deno_dir deno cache --lock=lock.json --lock-write src/*deps.js
```

Recreate `deno_dir` (if necessary) with
```bash
DENO_DIR=./deno_dir deno cache --reload --lock=lock.json src/*deps.js
```

Run tests with
```bash
DENO_DIR=./deno_dir/ deno test
```

Bundle with
```bash
mkdir -p out
DENO_DIR=./deno_dir deno bundle main.js out/csv-to-geojsonl
```

## Example

### Input

```csv
NAME,COUNTRY,LATITUDE,LONGITUDE
Kufra,LBY,24.183333,23.283333
Chongqing,CHN,29.5637,106.5504
Daraa,SYR,32.616667,36.1
Rio de Janeiro,BRA,-22.911366,-43.205916
```

### Output

```json
{"type":"Feature","properties":{"NAME":"Kufra","COUNTRY":"LBY"},"geometry":{"type":"Point","coordinates":[23.283333,24.183333]}}
{"type":"Feature","properties":{"NAME":"Chongqing","COUNTRY":"CHN"},"geometry":{"type":"Point","coordinates":[106.5504,29.5637]}}
{"type":"Feature","properties":{"NAME":"Daraa","COUNTRY":"SYR"},"geometry":{"type":"Point","coordinates":[36.1,32.616667]}}
{"type":"Feature","properties":{"NAME":"Rio de Janeiro","COUNTRY":"BRA"},"geometry":{"type":"Point","coordinates":[-43.205916,-22.911366]}}
```
