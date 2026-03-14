import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
        primaryColor: '#ffffff',
        primaryTextColor: '#000000',
        primaryBorderColor: '#000000',
        lineColor: '#000000',
        secondaryColor: '#fafafa',
        tertiaryColor: '#ffffff',
    },
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
    securityLevel: 'loose',
});

export default function MermaidDiagram({ code }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!code || typeof code !== 'string') return;

        // Sanitize code: remove markdown backticks and 'mermaid' prefix if present
        let sanitizedCode = code.trim();
        if (sanitizedCode.startsWith('```')) {
            sanitizedCode = sanitizedCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
        } else if (sanitizedCode.startsWith('mermaid')) {
            sanitizedCode = sanitizedCode.replace(/^mermaid\n/i, '');
        }

        // Hotfix for common AI syntax errors
        sanitizedCode = sanitizedCode
            .replace(/graph LR;/gi, 'graph LR') // Remove invalid semicolon after graph LR
            .replace(/\|([^\|]+)\|>/g, '|$1| ') // Fix |label|> to |label| 
            .replace(/\|([^\|]+)\|>>/g, '|$1| '); // Fix |label|>> to |label|

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        try {
            mermaid.render(id, sanitizedCode).then(({ svg }) => {
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            }).catch((error) => {
                console.error('Mermaid async rendering failed:', error);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<pre class="text-[10px] text-red-500 font-mono p-4 border border-red-100 rounded">Diagram render error: ${error.message}</pre>`;
                }
            });
        } catch (error) {
            console.error('Mermaid rendering failed:', error);
            containerRef.current.innerHTML = `<pre class="text-[10px] text-red-500 font-mono p-4 border border-red-100 rounded">Diagram render error: ${error.message}</pre>`;
        }
    }, [code]);

    if (!code) return null;

    return (
        <div
            ref={containerRef}
            className="mermaid-container flex justify-center my-6 p-4 bg-white border border-zinc-100 rounded-xl overflow-auto print:border-0 print:my-4"
        />
    );
}
