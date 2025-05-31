import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user, signOut } = useAuth()

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-docdot-heading">
            Welcome to Docdot
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button 
              onClick={signOut}
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-xl font-semibold mb-4">
            Your Medical Education Platform
          </h2>
          <p className="text-gray-600">
            Welcome to your dashboard. Your application is now loading correctly!
          </p>
        </div>
      </div>
    </div>
  )
}