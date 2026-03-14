import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    ChevronRight,
    ChevronLeft,
    Check,
    FileText,
    AlertCircle,
    Clock,
    Zap,
    BookOpen,
    ArrowRight
} from 'lucide-react'

export default function GeneratePaper() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [selectedModules, setSelectedModules] = useState([])
    const [config, setConfig] = useState({
        title: '',
        difficulty: 'medium',
        mode: 'auto'
    })
    const [candidates, setCandidates] = useState({ part_a: [], part_b: [] })
    const [selections, setSelections] = useState({ part_a: [], part_b: [] })
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('/curriculum/api/courses/')
                setCourses(response.data.courses)
            } catch (error) {
                console.error("Error fetching courses:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchCourses()
    }, [])

    useEffect(() => {
        if (selectedCourse) {
            const fetchModules = async () => {
                try {
                    const response = await axios.get(`/curriculum/api/courses/${selectedCourse}/modules/`)
                    setModules(response.data.modules)
                    setSelectedModules([])
                } catch (error) {
                    console.error("Error fetching modules:", error)
                }
            }
            fetchModules()
        }
    }, [selectedCourse])

    const fetchCandidates = async () => {
        setLoading(true)
        try {
            const response = await axios.post('/engine/api/generate-candidates/', {
                course_id: selectedCourse,
                module_ids: selectedModules,
                difficulty: config.difficulty
            })
            setCandidates({
                part_a: response.data.part_a,
                part_b: response.data.part_b
            })
            setSelections({
                part_a: [],
                part_b: []
            })
            setStep(4)
        } catch (error) {
            console.error("Error generating pool:", error)
            alert("Timeout: The AI is taking too long to generate the pool. Please try selecting fewer modules or try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        setLoading(true)
        try {
            if (config.mode === 'auto') {
                const response = await axios.post('/engine/api/generate/', {
                    course_id: selectedCourse,
                    module_ids: selectedModules,
                    title: config.title || `Exam: ${courses.find(c => c.id === selectedCourse)?.name}`,
                    difficulty: config.difficulty
                })
                navigate(`/papers/${response.data.paper_id}`)
            } else {
                // Manual Selection Payload
                const mappedSelections = [
                    ...selections.part_a.map((id, i) => ({ question_id: id, part: 'A', order: i + 1 })),
                    ...selections.part_b.map((item, i) => ([
                        { question_id: item.a, part: 'B', order: i + 1, slot: 'a' },
                        { question_id: item.b, part: 'B', order: i + 1, slot: 'b' }
                    ])).flat()
                ]

                const response = await axios.post('/engine/api/manual-generate/', {
                    course_id: selectedCourse,
                    title: config.title || `Custom Exam: ${courses.find(c => c.id === selectedCourse)?.name}`,
                    selections: mappedSelections
                })
                navigate(`/papers/${response.data.paper_id}`)
            }
        } catch (error) {
            console.error("Generation failed:", error)
            alert("Generation failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const steps = [
        { id: 1, name: 'Select Course' },
        { id: 2, name: 'Choose Units' },
        { id: 3, name: 'Configuration' },
        { id: 4, name: 'Question Picker' }
    ]

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Wizard</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Generate Paper</span>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-4xl mx-auto">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-16 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0"></div>
                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step > s.id ? 'bg-black text-white' :
                                    step === s.id ? 'bg-black text-white ring-8 ring-zinc-50' :
                                        'bg-white border-2 border-zinc-200 text-muted-foreground'
                                    }`}>
                                    {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-widest ${step === s.id ? 'text-black' : 'text-muted-foreground'
                                    }`}>{s.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-border rounded-2xl p-10 shadow-sm min-h-[400px] flex flex-col">
                        {step === 1 && (
                            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2 mb-10">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase">Select Subject</h3>
                                    <p className="text-muted-foreground text-sm font-medium">Choose a course to generate questions from.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courses.map((course) => (
                                        <button
                                            key={course.id}
                                            onClick={() => setSelectedCourse(course.id)}
                                            className={`p-6 border-2 text-left rounded-xl transition-all ${selectedCourse === course.id
                                                ? 'border-black bg-zinc-50'
                                                : 'border-zinc-100 hover:border-zinc-200'
                                                }`}
                                        >
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{course.code}</p>
                                            <p className="text-lg font-bold tracking-tight">{course.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2 mb-10">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase">Select Modules</h3>
                                    <p className="text-muted-foreground text-sm font-medium">Pick the units you want to cover in the exam.</p>
                                </div>
                                <div className="space-y-3">
                                    {modules.map((mod) => (
                                        <label
                                            key={mod.id}
                                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedModules.includes(mod.id)
                                                ? 'border-black bg-zinc-50'
                                                : 'border-zinc-100 hover:border-zinc-200'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedModules.includes(mod.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedModules([...selectedModules, mod.id])
                                                    else setSelectedModules(selectedModules.filter(id => id !== mod.id))
                                                }}
                                            />
                                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${selectedModules.includes(mod.id) ? 'bg-black border-black' : 'border-zinc-200 bg-white'
                                                }`}>
                                                {selectedModules.includes(mod.id) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold tracking-tight">Module {mod.number}: {mod.title}</p>
                                                <p className="text-xs text-muted-foreground">{mod.topics.length} topics</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2 mb-10">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase">Final Settings</h3>
                                    <p className="text-muted-foreground text-sm font-medium">Almost there! Set the paper details.</p>
                                </div>
                                <div className="max-w-md mx-auto space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Paper Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Mid Semester Exam 2024"
                                            className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                            value={config.title}
                                            onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Difficulty Level</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['easy', 'medium', 'hard'].map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setConfig({ ...config, difficulty: lvl })}
                                                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all ${config.difficulty === lvl ? 'bg-black text-white border-black' : 'border-zinc-100 text-muted-foreground hover:border-zinc-200'
                                                        }`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-secondary/50 p-6 rounded-2xl border border-secondary flex gap-4">
                                        <Zap className="w-5 h-5 text-black" />
                                        <p className="text-xs text-muted-foreground">
                                            {config.mode === 'auto'
                                                ? "Our AI will generate a balanced set of questions mapping to the selected modules and Bloom's Taxonomy levels."
                                                : "You'll select questions from the library for each part of the paper."}
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Generation Mode</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setConfig({ ...config, mode: 'auto' })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${config.mode === 'auto' ? 'border-black bg-zinc-50' : 'border-zinc-100'}`}
                                            >
                                                <Zap className={`w-4 h-4 mb-2 ${config.mode === 'auto' ? 'text-black' : 'text-zinc-400'}`} />
                                                <p className="text-xs font-bold uppercase tracking-widest">Auto AI</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfig({ ...config, mode: 'manual' })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${config.mode === 'manual' ? 'border-black bg-zinc-50' : 'border-zinc-100'}`}
                                            >
                                                <div className={`w-4 h-4 mb-2 ${config.mode === 'manual' ? 'text-black' : 'text-zinc-400'} border-2 border-current rounded-sm flex items-center justify-center text-[8px] font-black`}>M</div>
                                                <p className="text-xs font-bold uppercase tracking-widest">Manual</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col">
                                <div className="text-center space-y-2 mb-6">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase">Question Picker</h3>
                                    <p className="text-muted-foreground text-sm font-medium">Select questions from the library for your paper.</p>
                                </div>

                                <div className="flex-1 overflow-auto space-y-10 pr-2 custom-scrollbar">
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10 border-b border-zinc-100">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Part A — Select 5 Questions</h4>
                                            <span className="text-[10px] font-black">{selections.part_a.length}/5</span>
                                        </div>
                                        <div className="grid gap-3">
                                            {candidates.part_a.map(q => (
                                                <button
                                                    key={q.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (selections.part_a.includes(q.id)) {
                                                            setSelections({ ...selections, part_a: selections.part_a.filter(id => id !== q.id) })
                                                        } else if (selections.part_a.length < 5) {
                                                            setSelections({ ...selections, part_a: [...selections.part_a, q.id] })
                                                        }
                                                    }}
                                                    className={`p-4 border-2 rounded-xl text-left transition-all relative ${selections.part_a.includes(q.id) ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200'}`}
                                                >
                                                    <p className="text-sm pr-10">{q.text}</p>
                                                    <div className="mt-2 flex gap-2">
                                                        <span className="text-[8px] font-black uppercase tracking-tighter bg-zinc-200 px-1.5 py-0.5 rounded opacity-50">{q.blooms}</span>
                                                        <span className="text-[8px] font-black uppercase tracking-tighter bg-zinc-200 px-1.5 py-0.5 rounded opacity-50">Unit {q.module}</span>
                                                    </div>
                                                    {selections.part_a.includes(q.id) && (
                                                        <div className="absolute right-4 top-4 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-6 pb-20">
                                        <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10 border-b border-zinc-100">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Part B — Select 5 Question Pairs</h4>
                                            <span className="text-[10px] font-black">{selections.part_b.filter(g => g.question_a && g.question_b).length}/5 Selected</span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {candidates.part_b.map((group, gIdx) => {
                                                const isSelected = selections.part_b.some(s => s.id === gIdx);
                                                return (
                                                    <button
                                                        key={gIdx}
                                                        type="button"
                                                        onClick={() => {
                                                            const exists = selections.part_b.find(s => s.id === gIdx);
                                                            if (exists) {
                                                                setSelections({ ...selections, part_b: selections.part_b.filter(s => s.id !== gIdx) })
                                                            } else if (selections.part_b.length < 5) {
                                                                setSelections({
                                                                    ...selections,
                                                                    part_b: [...selections.part_b, {
                                                                        id: gIdx,
                                                                        a: group.question_a.id,
                                                                        b: group.question_b.id,
                                                                        text_a: group.question_a.text,
                                                                        text_b: group.question_b.text
                                                                    }]
                                                                })
                                                            }
                                                        }}
                                                        className={`p-6 border-2 rounded-2xl text-left transition-all relative ${isSelected ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <span className="text-[10px] font-black uppercase bg-zinc-200 px-2 py-1 rounded">Candidate Option {gIdx + 1}</span>
                                                            {isSelected && <Check className="w-5 h-5 text-black" />}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black uppercase text-zinc-400">Question (a)</p>
                                                                <p className="text-xs font-medium">{group.question_a.text}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black uppercase text-zinc-400">Question (b)</p>
                                                                <p className="text-xs font-medium">{group.question_b.text}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-10 mt-auto border-t border-zinc-100">
                            <button
                                type="button"
                                disabled={step === 1 || loading}
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-0 transition-all px-4 py-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    disabled={(step === 1 && !selectedCourse) || (step === 2 && selectedModules.length === 0)}
                                    onClick={() => setStep(step + 1)}
                                    className="bg-black text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:bg-zinc-200"
                                >
                                    Continue
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : step === 3 ? (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => config.mode === 'manual' ? fetchCandidates() : handleGenerate()}
                                    className="bg-black text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:bg-zinc-200"
                                >
                                    {config.mode === 'manual' ? (
                                        <>
                                            Pick Questions
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    ) : loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            Generate Paper
                                            <Zap className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={loading || selections.part_a.length !== 5 || selections.part_b.length !== 5}
                                    onClick={handleGenerate}
                                    className="bg-black text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:bg-zinc-100 disabled:text-zinc-400"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Finalizing Paper...
                                        </>
                                    ) : (
                                        <>
                                            Generate Final Paper
                                            <Zap className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
