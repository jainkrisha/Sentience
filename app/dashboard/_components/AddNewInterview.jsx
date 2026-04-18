"use client";
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "utils/Geminimodel";
import { LoaderCircle } from 'lucide-react';
import {db} from 'utils/db';
import { v4 as uuidv4 } from 'uuid';
import { mockinterview } from '@/utils/schema';
import moment from 'moment';
import { useRouter } from 'next/navigation';

function AddNewInterview() {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [Jobpost, setJobpost] = React.useState("");
    const [JobDescription, setJobDescription] = React.useState("");
    const [Experience, setExperience] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const[response,setResponse] = React.useState([]);
    const [userEmail, setUserEmail] = React.useState("");
    const Router = useRouter();

    React.useEffect(() => {
        // Get user email from cookies
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        const email = getCookie('user_email');
        if (email) setUserEmail(decodeURIComponent(email));
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const Inputprompt = `You are an expert technical interviewer. Generate exactly 5 highly specific technical interview questions for:
- Job Role: ${Jobpost}
- Tech Stack / Description: ${JobDescription}
- Experience Level: ${Experience} years

Rules:
- Questions MUST be specific to "${Jobpost}" and the exact tech/tools in "${JobDescription}"
- If 0-2 years experience: ask about fundamentals and basic implementation
- If 3-5 years experience: ask about architecture, best practices, and debugging
- If 6+ years experience: ask about system design, scalability, and leadership
- Each question must be DIFFERENT in nature (coding, conceptual, problem-solving, etc.)
- NEVER ask generic HR or behavioral questions
- Return ONLY a raw JSON array, no markdown, no code block, no explanation

Output format (strict JSON array only):
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]`;
    
        try {
            console.log('Sending prompt to Gemini:', Inputprompt);
            const result = await chatSession.sendMessage(Inputprompt);
    
            // Await the result's text content
            let responseText = await result.response.text();
            console.log('Raw response from Gemini:', responseText);
            responseText = responseText.trim()
                .replace(/```json/g, '')  // Remove any markdown JSON block formatting
                .replace(/```/g, '');     // Remove leftover closing markdown
    
            // Try to parse the cleaned response
            let jsonResponse;
            try {
                jsonResponse = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                console.log("Raw response text:", responseText); // Log the raw response for debugging
                alert("There was an error parsing the response. Please try again.");
                setLoading(false);
                return;
            }
    
            // Log the parsed JSON response
            console.log(jsonResponse);
            setResponse(jsonResponse);
    
            if (jsonResponse) {
                const output = await db.insert(mockinterview).values({
                    mockid: uuidv4(),
                    jsonmockresp: responseText,  // Use the cleaned response
                    jobposition: Jobpost,
                    jobdescription: JobDescription,
                    jobexp: Experience,
                    createdby: userEmail,
                    createddate: moment().format('YYYY-MM-DD HH:mm:ss')
                }).returning({ mockId: mockinterview.mockid });

                console.log("Inserted id:", output);
    
                console.log("Inserted id:", output[0].mockId);

                if(output)
                {
                    setOpenDialog(false);
                    Router.push(`/dashboard/interview/${output[0].mockId}`);
                }
            }
        } catch (error) {
            console.error("Error fetching interview questions:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            
            // Show detailed error to help with debugging
            let errorMsg = "There was an error fetching interview questions. ";
            if (error.message?.includes("not found")) {
                errorMsg += "The Gemini API model is not available. Please verify your Google API key is valid and has access to the Generative AI API.";
            } else if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
                errorMsg += "API key is invalid or unauthorized.";
            } else if (error.message?.includes("403")) {
                errorMsg += "Access denied. Please enable the Generative AI API in your Google Cloud project.";
            } else {
                errorMsg += "Please try again. Check the browser console for details.";
            }
            
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    

  return (
    <div>
        <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
         onClick={() => setOpenDialog(true)}
        >
            <h2 className='text-lg text-center'>+ Add new</h2>
        </div>
        <div className='bg-slate-300'>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
            <DialogTitle className ="text-2xl">Tell us more about your Job interview</DialogTitle>
            <DialogDescription>
                Add details about your job position, description and years of experience.
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit}>
                 <div>
                    <h2>Add the details mentioned below</h2>
                    <div className='mt-7 my-3'>
                        <label>Job Title</label>
                        <Input placeholder="Ex.Full stack developer"  required 
                        onChange ={(event)=> setJobpost(event.target.value)}/>
                    </div>
                    <div className='my-3'>
                        <label>Job Description / Tech Stack</label>
                        <Textarea placeholder="Ex.React, Java etc." required 
                        onChange ={(event)=> setJobDescription(event.target.value)}/>
                    </div>
                    <div className='my-3'>
                        <label>Enter the Experience you have</label>
                        <Input placeholder="5" max="50" type="number" required 
                        onChange ={(event)=> setExperience(event.target.value)}/>
                    </div>
                 </div>
                <div className='flex gap-5 justify-end'>
                    <Button type="button" variant="ghost" onClick={()=>setOpenDialog(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading} className='bg-blue-700'>
                        {loading ? 
                        <><LoaderCircle className='animate-spin mr-2'/> Generating from AI...</> : 'Start Interview'}
                    </Button>
                </div>
            </form>
        </DialogContent>
        </Dialog>
        </div>

    </div>
  )
}

export default AddNewInterview;