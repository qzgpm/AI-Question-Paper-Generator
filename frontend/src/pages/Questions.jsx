import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    Search,
    Filter,
    Trash2,
    ChevronRight,
    FileText,
    BookOpen,
    AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Questions() {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('/library/api/questions/')
                setQuestions(response.data.questions)
            } catch (error) {
                console.error("Error fetching questions:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchQuestions()
    }, [])

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this question?')) {
            try {
                await axios.post(`/library/api/questions/${id}/delete/`)
                setQuestions(questions.filter(q => q.id !== id))
            } catch (error) {
                console.error("Delete failed:", error)
                alert("Failed to delete question.")
            }
        }
    }

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.course.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/" className="text-muted-foreground hover:text-foreground">Admin</Link>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Question Bank</span>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Question Bank</h2>
                            <p className="text-muted-foreground">Browse and manage all generated questions.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search questions..."
                                    className="pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="p-2 border border-border rounded-lg bg-white hover:bg-zinc-50">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#fcfcfc] border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Question</th>
                                    <th className="px-6 py-4">Context</th>
                                    <th className="px-6 py-4">Bloom/Diff</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredQuestions.length > 0 ? (
                                    filteredQuestions.map((q) => (
                                        <tr key={q.id} className="hover:bg-secondary/20 transition-colors">
                                            <td className="px-6 py-4 max-w-md">
                                                <div className="flex items-start gap-2">
                                                    <p className="font-medium line-clamp-2">{q.text}</p>
                                                    {q.diagram_code && (
                                                        <span className="flex-shrink-0 mt-0.5 p-1 bg-blue-50 text-blue-600 rounded" title="Includes Diagram">
                                                            <BookOpen className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[10px] uppercase text-black">{q.course}</span>
                                                    <span className="text-xs text-muted-foreground">{q.module}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <span className="px-1.5 py-0.5 bg-zinc-100 rounded text-[10px] font-black uppercase">{q.blooms_level}</span>
                                                    <span className="px-1.5 py-0.5 bg-zinc-100 rounded text-[10px] font-black uppercase">{q.difficulty}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 text-zinc-200" />
                                                <p className="font-bold">No questions found</p>
                                                <p className="text-muted-foreground text-xs text-center max-w-xs">
                                                    Try adjusting your search or generate new papers to populate the bank.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
