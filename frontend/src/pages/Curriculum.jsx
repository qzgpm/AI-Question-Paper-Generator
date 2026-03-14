import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
    Plus,
    ChevronRight,
    BookOpen,
    ArrowRight,
    Search,
    Filter,
    Trash2
} from 'lucide-react'

export default function Curriculum() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('/curriculum/')
                setCourses(response.data.courses)
            } catch (error) {
                console.error("Error fetching courses:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold tracking-widest uppercase">Loading Curriculum...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/" className="text-muted-foreground hover:text-foreground">Admin</Link>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Curriculum</span>
                </div>
                <Link to="/curriculum/add" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Course
                </Link>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Curriculum</h2>
                            <p className="text-muted-foreground">Manage your academic programs and courses.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    className="pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                />
                            </div>
                            <button className="p-2 border border-border rounded-lg bg-white hover:bg-zinc-50">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <Link
                                    key={course.id}
                                    to={`/curriculum/${course.id}`}
                                    className="group bg-white border border-border rounded-xl p-6 hover:border-black transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-secondary p-3 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-black transition-colors border border-border px-2 py-0.5 rounded">
                                                {course.department}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight mb-1">{course.name}</h3>
                                        <p className="text-sm font-bold text-muted-foreground mb-4">{course.code}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-dotted border-border mt-4">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Semester</p>
                                                <p className="text-sm font-bold">{course.semester}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Modules</p>
                                                <p className="text-sm font-bold">{course.module_count}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async (e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    if (confirm('Delete this course and all its modules/topics?')) {
                                                        await axios.post(`/curriculum/${course.id}/delete/`)
                                                        window.location.reload()
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-black" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-2 py-20 bg-white border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
                                <BookOpen className="w-12 h-12 text-zinc-200 mb-4" />
                                <h3 className="text-lg font-bold">No courses found</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                    You haven't added any courses to your curriculum yet.
                                </p>
                                <button className="mt-6 bg-black text-white px-6 py-2 rounded-lg text-sm font-medium">
                                    Add Your First Course
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
