import { Users, Heart, Coins, Wrench, BookOpen, Home } from "lucide-react";
import qrCode from "@/assets/flyer-qr-code.jpg";

const Flyer = () => {
  const benefits = [
    { icon: Coins, text: "Save Money" },
    { icon: Users, text: "Make Friends" },
    { icon: Heart, text: "Help Neighbours" },
  ];

  const examples = [
    { icon: Wrench, skill: "DIY & Repairs" },
    { icon: BookOpen, skill: "Tutoring" },
    { icon: Home, skill: "Gardening" },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 print:p-0">
      {/* A4 Flyer Container */}
      <div className="w-full max-w-[210mm] bg-white shadow-2xl print:shadow-none overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#006B3E] to-[#009A5C] text-white py-6 px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            SWAP SKILLS
          </h1>
          <p className="text-lg md:text-xl mt-1 opacity-90 font-medium">
            Ireland's Free Skill Exchange Platform
          </p>
        </div>

        {/* Main Content */}
        <div className="px-6 md:px-10 py-8">
          {/* Tagline */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#006B3E] mb-2">
              Exchange Skills, Not Cash!
            </h2>
            <p className="text-gray-600 text-lg max-w-lg mx-auto">
              Join your local community and trade skills with neighbours. 
              No money needed – just your talents!
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Benefits & Examples */}
            <div className="space-y-6">
              {/* Key Benefits */}
              <div className="bg-[#F8FAF9] rounded-2xl p-6 border-2 border-[#006B3E]/10">
                <h3 className="text-xl font-bold text-[#006B3E] mb-4 text-center">
                  Why Join?
                </h3>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF7900] flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {benefit.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example Skills */}
              <div className="bg-[#FFF7F0] rounded-2xl p-6 border-2 border-[#FF7900]/20">
                <h3 className="text-xl font-bold text-[#FF7900] mb-4 text-center">
                  Swap Skills Like...
                </h3>
                <div className="flex justify-around">
                  {examples.map((example, index) => (
                    <div key={index} className="text-center">
                      <div className="w-14 h-14 rounded-full bg-[#006B3E] flex items-center justify-center mx-auto mb-2">
                        <example.icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {example.skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it Works - Simple */}
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#006B3E] text-white font-bold text-sm">1</span>
                  <span>Sign Up Free</span>
                  <span className="mx-2">→</span>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FF7900] text-white font-bold text-sm">2</span>
                  <span>Post Skills</span>
                  <span className="mx-2">→</span>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#006B3E] text-white font-bold text-sm">3</span>
                  <span>Connect!</span>
                </div>
              </div>
            </div>

            {/* Right Column - QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-[#006B3E]">
                <img 
                  src={qrCode} 
                  alt="Scan to join Swap Skills" 
                  className="w-64 h-auto md:w-72"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-[#006B3E]">
                  Scan & Join Today!
                </p>
                <p className="text-gray-500 mt-1">
                  swapskills.ie
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#006B3E] text-white py-4 px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <div>
              <p className="font-semibold text-lg">
                🇮🇪 Made for Irish Communities
              </p>
            </div>
            <div className="text-sm opacity-90">
              <p>100% Free • No Hidden Fees • Safe & Local</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flyer;
