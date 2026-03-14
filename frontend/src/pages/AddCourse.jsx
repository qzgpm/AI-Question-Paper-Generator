import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    ChevronRight,
    ArrowLeft,
    Save,
    GraduationCap
} from 'lucide-react'

const ROMAN_TO_INT = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4,
    'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8
}

export default function AddCourse() {
    const navigate = useNavigate()
    const [departments, setDepartments] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: '',
        semester: 'I'
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('/curriculum/api/departments/')
                setDepartments(response.data.departments)
            } catch (error) {
                console.error("Error fetching departments:", error)
            }
        }
        fetchDepartments()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...formData,
                semester: ROMAN_TO_INT[formData.semester] || 1
            }
            await axios.post('/curriculum/add/', payload)
            navigate('/curriculum')
        } catch (error) {
            console.error("Error adding course:", error)
            alert("Failed to add course.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">Curriculum</button>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Add Course</span>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-2xl mx-auto space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">New Course</h2>
                        <p className="text-muted-foreground font-medium">Define a new course to start building its curriculum.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Course Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Data Structures"
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Course Code</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. CST203"
                                    pattern="[A-Z]{3}[0-9]{3}"
                                    title="Invalid format. Example: CST203"
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Semester</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((sem) => (
                                        <option key={sem} value={sem}>{sem}</option>
                                    ))}
                                </select>
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
                                {loading ? 'Creating...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Course
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
