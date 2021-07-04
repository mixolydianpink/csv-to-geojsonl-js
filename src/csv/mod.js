export class ParseError extends Error {}

export class MalformedCellError extends ParseError {}

export class CSVParser {
  #delimiter; // String separating fields, e.g. `","`
  #quote; // Pair of open and close quote strings, e.g. `["\"", "\""]`

  // String (or null) marking a line comment, e.g. `"#"`, `null`
  // A line is only recognized as a comment if it *begins* with this string
  // A value of `null` disables comments.
  #lineComment;

  constructor({ delimiter, quote, lineComment }) {
    this.#delimiter = delimiter;
    this.#quote = quote;
    this.#lineComment = lineComment;
  }

  // Parse a line into an array of strings
  parseLine(line) {
    const parseCell = (str) => {
      const parseUnquoted = (str) => {
        const delimiterIndex = str.search(this.#delimiter);

        // Are we finished parsing the cell?
        if (delimiterIndex === 0) {
          return {
            value: "",
            rest: str.slice(this.#delimiter.length),
          };
        }

        // Is there an open quote before the end of the cell?
        const openQuoteIndex = str.search(this.#quote[0]);
        if (
          openQuoteIndex !== -1 &&
          (openQuoteIndex < delimiterIndex || delimiterIndex === -1)
        ) {
          const initial = str.slice(0, openQuoteIndex);
          // Parse the quoted part
          const rest = parseQuoted(
            str.slice(openQuoteIndex + this.#quote[0].length),
          );
          return {
            // And prepend anything that came before the quote
            value: initial.concat(rest.value),
            rest: rest.rest,
          };
        }

        // There's no quote. Is this the last column?
        if (delimiterIndex === -1) {
          return { value: str, rest: "" };
        } else {
          // Return the string up to the delimiter
          return {
            value: str.slice(0, delimiterIndex),
            rest: str.slice(delimiterIndex + this.#delimiter.length),
          };
        }
      };
      const parseQuoted = (str) => {
        // Make sure there's a close quote somewhere
        const closeQuoteIndex = str.search(this.#quote[1]);
        if (closeQuoteIndex === -1) {
          throw new MalformedCellError("Unmatched quote");
        }

        // Is the close quote part of an escape sequence (doubled)?
        if (
          str.slice(closeQuoteIndex + this.#quote[1].length).startsWith(
            this.#quote[1],
          )
        ) {
          const initial = str.slice(0, closeQuoteIndex).concat(this.#quote[1]);
          // We're still looking for a close quote
          const rest = parseQuoted(
            str.slice(closeQuoteIndex + 2 * this.#quote[1].length),
          );
          return {
            // Prepend anything before the escaped quote, and the quote itself
            value: initial.concat(rest.value),
            rest: rest.rest,
          };
        } else {
          // Not an escaped close quote
          const initial = str.slice(0, closeQuoteIndex);
          // Get everything after the quoted part
          const rest = parseUnquoted(
            str.slice(closeQuoteIndex + this.#quote[1].length),
          );
          return {
            // And prepend the quoted part
            value: initial.concat(rest.value),
            rest: rest.rest,
          };
        }
      };

      // Start parsing
      return parseUnquoted(str);
    };

    const isEmpty = (line) => {
      const trimmed = line.trim();
      return (trimmed === "" || line.startsWith(this.#lineComment));
    };
    // Empty lines are `[]` and not `[""]`
    // Any line meant to be `[""]` should be an empty quote, e.g. `'""'`
    if (isEmpty(line)) {
      return [];
    }

    // Collect all the fields and return them
    // Add a delimiter to the line to mark the end of the last field
    for (let fields = [], str = line.concat(this.#delimiter);;) {
      const { value, rest } = parseCell(str);
      fields.push(value);
      if (rest === "") {
        return fields;
      } else {
        str = rest;
      }
    }
  }
}

export class EmptyRow {}

export class IncorrectRowSizeError extends ParseError {
  constructor(numColumns, numFields) {
    super(
      `Incorrect number of fields: ${numFields} does not match number of columns (${numColumns})`,
    );
    this.name = "IncorrectRowSizeError";
  }
}

export class CSVMapParser {
  #rawParser;
  #columnNames;

  constructor(parser, { columnNames }) {
    this.#rawParser = parser;
    this.#columnNames = columnNames;
  }

  parseLine(line) {
    const raw = this.#rawParser.parseLine(line);
    if (raw.length === 0) {
      throw new EmptyRow();
    }
    if (raw.length !== this.#columnNames.length) {
      throw new IncorrectRowSizeError(this.#columnNames.length, raw.length);
    }
    const result = Object.create(null);
    for (const [index, columnName] of this.#columnNames.entries()) {
      result[columnName] = raw[index];
    }
    return result;
  }
}
