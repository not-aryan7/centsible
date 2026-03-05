import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA] to-[#E8F0F2]">
      <nav className="flex justify-between items-center px-10 py-5 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold tracking-tight text-[#028090]" style={{textDecoration:"none"}}>Centsible</Link>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-[#028090] transition-colors" style={{textDecoration:"none"}}>
          Back to Home
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold mb-4">About Centsible</h2>
        <p className="text-gray-500 leading-relaxed mb-8">
          Centsible is a budgeting web app built for students who want to take control of their
          finances. We make it easy to track spending, set savings goals, and build better money
          habits — all with a gamified experience that keeps you motivated.
        </p>

        <h3 className="text-xl font-bold mb-4">Our Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-[#028090]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-[#028090] font-bold">A</span>
            </div>
            <p className="font-bold">Aryan</p>
            <p className="text-gray-400 text-sm">Frontend & Setup</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-[#028090]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-[#028090] font-bold">D</span>
            </div>
            <p className="font-bold">Dipekshya</p>
            <p className="text-gray-400 text-sm">Routing & Auth</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-[#028090]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-[#028090] font-bold">K</span>
            </div>
            <p className="font-bold">Krish</p>
            <p className="text-gray-400 text-sm">UI Components</p>
          </div>
        </div>
      </div>
    </div>
  );
}