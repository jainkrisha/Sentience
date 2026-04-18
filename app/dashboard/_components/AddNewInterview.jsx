"use client";
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "utils/Geminimodel";
import { LoaderCircle, Plus, X, ChevronDown } from 'lucide-react';
import { db } from 'utils/db';
import { v4 as uuidv4 } from 'uuid';
import { interview_sessions } from '@/utils/schema';
import moment from 'moment';
import { useRouter } from 'next/navigation';

// ─── Preset tech stacks by role ─────────────────────────────────────────────
const ROLE_PRESETS = {
  "Frontend Developer":   ["React", "JavaScript", "TypeScript", "CSS", "Next.js", "HTML"],
  "Backend Developer":   ["Node.js", "Python", "REST APIs", "SQL", "MongoDB", "Docker"],
  "Full Stack Developer":["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs", "Git"],
  "Data Scientist":      ["Python", "Pandas", "NumPy", "Machine Learning", "SQL", "TensorFlow"],
  "ML Engineer":         ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "Scikit-learn"],
  "DevOps Engineer":     ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform"],
  "Android Developer":   ["Kotlin", "Java", "Android SDK", "Jetpack Compose", "REST APIs"],
  "iOS Developer":       ["Swift", "SwiftUI", "Xcode", "REST APIs", "Core Data"],
  "Data Engineer":       ["Python", "Apache Spark", "SQL", "Airflow", "AWS", "Kafka"],
  "Cloud Architect":     ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Microservices"],
};

const QUESTION_COUNTS = [5, 8, 10];

function TagBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-red-500 ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function AddNewInterview() {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [jobRole, setJobRole] = React.useState("");
    const [customRole, setCustomRole] = React.useState("");
    const [techTags, setTechTags] = React.useState([]);
    const [tagInput, setTagInput] = React.useState("");
    const [experience, setExperience] = React.useState("");
    const [questionCount, setQuestionCount] = React.useState(5);
    const [loading, setLoading] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState("");
    const Router = useRouter();

    React.useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        const email = getCookie('user_email');
        if (email) setUserEmail(decodeURIComponent(email));
    }, []);

    // When a preset role is picked, auto-fill its tech stack
    const handleRoleSelect = (role) => {
        setJobRole(role);
        setCustomRole("");
        if (ROLE_PRESETS[role]) {
            setTechTags(ROLE_PRESETS[role]);
        }
    };

    const addTag = (tag) => {
        const t = tag.trim();
        if (t && !techTags.includes(t)) setTechTags(prev => [...prev, t]);
        setTagInput("");
    };

    const removeTag = (tag) => setTechTags(prev => prev.filter(t => t !== tag));

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        }
    };

    const finalRole = customRole.trim() || jobRole;

    // ── Build the enhanced prompt ────────────────────────────────────────────
    const buildPrompt = () => {
        const expLevel = Number(experience);
        const levelLabel =
            expLevel <= 1 ? "Entry Level (0-1 years)" :
            expLevel <= 3 ? "Junior (2-3 years)" :
            expLevel <= 5 ? "Mid-Level (4-5 years)" :
            expLevel <= 8 ? "Senior (6-8 years)" :
                           "Principal / Staff (9+ years)";

        const techList = techTags.join(", ") || "General software engineering";

        return `You are an expert technical interviewer with 15+ years of experience hiring for ${finalRole} roles at top tech companies.

Generate exactly ${questionCount} interview questions for:
- Role: ${finalRole}
- Tech Stack: ${techList}
- Experience Level: ${levelLabel}

STRICT RULES:
1. Questions must be directly tied to "${finalRole}" and the tech stack: ${techList}
2. Each question must belong to a DIFFERENT category from this list:
   [Technical Concept, Coding/Implementation, System Design, Debugging/Troubleshooting, Best Practices, Problem-Solving, ${expLevel >= 5 ? 'Architecture, Leadership' : 'Fundamentals'}]
3. Experience-based depth:
   - Entry/Junior: Focus on core concepts, syntax, simple implementations
   - Mid-Level: Architecture decisions, debugging, optimization
   - Senior+: System design, scalability, trade-offs, mentoring
4. Answers must be detailed, specific, and include examples where relevant
5. Do NOT ask generic HR questions like "tell me about yourself" or "what are your strengths"
6. NEVER repeat a tech or concept across questions
7. Return ONLY a raw JSON array — NO markdown, NO code fences, NO explanation

Required JSON format:
[
  {
    "question": "specific technical question here",
    "answer": "detailed model answer with examples, best practices, and what the interviewer is looking for"
  }
]

Return exactly ${questionCount} items in the array.`;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!finalRole) { alert("Please select or enter a job role."); return; }
        if (techTags.length === 0) { alert("Please add at least one technology/skill."); return; }
        setLoading(true);

        try {
            const prompt = buildPrompt();
            console.log("Prompt →", prompt);

            const result = await chatSession.sendMessage(prompt);
            let responseText = (await result.response.text()).trim()
                .replace(/```json/g, '').replace(/```/g, '').trim();

            console.log("Raw AI response →", responseText);

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(responseText);
            } catch {
                // Try to extract JSON array from response
                const match = responseText.match(/\[[\s\S]*\]/);
                if (match) jsonResponse = JSON.parse(match[0]);
                else throw new Error("Could not parse AI response as JSON");
            }

            if (!Array.isArray(jsonResponse) || jsonResponse.length === 0) {
                throw new Error("AI returned empty or invalid question list");
            }

            const techStackSummary = techTags.join(", ");
            const output = await db.insert(interview_sessions).values({
                mockId: uuidv4(),
                generatedQuestions: JSON.stringify(jsonResponse),
                jobPosition: finalRole,
                jobDescription: techStackSummary,
                jobExperience: experience,
                createdBy: userEmail,
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            }).returning({ mockId: interview_sessions.mockId });

            setOpenDialog(false);
            Router.push(`/dashboard/interview/${output[0].mockId}`);
        } catch (error) {
            console.error("Error generating questions:", error);
            alert(`Error: ${error.message || "Failed to generate questions. Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div
                className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
                onClick={() => setOpenDialog(true)}
            >
                <h2 className='text-lg text-center flex items-center justify-center gap-2'>
                    <Plus className="w-5 h-5" /> Add new
                </h2>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Set Up Your Interview</DialogTitle>
                        <DialogDescription>
                            Pick your role and tech stack — AI will generate tailored questions for you.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={onSubmit} className="space-y-5 pt-2">

                        {/* ── Role Selector ── */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Job Role</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                                {Object.keys(ROLE_PRESETS).map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleRoleSelect(role)}
                                        className={`text-xs px-2 py-1.5 rounded-lg border transition-all text-left ${
                                            jobRole === role
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                            <Input
                                placeholder="Or type a custom role (e.g. Blockchain Developer)"
                                value={customRole}
                                onChange={e => { setCustomRole(e.target.value); setJobRole(""); }}
                            />
                        </div>

                        {/* ── Tech Stack Tags ── */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tech Stack / Skills
                                <span className="text-xs text-gray-400 ml-2">(press Enter or comma to add)</span>
                            </label>
                            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                                {techTags.map(tag => (
                                    <TagBadge key={tag} label={tag} onRemove={() => removeTag(tag)} />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. React, GraphQL, Docker"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                />
                                <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* ── Experience + Question Count ── */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                                <Input
                                    placeholder="e.g. 3"
                                    type="number"
                                    min="0"
                                    max="50"
                                    required
                                    value={experience}
                                    onChange={e => setExperience(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Number of Questions</label>
                                <div className="flex gap-2">
                                    {QUESTION_COUNTS.map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setQuestionCount(n)}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                                questionCount === n
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-200 hover:border-blue-400'
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Preview ── */}
                        {finalRole && techTags.length > 0 && experience && (
                            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
                                <span className="font-semibold">AI will generate:</span> {questionCount} interview questions for a{' '}
                                <span className="font-semibold">{finalRole}</span> with{' '}
                                <span className="font-semibold">{experience} year(s)</span> experience in{' '}
                                <span className="font-semibold">{techTags.slice(0,4).join(', ')}{techTags.length > 4 ? ` +${techTags.length - 4} more` : ''}</span>
                            </div>
                        )}

                        <div className='flex gap-3 justify-end pt-1'>
                            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading || !finalRole || techTags.length === 0} className='bg-blue-600 hover:bg-blue-700'>
                                {loading
                                    ? <><LoaderCircle className='animate-spin mr-2 w-4 h-4' /> Generating Questions…</>
                                    : `Generate ${questionCount} Questions`
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AddNewInterview;