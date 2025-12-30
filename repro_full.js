
const userCode = `<section class="ambient-hero">
  <div class="ambient-wrapper">
    <div class="ambient-content">
      {% if section.settings.tag_text != blank %}
        <span class="ambient-tag">{{ section.settings.tag_text }}</span>
      {% endif %}

      {% if section.settings.heading != blank %}
        <h1>{{ section.settings.heading }}</h1>
      {% endif %}

      {% if section.settings.subheading != blank %}
        <p>{{ section.settings.subheading }}</p>
      {% endif %}

      <div class="ambient-actions">
        {% if section.settings.primary_button_text != blank %}
          <a href="{{ section.settings.primary_button_link }}" class="btn-primary">
            {{ section.settings.primary_button_text }}
          </a>
        {% endif %}

        {% if section.settings.secondary_button_text != blank %}
          <a href="{{ section.settings.secondary_button_link }}" class="btn-secondary">
            {{ section.settings.secondary_button_text }}
          </a>
        {% endif %}
      </div>
    </div>

    <div class="ambient-visual">
      {% if section.settings.hero_image != blank %}
        <img
          src="{{ section.settings.hero_image | image_url: width: 900 }}"
          alt="{{ section.settings.heading | escape }}"
          loading="lazy"
        >
      {% endif %}
    </div>
  </div>
</section>

<style>
/* ... stripped for brevity ... */
</style>

{% schema %}
{
  "name": "Ambient Lifestyle Hero",
  "settings": []
}
{% endschema %}
`;

// --- MOCK ENGINE COPY ---

let extractedHtml = userCode
    .replace(/{% stylesheet %}[\s\S]*?{% endstylesheet %}/g, "")
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/{% javascript %}[\s\S]*?{% endjavascript %}/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "")
    .replace(/{% schema %}[\s\S]*?{% endschema %}/g, "");

// Helper to solve nested tags by processing innermost first
const processTagsRecursively = (html, regex, processor) => {
    let processed = html;
    let maxLoops = 50; // Prevent infinite loops
    while (regex.test(processed) && maxLoops > 0) {
        processed = processed.replace(regex, processor);
        maxLoops--;
    }
    return processed;
};

const processControlFlow = (html) => {
    let processed = html;

    // --- Condition Evaluator ---
    const evaluateCondition = (condition) => {
        const c = condition.trim().replace(/^['"]+|['"]+$/g, ''); // Strip quotes
        console.log("Evaluating Condition:", c);
        if (!c) return false;

        // Handle != blank / == blank
        if (c.includes("!= blank")) return true;
        if (c.includes("== blank")) return false;

        // Handle == 
        if (c.includes("==")) {
            const parts = c.split("==");
            return parts[0].trim().replace(/['"]/g, '') === parts[1].trim().replace(/['"]/g, '');
        }
        // Handle != 
        if (c.includes("!=")) {
            const parts = c.split("!=");
            return parts[0].trim().replace(/['"]/g, '') !== parts[1].trim().replace(/['"]/g, '');
        }

        // Boolean check
        if (c === "true") return true;
        if (c === "false") return false;

        // Default truthy
        return true;
    };

    // If: Match innermost (no internal if/endif)
    // Using [\s\S]*? for condition to allow multi-line conditions and any chars
    const ifRegex = /{%-?\s*if\s+([\s\S]*?)\s*-?%}((?:(?!{%\s*if)[\s\S])*?){%-?\s*endif\s*-?%}/;

    // DEBUG: Test if regex matches ONCE
    const match = ifRegex.exec(processed);
    if (match) {
        console.log("Manual Regex Exec Match Found!");
        console.log("Full Match:", match[0]);
        console.log("Group 1 (Condition):", match[1]);
        console.log("Group 2 (Body):", match[2]);
    } else {
        console.log("Manual Regex Exec: NO MATCH");
    }

    processed = processTagsRecursively(processed, ifRegex, (match, condition, body) => {
        console.log("Recursion Replacement Hit!");
        return evaluateCondition(condition) ? body : "";
    });

    return processed;
};

const final = processControlFlow(extractedHtml);
console.log("---------------------------------------------------");
console.log("FINAL OUTPUT SNIPPET (First 200 chars):");
console.log(final.substring(0, 200));
