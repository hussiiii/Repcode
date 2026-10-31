import { cssColor } from './colors';

// Normalize imported code markup and text colors. This is formatting, not HTML sanitization.
export const formatProblemContent = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;

  const preTags = Array.from(div.getElementsByTagName('pre'));

  for (const pre of preTags) {
    const nestedCodeTags = Array.from(pre.getElementsByTagName('code'));

    for (const code of nestedCodeTags) {
      const textNode = document.createTextNode(code.textContent || '');
      code.parentNode?.replaceChild(textNode, code);
    }
    pre.style.color = cssColor('foreground'); // Force white text for pre blocks
  }

  return div.innerHTML.replace(/color:\s*[^;]+;/gi, 'color: rgb(var(--foreground)/1);');
};
