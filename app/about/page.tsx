export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Shopmart</h1>
          <p className="text-xl text-gray-600">
            Revolutionizing online shopping with AI-powered assistance and immersive experiences
          </p>
        </div>

        <div className="prose prose-lg mx-auto">
          <p className="text-lg text-gray-700 mb-8">
            Shopmart is at the forefront of e-commerce innovation, combining artificial intelligence, augmented reality,
            and intuitive design to create the most advanced shopping platform available today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms provide personalized recommendations and intelligent assistance.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🥽</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AR Experience</h3>
              <p className="text-gray-600">
                Visualize products in your own space with cutting-edge augmented reality technology.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
              <p className="text-gray-600">
                Enterprise-grade security with lightning-fast performance and reliable delivery.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            We believe shopping should be intuitive, personalized, and enjoyable. Our mission is to eliminate the
            friction between desire and purchase by leveraging the latest technologies to understand what you want
            before you even know it yourself.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Innovation at Every Step</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Voice-activated shopping with natural language processing</li>
            <li>Image recognition for visual product search</li>
            <li>3D product visualization with AR try-on capabilities</li>
            <li>Predictive analytics for personalized recommendations</li>
            <li>Real-time inventory management and smart logistics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
