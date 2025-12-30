
const code = `
      {% if section.settings.tag_text != blank %}
        <span class="ambient-tag">hello</span>
      {% endif %}

      {% if section.settings.heading != blank %}
        <h1>heading</h1>
      {% endif %}
`;

const evaluateCondition = (condition) => {
    return true; // Simplify for regex test
};

// My Regex from the previous tool call
const ifRegex = /{%-?\s*if\s+([^{}]+?)\s*-?%}((?:(?!{%\s*if)[\s\S])*?){%-?\s*endif\s*-?%}/;

const processTagsRecursively = (html, regex, processor) => {
    let processed = html;
    let maxLoops = 50;
    while (regex.test(processed) && maxLoops > 0) {
        console.log("Match found!");
        processed = processed.replace(regex, processor);
        maxLoops--;
    }
    return processed;
};

const processed = processTagsRecursively(code, ifRegex, (match, condition, body) => {
    console.log("Replacer called with condition:", condition);
    return body;
});

console.log("Result:", processed);
