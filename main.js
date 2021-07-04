import { csv, locationToFeature } from "./mod.js";

import { io } from "./src/main_deps.js";

const main = async () => {
  const lines = io.readLines(Deno.stdin);

  const rawParser = new csv.CSVParser({
    delimiter: ",",
    quote: ['"', '"'],
    lineComment: null,
  });

  // Use the first non-empty/comment line as a header
  let columnNames = [];
  for (let line = await lines.next();; line = await lines.next()) {
    if (line.done == true) {
      // Empty input
      Deno.exit(0);
    } else {
      try {
        columnNames = rawParser.parseLine(line.value);
      } catch (e) {
        if (e instanceof csv.MalformedCellError) {
          console.error(`Invalid header. Error parsing line: ${line.value}`);
          Deno.exit(1);
        } else {
          throw e;
        }
      }
      if (columnNames.length !== 0) {
        break;
      }
    }
  }

  if (!columnNames.includes("LATITUDE") || !columnNames.includes("LONGITUDE")) {
    console.error(
      "Invalid header. Must include LATITUDE and LONGITUDE columns.",
    );
    Deno.exit(1);
  }

  const parser = new csv.CSVMapParser(rawParser, { columnNames });

  for await (const line of lines) {
    try {
      const record = parser.parseLine(line);

      const parseFloat = (field) => {
        const value = record[field].trim();
        const result = Number.parseFloat(value);
        if (isNaN(result)) {
          console.error(
            `Error parsing ${field} = ${value} as number in line: ${line}`,
          );
          return false;
        } else {
          return result;
        }
      };

      const latitude = parseFloat("LATITUDE");
      const longitude = parseFloat("LONGITUDE");

      if (!longitude || !latitude) {
        continue;
      }

      const properties =
        (({ LATITUDE: _LATITUDE, LONGITUDE: _LONGITUDE, ...others }) => others)(
          record,
        );

      console.log(JSON.stringify(locationToFeature({
        properties,
        longitude,
        latitude,
      })));
    } catch (e) {
      if (e instanceof csv.EmptyRow) {
        continue;
      } else if (e instanceof csv.ParseError) {
        console.error(`Error parsing line: ${line}`);
        console.error(e.message);
      } else {
        throw e;
      }
    }
  }
};

if (import.meta.main) {
  await main();
}
