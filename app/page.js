import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { AtomIcon, ReceiptText, Focus, CheckCircle2, ChevronRight, PlayCircle, Menu, X, ArrowRight, Star, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">I</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-gray-900">IPSUM</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#portfolio" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Portfolio</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">How it Works</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 font-semibold px-5">Sign In</Button>
              </Link>
              <Link href="/auth-signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 shadow-md shadow-blue-200 transition-transform hover:scale-105">
                  Sign Up Free
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4 opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-8 border border-blue-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            Next-Gen AI Interview Coaching
          </div>
          
          <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Ace your next interview with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Confidence & Clarity
            </span>
          </h1>
          
          <p className="mb-10 text-lg md:text-xl font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Practice with our highly realistic AI interviewer. Get instant feedback on your technical answers, body language, and ATS resume score.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/auth-signup">
              <Button className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">
                Start Practicing Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hover:-translate-y-1">
                <PlayCircle className="mr-2 w-5 h-5 text-blue-600" /> Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-[2rem] transform -rotate-3 z-0"></div>
              <div className="relative z-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <Shield className="w-8 h-8 text-blue-600 mb-4" />
                    <h4 className="font-bold text-gray-900 text-lg">Safe Space</h4>
                    <p className="text-gray-500 text-sm mt-1">Make your mistakes here, not in the real interview.</p>
                  </div>
                  <div className="bg-cyan-50 p-6 rounded-xl translate-y-4">
                    <Zap className="w-8 h-8 text-cyan-600 mb-4" />
                    <h4 className="font-bold text-gray-900 text-lg">Real-time</h4>
                    <p className="text-gray-500 text-sm mt-1">Instant behavioral and technical feedback.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-3">About IPSUM</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">Your personal career accelerator.</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We built IPSUM because traditional interview preparation is broken. Reading lists of questions doesn't prepare you for the pressure of speaking to a real person.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Our advanced AI simulates real interview environments, tracking everything from the keywords you use to your posture and eye contact, giving you a competitive edge.
              </p>
              <Link href="/auth-signup">
                <span className="flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors cursor-pointer group">
                  Learn more about our technology 
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio / Features Section */}
      <section id="portfolio" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-3">Our Features</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">Everything you need to succeed</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "ATS Resume Checker",
                desc: "Upload your PDF resume and instantly see how well you match the job description. Optimize your keywords.",
                icon: <ReceiptText className="w-6 h-6 text-white" />
              },
              {
                title: "Behavioral Analytics",
                desc: "Our camera tracks your eye contact, posture, and facial expressions to ensure confident body language.",
                icon: <Focus className="w-6 h-6 text-white" />
              },
              {
                title: "Comprehensive Reports",
                desc: "Download beautifully formatted PDF reports outlining your strengths and areas for improvement.",
                icon: <CheckCircle2 className="w-6 h-6 text-white" />
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-3">Simple Process</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How IPSUM Works</h3>
            <p className="text-lg text-gray-500">Three simple steps to transform your interview performance.</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white border-4 border-blue-600 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-6 shadow-lg shadow-blue-100">1</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Build Profile</h4>
                <p className="text-gray-500 px-4">Input your target job description and upload your CV for context.</p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white border-4 border-blue-600 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-6 shadow-lg shadow-blue-100">2</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Mock Interview</h4>
                <p className="text-gray-500 px-4">Answer dynamic AI-generated questions via your webcam and mic.</p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white border-4 border-blue-600 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-6 shadow-lg shadow-blue-100">3</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Review Feedback</h4>
                <p className="text-gray-500 px-4">Get actionable insights on your technical accuracy and body language.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Platform CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to crack your dream job?</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have upgraded their careers using IPSUM's intelligent coaching platform.
          </p>
          <Link href="/auth-signup">
            <Button className="h-14 px-10 text-lg rounded-full bg-white text-blue-700 hover:bg-gray-50 shadow-xl transition-all hover:-translate-y-1 font-bold">
              Join the Platform Today
            </Button>
          </Link>
          <p className="mt-6 text-blue-200 text-sm">Free to join. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl leading-none">I</span>
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-white">IPSUM</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Empowering candidates worldwide to interview with confidence and secure top-tier opportunities.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ATS Checker</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} IPSUM AI Interview Coach. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span>Made with logic and design.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}