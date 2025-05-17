import AnimatedNav from "@/components/animated-nav/server";
import Footer from "@/components/footer";

export const metadata = {
  title: "devb.io Blog",
  description: "Learn more about devb.io and how it helps you build a portfolio",
};

export default function BlogPage() {
  const features = [
    "One-click GitHub Profile Connection",
    "Automatic Portfolio Generation",
    "AI-Powered Bio Creation",
    "Dynamic Activity Tracking",
    "Zero Maintenance Required",
  ];

  const steps = [
    {
      title: "Generate Profile",
      description:
        "Click the \"Generate Profile\" button and make sure your GitHub profile is updated with projects and achievements.",
    },
    {
      title: "Instant Portfolio Generation",
      description:
        "Your personalized developer portfolio is created instantly with no manual setup.",
    },
    {
      title: "Automatic Weekly Updates",
      description:
        "Your portfolio refreshes every week based on your GitHub activity to showcase new work.",
    },
    {
      title: "Support and Share",
      description:
        "Star the repository, upvote on Product Hunt, and share your portfolio with the world.",
    },
  ];

  return (
    <>
      <AnimatedNav />
      <main className="min-h-screen px-10 pt-20 md:px-24 md:pt-32 pb-10">
        <h1 className="text-4xl font-bold mb-6">devb.io Blog</h1>
        <p className="mb-8 text-lg text-gray-700 max-w-2xl">
          devb.io automatically generates polished developer portfolios by connecting to your GitHub account. Below is a quick overview of the main features and how the platform works.
        </p>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside space-y-2">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-4">
            {steps.map((step) => (
              <li key={step.title}>
                <p className="font-medium">{step.title}</p>
                <p className="text-gray-700">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
