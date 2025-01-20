export function nameForKey(code: number) {
  if (!code) {
    return "";
  }
  return (
    {
      9: "Tab",
      13: "Enter",
      32: "Space Bar",
      37: "Left Arrow",
      38: "Up Arrow",
      39: "Right Arrow",
      40: "Down Arrow",
      187: "+",
      189: "-",
      192: "`",
      188: "<",
      190: ">",
      191: "?",
      186: ",",
      222: '"',
      220: "\\",
      221: "]",
      219: "[",
    }[code] || String.fromCharCode(code)
  );
}
