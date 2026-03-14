import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'faculty'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.role
            );
            if (result.success) {
                navigate('/login');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 rotate-3">
                        <Zap className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">KTU-QGen</h1>
                    <p className="text-muted-foreground font-medium">Join the Elite Academic Network</p>
                </div>

                <div className="bg-white border border-border p-10 rounded-3xl shadow-xl shadow-black/5 space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight">Create Account</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Register your credentials</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-xs font-bold text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <User className="w-3 h-3" /> Full Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                placeholder="Dr. John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                placeholder="name@university.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Academic Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'faculty', label: 'Faculty' },
                                    { id: 'hod', label: 'HOD' },
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role.id })}
                                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${formData.role === role.id ? 'bg-black text-white border-black' : 'border-zinc-100 text-muted-foreground hover:border-zinc-200'
                                            }`}
                                    >
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:bg-zinc-200"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-center text-xs gap-1">
                        <span className="text-muted-foreground">Already have an account?</span>
                        <Link to="/login" className="font-bold hover:underline">Sign In</Link>
                    </div>
                </div>

                <div className="flex justify-center gap-8 opacity-30">
                    <div className="w-px h-12 bg-black"></div>
                    <div className="w-px h-12 bg-black"></div>
                    <div className="w-px h-12 bg-black"></div>
                </div>
            </div>
        </div>
    );
}
