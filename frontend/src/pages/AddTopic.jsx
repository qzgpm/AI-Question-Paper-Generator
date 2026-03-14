import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
    ChevronRight,
    Save,
    GraduationCap
} from 'lucide-react'

export default function AddTopic() {
    const { moduleId } = useParams()
    const navigate = useNavigate()
    const [module, setModule] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        suggested_bloom_level: 'L1',
        weightage: 1.0,
        keywords: ''
    })
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const response = await axios.get(`/curriculum/api/modules/${moduleId}/`)
                setModule(response.data.module)
            } catch (error) {
                console.error("Error fetching module:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchModule()
    }, [moduleId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post(`/curriculum/module/${moduleId}/add-topic/`, formData)
            navigate(`/curriculum/${module.course_id}`)
        } catch (error) {
            console.error("Error adding topic:", error)
            alert("Failed to add topic.")
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) return null

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">Module {module?.number}</button>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Add Topic</span>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-2xl mx-auto space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">New Topic</h2>
                        <p className="text-muted-foreground font-medium">Add a specific topic to {module?.title}.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topic Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Asymptotic Notations"
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bloom's Level</label>
                                    <select
                                        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                                        value={formData.suggested_bloom_level}
                                        onChange={(e) => setFormData({ ...formData, suggested_bloom_level: e.target.value })}
                                    >
                                        <option value="L1">L1: Remember</option>
                                        <option value="L2">L2: Understand</option>
                                        <option value="L3">L3: Apply</option>
                                        <option value="L4">L4: Analyze</option>
                                        <option value="L5">L5: Evaluate</option>
                                        <option value="L6">L6: Create</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weightage (Multiplier)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                        value={formData.weightage}
                                        onChange={(e) => setFormData({ ...formData, weightage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Keywords (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Big O, Theta, Omega, amortized analysis"
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-zinc-100">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="bg-black text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
                            >
                                {loading ? 'Adding...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Topic
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
