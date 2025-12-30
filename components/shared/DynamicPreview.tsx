"use client";

import { useEffect, useRef } from "react";

interface DynamicPreviewProps {
  code: string;
  className?: string;
}

export function DynamicPreview({ code, className }: DynamicPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    // --- MODE DETECTION ---
    const isReact = code.includes("import React") || code.includes("export default function") || code.includes("return (");
    const isCSS = !code.includes("<") && code.includes("{") && code.includes(":") && !code.includes("schema");

    let finalContent = "";

    if (isReact) {
      // --- REACT MODE ---
      let cleanCode = code.replace(/import.*?from.*?;/g, "");
      const componentNameMatch = cleanCode.match(/export\s+default\s+function\s+(\w+)/);
      const componentName = componentNameMatch ? componentNameMatch[1] : "App";
      cleanCode = cleanCode.replace(/export\s+default\s+function/, "function");

      finalContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 0; font-family: sans-serif; }
                ::-webkit-scrollbar { width: 0px; background: transparent; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                const LucideIcons = new Proxy({}, {
                    get: (target, prop) => (props) => {
                        return <span style={{display:'inline-block', border:'1px solid currentColor', width:24, height:24, borderRadius:4, textAlign:'center'}}>i</span>
                    }
                });
                
                ${cleanCode}

                const root = ReactDOM.createRoot(document.getElementById('root'));
                try {
                    root.render(<${componentName} />);
                } catch (e) {
                    document.body.innerHTML = '<div style="color:red; padding:20px;">Runtime Error: ' + e.message + '</div>';
                }
              </script>
            </body>
          </html>
        `;

    } else if (isCSS) {
      // --- CSS MODE ---
      finalContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 20px; font-family: sans-serif; }
                ${code}
              </style>
            </head>
            <body>
              <div class="demo-box">
                <h1>CSS Preview</h1>
                <p>Content to demonstrate styles.</p>
                <button>Button</button>
                <div class="card">Card Element</div>
              </div>
            </body>
          </html>
        `;
    } else {
      // --- LIQUID / HTML MODE ---

      let settings: Record<string, any> = {};
      let blocksSchema: Record<string, any> = {};
      const schemaMatch = code.match(/{% schema %}([\s\S]*?){% endschema %}/);

      if (schemaMatch) {
        try {
          const schemaJson = JSON.parse(schemaMatch[1]);
          if (schemaJson.settings) {
            schemaJson.settings.forEach((setting: any) => {
              if (setting.id && setting.default !== undefined) {
                settings[setting.id] = setting.default;
              }
            });
          }
          if (schemaJson.blocks) {
            schemaJson.blocks.forEach((block: any) => {
              let blockDefaults: Record<string, any> = {};
              if (block.settings) {
                block.settings.forEach((s: any) => {
                  if (s.id && s.default !== undefined) {
                    blockDefaults[s.id] = s.default;
                  }
                });
              }
              blocksSchema[block.type] = blockDefaults;
            });
          }
        } catch (e) {
          console.error("Schema parse error", e);
        }
      }

      let extractedCss = "";
      const styleMatches = code.match(/<style>([\s\S]*?)<\/style>/g);
      if (styleMatches) {
        extractedCss = styleMatches.map(tag => tag.replace(/<\/?style>/g, "")).join("\n");
      }

      const liquidStyleMatches = code.match(/{% stylesheet %}([\s\S]*?){% endstylesheet %}/g);
      if (liquidStyleMatches) {
        extractedCss += "\n" + liquidStyleMatches.map(tag => tag.replace(/{% \/?stylesheet %}/g, "")).join("\n");
      }

      // Support for {% style %}...{% endstyle %} (alternative Shopify tag)
      const altStyleMatches = code.match(/{% style %}([\s\S]*?){% endstyle %}/g);
      if (altStyleMatches) {
        extractedCss += "\n" + altStyleMatches.map(tag => tag.replace(/{% \/?style %}/g, "")).join("\n");
      }

      const jsMatch = code.match(/{% javascript %}([\s\S]*?){% endjavascript %}/) || code.match(/<script>([\s\S]*?)<\/script>/);
      const extractedJs = jsMatch ? jsMatch[1] : "";

      let extractedHtml = code
        .replace(/{% stylesheet %}[\s\S]*?{% endstylesheet %}/g, "")
        .replace(/{% style %}[\s\S]*?{% endstyle %}/g, "") // Remove {% style %} blocks
        .replace(/<style>[\s\S]*?<\/style>/g, "")
        .replace(/{% javascript %}[\s\S]*?{% endjavascript %}/g, "")
        .replace(/<script>[\s\S]*?<\/script>/g, "")
        .replace(/{% schema %}[\s\S]*?{% endschema %}/g, "");

      // --- Advanced Mocking Engine ---

      try {
        // Helper to solve nested tags by processing innermost first
        const processTagsRecursively = (html: string, regex: RegExp, processor: (match: any, ...args: any[]) => string) => {
          let processed = html;
          let maxLoops = 50; // Prevent infinite loops
          while (regex.test(processed) && maxLoops > 0) {
            processed = processed.replace(regex, processor);
            maxLoops--;
          }
          return processed;
        };

        const processControlFlow = (html: string) => {
          let processed = html;

          // --- Condition Evaluator ---
          const evaluateCondition = (condition: string) => {
            const c = condition.trim().replace(/^['"]+|['"]+$/g, ''); // Strip quotes
            if (!c) return false;

            // Handle != blank / == blank
            if (c.includes("!= blank")) return true; // simplified: almost everything is not blank in mock
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

          // Case/When - handling simple non-nested case for now as complex nested case is rare in section schema
          const caseRegex = /{%-?\s*case\s+([^{}]+?)\s*-?%}([\s\S]*?){%-?\s*endcase\s*-?%}/g;
          processed = processed.replace(caseRegex, (match, variable, body) => {
            const cleanVar = variable.trim().replace(/['"]/g, "");
            const whenRegex = /{%-?\s*when\s+['"]?([^'"]+?)['"]?\s*-?%}([\s\S]*?)(?=(?:{%-?\s*when|{%-?\s*endcase))/g;
            let result = "";
            let matchWhen;
            // We need to capture all whens
            while ((matchWhen = whenRegex.exec(body)) !== null) {
              if (matchWhen[1] === cleanVar) {
                result = matchWhen[2];
                break; // Render first match
              }
            }
            return result;
          });

          // If: Match innermost (no internal if/endif)
          // Using [\s\S]*? for condition to allow multi-line conditions and any chars
          const ifRegex = /{%-?\s*if\s+([\s\S]*?)\s*-?%}((?:(?!{%\s*if)[\s\S])*?){%-?\s*endif\s*-?%}/;
          processed = processTagsRecursively(processed, ifRegex, (match, condition, body) => {
            // console.log("Matched IF:", condition);
            return evaluateCondition(condition) ? body : "";
          });

          // Unless: Match innermost
          const unlessRegex = /{%-?\s*unless\s+([\s\S]*?)\s*-?%}((?:(?!{%\s*unless)[\s\S])*?){%-?\s*endunless\s*-?%}/;
          processed = processTagsRecursively(processed, unlessRegex, (match, condition, body) => {
            return !evaluateCondition(condition) ? body : "";
          });

          return processed;
        };

        const loopRegex = /{%-?\s*for\s+(\w+)\s+in\s+section\.blocks.*?[-]?%}([\s\S]*?){%-?\s*endfor\s*[-]?%}/g;

        extractedHtml = extractedHtml.replace(loopRegex, (match, loopVar, loopBody) => {
          const blockTypes = Object.keys(blocksSchema);
          if (blockTypes.length === 0) return ""; // No blocks? render nothing

          let generatedContent = "";

          // SIMULATE DATA: Repeat blocks to fill a grid (e.g. 4 items)
          let simulatedBlocks = [];
          for (let i = 0; i < 4; i++) {
            simulatedBlocks.push(...blockTypes);
          }

          simulatedBlocks.forEach((blockType, index) => {
            let itemHtml = loopBody;
            const defaults = blocksSchema[blockType] || {};

            // Replace block props
            itemHtml = itemHtml.replace(new RegExp(`${loopVar}\\.type`, 'g'), `'${blockType}'`);
            itemHtml = itemHtml.replace(new RegExp(`${loopVar}\\.id`, 'g'), `'block-${blockType}-${index}'`);

            // Replace settings
            Object.keys(defaults).forEach(key => {
              const val = defaults[key];
              itemHtml = itemHtml.replace(new RegExp(`{{\\s*${loopVar}\\.settings\\.${key}\\s*}}`, 'g'), val);
            });

            // Cleanup missing block settings
            itemHtml = itemHtml.replace(new RegExp(`{{\\s*${loopVar}\\.settings\\.\\w+\\s*}}`, 'g'), "");

            // Process IF/Unless inside Loop
            itemHtml = processControlFlow(itemHtml);
            generatedContent += itemHtml;
          });
          return generatedContent;
        });

        // Process global control flow
        extractedHtml = processControlFlow(extractedHtml);

      } catch (e) {
        console.error("Liquid Mock Engine Error:", e);
      }

      // Cleanup
      Object.keys(settings).forEach(key => {
        const val = settings[key];
        const regex = new RegExp(`{{\\s*section\\.settings\\.${key}\\s*}}`, 'g');
        extractedHtml = extractedHtml.replace(regex, val);
        extractedCss = extractedCss.replace(regex, val); // FIX: Replace in CSS too
      });

      extractedHtml = extractedHtml
        .replace(/{{\s*['"].*?['"]\s*\|\s*asset_url\s*}}/g, "https://placehold.co/600x400/EEE/31343C?text=Asset")
        .replace(/{{\s*.*?\|\s*image_url.*?\s*}}/g, "https://placehold.co/600x400/EEE/31343C?text=Image")
        .replace(/{{\s*section\.id\s*}}/g, "custom-preview-123")
        .replace(/{%\s*render\s*['"](.*?)['"].*?%}/g, "<!-- Rendered Snippet -->")
        .replace(/{%\s*form\s*.*?%}/g, '<form onsubmit="event.preventDefault();">')
        .replace(/{%\s*endform\s*%}/g, '</form>')
        // Clean remaining tags
        .replace(/{%\s*.*?\s*%}/g, "")
        .replace(/{{.*?}}/g, "");

      finalContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 0; font-family: sans-serif; }
                ::-webkit-scrollbar { width: 0px; background: transparent; }
                ${extractedCss}
              </style>
            </head>
            <body>
              ${extractedHtml}
              <script>
                try {
                    ${extractedJs}
                } catch(e) { console.log('Preview JS Error', e) }
                document.addEventListener('click', (e) => { if(e.target.tagName === 'A') e.preventDefault(); });
              </script>
            </body>
          </html>
        `;
    }

    doc.open();
    doc.write(finalContent);
    doc.close();
  }, [code]);

  return (
    <div className={`w-full h-full bg-white relative ${className}`}>
      <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded z-10 font-mono opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
        v2 {code.includes("import React") || code.includes("return (") ? "React Mode" : (!code.includes("<") && code.includes("{") && code.includes(":")) ? "CSS Mode" : "Liquid Mode"}
      </div>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Preview"
        sandbox="allow-scripts allow-modals allow-same-origin"
      />
    </div>
  );
}
