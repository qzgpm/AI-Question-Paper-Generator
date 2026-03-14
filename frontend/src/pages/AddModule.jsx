import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
    ChevronRight,
    Save,
    Plus
} from 'lucide-react'

export default function AddModule() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [formData, setFormData] = useState({
        number: '',
        title: '',
        topics: ''
    })
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/curriculum/${courseId}/`)
                setCourse(response.data.course)
            } catch (error) {
                console.error("Error fetching course:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchCourse()
    }, [courseId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post(`/curriculum/${courseId}/add-module/`, formData)
            navigate(`/curriculum/${courseId}`)
        } catch (error) {
            console.error("Error adding module:", error)
            alert("Failed to add module.")
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) return null

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate(`/curriculum/${courseId}`)} className="text-muted-foreground hover:text-foreground">{course?.name}</button>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Add Module</span>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-2xl mx-auto space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">New Module</h2>
                        <p className="text-muted-foreground font-medium">Add a new unit or module to {course?.name}.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2 col-span-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit No.</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="1"
                                        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Module Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Introduction to Algorithms"
                                        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topics (Comma separated)</label>
                                <textarea
                                    placeholder="e.g. Binary Search, Bubble Sort, Complexity Analysis"
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[120px]"
                                    value={formData.topics}
                                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground italic mt-1">
                                    Tip: List the main topics covered in this module. Bloom mapping can be adjusted later.
                                </p>
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
                                        Save Module
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
