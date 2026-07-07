import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TrustedBy from '../components/TrustedBy'
import WhyShikshaHub from '../components/WhyShikshaHub'
import AITutor from '../components/AITutor'
import HowItWorks from '../components/HowItWorks'
import ExamGenerator from '../components/ExamGenerator'
import AssignmentEval from '../components/AssignmentEval'
import Dashboard from '../components/Dashboard'
import StudentFeatures from '../components/StudentFeatures'
import TeacherFeatures from '../components/TeacherFeatures'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="bg-cream">
      <Navbar />
      <Hero />
      <TrustedBy />
      <WhyShikshaHub />
      <AITutor />
      <HowItWorks />
      <ExamGenerator />
      <AssignmentEval />
      <Dashboard />
      <StudentFeatures />
      <TeacherFeatures />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}