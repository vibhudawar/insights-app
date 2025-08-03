import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl font-bold">
            Insights
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
        <div className="navbar-end">
          <Link href="/auth/signin" className="btn btn-ghost">
            Login
          </Link>
          <Link href="/auth/signup" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-blue-50 to-indigo-100 min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Collect Feedback That
              <span className="text-blue-600"> Matters</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Build features your users actually want. Create beautiful feature request boards,
              gather feedback, and prioritize based on real user demand.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card bg-white shadow-sm">
                <div className="card-body items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="card-title text-lg">Easy Setup</h3>
                  <p className="text-sm text-gray-600">Create your feedback board in minutes with our intuitive interface</p>
                </div>
              </div>

              <div className="card bg-white shadow-sm">
                <div className="card-body items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <h3 className="card-title text-lg">User Voting</h3>
                  <p className="text-sm text-gray-600">Let users vote on features to help you prioritize development</p>
                </div>
              </div>

              <div className="card bg-white shadow-sm">
                <div className="card-body items-center text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
                    </svg>
                  </div>
                  <h3 className="card-title text-lg">Custom Branding</h3>
                  <p className="text-sm text-gray-600">Match your brand with custom themes and styling options</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Create Your First Board
              </Link>
              <Link href="#demo" className="btn btn-outline btn-lg">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to collect feedback
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to gather, organize, and act on user feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Public Feedback Boards
              </h3>
              <p className="text-gray-600 mb-6">
                Create beautiful, public-facing boards where your users can submit feature requests,
                vote on existing ones, and engage in discussions about what matters most.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Anonymous or authenticated submissions
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time voting and comments
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom branding and themes
                </li>
              </ul>
            </div>
            <div className="lg:order-first">
              <div className="mockup-browser bg-base-300 border">
                <div className="mockup-browser-toolbar">
                  <div className="input">https://feedback.yoursite.com</div>
                </div>
                <div className="bg-base-200 flex justify-center px-4 py-16">
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">Feature Request Board Demo</div>
                    <div className="text-sm opacity-70">Interactive mockup coming soon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center bg-base-200 text-base-content p-10">
        <aside>
          <div className="font-bold text-xl mb-2">Insights</div>
          <p>Collect feedback that matters.</p>
          <p>Copyright © 2024 - All rights reserved</p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a className="link link-hover">About</a>
            <a className="link link-hover">Contact</a>
            <a className="link link-hover">Privacy</a>
            <a className="link link-hover">Terms</a>
          </div>
        </nav>
      </footer>
    </div>
  );
}
