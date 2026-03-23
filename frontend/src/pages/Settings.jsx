import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ChevronRight, User, Lock, LogOut, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function StatusMessage({ type, message }) {
    if (!message) return null
    const isError = type === 'error'
    return (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg border ${isError
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
            }`}>
            {isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
            {message}
        </div>
    )
}

function SettingsSection({ title, description, children }) {
    return (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-border">
                <h3 className="font-bold tracking-tight">{title}</h3>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="px-8 py-6 space-y-5">{children}</div>
        </div>
    )
}

function Field({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
            {children}
        </div>
    )
}

const inputClass = "w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-[#fcfcfc] focus:bg-white transition-colors"

export default function Settings() {
    const { user, logout, checkAuthStatus } = useAuth()

    // Profile form
    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })
    const [profileStatus, setProfileStatus] = useState({ type: '', message: '' })
    const [savingProfile, setSavingProfile] = useState(false)

    // Password form
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' })
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' })
    const [savingPassword, setSavingPassword] = useState(false)

    const handleProfileSave = async (e) => {
        e.preventDefault()
        setSavingProfile(true)
        setProfileStatus({ type: '', message: '' })
        try {
            const res = await axios.post('/accounts/api/update-profile/', profile)
            if (res.data.status === 'success') {
                setProfileStatus({ type: 'success', message: 'Profile updated successfully.' })
                await checkAuthStatus()
            } else {
                setProfileStatus({ type: 'error', message: res.data.error || 'Update failed.' })
            }
        } catch (err) {
            setProfileStatus({ type: 'error', message: err.response?.data?.error || 'Update failed.' })
        } finally {
            setSavingProfile(false)
        }
    }

    const handlePasswordSave = async (e) => {
        e.preventDefault()
        setPasswordStatus({ type: '', message: '' })
        if (passwords.new_password !== passwords.confirm_password) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
            return
        }
        if (passwords.new_password.length < 8) {
            setPasswordStatus({ type: 'error', message: 'Password must be at least 8 characters.' })
            return
        }
        setSavingPassword(true)
        try {
            const res = await axios.post('/accounts/api/change-password/', {
                current_password: passwords.current_password,
                new_password: passwords.new_password,
            })
            if (res.data.status === 'success') {
                setPasswordStatus({ type: 'success', message: 'Password changed successfully.' })
                setPasswords({ current_password: '', new_password: '', confirm_password: '' })
            } else {
                setPasswordStatus({ type: 'error', message: res.data.error || 'Failed to change password.' })
            }
        } catch (err) {
            setPasswordStatus({ type: 'error', message: err.response?.data?.error || 'Failed to change password.' })
        } finally {
            setSavingPassword(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/" className="text-muted-foreground hover:text-foreground">Admin</Link>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Settings</span>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
                    </div>

                    {/* Profile Section */}
                    <SettingsSection
                        title={<span className="flex items-center gap-2"><User className="w-4 h-4" /> Profile</span>}
                        description="Update your display name and email address."
                    >
                        <form onSubmit={handleProfileSave} className="space-y-4">
                            <Field label="Full Name">
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={profile.name}
                                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Your full name"
                                    required
                                />
                            </Field>
                            <Field label="Email Address">
                                <input
                                    type="email"
                                    className={inputClass}
                                    value={profile.email}
                                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                    placeholder="your@email.com"
                                    required
                                />
                            </Field>
                            <Field label="Role">
                                <input
                                    type="text"
                                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                                    value={user?.role || ''}
                                    readOnly
                                />
                            </Field>
                            <StatusMessage {...profileStatus} />
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>

                    {/* Security Section */}
                    <SettingsSection
                        title={<span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Security</span>}
                        description="Change your password. You'll need your current password to confirm."
                    >
                        <form onSubmit={handlePasswordSave} className="space-y-4">
                            <Field label="Current Password">
                                <input
                                    type="password"
                                    className={inputClass}
                                    value={passwords.current_password}
                                    onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                />
                            </Field>
                            <Field label="New Password">
                                <input
                                    type="password"
                                    className={inputClass}
                                    value={passwords.new_password}
                                    onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                                    placeholder="Min. 8 characters"
                                    required
                                />
                            </Field>
                            <Field label="Confirm New Password">
                                <input
                                    type="password"
                                    className={inputClass}
                                    value={passwords.confirm_password}
                                    onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))}
                                    placeholder="Repeat new password"
                                    required
                                />
                            </Field>
                            <StatusMessage {...passwordStatus} />
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>

                    {/* Danger Zone */}
                    <SettingsSection
                        title={<span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Session</span>}
                        description="Sign out of your account on this device."
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">Signed in as <span className="font-bold">{user?.email}</span></p>
                                <p className="text-xs text-muted-foreground mt-0.5">Your session will be cleared on sign out.</p>
                            </div>
                            <button
                                onClick={logout}
                                className="px-5 py-2.5 border-2 border-black text-black rounded-lg text-sm font-bold hover:bg-black hover:text-white transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    </SettingsSection>
                </div>
            </div>
        </div>
    )
}
