import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../output.css'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full opacity-30 blur-xl"></div>
          </div>
          <h1 
            className={`text-9xl font-extrabold text-gray-100 tracking-widest ${mounted ? 'animate-bounce' : ''}`}
            style={{ animationDuration: '2s' }}
          >
            404
          </h1>
        </div>
        <div className="mt-4">
          <h2 className="text-3xl font-bold text-gray-100 sm:text-4xl">Page not found</h2>
          <p className="mt-3 text-base text-gray-400 sm:mt-5 sm:text-lg">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => {navigate('/'); console.log('Go back home')}}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-gray-900 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors duration-300 z-90 cursor-pointer"
          >
            Go back home
          </button>
        </div>
      </div>
      <svg
        className="absolute bottom-0 left-0 right-0 text-gray-800  "
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2000 250"
      >
        <path
          fill="currentColor"
          fillOpacity="1"
          d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </div>
  )
}