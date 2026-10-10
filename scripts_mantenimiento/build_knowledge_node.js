const fs = require('fs');
const path = require('path');

const excludeFiles = ['chatbot.js', 'site_knowledge.js', 'main.js', 'style.css', 'chatbot.css', '404.html'];
const directoryPath = './';

function stripHtml(html) {
    // Remove scripts and styles
    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    text = text.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");
    // Replace breaks with newlines
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n");
    text = text.replace(/<\/div>/gi, "\n");
    text = text.replace(/<\/tr>/gi, "\n");
    // Strip all tags
    text = text.replace(/<[^>]+>/g, ' ');
    // Decode entities (basic)
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // Clean whitespace
    return text.replace(/\s+/g, ' ').trim();
}

let combinedKnowledge = "";

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    files.forEach(function (file) {
        if (path.extname(file) === '.html' && !excludeFiles.includes(file)) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const cleanText = stripHtml(content);
                if (cleanText.length > 50) {
                    combinedKnowledge += `\n--- SOURCE: ${file} ---\n${cleanText}\n`;
                }
                console.log(`Processed ${file}`);
            } catch (e) {
                console.error(`Error reading ${file}`, e);
            }
        }
    });

    const finalScript = `const SITE_KNOWLEDGE = \`${combinedKnowledge.replace(/`/g, "\\`")}\`;`;

    fs.writeFileSync('site_knowledge.js', finalScript);
    console.log('Knowledge base generated: site_knowledge.js');
});
