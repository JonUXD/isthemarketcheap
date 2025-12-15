import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export async function getMarkdownContent(filename) {
    const fullPath = path.join(contentDirectory, `${filename}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(fileContents);
    const contentHtml = processedContent.toString();

    return contentHtml;
}

export function getFaqContent() {
    const fullPath = path.join(contentDirectory, 'faq.md');
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Simple parsing for FAQ structure:
    // Split by "## " headers. 
    // Each chunk is a question (header) + answer (body).

    const sections = fileContents.split(/^## /m).slice(1); // Remove empty start

    const faqs = sections.map(section => {
        const [question, ...answerLines] = section.split('\n');
        const answer = answerLines.join('\n').trim();
        return {
            question: question.trim(),
            answer: answer
        };
    });

    return faqs;
}
