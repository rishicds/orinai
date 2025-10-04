import Link from "next/link";
import { HomeShell } from "@/components/home/HomeShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getUser } from "@/lib/appwrite/auth";
import { logoutUser } from "./(auth)/actions";
import { 
  FaRocket, 
  FaWaveSquare, 
  FaBrain, 
  FaSearch, 
  FaFileAlt, 
  FaShieldAlt, 
  FaPuzzlePiece, 
  FaBolt, 
  FaLock, 
  FaChartBar, 
  FaClock, 
  FaRoute,
  FaGraduationCap,
  FaChartLine,
  FaUsers,
  FaCode,
  FaTimes,
  FaCheck,
  FaDatabase,
  FaDesktop,
  FaRobot,
  FaHandPointer,
  FaPlayCircle,
  FaBookOpen
} from "react-icons/fa";
import { MdScience } from "react-icons/md";

export default async function Home() {
  const user = await getUser();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EFFE2B 0%, #C5CBE3 50%, #4056A1 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#F13C20' }}></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full opacity-15 animate-bounce" style={{ backgroundColor: '#D79922' }}></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 rounded-full opacity-25 animate-ping" style={{ backgroundColor: '#F13C20' }}></div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-6 py-8 lg:py-12">
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(45deg, #F13C20, #D79922)' }}>
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-white drop-shadow-lg">
                Orin.ai
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Where Data Meets
              <span className="flex items-center justify-start gap-3 text-slate-800 animate-pulse" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}>
                Pure Magic <MdScience className="text-3xl lg:text-4xl" />
              </span>
            </h1>
            <p className="text-slate-800 font-semibold text-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
              Stop boring spreadsheets. Start visual storytelling.
            </p>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1">
              <ThemeToggle />
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/chat"
                  className="px-6 py-3 font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
                  style={{ 
                    background: 'linear-gradient(135deg, #4056A1 0%, #C5CBE3 100%)',
                    boxShadow: '0 8px 32px rgba(64, 86, 161, 0.3)'
                  }}
                >
                  Go to Chat 💬
                </Link>
                <div className="text-white/90 font-semibold px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  Hey there, {user.name?.split(' ')[0] || user.email?.split("@")[0] || "Superstar"} 👋
                </div>
                <form action={logoutUser}>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Peace Out ✌️
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 transition-all duration-300 hover:bg-white/30 hover:scale-105 hover:shadow-xl"
                >
                  Welcome Back
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
                  style={{ 
                    background: 'linear-gradient(135deg, #F13C20 0%, #D79922 100%)',
                    boxShadow: '0 8px 32px rgba(241, 60, 32, 0.3)'
                  }}
                >
                  <FaRocket className="inline mr-2" /> Join the Revolution
                </Link>
              </div>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <div className="text-center space-y-8 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight mb-6" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}>
              <FaHandPointer className="inline text-4xl lg:text-6xl mr-4" /> From Raw Text to 
              <br />
              <span className="text-slate-800 animate-pulse" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
                Living Dashboards
              </span>
            </h2>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Insights That Build Themselves
            </h3>
            <p className="text-xl lg:text-2xl text-slate-800 font-semibold leading-relaxed max-w-4xl mx-auto mb-12" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
              Turn messy prompts into dynamic, interactive dashboards. No rigid templates, no wasted time — 
              just clear, structured insights that adapt to your query.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href={user ? "/chat" : "/register"}
                className="px-8 py-4 font-bold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform text-lg flex items-center gap-3"
                style={{ 
                  background: 'linear-gradient(135deg, #F13C20 0%, #D79922 100%)',
                  boxShadow: '0 12px 40px rgba(241, 60, 32, 0.4)'
                }}
              >
                <FaPlayCircle className="text-xl" /> {user ? "Start Chatting" : "Try the Demo"}
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/30 transition-all duration-300 hover:bg-white/30 hover:scale-105 hover:shadow-xl text-lg flex items-center gap-3"
              >
                <FaBookOpen className="text-xl" /> Explore Features
              </Link>
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl">
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              "Data is everywhere, but dashboards are rigid."
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FaTimes className="text-red-600 text-2xl mt-1 flex-shrink-0" />
                  <p className="text-slate-800 text-lg font-medium">Traditional dashboards require manual setup</p>
                </div>
                <div className="flex items-start gap-4">
                  <FaTimes className="text-red-600 text-2xl mt-1 flex-shrink-0" />
                  <p className="text-slate-800 text-lg font-medium">Queries return static or pre-designed templates</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FaTimes className="text-red-600 text-2xl mt-1 flex-shrink-0" />
                  <p className="text-slate-800 text-lg font-medium">Users can't easily go from raw ideas → visual answers</p>
                </div>
                <div className="flex items-start gap-4">
                  <FaTimes className="text-red-600 text-2xl mt-1 flex-shrink-0" />
                  <p className="text-slate-800 text-lg font-medium">This slows down decision-making and leaves insights trapped in text</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="py-16">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              "Dynamic dashboards powered by a 
              <span className="text-slate-800" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}>
                multi-agent AI system
              </span>"
            </h3>
            <p className="text-xl text-slate-800 mb-12 max-w-4xl mx-auto leading-relaxed font-semibold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
              We built a system where AI agents collaborate like a team to transform natural language queries 
              into modular, interactive dashboards — automatically.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <FaCheck className="text-green-600 text-3xl mb-4" />
                <h4 className="text-slate-900 font-bold text-lg mb-2">No rigid templates</h4>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <FaCheck className="text-green-600 text-3xl mb-4" />
                <h4 className="text-slate-900 font-bold text-lg mb-2">Smart visualization choice</h4>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <FaCheck className="text-green-600 text-3xl mb-4" />
                <h4 className="text-slate-900 font-bold text-lg mb-2">Reliable, validated outputs</h4>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <FaCheck className="text-green-600 text-3xl mb-4" />
                <h4 className="text-slate-900 font-bold text-lg mb-2">Scalable architecture</h4>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16" id="features">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 text-center mb-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              How It Works
            </h3>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <FaBrain className="text-6xl mb-6 text-purple-600" />
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Classifier Agent</h4>
                <p className="text-slate-800 text-lg leading-relaxed font-medium">
                  Understands your query and picks the right visualization type automatically.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <FaSearch className="text-6xl mb-6 text-blue-600" />
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Retriever Agent</h4>
                <p className="text-slate-800 text-lg leading-relaxed font-medium">
                  Fetches context from memory (Pinecone) or external sources intelligently.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <FaFileAlt className="text-6xl mb-6 text-green-600" />
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Summarizer Agent</h4>
                <p className="text-slate-800 text-lg leading-relaxed font-medium">
                  Converts results into structured JSON dashboards with interactive sublinks.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <FaShieldAlt className="text-6xl mb-6 text-orange-600" />
                <h4 className="text-2xl font-bold text-slate-900 mb-4">UI Schema Validator</h4>
                <p className="text-slate-800 text-lg leading-relaxed font-medium">
                  Ensures everything works perfectly on the frontend with validation.
                </p>
              </div>
            </div>
            
            <div className="text-center bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <p className="text-xl text-slate-900 font-bold flex items-center justify-center gap-3" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
                <FaHandPointer className="text-2xl" /> All coordinated by a <span className="text-slate-800">Multi-Agent Orchestrator</span> for reliability, performance, and monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 text-center mb-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Key Features
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <FaPuzzlePiece className="text-4xl mb-4 text-indigo-600" />
                <h4 className="text-xl font-bold text-slate-900 mb-3">Modular Architecture</h4>
                <p className="text-slate-800 font-medium">Agents with single responsibility, easy to extend</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <FaBolt className="text-4xl mb-4 text-yellow-600" />
                <h4 className="text-xl font-bold text-slate-900 mb-3">Dynamic Dashboards</h4>
                <p className="text-slate-800 font-medium">Flexible, query-driven, no fixed templates</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <FaLock className="text-4xl mb-4 text-red-600" />
                <h4 className="text-xl font-bold text-slate-900 mb-3">Quality Assurance</h4>
                <p className="text-slate-800 font-medium">Auto-correction and validation ensure safe rendering</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <FaChartBar className="text-4xl mb-4 text-green-600" />
                <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Visualization</h4>
                <p className="text-slate-800 font-medium">Matches data with the right charts/tables automatically</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <FaClock className="text-4xl mb-4 text-purple-600" />
                <h4 className="text-xl font-bold text-slate-900 mb-3">Performance Monitoring</h4>
                <p className="text-slate-800 font-medium">Optimized execution with real-time tracking</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <FaRoute className="text-4xl mb-4 text-blue-600" />
                <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Data Routing</h4>
                <p className="text-slate-800 font-medium">Chooses between memory and external APIs seamlessly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="py-16">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 text-center mb-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Use Cases
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <h4 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <FaGraduationCap className="text-blue-600" /> Students & Researchers
                </h4>
                <p className="text-slate-800 text-lg font-medium">Quickly turn queries into structured study dashboards</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <h4 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <FaChartLine className="text-green-600" /> Business Analysts
                </h4>
                <p className="text-slate-800 text-lg font-medium">Ask questions, get instant charts and tables</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <h4 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <FaRocket className="text-purple-600" /> Hackathon Teams
                </h4>
                <p className="text-slate-800 text-lg font-medium">Build prototypes with instant AI-generated dashboards</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                <h4 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <FaCode className="text-orange-600" /> Developers
                </h4>
                <p className="text-slate-800 text-lg font-medium">Plug into existing pipelines for flexible UI generation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why It's Different */}
        <div className="py-16">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 text-center mb-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Why It's Different
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-500/20 backdrop-blur-sm rounded-3xl p-8 border border-red-300/30 shadow-xl">
                <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  ❌ Old Way
                </h4>
                <ul className="space-y-3 text-slate-800 text-lg font-medium">
                  <li>• Fixed dashboards</li>
                  <li>• Rigid templates</li>
                  <li>• Manual effort</li>
                </ul>
              </div>
              
              <div className="bg-green-500/20 backdrop-blur-sm rounded-3xl p-8 border border-green-300/30 shadow-xl">
                <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  ✅ Our Way
                </h4>
                <ul className="space-y-3 text-slate-800 text-lg font-medium">
                  <li>• Adaptive dashboards</li>
                  <li>• Dynamic JSON</li>
                  <li>• Modular AI orchestration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-16" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Tech Behind the Scenes
            </h3>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl">
              <p className="text-2xl font-bold text-slate-900 mb-8">Built with:</p>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="flex items-center gap-4">
                  <FaBolt className="text-3xl text-yellow-500" />
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg">LangChain</h4>
                    <p className="text-slate-800 font-medium">Agent orchestration</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <FaDatabase className="text-3xl text-green-600" />
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg">Pinecone</h4>
                    <p className="text-slate-800 font-medium">Memory retrieval</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <FaCode className="text-3xl text-blue-600" />
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg">Next.js/React</h4>
                    <p className="text-slate-800 font-medium">Frontend dashboards</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <FaBrain className="text-3xl text-purple-600" />
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg">Multi-Agent AI</h4>
                    <p className="text-slate-800 font-medium">Modular pipeline system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Statement */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl">
              <blockquote className="text-2xl lg:text-3xl font-bold text-slate-900 leading-relaxed italic" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
                "This system doesn't just answer questions — it builds the UI around your thinking. 
                It's like having a personal analyst who designs dashboards on the fly."
              </blockquote>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-16">
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl">
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 flex items-center justify-center gap-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              <FaHandPointer className="text-[#F13C20]" /> Ready to turn your queries into living dashboards?
            </h3>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <Link
                href={user ? "/chat" : "/register"}
                className="px-10 py-5 font-bold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform text-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #F13C20 0%, #D79922 100%)',
                  boxShadow: '0 15px 50px rgba(241, 60, 32, 0.4)'
                }}
              >
                <FaRocket className="inline mr-2" /> {user ? "Start Chatting" : "Try the Demo"}
              </Link>
              <Link
                href="#features"
                className="px-10 py-5 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/30 transition-all duration-300 hover:bg-white/30 hover:scale-105 hover:shadow-xl text-xl"
              >
                <FaFileAlt className="inline mr-2" /> Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
