import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import MermaidDiagram from '../components/MermaidDiagram'
import {
    ChevronRight,
    Printer,
    Download,
    Share2,
    AlertCircle,
    Tally4,
    GraduationCap,
    Plus
} from 'lucide-react'

export default function PaperPreview() {
    const { paperId } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [checkingPlagiarism, setCheckingPlagiarism] = useState(false)
    const [originalityReport, setOriginalityReport] = useState(null)

    useEffect(() => {
        const fetchPaper = async () => {
            try {
                const response = await axios.get(`/engine/api/papers/${paperId}/`)
                setData(response.data)
            } catch (error) {
                console.error("Error fetching paper:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPaper()
    }, [paperId])

    const handleCheckOriginality = async () => {
        setCheckingPlagiarism(true)
        try {
            const response = await axios.post(`/engine/api/papers/${paperId}/check-plagiarism/`)
            setOriginalityReport(response.data)
        } catch (error) {
            console.error("Plagiarism check failed:", error)
            alert("Originality check failed. Please try again.")
        } finally {
            setCheckingPlagiarism(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-sm font-bold tracking-widest uppercase">Rendering Paper...</p>
                </div>
            </div>
        )
    }

    if (!data) return null
    const { paper, part_a, part_b } = data

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10 print:hidden">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/" className="text-muted-foreground hover:text-foreground">Admin</Link>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[200px]">{paper.title}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        disabled={checkingPlagiarism}
                        onClick={handleCheckOriginality}
                        className="p-2 border border-border rounded-lg bg-white hover:bg-zinc-50 flex items-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
                    >
                        <AlertCircle className={`w-4 h-4 ${originalityReport ? 'text-green-600' : 'text-zinc-400'}`} />
                        {checkingPlagiarism ? 'Checking...' : 'Check Originality'}
                    </button>
                    <button onClick={() => window.print()} className="p-2 border border-border rounded-lg bg-white hover:bg-zinc-50 flex items-center gap-2 text-xs font-bold transition-all">
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10 bg-[#f0f0f0] print:bg-white print:p-0">
                {originalityReport && (
                    <div className="max-w-[210mm] mx-auto mb-8 bg-black text-white p-8 rounded-2xl shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 print:hidden">
                        <div className="flex items-center justify-between border-b border-white/20 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
                                    <span className="text-xl font-black">{originalityReport.overall_originality_score}%</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight">Originality Report</h3>
                                    <p className="text-xs text-zinc-400 font-medium">{originalityReport.summary}</p>
                                </div>
                            </div>
                            <button onClick={() => setOriginalityReport(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <Plus className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Key Recommendations</p>
                                <ul className="space-y-2">
                                    {originalityReport.recommendations.map((rec, i) => (
                                        <li key={i} className="text-xs flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Risk Assessment</p>
                                <div className="space-y-4 overflow-auto max-h-[150px] pr-2 custom-scrollbar">
                                    {originalityReport.questions?.map((q, i) => (
                                        <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                                            <span className="text-[10px] font-medium text-zinc-300">Q{q.question_number}</span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${q.risk_level === 'Low' ? 'bg-green-900/40 text-green-400' :
                                                    q.risk_level === 'Medium' ? 'bg-orange-900/40 text-orange-400' :
                                                        'bg-red-900/40 text-red-400'
                                                    }`}>
                                                    {q.risk_level} Risk
                                                </span>
                                                <span className="text-[10px] font-bold">{q.originality_score}%</span>
                                                {originalityReport.internal_check?.find(ic => ic.question_number === q.question_number || (i + 1) === q.question_number)?.is_duplicate && (
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-900/40 text-red-400">
                                                        Internal Duplicate
                                                    </span>
                                                )}
                                                {!originalityReport.internal_check?.find(ic => ic.question_number === q.question_number || (i + 1) === q.question_number)?.is_duplicate && (
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-900/40 text-blue-400">
                                                        Internally Unique
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-[20mm] min-h-[297mm] print:shadow-none print:max-w-none relative">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-20">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tighter">KTU-QGEN</h1>
                        </div>
                        <div className="border-y-2 border-black py-6 space-y-1">
                            <h2 className="text-xl font-black uppercase tracking-widest">{paper.title}</h2>
                            <p className="font-black text-lg">{paper.course}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest pt-2 px-2 border-t border-black/5 mt-4">
                            <span>Time: 1.5 - 2 Hours</span>
                            <span>Max Marks: {paper.max_marks || 50}</span>
                        </div>
                    </div>

                    {/* Part A */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest">Part A — Knowledge & Recall</h3>
                            <span className="text-[10px] font-black italic">5 x 3 = 15 Marks</span>
                        </div>
                        <div className="space-y-8">
                            {part_a.length === 0 && (
                                <p className="text-sm text-zinc-400 italic">No questions selected for Part A.</p>
                            )}
                            {part_a.map((q, i) => (
                                <div key={q.id} className="flex gap-4 group">
                                    <span className="font-black min-w-[24px]">Q{i + 1}.</span>
                                    <div className="flex-1">
                                        <p className="text-sm leading-relaxed">{q.text}</p>
                                        <MermaidDiagram code={q.diagram_code} />
                                        <div className="mt-2 flex items-center gap-3 print:hidden">
                                            <span className="text-[8px] font-black uppercase tracking-tighter bg-zinc-100 px-1.5 py-0.5 rounded text-muted-foreground">{q.blooms}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black italic pt-1">[3]</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Part B */}
                    <div>
                        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-8 mt-16">
                            <h3 className="text-sm font-black uppercase tracking-widest">Part B — Application & Analysis</h3>
                            <span className="text-[10px] font-black italic">5 x 7 = 35 Marks</span>
                        </div>
                        <div className="space-y-12">
                            {part_b.length === 0 && (
                                <p className="text-sm text-zinc-400 italic">No questions selected for Part B.</p>
                            )}
                            {part_b.map((group, i) => (
                                <div key={i} className="space-y-8">
                                    <div className="flex items-center justify-center relative">
                                        <div className="absolute left-0 w-full h-px bg-zinc-100"></div>
                                        <span className="relative z-10 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Section {i + 1}</span>
                                    </div>

                                    {/* Question A */}
                                    <div className="flex gap-4">
                                        <span className="font-black min-w-[24px]">{part_a.length + i + 1} (a)</span>
                                        <div className="flex-1">
                                            <p className="text-sm leading-relaxed">{group.question_a.text}</p>
                                            <MermaidDiagram code={group.question_a.diagram_code} />
                                            <div className="mt-1 print:hidden">
                                                <span className="text-[8px] font-black uppercase tracking-tighter bg-zinc-100 px-1.5 py-0.5 rounded text-muted-foreground">{group.question_a.blooms}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black italic pt-1">[7]</span>
                                    </div>

                                    <div className="text-center font-black text-xs uppercase tracking-[0.2em] italic my-4 text-zinc-400">OR</div>

                                    {/* Question B */}
                                    <div className="flex gap-4">
                                        <span className="font-black min-w-[24px]">{part_a.length + i + 1} (b)</span>
                                        <div className="flex-1">
                                            <p className="text-sm leading-relaxed">{group.question_b.text}</p>
                                            <MermaidDiagram code={group.question_b.diagram_code} />
                                            <div className="mt-1 print:hidden">
                                                <span className="text-[8px] font-black uppercase tracking-tighter bg-zinc-100 px-1.5 py-0.5 rounded text-muted-foreground">{group.question_b.blooms}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black italic pt-1">[7]</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-24 pt-10 border-t border-zinc-100 flex justify-between items-center opacity-50">
                        <div className="text-[8px] font-black tracking-widest uppercase">
                            Generated via KTU-QGen AI Engine
                        </div>
                        <div className="text-[8px] font-black tracking-widest uppercase">
                            Date: {paper.date}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
