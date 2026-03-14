import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import {
    ChevronRight,
    Plus,
    MoreVertical,
    BookOpen,
    Settings,
    Trash2,
    Edit2,
    ArrowLeft,
    LayoutGrid,
    List
} from 'lucide-react'

export default function CourseDetail() {
    const { courseId } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                const response = await axios.get(`/curriculum/${courseId}/`)
                setData(response.data)
            } catch (error) {
                console.error("Error fetching course detail:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCourseDetail()
    }, [courseId])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold tracking-widest uppercase">Loading Course Details...</p>
                </div>
            </div>
        )
    }

    if (!data) return null

    const { course, modules } = data

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/curriculum" className="text-muted-foreground hover:text-foreground">Curriculum</Link>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[200px]">{course.name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 border border-border rounded-lg bg-white hover:bg-zinc-50">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <Link to={`/curriculum/${course.id}/add-module`} className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Module
                    </Link>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-5xl mx-auto space-y-10">
                    {/* Course Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-secondary text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-border">
                                    {course.code}
                                </span>
                                <span className="text-muted-foreground text-sm font-medium">{course.department}</span>
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tighter">{course.name}</h2>
                            <p className="text-muted-foreground max-w-2xl font-medium">
                                Comprehensive course curriculum including {modules.length} modules and associated Bloom-mapped topics.
                            </p>
                        </div>

                        <div className="flex gap-8 px-8 py-4 bg-white border border-border rounded-2xl shadow-sm">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Semester</p>
                                <p className="text-lg font-black tracking-tighter">{course.semester}</p>
                            </div>
                            <div className="w-px h-10 bg-border"></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Marks</p>
                                <p className="text-lg font-black tracking-tighter">100</p>
                            </div>
                        </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold tracking-tight">Modules</h3>
                            <div className="flex bg-secondary p-1 rounded-lg">
                                <button className="p-1.5 bg-white rounded-md shadow-sm"><LayoutGrid className="w-4 h-4" /></button>
                                <button className="p-1.5 text-muted-foreground"><List className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {modules.length > 0 ? (
                                modules.map((module) => (
                                    <div key={module.id} className="bg-white border border-border rounded-xl p-8 hover:border-black/20 transition-all shadow-sm group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-lg font-black tracking-tighter">
                                                    {module.number}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold tracking-tight">{module.title}</h4>
                                                    <p className="text-sm text-muted-foreground font-medium">{module.topics.length} assigned topics</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-zinc-100 rounded-lg text-red-600" onClick={async () => {
                                                    if (confirm('Delete this module?')) {
                                                        await axios.post(`/curriculum/module/${module.id}/delete/`)
                                                        window.location.reload()
                                                    }
                                                }}><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {module.topics.map((topic) => (
                                                <div key={topic.id} className="flex items-center gap-2 bg-[#fcfcfc] border border-border px-4 py-2 rounded-lg hover:border-black transition-colors group/topic relative">
                                                    <span className="text-sm font-semibold">{topic.name}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-tighter bg-zinc-100 px-1.5 py-0.5 rounded text-muted-foreground group-hover/topic:bg-black group-hover/topic:text-white transition-colors">
                                                        {topic.suggested_bloom_level || 'L1'}
                                                    </span>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation()
                                                            if (confirm('Delete this topic?')) {
                                                                await axios.post(`/curriculum/topic/${topic.id}/delete/`)
                                                                window.location.reload()
                                                            }
                                                        }}
                                                        className="opacity-0 group-hover/topic:opacity-100 absolute -top-2 -right-2 bg-white border border-border rounded-full p-1 shadow-sm hover:bg-red-50 hover:text-red-600 transition-all"
                                                    >
                                                        <Plus className="w-2 h-2 rotate-45" />
                                                    </button>
                                                </div>
                                            ))}
                                            <Link
                                                to={`/curriculum/module/${module.id}/add-topic`}
                                                className="inline-flex items-center gap-2 border border-dashed border-border px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:border-black hover:text-black transition-all"
                                            >
                                                <Plus className="w-3 h-3" />
                                                New Topic
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
                                    <Plus className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
                                    <h4 className="font-bold">No modules added yet</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Start by adding your first unit or module to this course.</p>
                                    <Link to={`/curriculum/${course.id}/add-module`} className="mt-6 bg-black text-white px-6 py-2 rounded-lg text-sm font-bold inline-block">Add Module</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
