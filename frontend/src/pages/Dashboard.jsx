import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    BookOpen,
    FileText,
    Plus,
    ChevronRight,
    GraduationCap,
    ClipboardList
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState({
        stats: { courses: 0, modules: 0, papers: 0, questions: 0 },
        recent_papers: [],
        blooms_distribution: [],
        bloom_coverage_pct: 0
    })
    const [loading, setLoading] = useState(true)
    const [auditResult, setAuditResult] = useState(null)
    const [auditing, setAuditing] = useState(false)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get('/api/dashboard/')
                setData(response.data)
            } catch (error) {
                console.error("Error fetching dashboard:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

    const handleAudit = async () => {
        setAuditing(true)
        setAuditResult(null)
        try {
            const response = await axios.post('/curriculum/api/audit/')
            setAuditResult({ type: 'success', message: response.data.message })
        } catch {
            setAuditResult({ type: 'error', message: 'Audit failed. Please try again.' })
        } finally {
            setAuditing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold tracking-widest uppercase">Initializing...</p>
                </div>
            </div>
        )
    }

    const { stats, recent_papers, blooms_distribution, bloom_coverage_pct } = data
    const firstName = user?.name?.split(' ')[0] || 'there'

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Admin</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Dashboard</span>
                </div>
                <Link to="/generate" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Generate Paper
                </Link>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-6xl mx-auto space-y-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{firstName}</h2>
                        <p className="text-muted-foreground mt-1">Data</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Courses" value={stats.courses} icon={BookOpen} to="/curriculum" />
                        <StatCard label="Modules" value={stats.modules} icon={ClipboardList} />
                        <StatCard label="Total Papers" value={stats.papers} icon={FileText} to="/generate" />
                        <StatCard label="Questions" value={stats.questions} icon={GraduationCap} to="/questions" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight">Recent Exam Papers</h3>
                                <Link to="/generate" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    View All →
                                </Link>
                            </div>
                            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#fcfcfc] border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Title</th>
                                            <th className="px-6 py-4">Course</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recent_papers.length > 0 ? (
                                            recent_papers.map((paper) => (
                                                <tr
                                                    key={paper.id}
                                                    onClick={() => navigate(`/papers/${paper.id}`)}
                                                    className="group hover:bg-secondary/30 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 font-semibold group-hover:text-black">{paper.title}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{paper.course}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{paper.date}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${paper.status === 'Completed'
                                                            ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                                                            : paper.status === 'Failed'
                                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            }`}>
                                                            {paper.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center">
                                                    <p className="text-muted-foreground text-sm">No papers yet.</p>
                                                    <Link to="/generate" className="text-xs font-bold mt-2 inline-block hover:underline">
                                                        Generate your first paper →
                                                    </Link>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold tracking-tight">Curriculum Health</h3>
                            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                        <span>Bloom Mapping</span>
                                        <span className="text-muted-foreground">{bloom_coverage_pct}% Coverage</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-black rounded-full transition-all duration-500"
                                            style={{ width: `${bloom_coverage_pct}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {blooms_distribution.slice(0, 4).length > 0 ? (
                                        blooms_distribution.slice(0, 4).map((bloom, i) => (
                                            <div key={i} className="p-3 bg-[#fcfcfc] border border-border rounded-lg text-center">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 truncate">{bloom.name}</p>
                                                <p className="text-xl font-bold">{bloom.pct}%</p>
                                                <p className="text-[10px] text-muted-foreground">{bloom.count} qs</p>
                                            </div>
                                        ))
                                    ) : (
                                        [1, 2, 3, 4].map((i) => (
                                            <div key={i} className="p-3 bg-[#fcfcfc] border border-border rounded-lg text-center opacity-40">
                                                <div className="w-8 h-2 bg-zinc-200 mx-auto rounded mb-2"></div>
                                                <div className="w-12 h-4 bg-zinc-100 mx-auto rounded"></div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {auditResult && (
                                    <div className={`text-xs px-3 py-2 rounded-lg border ${auditResult.type === 'success'
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-red-50 border-red-200 text-red-700'
                                        }`}>
                                        {auditResult.message}
                                    </div>
                                )}

                                <button
                                    onClick={handleAudit}
                                    disabled={auditing}
                                    className="w-full bg-secondary py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {auditing ? 'Auditing...' : 'Run Audit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, to }) {
    const content = (
        <div className="p-6 bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-default">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-secondary rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-black mt-1 tracking-tighter">{value}</p>
            </div>
        </div>
    )
    return to ? <Link to={to} className="block">{content}</Link> : content
}
