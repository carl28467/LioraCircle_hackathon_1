import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Send, User, Bot, Sparkles, Users, Plus, Mic, Paperclip, X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

type Message = {
    id: string
    sender: "user" | "liora"
    text: string
    attachments?: { type: string, data: string }[]
}

type UserData = {
    full_name: string
    onboarding_completed: boolean
    family_id: string | null
    role?: "pioneer" | "joiner"
    family_code?: string
    profile_data: Record<string, any>
}

export default function Onboarding() {
    const { user, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [step, setStep] = useState<"role_selection" | "chat">("role_selection")
    const [userData, setUserData] = useState<UserData>({
        full_name: "",
        onboarding_completed: false,
        family_id: null,
        profile_data: {}
    })

    // Attachments State
    const [attachments, setAttachments] = useState<{ type: string, data: string, name: string }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Widgets State
    const [showFamilyWidget, setShowFamilyWidget] = useState(false)
    const [showJoinSuccessWidget, setShowJoinSuccessWidget] = useState(false)
    const [showConfirmationWidget, setShowConfirmationWidget] = useState(false)
    const [copied, setCopied] = useState(false)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping, attachments, showFamilyWidget, showConfirmationWidget, showJoinSuccessWidget])

    // Load Chat History & Profile
    useEffect(() => {
        if (!user) return

        const loadData = async () => {
            // Load Profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle()

            if (profile) {
                setUserData(prev => ({
                    ...prev,
                    ...profile,
                    profile_data: profile.profile_data || {}
                }))
            }

            // Load Messages
            const { data: history } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true })

            if (history && history.length > 0 && profile?.profile_data?.role) {
                setMessages(history.map(m => ({
                    id: m.id,
                    sender: m.sender as "user" | "liora",
                    text: m.content,
                    attachments: m.attachments
                })))
                setStep("chat")
            }
        }

        loadData()
    }, [user])

    const addMessage = async (sender: "user" | "liora", text: string, msgAttachments?: { type: string, data: string }[]) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            sender,
            text,
            attachments: msgAttachments
        }

        setMessages((prev) => [...prev, newMessage])

        if (user) {
            await supabase.from("chat_messages").insert({
                user_id: user.id,
                sender,
                content: text,
                attachments: msgAttachments || []
            })
        }
    }

    // --- File Handling ---
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                const base64Data = base64String.split(",")[1]
                setAttachments(prev => [...prev, {
                    type: file.type,
                    data: base64Data,
                    name: file.name
                }])
            }
            reader.readAsDataURL(file)
        }
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    // --- Voice Handling ---
    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop()
            setIsRecording(false)
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const mediaRecorder = new MediaRecorder(stream)
                mediaRecorderRef.current = mediaRecorder
                chunksRef.current = []

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data)
                }

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: "audio/webm" })
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        const base64String = reader.result as string
                        const base64Data = base64String.split(",")[1]
                        setAttachments(prev => [...prev, {
                            type: "audio/webm",
                            data: base64Data,
                            name: "Voice Message"
                        }])
                    }
                    reader.readAsDataURL(blob)
                    stream.getTracks().forEach(track => track.stop())
                }

                mediaRecorder.start()
                setIsRecording(true)
            } catch (err) {
                console.error("Error accessing microphone:", err)
                alert("Could not access microphone.")
            }
        }
    }

    // --- Send Message ---
    const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
        if (e) e.preventDefault()

        const textToSend = overrideText || inputValue.trim()
        if (!textToSend && attachments.length === 0) return

        const currentAttachments = [...attachments]

        setInputValue("")
        setAttachments([])

        // Send user message
        await addMessage("user", textToSend, currentAttachments)

        setIsTyping(true)

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: textToSend || (currentAttachments.length > 0 ? "[Sent an attachment]" : ""),
                    user_id: user?.id || "anon",
                    context: {
                        profile: userData
                    },
                    attachments: currentAttachments.map(a => ({ type: a.type, data: a.data }))
                })
            })

            const data = await response.json()

            setIsTyping(false)
            await addMessage("liora", data.response)

            if (data.metadata?.updates) {
                const updates = data.metadata.updates

                // Handle Suggestion
                if (updates.suggest_completion) {
                    setShowConfirmationWidget(true)
                }

                // Handle Family Code Generation
                if (updates.family_code) {
                    await createFamily(updates.family_code)
                    setUserData(prev => ({ ...prev, family_code: updates.family_code }))
                    setShowFamilyWidget(true)
                    setShowConfirmationWidget(false) // Hide confirmation if done
                }

                // Handle Join Family
                if (updates.join_family_id) {
                    await joinFamily(updates.join_family_id)
                    setUserData(prev => ({ ...prev, family_id: updates.join_family_id }))
                }

                setUserData(prev => {
                    const newProfileData = {
                        ...prev.profile_data,
                        ...(updates.profile_data || {})
                    }

                    const newState = {
                        ...prev,
                        ...updates,
                        profile_data: newProfileData
                    }

                    if (updates.onboarding_completed) {
                        saveProfile(newState)
                        // Show success widget for Joiners
                        if (prev.role === 'joiner') {
                            setShowJoinSuccessWidget(true)
                            setShowConfirmationWidget(false)
                        }
                    }
                    return newState
                })
            }

        } catch (error) {
            console.error("Error talking to Liora:", error)
            setIsTyping(false)
            addMessage("liora", "I'm having trouble connecting to my brain. Please try again.")
        }
    }

    const createFamily = async (code: string) => {
        if (!user) return
        try {
            const { data: family, error } = await supabase
                .from("families")
                .insert({
                    name: `${userData.full_name || "My"}'s Circle`,
                    invite_code: code,
                    pioneer_id: user.id
                })
                .select()
                .single()

            if (error) throw error

            await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    family_id: family.id,
                    updated_at: new Date().toISOString()
                })

        } catch (error) {
            console.error("Error creating family:", error)
        }
    }

    const joinFamily = async (familyId: string) => {
        if (!user) return
        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    family_id: familyId,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
        } catch (error) {
            console.error("Error joining family:", error)
        }
    }

    const saveProfile = async (finalData: UserData) => {
        if (!user) return

        try {
            const fullName = finalData.full_name || finalData.profile_data.name || finalData.profile_data.full_name

            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    profile_data: finalData.profile_data,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
                    family_id: finalData.family_id
                })

            if (error) throw error



        } catch (error) {
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleRoleSelect = async (role: "pioneer" | "joiner") => {
        setUserData(prev => ({ ...prev, role }))

        // Persist role to Supabase immediately
        if (user) {
            try {
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        profile_data: {
                            ...userData.profile_data,
                            role: role
                        }
                    })
                    .eq("id", user.id)

                if (error) console.error("Error saving role:", error)
            } catch (err) {
                console.error("Error saving role:", err)
            }
        }

        setStep("chat")

        if (role === "joiner") {
            addMessage("liora", "Welcome! To join an existing Family Circle, please enter the 6-character Family Invite Code shared by the Pioneer.")
        } else {
            addMessage("liora", "Hi! I'm Liora. I'm here to help you manage your family's health. To get started, could you tell me your name?")
        }
    }

    const copyCode = () => {
        if (userData.family_code) {
            navigator.clipboard.writeText(userData.family_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (step === "role_selection") {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
                    <Card
                        className="p-8 bg-black/40 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer group"
                        onClick={() => handleRoleSelect("pioneer")}
                    >
                        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Be a Pioneer</h2>
                        <p className="text-white/60">Create a new Family Circle. You'll get a code to invite others.</p>
                    </Card>

                    <Card
                        className="p-8 bg-black/40 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer group"
                        onClick={() => handleRoleSelect("joiner")}
                    >
                        <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6 text-pink-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Join a Circle</h2>
                        <p className="text-white/60">Enter an invite code to join an existing Family Circle.</p>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center px-6 bg-black/20 backdrop-blur-lg sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-white">Liora Onboarding</span>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-white/10" : "bg-purple-500/20"
                                }`}
                        >
                            {msg.sender === "user" ? (
                                <User className="w-4 h-4 text-white" />
                            ) : (
                                <Bot className="w-4 h-4 text-purple-400" />
                            )}
                        </div>
                        <div className="max-w-[80%] space-y-2">
                            <div
                                className={`p-4 rounded-2xl ${msg.sender === "user"
                                    ? "bg-purple-600 text-white rounded-tr-none"
                                    : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                                    }`}
                            >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className={`flex gap-2 flex-wrap ${msg.sender === "user" ? "justify-end" : ""}`}>
                                    {msg.attachments.map((att, i) => (
                                        <div key={i} className="bg-white/10 p-2 rounded text-xs text-white/70">
                                            {att.type.startsWith("image") ? "Image" : "File"} attached
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Confirmation Widget */}
                {showConfirmationWidget && !showFamilyWidget && !showJoinSuccessWidget && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="my-4"
                    >
                        <Card className="bg-purple-900/20 border-purple-500/30 p-4 max-w-md mx-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <p className="text-white/90 font-medium">I have everything I need. Ready to finish?</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleSendMessage(undefined, "Yes, everything is correct")}
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                                >
                                    Yes, Finish
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmationWidget(false)}
                                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                                >
                                    No, Add More
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Join Success Widget */}
                {showJoinSuccessWidget && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="my-8"
                    >
                        <Card className="bg-gradient-to-br from-purple-900/40 to-black border-purple-500/30 p-6 max-w-md mx-auto text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">You're All Set!</h3>
                            <p className="text-white/60 mb-6">You've successfully joined the Family Circle and completed your profile.</p>

                            <Button
                                onClick={async () => {
                                    await refreshProfile()
                                    navigate("/")
                                }}
                                className="w-full bg-white text-black hover:bg-white/90 transition-all"
                            >
                                Continue to Dashboard
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {/* Family Code Widget */}
                {showFamilyWidget && userData.family_code && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="my-8"
                    >
                        <Card className="bg-gradient-to-br from-purple-900/40 to-black border-purple-500/30 p-6 max-w-md mx-auto text-center">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Your Circle is Ready!</h3>
                            <p className="text-white/60 mb-6">Share this code with your family members to let them join your circle.</p>

                            <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg border border-purple-500/20 mb-6">
                                <code className="flex-1 text-purple-300 font-mono text-lg tracking-wider">{userData.family_code}</code>
                                <Button size="icon" variant="ghost" onClick={copyCode} className="hover:bg-white/10">
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 mb-6 text-left bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="share-confirm"
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-purple-500/50 bg-black/40 transition-all checked:bg-purple-500 checked:border-purple-500 hover:border-purple-400"
                                        onChange={(e) => {
                                            const btn = document.getElementById('continue-btn') as HTMLButtonElement
                                            if (btn) btn.disabled = !e.target.checked
                                        }}
                                    />
                                    <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <label htmlFor="share-confirm" className="text-sm text-white/80 cursor-pointer select-none">
                                    I have shared this code with my family members
                                </label>
                            </div>

                            <Button
                                id="continue-btn"
                                onClick={async () => {
                                    await refreshProfile()
                                    navigate("/")
                                }}
                                disabled={true}
                                className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Continue to Dashboard
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1 items-center h-14">
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!showFamilyWidget && (
                <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-lg">
                    {attachments.length > 0 && (
                        <div className="max-w-3xl mx-auto mb-2 flex gap-2 overflow-x-auto">
                            {attachments.map((att, i) => (
                                <div key={i} className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-2 flex items-center gap-2 text-sm text-white">
                                    <span>{att.name}</span>
                                    <button onClick={() => removeAttachment(i)} className="hover:text-red-400">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => handleSendMessage(e)}
                        className="max-w-3xl mx-auto flex gap-4"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                            accept="image/*,audio/*,.pdf,.txt"
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-white/50 hover:text-white hover:bg-white/10"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`${isRecording ? "text-red-500 bg-red-500/10 animate-pulse" : "text-white/50 hover:text-white hover:bg-white/10"}`}
                            onClick={toggleRecording}
                        >
                            <Mic className="w-5 h-5" />
                        </Button>

                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isRecording ? "Recording..." : "Type your answer..."}
                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50"
                            disabled={isTyping || isRecording}
                        />
                        <Button
                            type="submit"
                            disabled={(!inputValue.trim() && attachments.length === 0) || isTyping || isRecording}
                            className="bg-purple-600 hover:bg-purple-500 text-white"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            )}
        </div>
    )
}
