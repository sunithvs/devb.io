import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Not Found</h2>
            <p className="text-gray-600 mb-8">Could not find requested resource</p>
            <Link
                href="/"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
                Return Home
            </Link>
        </div>
    )
}
