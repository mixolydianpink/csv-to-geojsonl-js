import * as csv from "./mod.js";

import { asserts } from "../dev_deps.js";

const { assertEquals, assertThrows } = asserts;

const standardParser = new csv.CSVParser({
  delimiter: ",",
  quote: ['"', '"'],
  lineComment: null,
});

const commentParser = new csv.CSVParser({
  delimiter: ",",
  quote: ['"', '"'],
  lineComment: "#",
});

const tsvParser = new csv.CSVParser({
  delimiter: "\t",
  quote: ['"', '"'],
  lineComment: "#",
});

Deno.test({
  name: "parses empty string as empty",
  fn: () => {
    const input = "";
    const output = standardParser.parseLine(input);

    assertEquals(output, []);
  },
});

Deno.test({
  name: "parses unquoted",
  fn: () => {
    const input = "a,b,c";
    const output = standardParser.parseLine(input);

    assertEquals(output, ["a", "b", "c"]);
  },
});

Deno.test({
  name: "includes whitespace",
  fn: () => {
    const input = "a , b ";
    const output = standardParser.parseLine(input);

    assertEquals(output, ["a ", " b "]);
  },
});

Deno.test({
  name: "parses quoted",
  fn: () => {
    const input = '"a,b",c';
    const output = standardParser.parseLine(input);

    assertEquals(output, ["a,b", "c"]);
  },
});

Deno.test({
  name: "parses single empty field",
  fn: () => {
    const input = '""';
    const output = standardParser.parseLine(input);

    assertEquals(output, [""]);
  },
});

Deno.test({
  name: "parses combined unquoted and quoted",
  fn: () => {
    const input = '"a, " b,c"d"';
    const output = standardParser.parseLine(input);

    assertEquals(output, ["a,  b", "cd"]);
  },
});

Deno.test({
  name: "parses escaped close quote",
  fn: () => {
    const input = 'a""""b,c';
    const output = standardParser.parseLine(input);

    assertEquals(output, ['a"b', "c"]);
  },
});

Deno.test({
  name: "fails to parse unmatched quote",
  fn: () => {
    const input = 'a,"b';

    assertThrows(() => standardParser.parseLine(input));
  },
});

Deno.test({
  name: "handles empty final field",
  fn: () => {
    const input = "a,";
    const output = standardParser.parseLine(input);

    assertEquals(output, ["a", ""]);
  },
});

Deno.test({
  name: "ignores comments",
  fn: () => {
    const input = "#abc,d";
    const output = commentParser.parseLine(input);

    assertEquals(output, []);
  },
});

Deno.test({
  name: "noninitial comment marker is not a comment",
  fn: () => {
    const input = "a#b,c";
    const output = commentParser.parseLine(input);

    assertEquals(output, ["a#b", "c"]);
  },
});

Deno.test({
  name: "handles tab-separated empty first field and comment marker",
  fn: () => {
    const input = "\t#a\tb";
    const output = tsvParser.parseLine(input);

    assertEquals(output, ["", "#a", "b"]);
  },
});
